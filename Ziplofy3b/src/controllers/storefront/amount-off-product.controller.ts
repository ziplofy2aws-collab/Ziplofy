/**
 * Storefront: Amount off product discounts (checkout).
 * Amount off product applies to specific products or collections in the cart.
 * Combination flags (productDiscounts, orderDiscounts, shippingDiscounts) indicate
 * whether this discount can stack with other discount types at checkout.
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CustomerSegment, CustomerSegmentEntry } from '../../models';
import { AmountOffProductsDiscountUsage } from '../../models/discount/amount-off-product-discount-model/amount-off-products-discount-usage.model';
import { AmountOffProductsDiscount } from '../../models/discount/amount-off-product-discount-model/amount-off-products-discount.model';
import { AmountOffProductsEntry } from '../../models/discount/amount-off-product-discount-model/amount-off-products-entry.model';
import { AmountOffProductsCustomerSegmentEntry } from '../../models/discount/amount-off-product-discount-model/amount-off-products-customer-segment-entry.model';
import { AmountOffProductsCustomerEntry } from '../../models/discount/amount-off-product-discount-model/amount-off-products-customer-entry.model';
import type { IAmountOffProductsDiscount } from '../../models/discount/amount-off-product-discount-model/amount-off-products-discount.model';
import { asyncErrorHandler, CustomError } from '../../utils/error.utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CartItemInput = {
  productId?: string;
  collectionIds?: string[];
  quantity: number;
  price: number;
};

const CART_ITEM_MIN_QUANTITY = 1;
const CART_ITEM_MIN_PRICE = 0;

// ---------------------------------------------------------------------------
// Helpers: validate cart and compute totals
// ---------------------------------------------------------------------------

function validateAndParseCart(body: { storeId?: string; customerId?: string; cartItems?: unknown }): {
  storeId: string;
  customerId: string | null;
  cartItems: CartItemInput[];
  cartTotal: number;
  totalQuantity: number;
} {
  const { storeId, customerId, cartItems: rawCartItems } = body;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  let customerIdRes: string | null = null;
  if (customerId != null && customerId !== '') {
    if (!mongoose.isValidObjectId(customerId)) {
      throw new CustomError('Invalid customerId when provided', 400);
    }
    customerIdRes = customerId;
  }

  if (!Array.isArray(rawCartItems) || rawCartItems.length === 0) {
    throw new CustomError('Cart items are required and must be a non-empty array', 400);
  }

  const cartItems: CartItemInput[] = [];
  for (let i = 0; i < rawCartItems.length; i++) {
    const item = rawCartItems[i] as Record<string, unknown>;
    const qty = Number(item?.quantity);
    const price = Number(item?.price);
    if (!Number.isFinite(qty) || qty < CART_ITEM_MIN_QUANTITY) {
      throw new CustomError(`Cart item at index ${i}: quantity must be at least ${CART_ITEM_MIN_QUANTITY}`, 400);
    }
    if (!Number.isFinite(price) || price < CART_ITEM_MIN_PRICE) {
      throw new CustomError(`Cart item at index ${i}: price must be a number >= ${CART_ITEM_MIN_PRICE}`, 400);
    }
    const collectionIds = Array.isArray(item?.collectionIds)
      ? (item.collectionIds as unknown[]).filter((id): id is string => typeof id === 'string' && mongoose.isValidObjectId(id))
      : undefined;
    cartItems.push({
      productId: typeof item?.productId === 'string' ? item.productId : undefined,
      collectionIds,
      quantity: qty,
      price,
    });
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return { storeId, customerId: customerIdRes, cartItems, cartTotal, totalQuantity };
}

// ---------------------------------------------------------------------------
// Helpers: date validation
// ---------------------------------------------------------------------------

function isWithinActiveDates(discount: IAmountOffProductsDiscount): boolean {
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

// ---------------------------------------------------------------------------
// Helpers: cart matches discount targets (products/collections) and compute eligible total
// ---------------------------------------------------------------------------

async function getEligibleCartTotals(
  discountId: mongoose.Types.ObjectId,
  storeId: string,
  appliesTo: 'specific-products' | 'specific-collections',
  cartItems: CartItemInput[]
): Promise<{ eligibleTotal: number; eligibleQuantity: number; hasMatch: boolean }> {
  const entries = await AmountOffProductsEntry.find({
    storeId,
    discountId,
  }).lean();

  const targetProductIds = new Set(
    entries.filter((e) => e.productId).map((e) => e.productId!.toString())
  );
  const targetCollectionIds = new Set(
    entries.filter((e) => e.collectionId).map((e) => e.collectionId!.toString())
  );

  let eligibleTotal = 0;
  let eligibleQuantity = 0;

  for (const item of cartItems) {
    let isEligible = false;
    if (appliesTo === 'specific-products' && item.productId) {
      isEligible = targetProductIds.has(item.productId);
    } else if (appliesTo === 'specific-collections' && Array.isArray(item.collectionIds)) {
      isEligible = item.collectionIds.some((cid) => targetCollectionIds.has(cid));
    }
    if (isEligible) {
      eligibleTotal += item.price * item.quantity;
      eligibleQuantity += item.quantity;
    }
  }

  return {
    eligibleTotal,
    eligibleQuantity,
    hasMatch: eligibleQuantity > 0,
  };
}

// ---------------------------------------------------------------------------
// Helpers: discount amount calculation (for eligible items only)
// ---------------------------------------------------------------------------

function computeDiscountAmount(
  discount: IAmountOffProductsDiscount,
  eligibleTotal: number,
  eligibleQuantity: number
): number {
  if (eligibleTotal <= 0) return 0;

  if (discount.valueType === 'percentage' && discount.percentage != null) {
    const pct = Math.max(0, Math.min(100, discount.percentage));
    return (eligibleTotal * pct) / 100;
  }

  if (discount.valueType === 'fixed-amount' && discount.fixedAmount != null && discount.fixedAmount >= 0) {
    if (discount.oncePerOrder) {
      return Math.min(discount.fixedAmount, eligibleTotal);
    }
    return Math.min(discount.fixedAmount * eligibleQuantity, eligibleTotal);
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Helpers: eligibility (customer segments / specific customers)
// ---------------------------------------------------------------------------

async function isCustomerEligibleForDiscount(
  discount: IAmountOffProductsDiscount & { _id: mongoose.Types.ObjectId },
  storeId: string,
  customerId: string | null
): Promise<boolean> {
  if (discount.eligibility === 'all-customers') {
    return true;
  }

  if (!customerId) {
    return false;
  }

  if (discount.eligibility === 'specific-customers') {
    const entry = await AmountOffProductsCustomerEntry.findOne({
      storeId,
      discountId: discount._id,
      customerId,
    });
    return !!entry;
  }

  if (discount.eligibility === 'specific-customer-segments') {
    const eligibleEntries = await AmountOffProductsCustomerSegmentEntry.find({
      storeId,
      discountId: discount._id,
    })
      .select('customerSegmentId')
      .lean();

    const eligibleSegmentIds = eligibleEntries
      .map((e) => e.customerSegmentId?.toString())
      .filter(Boolean) as string[];
    if (eligibleSegmentIds.length === 0) return false;

    const customerEntries = await CustomerSegmentEntry.find({ customerId })
      .select('segmentId')
      .lean();
    const customerSegmentIds = customerEntries.map((e) => e.segmentId.toString());

    const segmentsInStore = await CustomerSegment.find({
      _id: { $in: customerSegmentIds.map((id) => new mongoose.Types.ObjectId(id)) },
      storeId,
    })
      .select('_id')
      .lean();
    const customerSegmentIdsInStore = segmentsInStore.map((s) => s._id.toString());

    const hasOverlap = customerSegmentIdsInStore.some((id) => eligibleSegmentIds.includes(id));
    return hasOverlap;
  }

  return false;
}

// ---------------------------------------------------------------------------
// POST /check – get eligible automatic amount-off-product discounts for checkout
// ---------------------------------------------------------------------------

export const checkEligibleAmountOffProductDiscounts = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart(req.body);

  const discounts = await AmountOffProductsDiscount.find({
    storeId,
    status: 'active',
    method: 'automatic',
  }).lean();

  const eligibleDiscounts: Array<{
    id: mongoose.Types.ObjectId;
    method: string;
    title?: string;
    valueType: string;
    percentage?: number;
    fixedAmount?: number;
    discountAmount: number;
    message: string;
    combinations: { productDiscounts: boolean; orderDiscounts: boolean; shippingDiscounts: boolean };
  }> = [];

  for (const discount of discounts) {
    if (!isWithinActiveDates(discount)) continue;

    const eligible = await isCustomerEligibleForDiscount(
      discount as IAmountOffProductsDiscount & { _id: mongoose.Types.ObjectId },
      storeId,
      customerId
    );
    if (!eligible) continue;

    const { eligibleTotal, eligibleQuantity, hasMatch } = await getEligibleCartTotals(
      discount._id,
      storeId,
      discount.appliesTo,
      cartItems
    );
    if (!hasMatch) continue;

    if (discount.minimumPurchase === 'minimum-amount' && discount.minimumAmount != null) {
      if (cartTotal < discount.minimumAmount) continue;
    }
    if (discount.minimumPurchase === 'minimum-quantity' && discount.minimumQuantity != null) {
      if (totalQuantity < discount.minimumQuantity) continue;
    }

    if (discount.limitTotalUses && discount.totalUsesLimit != null) {
      const totalUses = await AmountOffProductsDiscountUsage.countDocuments({
        discountId: discount._id,
      });
      if (totalUses >= discount.totalUsesLimit) continue;
    }

    if (discount.limitOneUsePerCustomer && customerId) {
      const alreadyUsed = await AmountOffProductsDiscountUsage.findOne({
        discountId: discount._id,
        customerId,
      });
      if (alreadyUsed) continue;
    }

    const discountAmount = computeDiscountAmount(discount, eligibleTotal, eligibleQuantity);
    if (discountAmount <= 0) continue;

    const message =
      discount.valueType === 'percentage' && discount.percentage != null
        ? `${discount.percentage}% off selected products!`
        : `₹${discount.fixedAmount ?? 0} off selected products!`;

    eligibleDiscounts.push({
      id: discount._id,
      method: discount.method,
      title: discount.title,
      valueType: discount.valueType,
      percentage: discount.percentage,
      fixedAmount: discount.fixedAmount,
      discountAmount,
      message,
      combinations: {
        productDiscounts: !!discount.productDiscounts,
        orderDiscounts: !!discount.orderDiscounts,
        shippingDiscounts: !!discount.shippingDiscounts,
      },
    });
  }

  eligibleDiscounts.sort((a, b) => b.discountAmount - a.discountAmount);

  res.status(200).json({
    success: true,
    data: {
      eligibleDiscounts,
      cartTotal,
      totalQuantity,
    },
    message: eligibleDiscounts.length > 0
      ? `Found ${eligibleDiscounts.length} eligible discount(s)`
      : 'No eligible discounts',
  });
});

// ---------------------------------------------------------------------------
// POST /validate-code – validate a discount code and return applied discount
// ---------------------------------------------------------------------------

export const validateAmountOffProductDiscountCode = asyncErrorHandler(async (req: Request, res: Response) => {
  const raw = req.body as {
    storeId?: string;
    customerId?: string;
    cartItems?: unknown;
    discountCode?: string;
  };

  const code = typeof raw.discountCode === 'string' ? raw.discountCode.trim() : '';
  if (!code) {
    throw new CustomError('Discount code is required', 400);
  }

  const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart({
    storeId: raw.storeId,
    customerId: raw.customerId,
    cartItems: raw.cartItems,
  });

  const discount = await AmountOffProductsDiscount.findOne({
    storeId,
    status: 'active',
    method: 'discount-code',
    discountCode: code,
  });

  if (!discount) {
    return res.status(400).json({
      success: false,
      message: 'Invalid discount code',
    });
  }

  const eligible = await isCustomerEligibleForDiscount(discount, storeId, customerId);
  if (!eligible) {
    return res.status(400).json({
      success: false,
      message: 'You are not eligible for this discount code',
    });
  }

  if (discount.minimumPurchase === 'minimum-amount' && discount.minimumAmount != null) {
    if (cartTotal < discount.minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of ₹${discount.minimumAmount} required`,
      });
    }
  }
  if (discount.minimumPurchase === 'minimum-quantity' && discount.minimumQuantity != null) {
    if (totalQuantity < discount.minimumQuantity) {
      return res.status(400).json({
        success: false,
        message: `Minimum quantity of ${discount.minimumQuantity} items required`,
      });
    }
  }

  if (discount.limitTotalUses && discount.totalUsesLimit != null) {
    const totalUses = await AmountOffProductsDiscountUsage.countDocuments({
      discountId: discount._id,
    });
    if (totalUses >= discount.totalUsesLimit) {
      return res.status(400).json({
        success: false,
        message: 'This discount code has reached its usage limit',
      });
    }
  }

  if (discount.limitOneUsePerCustomer && customerId) {
    const alreadyUsed = await AmountOffProductsDiscountUsage.findOne({
      discountId: discount._id,
      customerId,
    });
    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this discount code',
      });
    }
  }

  const { eligibleTotal, eligibleQuantity, hasMatch } = await getEligibleCartTotals(
    discount._id,
    storeId,
    discount.appliesTo,
    cartItems
  );

  if (!hasMatch) {
    return res.status(400).json({
      success: false,
      message: 'This discount does not apply to any items in your cart',
    });
  }

  if (!isWithinActiveDates(discount)) {
    const now = new Date();
    if (discount.startDate) {
      const start = new Date(`${discount.startDate}T${discount.startTime || '00:00:00'}`);
      if (now < start) {
        return res.status(400).json({
          success: false,
          message: 'This discount code is not yet active',
        });
      }
    }
    if (discount.setEndDate && discount.endDate) {
      const end = new Date(`${discount.endDate}T${discount.endTime || '23:59:59.999'}`);
      if (now > end) {
        return res.status(400).json({
          success: false,
          message: 'This discount code has expired',
        });
      }
    }
  }

  const discountAmount = computeDiscountAmount(discount, eligibleTotal, eligibleQuantity);
  const message =
    discount.valueType === 'percentage' && discount.percentage != null
      ? `${discount.percentage}% off selected products!`
      : `₹${discount.fixedAmount ?? 0} off selected products!`;

  res.status(200).json({
    success: true,
    data: {
      discount: {
        id: discount._id,
        method: discount.method,
        discountCode: discount.discountCode,
        title: discount.title,
        valueType: discount.valueType,
        percentage: discount.percentage,
        fixedAmount: discount.fixedAmount,
        discountAmount,
        message,
        combinations: {
          productDiscounts: !!discount.productDiscounts,
          orderDiscounts: !!discount.orderDiscounts,
          shippingDiscounts: !!discount.shippingDiscounts,
        },
      },
      cartTotal,
      totalQuantity,
    },
    message: 'Discount code is valid',
  });
});
