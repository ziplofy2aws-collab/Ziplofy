"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePurchaseOrderTag = exports.getPurchaseOrderTagsByStoreId = exports.createPurchaseOrderTag = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const purchase_order_tag_model_1 = require("../models/purchase-order-tags/purchase-order-tag.model");
const error_utils_1 = require("../utils/error.utils");
// Create a new purchase order tag
exports.createPurchaseOrderTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    // Validate required fields
    if (!storeId || !name) {
        throw new error_utils_1.CustomError("Store ID and name are required", 400);
    }
    // Check if tag already exists for this store
    const existingTag = await purchase_order_tag_model_1.PurchaseOrderTag.findOne({
        storeId,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingTag) {
        throw new error_utils_1.CustomError("A tag with this name already exists for this store", 400);
    }
    // Create the tag
    const tag = await purchase_order_tag_model_1.PurchaseOrderTag.create({
        storeId,
        name: name.trim(),
    });
    res.status(201).json({
        success: true,
        message: "Purchase order tag created successfully",
        data: tag,
    });
});
// Get all purchase order tags by store ID
exports.getPurchaseOrderTagsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    // Get tags
    const tags = await purchase_order_tag_model_1.PurchaseOrderTag.find({ storeId })
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "Purchase order tags retrieved successfully",
        data: tags,
    });
});
// Delete a purchase order tag by ID
exports.deletePurchaseOrderTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid tag ID format", 400);
    }
    const tag = await purchase_order_tag_model_1.PurchaseOrderTag.findByIdAndDelete(id);
    if (!tag) {
        throw new error_utils_1.CustomError("Purchase order tag not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Purchase order tag deleted successfully",
        data: {
            deletedTag: {
                id: tag._id,
                storeId: tag.storeId,
                name: tag.name,
            }
        }
    });
});
