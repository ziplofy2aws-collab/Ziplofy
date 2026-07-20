import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AmountOffOrderDiscount } from '../models/discount/amount-off-order-discount-model/amount-off-order-discount.model';
import { AmountOffOrderCustomerSegmentEntry } from '../models/discount/amount-off-order-discount-model/amount-off-order-customer-segment-entry.model';
import { AmountOffOrderCustomerEntry } from '../models/discount/amount-off-order-discount-model/amount-off-order-customer-entry.model';
import { AmountOffOrderDiscountUsage } from '../models/discount/amount-off-order-discount-model/amount-off-order-discount-usage.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

export const createAmountOffOrderDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,

    method,
    discountCode,
    title,

    valueType,
    percentage,
    fixedAmount,

    eligibility,
    applyOnPOSPro,

    minimumPurchase,
    minimumAmount,
    minimumQuantity,

    productDiscounts,
    orderDiscounts,
    shippingDiscounts,

    allowDiscountOnChannels,
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,

    startDate,
    startTime,
    setEndDate,
    endDate,
    endTime,

    status = 'active',

    // eligibility targets
    targetCustomerSegmentIds = [],
    targetCustomerIds = [],
  } = req.body as Record<string, any>;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const discount = await AmountOffOrderDiscount.create({
    storeId,
    method,
    ...(method === 'discount-code' && { discountCode }),
    ...(method === 'automatic' && { title }),
    valueType,
    ...(valueType === 'percentage' && { percentage }),
    ...(valueType === 'fixed-amount' && { fixedAmount }),
    eligibility,
    applyOnPOSPro,
    minimumPurchase,
    minimumAmount,
    minimumQuantity,
    productDiscounts,
    orderDiscounts,
    shippingDiscounts,
    allowDiscountOnChannels,
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,
    startDate,
    startTime,
    setEndDate,
    endDate,
    endTime,
    status,
  });

  if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
    await AmountOffOrderCustomerSegmentEntry.insertMany(
      targetCustomerSegmentIds.map((sid: string) => ({ storeId, discountId: discount._id, customerSegmentId: sid }))
    );
  }
  if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
    await AmountOffOrderCustomerEntry.insertMany(
      targetCustomerIds.map((cid: string) => ({ storeId, discountId: discount._id, customerId: cid }))
    );
  }

  res.status(201).json({ success: true, message: 'Amount off order discount created successfully', data: discount });
});

export const getAmountOffOrderDiscountsByStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id: storeId } = req.params as { id: string };
  const { page = 1, limit = 10, status, method } = req.query as Record<string, any>;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter: any = { storeId };
  if (status) filter.status = status;
  if (method) filter.method = method;

  const [discounts, total] = await Promise.all([
    AmountOffOrderDiscount.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    AmountOffOrderDiscount.countDocuments(filter),
  ]);

  const discountIds = discounts.map(d => d._id);

  const [segmentEntries, customerEntries] = await Promise.all([
    AmountOffOrderCustomerSegmentEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerSegmentId', 'name').lean(),
    AmountOffOrderCustomerEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerId', 'firstName lastName email').lean(),
  ]);

  const segmentsBy: Record<string, any[]> = segmentEntries.reduce((m, e) => { (m[String(e.discountId)] ||= []).push(e); return m; }, {} as Record<string, any[]>);
  const customersBy: Record<string, any[]> = customerEntries.reduce((m, e) => { (m[String(e.discountId)] ||= []).push(e); return m; }, {} as Record<string, any[]>);

  const data = discounts.map(d => {
    const targetCustomerSegmentIds = (segmentsBy[String(d._id)] || []).map((e: any) => e.customerSegmentId);
    const targetCustomerIds = (customersBy[String(d._id)] || []).map((e: any) => e.customerId);
    return {
      ...d,
      targetCustomerSegmentIds,
      targetCustomerIds,
    };
  });

  res.status(200).json({
    success: true,
    data,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
    },
  });
});

export const getAmountOffOrderDiscountById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await AmountOffOrderDiscount.findById(id).lean();
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const storeId = (discount as any).storeId.toString();

  const [segmentEntries, customerEntries] = await Promise.all([
    AmountOffOrderCustomerSegmentEntry.find({ storeId, discountId: id }).populate('customerSegmentId', 'name').lean(),
    AmountOffOrderCustomerEntry.find({ storeId, discountId: id }).populate('customerId', 'firstName lastName email').lean(),
  ]);

  const targetCustomerSegmentIds = segmentEntries.map((e: any) => e.customerSegmentId);
  const targetCustomerIds = customerEntries.map((e: any) => e.customerId);

  res.status(200).json({
    success: true,
    data: {
      ...discount,
      targetCustomerSegmentIds,
      targetCustomerIds,
    },
  });
});

export const updateAmountOffOrderDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await AmountOffOrderDiscount.findById(id);
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const {
    method,
    discountCode,
    title,
    valueType,
    percentage,
    fixedAmount,
    eligibility,
    applyOnPOSPro,
    minimumPurchase,
    minimumAmount,
    minimumQuantity,
    productDiscounts,
    orderDiscounts,
    shippingDiscounts,
    allowDiscountOnChannels,
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,
    startDate,
    startTime,
    setEndDate,
    endDate,
    endTime,
    status = 'active',
    targetCustomerSegmentIds = [],
    targetCustomerIds = [],
  } = req.body as Record<string, any>;

  const storeId = discount.storeId.toString();

  discount.method = method ?? discount.method;
  if (method === 'discount-code') discount.discountCode = discountCode ?? discount.discountCode;
  if (method === 'automatic') discount.title = title ?? discount.title;
  discount.valueType = valueType ?? discount.valueType;
  if (valueType === 'percentage') discount.percentage = percentage ?? discount.percentage;
  if (valueType === 'fixed-amount') discount.fixedAmount = fixedAmount ?? discount.fixedAmount;
  discount.eligibility = eligibility ?? discount.eligibility;
  discount.applyOnPOSPro = applyOnPOSPro ?? discount.applyOnPOSPro;
  discount.minimumPurchase = minimumPurchase ?? discount.minimumPurchase;
  discount.minimumAmount = minimumAmount ?? discount.minimumAmount;
  discount.minimumQuantity = minimumQuantity ?? discount.minimumQuantity;
  discount.productDiscounts = productDiscounts ?? discount.productDiscounts;
  discount.orderDiscounts = orderDiscounts ?? discount.orderDiscounts;
  discount.shippingDiscounts = shippingDiscounts ?? discount.shippingDiscounts;
  discount.allowDiscountOnChannels = allowDiscountOnChannels ?? discount.allowDiscountOnChannels;
  discount.limitTotalUses = limitTotalUses ?? discount.limitTotalUses;
  discount.totalUsesLimit = totalUsesLimit ?? discount.totalUsesLimit;
  discount.limitOneUsePerCustomer = limitOneUsePerCustomer ?? discount.limitOneUsePerCustomer;
  discount.startDate = startDate ?? discount.startDate;
  discount.startTime = startTime ?? discount.startTime;
  discount.setEndDate = setEndDate ?? discount.setEndDate;
  discount.endDate = endDate ?? discount.endDate;
  discount.endTime = endTime ?? discount.endTime;
  discount.status = status ?? discount.status;

  await discount.save();

  await Promise.all([
    AmountOffOrderCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
    AmountOffOrderCustomerEntry.deleteMany({ storeId, discountId: id }),
  ]);

  if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
    await AmountOffOrderCustomerSegmentEntry.insertMany(
      targetCustomerSegmentIds.map((sid: string) => ({ storeId, discountId: id, customerSegmentId: sid }))
    );
  }
  if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
    await AmountOffOrderCustomerEntry.insertMany(
      targetCustomerIds.map((cid: string) => ({ storeId, discountId: id, customerId: cid }))
    );
  }

  const updated = await AmountOffOrderDiscount.findById(id).lean();
  res.status(200).json({ success: true, message: 'Amount off order discount updated successfully', data: updated });
});

export const deleteAmountOffOrderDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await AmountOffOrderDiscount.findById(id);
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const storeId = discount.storeId.toString();

  await Promise.all([
    AmountOffOrderCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
    AmountOffOrderCustomerEntry.deleteMany({ storeId, discountId: id }),
    AmountOffOrderDiscountUsage.deleteMany({ storeId, discountId: id }),
  ]);
  await AmountOffOrderDiscount.findByIdAndDelete(id);

  res.status(200).json({ success: true, message: 'Amount off order discount deleted successfully' });
});

/**
 * Get orders where this amount-off-order discount was used.
 * Uses the AmountOffOrderDiscountUsage model and populates customer and order.
 */
export const getOrdersByAmountOffOrderDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id: discountId } = req.params as { id: string };
  const { page = 1, limit = 20 } = req.query as { page?: string | number; limit?: string | number };

  if (!discountId || !mongoose.isValidObjectId(discountId)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await AmountOffOrderDiscount.findById(discountId).lean();
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [usages, total] = await Promise.all([
    AmountOffOrderDiscountUsage.find({ discountId })
      .sort({ usedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({ path: 'customerId', select: 'firstName lastName email phoneNumber' })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'shippingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
          { path: 'customerId', select: 'firstName lastName email' },
        ],
      })
      .lean(),
    AmountOffOrderDiscountUsage.countDocuments({ discountId }),
  ]);

  const data = usages
    .filter((u: any) => u.orderId)
    .map((u: any) => ({
      usage: { usedAt: u.usedAt },
      customer: u.customerId
        ? {
            _id: u.customerId._id,
            firstName: u.customerId.firstName,
            lastName: u.customerId.lastName,
            email: u.customerId.email,
            phoneNumber: u.customerId.phoneNumber,
          }
        : null,
      order: u.orderId
        ? {
            _id: u.orderId._id,
            orderDate: u.orderId.orderDate,
            status: u.orderId.status,
            subtotal: u.orderId.subtotal,
            shippingCost: u.orderId.shippingCost,
            total: u.orderId.total,
            shippingAddress: u.orderId.shippingAddressId,
          }
        : null,
    }));

  res.status(200).json({
    success: true,
    data,
    discount: {
      _id: discount._id,
      title: (discount as any).title,
      discountCode: (discount as any).discountCode,
      method: (discount as any).method,
    },
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
    },
  });
});
