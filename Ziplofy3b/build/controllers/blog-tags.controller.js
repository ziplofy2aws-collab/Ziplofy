"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogTag = exports.updateBlogTag = exports.searchBlogTags = exports.getBlogTagsByStoreId = exports.createBlogTag = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blog_tags_model_1 = require("../models/blog-tags/blog-tags.model");
const error_utils_1 = require("../utils/error.utils");
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function findDuplicateTagName(storeId, name, excludeId) {
    const query = {
        storeId,
        name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") },
    };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    return blog_tags_model_1.BlogTags.findOne(query).select("_id").lean();
}
exports.createBlogTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    if (!storeId || !name?.trim()) {
        throw new error_utils_1.CustomError("Store ID and tag name are required", 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    const existingTag = await findDuplicateTagName(storeId, name);
    if (existingTag) {
        throw new error_utils_1.CustomError("Tag with this name already exists for this store", 409);
    }
    const tag = await blog_tags_model_1.BlogTags.create({ storeId, name: name.trim() });
    res.status(201).json({
        success: true,
        message: "Blog tag created successfully",
        data: tag,
    });
});
exports.getBlogTagsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    const tags = await blog_tags_model_1.BlogTags.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "Blog tags retrieved successfully",
        data: tags,
        count: tags.length,
    });
});
exports.searchBlogTags = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { q, limit = 10 } = req.query;
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    const searchQuery = typeof q === "string" ? q.trim() : "";
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const filter = { storeId };
    if (searchQuery) {
        filter.name = { $regex: escapeRegex(searchQuery), $options: "i" };
    }
    const tags = await blog_tags_model_1.BlogTags.find(filter).sort({ createdAt: -1 }).limit(limitNum).lean();
    res.status(200).json({
        success: true,
        message: "Blog tags search completed successfully",
        data: tags,
        count: tags.length,
    });
});
exports.updateBlogTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId, name } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Invalid tag ID format", 400);
    }
    const existing = await blog_tags_model_1.BlogTags.findById(id);
    if (!existing) {
        throw new error_utils_1.CustomError("Blog tag not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Invalid store ID format", 400);
        }
        if (String(existing.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog tag does not belong to this store", 403);
        }
    }
    if (name === undefined) {
        throw new error_utils_1.CustomError("Tag name is required", 400);
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new error_utils_1.CustomError("Tag name cannot be empty", 400);
    }
    const duplicate = await findDuplicateTagName(existing.storeId, trimmedName, id);
    if (duplicate) {
        throw new error_utils_1.CustomError("Tag with this name already exists for this store", 409);
    }
    const tag = await blog_tags_model_1.BlogTags.findByIdAndUpdate(id, { name: trimmedName }, { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        message: "Blog tag updated successfully",
        data: tag,
    });
});
exports.deleteBlogTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Invalid tag ID format", 400);
    }
    const tag = await blog_tags_model_1.BlogTags.findById(id);
    if (!tag) {
        throw new error_utils_1.CustomError("Blog tag not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Invalid store ID format", 400);
        }
        if (String(tag.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog tag does not belong to this store", 403);
        }
    }
    await tag.deleteOne();
    res.status(200).json({
        success: true,
        message: "Blog tag deleted successfully",
        data: {
            deletedTag: {
                id: tag._id,
                storeId: tag.storeId,
                name: tag.name,
            },
        },
    });
});
