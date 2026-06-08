"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.getTagsByStoreId = exports.addTag = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tags_model_1 = require("../models/tags/tags.model");
const error_utils_1 = require("../utils/error.utils");
// Add a new tag
exports.addTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    // Validate required fields
    if (!storeId || !name) {
        throw new error_utils_1.CustomError("Store ID and tag name are required", 400);
    }
    // Validate storeId format
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Check if tag already exists for this store
    const existingTag = await tags_model_1.Tags.findOne({ storeId, name: name.trim() });
    if (existingTag) {
        throw new error_utils_1.CustomError("Tag with this name already exists for this store", 409);
    }
    // Create new tag
    const tag = new tags_model_1.Tags({
        storeId,
        name: name.trim()
    });
    const savedTag = await tag.save();
    res.status(201).json({
        success: true,
        message: "Tag created successfully",
        data: savedTag
    });
});
// Delete a tag
exports.getTagsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    // Validate storeId format
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Get tags for the specific store
    const tags = await tags_model_1.Tags.find({ storeId })
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "Tags retrieved successfully",
        data: tags
    });
});
exports.deleteTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    // Validate tag ID format
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid tag ID format", 400);
    }
    // Find and delete the tag
    const tag = await tags_model_1.Tags.findByIdAndDelete(id);
    if (!tag) {
        throw new error_utils_1.CustomError("Tag not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Tag deleted successfully",
        data: {
            deletedTag: {
                id: tag._id,
                storeId: tag.storeId,
                name: tag.name
            }
        }
    });
});
