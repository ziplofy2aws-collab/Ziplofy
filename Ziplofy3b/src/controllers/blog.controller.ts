import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { Blog, BLOG_COMMENTS_MODES, type BlogCommentsMode } from "../models/blog/blog.model";
import { slugifyMenuHandle } from "../utils/store-menu-link.util";

function normalizeUrlHandle(raw: string | undefined, title: string): string {
  const handle = (raw?.trim() || slugifyMenuHandle(title)).toLowerCase();
  if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
    throw new CustomError("Valid URL handle is required", 400);
  }
  return handle;
}

function normalizeCommentsMode(value: unknown): BlogCommentsMode {
  if (typeof value === "string" && BLOG_COMMENTS_MODES.includes(value as BlogCommentsMode)) {
    return value as BlogCommentsMode;
  }
  return "disabled";
}

export const createBlog = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, title, pageTitle, metaDescription, urlHandle, comments } = req.body;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  if (!title?.trim()) {
    throw new CustomError("title is required", 400);
  }

  const trimmedTitle = title.trim();
  const handle = normalizeUrlHandle(urlHandle, trimmedTitle);

  const existing = await Blog.findOne({ storeId, urlHandle: handle }).select("_id").lean();
  if (existing) {
    throw new CustomError("A blog with this URL handle already exists for this store", 409);
  }

  const blog = await Blog.create({
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

export const getBlogsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const blogs = await Blog.find({ storeId }).sort({ updatedAt: -1 }).lean();

  res.status(200).json({
    success: true,
    data: blogs,
    count: blogs.length,
  });
});

export const getBlogById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid blog id is required", 400);
  }

  const blog = await Blog.findById(id).lean();
  if (!blog) {
    throw new CustomError("Blog not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(blog.storeId) !== String(storeId)) {
      throw new CustomError("Blog does not belong to this store", 403);
    }
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

export const updateBlog = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId, title, pageTitle, metaDescription, urlHandle, comments } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid blog id is required", 400);
  }

  const existing = await Blog.findById(id);
  if (!existing) {
    throw new CustomError("Blog not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(existing.storeId) !== String(storeId)) {
      throw new CustomError("Blog does not belong to this store", 403);
    }
  }

  const updateData: Record<string, unknown> = {};

  if (title !== undefined) {
    if (!title?.trim()) throw new CustomError("title cannot be empty", 400);
    updateData.title = title.trim();
  }

  if (pageTitle !== undefined) {
    const nextPageTitle = pageTitle?.trim();
    if (!nextPageTitle) throw new CustomError("pageTitle cannot be empty", 400);
    updateData.pageTitle = nextPageTitle.slice(0, 70);
  }

  if (metaDescription !== undefined) {
    updateData.metaDescription = typeof metaDescription === "string" ? metaDescription.trim() : "";
  }

  if (comments !== undefined) {
    updateData.comments = normalizeCommentsMode(comments);
  }

  if (urlHandle !== undefined || title !== undefined) {
    const nextTitle = (updateData.title as string | undefined) ?? existing.title;
    const handle = normalizeUrlHandle(
      urlHandle !== undefined ? urlHandle : existing.urlHandle,
      nextTitle
    );

    const duplicate = await Blog.findOne({
      storeId: existing.storeId,
      urlHandle: handle,
      _id: { $ne: existing._id },
    })
      .select("_id")
      .lean();

    if (duplicate) {
      throw new CustomError("A blog with this URL handle already exists for this store", 409);
    }

    updateData.urlHandle = handle;
  }

  const blog = await Blog.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: blog,
    message: "Blog updated successfully",
  });
});

export const deleteBlog = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid blog id is required", 400);
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new CustomError("Blog not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(blog.storeId) !== String(storeId)) {
      throw new CustomError("Blog does not belong to this store", 403);
    }
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: "Blog deleted successfully",
  });
});
