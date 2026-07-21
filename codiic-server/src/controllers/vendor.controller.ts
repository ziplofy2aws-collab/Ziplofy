import { Request, Response } from "express";
import mongoose from "mongoose";
import { IVendor, Vendor } from "../models/vendor/vendor.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Add a new vendor
export const addVendor = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name } = req.body as Pick<IVendor, "storeId" | "name">;

  // Validate required fields
  if (!storeId || !name) {
    throw new CustomError("Store ID and vendor name are required", 400);
  }

  // Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Check if vendor already exists for this store
  const existingVendor = await Vendor.findOne({ storeId, name: name.trim() });
  if (existingVendor) {
    throw new CustomError("Vendor with this name already exists for this store", 409);
  }

  // Create new vendor
  const vendor = new Vendor({
    storeId,
    name: name.trim()
  });

  const savedVendor = await vendor.save();

  res.status(201).json({
    success: true,
    message: "Vendor created successfully",
    data: savedVendor
  });
});

// Delete a vendor
export const deleteVendor = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate vendor ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid vendor ID format", 400);
  }

  // Find and delete the vendor
  const vendor = await Vendor.findByIdAndDelete(id);

  if (!vendor) {
    throw new CustomError("Vendor not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Vendor deleted successfully",
    data: {
      deletedVendor: {
        id: vendor._id,
        storeId: vendor.storeId,
        name: vendor.name
      }
    }
  });
});

// Get vendors by storeId
export const getVendorsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId) {
    throw new CustomError("storeId is required", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  const vendors = await Vendor.find({ storeId }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: vendors,
    count: vendors.length,
  });
});