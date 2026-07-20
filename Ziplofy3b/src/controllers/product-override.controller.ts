import { Request, Response } from "express";
import { IProductOverride, ProductOverride } from "../models/product-override/product-override.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Create a new product override
export const createProductOverride = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId, collectionId } = req.body;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (!collectionId) {
    throw new CustomError("Collection ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError("Invalid country ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    throw new CustomError("Invalid collection ID", 400);
  }

  const normalizedStoreId = new mongoose.Types.ObjectId(storeId);
  const normalizedCountryId = new mongoose.Types.ObjectId(countryId);
  const normalizedCollectionId = new mongoose.Types.ObjectId(collectionId);

  // Check if product override already exists for this store-country-collection combination
  const existingProductOverride = await ProductOverride.findOne({
    storeId: normalizedStoreId,
    countryId: normalizedCountryId,
    collectionId: normalizedCollectionId,
  });

  if (existingProductOverride) {
    throw new CustomError("Product override already exists for this store, country, and collection combination", 400);
  }

  const productOverrideData: Partial<IProductOverride> = {
    storeId: normalizedStoreId,
    countryId: normalizedCountryId,
    collectionId: normalizedCollectionId,
  };

  const newProductOverride = await ProductOverride.create(productOverrideData);

  const populatedProductOverride = await ProductOverride.findById(newProductOverride._id)
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('collectionId', 'title');

  res.status(201).json({
    success: true,
    data: populatedProductOverride,
    message: "Product override created successfully",
  });
});

// Get product overrides by store ID and country ID
export const getProductOverridesByStoreAndCountry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId } = req.params;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError("Invalid country ID", 400);
  }

  const productOverrides = await ProductOverride.find({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
  })
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('collectionId', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: productOverrides,
    count: productOverrides.length,
  });
});

// Get product override by ID
export const getProductOverrideById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new CustomError("Product override ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid product override ID", 400);
  }

  const productOverride = await ProductOverride.findById(id)
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('collectionId', 'title');

  if (!productOverride) {
    throw new CustomError("Product override not found", 404);
  }

  res.status(200).json({
    success: true,
    data: productOverride,
  });
});

// Update a product override
export const updateProductOverride = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId, countryId, collectionId } = req.body;

  if (!id) {
    throw new CustomError("Product override ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid product override ID", 400);
  }

  const update: Partial<IProductOverride> = {};

  if (!storeId && !countryId && !collectionId) {
    throw new CustomError("At least one field (storeId, countryId, collectionId) must be provided", 400);
  }

  if (storeId) {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw new CustomError("Invalid store ID", 400);
    }
    update.storeId = new mongoose.Types.ObjectId(storeId);
  }

  if (countryId) {
    if (!mongoose.Types.ObjectId.isValid(countryId)) {
      throw new CustomError("Invalid country ID", 400);
    }
    update.countryId = new mongoose.Types.ObjectId(countryId);
  }

  if (collectionId) {
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      throw new CustomError("Invalid collection ID", 400);
    }
    update.collectionId = new mongoose.Types.ObjectId(collectionId);
  }

  const existing = await ProductOverride.findById(id);
  if (!existing) {
    throw new CustomError("Product override not found", 404);
  }

  const mergedStoreId = update.storeId ?? existing.storeId;
  const mergedCountryId = update.countryId ?? existing.countryId;
  const mergedCollectionId = update.collectionId ?? existing.collectionId;

  const duplicate = await ProductOverride.findOne({
    _id: { $ne: existing._id },
    storeId: mergedStoreId,
    countryId: mergedCountryId,
    collectionId: mergedCollectionId,
  });

  if (duplicate) {
    throw new CustomError("Another product override already exists for this store, country, and collection combination", 400);
  }

  existing.set(update);
  await existing.save();

  const updatedProductOverride = await ProductOverride.findById(existing._id)
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('collectionId', 'title');

  res.status(200).json({
    success: true,
    data: updatedProductOverride,
    message: "Product override updated successfully",
  });
});

// Delete a product override
export const deleteProductOverride = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new CustomError("Product override ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid product override ID", 400);
  }

  const deletedProductOverride = await ProductOverride.findByIdAndDelete(id);

  if (!deletedProductOverride) {
    throw new CustomError("Product override not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {},
    message: "Product override deleted successfully",
  });
});

