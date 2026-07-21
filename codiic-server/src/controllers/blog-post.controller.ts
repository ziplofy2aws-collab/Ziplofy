import { Request, Response } from "express";
import mongoose from "mongoose";
import { Blog } from "../models/blog/blog.model";
import { BlogPost, BLOG_POST_VISIBILITY, type BlogPostVisibility } from "../models/blog-post/blog-post.model";
import { BlogTags } from "../models/blog-tags/blog-tags.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { slugifyMenuHandle } from "../utils/store-menu-link.util";
import {
  isValidBlogPostThemeTemplate,
  listBlogPostThemeTemplatesForStore,
  normalizeBlogPostThemeTemplate,
} from "../utils/blog-post-theme-template.util";

function normalizeUrlHandle(raw: string | undefined, title: string): string {
  const handle = (raw?.trim() || slugifyMenuHandle(title)).toLowerCase();
  if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
    throw new CustomError("Valid URL handle is required", 400);
  }
  return handle;
}

function normalizeVisibility(value: unknown): BlogPostVisibility {
  if (typeof value === "string" && BLOG_POST_VISIBILITY.includes(value as BlogPostVisibility)) {
    return value as BlogPostVisibility;
  }
  return "hidden";
}

async function assertBlogBelongsToStore(blogId: string, storeId: string) {
  const blog = await Blog.findById(blogId).select("storeId").lean();
  if (!blog) {
    throw new CustomError("Blog not found", 404);
  }
  if (String(blog.storeId) !== String(storeId)) {
    throw new CustomError("Blog does not belong to this store", 403);
  }
}

async function normalizeTagIds(storeId: string, tagIds: unknown): Promise<mongoose.Types.ObjectId[]> {
  if (!Array.isArray(tagIds)) return [];

  const uniqueIds = [...new Set(tagIds.map((id) => String(id)).filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const invalid = uniqueIds.filter((id) => !mongoose.isValidObjectId(id));
  if (invalid.length > 0) {
    throw new CustomError("One or more tag IDs are invalid", 400);
  }

  const tags = await BlogTags.find({
    _id: { $in: uniqueIds },
    storeId,
  })
    .select("_id")
    .lean();

  if (tags.length !== uniqueIds.length) {
    throw new CustomError("One or more tags do not belong to this store", 400);
  }

  return uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
}

export const createBlogPost = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,
    blogId,
    title,
    content,
    excerpt,
    pageTitle,
    metaDescription,
    urlHandle,
    visibility,
    author,
    tagIds,
    featuredImageUrl,
    featuredImageKey,
    featuredImageUploadId,
    themeTemplate,
  } = req.body;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  if (!blogId || !mongoose.isValidObjectId(blogId)) {
    throw new CustomError("Valid blogId is required", 400);
  }
  if (!title?.trim()) {
    throw new CustomError("title is required", 400);
  }
  if (typeof themeTemplate !== "undefined" && !isValidBlogPostThemeTemplate(themeTemplate)) {
    throw new CustomError("Invalid themeTemplate value", 400);
  }

  await assertBlogBelongsToStore(blogId, storeId);

  const trimmedTitle = title.trim();
  const handle = normalizeUrlHandle(urlHandle, trimmedTitle);

  const existing = await BlogPost.findOne({ blogId, urlHandle: handle }).select("_id").lean();
  if (existing) {
    throw new CustomError("A blog post with this URL handle already exists for this blog", 409);
  }

  const normalizedTagIds = await normalizeTagIds(storeId, tagIds);

  const blogPost = await BlogPost.create({
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
    featuredImageUploadId:
      typeof featuredImageUploadId === "string" ? featuredImageUploadId.trim() : "",
    themeTemplate: isValidBlogPostThemeTemplate(themeTemplate)
      ? normalizeBlogPostThemeTemplate(themeTemplate)
      : "default",
  });

  res.status(201).json({
    success: true,
    data: blogPost,
    message: "Blog post created successfully",
  });
});

export const getBlogPostsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { blogId } = req.query as { blogId?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const filter: Record<string, unknown> = { storeId };
  if (blogId) {
    if (!mongoose.isValidObjectId(blogId)) {
      throw new CustomError("Valid blogId is required", 400);
    }
    filter.blogId = blogId;
  }

  const posts = await BlogPost.find(filter).sort({ updatedAt: -1 }).lean();

  res.status(200).json({
    success: true,
    data: posts,
    count: posts.length,
  });
});

export const listBlogPostThemeTemplates = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const data = await listBlogPostThemeTemplatesForStore(storeId);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getBlogPostById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid blog post id is required", 400);
  }

  const post = await BlogPost.findById(id).lean();
  if (!post) {
    throw new CustomError("Blog post not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(post.storeId) !== String(storeId)) {
      throw new CustomError("Blog post does not belong to this store", 403);
    }
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

export const updateBlogPost = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    storeId,
    blogId,
    title,
    content,
    excerpt,
    pageTitle,
    metaDescription,
    urlHandle,
    visibility,
    author,
    tagIds,
    featuredImageUrl,
    featuredImageKey,
    featuredImageUploadId,
    themeTemplate,
  } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid blog post id is required", 400);
  }

  const existing = await BlogPost.findById(id);
  if (!existing) {
    throw new CustomError("Blog post not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(existing.storeId) !== String(storeId)) {
      throw new CustomError("Blog post does not belong to this store", 403);
    }
  }

  const updateData: Record<string, unknown> = {};

  if (blogId !== undefined) {
    if (!mongoose.isValidObjectId(blogId)) {
      throw new CustomError("Valid blogId is required", 400);
    }
    await assertBlogBelongsToStore(blogId, String(existing.storeId));
    updateData.blogId = blogId;
  }

  if (title !== undefined) {
    if (!title?.trim()) throw new CustomError("title cannot be empty", 400);
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
    if (!nextPageTitle) throw new CustomError("pageTitle cannot be empty", 400);
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

  if (themeTemplate !== undefined) {
    if (!isValidBlogPostThemeTemplate(themeTemplate)) {
      throw new CustomError("Invalid themeTemplate value", 400);
    }
    updateData.themeTemplate = normalizeBlogPostThemeTemplate(themeTemplate);
  }

  if (urlHandle !== undefined || title !== undefined) {
    const nextTitle = (updateData.title as string | undefined) ?? existing.title;
    const nextBlogId = (updateData.blogId as mongoose.Types.ObjectId | undefined) ?? existing.blogId;
    const handle = normalizeUrlHandle(
      urlHandle !== undefined ? urlHandle : existing.urlHandle,
      nextTitle
    );

    const duplicate = await BlogPost.findOne({
      blogId: nextBlogId,
      urlHandle: handle,
      _id: { $ne: existing._id },
    })
      .select("_id")
      .lean();

    if (duplicate) {
      throw new CustomError("A blog post with this URL handle already exists for this blog", 409);
    }

    updateData.urlHandle = handle;
  }

  const blogPost = await BlogPost.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: blogPost,
    message: "Blog post updated successfully",
  });
});

export const deleteBlogPost = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid blog post id is required", 400);
  }

  const post = await BlogPost.findById(id);
  if (!post) {
    throw new CustomError("Blog post not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(post.storeId) !== String(storeId)) {
      throw new CustomError("Blog post does not belong to this store", 403);
    }
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: "Blog post deleted successfully",
  });
});
