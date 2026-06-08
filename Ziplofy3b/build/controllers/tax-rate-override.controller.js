"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaxOverridesByStoreAndCountry = exports.getStatesWithTaxDetails = exports.getTaxRateById = exports.deleteTaxRate = exports.updateTaxRate = exports.getTaxRateByStoreAndState = exports.getTaxRatesByStoreId = exports.createTaxRate = void 0;
const tax_rate_override_model_1 = require("../models/tax-rate-override/tax-rate-override.model");
const state_model_1 = require("../models/state/state.model");
const country_model_1 = require("../models/country/country.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new tax rate
exports.createTaxRate = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId, stateId, taxRate, taxLabel, calculationMethod } = req.body;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!taxLabel) {
        throw new error_utils_1.CustomError("Tax label is required", 400);
    }
    if (taxRate === undefined || taxRate === null) {
        throw new error_utils_1.CustomError("Tax rate is required", 400);
    }
    if (taxRate < 0 || taxRate > 100) {
        throw new error_utils_1.CustomError("Tax rate must be between 0 and 100", 400);
    }
    // Validate ObjectIds
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID format", 400);
    }
    if (stateId && !mongoose_1.default.Types.ObjectId.isValid(stateId)) {
        throw new error_utils_1.CustomError("Invalid state ID format", 400);
    }
    // Validate calculationMethod if provided
    if (calculationMethod !== undefined && calculationMethod !== null) {
        if (!["added", "instead", "compounded"].includes(calculationMethod)) {
            throw new error_utils_1.CustomError("Invalid calculation method. Must be 'added', 'instead', or 'compounded'", 400);
        }
    }
    // Check if tax rate already exists for this store-country-state combination
    const existingTaxRate = await tax_rate_override_model_1.TaxRateOverride.findOne({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
        stateId: stateId ? new mongoose_1.default.Types.ObjectId(stateId) : null,
    });
    if (existingTaxRate) {
        throw new error_utils_1.CustomError("Tax rate already exists for this store, country, and state combination", 400);
    }
    const taxRateData = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
        stateId: stateId ? new mongoose_1.default.Types.ObjectId(stateId) : null,
        taxRate,
        taxLabel: taxLabel.trim(),
        calculationMethod: calculationMethod || null,
    };
    const newTaxRate = await tax_rate_override_model_1.TaxRateOverride.create(taxRateData);
    const populatedTaxRate = await tax_rate_override_model_1.TaxRateOverride.findById(newTaxRate._id)
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
exports.getTaxRatesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { countryId, stateId } = req.query;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    const filter = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
    };
    if (countryId) {
        filter.countryId = new mongoose_1.default.Types.ObjectId(countryId);
    }
    if (stateId !== undefined) {
        if (stateId === 'null' || stateId === '') {
            filter.stateId = null; // For federal/country-level rates
        }
        else {
            filter.stateId = new mongoose_1.default.Types.ObjectId(stateId);
        }
    }
    const taxRates = await tax_rate_override_model_1.TaxRateOverride.find(filter)
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
exports.getTaxRateByStoreAndState = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, stateId } = req.params;
    const { countryId } = req.query;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!stateId) {
        throw new error_utils_1.CustomError("State ID is required", 400);
    }
    const filter = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        stateId: stateId === 'null' ? null : new mongoose_1.default.Types.ObjectId(stateId),
    };
    if (countryId) {
        filter.countryId = new mongoose_1.default.Types.ObjectId(countryId);
    }
    const taxRate = await tax_rate_override_model_1.TaxRateOverride.findOne(filter)
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code');
    if (!taxRate) {
        throw new error_utils_1.CustomError("Tax rate not found", 404);
    }
    res.status(200).json({
        success: true,
        data: taxRate,
    });
});
// Update a tax rate
exports.updateTaxRate = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { taxRate, taxLabel, calculationMethod } = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Tax rate ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid tax rate ID format", 400);
    }
    const update = {};
    if (taxRate !== undefined) {
        if (taxRate < 0 || taxRate > 100) {
            throw new error_utils_1.CustomError("Tax rate must be between 0 and 100", 400);
        }
        update.taxRate = taxRate;
    }
    if (taxLabel !== undefined) {
        if (!taxLabel || !taxLabel.trim()) {
            throw new error_utils_1.CustomError("Tax label is required", 400);
        }
        update.taxLabel = taxLabel.trim();
    }
    if (calculationMethod !== undefined) {
        if (calculationMethod !== null && !["added", "instead", "compounded"].includes(calculationMethod)) {
            throw new error_utils_1.CustomError("Invalid calculation method. Must be 'added', 'instead', 'compounded', or null", 400);
        }
        update.calculationMethod = calculationMethod;
    }
    const updatedTaxRate = await tax_rate_override_model_1.TaxRateOverride.findByIdAndUpdate(id, update, { new: true, runValidators: true })
        .populate('storeId', 'storeName')
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code');
    if (!updatedTaxRate) {
        throw new error_utils_1.CustomError("Tax rate not found", 404);
    }
    res.status(200).json({
        success: true,
        data: updatedTaxRate,
        message: "Tax rate updated successfully",
    });
});
// Delete a tax rate
exports.deleteTaxRate = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Tax rate ID is required", 400);
    }
    const deletedTaxRate = await tax_rate_override_model_1.TaxRateOverride.findByIdAndDelete(id);
    if (!deletedTaxRate) {
        throw new error_utils_1.CustomError("Tax rate not found", 404);
    }
    res.status(200).json({
        success: true,
        data: {},
        message: "Tax rate deleted successfully",
    });
});
// Get tax rate by ID
exports.getTaxRateById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Tax rate ID is required", 400);
    }
    const taxRate = await tax_rate_override_model_1.TaxRateOverride.findById(id)
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code');
    if (!taxRate) {
        throw new error_utils_1.CustomError("Tax rate not found", 404);
    }
    res.status(200).json({
        success: true,
        data: taxRate,
    });
});
// Get states with tax details (overrides if exist, otherwise defaults)
exports.getStatesWithTaxDetails = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID", 400);
    }
    // Verify country exists
    const country = await country_model_1.Country.findById(countryId).lean();
    if (!country) {
        throw new error_utils_1.CustomError("Country not found", 404);
    }
    // Get all states for this country
    const states = await state_model_1.State.find({ countryId: new mongoose_1.default.Types.ObjectId(countryId) })
        .sort({ name: 1 })
        .lean();
    // Get all tax overrides for this store and country
    const taxOverrides = await tax_rate_override_model_1.TaxRateOverride.find({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
    })
        .populate('stateId', 'name code')
        .lean();
    // Create a map of stateId -> tax override for quick lookup
    const overrideMap = new Map();
    taxOverrides.forEach((override) => {
        if (override.stateId) {
            const stateIdStr = typeof override.stateId === 'object' && override.stateId._id
                ? override.stateId._id.toString()
                : override.stateId.toString();
            overrideMap.set(stateIdStr, override);
        }
    });
    // Get federal tax rate (stateId = null) if it exists
    const federalTaxOverride = taxOverrides.find((override) => override.stateId === null || override.stateId === undefined);
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
        }
        else {
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
exports.deleteTaxOverridesByStoreAndCountry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID", 400);
    }
    // Verify country exists
    const country = await country_model_1.Country.findById(countryId).lean();
    if (!country) {
        throw new error_utils_1.CustomError("Country not found", 404);
    }
    // Delete all tax overrides for this store and country
    const deleteResult = await tax_rate_override_model_1.TaxRateOverride.deleteMany({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
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
