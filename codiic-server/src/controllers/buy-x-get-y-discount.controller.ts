import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BuyXGetYDiscount } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model';
import { BuyXGetYBuysProductEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-product-entry.model';
import { BuyXGetYBuysCollectionEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-collection-entry.model';
import { BuyXGetYGetsProductEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-product-entry.model';
import { BuyXGetYGetsCollectionEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-collection-entry.model';
import { BuyXGetYCustomerSegmentEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-segment-entry.model';
import { BuyXGetYCustomerEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-entry.model';
import { BuyXGetYDiscountUsage } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount-usage.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { Order } from '../models';

export const createBuyXGetYDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    // Store
    storeId,

    // Method
    method,
    discountCode,
    title,

    // Sales channel
    allowDiscountOnChannels,

    // Customer buys
    customerBuys,
    quantity,
    amount,
    anyItemsFrom,

    // Customer gets
    customerGetsQuantity,
    customerGetsAnyItemsFrom,
    discountedValue,
    discountedAmount,
    discountedPercentage,

    setMaxUsersPerOrder,
    maxUsersPerOrder,

    // Eligibility
    eligibility,
    applyOnPOSPro,

    // Limits
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,

    // Combinations
    productDiscounts,
    orderDiscounts,
    shippingDiscounts,

    // Dates
    startDate,
    startTime,
    setEndDate,
    endDate,
    endTime,

    status = 'active',

    // Targets
    buysProductIds = [],
    buysCollectionIds = [],
    getsProductIds = [],
    getsCollectionIds = [],
    targetCustomerSegmentIds = [],
    targetCustomerIds = [],
  } = req.body as Record<string, any>;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  // Create main discount
  const discount = await BuyXGetYDiscount.create({
    storeId,
    method,
    ...(method === 'discount-code' && { discountCode }),
    ...(method === 'automatic' && { title }),
    allowDiscountOnChannels,
    customerBuys,
    ...(customerBuys === 'minimum-quantity' && { quantity }),
    ...(customerBuys === 'minimum-amount' && { amount }),
    anyItemsFrom,
    customerGetsQuantity,
    customerGetsAnyItemsFrom,
    discountedValue,
    ...(discountedValue === 'amount' && { discountedAmount }),
    ...(discountedValue === 'percentage' && { discountedPercentage }),
    setMaxUsersPerOrder,
    maxUsersPerOrder,
    eligibility,
    applyOnPOSPro,
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,
    productDiscounts,
    orderDiscounts,
    shippingDiscounts,
    startDate,
    startTime,
    setEndDate,
    endDate,
    endTime,
    status,
  });

  // Create buys entries based on anyItemsFrom selection
  if (anyItemsFrom === 'specific-products' && Array.isArray(buysProductIds) && buysProductIds.length > 0) {
    await BuyXGetYBuysProductEntry.insertMany(
      buysProductIds.map((pid: string) => ({ storeId, discountId: discount._id, productId: pid }))
    );
  } else if (anyItemsFrom === 'specific-collections' && Array.isArray(buysCollectionIds) && buysCollectionIds.length > 0) {
    await BuyXGetYBuysCollectionEntry.insertMany(
      buysCollectionIds.map((cid: string) => ({ storeId, discountId: discount._id, collectionId: cid }))
    );
  }

  // Create gets entries based on customerGetsAnyItemsFrom selection
  if (customerGetsAnyItemsFrom === 'specific-products' && Array.isArray(getsProductIds) && getsProductIds.length > 0) {
    await BuyXGetYGetsProductEntry.insertMany(
      getsProductIds.map((pid: string) => ({
        storeId,
        discountId: discount._id,
        productId: pid,
        discountedValue,
        ...(discountedValue === 'amount' && { discountedAmount }),
        ...(discountedValue === 'percentage' && { discountedPercentage }),
        setMaxUsesPerOrder: setMaxUsersPerOrder,
        ...(setMaxUsersPerOrder && { maxUsesPerOrder: maxUsersPerOrder }),
      }))
    );
  } else if (customerGetsAnyItemsFrom === 'specific-collections' && Array.isArray(getsCollectionIds) && getsCollectionIds.length > 0) {
    await BuyXGetYGetsCollectionEntry.insertMany(
      getsCollectionIds.map((cid: string) => ({
        storeId,
        discountId: discount._id,
        collectionId: cid,
        discountedValue,
        ...(discountedValue === 'amount' && { discountedAmount }),
        ...(discountedValue === 'percentage' && { discountedPercentage }),
        setMaxUsesPerOrder: setMaxUsersPerOrder,
        ...(setMaxUsersPerOrder && { maxUsesPerOrder: maxUsersPerOrder }),
      }))
    );
  }

  // Create eligibility entries based on eligibility selection
  if (eligibility === 'specific-customer-segments' && Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
    await BuyXGetYCustomerSegmentEntry.insertMany(
      targetCustomerSegmentIds.map((sid: string) => ({ storeId, discountId: discount._id, customerSegmentId: sid }))
    );
  } else if (eligibility === 'specific-customers' && Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
    await BuyXGetYCustomerEntry.insertMany(
      targetCustomerIds.map((cid: string) => ({ storeId, discountId: discount._id, customerId: cid }))
    );
  }
  // Note: If eligibility === 'all-customers', no eligibility entries are created

  res.status(201).json({ success: true, message: 'Buy X Get Y discount created successfully', data: discount });
});

export const getBuyXGetYDiscountsByStore = asyncErrorHandler(async (req: Request, res: Response) => {
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
    BuyXGetYDiscount.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    BuyXGetYDiscount.countDocuments(filter),
  ]);

  const discountIds = discounts.map(d => d._id);

  const [buysProductEntries, buysCollectionEntries, getsProductEntries, getsCollectionEntries, customerSegmentEntries, customerEntries] = await Promise.all([
    BuyXGetYBuysProductEntry.find({ storeId, discountId: { $in: discountIds } })
      .populate('productId', 'title sku imageUrls')
      .lean(),
    BuyXGetYBuysCollectionEntry.find({ storeId, discountId: { $in: discountIds } })
      .populate('collectionId', 'title description')
      .lean(),
    BuyXGetYGetsProductEntry.find({ storeId, discountId: { $in: discountIds } })
      .populate('productId', 'title sku imageUrls')
      .lean(),
    BuyXGetYGetsCollectionEntry.find({ storeId, discountId: { $in: discountIds } })
      .populate('collectionId', 'title description')
      .lean(),
    BuyXGetYCustomerSegmentEntry.find({ storeId, discountId: { $in: discountIds } })
      .populate('customerSegmentId', 'name')
      .lean(),
    BuyXGetYCustomerEntry.find({ storeId, discountId: { $in: discountIds } })
      .populate('customerId', 'firstName lastName email')
      .lean(),
  ]);

  const byDiscount = (arr: any[]) => arr.reduce((m, e) => { (m[e.discountId as any] ||= []).push(e); return m; }, {} as Record<string, any[]>);
  const buysProductsBy = byDiscount(buysProductEntries);
  const buysCollectionsBy = byDiscount(buysCollectionEntries);
  const getsProductsBy = byDiscount(getsProductEntries);
  const getsCollectionsBy = byDiscount(getsCollectionEntries);
  const segmentsBy = byDiscount(customerSegmentEntries);
  const customersBy = byDiscount(customerEntries);

  const data = discounts.map(d => {
    const bid = String(d._id);

    const buysProductIds = (buysProductsBy[bid] || []).map((e: any) => e.productId);
    const buysCollectionIds = (buysCollectionsBy[bid] || []).map((e: any) => e.collectionId);
    const getsProductIds = (getsProductsBy[bid] || []).map((e: any) => e.productId);
    const getsCollectionIds = (getsCollectionsBy[bid] || []).map((e: any) => e.collectionId);
    const targetCustomerSegmentIds = (segmentsBy[bid] || []).map((e: any) => e.customerSegmentId);
    const targetCustomerIds = (customersBy[bid] || []).map((e: any) => e.customerId);

    return {
      ...d,
      buysProductIds,
      buysCollectionIds,
      getsProductIds,
      getsCollectionIds,
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

export const getBuyXGetYDiscountById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await BuyXGetYDiscount.findById(id).lean();
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const storeId = (discount as any).storeId.toString();

  const [buysProductEntries, buysCollectionEntries, getsProductEntries, getsCollectionEntries, customerSegmentEntries, customerEntries] = await Promise.all([
    BuyXGetYBuysProductEntry.find({ storeId, discountId: id })
      .populate('productId', 'title sku imageUrls')
      .lean(),
    BuyXGetYBuysCollectionEntry.find({ storeId, discountId: id })
      .populate('collectionId', 'title description')
      .lean(),
    BuyXGetYGetsProductEntry.find({ storeId, discountId: id })
      .populate('productId', 'title sku imageUrls')
      .lean(),
    BuyXGetYGetsCollectionEntry.find({ storeId, discountId: id })
      .populate('collectionId', 'title description')
      .lean(),
    BuyXGetYCustomerSegmentEntry.find({ storeId, discountId: id })
      .populate('customerSegmentId', 'name')
      .lean(),
    BuyXGetYCustomerEntry.find({ storeId, discountId: id })
      .populate('customerId', 'firstName lastName email')
      .lean(),
  ]);

  const buysProductIds = buysProductEntries.map((e: any) => e.productId);
  const buysCollectionIds = buysCollectionEntries.map((e: any) => e.collectionId);
  const getsProductIds = getsProductEntries.map((e: any) => e.productId);
  const getsCollectionIds = getsCollectionEntries.map((e: any) => e.collectionId);
  const targetCustomerSegmentIds = customerSegmentEntries.map((e: any) => e.customerSegmentId);
  const targetCustomerIds = customerEntries.map((e: any) => e.customerId);

  res.status(200).json({
    success: true,
    data: {
      ...discount,
      buysProductIds,
      buysCollectionIds,
      getsProductIds,
      getsCollectionIds,
      targetCustomerSegmentIds,
      targetCustomerIds,
    },
  });
});

export const updateBuyXGetYDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await BuyXGetYDiscount.findById(id);
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const {
    method,
    discountCode,
    title,
    allowDiscountOnChannels,
    customerBuys,
    quantity,
    amount,
    anyItemsFrom,
    customerGetsQuantity,
    customerGetsAnyItemsFrom,
    discountedValue,
    discountedAmount,
    discountedPercentage,
    setMaxUsersPerOrder,
    maxUsersPerOrder,
    eligibility,
    applyOnPOSPro,
    limitTotalUses,
    totalUsesLimit,
    limitOneUsePerCustomer,
    productDiscounts,
    orderDiscounts,
    shippingDiscounts,
    startDate,
    startTime,
    setEndDate,
    endDate,
    endTime,
    status,
    buysProductIds = [],
    buysCollectionIds = [],
    getsProductIds = [],
    getsCollectionIds = [],
    targetCustomerSegmentIds = [],
    targetCustomerIds = [],
  } = req.body as Record<string, any>;

  const storeId = discount.storeId.toString();

  // Update main discount fields
  if (method !== undefined) discount.method = method;
  if (method === 'discount-code' && discountCode !== undefined) discount.discountCode = discountCode;
  if (method === 'automatic' && title !== undefined) discount.title = title;
  if (allowDiscountOnChannels !== undefined) discount.allowDiscountOnChannels = allowDiscountOnChannels;
  if (customerBuys !== undefined) discount.customerBuys = customerBuys;
  if (customerBuys === 'minimum-quantity' && quantity !== undefined) discount.quantity = quantity;
  if (customerBuys === 'minimum-amount' && amount !== undefined) discount.amount = amount;
  if (anyItemsFrom !== undefined) discount.anyItemsFrom = anyItemsFrom;
  if (customerGetsQuantity !== undefined) discount.customerGetsQuantity = customerGetsQuantity;
  if (customerGetsAnyItemsFrom !== undefined) discount.customerGetsAnyItemsFrom = customerGetsAnyItemsFrom;
  if (discountedValue !== undefined) discount.discountedValue = discountedValue;
  if (discountedValue === 'amount' && discountedAmount !== undefined) discount.discountedAmount = discountedAmount;
  if (discountedValue === 'percentage' && discountedPercentage !== undefined) discount.discountedPercentage = discountedPercentage;
  if (setMaxUsersPerOrder !== undefined) discount.setMaxUsersPerOrder = setMaxUsersPerOrder;
  if (maxUsersPerOrder !== undefined) discount.maxUsersPerOrder = maxUsersPerOrder;
  if (eligibility !== undefined) discount.eligibility = eligibility;
  if (applyOnPOSPro !== undefined) discount.applyOnPOSPro = applyOnPOSPro;
  if (limitTotalUses !== undefined) discount.limitTotalUses = limitTotalUses;
  if (totalUsesLimit !== undefined) discount.totalUsesLimit = totalUsesLimit;
  if (limitOneUsePerCustomer !== undefined) discount.limitOneUsePerCustomer = limitOneUsePerCustomer;
  if (productDiscounts !== undefined) discount.productDiscounts = productDiscounts;
  if (orderDiscounts !== undefined) discount.orderDiscounts = orderDiscounts;
  if (shippingDiscounts !== undefined) discount.shippingDiscounts = shippingDiscounts;
  if (startDate !== undefined) discount.startDate = startDate;
  if (startTime !== undefined) discount.startTime = startTime;
  if (setEndDate !== undefined) discount.setEndDate = setEndDate;
  if (endDate !== undefined) discount.endDate = endDate;
  if (endTime !== undefined) discount.endTime = endTime;
  if (status !== undefined) discount.status = status;

  await discount.save();

  // Get final discount values for gets entries
  const finalDiscountedValue = discount.discountedValue;
  const finalDiscountedAmount = discount.discountedAmount;
  const finalDiscountedPercentage = discount.discountedPercentage;
  const finalSetMaxUsesPerOrder = discount.setMaxUsersPerOrder;
  const finalMaxUsesPerOrder = discount.maxUsersPerOrder;

  // Delete all existing entries
  await Promise.all([
    BuyXGetYBuysProductEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYBuysCollectionEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYGetsProductEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYGetsCollectionEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYCustomerEntry.deleteMany({ storeId, discountId: id }),
  ]);

  // Get final values for conditional entry creation
  const finalAnyItemsFrom = discount.anyItemsFrom;
  const finalCustomerGetsAnyItemsFrom = discount.customerGetsAnyItemsFrom;
  const finalEligibility = discount.eligibility;

  // Re-create buys entries based on anyItemsFrom selection
  if (finalAnyItemsFrom === 'specific-products' && Array.isArray(buysProductIds) && buysProductIds.length > 0) {
    await BuyXGetYBuysProductEntry.insertMany(
      buysProductIds.map((pid: string) => ({ storeId, discountId: id, productId: pid }))
    );
  } else if (finalAnyItemsFrom === 'specific-collections' && Array.isArray(buysCollectionIds) && buysCollectionIds.length > 0) {
    await BuyXGetYBuysCollectionEntry.insertMany(
      buysCollectionIds.map((cid: string) => ({ storeId, discountId: id, collectionId: cid }))
    );
  }

  // Re-create gets entries based on customerGetsAnyItemsFrom selection
  if (finalCustomerGetsAnyItemsFrom === 'specific-products' && Array.isArray(getsProductIds) && getsProductIds.length > 0) {
    await BuyXGetYGetsProductEntry.insertMany(
      getsProductIds.map((pid: string) => ({
        storeId,
        discountId: id,
        productId: pid,
        discountedValue: finalDiscountedValue,
        ...(finalDiscountedValue === 'amount' && { discountedAmount: finalDiscountedAmount }),
        ...(finalDiscountedValue === 'percentage' && { discountedPercentage: finalDiscountedPercentage }),
        setMaxUsesPerOrder: finalSetMaxUsesPerOrder,
        ...(finalSetMaxUsesPerOrder && { maxUsesPerOrder: finalMaxUsesPerOrder }),
      }))
    );
  } else if (finalCustomerGetsAnyItemsFrom === 'specific-collections' && Array.isArray(getsCollectionIds) && getsCollectionIds.length > 0) {
    await BuyXGetYGetsCollectionEntry.insertMany(
      getsCollectionIds.map((cid: string) => ({
        storeId,
        discountId: id,
        collectionId: cid,
        discountedValue: finalDiscountedValue,
        ...(finalDiscountedValue === 'amount' && { discountedAmount: finalDiscountedAmount }),
        ...(finalDiscountedValue === 'percentage' && { discountedPercentage: finalDiscountedPercentage }),
        setMaxUsesPerOrder: finalSetMaxUsesPerOrder,
        ...(finalSetMaxUsesPerOrder && { maxUsesPerOrder: finalMaxUsesPerOrder }),
      }))
    );
  }

  // Re-create eligibility entries based on eligibility selection
  if (finalEligibility === 'specific-customer-segments' && Array.isArray(targetCustomerSegmentIds) && targetCustomerSegmentIds.length > 0) {
    await BuyXGetYCustomerSegmentEntry.insertMany(
      targetCustomerSegmentIds.map((sid: string) => ({ storeId, discountId: id, customerSegmentId: sid }))
    );
  } else if (finalEligibility === 'specific-customers' && Array.isArray(targetCustomerIds) && targetCustomerIds.length > 0) {
    await BuyXGetYCustomerEntry.insertMany(
      targetCustomerIds.map((cid: string) => ({ storeId, discountId: id, customerId: cid }))
    );
  }
  // Note: If eligibility === 'all-customers', no eligibility entries are created

  const updated = await BuyXGetYDiscount.findById(id).lean();
  res.status(200).json({ success: true, message: 'Buy X Get Y discount updated successfully', data: updated });
});

export const deleteBuyXGetYDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await BuyXGetYDiscount.findById(id);
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const storeId = discount.storeId.toString();

  // Delete all related entries including usage records
  await Promise.all([
    BuyXGetYBuysProductEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYBuysCollectionEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYGetsProductEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYGetsCollectionEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYCustomerSegmentEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYCustomerEntry.deleteMany({ storeId, discountId: id }),
    BuyXGetYDiscountUsage.deleteMany({ storeId, discountId: id }),
  ]);

  await BuyXGetYDiscount.findByIdAndDelete(id);

  res.status(200).json({ success: true, message: 'Buy X Get Y discount deleted successfully' });
});

/**
 * Get orders where this Buy X Get Y discount was used.
 * Uses the BuyXGetYDiscountUsage model and populates customer and order.
 */
export const getOrdersByBuyXGetYDiscount = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id: discountId } = req.params as { id: string };
  const { page = 1, limit = 20 } = req.query as { page?: string | number; limit?: string | number };

  if (!discountId || !mongoose.isValidObjectId(discountId)) {
    throw new CustomError('Valid discount ID is required', 400);
  }

  const discount = await BuyXGetYDiscount.findById(discountId).lean();
  if (!discount) {
    throw new CustomError('Discount not found', 404);
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [usages, total] = await Promise.all([
    BuyXGetYDiscountUsage.find({ discountId })
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
    BuyXGetYDiscountUsage.countDocuments({ discountId }),
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
