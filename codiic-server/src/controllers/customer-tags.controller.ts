import { Request, Response } from "express";
import mongoose from "mongoose";
import { CustomerTags, ICustomerTags } from "../models/customer-tags/customer-tags.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Create a new customer tag
export const createCustomerTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name } = req.body as Pick<ICustomerTags, "storeId" | "name">;

  if (!storeId || !name) {
    throw new CustomError("Store ID and tag name are required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Check for duplicate tag name within the same store
  const existingTag = await CustomerTags.findOne({ 
    storeId, 
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
  });

  if (existingTag) {
    throw new CustomError("Tag with this name already exists for this store", 409);
  }

  const customerTag = new CustomerTags({
    storeId,
    name: name.trim(),
  });

  const savedTag = await customerTag.save();

  res.status(201).json({
    success: true,
    message: "Customer tag created successfully",
    data: savedTag,
  });
});

// Delete a customer tag by ID
export const deleteCustomerTag = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid tag ID format", 400);
  }

  const tag = await CustomerTags.findByIdAndDelete(id);

  if (!tag) {
    throw new CustomError("Customer tag not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Customer tag deleted successfully",
    data: {
      deletedTag: {
        id: tag._id,
        storeId: tag.storeId,
        name: tag.name,
      },
    },
  });
});

// Get customer tags by store ID
export const getCustomerTagsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  const tags = await CustomerTags.find({ storeId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Customer tags retrieved successfully",
    data: tags,
    count: tags.length,
  });
});
