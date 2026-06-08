import { Request, Response } from "express";
import { IShippingOverride, ShippingOverride } from "../models/shipping-override/shipping-override.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Create a new shipping override
export const createShippingOverride = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId, stateId, taxRate, isActive } = req.body;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (taxRate === undefined || taxRate === null) {
    throw new CustomError("Tax rate is required", 400);
  }

  if (taxRate < 0 || taxRate > 100) {
    throw new CustomError("Tax rate must be between 0 and 100", 400);
  }

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError("Invalid country ID format", 400);
  }

  // If stateId is provided, validate it and check for duplicates
  if (stateId) {
    if (!mongoose.Types.ObjectId.isValid(stateId)) {
      throw new CustomError("Invalid state ID format", 400);
    }

    // Check if shipping override already exists for this store-country-state combination
    const existingShippingOverride = await ShippingOverride.findOne({
      storeId,
      countryId,
      stateId: new mongoose.Types.ObjectId(stateId),
    });

    if (existingShippingOverride) {
      throw new CustomError(`Shipping override already exists for this state. You cannot add the same state twice for this store and country.`, 400);
    }
  } else {
    // Check for country-level override (null stateId)
    const existingShippingOverride = await ShippingOverride.findOne({
      storeId,
      countryId,
      stateId: null,
    });

    if (existingShippingOverride) {
      throw new CustomError("Shipping override already exists for this country at the federal level", 400);
    }
  }

  const shippingOverrideData: Partial<IShippingOverride> = {
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
    stateId: stateId ? new mongoose.Types.ObjectId(stateId) : null,
    taxRate,
    isActive: isActive !== undefined ? isActive : true,
  };

  const newShippingOverride = await ShippingOverride.create(shippingOverrideData);

  const populatedShippingOverride = await ShippingOverride.findById(newShippingOverride._id)
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code');

  res.status(201).json({
    success: true,
    data: populatedShippingOverride,
    message: "Shipping override created successfully",
  });
});

// Get shipping overrides by store ID and country ID
export const getShippingOverridesByStoreAndCountry = asyncErrorHandler(async (req: Request, res: Response) => {
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

  const shippingOverrides = await ShippingOverride.find({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
    isActive: true,
  })
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: shippingOverrides,
    count: shippingOverrides.length,
  });
});

// Get shipping override by ID
export const getShippingOverrideById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new CustomError("Shipping override ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid shipping override ID", 400);
  }

  const shippingOverride = await ShippingOverride.findById(id)
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code');

  if (!shippingOverride) {
    throw new CustomError("Shipping override not found", 404);
  }

  res.status(200).json({
    success: true,
    data: shippingOverride,
  });
});

// Update a shipping override
export const updateShippingOverride = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { taxRate, isActive } = req.body;

  if (!id) {
    throw new CustomError("Shipping override ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid shipping override ID", 400);
  }

  const update: any = {};

  if (taxRate !== undefined) {
    if (taxRate < 0 || taxRate > 100) {
      throw new CustomError("Tax rate must be between 0 and 100", 400);
    }
    update.taxRate = taxRate;
  }

  if (isActive !== undefined) {
    update.isActive = isActive;
  }

  const updatedShippingOverride = await ShippingOverride.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  )
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code');

  if (!updatedShippingOverride) {
    throw new CustomError("Shipping override not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedShippingOverride,
    message: "Shipping override updated successfully",
  });
});

// Delete a shipping override
export const deleteShippingOverride = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new CustomError("Shipping override ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid shipping override ID", 400);
  }

  const deletedShippingOverride = await ShippingOverride.findByIdAndDelete(id);

  if (!deletedShippingOverride) {
    throw new CustomError("Shipping override not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {},
    message: "Shipping override deleted successfully",
  });
});

