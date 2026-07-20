import { Request, Response } from "express";
import { ICountryTaxOverride, CountryTaxOverride } from "../models/country-tax-override/country-tax-override.model";
import { Country } from "../models/country/country.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Create a new country tax override
export const createCountryTaxOverride = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId, taxRate } = req.body;

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

  // Verify that the store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  // Verify that the country exists
  const country = await Country.findById(countryId).lean();
  if (!country) {
    throw new CustomError("Country not found", 404);
  }

  // Check if country tax override already exists for this store and country
  const existingOverride = await CountryTaxOverride.findOne({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
  });

  if (existingOverride) {
    throw new CustomError(
      "Country tax override already exists for this store and country. You cannot create duplicate overrides.",
      400
    );
  }

  const countryTaxOverrideData: Partial<ICountryTaxOverride> = {
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
    taxRate,
  };

  const newCountryTaxOverride = await CountryTaxOverride.create(countryTaxOverrideData);

  const populatedCountryTaxOverride = await CountryTaxOverride.findById(newCountryTaxOverride._id)
    .populate("storeId", "storeName")
    .populate("countryId", "name iso2 iso3");

  res.status(201).json({
    success: true,
    data: populatedCountryTaxOverride,
    message: "Country tax override created successfully",
  });
});

// Get country tax override by store ID and country ID
export const getCountryTaxOverrideByStoreAndCountry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId } = req.params;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError("Invalid country ID format", 400);
  }

  // Verify that the store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  // Verify that the country exists
  const country = await Country.findById(countryId).lean();
  if (!country) {
    throw new CustomError("Country not found", 404);
  }

  // Get country tax override for this store and country
  const countryTaxOverride = await CountryTaxOverride.findOne({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
  })
    .populate("storeId", "storeName")
    .populate("countryId", "name iso2 iso3")
    .lean();

  if (!countryTaxOverride) {
    throw new CustomError("Country tax override not found for this store and country", 404);
  }

  res.status(200).json({
    success: true,
    data: countryTaxOverride,
    message: "Country tax override retrieved successfully",
  });
});

// Update country tax override by store ID and country ID
export const updateCountryTaxOverrideByStoreAndCountry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId } = req.params;
  const { taxRate } = req.body;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError("Invalid country ID format", 400);
  }

  // Verify that the store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  // Verify that the country exists
  const country = await Country.findById(countryId).lean();
  if (!country) {
    throw new CustomError("Country not found", 404);
  }

  // Validate tax rate if provided
  if (taxRate !== undefined && taxRate !== null) {
    if (taxRate < 0 || taxRate > 100) {
      throw new CustomError("Tax rate must be between 0 and 100", 400);
    }
  } else {
    throw new CustomError("Tax rate is required", 400);
  }

  // Update country tax override for this store and country
  const updatedCountryTaxOverride = await CountryTaxOverride.findOneAndUpdate(
    {
      storeId: new mongoose.Types.ObjectId(storeId),
      countryId: new mongoose.Types.ObjectId(countryId),
    },
    {
      taxRate,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("storeId", "storeName")
    .populate("countryId", "name iso2 iso3");

  if (!updatedCountryTaxOverride) {
    throw new CustomError("Country tax override not found for this store and country", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedCountryTaxOverride,
    message: "Country tax override updated successfully",
  });
});

// Delete country tax override by store ID and country ID
export const deleteCountryTaxOverrideByStoreAndCountry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId } = req.params;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(countryId)) {
    throw new CustomError("Invalid country ID format", 400);
  }

  // Verify that the store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  // Verify that the country exists
  const country = await Country.findById(countryId).lean();
  if (!country) {
    throw new CustomError("Country not found", 404);
  }

  // Delete country tax override for this store and country
  const deletedCountryTaxOverride = await CountryTaxOverride.findOneAndDelete({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
  }).lean();

  if (!deletedCountryTaxOverride) {
    throw new CustomError("Country tax override not found for this store and country", 404);
  }

  res.status(200).json({
    success: true,
    data: {},
    message: "Country tax override deleted successfully",
  });
});

