import { Request, Response } from "express";
import mongoose from "mongoose";
import { ProductTags, IProductTags } from "../models/product-tags/product-tags.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Create a new product tag
export const createProductTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name } = req.body as Pick<IProductTags, "storeId" | "name">;

  if (!storeId || !name) {
    throw new CustomError("Store ID and tag name are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Check for duplicate tag name within the same store (case-insensitive)
  const existingTag = await ProductTags.findOne({
    storeId,
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
  });

  if (existingTag) {
    throw new CustomError("Tag with this name already exists for this store", 409);
  }

  const tag = new ProductTags({ storeId, name: name.trim() });
  const savedTag = await tag.save();

  res.status(201).json({
    success: true,
    message: "Product tag created successfully",
    data: savedTag,
  });
});

// Delete a product tag by ID
export const deleteProductTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid tag ID format", 400);
  }

  const tag = await ProductTags.findByIdAndDelete(id);

  if (!tag) {
    throw new CustomError("Product tag not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Product tag deleted successfully",
    data: {
      deletedTag: {
        id: tag._id,
        storeId: tag.storeId,
        name: tag.name,
      }
    }
  });
});

// Get product tags by store ID
export const getProductTagsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  const tags = await ProductTags.find({ storeId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Product tags retrieved successfully",
    data: tags,
    count: tags.length,
  });
});


