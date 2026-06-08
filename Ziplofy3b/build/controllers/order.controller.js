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
exports.getOrderById = exports.getOrdersByStoreId = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const models_1 = require("../models");
const error_utils_1 = require("../utils/error.utils");
exports.getOrdersByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const orders = await models_1.Order.find({ storeId: new mongoose_1.Types.ObjectId(storeId) })
        .populate([
        { path: 'storeId', select: 'storeName storeCode' },
        { path: 'customerId', select: '-password' },
        { path: 'shippingAddressId' },
        { path: 'billingAddressId' },
    ])
        .sort({ orderDate: -1 })
        .lean();
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await models_1.OrderItem.find({ orderId: order._id })
            .populate({
            path: 'productVariantId',
            select: 'sku optionValues images productId',
            populate: { path: 'productId', select: 'title imageUrls' },
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
exports.getOrderById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError('Valid order ID is required', 400);
    }
    const order = await models_1.Order.findById(id)
        .populate([
        { path: 'storeId', select: 'storeName storeCode' },
        { path: 'customerId', select: '-password' },
        { path: 'shippingAddressId' },
        { path: 'billingAddressId' },
    ])
        .lean();
    if (!order) {
        throw new error_utils_1.CustomError('Order not found', 404);
    }
    const items = await models_1.OrderItem.find({ orderId: order._id })
        .populate({
        path: 'productVariantId',
        select: 'sku optionValues images productId',
        populate: { path: 'productId', select: 'title imageUrls' },
    })
        .lean();
    const orderWithItems = { ...order, items };
    res.status(200).json({
        success: true,
        data: orderWithItems,
    });
});
