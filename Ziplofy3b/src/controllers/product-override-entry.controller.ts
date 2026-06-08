import { Request, Response } from "express";
import { IProductOverrideEntry, ProductOverrideEntry } from "../models/product-override/product-override-entry.model";
import { ProductOverride } from "../models/product-override/product-override.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Create a new product override entry
export const createProductOverrideEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { productOverrideId, stateId, taxRate, isActive } = req.body;

  if (!productOverrideId) {
    throw new CustomError("Product Override ID is required", 400);
  }

  if (taxRate === undefined || taxRate === null) {
    throw new CustomError("Tax rate is required", 400);
  }

  if (taxRate < 0 || taxRate > 100) {
    throw new CustomError("Tax rate must be between 0 and 100", 400);
  }

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(productOverrideId)) {
    throw new CustomError("Invalid product override ID format", 400);
  }

  // Verify that the product override exists
  const productOverride = await ProductOverride.findById(productOverrideId);
  if (!productOverride) {
    throw new CustomError("Product override not found", 404);
  }

  // Validate and check for duplicate state IDs
  if (stateId) {
    if (!mongoose.Types.ObjectId.isValid(stateId)) {
      throw new CustomError("Invalid state ID format", 400);
    }

    // Check if product override entry already exists for this productOverride-state combination
    // This prevents duplicate state IDs for the same product override
    const existingEntry = await ProductOverrideEntry.findOne({
      productOverrideId: new mongoose.Types.ObjectId(productOverrideId),
      stateId: new mongoose.Types.ObjectId(stateId),
      isActive: true, // Only check active entries
    });

    if (existingEntry) {
      throw new CustomError(
        `Product override entry already exists for this state. You cannot add the same state twice for this product override.`,
        400
      );
    }
  } else {
    // Check for country-level entry (null stateId) - only one federal-level entry allowed per product override
    const existingEntry = await ProductOverrideEntry.findOne({
      productOverrideId: new mongoose.Types.ObjectId(productOverrideId),
      stateId: null,
      isActive: true, // Only check active entries
    });

    if (existingEntry) {
      throw new CustomError(
        "Product override entry already exists for this product override at the federal level. You cannot add duplicate federal-level entries.",
        400
      );
    }
  }

  const productOverrideEntryData: Partial<IProductOverrideEntry> = {
    productOverrideId: new mongoose.Types.ObjectId(productOverrideId),
    stateId: stateId ? new mongoose.Types.ObjectId(stateId) : null,
    taxRate,
    isActive: isActive !== undefined ? isActive : true,
  };

  const newProductOverrideEntry = await ProductOverrideEntry.create(productOverrideEntryData);

  const populatedEntry = await ProductOverrideEntry.findById(newProductOverrideEntry._id)
    .populate({
      path: "productOverrideId",
      populate: {
        path: "storeId",
        select: "storeName",
      },
    })
    .populate({
      path: "productOverrideId",
      populate: {
        path: "countryId",
        select: "name iso2",
      },
    })
    .populate({
      path: "productOverrideId",
      populate: {
        path: "collectionId",
        select: "title",
      },
    })
    .populate("stateId", "name code");

  res.status(201).json({
    success: true,
    data: populatedEntry,
    message: "Product override entry created successfully",
  });
});

// Get product override entries by product override ID
export const getProductOverrideEntriesByProductOverrideId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { productOverrideId } = req.params;

  if (!productOverrideId) {
    throw new CustomError("Product Override ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(productOverrideId)) {
    throw new CustomError("Invalid product override ID format", 400);
  }

  // Verify that the product override exists
  const productOverride = await ProductOverride.findById(productOverrideId);
  if (!productOverride) {
    throw new CustomError("Product override not found", 404);
  }

  const entries = await ProductOverrideEntry.find({
    productOverrideId: new mongoose.Types.ObjectId(productOverrideId),
    isActive: true,
  })
    .populate({
      path: "productOverrideId",
      populate: {
        path: "storeId",
        select: "storeName",
      },
    })
    .populate({
      path: "productOverrideId",
      populate: {
        path: "countryId",
        select: "name iso2",
      },
    })
    .populate({
      path: "productOverrideId",
      populate: {
        path: "collectionId",
        select: "title",
      },
    })
    .populate("stateId", "name code")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: entries,
    count: entries.length,
    message: "Product override entries retrieved successfully",
  });
});

// Delete a product override entry
export const deleteProductOverrideEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new CustomError("Product override entry ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid product override entry ID format", 400);
  }

  const deletedEntry = await ProductOverrideEntry.findByIdAndDelete(id);

  if (!deletedEntry) {
    throw new CustomError("Product override entry not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      deletedEntry: {
        id: deletedEntry._id,
        productOverrideId: deletedEntry.productOverrideId,
        stateId: deletedEntry.stateId,
        taxRate: deletedEntry.taxRate,
      },
    },
    message: "Product override entry deleted successfully",
  });
});

