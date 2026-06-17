"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisiblePostByUrlHandles = exports.getVisiblePostsByBlogUrlHandle = exports.getBlogByUrlHandle = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const blog_model_1 = require("../models/blog/blog.model");
const blog_post_model_1 = require("../models/blog-post/blog-post.model");
const public_origin_util_1 = require("../utils/public-origin.util");
const store_menu_link_util_1 = require("../utils/store-menu-link.util");
function normalizeUrlHandle(raw) {
    const decoded = decodeURIComponent(raw.trim());
    return (0, store_menu_link_util_1.slugifyMenuHandle)(decoded);
}
function isPreviewRequest(req) {
    const preview = req.query.preview;
    return preview === "1" || preview === "true";
}
function assertValidStoreId(storeId) {
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
}
async function findBlogByStoreAndHandle(storeId, blogHandle) {
    return blog_model_1.Blog.findOne({
        storeId,
        urlHandle: normalizeUrlHandle(blogHandle),
    }).lean();
}
function enrichPostFeaturedImage(publicOrigin, post) {
    const featuredImageUrl = (0, public_origin_util_1.absolutizeMediaUrl)(publicOrigin, String(post.featuredImageUrl ?? ""));
    return { ...post, featuredImageUrl };
}
/** Storefront: resolve a blog by store + url handle. */
exports.getBlogByUrlHandle = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, urlHandle } = req.params;
    assertValidStoreId(storeId);
    if (!urlHandle?.trim())
        throw new error_utils_1.CustomError("urlHandle is required", 400);
    const blog = await findBlogByStoreAndHandle(storeId, urlHandle);
    if (!blog) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    const postCount = await blog_post_model_1.BlogPost.countDocuments({
        blogId: blog._id,
        visibility: "visible",
    });
    res.status(200).json({
        success: true,
        data: { ...blog, postCount },
    });
});
/** Storefront: list visible posts for a blog resolved by url handle. */
exports.getVisiblePostsByBlogUrlHandle = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, urlHandle } = req.params;
    assertValidStoreId(storeId);
    if (!urlHandle?.trim())
        throw new error_utils_1.CustomError("urlHandle is required", 400);
    const blog = await findBlogByStoreAndHandle(storeId, urlHandle);
    if (!blog) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    const { page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;
    const filter = { blogId: blog._id, visibility: "visible" };
    const [posts, total] = await Promise.all([
        blog_post_model_1.BlogPost.find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select({
            title: 1,
            excerpt: 1,
            pageTitle: 1,
            metaDescription: 1,
            urlHandle: 1,
            visibility: 1,
            author: 1,
            featuredImageUrl: 1,
            blogId: 1,
            storeId: 1,
            createdAt: 1,
            updatedAt: 1,
        })
            .lean(),
        blog_post_model_1.BlogPost.countDocuments(filter),
    ]);
    const publicOrigin = (0, public_origin_util_1.publicOriginFromRequest)(req);
    const enrichedPosts = posts.map((post) => enrichPostFeaturedImage(publicOrigin, post));
    res.status(200).json({
        success: true,
        data: enrichedPosts,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum,
        },
    });
});
/** Storefront: resolve a visible blog post by blog + post url handles. */
exports.getVisiblePostByUrlHandles = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, blogHandle, postHandle } = req.params;
    assertValidStoreId(storeId);
    if (!blogHandle?.trim())
        throw new error_utils_1.CustomError("blogHandle is required", 400);
    if (!postHandle?.trim())
        throw new error_utils_1.CustomError("postHandle is required", 400);
    const blog = await findBlogByStoreAndHandle(storeId, blogHandle);
    if (!blog) {
        throw new error_utils_1.CustomError("Blog not found", 404);
    }
    const post = await blog_post_model_1.BlogPost.findOne({
        blogId: blog._id,
        urlHandle: normalizeUrlHandle(postHandle),
        ...(isPreviewRequest(req) ? {} : { visibility: "visible" }),
    }).lean();
    if (!post) {
        throw new error_utils_1.CustomError("Blog post not found", 404);
    }
    const publicOrigin = (0, public_origin_util_1.publicOriginFromRequest)(req);
    const enrichedPost = enrichPostFeaturedImage(publicOrigin, post);
    res.status(200).json({
        success: true,
        data: {
            blog,
            post: enrichedPost,
        },
    });
});
