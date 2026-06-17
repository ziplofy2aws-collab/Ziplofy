import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { Blog } from "../models/blog/blog.model";
import { BlogPost } from "../models/blog-post/blog-post.model";
import { absolutizeMediaUrl, publicOriginFromRequest } from "../utils/public-origin.util";
import { slugifyMenuHandle } from "../utils/store-menu-link.util";

function normalizeUrlHandle(raw: string): string {
  const decoded = decodeURIComponent(raw.trim());
  return slugifyMenuHandle(decoded);
}

function isPreviewRequest(req: Request): boolean {
  const preview = req.query.preview;
  return preview === "1" || preview === "true";
}

function assertValidStoreId(storeId: string): void {
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
}

async function findBlogByStoreAndHandle(storeId: string, blogHandle: string) {
  return Blog.findOne({
    storeId,
    urlHandle: normalizeUrlHandle(blogHandle),
  }).lean();
}

function enrichPostFeaturedImage(publicOrigin: string, post: Record<string, unknown>) {
  const featuredImageUrl = absolutizeMediaUrl(
    publicOrigin,
    String(post.featuredImageUrl ?? "")
  );
  return { ...post, featuredImageUrl };
}

/** Storefront: resolve a blog by store + url handle. */
export const getBlogByUrlHandle = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, urlHandle } = req.params;
  assertValidStoreId(storeId);
  if (!urlHandle?.trim()) throw new CustomError("urlHandle is required", 400);

  const blog = await findBlogByStoreAndHandle(storeId, urlHandle);
  if (!blog) {
    throw new CustomError("Blog not found", 404);
  }

  const postCount = await BlogPost.countDocuments({
    blogId: blog._id,
    visibility: "visible",
  });

  res.status(200).json({
    success: true,
    data: { ...blog, postCount },
  });
});

/** Storefront: list visible posts for a blog resolved by url handle. */
export const getVisiblePostsByBlogUrlHandle = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, urlHandle } = req.params;
  assertValidStoreId(storeId);
  if (!urlHandle?.trim()) throw new CustomError("urlHandle is required", 400);

  const blog = await findBlogByStoreAndHandle(storeId, urlHandle);
  if (!blog) {
    throw new CustomError("Blog not found", 404);
  }

  const { page = 1, limit = 12 } = req.query as Record<string, unknown>;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const filter = { blogId: blog._id, visibility: "visible" as const };

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
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
    BlogPost.countDocuments(filter),
  ]);

  const publicOrigin = publicOriginFromRequest(req);
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
export const getVisiblePostByUrlHandles = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, blogHandle, postHandle } = req.params;
  assertValidStoreId(storeId);
  if (!blogHandle?.trim()) throw new CustomError("blogHandle is required", 400);
  if (!postHandle?.trim()) throw new CustomError("postHandle is required", 400);

  const blog = await findBlogByStoreAndHandle(storeId, blogHandle);
  if (!blog) {
    throw new CustomError("Blog not found", 404);
  }

  const post = await BlogPost.findOne({
    blogId: blog._id,
    urlHandle: normalizeUrlHandle(postHandle),
    ...(isPreviewRequest(req) ? {} : { visibility: "visible" as const }),
  }).lean();

  if (!post) {
    throw new CustomError("Blog post not found", 404);
  }

  const publicOrigin = publicOriginFromRequest(req);
  const enrichedPost = enrichPostFeaturedImage(publicOrigin, post);

  res.status(200).json({
    success: true,
    data: {
      blog,
      post: enrichedPost,
    },
  });
});
