"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlogById = exports.getBlogsByStoreId = exports.createBlog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const blog_model_1 = require("../models/blog/blog.model");
const store_menu_link_util_1 = require("../utils/store-menu-link.util");
function normalizeUrlHandle(raw, title) {
    const handle = (raw?.trim() || (0, store_menu_link_util_1.slugifyMenuHandle)(title)).toLowerCase();
    if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
        throw new error_utils_1.CustomError("Valid URL handle is required", 400);
    }
    return handle;
}
function normalizeCommentsMode(value) {
    if (typeof value === "string" && blog_model_1.BLOG_COMMENTS_MODES.includes(value)) {
        return value;
    }
    return "disabled";
}
exports.createBlog = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, title, pageTitle, metaDescription, urlHandle, comments } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (!title?.trim()) {
        throw new error_utils_1.CustomError("title is required", 400);
    }
    const trimmedTitle = title.trim();
    const handle = normalizeUrlHandle(urlHandle, trimmedTitle);
    const existing = await blog_model_1.Blog.findOne({ storeId, urlHandle: handle }).select("_id").lean();
    if (existing) {
        throw new error_utils_1.CustomError("A blog with this URL handle already exists for this store", 409);
    }
    const blog = await blog_model_1.Blog.create({
        storeId,
        title: trimmedTitle,
        pageTitle: (pageTitle?.trim() || trimmedTitle).slice(0, 70),
        metaDescription: typeof metaDescription === "string" ? metaDescription.trim() : "",
        urlHandle: handle,
        comments: normalizeCommentsMode(comments),
    });
    res.status(201).json({
        success: true,
        data: blog,
        message: "Blog created successfully",
    });
});
exports.getBlogsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    const blogs = await blog_model_1.Blog.find({ storeId }).sort({ updatedAt: -1 }).lean();
    res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
    });
});
exports.getBlogById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid blog id is required", 400);
    }
    const blog = await blog_model_1.Blog.findById(id).lean();
    if (!blog) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(blog.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog does not belong to this store", 403);
        }
    }
    res.status(200).json({
        success: true,
        data: blog,
    });
});
exports.updateBlog = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId, title, pageTitle, metaDescription, urlHandle, comments } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid blog id is required", 400);
    }
    const existing = await blog_model_1.Blog.findById(id);
    if (!existing) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(existing.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog does not belong to this store", 403);
        }
    }
    const updateData = {};
    if (title !== undefined) {
        if (!title?.trim())
            throw new error_utils_1.CustomError("title cannot be empty", 400);
        updateData.title = title.trim();
    }
    if (pageTitle !== undefined) {
        const nextPageTitle = pageTitle?.trim();
        if (!nextPageTitle)
            throw new error_utils_1.CustomError("pageTitle cannot be empty", 400);
        updateData.pageTitle = nextPageTitle.slice(0, 70);
    }
    if (metaDescription !== undefined) {
        updateData.metaDescription = typeof metaDescription === "string" ? metaDescription.trim() : "";
    }
    if (comments !== undefined) {
        updateData.comments = normalizeCommentsMode(comments);
    }
    if (urlHandle !== undefined || title !== undefined) {
        const nextTitle = updateData.title ?? existing.title;
        const handle = normalizeUrlHandle(urlHandle !== undefined ? urlHandle : existing.urlHandle, nextTitle);
        const duplicate = await blog_model_1.Blog.findOne({
            storeId: existing.storeId,
            urlHandle: handle,
            _id: { $ne: existing._id },
        })
            .select("_id")
            .lean();
        if (duplicate) {
            throw new error_utils_1.CustomError("A blog with this URL handle already exists for this store", 409);
        }
        updateData.urlHandle = handle;
    }
    const blog = await blog_model_1.Blog.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: blog,
        message: "Blog updated successfully",
    });
});
exports.deleteBlog = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid blog id is required", 400);
    }
    const blog = await blog_model_1.Blog.findById(id);
    if (!blog) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(blog.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog does not belong to this store", 403);
        }
    }
    await blog.deleteOne();
    res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: "Blog deleted successfully",
    });
});
