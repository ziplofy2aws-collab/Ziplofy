import { Request, Response } from "express";
import { ITaxRateOverride, TaxRateOverride } from "../models/tax-rate-override/tax-rate-override.model";
import { State } from "../models/state/state.model";
import { Country } from "../models/country/country.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Create a new tax rate
export const createTaxRate = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, countryId, stateId, taxRate, taxLabel, calculationMethod } = req.body;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!countryId) {
    throw new CustomError("Country ID is required", 400);
  }

  if (!taxLabel) {
    throw new CustomError("Tax label is required", 400);
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

  if (stateId && !mongoose.Types.ObjectId.isValid(stateId)) {
    throw new CustomError("Invalid state ID format", 400);
  }

  // Validate calculationMethod if provided
  if (calculationMethod !== undefined && calculationMethod !== null) {
    if (!["added", "instead", "compounded"].includes(calculationMethod)) {
      throw new CustomError("Invalid calculation method. Must be 'added', 'instead', or 'compounded'", 400);
    }
  }

  // Check if tax rate already exists for this store-country-state combination
  const existingTaxRate = await TaxRateOverride.findOne({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
    stateId: stateId ? new mongoose.Types.ObjectId(stateId) : null,
  });

  if (existingTaxRate) {
    throw new CustomError("Tax rate already exists for this store, country, and state combination", 400);
  }

  const taxRateData: Partial<ITaxRateOverride> = {
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
    stateId: stateId ? new mongoose.Types.ObjectId(stateId) : null,
    taxRate,
    taxLabel: taxLabel.trim(),
    calculationMethod: calculationMethod || null,
  };

  const newTaxRate = await TaxRateOverride.create(taxRateData);

  const populatedTaxRate = await TaxRateOverride.findById(newTaxRate._id)
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code');

  res.status(201).json({
    success: true,
    data: populatedTaxRate,
    message: "Tax rate created successfully",
  });
});

// Get tax rates by store ID
export const getTaxRatesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { countryId, stateId } = req.query;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  const filter: any = {
    storeId: new mongoose.Types.ObjectId(storeId),
  };

  if (countryId) {
    filter.countryId = new mongoose.Types.ObjectId(countryId as string);
  }

  if (stateId !== undefined) {
    if (stateId === 'null' || stateId === '') {
      filter.stateId = null; // For federal/country-level rates
    } else {
      filter.stateId = new mongoose.Types.ObjectId(stateId as string);
    }
  }

  const taxRates = await TaxRateOverride.find(filter)
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: taxRates,
    count: taxRates.length,
  });
});

// Get tax rate by store ID and state ID
export const getTaxRateByStoreAndState = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, stateId } = req.params;
  const { countryId } = req.query;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!stateId) {
    throw new CustomError("State ID is required", 400);
  }

  const filter: any = {
    storeId: new mongoose.Types.ObjectId(storeId),
    stateId: stateId === 'null' ? null : new mongoose.Types.ObjectId(stateId),
  };

  if (countryId) {
    filter.countryId = new mongoose.Types.ObjectId(countryId as string);
  }

  const taxRate = await TaxRateOverride.findOne(filter)
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code');

  if (!taxRate) {
    throw new CustomError("Tax rate not found", 404);
  }

  res.status(200).json({
    success: true,
    data: taxRate,
  });
});

// Update a tax rate
export const updateTaxRate = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { taxRate, taxLabel, calculationMethod } = req.body;

  if (!id) {
    throw new CustomError("Tax rate ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid tax rate ID format", 400);
  }

  const update: any = {};

  if (taxRate !== undefined) {
    if (taxRate < 0 || taxRate > 100) {
      throw new CustomError("Tax rate must be between 0 and 100", 400);
    }
    update.taxRate = taxRate;
  }

  if (taxLabel !== undefined) {
    if (!taxLabel || !taxLabel.trim()) {
      throw new CustomError("Tax label is required", 400);
    }
    update.taxLabel = taxLabel.trim();
  }

  if (calculationMethod !== undefined) {
    if (calculationMethod !== null && !["added", "instead", "compounded"].includes(calculationMethod)) {
      throw new CustomError("Invalid calculation method. Must be 'added', 'instead', 'compounded', or null", 400);
    }
    update.calculationMethod = calculationMethod;
  }

  const updatedTaxRate = await TaxRateOverride.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  )
    .populate('storeId', 'storeName')
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code');

  if (!updatedTaxRate) {
    throw new CustomError("Tax rate not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedTaxRate,
    message: "Tax rate updated successfully",
  });
});

// Delete a tax rate
export const deleteTaxRate = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new CustomError("Tax rate ID is required", 400);
  }

  const deletedTaxRate = await TaxRateOverride.findByIdAndDelete(id);

  if (!deletedTaxRate) {
    throw new CustomError("Tax rate not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {},
    message: "Tax rate deleted successfully",
  });
});

// Get tax rate by ID
export const getTaxRateById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new CustomError("Tax rate ID is required", 400);
  }

  const taxRate = await TaxRateOverride.findById(id)
    .populate('countryId', 'name iso2')
    .populate('stateId', 'name code');

  if (!taxRate) {
    throw new CustomError("Tax rate not found", 404);
  }

  res.status(200).json({
    success: true,
    data: taxRate,
  });
});

// Get states with tax details (overrides if exist, otherwise defaults)
export const getStatesWithTaxDetails = asyncErrorHandler(async (req: Request, res: Response) => {
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

  // Verify country exists
  const country = await Country.findById(countryId).lean();
  if (!country) {
    throw new CustomError("Country not found", 404);
  }

  // Get all states for this country
  const states = await State.find({ countryId: new mongoose.Types.ObjectId(countryId) })
    .sort({ name: 1 })
    .lean();

  // Get all tax overrides for this store and country
  const taxOverrides = await TaxRateOverride.find({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
  })
    .populate('stateId', 'name code')
    .lean();

  // Create a map of stateId -> tax override for quick lookup
  const overrideMap = new Map<string, any>();
  taxOverrides.forEach((override) => {
    if (override.stateId) {
      const stateIdStr = typeof override.stateId === 'object' && override.stateId._id
        ? override.stateId._id.toString()
        : override.stateId.toString();
      overrideMap.set(stateIdStr, override);
    }
  });

  // Get federal tax rate (stateId = null) if it exists
  const federalTaxOverride = taxOverrides.find(
    (override) => override.stateId === null || override.stateId === undefined
  );

  // Default federal tax rate (can be customized based on country)
  const defaultFederalRate = federalTaxOverride
    ? federalTaxOverride.taxRate
    : country.name.toLowerCase() === 'india' ? 9 : 0; // Default 9% for India, 0% for others

  // Merge states with tax details
  const statesWithTaxDetails = states.map((state) => {
    const stateIdStr = state._id.toString();
    const override = overrideMap.get(stateIdStr);

    if (override) {
      // Use override values
      return {
        _id: state._id,
        name: state.name,
        code: state.code,
        type: state.type,
        countryId: state.countryId,
        countryIso2: state.countryIso2,
        taxRate: override.taxRate,
        taxLabel: override.taxLabel || null,
        calculationMethod: override.calculationMethod || null,
        isOverride: true,
        overrideId: override._id,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      };
    } else {
      // Use default values
      // For India, default state rate is 18% (IGST), for others use 0% or federal rate
      const defaultStateRate = country.name.toLowerCase() === 'india' ? 18 : defaultFederalRate;
      const defaultTaxLabel = country.name.toLowerCase() === 'india' ? 'IGST' : null;

      return {
        _id: state._id,
        name: state.name,
        code: state.code,
        type: state.type,
        countryId: state.countryId,
        countryIso2: state.countryIso2,
        taxRate: defaultStateRate,
        taxLabel: defaultTaxLabel,
        calculationMethod: country.name.toLowerCase() === 'india' ? 'instead' : null,
        isOverride: false,
        overrideId: null,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      };
    }
  });

  // Include federal tax rate info
  const federalTaxInfo = {
    taxRate: defaultFederalRate,
    taxLabel: federalTaxOverride?.taxLabel || (country.name.toLowerCase() === 'india' ? 'GST' : null),
    calculationMethod: null, // Federal tax doesn't have calculation method
    isOverride: !!federalTaxOverride,
    overrideId: federalTaxOverride?._id || null,
  };

  res.status(200).json({
    success: true,
    data: {
      country: {
        _id: country._id,
        name: country.name,
        iso2: country.iso2,
      },
      federalTax: federalTaxInfo,
      states: statesWithTaxDetails,
    },
    count: statesWithTaxDetails.length,
    message: "States with tax details fetched successfully",
  });
});

// Delete all tax overrides for a store and country
export const deleteTaxOverridesByStoreAndCountry = asyncErrorHandler(async (req: Request, res: Response) => {
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

  // Verify country exists
  const country = await Country.findById(countryId).lean();
  if (!country) {
    throw new CustomError("Country not found", 404);
  }

  // Delete all tax overrides for this store and country
  const deleteResult = await TaxRateOverride.deleteMany({
    storeId: new mongoose.Types.ObjectId(storeId),
    countryId: new mongoose.Types.ObjectId(countryId),
  });

  res.status(200).json({
    success: true,
    data: {
      deletedCount: deleteResult.deletedCount,
      storeId,
      countryId,
    },
    message: `Successfully deleted ${deleteResult.deletedCount} tax override(s) for store and country`,
  });
});

