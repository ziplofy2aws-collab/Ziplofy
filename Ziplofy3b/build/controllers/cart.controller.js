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
exports.getStoreUserCarts = exports.getCustomerCartEntries = exports.deleteCartEntry = exports.updateCartEntry = exports.createCartEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const models_1 = require("../models");
const error_utils_1 = require("../utils/error.utils");
const automation_flow_model_1 = require("../models/automation/automation-flow.model");
const action_model_1 = require("../models/action/action.model");
const email_queue_1 = require("../services/bull-mq/queues/email.queue");
exports.createCartEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.storefrontUser;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { storeId, productVariantId, quantity = 0 } = req.body;
    if (!storeId || !mongoose_1.default.Types.ObjectId.isValid(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    // Check if an active automation exists for this store with trigger ADD_TO_CART
    const automationExists = await models_1.AutomationFlow.findOne({
        storeId: String(storeId),
        triggerKey: automation_flow_model_1.TriggerKey.ADD_TO_CART,
        isActive: true,
    });
    if (automationExists) {
        const conditions = automationExists.flowData?.mainData?.conditions || [];
        if (conditions.length > 0) {
            console.log('it is having conditions');
            const firstCondition = conditions[0];
            if (firstCondition?.variable === 'cart.quantity' && firstCondition?.operator === 'greater_than_or_equal') {
                const value = Number(firstCondition.value);
                if (quantity >= value) {
                    console.log('the quantity is greater than or equal to the value');
                    if (automationExists.flowData?.mainData?.action?.actionType === action_model_1.ActionType.SEND_EMAIL) {
                        const to = user.email;
                        if (to) {
                            await (0, email_queue_1.enqueueEmailAddress)(to, 'Ziplofy: Cart threshold reached', `<p>Hi, you added ${quantity} item(s) to cart.</p>`);
                        }
                    }
                }
                else {
                    console.log('the quantity is less than the value');
                }
            }
        }
        else {
            if (automationExists.flowData?.mainData?.action?.actionType === action_model_1.ActionType.SEND_EMAIL) {
                const to = user?.email;
                if (to) {
                    await (0, email_queue_1.enqueueEmailAddress)(to, 'Ziplofy: Item added to cart', `<p>Hi, you added an item to your cart.</p>`);
                }
            }
        }
    }
    else {
        console.log('it is not having automation');
    }
    if (!productVariantId || !mongoose_1.default.Types.ObjectId.isValid(productVariantId))
        throw new error_utils_1.CustomError('Valid productVariantId is required', 400);
    const qty = Number(quantity ?? 1);
    if (!Number.isFinite(qty) || qty < 1)
        throw new error_utils_1.CustomError('quantity must be >= 1', 400);
    const doc = await models_1.Cart.findOneAndUpdate({ customerId: new mongoose_1.Types.ObjectId(user._id), productVariantId: new mongoose_1.Types.ObjectId(productVariantId) }, { $set: { storeId: new mongoose_1.Types.ObjectId(storeId), quantity: qty } }, { new: true, upsert: true });
    if (doc) {
        await doc.populate({
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
    }
    res.status(201).json({ success: true, data: doc });
});
exports.updateCartEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.storefrontUser;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { id } = req.params;
    const { quantity } = req.body;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
        throw new error_utils_1.CustomError('Valid cart id is required', 400);
    const qty = Number(quantity ?? 1);
    if (!Number.isFinite(qty) || qty < 1)
        throw new error_utils_1.CustomError('quantity must be >= 1', 400);
    const updated = await models_1.Cart.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(id), customerId: new mongoose_1.Types.ObjectId(user._id) }, { $set: { quantity: qty } }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Cart entry not found', 404);
    await updated.populate({
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
    res.status(200).json({ success: true, data: updated });
});
exports.deleteCartEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.storefrontUser;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
        throw new error_utils_1.CustomError('Valid cart id is required', 400);
    const deleted = await models_1.Cart.findOneAndDelete({ _id: new mongoose_1.Types.ObjectId(id), customerId: new mongoose_1.Types.ObjectId(user._id) });
    if (!deleted)
        throw new error_utils_1.CustomError('Cart entry not found', 404);
    res.status(200).json({ success: true, data: deleted });
});
exports.getCustomerCartEntries = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.storefrontUser;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { customerId } = req.params;
    if (!customerId || !mongoose_1.default.Types.ObjectId.isValid(customerId))
        throw new error_utils_1.CustomError('Valid customerId is required', 400);
    if (String(user._id) !== String(customerId))
        throw new error_utils_1.CustomError('Forbidden', 403);
    const items = await models_1.Cart.find({ customerId: new mongoose_1.Types.ObjectId(customerId) })
        .populate({
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
    })
        .sort({ createdAt: -1 })
        .lean();
    res.status(200).json({ success: true, data: items, count: items.length });
});
exports.getStoreUserCarts = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const user = req.user;
    if (!user)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    // Get all cart entries for this store
    const cartEntries = await models_1.Cart.find({ storeId: new mongoose_1.Types.ObjectId(storeId) })
        .populate({
        path: 'customerId',
        select: 'firstName lastName email phoneNumber',
    })
        .populate({
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
    })
        .sort({ customerId: 1, createdAt: -1 })
        .lean();
    // Group cart entries by customer
    const customerCarts = {};
    cartEntries.forEach((entry) => {
        const customerId = entry.customerId._id.toString();
        if (!customerCarts[customerId]) {
            customerCarts[customerId] = {
                customer: {
                    _id: entry.customerId._id,
                    firstName: entry.customerId.firstName,
                    lastName: entry.customerId.lastName,
                    email: entry.customerId.email,
                    phoneNumber: entry.customerId.phoneNumber,
                },
                cartItems: [],
                totalItems: 0,
                lastUpdated: entry.updatedAt,
            };
        }
        customerCarts[customerId].cartItems.push({
            _id: entry._id,
            productVariant: entry.productVariantId,
            quantity: entry.quantity,
            addedAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        });
        customerCarts[customerId].totalItems += entry.quantity;
        // Update last updated time if this entry is newer
        if (new Date(entry.updatedAt) > new Date(customerCarts[customerId].lastUpdated)) {
            customerCarts[customerId].lastUpdated = entry.updatedAt;
        }
    });
    // Convert to array and sort by last updated
    const result = Object.values(customerCarts).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    res.status(200).json({
        success: true,
        data: result,
        count: result.length,
        storeId: storeId
    });
});
