import { Request, Response } from "express";
import mongoose from "mongoose";
import { BlogTags, IBlogTags } from "../models/blog-tags/blog-tags.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findDuplicateTagName(
  storeId: mongoose.Types.ObjectId | string,
  name: string,
  excludeId?: string
) {
  const query: Record<string, unknown> = {
    storeId,
    name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return BlogTags.findOne(query).select("_id").lean();
}

export const createBlogTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name } = req.body as Pick<IBlogTags, "storeId" | "name">;

  if (!storeId || !name?.trim()) {
    throw new CustomError("Store ID and tag name are required", 400);
  }

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  const existingTag = await findDuplicateTagName(storeId, name);
  if (existingTag) {
    throw new CustomError("Tag with this name already exists for this store", 409);
  }

  const tag = await BlogTags.create({ storeId, name: name.trim() });

  res.status(201).json({
    success: true,
    message: "Blog tag created successfully",
    data: tag,
  });
});

export const getBlogTagsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  const tags = await BlogTags.find({ storeId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Blog tags retrieved successfully",
    data: tags,
    count: tags.length,
  });
});

export const searchBlogTags = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { q, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  const searchQuery = typeof q === "string" ? q.trim() : "";
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const filter: Record<string, unknown> = { storeId };
  if (searchQuery) {
    filter.name = { $regex: escapeRegex(searchQuery), $options: "i" };
  }

  const tags = await BlogTags.find(filter).sort({ createdAt: -1 }).limit(limitNum).lean();

  res.status(200).json({
    success: true,
    message: "Blog tags search completed successfully",
    data: tags,
    count: tags.length,
  });
});

export const updateBlogTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId, name } = req.body as Partial<Pick<IBlogTags, "storeId" | "name">>;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Invalid tag ID format", 400);
  }

  const existing = await BlogTags.findById(id);
  if (!existing) {
    throw new CustomError("Blog tag not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Invalid store ID format", 400);
    }
    if (String(existing.storeId) !== String(storeId)) {
      throw new CustomError("Blog tag does not belong to this store", 403);
    }
  }

  if (name === undefined) {
    throw new CustomError("Tag name is required", 400);
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new CustomError("Tag name cannot be empty", 400);
  }

  const duplicate = await findDuplicateTagName(existing.storeId, trimmedName, id);
  if (duplicate) {
    throw new CustomError("Tag with this name already exists for this store", 409);
  }

  const tag = await BlogTags.findByIdAndUpdate(
    id,
    { name: trimmedName },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Blog tag updated successfully",
    data: tag,
  });
});

export const deleteBlogTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Invalid tag ID format", 400);
  }

  const tag = await BlogTags.findById(id);
  if (!tag) {
    throw new CustomError("Blog tag not found", 404);
  }

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Invalid store ID format", 400);
    }
    if (String(tag.storeId) !== String(storeId)) {
      throw new CustomError("Blog tag does not belong to this store", 403);
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
