import { Request, Response } from "express";
import mongoose from "mongoose";
import { PurchaseOrderTag } from "../models/purchase-order-tags/purchase-order-tag.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Create a new purchase order tag
export const createPurchaseOrderTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  // Validate required fields
  if (!storeId || !name) {
    throw new CustomError("Store ID and name are required", 400);
  }

  // Check if tag already exists for this store
  const existingTag = await PurchaseOrderTag.findOne({
    storeId,
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });

  if (existingTag) {
    throw new CustomError("A tag with this name already exists for this store", 400);
  }

  // Create the tag
  const tag = await PurchaseOrderTag.create({
    storeId,
    name: name.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Purchase order tag created successfully",
    data: tag,
  });
});

// Get all purchase order tags by store ID
export const getPurchaseOrderTagsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  // Get tags
  const tags = await PurchaseOrderTag.find({storeId})
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Purchase order tags retrieved successfully",
    data: tags,
  });
});

// Delete a purchase order tag by ID
export const deletePurchaseOrderTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid tag ID format", 400);
  }

  const tag = await PurchaseOrderTag.findByIdAndDelete(id);

  if (!tag) {
    throw new CustomError("Purchase order tag not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Purchase order tag deleted successfully",
    data: {
      deletedTag: {
        id: tag._id,
        storeId: tag.storeId,
        name: tag.name,
      }
    }
  });
});

