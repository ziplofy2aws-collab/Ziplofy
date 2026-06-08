/**
 * Storefront: Buy X Get Y discounts (checkout).
 * Buy X Get Y applies when customer buys qualifying items and gets other items at a discount.
 * Combination flags (productDiscounts, orderDiscounts, shippingDiscounts) indicate
 * whether this discount can stack with other discount types at checkout.
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CustomerSegment, CustomerSegmentEntry, Product, Collections, CollectionEntry, ProductVariant } from '../../models';
import { BuyXGetYDiscount } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model';
import { BuyXGetYBuysProductEntry } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-product-entry.model';
import { BuyXGetYBuysCollectionEntry } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-collection-entry.model';
import { BuyXGetYGetsProductEntry } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-product-entry.model';
import { BuyXGetYGetsCollectionEntry } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-collection-entry.model';
import { BuyXGetYCustomerSegmentEntry } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-segment-entry.model';
import { BuyXGetYCustomerEntry } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-entry.model';
import { BuyXGetYDiscountUsage } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount-usage.model';
import type { IBuyXGetYDiscount } from '../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model';
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

type PopulatedGetsItem = {
  productId: string;
  productVariantId: string;
  productTitle: string;
  productImage: string | null;
  originalPrice: number;
  discountedPrice: number;
  discountPerItem: number;
  quantity: number;
  discountType: 'free' | 'amount' | 'percentage';
  discountTypeLabel: string;
  discountValue: number | null;
  savings: number;
};

type GetsDiscountResult = {
  discountAmount: number;
  getsItems: PopulatedGetsItem[];
  customerGetsQuantity: number;
  maxUsesPerOrder: number | null;
  discountSummary: string;
};

/** Get collection IDs and names for "gets from specific collections" (for choose-items UI). */
async function getGetsCollectionInfo(
  discountId: mongoose.Types.ObjectId,
  storeId: string
): Promise<{ getsCollectionIds: string[]; getsCollectionNames: string[] }> {
  const entries = await BuyXGetYGetsCollectionEntry.find({
    storeId,
    discountId,
  })
    .select('collectionId')
    .lean();
  const collectionIds = entries.map((e) => e.collectionId?.toString()).filter(Boolean) as string[];
  if (collectionIds.length === 0) {
    return { getsCollectionIds: [], getsCollectionNames: [] };
  }
  const collections = await Collections.find({ _id: { $in: collectionIds.map((id) => new mongoose.Types.ObjectId(id)) } })
    .select('title')
    .lean();
  const getsCollectionNames = collections.map((c: { title?: string }) => c.title).filter(Boolean) as string[];
  return { getsCollectionIds: collectionIds, getsCollectionNames };
}

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

function isWithinActiveDates(discount: IBuyXGetYDiscount): boolean {
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
// Helpers: eligibility check
// ---------------------------------------------------------------------------

async function isCustomerEligibleForDiscount(
  discount: IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
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
    const entry = await BuyXGetYCustomerEntry.findOne({
      storeId,
      discountId: discount._id,
      customerId,
    });
    return !!entry;
  }

  if (discount.eligibility === 'specific-customer-segments') {
    const eligibleEntries = await BuyXGetYCustomerSegmentEntry.find({
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
// Helpers: check if cart meets "buys" requirements
// ---------------------------------------------------------------------------

async function checkBuysRequirements(
  discount: IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
  storeId: string,
  cartItems: CartItemInput[]
): Promise<{ meets: boolean; qualifyingQuantity: number; qualifyingAmount: number }> {
  let qualifyingQuantity = 0;
  let qualifyingAmount = 0;

  if (discount.anyItemsFrom === 'specific-products') {
    const buysProductEntries = await BuyXGetYBuysProductEntry.find({
      storeId,
      discountId: discount._id,
    }).select('productId').lean();

    const requiredProductIds = buysProductEntries.map((e) => e.productId.toString());

    for (const item of cartItems) {
      if (item.productId && requiredProductIds.includes(item.productId)) {
        qualifyingQuantity += item.quantity;
        qualifyingAmount += item.price * item.quantity;
      }
    }
  } else if (discount.anyItemsFrom === 'specific-collections') {
    const buysCollectionEntries = await BuyXGetYBuysCollectionEntry.find({
      storeId,
      discountId: discount._id,
    }).select('collectionId').lean();

    const requiredCollectionIds = buysCollectionEntries.map((e) => e.collectionId.toString());

    for (const item of cartItems) {
      if (item.collectionIds && item.collectionIds.some((cid) => requiredCollectionIds.includes(cid))) {
        qualifyingQuantity += item.quantity;
        qualifyingAmount += item.price * item.quantity;
      }
    }
  }

  let meets = false;
  if (discount.customerBuys === 'minimum-quantity' && discount.quantity != null) {
    meets = qualifyingQuantity >= discount.quantity;
  } else if (discount.customerBuys === 'minimum-amount' && discount.amount != null) {
    meets = qualifyingAmount >= discount.amount;
  }

  return { meets, qualifyingQuantity, qualifyingAmount };
}

// ---------------------------------------------------------------------------
// Helpers: find "gets" items in cart and calculate discount (with populated info)
// ---------------------------------------------------------------------------

async function calculateGetsDiscount(
  discount: IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
  storeId: string,
  cartItems: CartItemInput[]
): Promise<GetsDiscountResult> {
  const getsItems: PopulatedGetsItem[] = [];
  let totalDiscountAmount = 0;

  const customerGetsQuantity = discount.customerGetsQuantity || 1;
  const maxUsesPerOrderValue = discount.setMaxUsersPerOrder && discount.maxUsersPerOrder ? discount.maxUsersPerOrder : null;
  const effectiveMaxUses = maxUsesPerOrderValue ?? Infinity;

  let eligibleCartItems: CartItemInput[] = [];
  let eligibleCollectionIds: string[] = [];

  if (discount.customerGetsAnyItemsFrom === 'specific-products') {
    const getsProductEntries = await BuyXGetYGetsProductEntry.find({
      storeId,
      discountId: discount._id,
    }).select('productId').lean();

    const getsProductIds = getsProductEntries.map((e) => e.productId.toString());

    eligibleCartItems = cartItems.filter(
      (item) => item.productId && getsProductIds.includes(item.productId)
    );
  } else if (discount.customerGetsAnyItemsFrom === 'specific-collections') {
    const getsCollectionEntries = await BuyXGetYGetsCollectionEntry.find({
      storeId,
      discountId: discount._id,
    }).select('collectionId').lean();

    eligibleCollectionIds = getsCollectionEntries.map((e) => e.collectionId.toString());

    eligibleCartItems = cartItems.filter(
      (item) => item.collectionIds && item.collectionIds.some((cid) => eligibleCollectionIds.includes(cid))
    );
  }

  // Get unique product IDs from eligible cart items for population
  const productIdsToPopulate = [...new Set(eligibleCartItems.map((item) => item.productId).filter(Boolean))] as string[];

  // Fetch product details for population
  const products = await Product.find({
    _id: { $in: productIdsToPopulate.map((id) => new mongoose.Types.ObjectId(id)) },
    storeId,
  })
    .select('_id title imageUrls price')
    .lean();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // Fetch first non-deprecated variant for each product (for order items)
  const variants = await ProductVariant.find({
    productId: { $in: productIdsToPopulate.map((id) => new mongoose.Types.ObjectId(id)) },
    depricated: { $ne: true },
  }).lean();

  const variantByProductId = new Map<string, string>();
  for (const v of variants) {
    const pid = (v as any).productId?.toString();
    if (pid && !variantByProductId.has(pid)) {
      variantByProductId.set(pid, v._id.toString());
    }
  }

  // Build discount type label
  let discountTypeLabel = '';
  let discountValue: number | null = null;
  const discountType = discount.discountedValue as 'free' | 'amount' | 'percentage';

  if (discount.discountedValue === 'free') {
    discountTypeLabel = 'FREE';
    discountValue = 100;
  } else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
    discountTypeLabel = `₹${discount.discountedAmount} OFF`;
    discountValue = discount.discountedAmount;
  } else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
    discountTypeLabel = `${discount.discountedPercentage}% OFF`;
    discountValue = discount.discountedPercentage;
  }

  let remainingGetsQuantity = Math.min(
    customerGetsQuantity * effectiveMaxUses,
    eligibleCartItems.reduce((sum, item) => sum + item.quantity, 0)
  );

  for (const item of eligibleCartItems) {
    if (remainingGetsQuantity <= 0) break;

    const quantityToDiscount = Math.min(item.quantity, remainingGetsQuantity);
    let discountPerItem = 0;

    if (discount.discountedValue === 'free') {
      discountPerItem = item.price;
    } else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
      discountPerItem = Math.min(discount.discountedAmount, item.price);
    } else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
      const pct = Math.max(0, Math.min(100, discount.discountedPercentage));
      discountPerItem = (item.price * pct) / 100;
    }

    if (discountPerItem > 0 && item.productId) {
      const product = productMap.get(item.productId);
      const variantId = variantByProductId.get(item.productId);
      const discountedPrice = Math.max(0, item.price - discountPerItem);

      getsItems.push({
        productId: item.productId,
        productVariantId: variantId || item.productId,
        productTitle: (product as any)?.title || 'Product',
        productImage: (product as any)?.imageUrls?.[0] || null,
        originalPrice: item.price,
        discountedPrice,
        discountPerItem,
        quantity: quantityToDiscount,
        discountType,
        discountTypeLabel,
        discountValue,
        savings: discountPerItem * quantityToDiscount,
      });
      totalDiscountAmount += discountPerItem * quantityToDiscount;
    }

    remainingGetsQuantity -= quantityToDiscount;
  }

  // Build discount summary
  let discountSummary = '';
  if (getsItems.length > 0) {
    const totalQty = getsItems.reduce((sum, g) => sum + g.quantity, 0);
    if (discount.discountedValue === 'free') {
      discountSummary = `Get ${totalQty} item${totalQty > 1 ? 's' : ''} FREE (Save ₹${totalDiscountAmount.toFixed(2)})`;
    } else if (discount.discountedValue === 'amount') {
      discountSummary = `Get ₹${discount.discountedAmount} off on ${totalQty} item${totalQty > 1 ? 's' : ''} (Save ₹${totalDiscountAmount.toFixed(2)})`;
    } else if (discount.discountedValue === 'percentage') {
      discountSummary = `Get ${discount.discountedPercentage}% off on ${totalQty} item${totalQty > 1 ? 's' : ''} (Save ₹${totalDiscountAmount.toFixed(2)})`;
    }
  }

  return {
    discountAmount: totalDiscountAmount,
    getsItems,
    customerGetsQuantity,
    maxUsesPerOrder: maxUsesPerOrderValue,
    discountSummary,
  };
}

// ---------------------------------------------------------------------------
// Helpers: populate "gets" items from discount config (items customer will receive)
// Used when buys requirement is met but gets items may not be in cart yet
// ---------------------------------------------------------------------------

async function calculateGetsDiscountFromConfig(
  discount: IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
  storeId: string,
  buysResult: { qualifyingQuantity: number; qualifyingAmount: number }
): Promise<GetsDiscountResult> {
  const getsItems: PopulatedGetsItem[] = [];
  let totalDiscountAmount = 0;

  const customerGetsQuantity = discount.customerGetsQuantity || 1;
  const maxUsesPerOrderValue = discount.setMaxUsersPerOrder && discount.maxUsersPerOrder ? discount.maxUsersPerOrder : null;
  const effectiveMaxUses = maxUsesPerOrderValue ?? Infinity;

  // Compute number of "uses" from qualifying buys
  let uses = 0;
  if (discount.customerBuys === 'minimum-quantity' && discount.quantity != null && discount.quantity > 0) {
    uses = Math.floor(buysResult.qualifyingQuantity / discount.quantity);
  } else if (discount.customerBuys === 'minimum-amount' && discount.amount != null && discount.amount > 0) {
    uses = Math.floor(buysResult.qualifyingAmount / discount.amount);
  }
  if (uses <= 0) {
    return { discountAmount: 0, getsItems, customerGetsQuantity, maxUsesPerOrder: maxUsesPerOrderValue, discountSummary: '' };
  }

  const cappedUses = Math.min(uses, effectiveMaxUses);
  const totalGetsQuantity = cappedUses * customerGetsQuantity;

  let getsProductIds: string[] = [];

  if (discount.customerGetsAnyItemsFrom === 'specific-products') {
    const getsProductEntries = await BuyXGetYGetsProductEntry.find({
      storeId,
      discountId: discount._id,
    }).select('productId').lean();
    getsProductIds = getsProductEntries.map((e) => e.productId.toString()).filter(Boolean);
  } else if (discount.customerGetsAnyItemsFrom === 'specific-collections') {
    const getsCollectionEntries = await BuyXGetYGetsCollectionEntry.find({
      storeId,
      discountId: discount._id,
    }).select('collectionId').lean();
    const collectionIds = getsCollectionEntries.map((e) => e.collectionId).filter(Boolean);
    if (collectionIds.length > 0) {
      const entries = await CollectionEntry.find({ collectionId: { $in: collectionIds } }).select('productId').lean();
      getsProductIds = [...new Set(entries.map((e) => e.productId.toString()).filter(Boolean))];
    }
  }

  if (getsProductIds.length === 0) {
    return { discountAmount: 0, getsItems, customerGetsQuantity, maxUsesPerOrder: maxUsesPerOrderValue, discountSummary: '' };
  }

  const products = await Product.find({
    _id: { $in: getsProductIds.map((id) => new mongoose.Types.ObjectId(id)) },
    storeId,
  })
    .select('_id title imageUrls price')
    .lean();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // Fetch first non-deprecated variant for each product (for order items)
  const variants = await ProductVariant.find({
    productId: { $in: getsProductIds.map((id) => new mongoose.Types.ObjectId(id)) },
    depricated: { $ne: true },
  }).lean();

  const variantByProductId = new Map<string, { _id: mongoose.Types.ObjectId; price: number }>();
  for (const v of variants) {
    const pid = (v as any).productId?.toString();
    if (pid && !variantByProductId.has(pid)) {
      variantByProductId.set(pid, { _id: v._id, price: (v as any).price ?? 0 });
    }
  }

  let discountTypeLabel = '';
  let discountValue: number | null = null;
  const discountType = discount.discountedValue as 'free' | 'amount' | 'percentage';

  if (discount.discountedValue === 'free') {
    discountTypeLabel = 'FREE';
    discountValue = 100;
  } else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
    discountTypeLabel = `₹${discount.discountedAmount} OFF`;
    discountValue = discount.discountedAmount;
  } else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
    discountTypeLabel = `${discount.discountedPercentage}% OFF`;
    discountValue = discount.discountedPercentage;
  }

  let remainingQty = totalGetsQuantity;
  for (const pid of getsProductIds) {
    if (remainingQty <= 0) break;
    const product = productMap.get(pid);
    const variant = variantByProductId.get(pid);
    if (!product || !variant) continue;

    const originalPrice = variant.price > 0 ? variant.price : ((product as any).price ?? 0);
    let discountPerItem = 0;

    if (discount.discountedValue === 'free') {
      discountPerItem = originalPrice;
    } else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
      discountPerItem = Math.min(discount.discountedAmount, originalPrice);
    } else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
      const pct = Math.max(0, Math.min(100, discount.discountedPercentage));
      discountPerItem = (originalPrice * pct) / 100;
    }

    const quantityToAdd = Math.min(remainingQty, totalGetsQuantity);
    if (quantityToAdd > 0 && discountPerItem >= 0) {
      const discountedPrice = Math.max(0, originalPrice - discountPerItem);
      const savings = discountPerItem * quantityToAdd;

      getsItems.push({
        productId: pid,
        productVariantId: variant._id.toString(),
        productTitle: (product as any).title || 'Product',
        productImage: (product as any).imageUrls?.[0] || null,
        originalPrice,
        discountedPrice,
        discountPerItem,
        quantity: quantityToAdd,
        discountType,
        discountTypeLabel,
        discountValue,
        savings,
      });
      totalDiscountAmount += savings;
      remainingQty -= quantityToAdd;
      break;
    }
  }

  let discountSummary = '';
  // For "gets from specific collections", show "Choose X items from [Collection Name]" using customerGetsQuantity
  if (discount.customerGetsAnyItemsFrom === 'specific-collections') {
    const getsCollectionEntries = await BuyXGetYGetsCollectionEntry.find({
      storeId,
      discountId: discount._id,
    })
      .select('collectionId')
      .lean();
    const collectionIds = getsCollectionEntries.map((e) => e.collectionId).filter(Boolean);
    if (collectionIds.length > 0) {
      const collections = await Collections.find({ _id: { $in: collectionIds } })
        .select('title')
        .lean();
      const collectionNames = collections.map((c: { title?: string }) => c.title).filter(Boolean) as string[];
      const nameText =
        collectionNames.length === 1
          ? collectionNames[0]
          : collectionNames.length > 1
            ? `${collectionNames[0]} and others`
            : 'selected collection';
      const saveText = totalDiscountAmount > 0 ? ` (Save ₹${totalDiscountAmount.toFixed(2)})` : '';
      discountSummary = `Choose ${customerGetsQuantity} item${customerGetsQuantity !== 1 ? 's' : ''} from ${nameText}${saveText}`;
    }
  }
  if (!discountSummary && getsItems.length > 0) {
    const totalQty = getsItems.reduce((sum, g) => sum + g.quantity, 0);
    if (discount.discountedValue === 'free') {
      discountSummary = `Get ${totalQty} item${totalQty > 1 ? 's' : ''} FREE (Save ₹${totalDiscountAmount.toFixed(2)})`;
    } else if (discount.discountedValue === 'amount') {
      discountSummary = `Get ₹${discount.discountedAmount} off on ${totalQty} item${totalQty > 1 ? 's' : ''} (Save ₹${totalDiscountAmount.toFixed(2)})`;
    } else if (discount.discountedValue === 'percentage') {
      discountSummary = `Get ${discount.discountedPercentage}% off on ${totalQty} item${totalQty > 1 ? 's' : ''} (Save ₹${totalDiscountAmount.toFixed(2)})`;
    }
  }

  return {
    discountAmount: totalDiscountAmount,
    getsItems,
    customerGetsQuantity,
    maxUsesPerOrder: maxUsesPerOrderValue,
    discountSummary,
  };
}

// ---------------------------------------------------------------------------
// POST /check – get eligible automatic buy-x-get-y discounts for checkout
// ---------------------------------------------------------------------------

export const checkEligibleBuyXGetYDiscounts = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart(req.body);

  const discounts = await BuyXGetYDiscount.find({
    storeId,
    status: 'active',
    method: 'automatic',
  }).lean();

  const eligibleDiscounts: Array<{
    id: mongoose.Types.ObjectId;
    method: string;
    title?: string;
    discountedValue: string;
    discountedAmount?: number;
    discountedPercentage?: number;
    customerGetsAnyItemsFrom?: string;
    customerGetsQuantity: number;
    maxUsesPerOrder: number | null;
    totalDiscountAmount: number;
    getsItems: PopulatedGetsItem[];
    discountSummary: string;
    message: string;
    combinations: { productDiscounts: boolean; orderDiscounts: boolean; shippingDiscounts: boolean };
    getsCollectionIds?: string[];
    getsCollectionNames?: string[];
  }> = [];

  for (const discount of discounts) {
    if (!isWithinActiveDates(discount)) continue;

    const eligible = await isCustomerEligibleForDiscount(
      discount as IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
      storeId,
      customerId
    );
    if (!eligible) continue;

    const buysResult = await checkBuysRequirements(
      discount as IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
      storeId,
      cartItems
    );
    if (!buysResult.meets) continue;

    if (discount.limitTotalUses && discount.totalUsesLimit != null) {
      const totalUses = await BuyXGetYDiscountUsage.countDocuments({
        discountId: discount._id,
      });
      if (totalUses >= discount.totalUsesLimit) continue;
    }

    if (discount.limitOneUsePerCustomer && customerId) {
      const alreadyUsed = await BuyXGetYDiscountUsage.findOne({
        discountId: discount._id,
        customerId,
      });
      if (alreadyUsed) continue;
    }

    // Populate gets items from discount config - items customer will receive (need not be in cart)
    const getsResult = await calculateGetsDiscountFromConfig(
      discount as IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
      storeId,
      buysResult
    );

    if (getsResult.discountAmount <= 0 || getsResult.getsItems.length === 0) continue;

    let message = '';
    if (discount.discountedValue === 'free') {
      message = `Buy qualifying items and get ${discount.customerGetsQuantity} item(s) FREE!`;
    } else if (discount.discountedValue === 'amount') {
      message = `Buy qualifying items and get ₹${discount.discountedAmount} off on ${discount.customerGetsQuantity} item(s)!`;
    } else if (discount.discountedValue === 'percentage') {
      message = `Buy qualifying items and get ${discount.discountedPercentage}% off on ${discount.customerGetsQuantity} item(s)!`;
    }

    const collectionInfo =
      discount.customerGetsAnyItemsFrom === 'specific-collections'
        ? await getGetsCollectionInfo(discount._id, storeId)
        : { getsCollectionIds: [] as string[], getsCollectionNames: [] as string[] };

    eligibleDiscounts.push({
      id: discount._id,
      method: discount.method,
      title: discount.title,
      discountedValue: discount.discountedValue,
      discountedAmount: discount.discountedAmount,
      discountedPercentage: discount.discountedPercentage,
      customerGetsAnyItemsFrom: discount.customerGetsAnyItemsFrom,
      customerGetsQuantity: getsResult.customerGetsQuantity,
      maxUsesPerOrder: getsResult.maxUsesPerOrder,
      totalDiscountAmount: getsResult.discountAmount,
      getsItems: getsResult.getsItems,
      discountSummary: getsResult.discountSummary,
      message,
      combinations: {
        productDiscounts: !!discount.productDiscounts,
        orderDiscounts: !!discount.orderDiscounts,
        shippingDiscounts: !!discount.shippingDiscounts,
      },
      ...(collectionInfo.getsCollectionIds.length > 0 && {
        getsCollectionIds: collectionInfo.getsCollectionIds,
        getsCollectionNames: collectionInfo.getsCollectionNames,
      }),
    });
  }

  eligibleDiscounts.sort((a, b) => b.totalDiscountAmount - a.totalDiscountAmount);

  res.status(200).json({
    success: true,
    data: {
      eligibleDiscounts,
      cartTotal,
      totalQuantity,
    },
    message: eligibleDiscounts.length > 0
      ? `Found ${eligibleDiscounts.length} eligible Buy X Get Y discount(s)`
      : 'No eligible Buy X Get Y discounts',
  });
});

// ---------------------------------------------------------------------------
// POST /validate-code – validate a discount code and return applied discount
// ---------------------------------------------------------------------------

export const validateBuyXGetYDiscountCode = asyncErrorHandler(async (req: Request, res: Response) => {
  const raw = req.body as {
    storeId?: string;
    customerId?: string;
    cartItems?: unknown;
    discountCode?: string;
  };

  const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart(raw);

  const discountCode = raw.discountCode?.toString().trim();
  if (!discountCode) {
    throw new CustomError('Discount code is required', 400);
  }

  const discount = await BuyXGetYDiscount.findOne({
    storeId,
    status: 'active',
    method: 'discount-code',
    discountCode: { $regex: new RegExp(`^${discountCode}$`, 'i') },
  }).lean();

  if (!discount) {
    res.status(200).json({
      success: false,
      message: 'Invalid or expired discount code',
      data: null,
    });
    return;
  }

  if (!isWithinActiveDates(discount)) {
    res.status(200).json({
      success: false,
      message: 'This discount code is not currently active',
      data: null,
    });
    return;
  }

  const eligible = await isCustomerEligibleForDiscount(
    discount as IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
    storeId,
    customerId
  );
  if (!eligible) {
    res.status(200).json({
      success: false,
      message: 'You are not eligible for this discount',
      data: null,
    });
    return;
  }

  const buysResult = await checkBuysRequirements(
    discount as IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
    storeId,
    cartItems
  );

  if (!buysResult.meets) {
    let requirementMessage = '';
    if (discount.customerBuys === 'minimum-quantity') {
      requirementMessage = `You need to buy at least ${discount.quantity} qualifying item(s) to use this code`;
    } else if (discount.customerBuys === 'minimum-amount') {
      requirementMessage = `You need to spend at least ₹${discount.amount} on qualifying items to use this code`;
    }
    res.status(200).json({
      success: false,
      message: requirementMessage || 'Your cart does not meet the requirements for this discount',
      data: null,
    });
    return;
  }

  if (discount.limitTotalUses && discount.totalUsesLimit != null) {
    const totalUses = await BuyXGetYDiscountUsage.countDocuments({
      discountId: discount._id,
    });
    if (totalUses >= discount.totalUsesLimit) {
      res.status(200).json({
        success: false,
        message: 'This discount code has reached its usage limit',
        data: null,
      });
      return;
    }
  }

  if (discount.limitOneUsePerCustomer && customerId) {
    const alreadyUsed = await BuyXGetYDiscountUsage.findOne({
      discountId: discount._id,
      customerId,
    });
    if (alreadyUsed) {
      res.status(200).json({
        success: false,
        message: 'You have already used this discount code',
        data: null,
      });
      return;
    }
  }

  // Use config-based gets (same as automatic): "get X items from collection/products" = items
  // the customer will receive, not items that must already be in the cart
  const getsResult = await calculateGetsDiscountFromConfig(
    discount as IBuyXGetYDiscount & { _id: mongoose.Types.ObjectId },
    storeId,
    buysResult
  );

  if (getsResult.discountAmount <= 0 || getsResult.getsItems.length === 0) {
    res.status(200).json({
      success: false,
      message: 'No eligible items available for the "gets" portion of this discount',
      data: null,
    });
    return;
  }

  // Build user-facing message
  let message = '';

  // Special messaging when "gets" are from specific collections:
  // e.g. "Choose 2 items from Summer Collection"
  if (discount.customerGetsAnyItemsFrom === 'specific-collections') {
    const getsCollections = await BuyXGetYGetsCollectionEntry.find({
      storeId,
      discountId: discount._id,
    })
      .populate('collectionId', 'title')
      .lean();

    const collectionNames = getsCollections
      .map((e: any) => e.collectionId?.title)
      .filter(Boolean) as string[];

    if (collectionNames.length > 0) {
      const mainName =
        collectionNames.length === 1
          ? collectionNames[0]
          : `${collectionNames[0]} and others`;

      message = `Code applied! Choose ${getsResult.customerGetsQuantity} item(s) from ${mainName}.`;
    }
  }

  // Fallback / non-collection-specific messaging
  if (!message) {
    if (discount.discountedValue === 'free') {
      message = `Code applied! Get ${getsResult.customerGetsQuantity} item(s) FREE!`;
    } else if (discount.discountedValue === 'amount') {
      message = `Code applied! Get ₹${discount.discountedAmount} off on ${getsResult.customerGetsQuantity} item(s)!`;
    } else if (discount.discountedValue === 'percentage') {
      message = `Code applied! Get ${discount.discountedPercentage}% off on ${getsResult.customerGetsQuantity} item(s)!`;
    }
  }

  const getsCollectionInfo =
    discount.customerGetsAnyItemsFrom === 'specific-collections'
      ? await getGetsCollectionInfo(discount._id, storeId)
      : { getsCollectionIds: [] as string[], getsCollectionNames: [] as string[] };

  res.status(200).json({
    success: true,
    message,
    data: {
      id: discount._id,
      discountCode: discount.discountCode,
      method: discount.method,
      title: discount.title,
      discountedValue: discount.discountedValue,
      discountedAmount: discount.discountedAmount,
      discountedPercentage: discount.discountedPercentage,
      customerGetsAnyItemsFrom: discount.customerGetsAnyItemsFrom,
      customerGetsQuantity: getsResult.customerGetsQuantity,
      maxUsesPerOrder: getsResult.maxUsesPerOrder,
      totalDiscountAmount: getsResult.discountAmount,
      getsItems: getsResult.getsItems,
      discountSummary: getsResult.discountSummary,
      ...(getsCollectionInfo.getsCollectionIds.length > 0 && {
        getsCollectionIds: getsCollectionInfo.getsCollectionIds,
        getsCollectionNames: getsCollectionInfo.getsCollectionNames,
      }),
      combinations: {
        productDiscounts: !!discount.productDiscounts,
        orderDiscounts: !!discount.orderDiscounts,
        shippingDiscounts: !!discount.shippingDiscounts,
      },
      cartTotal,
      totalQuantity,
    },
  });
});
