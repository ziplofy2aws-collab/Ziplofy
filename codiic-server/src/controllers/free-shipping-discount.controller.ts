import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { FreeShippingDiscount } from '../models/discount/free-shipping-discount-model/free-shipping-discount.model';
import { FreeShippingCountryEntry } from '../models/discount/free-shipping-discount-model/free-shipping-country-entry.model';
import { FreeShippingCustomerSegmentEntry } from '../models/discount/free-shipping-discount-model/free-shipping-customer-segment-entry.model';
import { FreeShippingCustomerEntry } from '../models/discount/free-shipping-discount-model/free-shipping-customer-entry.model';
import { FreeShippingDiscountUsage } from '../models/discount/free-shipping-discount-model/free-shipping-discount-usage.model';

export const createFreeShippingDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,

    // Method
    method,
    discountCode,
    title,

    // Country
    countrySelection,
    selectedCountryIds = [],
    excludeShippingRates,
    shippingRateLimit,

    // Eligibility
    eligibility,
    applyOnPOSPro,

    // Minimum purchase
    minimumPurchase,
    minimumAmount,
    minimumQuantity,

    // Sales channel (discount-code only)
    allowDiscountOnChannels,

    // Limits (discount-code only)
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,

    // Combinations
    productDiscounts,
    orderDiscounts,

    // Active dates
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

  const discount = await FreeShippingDiscount.create({
    storeId,
    method,
    ...(method === 'discount-code' && { discountCode }),
    ...(method === 'automatic' && { title }),

    countrySelection,
    excludeShippingRates,
    shippingRateLimit,

    eligibility,
    applyOnPOSPro,

    minimumPurchase,
    minimumAmount,
    minimumQuantity,

    allowDiscountOnChannels,
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,

    productDiscounts,
    orderDiscounts,

    startDate,
    startTime,
    setEndDate,
    endDate,
    endTime,

    status,
  });

  if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
    const validSegmentIds = targetCustomerSegmentIds.filter((sid: string) => mongoose.isValidObjectId(sid));
    if (validSegmentIds.length > 0) {
      await FreeShippingCustomerSegmentEntry.insertMany(
        validSegmentIds.map((sid: string) => ({ storeId, discountId: discount._id, customerSegmentId: sid }))
      );
    }
  }
  if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
    const validCustomerIds = targetCustomerIds.filter((cid: string) => mongoose.isValidObjectId(cid));
    if (validCustomerIds.length > 0) {
      await FreeShippingCustomerEntry.insertMany(
        validCustomerIds.map((cid: string) => ({ storeId, discountId: discount._id, customerId: cid }))
      );
    }
  }

  if (countrySelection === 'selected-countries' && Array.isArray(selectedCountryIds) && selectedCountryIds.length > 0) {
    const validIds = selectedCountryIds.filter((cid: string) => mongoose.isValidObjectId(cid));
    if (validIds.length > 0) {
      await FreeShippingCountryEntry.insertMany(
        validIds.map((cid: string) => ({ storeId, discountId: discount._id, countryId: cid }))
      );
    }
  }

  const discountLean = await FreeShippingDiscount.findById(discount._id).lean();
  const countryEntries = await FreeShippingCountryEntry.find({ storeId, discountId: discount._id })
    .populate('countryId', 'name iso2')
    .lean();
  const selectedCountryIdsRes = countryEntries.map((e: any) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
  const selectedCountries = countryEntries.map((e: any) => e.countryId).filter(Boolean);

  res.status(201).json({
    success: true,
    message: 'Free shipping discount created successfully',
    data: { ...discountLean, selectedCountryIds: selectedCountryIdsRes, selectedCountries },
  });
});

export const getFreeShippingDiscountsByStore = asyncErrorHandler(async (req: Request, res: Response) => {
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
    FreeShippingDiscount.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    FreeShippingDiscount.countDocuments(filter),
  ]);

  const discountIds = discounts.map(d => d._id);

  const [segmentEntries, customerEntries, countryEntries] = await Promise.all([
    FreeShippingCustomerSegmentEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerSegmentId', 'name').lean(),
    FreeShippingCustomerEntry.find({ storeId, discountId: { $in: discountIds } }).populate('customerId', 'firstName lastName email').lean(),
    FreeShippingCountryEntry.find({ storeId, discountId: { $in: discountIds } }).populate('countryId', 'name iso2').lean(),
  ]);

  const segmentBy: Record<string, any[]> = segmentEntries.reduce((m, e) => { (m[String(e.discountId)] ||= []).push(e); return m; }, {} as Record<string, any[]>);
  const customerBy: Record<string, any[]> = customerEntries.reduce((m, e) => { (m[String(e.discountId)] ||= []).push(e); return m; }, {} as Record<string, any[]>);
  const countryBy: Record<string, any[]> = countryEntries.reduce((m, e) => { (m[String(e.discountId)] ||= []).push(e); return m; }, {} as Record<string, any[]>);

  const data = discounts.map(d => {
    const segmentList = segmentBy[String(d._id)] || [];
    const customerList = customerBy[String(d._id)] || [];
    const targetCustomerSegmentIds = segmentList.map((e: any) => e.customerSegmentId).filter(Boolean);
    const targetCustomerIds = customerList.map((e: any) => e.customerId).filter(Boolean);
    const countryList = countryBy[String(d._id)] || [];
    const selectedCountryIds = countryList.map((e: any) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
    const selectedCountries = countryList.map((e: any) => e.countryId).filter(Boolean);
    return {
      ...d,
      targetCustomerSegmentIds,
      targetCustomerIds,
      selectedCountryIds,
      selectedCountries,
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

export const getFreeShippingDiscountById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await FreeShippingDiscount.findById(id).lean();
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const storeId = (discount as any).storeId.toString();

  const [segmentEntries, customerEntries, countryEntries] = await Promise.all([
    FreeShippingCustomerSegmentEntry.find({ storeId, discountId: id }).populate('customerSegmentId', 'name').lean(),
    FreeShippingCustomerEntry.find({ storeId, discountId: id }).populate('customerId', 'firstName lastName email').lean(),
    FreeShippingCountryEntry.find({ storeId, discountId: id }).populate('countryId', 'name iso2').lean(),
  ]);

  const targetCustomerSegmentIds = segmentEntries.map((e: any) => e.customerSegmentId).filter(Boolean);
  const targetCustomerIds = customerEntries.map((e: any) => e.customerId).filter(Boolean);
  const selectedCountryIds = countryEntries.map((e: any) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
  const selectedCountries = countryEntries.map((e: any) => e.countryId).filter(Boolean);

  res.status(200).json({
    success: true,
    data: {
      ...discount,
      targetCustomerSegmentIds,
      targetCustomerIds,
      selectedCountryIds,
      selectedCountries,
    },
  });
});

export const updateFreeShippingDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await FreeShippingDiscount.findById(id);
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const {
    method,
    discountCode,
    title,
    countrySelection,
    selectedCountryIds = [],
    excludeShippingRates,
    shippingRateLimit,
    eligibility,
    applyOnPOSPro,
    minimumPurchase,
    minimumAmount,
    minimumQuantity,
    allowDiscountOnChannels,
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,
    productDiscounts,
    orderDiscounts,
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
  discount.countrySelection = countrySelection ?? discount.countrySelection;
  discount.excludeShippingRates = excludeShippingRates ?? discount.excludeShippingRates;
  discount.shippingRateLimit = shippingRateLimit ?? discount.shippingRateLimit;
  discount.eligibility = eligibility ?? discount.eligibility;
  discount.applyOnPOSPro = applyOnPOSPro ?? discount.applyOnPOSPro;
  discount.minimumPurchase = minimumPurchase ?? discount.minimumPurchase;
  discount.minimumAmount = minimumAmount ?? discount.minimumAmount;
  discount.minimumQuantity = minimumQuantity ?? discount.minimumQuantity;
  discount.allowDiscountOnChannels = allowDiscountOnChannels ?? discount.allowDiscountOnChannels;
  discount.limitTotalUses = limitTotalUses ?? discount.limitTotalUses;
  discount.totalUsesLimit = totalUsesLimit ?? discount.totalUsesLimit;
  discount.limitOneUsePerCustomer = limitOneUsePerCustomer ?? discount.limitOneUsePerCustomer;
  discount.productDiscounts = productDiscounts ?? discount.productDiscounts;
  discount.orderDiscounts = orderDiscounts ?? discount.orderDiscounts;
  discount.startDate = startDate ?? discount.startDate;
  discount.startTime = startTime ?? discount.startTime;
  discount.setEndDate = setEndDate ?? discount.setEndDate;
  discount.endDate = endDate ?? discount.endDate;
  discount.endTime = endTime ?? discount.endTime;
  discount.status = status ?? discount.status;

  await discount.save();

  if (eligibility !== undefined) {
    await FreeShippingCustomerSegmentEntry.deleteMany({ storeId, discountId: id });
    await FreeShippingCustomerEntry.deleteMany({ storeId, discountId: id });
    if (Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
      const validSegmentIds = targetCustomerSegmentIds.filter((sid: string) => mongoose.isValidObjectId(sid));
      if (validSegmentIds.length > 0) {
        await FreeShippingCustomerSegmentEntry.insertMany(
          validSegmentIds.map((sid: string) => ({ storeId, discountId: id, customerSegmentId: sid }))
        );
      }
    }
    if (Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
      const validCustomerIds = targetCustomerIds.filter((cid: string) => mongoose.isValidObjectId(cid));
      if (validCustomerIds.length > 0) {
        await FreeShippingCustomerEntry.insertMany(
          validCustomerIds.map((cid: string) => ({ storeId, discountId: id, customerId: cid }))
        );
      }
    }
  }

  if (countrySelection !== undefined) {
    await FreeShippingCountryEntry.deleteMany({ storeId, discountId: id });
    if (countrySelection === 'selected-countries' && Array.isArray(selectedCountryIds) && selectedCountryIds.length > 0) {
      const validIds = selectedCountryIds.filter((cid: string) => mongoose.isValidObjectId(cid));
      if (validIds.length > 0) {
        await FreeShippingCountryEntry.insertMany(
          validIds.map((cid: string) => ({ storeId, discountId: id, countryId: cid }))
        );
      }
    }
  }

  const updated = await FreeShippingDiscount.findById(id).lean();
  const countryEntries = await FreeShippingCountryEntry.find({ storeId, discountId: id })
    .populate('countryId', 'name iso2')
    .lean();
  const selectedCountryIdsRes = countryEntries.map((e: any) => (e.countryId?._id || e.countryId)?.toString()).filter(Boolean);
  const selectedCountries = countryEntries.map((e: any) => e.countryId).filter(Boolean);

  res.status(200).json({
    success: true,
    message: 'Free shipping discount updated successfully',
    data: { ...updated, selectedCountryIds: selectedCountryIdsRes, selectedCountries },
  });
});

export const deleteFreeShippingDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await FreeShippingDiscount.findById(id);
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const storeId = discount.storeId.toString();

  await FreeShippingCustomerSegmentEntry.deleteMany({ storeId, discountId: id });
  await FreeShippingCustomerEntry.deleteMany({ storeId, discountId: id });
  await FreeShippingCountryEntry.deleteMany({ storeId, discountId: id });
  await FreeShippingDiscount.findByIdAndDelete(id);

  res.status(200).json({ success: true, message: 'Free shipping discount deleted successfully' });
});

/**
 * Get orders where this free shipping discount was used.
 * Returns usage records with populated customer and order info.
 */
export const getOrdersByFreeShippingDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id: discountId } = req.params as { id: string };
  const { page = 1, limit = 20 } = req.query as { page?: string; limit?: string };

  if (!discountId || !mongoose.isValidObjectId(discountId)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await FreeShippingDiscount.findById(discountId).lean();
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [usages, total] = await Promise.all([
    FreeShippingDiscountUsage.find({ discountId: new Types.ObjectId(discountId) })
      .sort({ usedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'customerId',
        select: 'firstName lastName email phoneNumber',
      })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'shippingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
          { path: 'customerId', select: 'firstName lastName email' },
        ],
      })
      .lean(),
    FreeShippingDiscountUsage.countDocuments({ discountId: new Types.ObjectId(discountId) }),
  ]);

  const data = usages
    .filter((u: any) => u.orderId)
    .map((u: any) => ({
      usage: {
        usedAt: u.usedAt,
      },
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
