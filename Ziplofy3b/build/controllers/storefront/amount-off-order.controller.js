"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAmountOffOrderDiscountCode = exports.checkEligibleAmountOffOrderDiscounts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../../models");
const amount_off_order_discount_usage_model_1 = require("../../models/discount/amount-off-order-discount-model/amount-off-order-discount-usage.model");
const amount_off_order_discount_model_1 = require("../../models/discount/amount-off-order-discount-model/amount-off-order-discount.model");
const amount_off_order_customer_segment_entry_model_1 = require("../../models/discount/amount-off-order-discount-model/amount-off-order-customer-segment-entry.model");
const amount_off_order_customer_entry_model_1 = require("../../models/discount/amount-off-order-discount-model/amount-off-order-customer-entry.model");
const error_utils_1 = require("../../utils/error.utils");
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
// Helpers: date validation (start/end with end-of-day for end date)
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
// Helpers: discount amount calculation (capped at cart total for fixed amount)
// ---------------------------------------------------------------------------
function computeDiscountAmount(discount, cartTotal) {
    if (discount.valueType === 'percentage' && discount.percentage != null) {
        const pct = Math.max(0, Math.min(100, discount.percentage));
        return (cartTotal * pct) / 100;
    }
    if (discount.valueType === 'fixed-amount' && discount.fixedAmount != null && discount.fixedAmount >= 0) {
        return Math.min(discount.fixedAmount, cartTotal);
    }
    return 0;
}
// ---------------------------------------------------------------------------
// Helpers: eligibility (shared for automatic + code validation)
// ---------------------------------------------------------------------------
async function isCustomerEligibleForDiscount(discount, storeId, customerId) {
    if (discount.eligibility === 'all-customers') {
        return true;
    }
    if (!customerId) {
        return false;
    }
    if (discount.eligibility === 'specific-customers') {
        const entry = await amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.findOne({
            storeId,
            discountId: discount._id,
            customerId,
        });
        return !!entry;
    }
    if (discount.eligibility === 'specific-customer-segments') {
        const eligibleEntries = await amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.find({
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
// Amount off order always applies to entire order.
function cartMatchesDiscountTargets() {
    return true;
}
// ---------------------------------------------------------------------------
// POST /check – get eligible automatic amount-off-order discounts for checkout
// ---------------------------------------------------------------------------
exports.checkEligibleAmountOffOrderDiscounts = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart(req.body);
    const discounts = await amount_off_order_discount_model_1.AmountOffOrderDiscount.find({
        storeId,
        status: 'active',
        method: 'automatic',
    }).lean();
    const eligibleDiscounts = [];
    for (const discount of discounts) {
        if (!isWithinActiveDates(discount))
            continue;
        if (!cartMatchesDiscountTargets())
            continue;
        const eligible = await isCustomerEligibleForDiscount(discount, storeId, customerId);
        if (!eligible)
            continue;
        if (discount.minimumPurchase === 'minimum-amount' && discount.minimumAmount != null) {
            if (cartTotal < discount.minimumAmount)
                continue;
        }
        if (discount.minimumPurchase === 'minimum-quantity' && discount.minimumQuantity != null) {
            if (totalQuantity < discount.minimumQuantity)
                continue;
        }
        if (discount.limitTotalUses && discount.totalUsesLimit != null) {
            const totalUses = await amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.countDocuments({
                discountId: discount._id,
            });
            if (totalUses >= discount.totalUsesLimit)
                continue;
        }
        if (discount.limitOneUsePerCustomer && customerId) {
            const alreadyUsed = await amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.findOne({
                discountId: discount._id,
                customerId,
            });
            if (alreadyUsed)
                continue;
        }
        const discountAmount = computeDiscountAmount(discount, cartTotal);
        const message = discount.valueType === 'percentage' && discount.percentage != null
            ? `You are eligible for ${discount.percentage}% off!`
            : `You are eligible for ₹${discount.fixedAmount ?? 0} off!`;
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
exports.validateAmountOffOrderDiscountCode = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const raw = req.body;
    const code = typeof raw.discountCode === 'string' ? raw.discountCode.trim() : '';
    if (!code) {
        throw new error_utils_1.CustomError('Discount code is required', 400);
    }
    const { storeId, customerId, cartItems, cartTotal, totalQuantity } = validateAndParseCart({
        storeId: raw.storeId,
        customerId: raw.customerId,
        cartItems: raw.cartItems,
    });
    const discount = await amount_off_order_discount_model_1.AmountOffOrderDiscount.findOne({
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
        const totalUses = await amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.countDocuments({
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
        const alreadyUsed = await amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.findOne({
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
    const cartMatches = cartMatchesDiscountTargets();
    if (!cartMatches) {
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
    const discountAmount = computeDiscountAmount(discount, cartTotal);
    const message = discount.valueType === 'percentage' && discount.percentage != null
        ? `You are eligible for ${discount.percentage}% off!`
        : `You are eligible for ₹${discount.fixedAmount ?? 0} off!`;
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
