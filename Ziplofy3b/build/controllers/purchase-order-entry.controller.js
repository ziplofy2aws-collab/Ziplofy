"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntriesByPurchaseOrderId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const purchase_order_entry_model_1 = require("../models/purchase-order-entry/purchase-order-entry.model");
const error_utils_1 = require("../utils/error.utils");
// GET /api/purchase-order-entries/purchase-order/:purchaseOrderId
exports.getEntriesByPurchaseOrderId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { purchaseOrderId } = req.params;
    if (!purchaseOrderId) {
        throw new error_utils_1.CustomError("purchaseOrderId is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(purchaseOrderId)) {
        throw new error_utils_1.CustomError("Invalid purchaseOrderId format", 400);
    }
    const entries = await purchase_order_entry_model_1.PurchaseOrderEntry.find({ purchaseOrderId })
        .populate({
        path: 'variantId',
        select: 'sku optionValues productId',
        populate: { path: 'productId', select: 'title' }
    })
        .sort({ createdAt: 1 });
    res.status(200).json({
        success: true,
        data: entries,
        count: entries.length,
    });
});
