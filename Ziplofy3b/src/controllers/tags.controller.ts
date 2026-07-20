import { Request, Response } from "express";
import mongoose from "mongoose";
import { ITags, Tags } from "../models/tags/tags.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Add a new tag
export const addTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name } = req.body as Pick<ITags, "storeId" | "name">;

  // Validate required fields
  if (!storeId || !name) {
    throw new CustomError("Store ID and tag name are required", 400);
  }

  // Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Check if tag already exists for this store
  const existingTag = await Tags.findOne({ storeId, name: name.trim() });
  if (existingTag) {
    throw new CustomError("Tag with this name already exists for this store", 409);
  }

  // Create new tag
  const tag = new Tags({
    storeId,
    name: name.trim()
  });

  const savedTag = await tag.save();

  res.status(201).json({
    success: true,
    message: "Tag created successfully",
    data: savedTag
  });
});

// Delete a tag
export const getTagsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  // Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Get tags for the specific store
  const tags = await Tags.find({ storeId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Tags retrieved successfully",
    data: tags
  });
});

export const deleteTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate tag ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid tag ID format", 400);
  }

  // Find and delete the tag
  const tag = await Tags.findByIdAndDelete(id);

  if (!tag) {
    throw new CustomError("Tag not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Tag deleted successfully",
    data: {
      deletedTag: {
        id: tag._id,
        storeId: tag.storeId,
        name: tag.name
      }
    }
  });
});
