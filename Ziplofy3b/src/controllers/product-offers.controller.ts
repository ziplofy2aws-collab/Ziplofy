import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import {
  Product,
  FreeShippingDiscount,
  FreeShippingCustomerSegmentEntry,
  FreeShippingCustomerEntry,
  CustomerSegmentEntry,
  AmountOffOrderDiscount,
  AmountOffOrderCustomerSegmentEntry,
  AmountOffOrderCustomerEntry,
  AmountOffProductsDiscount,
  AmountOffProductsEntry,
  AmountOffProductsCustomerSegmentEntry,
  AmountOffProductsCustomerEntry,
  CollectionEntry,
  Collections,
  BuyXGetYDiscount,
  BuyXGetYBuysProductEntry,
  BuyXGetYBuysCollectionEntry,
  BuyXGetYCustomerSegmentEntry,
  BuyXGetYCustomerEntry,
  BuyXGetYGetsProductEntry,
  BuyXGetYGetsCollectionEntry,
} from '../models';
import type { IFreeShippingDiscount } from '../models/discount/free-shipping-discount-model/free-shipping-discount.model';
import type { IAmountOffOrderDiscount } from '../models/discount/amount-off-order-discount-model/amount-off-order-discount.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Helper: check if a discount is currently within its active date range
function isWithinActiveDates(discount: { startDate?: string; startTime?: string; setEndDate?: boolean; endDate?: string; endTime?: string }): boolean {
  const now = new Date();

  if (discount.startDate) {
    const startStr = `${discount.startDate}T${discount.startTime || '00:00:00'}`;
    const start = new Date(startStr);
    if (Number.isNaN(start.getTime())) return false;
    if (now < start) return false;
  }

  if (discount.setEndDate && discount.endDate) {
    const endStr = `${discount.endDate}T${discount.endTime || '23:59:59.999'}`;
    const end = new Date(endStr);
    if (Number.isNaN(end.getTime())) return false;
    if (now > end) return false;
  }

  return true;
}

// GET /api/product-offers/free-shipping/product/:id
// Return free-shipping related offers for a given product (by its ID).
export const getFreeShippingOffersForProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { customerId } = req.query as { customerId?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid product ID is required', 400);
  }

  const product = await Product.findById(id).select('storeId price status').lean();
  if (!product) {
    throw new CustomError('Product not found', 404);
  }

  const storeId = (product as any).storeId;
  const customerObjectId = customerId && mongoose.isValidObjectId(customerId) ? new Types.ObjectId(customerId) : null;

  // Consider all active free-shipping discounts for this product's store as potential offers.
  // We will then filter them by active date and customer eligibility.
  const discountsRaw = await FreeShippingDiscount.find({
    storeId,
    status: 'active',
  }).lean();

  const now = new Date();

  const freeShippingOffers = [] as Array<{
    id: mongoose.Types.ObjectId;
    method: IFreeShippingDiscount['method'];
    title?: string;
    discountCode?: string;
    eligibility: IFreeShippingDiscount['eligibility'];
    minimumPurchase: IFreeShippingDiscount['minimumPurchase'];
    minimumAmount?: number;
    minimumQuantity?: number;
    minimumRequirementMessage: string | null;
    startDate?: string;
    startTime?: string;
    setEndDate?: boolean;
    endDate?: string;
    endTime?: string;
    hasEndDate: boolean;
    endsAt?: string;
    endsInMs?: number;
    endsInText?: string;
    combinations: {
      productDiscounts: boolean;
      orderDiscounts: boolean;
    };
  }>;

  for (const raw of discountsRaw as unknown as IFreeShippingDiscount[]) {
    // 1) Date window – skip if not yet started or already ended
    if (!isWithinActiveDates(raw)) continue;

    // 2) Customer eligibility
    let eligibleForCustomer = false;

    if (raw.eligibility === 'all-customers') {
      eligibleForCustomer = true;
    } else if (raw.eligibility === 'specific-customer-segments') {
      if (!customerObjectId) continue;

      const eligibleSegments = await FreeShippingCustomerSegmentEntry.find({
        storeId,
        discountId: raw._id,
      })
        .select('customerSegmentId')
        .lean();

      if (eligibleSegments.length > 0) {
        const customerSegmentEntries = await CustomerSegmentEntry.find({
          customerId: customerObjectId,
        })
          .select('segmentId')
          .lean();

        const customerSegmentIds = customerSegmentEntries.map((e: any) => e.segmentId?.toString()).filter(Boolean);
        const eligibleSegmentIds = eligibleSegments
          .map((e: any) => e.customerSegmentId?.toString())
          .filter(Boolean);

        const hasMatchingSegment = customerSegmentIds.some((cid) => eligibleSegmentIds.includes(cid));
        if (hasMatchingSegment) {
          eligibleForCustomer = true;
        }
      }
    } else if (raw.eligibility === 'specific-customers') {
      if (!customerObjectId) continue;

      const customerEntry = await FreeShippingCustomerEntry.findOne({
        storeId,
        discountId: raw._id,
        customerId: customerObjectId,
      }).lean();

      if (customerEntry) {
        eligibleForCustomer = true;
      }
    }

    if (!eligibleForCustomer) continue;

    // 3) Minimum purchase requirements – we always include the discount,
    // but provide a message if there is a threshold.
    let minimumRequirementMessage: string | null = null;
    if (raw.minimumPurchase === 'minimum-amount' && raw.minimumAmount != null) {
      minimumRequirementMessage = `Can apply on minimum order value of ₹${raw.minimumAmount}`;
    } else if (raw.minimumPurchase === 'minimum-quantity' && raw.minimumQuantity != null) {
      minimumRequirementMessage = `Can apply when you buy at least ${raw.minimumQuantity} item(s)`;
    }

    // 4) End date information – so UI can show \"ending in X\"
    let hasEndDate = false;
    let endsAtIso: string | undefined;
    let endsInMs: number | undefined;
    let endsInText: string | undefined;

    if (raw.setEndDate && raw.endDate) {
      const endStr = `${raw.endDate}T${raw.endTime || '23:59:59.999'}`;
      const end = new Date(endStr);
      if (!Number.isNaN(end.getTime()) && end.getTime() > now.getTime()) {
        hasEndDate = true;
        endsAtIso = end.toISOString();
        endsInMs = end.getTime() - now.getTime();

        const totalMinutes = Math.round(endsInMs / 60000);
        if (totalMinutes < 60) {
          endsInText = `Ends in ${totalMinutes} min`;
        } else {
          const totalHours = Math.round(totalMinutes / 60);
          if (totalHours < 24) {
            endsInText = `Ends in ${totalHours} hour(s)`;
          } else {
            const totalDays = Math.round(totalHours / 24);
            endsInText = `Ends in ${totalDays} day(s)`;
          }
        }
      }
    }

    freeShippingOffers.push({
      id: raw._id,
      method: raw.method,
      title: raw.title,
      discountCode: raw.discountCode,
      eligibility: raw.eligibility,
      minimumPurchase: raw.minimumPurchase,
      minimumAmount: raw.minimumAmount,
      minimumQuantity: raw.minimumQuantity,
      minimumRequirementMessage,
      startDate: raw.startDate,
      startTime: raw.startTime,
      setEndDate: raw.setEndDate,
      endDate: raw.endDate,
      endTime: raw.endTime,
      hasEndDate,
      endsAt: endsAtIso,
      endsInMs,
      endsInText,
      combinations: {
        productDiscounts: !!raw.productDiscounts,
        orderDiscounts: !!raw.orderDiscounts,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: `Found ${freeShippingOffers.length} free-shipping offer(s) for this product`,
    data: {
      productId: id,
      freeShippingOffers,
    },
  });
});

// ---------------------------------------------------------------------------
// Amount off order offers – placeholder endpoint (will be extended similar to free-shipping)
// GET /api/product-offers/amount-off-order/product/:id
// ---------------------------------------------------------------------------

export const getAmountOffOrderOffersForProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { customerId } = req.query as { customerId?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid product ID is required', 400);
  }

  const product = await Product.findById(id).select('storeId').lean();
  if (!product) {
    throw new CustomError('Product not found', 404);
  }

  const storeId = (product as any).storeId;
  const customerIdStr = customerId && mongoose.isValidObjectId(customerId) ? customerId : null;

  const discountsRaw = await AmountOffOrderDiscount.find({
    storeId,
    status: 'active',
  }).lean();

  const now = new Date();

  const amountOffOrderOffers: Array<{
    id: mongoose.Types.ObjectId;
    method: IAmountOffOrderDiscount['method'];
    discountCode?: string;
    title?: string;
    valueType: IAmountOffOrderDiscount['valueType'];
    percentage?: number;
    fixedAmount?: number;
    valueDescription: string;
    eligibility: IAmountOffOrderDiscount['eligibility'];
    minimumPurchase: IAmountOffOrderDiscount['minimumPurchase'];
    minimumAmount?: number;
    minimumQuantity?: number;
    minimumRequirementMessage: string | null;
    startDate?: string;
    startTime?: string;
    setEndDate?: boolean;
    endDate?: string;
    endTime?: string;
    hasEndDate: boolean;
    endsAt?: string;
    endsInMs?: number;
    endsInText?: string;
    combinations: {
      productDiscounts: boolean;
      orderDiscounts: boolean;
      shippingDiscounts: boolean;
    };
  }> = [];

  for (const raw of discountsRaw as unknown as IAmountOffOrderDiscount[]) {
    // 1) Date window – skip if not yet started or already ended
    if (!isWithinActiveDates(raw)) continue;

    // 2) Customer eligibility
    let eligibleForCustomer = false;

    if (raw.eligibility === 'all-customers') {
      eligibleForCustomer = true;
    } else if (raw.eligibility === 'specific-customers') {
      if (!customerIdStr) continue;

      const entry = await AmountOffOrderCustomerEntry.findOne({
        storeId,
        discountId: raw._id,
        customerId: customerIdStr,
      }).lean();

      if (entry) {
        eligibleForCustomer = true;
      }
    } else if (raw.eligibility === 'specific-customer-segments') {
      if (!customerIdStr) continue;

      const eligibleEntries = await AmountOffOrderCustomerSegmentEntry.find({
        storeId,
        discountId: raw._id,
      })
        .select('customerSegmentId')
        .lean();

      if (eligibleEntries.length > 0) {
        const eligibleSegmentIds = eligibleEntries
          .map((e: any) => e.customerSegmentId?.toString())
          .filter(Boolean) as string[];
        if (eligibleSegmentIds.length > 0) {
          const customerEntries = await CustomerSegmentEntry.find({ customerId: customerIdStr })
            .select('segmentId')
            .lean();
          const customerSegmentIds = customerEntries
            .map((e: any) => e.segmentId?.toString())
            .filter(Boolean);

          const hasMatchingSegment = customerSegmentIds.some((cid) => eligibleSegmentIds.includes(cid));
          if (hasMatchingSegment) {
            eligibleForCustomer = true;
          }
        }
      }
    }

    if (!eligibleForCustomer) continue;

    // 3) Minimum purchase requirements messaging
    let minimumRequirementMessage: string | null = null;
    if (raw.minimumPurchase === 'minimum-amount' && raw.minimumAmount != null) {
      minimumRequirementMessage = `Can apply on minimum order value of ₹${raw.minimumAmount}`;
    } else if (raw.minimumPurchase === 'minimum-quantity' && raw.minimumQuantity != null) {
      minimumRequirementMessage = `Can apply when you buy at least ${raw.minimumQuantity} item(s)`;
    }

    // 4) End date information – so UI can show \"ending in X\"
    let hasEndDate = false;
    let endsAtIso: string | undefined;
    let endsInMs: number | undefined;
    let endsInText: string | undefined;

    if (raw.setEndDate && raw.endDate) {
      const endStr = `${raw.endDate}T${raw.endTime || '23:59:59.999'}`;
      const end = new Date(endStr);
      if (!Number.isNaN(end.getTime()) && end.getTime() > now.getTime()) {
        hasEndDate = true;
        endsAtIso = end.toISOString();
        endsInMs = end.getTime() - now.getTime();

        const totalMinutes = Math.round(endsInMs / 60000);
        if (totalMinutes < 60) {
          endsInText = `Ends in ${totalMinutes} min`;
        } else {
          const totalHours = Math.round(totalMinutes / 60);
          if (totalHours < 24) {
            endsInText = `Ends in ${totalHours} hour(s)`;
          } else {
            const totalDays = Math.round(totalHours / 24);
            endsInText = `Ends in ${totalDays} day(s)`;
          }
        }
      }
    }

    // 5) Value description based on percentage or fixed-amount
    let valueDescription = 'Order discount';
    if (raw.valueType === 'percentage' && raw.percentage != null) {
      valueDescription = `Get ${raw.percentage}% off your order`;
    } else if (raw.valueType === 'fixed-amount' && raw.fixedAmount != null) {
      valueDescription = `Get ₹${raw.fixedAmount} off your order`;
    }

    amountOffOrderOffers.push({
      id: raw._id,
      method: raw.method,
      discountCode: raw.discountCode,
      title: raw.title,
      valueType: raw.valueType,
      percentage: raw.percentage,
      fixedAmount: raw.fixedAmount,
      valueDescription,
      eligibility: raw.eligibility,
      minimumPurchase: raw.minimumPurchase || 'no-requirements',
      minimumAmount: raw.minimumAmount,
      minimumQuantity: raw.minimumQuantity,
      minimumRequirementMessage,
      startDate: raw.startDate,
      startTime: raw.startTime,
      setEndDate: raw.setEndDate,
      endDate: raw.endDate,
      endTime: raw.endTime,
      hasEndDate,
      endsAt: endsAtIso,
      endsInMs,
      endsInText,
      combinations: {
        productDiscounts: !!raw.productDiscounts,
        orderDiscounts: !!raw.orderDiscounts,
        shippingDiscounts: !!raw.shippingDiscounts,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: `Found ${amountOffOrderOffers.length} amount-off-order offer(s) for this product`,
    data: {
      productId: id,
      amountOffOrderOffers,
    },
  });
});

export const getAmountOffProductsOffersForProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { customerId } = req.query as { customerId?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid product ID is required', 400);
  }

  const product = await Product.findById(id).select('_id storeId').lean();
  if (!product) {
    throw new CustomError('Product not found', 404);
  }

  const storeId = (product as any).storeId;
  const customerIdStr = customerId && mongoose.isValidObjectId(customerId) ? customerId : null;
  const productObjectId = new Types.ObjectId(id);

  // Collections that this product belongs to (for appliesTo: specific-collections)
  const collectionEntries = await CollectionEntry.find({ productId: productObjectId })
    .select('collectionId')
    .lean();
  const productCollectionIds = collectionEntries
    .map((e: any) => e.collectionId?.toString())
    .filter(Boolean) as string[];

  const discountsRaw = await AmountOffProductsDiscount.find({
    storeId,
    status: 'active',
  }).lean();

  const now = new Date();

  const amountOffProductsOffers: Array<{
    id: mongoose.Types.ObjectId;
    method: 'discount-code' | 'automatic';
    discountCode?: string;
    title?: string;
    valueType: 'percentage' | 'fixed-amount';
    percentage?: number;
    fixedAmount?: number;
    valueDescription: string;
    appliesTo: 'specific-products' | 'specific-collections';
    eligibility: 'all-customers' | 'specific-customer-segments' | 'specific-customers';
    minimumPurchase: 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
    minimumAmount?: number;
    minimumQuantity?: number;
    minimumRequirementMessage: string | null;
    startDate?: string;
    startTime?: string;
    setEndDate?: boolean;
    endDate?: string;
    endTime?: string;
    hasEndDate: boolean;
    endsAt?: string;
    endsInMs?: number;
    endsInText?: string;
    combinations: {
      productDiscounts: boolean;
      orderDiscounts: boolean;
      shippingDiscounts: boolean;
    };
  }> = [];

  for (const raw of discountsRaw as any as Array<import('../models/discount/amount-off-product-discount-model/amount-off-products-discount.model').IAmountOffProductsDiscount>) {
    // 1) Date window
    if (!isWithinActiveDates(raw)) continue;

    // 2) Targeting: does this discount apply to this product (directly or via its collections)?
    const entries = await AmountOffProductsEntry.find({
      storeId,
      discountId: (raw as any)._id,
    })
      .select('productId collectionId')
      .lean();

    let appliesToProduct = false;
    if (raw.appliesTo === 'specific-products') {
      appliesToProduct = entries.some((e: any) => e.productId && e.productId.toString() === id);
    } else if (raw.appliesTo === 'specific-collections' && productCollectionIds.length > 0) {
      const discountCollectionIds = entries
        .map((e: any) => e.collectionId?.toString())
        .filter(Boolean) as string[];
      appliesToProduct = discountCollectionIds.some((cid) => productCollectionIds.includes(cid));
    }
    if (!appliesToProduct) continue;

    // 3) Customer eligibility
    let eligibleForCustomer = false;
    if (raw.eligibility === 'all-customers') {
      eligibleForCustomer = true;
    } else if (raw.eligibility === 'specific-customers') {
      if (!customerIdStr) continue;

      const entry = await AmountOffProductsCustomerEntry.findOne({
        storeId,
        discountId: (raw as any)._id,
        customerId: customerIdStr,
      }).lean();
      if (entry) {
        eligibleForCustomer = true;
      }
    } else if (raw.eligibility === 'specific-customer-segments') {
      if (!customerIdStr) continue;

      const eligibleEntries = await AmountOffProductsCustomerSegmentEntry.find({
        storeId,
        discountId: (raw as any)._id,
      })
        .select('customerSegmentId')
        .lean();

      if (eligibleEntries.length > 0) {
        const eligibleSegmentIds = eligibleEntries
          .map((e: any) => e.customerSegmentId?.toString())
          .filter(Boolean) as string[];

        if (eligibleSegmentIds.length > 0) {
          const customerSegments = await CustomerSegmentEntry.find({ customerId: customerIdStr })
            .select('segmentId')
            .lean();
          const customerSegmentIds = customerSegments
            .map((e: any) => e.segmentId?.toString())
            .filter(Boolean);

          const hasOverlap = customerSegmentIds.some((sid) => eligibleSegmentIds.includes(sid));
          if (hasOverlap) {
            eligibleForCustomer = true;
          }
        }
      }
    }

    if (!eligibleForCustomer) continue;

    // 4) Minimum purchase messaging
    let minimumRequirementMessage: string | null = null;
    if (raw.minimumPurchase === 'minimum-amount' && raw.minimumAmount != null) {
      minimumRequirementMessage = `Can apply on minimum order value of ₹${raw.minimumAmount}`;
    } else if (raw.minimumPurchase === 'minimum-quantity' && raw.minimumQuantity != null) {
      minimumRequirementMessage = `Can apply when you buy at least ${raw.minimumQuantity} item(s)`;
    }

    // 5) End date / timer
    let hasEndDate = false;
    let endsAtIso: string | undefined;
    let endsInMs: number | undefined;
    let endsInText: string | undefined;

    if (raw.setEndDate && raw.endDate) {
      const endStr = `${raw.endDate}T${raw.endTime || '23:59:59.999'}`;
      const end = new Date(endStr);
      if (!Number.isNaN(end.getTime()) && end.getTime() > now.getTime()) {
        hasEndDate = true;
        endsAtIso = end.toISOString();
        endsInMs = end.getTime() - now.getTime();

        const totalMinutes = Math.round(endsInMs / 60000);
        if (totalMinutes < 60) {
          endsInText = `Ends in ${totalMinutes} min`;
        } else {
          const totalHours = Math.round(totalMinutes / 60);
          if (totalHours < 24) {
            endsInText = `Ends in ${totalHours} hour(s)`;
          } else {
            const totalDays = Math.round(totalHours / 24);
            endsInText = `Ends in ${totalDays} day(s)`;
          }
        }
      }
    }

    // 6) Value description
    let valueDescription = 'Product discount';
    if (raw.valueType === 'percentage' && raw.percentage != null) {
      valueDescription = `Get ${raw.percentage}% off selected products`;
    } else if (raw.valueType === 'fixed-amount' && raw.fixedAmount != null) {
      valueDescription = `Get ₹${raw.fixedAmount} off selected products`;
    }

    amountOffProductsOffers.push({
      id: (raw as any)._id,
      method: raw.method,
      discountCode: raw.discountCode,
      title: raw.title,
      valueType: raw.valueType,
      percentage: raw.percentage,
      fixedAmount: raw.fixedAmount,
      valueDescription,
      appliesTo: raw.appliesTo,
      eligibility: raw.eligibility,
      minimumPurchase: raw.minimumPurchase || 'no-requirements',
      minimumAmount: raw.minimumAmount,
      minimumQuantity: raw.minimumQuantity,
      minimumRequirementMessage,
      startDate: raw.startDate,
      startTime: raw.startTime,
      setEndDate: raw.setEndDate,
      endDate: raw.endDate,
      endTime: raw.endTime,
      hasEndDate,
      endsAt: endsAtIso,
      endsInMs,
      endsInText,
      combinations: {
        productDiscounts: !!raw.productDiscounts,
        orderDiscounts: !!raw.orderDiscounts,
        shippingDiscounts: !!raw.shippingDiscounts,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: `Found ${amountOffProductsOffers.length} amount-off-products offer(s) for this product`,
    data: {
      productId: id,
      amountOffProductsOffers,
    },
  });
});

export const getBuyXGetYOffersForProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { customerId } = req.query as { customerId?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid product ID is required', 400);
  }

  const product = await Product.findById(id).select('_id storeId').lean();
  if (!product) {
    throw new CustomError('Product not found', 404);
  }

  const storeId = (product as any).storeId;
  const productObjectId = new Types.ObjectId(id);
  const customerIdStr = customerId && mongoose.isValidObjectId(customerId) ? customerId : null;

  const discountsRaw = await BuyXGetYDiscount.find({
    storeId,
    status: 'active',
  }).lean();

  const discountIds = (discountsRaw as any[])
    .map((d) => (d as any)._id)
    .filter(Boolean) as mongoose.Types.ObjectId[];

  // All discounts where this product is explicitly in the "buys" products list
  const buysProductEntries = await BuyXGetYBuysProductEntry.find({
    storeId,
    productId: productObjectId,
    discountId: { $in: discountIds },
  })
    .select('discountId')
    .lean();
  const productBuysDiscountIds = new Set(
    buysProductEntries.map((e: any) => e.discountId?.toString()).filter(Boolean) as string[]
  );

  const now = new Date();

  const buyXGetYOffers: Array<{
    id: mongoose.Types.ObjectId;
    method: 'discount-code' | 'automatic';
    discountCode?: string;
    title?: string;
    customerBuys: 'minimum-quantity' | 'minimum-amount';
    quantity?: number;
    amount?: number;
    anyItemsFrom: 'specific-products' | 'specific-collections';
    customerGetsQuantity: number;
    customerGetsAnyItemsFrom: 'specific-products' | 'specific-collections';
    discountedValue: 'free' | 'amount' | 'percentage';
    discountedAmount?: number;
    discountedPercentage?: number;
    eligibility: 'all-customers' | 'specific-customer-segments' | 'specific-customers';
    buysRequirementMessage: string | null;
    getsMessage: string;
    startDate?: string;
    startTime?: string;
    setEndDate?: boolean;
    endDate?: string;
    endTime?: string;
    hasEndDate: boolean;
    endsAt?: string;
    endsInMs?: number;
    endsInText?: string;
    combinations: {
      productDiscounts: boolean;
      orderDiscounts: boolean;
      shippingDiscounts: boolean;
    };
  }> = [];

  for (const raw of discountsRaw as any[]) {
    const discountId = (raw as any)._id as mongoose.Types.ObjectId | undefined;
    if (!discountId) continue;

    // 1) Date window – skip if not yet started or already ended
    if (!isWithinActiveDates(raw as any)) continue;

    // 2) Does this product participate in the "buys" side for this discount?
    // We only consider discounts where the current product is explicitly selected
    // in the buys product list. Buys-from-collection is ignored for this endpoint.
    const discountIdStr = discountId.toString();
    let appliesViaBuys = false;
    if (raw.anyItemsFrom === 'specific-products') {
      appliesViaBuys = productBuysDiscountIds.has(discountIdStr);
    }
    if (!appliesViaBuys) continue;

    // 3) Customer eligibility
    let eligibleForCustomer = false;
    if (raw.eligibility === 'all-customers') {
      eligibleForCustomer = true;
    } else if (raw.eligibility === 'specific-customers') {
      if (!customerIdStr) continue;

      const entry = await BuyXGetYCustomerEntry.findOne({
        storeId,
        discountId,
        customerId: customerIdStr,
      }).lean();
      if (entry) {
        eligibleForCustomer = true;
      }
    } else if (raw.eligibility === 'specific-customer-segments') {
      if (!customerIdStr) continue;

      const eligibleEntries = await BuyXGetYCustomerSegmentEntry.find({
        storeId,
        discountId,
      })
        .select('customerSegmentId')
        .lean();

      if (eligibleEntries.length > 0) {
        const eligibleSegmentIds = eligibleEntries
          .map((e: any) => e.customerSegmentId?.toString())
          .filter(Boolean) as string[];

        if (eligibleSegmentIds.length > 0) {
          const customerSegments = await CustomerSegmentEntry.find({ customerId: customerIdStr })
            .select('segmentId')
            .lean();
          const customerSegmentIds = customerSegments
            .map((e: any) => e.segmentId?.toString())
            .filter(Boolean);

          const hasOverlap = customerSegmentIds.some((sid) => eligibleSegmentIds.includes(sid));
          if (hasOverlap) {
            eligibleForCustomer = true;
          }
        }
      }
    }

    if (!eligibleForCustomer) continue;

    // 4) Buys-side requirement message
    let buysRequirementMessage: string | null = null;
    if (raw.customerBuys === 'minimum-quantity' && raw.quantity != null) {
      buysRequirementMessage = `Buy at least ${raw.quantity} unit(s) of this product to unlock this offer`;
    } else if (raw.customerBuys === 'minimum-amount' && raw.amount != null) {
      buysRequirementMessage = `Spend at least ₹${raw.amount} on this product to unlock this offer`;
    }

    // 5) End date / timer
    let hasEndDate = false;
    let endsAtIso: string | undefined;
    let endsInMs: number | undefined;
    let endsInText: string | undefined;

    if (raw.setEndDate && raw.endDate) {
      const endStr = `${raw.endDate}T${raw.endTime || '23:59:59.999'}`;
      const end = new Date(endStr);
      if (!Number.isNaN(end.getTime()) && end.getTime() > now.getTime()) {
        hasEndDate = true;
        endsAtIso = end.toISOString();
        endsInMs = end.getTime() - now.getTime();

        const totalMinutes = Math.round(endsInMs / 60000);
        if (totalMinutes < 60) {
          endsInText = `Ends in ${totalMinutes} min`;
        } else {
          const totalHours = Math.round(totalMinutes / 60);
          if (totalHours < 24) {
            endsInText = `Ends in ${totalHours} hour(s)`;
          } else {
            const totalDays = Math.round(totalHours / 24);
            endsInText = `Ends in ${totalDays} day(s)`;
          }
        }
      }
    }

    // 6) Message for the "gets" side – populate products/collections when possible
    let getsMessage = 'Buy X Get Y offer';
    let getsProductTitles: string[] = [];
    let getsCollectionNames: string[] = [];

    if (raw.customerGetsAnyItemsFrom === 'specific-products') {
      const getsProductEntries = await BuyXGetYGetsProductEntry.find({
        storeId,
        discountId,
      })
        .select('productId')
        .lean();
      const getsProductIds = getsProductEntries
        .map((e: any) => e.productId?.toString())
        .filter(Boolean) as string[];
      if (getsProductIds.length > 0) {
        const products = await Product.find({
          _id: { $in: getsProductIds.map((pid) => new mongoose.Types.ObjectId(pid)) },
        })
          .select('title')
          .lean();
        getsProductTitles = products.map((p: any) => p.title).filter(Boolean) as string[];
      }
    } else if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
      const getsCollectionEntries = await BuyXGetYGetsCollectionEntry.find({
        storeId,
        discountId,
      })
        .select('collectionId')
        .lean();
      const getsCollectionIds = getsCollectionEntries
        .map((e: any) => e.collectionId?.toString())
        .filter(Boolean) as string[];
      if (getsCollectionIds.length > 0) {
        const collections = await Collections.find({
          _id: { $in: getsCollectionIds.map((cid) => new mongoose.Types.ObjectId(cid)) },
        })
          .select('title')
          .lean();
        getsCollectionNames = collections.map((c: any) => c.title).filter(Boolean) as string[];
      }
    }

    const productsListText =
      getsProductTitles.length > 0 ? getsProductTitles.join(', ') : 'selected products';
    const collectionsListText =
      getsCollectionNames.length > 0 ? getsCollectionNames.join(', ') : 'selected collections';

    if (raw.discountedValue === 'free') {
      if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
        getsMessage = `Get ${raw.customerGetsQuantity} item(s) FREE from ${collectionsListText}`;
      } else {
        getsMessage = `Get ${raw.customerGetsQuantity} item(s) FREE: ${productsListText}`;
      }
    } else if (raw.discountedValue === 'amount' && raw.discountedAmount != null) {
      if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
        getsMessage = `Get ₹${raw.discountedAmount} off on ${raw.customerGetsQuantity} item(s) from ${collectionsListText}`;
      } else {
        getsMessage = `Get ₹${raw.discountedAmount} off on ${raw.customerGetsQuantity} item(s): ${productsListText}`;
      }
    } else if (raw.discountedValue === 'percentage' && raw.discountedPercentage != null) {
      if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
        getsMessage = `Get ${raw.discountedPercentage}% off on ${raw.customerGetsQuantity} item(s) from ${collectionsListText}`;
      } else {
        getsMessage = `Get ${raw.discountedPercentage}% off on ${raw.customerGetsQuantity} item(s): ${productsListText}`;
      }
    }

    buyXGetYOffers.push({
      id: discountId,
      method: raw.method,
      discountCode: raw.discountCode,
      title: raw.title,
      customerBuys: raw.customerBuys,
      quantity: raw.quantity,
      amount: raw.amount,
      anyItemsFrom: raw.anyItemsFrom,
      customerGetsQuantity: raw.customerGetsQuantity,
      customerGetsAnyItemsFrom: raw.customerGetsAnyItemsFrom,
      discountedValue: raw.discountedValue,
      discountedAmount: raw.discountedAmount,
      discountedPercentage: raw.discountedPercentage,
      eligibility: raw.eligibility,
      buysRequirementMessage,
      getsMessage,
      startDate: raw.startDate,
      startTime: raw.startTime,
      setEndDate: raw.setEndDate,
      endDate: raw.endDate,
      endTime: raw.endTime,
      hasEndDate,
      endsAt: endsAtIso,
      endsInMs,
      endsInText,
      combinations: {
        productDiscounts: !!raw.productDiscounts,
        orderDiscounts: !!raw.orderDiscounts,
        shippingDiscounts: !!raw.shippingDiscounts,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: `Found ${buyXGetYOffers.length} buy-x-get-y offer(s) for this product`,
    data: {
      productId: id,
      buyXGetYOffers,
    },
  });
});

