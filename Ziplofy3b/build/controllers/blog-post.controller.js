"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogPost = exports.updateBlogPost = exports.getBlogPostById = exports.getBlogPostsByStoreId = exports.createBlogPost = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blog_model_1 = require("../models/blog/blog.model");
const blog_post_model_1 = require("../models/blog-post/blog-post.model");
const blog_tags_model_1 = require("../models/blog-tags/blog-tags.model");
const error_utils_1 = require("../utils/error.utils");
const store_menu_link_util_1 = require("../utils/store-menu-link.util");
function normalizeUrlHandle(raw, title) {
    const handle = (raw?.trim() || (0, store_menu_link_util_1.slugifyMenuHandle)(title)).toLowerCase();
    if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
        throw new error_utils_1.CustomError("Valid URL handle is required", 400);
    }
    return handle;
}
function normalizeVisibility(value) {
    if (typeof value === "string" && blog_post_model_1.BLOG_POST_VISIBILITY.includes(value)) {
        return value;
    }
    return "hidden";
}
async function assertBlogBelongsToStore(blogId, storeId) {
    const blog = await blog_model_1.Blog.findById(blogId).select("storeId").lean();
    if (!blog) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    if (String(blog.storeId) !== String(storeId)) {
        throw new error_utils_1.CustomError("Blog does not belong to this store", 403);
    }
}
async function normalizeTagIds(storeId, tagIds) {
    if (!Array.isArray(tagIds))
        return [];
    const uniqueIds = [...new Set(tagIds.map((id) => String(id)).filter(Boolean))];
    if (uniqueIds.length === 0)
        return [];
    const invalid = uniqueIds.filter((id) => !mongoose_1.default.isValidObjectId(id));
    if (invalid.length > 0) {
        throw new error_utils_1.CustomError("One or more tag IDs are invalid", 400);
    }
    const tags = await blog_tags_model_1.BlogTags.find({
        _id: { $in: uniqueIds },
        storeId,
    })
        .select("_id")
        .lean();
    if (tags.length !== uniqueIds.length) {
        throw new error_utils_1.CustomError("One or more tags do not belong to this store", 400);
    }
    return uniqueIds.map((id) => new mongoose_1.default.Types.ObjectId(id));
}
exports.createBlogPost = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, blogId, title, content, excerpt, pageTitle, metaDescription, urlHandle, visibility, author, tagIds, featuredImageUrl, featuredImageKey, featuredImageUploadId, } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (!blogId || !mongoose_1.default.isValidObjectId(blogId)) {
        throw new error_utils_1.CustomError("Valid blogId is required", 400);
    }
    if (!title?.trim()) {
        throw new error_utils_1.CustomError("title is required", 400);
    }
    await assertBlogBelongsToStore(blogId, storeId);
    const trimmedTitle = title.trim();
    const handle = normalizeUrlHandle(urlHandle, trimmedTitle);
    const existing = await blog_post_model_1.BlogPost.findOne({ blogId, urlHandle: handle }).select("_id").lean();
    if (existing) {
        throw new error_utils_1.CustomError("A blog post with this URL handle already exists for this blog", 409);
    }
    const normalizedTagIds = await normalizeTagIds(storeId, tagIds);
    const blogPost = await blog_post_model_1.BlogPost.create({
        storeId,
        blogId,
        title: trimmedTitle,
        content: typeof content === "string" ? content : "",
        excerpt: typeof excerpt === "string" ? excerpt : "",
        pageTitle: (pageTitle?.trim() || trimmedTitle).slice(0, 70),
        metaDescription: typeof metaDescription === "string" ? metaDescription.trim() : "",
        urlHandle: handle,
        visibility: normalizeVisibility(visibility),
        author: typeof author === "string" ? author.trim() : "",
        tagIds: normalizedTagIds,
        featuredImageUrl: typeof featuredImageUrl === "string" ? featuredImageUrl.trim() : "",
        featuredImageKey: typeof featuredImageKey === "string" ? featuredImageKey.trim() : "",
        featuredImageUploadId: typeof featuredImageUploadId === "string" ? featuredImageUploadId.trim() : "",
    });
    res.status(201).json({
        success: true,
        data: blogPost,
        message: "Blog post created successfully",
    });
});
exports.getBlogPostsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { blogId } = req.query;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    const filter = { storeId };
    if (blogId) {
        if (!mongoose_1.default.isValidObjectId(blogId)) {
            throw new error_utils_1.CustomError("Valid blogId is required", 400);
        }
        filter.blogId = blogId;
    }
    const posts = await blog_post_model_1.BlogPost.find(filter).sort({ updatedAt: -1 }).lean();
    res.status(200).json({
        success: true,
        data: posts,
        count: posts.length,
    });
});
exports.getBlogPostById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid blog post id is required", 400);
    }
    const post = await blog_post_model_1.BlogPost.findById(id).lean();
    if (!post) {
        throw new error_utils_1.CustomError("Blog post not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(post.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog post does not belong to this store", 403);
        }
    }
    res.status(200).json({
        success: true,
        data: post,
    });
});
exports.updateBlogPost = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId, blogId, title, content, excerpt, pageTitle, metaDescription, urlHandle, visibility, author, tagIds, featuredImageUrl, featuredImageKey, featuredImageUploadId, } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid blog post id is required", 400);
    }
    const existing = await blog_post_model_1.BlogPost.findById(id);
    if (!existing) {
        throw new error_utils_1.CustomError("Blog post not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(existing.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog post does not belong to this store", 403);
        }
    }
    const updateData = {};
    if (blogId !== undefined) {
        if (!mongoose_1.default.isValidObjectId(blogId)) {
            throw new error_utils_1.CustomError("Valid blogId is required", 400);
        }
        await assertBlogBelongsToStore(blogId, String(existing.storeId));
        updateData.blogId = blogId;
    }
    if (title !== undefined) {
        if (!title?.trim())
            throw new error_utils_1.CustomError("title cannot be empty", 400);
        updateData.title = title.trim();
    }
    if (content !== undefined) {
        updateData.content = typeof content === "string" ? content : "";
    }
    if (excerpt !== undefined) {
        updateData.excerpt = typeof excerpt === "string" ? excerpt : "";
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
    if (visibility !== undefined) {
        updateData.visibility = normalizeVisibility(visibility);
    }
    if (author !== undefined) {
        updateData.author = typeof author === "string" ? author.trim() : "";
    }
    if (tagIds !== undefined) {
        updateData.tagIds = await normalizeTagIds(String(existing.storeId), tagIds);
    }
    if (featuredImageUrl !== undefined) {
        updateData.featuredImageUrl = typeof featuredImageUrl === "string" ? featuredImageUrl.trim() : "";
    }
    if (featuredImageKey !== undefined) {
        updateData.featuredImageKey = typeof featuredImageKey === "string" ? featuredImageKey.trim() : "";
    }
    if (featuredImageUploadId !== undefined) {
        updateData.featuredImageUploadId =
            typeof featuredImageUploadId === "string" ? featuredImageUploadId.trim() : "";
    }
    if (urlHandle !== undefined || title !== undefined) {
        const nextTitle = updateData.title ?? existing.title;
        const nextBlogId = updateData.blogId ?? existing.blogId;
        const handle = normalizeUrlHandle(urlHandle !== undefined ? urlHandle : existing.urlHandle, nextTitle);
        const duplicate = await blog_post_model_1.BlogPost.findOne({
            blogId: nextBlogId,
            urlHandle: handle,
            _id: { $ne: existing._id },
        })
            .select("_id")
            .lean();
        if (duplicate) {
            throw new error_utils_1.CustomError("A blog post with this URL handle already exists for this blog", 409);
        }
        updateData.urlHandle = handle;
    }
    const blogPost = await blog_post_model_1.BlogPost.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: blogPost,
        message: "Blog post updated successfully",
    });
});
exports.deleteBlogPost = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid blog post id is required", 400);
    }
    const post = await blog_post_model_1.BlogPost.findById(id);
    if (!post) {
        throw new error_utils_1.CustomError("Blog post not found", 404);
    }
    if (storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError("Valid storeId is required", 400);
        }
        if (String(post.storeId) !== String(storeId)) {
            throw new error_utils_1.CustomError("Blog post does not belong to this store", 403);
        }
    }
    await post.deleteOne();
    res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: "Blog post deleted successfully",
    });
});
