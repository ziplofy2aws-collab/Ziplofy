import { Request, Response } from "express";
import { IPackaging, Packaging } from "../models/packaging/packaging.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Create a new packaging
export const createPackaging = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, packageName, packageType, length, width, height, dimensionsUnit, weight, weightUnit, isDefault } = req.body as Pick<IPackaging, "storeId" | "packageName" | "packageType" | "length" | "width" | "height" | "dimensionsUnit" | "weight" | "weightUnit" | "isDefault">;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  // Verify that the store belongs to the authenticated user
  const store = await Store.findOne({ _id: storeId, userId });
  if (!store) {
    throw new CustomError("Store not found or you don't have permission to access this store", 404);
  }

  // Note: Removed duplicate name check to allow multiple packages with same name

  // If setting as default, unset other default packages for this store
  if (isDefault) {
    await Packaging.updateMany(
      { storeId, isDefault: true },
      { isDefault: false }
    );
  }

  const packaging = await Packaging.create({
    storeId,
    packageName,
    packageType,
    length,
    width,
    height,
    dimensionsUnit,
    weight,
    weightUnit,
    isDefault: isDefault || false,
  });

  res.status(201).json({
    success: true,
    data: packaging,
    message: "Packaging created successfully",
  });
});

// Get all packaging for a specific store
export const getPackagingByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  // Verify that the store belongs to the authenticated user
  const store = await Store.findOne({ _id: storeId, userId });
  if (!store) {
    throw new CustomError("Store not found or you don't have permission to access this store", 404);
  }

  const packaging = await Packaging.find({ storeId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: packaging,
    count: packaging.length,
  });
});

// Get a specific packaging by ID
export const getPackagingById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  const packaging = await Packaging.findById(id);
  if (!packaging) {
    throw new CustomError("Packaging not found", 404);
  }

  // Verify that the store belongs to the authenticated user
  const store = await Store.findOne({ _id: packaging.storeId, userId });
  if (!store) {
    throw new CustomError("You don't have permission to access this packaging", 403);
  }

  res.status(200).json({
    success: true,
    data: packaging,
  });
});

// Update a packaging
export const updatePackaging = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { packageName, packageType, length, width, height, dimensionsUnit, weight, weightUnit, isDefault } = req.body as Partial<Pick<IPackaging, "packageName" | "packageType" | "length" | "width" | "height" | "dimensionsUnit" | "weight" | "weightUnit" | "isDefault">>;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  const packaging = await Packaging.findById(id);
  if (!packaging) {
    throw new CustomError("Packaging not found", 404);
  }

  // Verify that the store belongs to the authenticated user
  const store = await Store.findOne({ _id: packaging.storeId, userId });
  if (!store) {
    throw new CustomError("You don't have permission to update this packaging", 403);
  }

  // Note: Removed duplicate name check to allow multiple packages with same name

  // If setting as default, unset other default packages for this store
  if (isDefault && !packaging.isDefault) {
    await Packaging.updateMany(
      { storeId: packaging.storeId, isDefault: true },
      { isDefault: false }
    );
  }

  const updatedPackaging = await Packaging.findByIdAndUpdate(
    id,
    { packageName, packageType, length, width, height, dimensionsUnit, weight, weightUnit, isDefault },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedPackaging,
    message: "Packaging updated successfully",
  });
});

// Delete a packaging
export const deletePackaging = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  const packaging = await Packaging.findById(id);
  if (!packaging) {
    throw new CustomError("Packaging not found", 404);
  }

  // Verify that the store belongs to the authenticated user
  const store = await Store.findOne({ _id: packaging.storeId, userId });
  if (!store) {
    throw new CustomError("You don't have permission to delete this packaging", 403);
  }

  const deletedPackaging = await Packaging.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    data: {
      deletedId: id,
      deletedPackaging: deletedPackaging
    },
    message: "Packaging deleted successfully",
  });
});

// Get default packaging for a store
export const getDefaultPackaging = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  // Verify that the store belongs to the authenticated user
  const store = await Store.findOne({ _id: storeId, userId });
  if (!store) {
    throw new CustomError("Store not found or you don't have permission to access this store", 404);
  }

  const defaultPackaging = await Packaging.findOne({ storeId, isDefault: true });

  res.status(200).json({
    success: true,
    data: defaultPackaging,
  });
});

