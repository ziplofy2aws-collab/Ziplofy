"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorefrontBlogComment = exports.getPublishedCommentsForArticle = exports.deleteBlogComment = exports.updateBlogComment = exports.createBlogComment = exports.getBlogCommentsByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blog_model_1 = require("../models/blog/blog.model");
const blog_post_model_1 = require("../models/blog-post/blog-post.model");
const blog_comment_model_1 = require("../models/blog-comment/blog-comment.model");
const error_utils_1 = require("../utils/error.utils");
function assertValidObjectId(value, label) {
    if (!value || !mongoose_1.default.isValidObjectId(value)) {
        throw new error_utils_1.CustomError(`Valid ${label} is required`, 400);
    }
}
function normalizeStatus(value) {
    if (typeof value === "string" && blog_comment_model_1.BLOG_COMMENT_STATUS.includes(value)) {
        return value;
    }
    throw new error_utils_1.CustomError("Invalid comment status", 400);
}
function trimFields(body) {
    return {
        name: typeof body.name === "string" ? body.name.trim() : "",
        email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
        message: typeof body.message === "string" ? body.message.trim() : "",
    };
}
async function assertArticleBelongsToStore(articleId, storeId) {
    const post = await blog_post_model_1.BlogPost.findById(articleId).select("storeId blogId visibility").lean();
    if (!post) {
        throw new error_utils_1.CustomError("Blog post not found", 404);
    }
    if (String(post.storeId) !== String(storeId)) {
        throw new error_utils_1.CustomError("Blog post does not belong to this store", 403);
    }
    return post;
}
async function findCommentForStore(commentId, storeId) {
    if (!mongoose_1.default.isValidObjectId(commentId)) {
        throw new error_utils_1.CustomError("Invalid comment ID", 400);
    }
    const comment = await blog_comment_model_1.BlogComment.findById(commentId).lean();
    if (!comment) {
        throw new error_utils_1.CustomError("Comment not found", 404);
    }
    if (storeId && String(comment.storeId) !== String(storeId)) {
        throw new error_utils_1.CustomError("Comment does not belong to this store", 403);
    }
    return comment;
}
/** Admin: list comments for a store (optional articleId filter). */
exports.getBlogCommentsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { articleId, status } = req.query;
    assertValidObjectId(storeId, "storeId");
    const filter = { storeId };
    if (articleId?.trim()) {
        assertValidObjectId(articleId, "articleId");
        filter.articleId = articleId;
    }
    if (status?.trim()) {
        filter.status = normalizeStatus(status);
    }
    const comments = await blog_comment_model_1.BlogComment.find(filter)
        .sort({ createdAt: -1 })
        .populate({ path: "articleId", select: "title urlHandle blogId" })
        .lean();
    res.status(200).json({
        success: true,
        data: comments,
        count: comments.length,
    });
});
/** Admin: create a comment. */
exports.createBlogComment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, articleId, status } = req.body;
    const { name, email, message } = trimFields(req.body);
    assertValidObjectId(String(storeId), "storeId");
    assertValidObjectId(String(articleId), "articleId");
    if (!name)
        throw new error_utils_1.CustomError("Name is required", 400);
    if (!email)
        throw new error_utils_1.CustomError("Email is required", 400);
    if (!message)
        throw new error_utils_1.CustomError("Message is required", 400);
    await assertArticleBelongsToStore(String(articleId), String(storeId));
    const comment = await blog_comment_model_1.BlogComment.create({
        storeId,
        articleId,
        name,
        email,
        message,
        status: status ? normalizeStatus(status) : "published",
    });
    res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: comment,
    });
});
/** Admin: update a comment. */
exports.updateBlogComment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId, status } = req.body;
    const { name, email, message } = trimFields(req.body);
    await findCommentForStore(id, storeId ? String(storeId) : undefined);
    const updateData = {};
    if (name)
        updateData.name = name;
    if (email)
        updateData.email = email;
    if (message)
        updateData.message = message;
    if (status !== undefined)
        updateData.status = normalizeStatus(status);
    if (Object.keys(updateData).length === 0) {
        throw new error_utils_1.CustomError("No valid fields to update", 400);
    }
    const comment = await blog_comment_model_1.BlogComment.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).lean();
    res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: comment,
    });
});
/** Admin: delete a comment. */
exports.deleteBlogComment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    const existing = await findCommentForStore(id, storeId);
    await blog_comment_model_1.BlogComment.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
        data: {
            deletedId: id,
            storeId: String(existing.storeId),
            articleId: String(existing.articleId),
        },
    });
});
/** Storefront: list published comments for a visible article. */
exports.getPublishedCommentsForArticle = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, articleId } = req.params;
    assertValidObjectId(storeId, "storeId");
    assertValidObjectId(articleId, "articleId");
    const post = await blog_post_model_1.BlogPost.findOne({
        _id: articleId,
        storeId,
        visibility: "visible",
    })
        .select("_id blogId")
        .lean();
    if (!post) {
        throw new error_utils_1.CustomError("Blog post not found", 404);
    }
    const blog = await blog_model_1.Blog.findById(post.blogId).select("comments").lean();
    if (!blog || blog.comments === "disabled") {
        res.status(200).json({ success: true, data: [], count: 0, commentsEnabled: false });
        return;
    }
    const comments = await blog_comment_model_1.BlogComment.find({
        storeId,
        articleId,
        status: "published",
    })
        .sort({ createdAt: -1 })
        .select({ name: 1, message: 1, createdAt: 1 })
        .lean();
    res.status(200).json({
        success: true,
        data: comments,
        count: comments.length,
        commentsEnabled: true,
        commentsMode: blog.comments,
    });
});
/** Storefront: visitor submits a comment on a blog post. */
exports.createStorefrontBlogComment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, articleId } = req.body;
    const { name, email, message } = trimFields(req.body);
    assertValidObjectId(String(storeId), "storeId");
    assertValidObjectId(String(articleId), "articleId");
    if (!name)
        throw new error_utils_1.CustomError("Name is required", 400);
    if (!email)
        throw new error_utils_1.CustomError("Email is required", 400);
    if (!message)
        throw new error_utils_1.CustomError("Message is required", 400);
    const post = await blog_post_model_1.BlogPost.findOne({
        _id: articleId,
        storeId,
        visibility: "visible",
    })
        .select("_id blogId")
        .lean();
    if (!post) {
        throw new error_utils_1.CustomError("Blog post not found", 404);
    }
    const blog = await blog_model_1.Blog.findById(post.blogId).select("comments").lean();
    if (!blog) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    if (blog.comments === "disabled") {
        throw new error_utils_1.CustomError("Comments are disabled for this blog", 403);
    }
    const initialStatus = blog.comments === "moderated" ? "pending" : "published";
    const comment = await blog_comment_model_1.BlogComment.create({
        storeId,
        articleId,
        name,
        email,
        message,
        status: initialStatus,
    });
    res.status(201).json({
        success: true,
        message: initialStatus === "pending"
            ? "Comment submitted and is awaiting moderation"
            : "Comment posted successfully",
        data: {
            _id: comment._id,
            name: comment.name,
            message: comment.message,
            status: comment.status,
            createdAt: comment.createdAt,
        },
    });
});
