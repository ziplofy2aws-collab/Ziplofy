import { Request, Response } from "express";
import mongoose from "mongoose";
import { Blog } from "../models/blog/blog.model";
import { BlogPost } from "../models/blog-post/blog-post.model";
import {
  BlogComment,
  BLOG_COMMENT_STATUS,
  type BlogCommentStatus,
  type IBlogComment,
} from "../models/blog-comment/blog-comment.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

function assertValidObjectId(value: string, label: string): void {
  if (!value || !mongoose.isValidObjectId(value)) {
    throw new CustomError(`Valid ${label} is required`, 400);
  }
}

function normalizeStatus(value: unknown): BlogCommentStatus {
  if (typeof value === "string" && BLOG_COMMENT_STATUS.includes(value as BlogCommentStatus)) {
    return value as BlogCommentStatus;
  }
  throw new CustomError("Invalid comment status", 400);
}

function trimFields(body: Record<string, unknown>) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    email: typeof body.email === "string" ? body.email.trim().toLowerCase() : "",
    message: typeof body.message === "string" ? body.message.trim() : "",
  };
}

async function assertArticleBelongsToStore(articleId: string, storeId: string) {
  const post = await BlogPost.findById(articleId).select("storeId blogId visibility").lean();
  if (!post) {
    throw new CustomError("Blog post not found", 404);
  }
  if (String(post.storeId) !== String(storeId)) {
    throw new CustomError("Blog post does not belong to this store", 403);
  }
  return post;
}

async function findCommentForStore(commentId: string, storeId?: string) {
  if (!mongoose.isValidObjectId(commentId)) {
    throw new CustomError("Invalid comment ID", 400);
  }

  const comment = await BlogComment.findById(commentId).lean();
  if (!comment) {
    throw new CustomError("Comment not found", 404);
  }

  if (storeId && String(comment.storeId) !== String(storeId)) {
    throw new CustomError("Comment does not belong to this store", 403);
  }

  return comment;
}

/** Admin: list comments for a store (optional articleId filter). */
export const getBlogCommentsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { articleId, status } = req.query as Record<string, string>;

  assertValidObjectId(storeId, "storeId");

  const filter: Record<string, unknown> = { storeId };

  if (articleId?.trim()) {
    assertValidObjectId(articleId, "articleId");
    filter.articleId = articleId;
  }

  if (status?.trim()) {
    filter.status = normalizeStatus(status);
  }

  const comments = await BlogComment.find(filter)
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
export const createBlogComment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, articleId, status } = req.body as Partial<IBlogComment>;
  const { name, email, message } = trimFields(req.body);

  assertValidObjectId(String(storeId), "storeId");
  assertValidObjectId(String(articleId), "articleId");

  if (!name) throw new CustomError("Name is required", 400);
  if (!email) throw new CustomError("Email is required", 400);
  if (!message) throw new CustomError("Message is required", 400);

  await assertArticleBelongsToStore(String(articleId), String(storeId));

  const comment = await BlogComment.create({
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
export const updateBlogComment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId, status } = req.body as Partial<IBlogComment>;
  const { name, email, message } = trimFields(req.body);

  await findCommentForStore(id, storeId ? String(storeId) : undefined);

  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (message) updateData.message = message;
  if (status !== undefined) updateData.status = normalizeStatus(status);

  if (Object.keys(updateData).length === 0) {
    throw new CustomError("No valid fields to update", 400);
  }

  const comment = await BlogComment.findByIdAndUpdate(id, updateData, {
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
export const deleteBlogComment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as Record<string, string>;

  const existing = await findCommentForStore(id, storeId);

  await BlogComment.findByIdAndDelete(id);

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
export const getPublishedCommentsForArticle = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, articleId } = req.params;

  assertValidObjectId(storeId, "storeId");
  assertValidObjectId(articleId, "articleId");

  const post = await BlogPost.findOne({
    _id: articleId,
    storeId,
    visibility: "visible",
  })
    .select("_id blogId")
    .lean();

  if (!post) {
    throw new CustomError("Blog post not found", 404);
  }

  const blog = await Blog.findById(post.blogId).select("comments").lean();
  if (!blog || blog.comments === "disabled") {
    res.status(200).json({ success: true, data: [], count: 0, commentsEnabled: false });
    return;
  }

  const comments = await BlogComment.find({
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
export const createStorefrontBlogComment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, articleId } = req.body as Partial<IBlogComment>;
  const { name, email, message } = trimFields(req.body);

  assertValidObjectId(String(storeId), "storeId");
  assertValidObjectId(String(articleId), "articleId");

  if (!name) throw new CustomError("Name is required", 400);
  if (!email) throw new CustomError("Email is required", 400);
  if (!message) throw new CustomError("Message is required", 400);

  const post = await BlogPost.findOne({
    _id: articleId,
    storeId,
    visibility: "visible",
  })
    .select("_id blogId")
    .lean();

  if (!post) {
    throw new CustomError("Blog post not found", 404);
  }

  const blog = await Blog.findById(post.blogId).select("comments").lean();
  if (!blog) {
    throw new CustomError("Blog not found", 404);
  }

  if (blog.comments === "disabled") {
    throw new CustomError("Comments are disabled for this blog", 403);
  }

  const initialStatus: BlogCommentStatus = blog.comments === "moderated" ? "pending" : "published";

  const comment = await BlogComment.create({
    storeId,
    articleId,
    name,
    email,
    message,
    status: initialStatus,
  });

  res.status(201).json({
    success: true,
    message:
      initialStatus === "pending"
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
