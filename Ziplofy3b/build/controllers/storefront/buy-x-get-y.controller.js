"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBuyXGetYDiscountCode = exports.checkEligibleBuyXGetYDiscounts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../../models");
const buy_x_get_y_discount_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model");
const buy_x_get_y_buys_product_entry_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-product-entry.model");
const buy_x_get_y_buys_collection_entry_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-collection-entry.model");
const buy_x_get_y_gets_product_entry_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-product-entry.model");
const buy_x_get_y_gets_collection_entry_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-collection-entry.model");
const buy_x_get_y_customer_segment_entry_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-segment-entry.model");
const buy_x_get_y_customer_entry_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-entry.model");
const buy_x_get_y_discount_usage_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount-usage.model");
const error_utils_1 = require("../../utils/error.utils");
/** Get collection IDs and names for "gets from specific collections" (for choose-items UI). */
async function getGetsCollectionInfo(discountId, storeId) {
    const entries = await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.find({
        storeId,
        discountId,
    })
        .select('collectionId')
        .lean();
    const collectionIds = entries.map((e) => e.collectionId?.toString()).filter(Boolean);
    if (collectionIds.length === 0) {
        return { getsCollectionIds: [], getsCollectionNames: [] };
    }
    const collections = await models_1.Collections.find({ _id: { $in: collectionIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) } })
        .select('title')
        .lean();
    const getsCollectionNames = collections.map((c) => c.title).filter(Boolean);
    return { getsCollectionIds: collectionIds, getsCollectionNames };
}
const CART_ITEM_MIN_QUANTITY = 1;
const CART_ITEM_MIN_PRICE = 0;
// ---------------------------------------------------------------------------
// Helpers: validate cart and compute totals
// ---------------------------------------------------------------------------
function validateAndParseCart(body) {
    const { storeId, customerId, cartItems: rawCartItems } = body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    let customerIdRes = null;
    if (customerId != null && customerId !== '') {
        if (!mongoose_1.default.isValidObjectId(customerId)) {
            throw new error_utils_1.CustomError('Invalid customerId when provided', 400);
        }
        customerIdRes = customerId;
    }
    if (!Array.isArray(rawCartItems) || rawCartItems.length === 0) {
        throw new error_utils_1.CustomError('Cart items are required and must be a non-empty array', 400);
    }
    const cartItems = [];
    for (let i = 0; i < rawCartItems.length; i++) {
        const item = rawCartItems[i];
        const qty = Number(item?.quantity);
        const price = Number(item?.price);
        if (!Number.isFinite(qty) || qty < CART_ITEM_MIN_QUANTITY) {
            throw new error_utils_1.CustomError(`Cart item at index ${i}: quantity must be at least ${CART_ITEM_MIN_QUANTITY}`, 400);
        }
        if (!Number.isFinite(price) || price < CART_ITEM_MIN_PRICE) {
            throw new error_utils_1.CustomError(`Cart item at index ${i}: price must be a number >= ${CART_ITEM_MIN_PRICE}`, 400);
        }
        const collectionIds = Array.isArray(item?.collectionIds)
            ? item.collectionIds.filter((id) => typeof id === 'string' && mongoose_1.default.isValidObjectId(id))
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
function isWithinActiveDates(discount) {
    const now = new Date();
    if (discount.startDate) {
        const startStr = `${discount.startDate}T${discount.startTime || '00:00:00'}`;
        const start = new Date(startStr);
        if (Number.isNaN(start.getTime()))
            return false;
        if (now < start)
            return false;
    }
    if (discount.setEndDate && discount.endDate) {
        const endStr = `${discount.endDate}T${discount.endTime || '23:59:59.999'}`;
        const end = new Date(endStr);
        if (Number.isNaN(end.getTime()))
            return false;
        if (now > end)
            return false;
    }
    return true;
}
// ---------------------------------------------------------------------------
// Helpers: eligibility check
// ---------------------------------------------------------------------------
async function isCustomerEligibleForDiscount(discount, storeId, customerId) {
    if (discount.eligibility === 'all-customers') {
        return true;
    }
    if (!customerId) {
        return false;
    }
    if (discount.eligibility === 'specific-customers') {
        const entry = await buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.findOne({
            storeId,
            discountId: discount._id,
            customerId,
        });
        return !!entry;
    }
    if (discount.eligibility === 'specific-customer-segments') {
        const eligibleEntries = await buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.find({
            storeId,
            discountId: discount._id,
        })
            .select('customerSegmentId')
            .lean();
        const eligibleSegmentIds = eligibleEntries
            .map((e) => e.customerSegmentId?.toString())
            .filter(Boolean);
        if (eligibleSegmentIds.length === 0)
            return false;
        const customerEntries = await models_1.CustomerSegmentEntry.find({ customerId })
            .select('segmentId')
            .lean();
        const customerSegmentIds = customerEntries.map((e) => e.segmentId.toString());
        const segmentsInStore = await models_1.CustomerSegment.find({
            _id: { $in: customerSegmentIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
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
async function checkBuysRequirements(discount, storeId, cartItems) {
    let qualifyingQuantity = 0;
    let qualifyingAmount = 0;
    if (discount.anyItemsFrom === 'specific-products') {
        const buysProductEntries = await buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.find({
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
    }
    else if (discount.anyItemsFrom === 'specific-collections') {
        const buysCollectionEntries = await buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.find({
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
    }
    else if (discount.customerBuys === 'minimum-amount' && discount.amount != null) {
        meets = qualifyingAmount >= discount.amount;
    }
    return { meets, qualifyingQuantity, qualifyingAmount };
}
// ---------------------------------------------------------------------------
// Helpers: find "gets" items in cart and calculate discount (with populated info)
// ---------------------------------------------------------------------------
async function calculateGetsDiscount(discount, storeId, cartItems) {
    const getsItems = [];
    let totalDiscountAmount = 0;
    const customerGetsQuantity = discount.customerGetsQuantity || 1;
    const maxUsesPerOrderValue = discount.setMaxUsersPerOrder && discount.maxUsersPerOrder ? discount.maxUsersPerOrder : null;
    const effectiveMaxUses = maxUsesPerOrderValue ?? Infinity;
    let eligibleCartItems = [];
    let eligibleCollectionIds = [];
    if (discount.customerGetsAnyItemsFrom === 'specific-products') {
        const getsProductEntries = await buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.find({
            storeId,
            discountId: discount._id,
        }).select('productId').lean();
        const getsProductIds = getsProductEntries.map((e) => e.productId.toString());
        eligibleCartItems = cartItems.filter((item) => item.productId && getsProductIds.includes(item.productId));
    }
    else if (discount.customerGetsAnyItemsFrom === 'specific-collections') {
        const getsCollectionEntries = await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.find({
            storeId,
            discountId: discount._id,
        }).select('collectionId').lean();
        eligibleCollectionIds = getsCollectionEntries.map((e) => e.collectionId.toString());
        eligibleCartItems = cartItems.filter((item) => item.collectionIds && item.collectionIds.some((cid) => eligibleCollectionIds.includes(cid)));
    }
    // Get unique product IDs from eligible cart items for population
    const productIdsToPopulate = [...new Set(eligibleCartItems.map((item) => item.productId).filter(Boolean))];
    // Fetch product details for population
    const products = await models_1.Product.find({
        _id: { $in: productIdsToPopulate.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
        storeId,
    })
        .select('_id title imageUrls price')
        .lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    // Fetch first non-deprecated variant for each product (for order items)
    const variants = await models_1.ProductVariant.find({
        productId: { $in: productIdsToPopulate.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
        depricated: { $ne: true },
    }).lean();
    const variantByProductId = new Map();
    for (const v of variants) {
        const pid = v.productId?.toString();
        if (pid && !variantByProductId.has(pid)) {
            variantByProductId.set(pid, v._id.toString());
        }
    }
    // Build discount type label
    let discountTypeLabel = '';
    let discountValue = null;
    const discountType = discount.discountedValue;
    if (discount.discountedValue === 'free') {
        discountTypeLabel = 'FREE';
        discountValue = 100;
    }
    else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
        discountTypeLabel = `₹${discount.discountedAmount} OFF`;
        discountValue = discount.discountedAmount;
    }
    else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
        discountTypeLabel = `${discount.discountedPercentage}% OFF`;
        discountValue = discount.discountedPercentage;
    }
    let remainingGetsQuantity = Math.min(customerGetsQuantity * effectiveMaxUses, eligibleCartItems.reduce((sum, item) => sum + item.quantity, 0));
    for (const item of eligibleCartItems) {
        if (remainingGetsQuantity <= 0)
            break;
        const quantityToDiscount = Math.min(item.quantity, remainingGetsQuantity);
        let discountPerItem = 0;
        if (discount.discountedValue === 'free') {
            discountPerItem = item.price;
        }
        else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
            discountPerItem = Math.min(discount.discountedAmount, item.price);
        }
        else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
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
                productTitle: product?.title || 'Product',
                productImage: product?.imageUrls?.[0] || null,
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
        }
        else if (discount.discountedValue === 'amount') {
            discountSummary = `Get ₹${discount.discountedAmount} off on ${totalQty} item${totalQty > 1 ? 's' : ''} (Save ₹${totalDiscountAmount.toFixed(2)})`;
        }
        else if (discount.discountedValue === 'percentage') {
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
async function calculateGetsDiscountFromConfig(discount, storeId, buysResult) {
    const getsItems = [];
    let totalDiscountAmount = 0;
    const customerGetsQuantity = discount.customerGetsQuantity || 1;
    const maxUsesPerOrderValue = discount.setMaxUsersPerOrder && discount.maxUsersPerOrder ? discount.maxUsersPerOrder : null;
    const effectiveMaxUses = maxUsesPerOrderValue ?? Infinity;
    // Compute number of "uses" from qualifying buys
    let uses = 0;
    if (discount.customerBuys === 'minimum-quantity' && discount.quantity != null && discount.quantity > 0) {
        uses = Math.floor(buysResult.qualifyingQuantity / discount.quantity);
    }
    else if (discount.customerBuys === 'minimum-amount' && discount.amount != null && discount.amount > 0) {
        uses = Math.floor(buysResult.qualifyingAmount / discount.amount);
    }
    if (uses <= 0) {
        return { discountAmount: 0, getsItems, customerGetsQuantity, maxUsesPerOrder: maxUsesPerOrderValue, discountSummary: '' };
    }
    const cappedUses = Math.min(uses, effectiveMaxUses);
    const totalGetsQuantity = cappedUses * customerGetsQuantity;
    let getsProductIds = [];
    if (discount.customerGetsAnyItemsFrom === 'specific-products') {
        const getsProductEntries = await buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.find({
            storeId,
            discountId: discount._id,
        }).select('productId').lean();
        getsProductIds = getsProductEntries.map((e) => e.productId.toString()).filter(Boolean);
    }
    else if (discount.customerGetsAnyItemsFrom === 'specific-collections') {
        const getsCollectionEntries = await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.find({
            storeId,
            discountId: discount._id,
        }).select('collectionId').lean();
        const collectionIds = getsCollectionEntries.map((e) => e.collectionId).filter(Boolean);
        if (collectionIds.length > 0) {
            const entries = await models_1.CollectionEntry.find({ collectionId: { $in: collectionIds } }).select('productId').lean();
            getsProductIds = [...new Set(entries.map((e) => e.productId.toString()).filter(Boolean))];
        }
    }
    if (getsProductIds.length === 0) {
        return { discountAmount: 0, getsItems, customerGetsQuantity, maxUsesPerOrder: maxUsesPerOrderValue, discountSummary: '' };
    }
    const products = await models_1.Product.find({
        _id: { $in: getsProductIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
        storeId,
    })
        .select('_id title imageUrls price')
        .lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    // Fetch first non-deprecated variant for each product (for order items)
    const variants = await models_1.ProductVariant.find({
        productId: { $in: getsProductIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
        depricated: { $ne: true },
    }).lean();
    const variantByProductId = new Map();
    for (const v of variants) {
        const pid = v.productId?.toString();
        if (pid && !variantByProductId.has(pid)) {
            variantByProductId.set(pid, { _id: v._id, price: v.price ?? 0 });
        }
    }
    let discountTypeLabel = '';
    let discountValue = null;
    const discountType = discount.discountedValue;
    if (discount.discountedValue === 'free') {
        discountTypeLabel = 'FREE';
        discountValue = 100;
    }
    else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
        discountTypeLabel = `₹${discount.discountedAmount} OFF`;
        discountValue = discount.discountedAmount;
    }
    else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
        discountTypeLabel = `${discount.discountedPercentage}% OFF`;
        discountValue = discount.discountedPercentage;
    }
    let remainingQty = totalGetsQuantity;
    for (const pid of getsProductIds) {
        if (remainingQty <= 0)
            break;
        const product = productMap.get(pid);
        const variant = variantByProductId.get(pid);
        if (!product || !variant)
            continue;
        const originalPrice = variant.price > 0 ? variant.price : (product.price ?? 0);
        let discountPerItem = 0;
        if (discount.discountedValue === 'free') {
            discountPerItem = originalPrice;
        }
        else if (discount.discountedValue === 'amount' && discount.discountedAmount != null) {
            discountPerItem = Math.min(discount.discountedAmount, originalPrice);
        }
        else if (discount.discountedValue === 'percentage' && discount.discountedPercentage != null) {
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
                productTitle: product.title || 'Product',
                productImage: product.imageUrls?.[0] || null,
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
        const getsCollectionEntries = await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.find({
            storeId,
            discountId: discount._id,
        })
            .select('collectionId')
            .lean();
        const collectionIds = getsCollectionEntries.map((e) => e.collectionId).filter(Boolean);
        if (collectionIds.length > 0) {
            const collections = await models_1.Collections.find({ _id: { $in: collectionIds } })
                .select('title')
                .lean();
            const collectionNames = collections.map((c) => c.title).filter(Boolean);
            const nameText = collectionNames.length === 1
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
        }
        else if (discount.discountedValue === 'amount') {
            discountSummary = `Get ₹${discount.discountedAmount} off on ${totalQty} item${totalQty > 1 ? 's' : ''} (Save ₹${totalDiscountAmount.toFixed(2)})`;
        }
        else if (discount.discountedValue === 'percentage') {
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
exports.checkEligibleBuyXGetYDiscounts = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart(req.body);
    const discounts = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.find({
        storeId,
        status: 'active',
        method: 'automatic',
    }).lean();
    const eligibleDiscounts = [];
    for (const discount of discounts) {
        if (!isWithinActiveDates(discount))
            continue;
        const eligible = await isCustomerEligibleForDiscount(discount, storeId, customerId);
        if (!eligible)
            continue;
        const buysResult = await checkBuysRequirements(discount, storeId, cartItems);
        if (!buysResult.meets)
            continue;
        if (discount.limitTotalUses && discount.totalUsesLimit != null) {
            const totalUses = await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.countDocuments({
                discountId: discount._id,
            });
            if (totalUses >= discount.totalUsesLimit)
                continue;
        }
        if (discount.limitOneUsePerCustomer && customerId) {
            const alreadyUsed = await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.findOne({
                discountId: discount._id,
                customerId,
            });
            if (alreadyUsed)
                continue;
        }
        // Populate gets items from discount config - items customer will receive (need not be in cart)
        const getsResult = await calculateGetsDiscountFromConfig(discount, storeId, buysResult);
        if (getsResult.discountAmount <= 0 || getsResult.getsItems.length === 0)
            continue;
        let message = '';
        if (discount.discountedValue === 'free') {
            message = `Buy qualifying items and get ${discount.customerGetsQuantity} item(s) FREE!`;
        }
        else if (discount.discountedValue === 'amount') {
            message = `Buy qualifying items and get ₹${discount.discountedAmount} off on ${discount.customerGetsQuantity} item(s)!`;
        }
        else if (discount.discountedValue === 'percentage') {
            message = `Buy qualifying items and get ${discount.discountedPercentage}% off on ${discount.customerGetsQuantity} item(s)!`;
        }
        const collectionInfo = discount.customerGetsAnyItemsFrom === 'specific-collections'
            ? await getGetsCollectionInfo(discount._id, storeId)
            : { getsCollectionIds: [], getsCollectionNames: [] };
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
exports.validateBuyXGetYDiscountCode = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const raw = req.body;
    const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart(raw);
    const discountCode = raw.discountCode?.toString().trim();
    if (!discountCode) {
        throw new error_utils_1.CustomError('Discount code is required', 400);
    }
    const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findOne({
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
    const eligible = await isCustomerEligibleForDiscount(discount, storeId, customerId);
    if (!eligible) {
        res.status(200).json({
            success: false,
            message: 'You are not eligible for this discount',
            data: null,
        });
        return;
    }
    const buysResult = await checkBuysRequirements(discount, storeId, cartItems);
    if (!buysResult.meets) {
        let requirementMessage = '';
        if (discount.customerBuys === 'minimum-quantity') {
            requirementMessage = `You need to buy at least ${discount.quantity} qualifying item(s) to use this code`;
        }
        else if (discount.customerBuys === 'minimum-amount') {
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
        const totalUses = await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.countDocuments({
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
        const alreadyUsed = await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.findOne({
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
    const getsResult = await calculateGetsDiscountFromConfig(discount, storeId, buysResult);
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
        const getsCollections = await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.find({
            storeId,
            discountId: discount._id,
        })
            .populate('collectionId', 'title')
            .lean();
        const collectionNames = getsCollections
            .map((e) => e.collectionId?.title)
            .filter(Boolean);
        if (collectionNames.length > 0) {
            const mainName = collectionNames.length === 1
                ? collectionNames[0]
                : `${collectionNames[0]} and others`;
            message = `Code applied! Choose ${getsResult.customerGetsQuantity} item(s) from ${mainName}.`;
        }
    }
    // Fallback / non-collection-specific messaging
    if (!message) {
        if (discount.discountedValue === 'free') {
            message = `Code applied! Get ${getsResult.customerGetsQuantity} item(s) FREE!`;
        }
        else if (discount.discountedValue === 'amount') {
            message = `Code applied! Get ₹${discount.discountedAmount} off on ${getsResult.customerGetsQuantity} item(s)!`;
        }
        else if (discount.discountedValue === 'percentage') {
            message = `Code applied! Get ${discount.discountedPercentage}% off on ${getsResult.customerGetsQuantity} item(s)!`;
        }
    }
    const getsCollectionInfo = discount.customerGetsAnyItemsFrom === 'specific-collections'
        ? await getGetsCollectionInfo(discount._id, storeId)
        : { getsCollectionIds: [], getsCollectionNames: [] };
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
