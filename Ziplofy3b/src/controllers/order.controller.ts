import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { Order, OrderItem } from '../models';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

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

  const orderWithItems = { ...order, items };

  res.status(200).json({
    success: true,
    data: orderWithItems,
  });
});

