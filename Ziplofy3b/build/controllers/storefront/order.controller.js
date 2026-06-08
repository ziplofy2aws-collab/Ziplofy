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
exports.getOrdersByCustomerId = exports.createOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const models_1 = require("../../models");
const free_shipping_discount_model_1 = require("../../models/discount/free-shipping-discount-model/free-shipping-discount.model");
const free_shipping_discount_usage_model_1 = require("../../models/discount/free-shipping-discount-model/free-shipping-discount-usage.model");
const buy_x_get_y_discount_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model");
const buy_x_get_y_discount_usage_model_1 = require("../../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount-usage.model");
const error_utils_1 = require("../../utils/error.utils");
const email_utils_1 = require("../../utils/email.utils");
exports.createOrder = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.storefrontUser;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { storeId, shippingAddressId, billingAddressId, items, paymentMethod, subtotal, tax, shippingCost, total, notes, freeShippingDiscountId, amountOffOrderDiscountId, amountOffProductDiscountId, buyXGetYDiscountId, } = req.body;
    // Validate required fields
    if (!storeId || !mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    if (!shippingAddressId || !mongoose_1.default.Types.ObjectId.isValid(shippingAddressId)) {
        throw new error_utils_1.CustomError('Valid shippingAddressId is required', 400);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new error_utils_1.CustomError('Items array is required and must not be empty', 400);
    }
    if (typeof subtotal !== 'number' || subtotal < 0) {
        throw new error_utils_1.CustomError('Valid subtotal is required', 400);
    }
    if (typeof total !== 'number' || total < 0) {
        throw new error_utils_1.CustomError('Valid total is required', 400);
    }
    // Validate billingAddressId if provided
    if (billingAddressId && !mongoose_1.default.Types.ObjectId.isValid(billingAddressId)) {
        throw new error_utils_1.CustomError('Valid billingAddressId is required', 400);
    }
    // Validate shipping address belongs to customer
    const shippingAddress = await models_1.CustomerAddress.findOne({
        _id: new mongoose_1.Types.ObjectId(shippingAddressId),
        customerId: new mongoose_1.Types.ObjectId(user._id),
    });
    if (!shippingAddress) {
        throw new error_utils_1.CustomError('Shipping address not found or does not belong to customer', 404);
    }
    // Validate billing address if provided
    if (billingAddressId) {
        const billingAddress = await models_1.CustomerAddress.findOne({
            _id: new mongoose_1.Types.ObjectId(billingAddressId),
            customerId: new mongoose_1.Types.ObjectId(user._id),
        });
        if (!billingAddress) {
            throw new error_utils_1.CustomError('Billing address not found or does not belong to customer', 404);
        }
    }
    // Validate items
    for (const item of items) {
        if (!item.productVariantId || !mongoose_1.default.Types.ObjectId.isValid(item.productVariantId)) {
            throw new error_utils_1.CustomError('Valid productVariantId is required for all items', 400);
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
            throw new error_utils_1.CustomError('Valid quantity (>= 1) is required for all items', 400);
        }
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new error_utils_1.CustomError('Valid price is required for all items', 400);
        }
        if (typeof item.total !== 'number' || item.total < 0) {
            throw new error_utils_1.CustomError('Valid total is required for all items', 400);
        }
    }
    // Create order
    const order = await models_1.Order.create({
        storeId: new mongoose_1.Types.ObjectId(storeId),
        customerId: new mongoose_1.Types.ObjectId(user._id),
        shippingAddressId: new mongoose_1.Types.ObjectId(shippingAddressId),
        billingAddressId: billingAddressId ? new mongoose_1.Types.ObjectId(billingAddressId) : undefined,
        paymentMethod: paymentMethod || undefined,
        paymentStatus: 'unpaid',
        subtotal,
        tax: tax || 0,
        shippingCost: shippingCost || 0,
        total,
        notes: notes || undefined,
        status: 'pending',
    });
    // Create order items
    const orderItems = await models_1.OrderItem.insertMany(items.map((item) => ({
        orderId: order._id,
        productVariantId: new mongoose_1.Types.ObjectId(item.productVariantId),
        quantity: item.quantity,
        price: item.price,
        total: item.total,
    })));
    // Create amount-off-product discount usage if such a discount was applied
    if (amountOffProductDiscountId && mongoose_1.default.Types.ObjectId.isValid(amountOffProductDiscountId)) {
        const discountId = new mongoose_1.Types.ObjectId(amountOffProductDiscountId);
        const discount = await models_1.AmountOffProductsDiscount.findOne({
            _id: discountId,
            storeId: new mongoose_1.Types.ObjectId(storeId),
            status: 'active',
        });
        if (discount) {
            let canCreateUsage = true;
            if (discount.limitOneUsePerCustomer) {
                const alreadyUsed = await models_1.AmountOffProductsDiscountUsage.findOne({
                    discountId,
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                });
                if (alreadyUsed)
                    canCreateUsage = false;
            }
            if (canCreateUsage && discount.limitTotalUses && discount.totalUsesLimit) {
                const totalUses = await models_1.AmountOffProductsDiscountUsage.countDocuments({ discountId });
                if (totalUses >= discount.totalUsesLimit)
                    canCreateUsage = false;
            }
            if (canCreateUsage) {
                await models_1.AmountOffProductsDiscountUsage.create({
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                    discountId,
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    orderId: order._id,
                });
            }
        }
    }
    // Create amount-off-order discount usage if such a discount was applied
    if (amountOffOrderDiscountId && mongoose_1.default.Types.ObjectId.isValid(amountOffOrderDiscountId)) {
        const discountId = new mongoose_1.Types.ObjectId(amountOffOrderDiscountId);
        const discount = await models_1.AmountOffOrderDiscount.findOne({
            _id: discountId,
            storeId: new mongoose_1.Types.ObjectId(storeId),
            status: 'active',
        });
        if (discount) {
            let canCreateUsage = true;
            if (discount.limitOneUsePerCustomer) {
                const alreadyUsed = await models_1.AmountOffOrderDiscountUsage.findOne({
                    discountId,
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                });
                if (alreadyUsed)
                    canCreateUsage = false;
            }
            if (canCreateUsage && discount.limitTotalUses && discount.totalUsesLimit) {
                const totalUses = await models_1.AmountOffOrderDiscountUsage.countDocuments({ discountId });
                if (totalUses >= discount.totalUsesLimit)
                    canCreateUsage = false;
            }
            if (canCreateUsage) {
                await models_1.AmountOffOrderDiscountUsage.create({
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                    discountId,
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    orderId: order._id,
                });
            }
        }
    }
    // Create Buy X Get Y discount usage if such a discount was applied
    if (buyXGetYDiscountId && mongoose_1.default.Types.ObjectId.isValid(buyXGetYDiscountId)) {
        const discountId = new mongoose_1.Types.ObjectId(buyXGetYDiscountId);
        const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.findOne({
            _id: discountId,
            storeId: new mongoose_1.Types.ObjectId(storeId),
            status: 'active',
        });
        if (discount) {
            let canCreateUsage = true;
            if (discount.limitOneUsePerCustomer) {
                const alreadyUsed = await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.findOne({
                    discountId,
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                });
                if (alreadyUsed)
                    canCreateUsage = false;
            }
            if (canCreateUsage && discount.limitTotalUses && discount.totalUsesLimit) {
                const totalUses = await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.countDocuments({ discountId });
                if (totalUses >= discount.totalUsesLimit)
                    canCreateUsage = false;
            }
            if (canCreateUsage) {
                await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.create({
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                    discountId,
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    orderId: order._id,
                });
            }
        }
    }
    // Create free shipping discount usage if a free shipping discount was applied
    if (freeShippingDiscountId && mongoose_1.default.Types.ObjectId.isValid(freeShippingDiscountId)) {
        const discountId = new mongoose_1.Types.ObjectId(freeShippingDiscountId);
        const discount = await free_shipping_discount_model_1.FreeShippingDiscount.findOne({
            _id: discountId,
            storeId: new mongoose_1.Types.ObjectId(storeId),
            status: 'active',
        });
        if (discount) {
            let canCreateUsage = true;
            if (discount.limitOneUsePerCustomer) {
                const alreadyUsed = await free_shipping_discount_usage_model_1.FreeShippingDiscountUsage.findOne({
                    discountId,
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                });
                if (alreadyUsed)
                    canCreateUsage = false;
            }
            if (canCreateUsage && discount.limitTotalUses && discount.totalUsesLimit) {
                const totalUses = await free_shipping_discount_usage_model_1.FreeShippingDiscountUsage.countDocuments({ discountId });
                if (totalUses >= discount.totalUsesLimit)
                    canCreateUsage = false;
            }
            if (canCreateUsage) {
                await free_shipping_discount_usage_model_1.FreeShippingDiscountUsage.create({
                    customerId: new mongoose_1.Types.ObjectId(user._id),
                    discountId,
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    orderId: order._id,
                });
            }
        }
    }
    // Populate order with addresses
    await order.populate([
        { path: 'customerId', select: '-password' },
        { path: 'shippingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
        { path: 'billingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
    ]);
    // Populate order items with productVariantId (same as getOrdersByCustomerId)
    const populatedOrderItems = await models_1.OrderItem.populate(orderItems, {
        path: 'productVariantId',
        select: {
            cost: 0,
            profit: 0,
            marginPercent: 0,
            unitPriceTotalAmount: 0,
            unitPriceTotalAmountMetric: 0,
            unitPriceBaseMeasure: 0,
            unitPriceBaseMeasureMetric: 0,
            hsCode: 0,
            isInventoryTrackingEnabled: 0,
        },
    });
    // Send order confirmation email to customer (non-blocking - don't fail order if email fails)
    if (user.email) {
        try {
            const customerName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Customer';
            await (0, email_utils_1.sendEmail)({
                to: user.email,
                subject: 'Order Confirmed - Ziplofy',
                body: (0, email_utils_1.getOrderConfirmationEmailBody)({
                    customerName,
                    orderId: String(order._id),
                    total: order.total,
                }),
            });
        }
        catch (emailErr) {
            console.error('Failed to send order confirmation email:', emailErr);
        }
    }
    res.status(201).json({
        success: true,
        data: {
            ...order.toObject(),
            items: populatedOrderItems,
        },
        message: 'Order created successfully',
    });
});
exports.getOrdersByCustomerId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.storefrontUser;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { customerId } = req.params;
    if (!customerId || !mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new error_utils_1.CustomError('Valid customerId is required', 400);
    }
    // Ensure customer can only access their own orders
    if (String(user._id) !== String(customerId)) {
        throw new error_utils_1.CustomError('Forbidden', 403);
    }
    const orders = await models_1.Order.find({ customerId: new mongoose_1.Types.ObjectId(customerId) })
        .populate([
        { path: 'customerId', select: '-password' },
        { path: 'shippingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
        { path: 'billingAddressId', populate: { path: 'countryId', select: 'name iso2' } },
    ])
        .sort({ orderDate: -1 })
        .lean();
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await models_1.OrderItem.find({ orderId: order._id })
            .populate('productVariantId', {
            cost: 0,
            profit: 0,
            marginPercent: 0,
            unitPriceTotalAmount: 0,
            unitPriceTotalAmountMetric: 0,
            unitPriceBaseMeasure: 0,
            unitPriceBaseMeasureMetric: 0,
            hsCode: 0,
            isInventoryTrackingEnabled: 0,
        })
            .lean();
        return {
            ...order,
            items,
        };
    }));
    res.status(200).json({
        success: true,
        data: ordersWithItems,
        count: ordersWithItems.length,
    });
});
