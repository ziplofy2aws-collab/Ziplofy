"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductTagsByStoreId = exports.deleteProductTag = exports.createProductTag = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_tags_model_1 = require("../models/product-tags/product-tags.model");
const error_utils_1 = require("../utils/error.utils");
// Create a new product tag
exports.createProductTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    if (!storeId || !name) {
        throw new error_utils_1.CustomError("Store ID and tag name are required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Check for duplicate tag name within the same store (case-insensitive)
    const existingTag = await product_tags_model_1.ProductTags.findOne({
        storeId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    if (existingTag) {
        throw new error_utils_1.CustomError("Tag with this name already exists for this store", 409);
    }
    const tag = new product_tags_model_1.ProductTags({ storeId, name: name.trim() });
    const savedTag = await tag.save();
    res.status(201).json({
        success: true,
        message: "Product tag created successfully",
        data: savedTag,
    });
});
// Delete a product tag by ID
exports.deleteProductTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid tag ID format", 400);
    }
    const tag = await product_tags_model_1.ProductTags.findByIdAndDelete(id);
    if (!tag) {
        throw new error_utils_1.CustomError("Product tag not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Product tag deleted successfully",
        data: {
            deletedTag: {
                id: tag._id,
                storeId: tag.storeId,
                name: tag.name,
            }
        }
    });
});
// Get product tags by store ID
exports.getProductTagsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    const tags = await product_tags_model_1.ProductTags.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "Product tags retrieved successfully",
        data: tags,
        count: tags.length,
    });
});
