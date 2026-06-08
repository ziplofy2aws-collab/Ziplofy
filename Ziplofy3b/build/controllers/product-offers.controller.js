"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuyXGetYOffersForProduct = exports.getAmountOffProductsOffersForProduct = exports.getAmountOffOrderOffersForProduct = exports.getFreeShippingOffersForProduct = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const models_1 = require("../models");
const error_utils_1 = require("../utils/error.utils");
// Helper: check if a discount is currently within its active date range
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
// GET /api/product-offers/free-shipping/product/:id
// Return free-shipping related offers for a given product (by its ID).
exports.getFreeShippingOffersForProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { customerId } = req.query;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid product ID is required', 400);
    }
    const product = await models_1.Product.findById(id).select('storeId price status').lean();
    if (!product) {
        throw new error_utils_1.CustomError('Product not found', 404);
    }
    const storeId = product.storeId;
    const customerObjectId = customerId && mongoose_1.default.isValidObjectId(customerId) ? new mongoose_1.Types.ObjectId(customerId) : null;
    // Consider all active free-shipping discounts for this product's store as potential offers.
    // We will then filter them by active date and customer eligibility.
    const discountsRaw = await models_1.FreeShippingDiscount.find({
        storeId,
        status: 'active',
    }).lean();
    const now = new Date();
    const freeShippingOffers = [];
    for (const raw of discountsRaw) {
        // 1) Date window – skip if not yet started or already ended
        if (!isWithinActiveDates(raw))
            continue;
        // 2) Customer eligibility
        let eligibleForCustomer = false;
        if (raw.eligibility === 'all-customers') {
            eligibleForCustomer = true;
        }
        else if (raw.eligibility === 'specific-customer-segments') {
            if (!customerObjectId)
                continue;
            const eligibleSegments = await models_1.FreeShippingCustomerSegmentEntry.find({
                storeId,
                discountId: raw._id,
            })
                .select('customerSegmentId')
                .lean();
            if (eligibleSegments.length > 0) {
                const customerSegmentEntries = await models_1.CustomerSegmentEntry.find({
                    customerId: customerObjectId,
                })
                    .select('segmentId')
                    .lean();
                const customerSegmentIds = customerSegmentEntries.map((e) => e.segmentId?.toString()).filter(Boolean);
                const eligibleSegmentIds = eligibleSegments
                    .map((e) => e.customerSegmentId?.toString())
                    .filter(Boolean);
                const hasMatchingSegment = customerSegmentIds.some((cid) => eligibleSegmentIds.includes(cid));
                if (hasMatchingSegment) {
                    eligibleForCustomer = true;
                }
            }
        }
        else if (raw.eligibility === 'specific-customers') {
            if (!customerObjectId)
                continue;
            const customerEntry = await models_1.FreeShippingCustomerEntry.findOne({
                storeId,
                discountId: raw._id,
                customerId: customerObjectId,
            }).lean();
            if (customerEntry) {
                eligibleForCustomer = true;
            }
        }
        if (!eligibleForCustomer)
            continue;
        // 3) Minimum purchase requirements – we always include the discount,
        // but provide a message if there is a threshold.
        let minimumRequirementMessage = null;
        if (raw.minimumPurchase === 'minimum-amount' && raw.minimumAmount != null) {
            minimumRequirementMessage = `Can apply on minimum order value of ₹${raw.minimumAmount}`;
        }
        else if (raw.minimumPurchase === 'minimum-quantity' && raw.minimumQuantity != null) {
            minimumRequirementMessage = `Can apply when you buy at least ${raw.minimumQuantity} item(s)`;
        }
        // 4) End date information – so UI can show \"ending in X\"
        let hasEndDate = false;
        let endsAtIso;
        let endsInMs;
        let endsInText;
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
                }
                else {
                    const totalHours = Math.round(totalMinutes / 60);
                    if (totalHours < 24) {
                        endsInText = `Ends in ${totalHours} hour(s)`;
                    }
                    else {
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
exports.getAmountOffOrderOffersForProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { customerId } = req.query;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid product ID is required', 400);
    }
    const product = await models_1.Product.findById(id).select('storeId').lean();
    if (!product) {
        throw new error_utils_1.CustomError('Product not found', 404);
    }
    const storeId = product.storeId;
    const customerIdStr = customerId && mongoose_1.default.isValidObjectId(customerId) ? customerId : null;
    const discountsRaw = await models_1.AmountOffOrderDiscount.find({
        storeId,
        status: 'active',
    }).lean();
    const now = new Date();
    const amountOffOrderOffers = [];
    for (const raw of discountsRaw) {
        // 1) Date window – skip if not yet started or already ended
        if (!isWithinActiveDates(raw))
            continue;
        // 2) Customer eligibility
        let eligibleForCustomer = false;
        if (raw.eligibility === 'all-customers') {
            eligibleForCustomer = true;
        }
        else if (raw.eligibility === 'specific-customers') {
            if (!customerIdStr)
                continue;
            const entry = await models_1.AmountOffOrderCustomerEntry.findOne({
                storeId,
                discountId: raw._id,
                customerId: customerIdStr,
            }).lean();
            if (entry) {
                eligibleForCustomer = true;
            }
        }
        else if (raw.eligibility === 'specific-customer-segments') {
            if (!customerIdStr)
                continue;
            const eligibleEntries = await models_1.AmountOffOrderCustomerSegmentEntry.find({
                storeId,
                discountId: raw._id,
            })
                .select('customerSegmentId')
                .lean();
            if (eligibleEntries.length > 0) {
                const eligibleSegmentIds = eligibleEntries
                    .map((e) => e.customerSegmentId?.toString())
                    .filter(Boolean);
                if (eligibleSegmentIds.length > 0) {
                    const customerEntries = await models_1.CustomerSegmentEntry.find({ customerId: customerIdStr })
                        .select('segmentId')
                        .lean();
                    const customerSegmentIds = customerEntries
                        .map((e) => e.segmentId?.toString())
                        .filter(Boolean);
                    const hasMatchingSegment = customerSegmentIds.some((cid) => eligibleSegmentIds.includes(cid));
                    if (hasMatchingSegment) {
                        eligibleForCustomer = true;
                    }
                }
            }
        }
        if (!eligibleForCustomer)
            continue;
        // 3) Minimum purchase requirements messaging
        let minimumRequirementMessage = null;
        if (raw.minimumPurchase === 'minimum-amount' && raw.minimumAmount != null) {
            minimumRequirementMessage = `Can apply on minimum order value of ₹${raw.minimumAmount}`;
        }
        else if (raw.minimumPurchase === 'minimum-quantity' && raw.minimumQuantity != null) {
            minimumRequirementMessage = `Can apply when you buy at least ${raw.minimumQuantity} item(s)`;
        }
        // 4) End date information – so UI can show \"ending in X\"
        let hasEndDate = false;
        let endsAtIso;
        let endsInMs;
        let endsInText;
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
                }
                else {
                    const totalHours = Math.round(totalMinutes / 60);
                    if (totalHours < 24) {
                        endsInText = `Ends in ${totalHours} hour(s)`;
                    }
                    else {
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
        }
        else if (raw.valueType === 'fixed-amount' && raw.fixedAmount != null) {
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
exports.getAmountOffProductsOffersForProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { customerId } = req.query;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid product ID is required', 400);
    }
    const product = await models_1.Product.findById(id).select('_id storeId').lean();
    if (!product) {
        throw new error_utils_1.CustomError('Product not found', 404);
    }
    const storeId = product.storeId;
    const customerIdStr = customerId && mongoose_1.default.isValidObjectId(customerId) ? customerId : null;
    const productObjectId = new mongoose_1.Types.ObjectId(id);
    // Collections that this product belongs to (for appliesTo: specific-collections)
    const collectionEntries = await models_1.CollectionEntry.find({ productId: productObjectId })
        .select('collectionId')
        .lean();
    const productCollectionIds = collectionEntries
        .map((e) => e.collectionId?.toString())
        .filter(Boolean);
    const discountsRaw = await models_1.AmountOffProductsDiscount.find({
        storeId,
        status: 'active',
    }).lean();
    const now = new Date();
    const amountOffProductsOffers = [];
    for (const raw of discountsRaw) {
        // 1) Date window
        if (!isWithinActiveDates(raw))
            continue;
        // 2) Targeting: does this discount apply to this product (directly or via its collections)?
        const entries = await models_1.AmountOffProductsEntry.find({
            storeId,
            discountId: raw._id,
        })
            .select('productId collectionId')
            .lean();
        let appliesToProduct = false;
        if (raw.appliesTo === 'specific-products') {
            appliesToProduct = entries.some((e) => e.productId && e.productId.toString() === id);
        }
        else if (raw.appliesTo === 'specific-collections' && productCollectionIds.length > 0) {
            const discountCollectionIds = entries
                .map((e) => e.collectionId?.toString())
                .filter(Boolean);
            appliesToProduct = discountCollectionIds.some((cid) => productCollectionIds.includes(cid));
        }
        if (!appliesToProduct)
            continue;
        // 3) Customer eligibility
        let eligibleForCustomer = false;
        if (raw.eligibility === 'all-customers') {
            eligibleForCustomer = true;
        }
        else if (raw.eligibility === 'specific-customers') {
            if (!customerIdStr)
                continue;
            const entry = await models_1.AmountOffProductsCustomerEntry.findOne({
                storeId,
                discountId: raw._id,
                customerId: customerIdStr,
            }).lean();
            if (entry) {
                eligibleForCustomer = true;
            }
        }
        else if (raw.eligibility === 'specific-customer-segments') {
            if (!customerIdStr)
                continue;
            const eligibleEntries = await models_1.AmountOffProductsCustomerSegmentEntry.find({
                storeId,
                discountId: raw._id,
            })
                .select('customerSegmentId')
                .lean();
            if (eligibleEntries.length > 0) {
                const eligibleSegmentIds = eligibleEntries
                    .map((e) => e.customerSegmentId?.toString())
                    .filter(Boolean);
                if (eligibleSegmentIds.length > 0) {
                    const customerSegments = await models_1.CustomerSegmentEntry.find({ customerId: customerIdStr })
                        .select('segmentId')
                        .lean();
                    const customerSegmentIds = customerSegments
                        .map((e) => e.segmentId?.toString())
                        .filter(Boolean);
                    const hasOverlap = customerSegmentIds.some((sid) => eligibleSegmentIds.includes(sid));
                    if (hasOverlap) {
                        eligibleForCustomer = true;
                    }
                }
            }
        }
        if (!eligibleForCustomer)
            continue;
        // 4) Minimum purchase messaging
        let minimumRequirementMessage = null;
        if (raw.minimumPurchase === 'minimum-amount' && raw.minimumAmount != null) {
            minimumRequirementMessage = `Can apply on minimum order value of ₹${raw.minimumAmount}`;
        }
        else if (raw.minimumPurchase === 'minimum-quantity' && raw.minimumQuantity != null) {
            minimumRequirementMessage = `Can apply when you buy at least ${raw.minimumQuantity} item(s)`;
        }
        // 5) End date / timer
        let hasEndDate = false;
        let endsAtIso;
        let endsInMs;
        let endsInText;
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
                }
                else {
                    const totalHours = Math.round(totalMinutes / 60);
                    if (totalHours < 24) {
                        endsInText = `Ends in ${totalHours} hour(s)`;
                    }
                    else {
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
        }
        else if (raw.valueType === 'fixed-amount' && raw.fixedAmount != null) {
            valueDescription = `Get ₹${raw.fixedAmount} off selected products`;
        }
        amountOffProductsOffers.push({
            id: raw._id,
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
exports.getBuyXGetYOffersForProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { customerId } = req.query;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid product ID is required', 400);
    }
    const product = await models_1.Product.findById(id).select('_id storeId').lean();
    if (!product) {
        throw new error_utils_1.CustomError('Product not found', 404);
    }
    const storeId = product.storeId;
    const productObjectId = new mongoose_1.Types.ObjectId(id);
    const customerIdStr = customerId && mongoose_1.default.isValidObjectId(customerId) ? customerId : null;
    const discountsRaw = await models_1.BuyXGetYDiscount.find({
        storeId,
        status: 'active',
    }).lean();
    const discountIds = discountsRaw
        .map((d) => d._id)
        .filter(Boolean);
    // All discounts where this product is explicitly in the "buys" products list
    const buysProductEntries = await models_1.BuyXGetYBuysProductEntry.find({
        storeId,
        productId: productObjectId,
        discountId: { $in: discountIds },
    })
        .select('discountId')
        .lean();
    const productBuysDiscountIds = new Set(buysProductEntries.map((e) => e.discountId?.toString()).filter(Boolean));
    const now = new Date();
    const buyXGetYOffers = [];
    for (const raw of discountsRaw) {
        const discountId = raw._id;
        if (!discountId)
            continue;
        // 1) Date window – skip if not yet started or already ended
        if (!isWithinActiveDates(raw))
            continue;
        // 2) Does this product participate in the "buys" side for this discount?
        // We only consider discounts where the current product is explicitly selected
        // in the buys product list. Buys-from-collection is ignored for this endpoint.
        const discountIdStr = discountId.toString();
        let appliesViaBuys = false;
        if (raw.anyItemsFrom === 'specific-products') {
            appliesViaBuys = productBuysDiscountIds.has(discountIdStr);
        }
        if (!appliesViaBuys)
            continue;
        // 3) Customer eligibility
        let eligibleForCustomer = false;
        if (raw.eligibility === 'all-customers') {
            eligibleForCustomer = true;
        }
        else if (raw.eligibility === 'specific-customers') {
            if (!customerIdStr)
                continue;
            const entry = await models_1.BuyXGetYCustomerEntry.findOne({
                storeId,
                discountId,
                customerId: customerIdStr,
            }).lean();
            if (entry) {
                eligibleForCustomer = true;
            }
        }
        else if (raw.eligibility === 'specific-customer-segments') {
            if (!customerIdStr)
                continue;
            const eligibleEntries = await models_1.BuyXGetYCustomerSegmentEntry.find({
                storeId,
                discountId,
            })
                .select('customerSegmentId')
                .lean();
            if (eligibleEntries.length > 0) {
                const eligibleSegmentIds = eligibleEntries
                    .map((e) => e.customerSegmentId?.toString())
                    .filter(Boolean);
                if (eligibleSegmentIds.length > 0) {
                    const customerSegments = await models_1.CustomerSegmentEntry.find({ customerId: customerIdStr })
                        .select('segmentId')
                        .lean();
                    const customerSegmentIds = customerSegments
                        .map((e) => e.segmentId?.toString())
                        .filter(Boolean);
                    const hasOverlap = customerSegmentIds.some((sid) => eligibleSegmentIds.includes(sid));
                    if (hasOverlap) {
                        eligibleForCustomer = true;
                    }
                }
            }
        }
        if (!eligibleForCustomer)
            continue;
        // 4) Buys-side requirement message
        let buysRequirementMessage = null;
        if (raw.customerBuys === 'minimum-quantity' && raw.quantity != null) {
            buysRequirementMessage = `Buy at least ${raw.quantity} unit(s) of this product to unlock this offer`;
        }
        else if (raw.customerBuys === 'minimum-amount' && raw.amount != null) {
            buysRequirementMessage = `Spend at least ₹${raw.amount} on this product to unlock this offer`;
        }
        // 5) End date / timer
        let hasEndDate = false;
        let endsAtIso;
        let endsInMs;
        let endsInText;
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
                }
                else {
                    const totalHours = Math.round(totalMinutes / 60);
                    if (totalHours < 24) {
                        endsInText = `Ends in ${totalHours} hour(s)`;
                    }
                    else {
                        const totalDays = Math.round(totalHours / 24);
                        endsInText = `Ends in ${totalDays} day(s)`;
                    }
                }
            }
        }
        // 6) Message for the "gets" side – populate products/collections when possible
        let getsMessage = 'Buy X Get Y offer';
        let getsProductTitles = [];
        let getsCollectionNames = [];
        if (raw.customerGetsAnyItemsFrom === 'specific-products') {
            const getsProductEntries = await models_1.BuyXGetYGetsProductEntry.find({
                storeId,
                discountId,
            })
                .select('productId')
                .lean();
            const getsProductIds = getsProductEntries
                .map((e) => e.productId?.toString())
                .filter(Boolean);
            if (getsProductIds.length > 0) {
                const products = await models_1.Product.find({
                    _id: { $in: getsProductIds.map((pid) => new mongoose_1.default.Types.ObjectId(pid)) },
                })
                    .select('title')
                    .lean();
                getsProductTitles = products.map((p) => p.title).filter(Boolean);
            }
        }
        else if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
            const getsCollectionEntries = await models_1.BuyXGetYGetsCollectionEntry.find({
                storeId,
                discountId,
            })
                .select('collectionId')
                .lean();
            const getsCollectionIds = getsCollectionEntries
                .map((e) => e.collectionId?.toString())
                .filter(Boolean);
            if (getsCollectionIds.length > 0) {
                const collections = await models_1.Collections.find({
                    _id: { $in: getsCollectionIds.map((cid) => new mongoose_1.default.Types.ObjectId(cid)) },
                })
                    .select('title')
                    .lean();
                getsCollectionNames = collections.map((c) => c.title).filter(Boolean);
            }
        }
        const productsListText = getsProductTitles.length > 0 ? getsProductTitles.join(', ') : 'selected products';
        const collectionsListText = getsCollectionNames.length > 0 ? getsCollectionNames.join(', ') : 'selected collections';
        if (raw.discountedValue === 'free') {
            if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
                getsMessage = `Get ${raw.customerGetsQuantity} item(s) FREE from ${collectionsListText}`;
            }
            else {
                getsMessage = `Get ${raw.customerGetsQuantity} item(s) FREE: ${productsListText}`;
            }
        }
        else if (raw.discountedValue === 'amount' && raw.discountedAmount != null) {
            if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
                getsMessage = `Get ₹${raw.discountedAmount} off on ${raw.customerGetsQuantity} item(s) from ${collectionsListText}`;
            }
            else {
                getsMessage = `Get ₹${raw.discountedAmount} off on ${raw.customerGetsQuantity} item(s): ${productsListText}`;
            }
        }
        else if (raw.discountedValue === 'percentage' && raw.discountedPercentage != null) {
            if (raw.customerGetsAnyItemsFrom === 'specific-collections') {
                getsMessage = `Get ${raw.discountedPercentage}% off on ${raw.customerGetsQuantity} item(s) from ${collectionsListText}`;
            }
            else {
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
