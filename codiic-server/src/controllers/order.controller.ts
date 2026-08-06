import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { Order, OrderItem } from '../models';
import { Payment } from '../models/payment/payment.model';
import {
  buildPaymentVerificationAcknowledgementEmailHtml,
  getPaymentVerificationAcknowledgementEmailSubject,
} from '../templates/payment-verification-acknowledgement-email.template';
import { sendEmail } from '../utils/email.utils';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

const MANUAL_PAYMENT_METHODS = ['bank_transfer', 'upi_id'] as const;

async function findOrderPaymentConfirmation(orderId: string) {
  return Payment.findOne({ orderId })
    .select('utr referenceId verificationStatus verifiedAt createdAt')
    .sort({ createdAt: -1 })
    .lean();
}

export const getOrdersByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };

  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const orders = await Order.find({ storeId: new Types.ObjectId(storeId) })
    .populate([
      { path: 'storeId', select: 'storeName storeCode' },
      { path: 'customerId', select: '-password' },
      { path: 'shippingAddressId' },
      { path: 'billingAddressId' },
    ])
    .sort({ orderDate: -1 })
    .lean();

  // Fetch order items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await OrderItem.find({ orderId: order._id })
        .populate({
          path: 'productVariantId',
          select: 'sku optionValues images productId',
          populate: { path: 'productId', select: 'title imageUrls' },
        })
        .lean();

      return {
        ...order,
        items,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: ordersWithItems,
    count: ordersWithItems.length,
  });
});

export const getOrderById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError('Valid order ID is required', 400);
  }

  const order = await Order.findById(id)
    .populate([
      { path: 'storeId', select: 'storeName storeCode' },
      { path: 'customerId', select: '-password' },
      { path: 'shippingAddressId' },
      { path: 'billingAddressId' },
    ])
    .lean();

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  const items = await OrderItem.find({ orderId: order._id })
    .populate({
      path: 'productVariantId',
      select: 'sku optionValues images productId',
      populate: { path: 'productId', select: 'title imageUrls' },
    })
    .lean();

  const paymentConfirmation = MANUAL_PAYMENT_METHODS.includes(
    order.paymentMethod as (typeof MANUAL_PAYMENT_METHODS)[number]
  )
    ? await findOrderPaymentConfirmation(order._id.toString())
    : null;
  const orderWithItems = { ...order, items, paymentConfirmation };

  res.status(200).json({
    success: true,
    data: orderWithItems,
  });
});

export const verifyOrderPayment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError('Valid order ID is required', 400);
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  if (!MANUAL_PAYMENT_METHODS.includes(
    order.paymentMethod as (typeof MANUAL_PAYMENT_METHODS)[number]
  )) {
    throw new CustomError('Only bank transfer and UPI ID payments require UTR verification', 400);
  }

  const payment = await Payment.findOne({ orderId: id }).sort({ createdAt: -1 });
  if (!payment) {
    throw new CustomError('The customer has not submitted a UTR for this order', 404);
  }

  const shouldSendAcknowledgement =
    order.paymentStatus !== 'paid' || payment.verificationStatus !== 'verified';

  order.paymentStatus = 'paid';
  await order.save();

  payment.verificationStatus = 'verified';
  payment.verifiedAt = new Date();
  await payment.save();

  const updatedOrder = await Order.findById(id)
    .populate([
      { path: 'storeId', select: 'storeName storeCode' },
      { path: 'customerId', select: '-password' },
      { path: 'shippingAddressId' },
      { path: 'billingAddressId' },
    ])
    .lean();
  const items = await OrderItem.find({ orderId: order._id })
    .populate({
      path: 'productVariantId',
      select: 'sku optionValues images productId',
      populate: { path: 'productId', select: 'title imageUrls' },
    })
    .lean();

  let acknowledgementEmailSent = false;
  if (shouldSendAcknowledgement && payment.email) {
    try {
      const orderNumber =
        (order as { displayOrderId?: string }).displayOrderId ||
        order._id.toString().slice(-4).toUpperCase();
      const storeName =
        typeof updatedOrder?.storeId === 'object' && 'storeName' in updatedOrder.storeId
          ? String(updatedOrder.storeId.storeName || 'Store')
          : 'Store';

      await sendEmail({
        to: payment.email,
        subject: getPaymentVerificationAcknowledgementEmailSubject(orderNumber),
        body: buildPaymentVerificationAcknowledgementEmailHtml({
          customerName: payment.name,
          storeName,
          orderNumber,
          amount: order.total,
          utr: payment.utr,
          paymentMethod: order.paymentMethod as 'bank_transfer' | 'upi_id',
        }),
      });
      acknowledgementEmailSent = true;
    } catch (emailError) {
      console.error('Failed to send payment verification acknowledgement email:', emailError);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      ...updatedOrder,
      items,
      paymentConfirmation: {
        _id: payment._id,
        utr: payment.utr,
        referenceId: payment.referenceId,
        verificationStatus: payment.verificationStatus,
        verifiedAt: payment.verifiedAt,
        createdAt: payment.createdAt,
      },
    },
    message: 'Payment verified',
    acknowledgementEmailSent,
  });
});

