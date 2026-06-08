"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCountryTaxOverrideByStoreAndCountry = exports.updateCountryTaxOverrideByStoreAndCountry = exports.getCountryTaxOverrideByStoreAndCountry = exports.createCountryTaxOverride = void 0;
const country_tax_override_model_1 = require("../models/country-tax-override/country-tax-override.model");
const country_model_1 = require("../models/country/country.model");
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new country tax override
exports.createCountryTaxOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId, taxRate } = req.body;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
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
    // Verify that the store exists
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    // Verify that the country exists
    const country = await country_model_1.Country.findById(countryId).lean();
    if (!country) {
        throw new error_utils_1.CustomError("Country not found", 404);
    }
    // Check if country tax override already exists for this store and country
    const existingOverride = await country_tax_override_model_1.CountryTaxOverride.findOne({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
    });
    if (existingOverride) {
        throw new error_utils_1.CustomError("Country tax override already exists for this store and country. You cannot create duplicate overrides.", 400);
    }
    const countryTaxOverrideData = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
        taxRate,
    };
    const newCountryTaxOverride = await country_tax_override_model_1.CountryTaxOverride.create(countryTaxOverrideData);
    const populatedCountryTaxOverride = await country_tax_override_model_1.CountryTaxOverride.findById(newCountryTaxOverride._id)
        .populate("storeId", "storeName")
        .populate("countryId", "name iso2 iso3");
    res.status(201).json({
        success: true,
        data: populatedCountryTaxOverride,
        message: "Country tax override created successfully",
    });
});
// Get country tax override by store ID and country ID
exports.getCountryTaxOverrideByStoreAndCountry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID format", 400);
    }
    // Verify that the store exists
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    // Verify that the country exists
    const country = await country_model_1.Country.findById(countryId).lean();
    if (!country) {
        throw new error_utils_1.CustomError("Country not found", 404);
    }
    // Get country tax override for this store and country
    const countryTaxOverride = await country_tax_override_model_1.CountryTaxOverride.findOne({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
    })
        .populate("storeId", "storeName")
        .populate("countryId", "name iso2 iso3")
        .lean();
    if (!countryTaxOverride) {
        throw new error_utils_1.CustomError("Country tax override not found for this store and country", 404);
    }
    res.status(200).json({
        success: true,
        data: countryTaxOverride,
        message: "Country tax override retrieved successfully",
    });
});
// Update country tax override by store ID and country ID
exports.updateCountryTaxOverrideByStoreAndCountry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId } = req.params;
    const { taxRate } = req.body;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID format", 400);
    }
    // Verify that the store exists
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    // Verify that the country exists
    const country = await country_model_1.Country.findById(countryId).lean();
    if (!country) {
        throw new error_utils_1.CustomError("Country not found", 404);
    }
    // Validate tax rate if provided
    if (taxRate !== undefined && taxRate !== null) {
        if (taxRate < 0 || taxRate > 100) {
            throw new error_utils_1.CustomError("Tax rate must be between 0 and 100", 400);
        }
    }
    else {
        throw new error_utils_1.CustomError("Tax rate is required", 400);
    }
    // Update country tax override for this store and country
    const updatedCountryTaxOverride = await country_tax_override_model_1.CountryTaxOverride.findOneAndUpdate({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
    }, {
        taxRate,
    }, {
        new: true,
        runValidators: true,
    })
        .populate("storeId", "storeName")
        .populate("countryId", "name iso2 iso3");
    if (!updatedCountryTaxOverride) {
        throw new error_utils_1.CustomError("Country tax override not found for this store and country", 404);
    }
    res.status(200).json({
        success: true,
        data: updatedCountryTaxOverride,
        message: "Country tax override updated successfully",
    });
});
// Delete country tax override by store ID and country ID
exports.deleteCountryTaxOverrideByStoreAndCountry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID format", 400);
    }
    // Verify that the store exists
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    // Verify that the country exists
    const country = await country_model_1.Country.findById(countryId).lean();
    if (!country) {
        throw new error_utils_1.CustomError("Country not found", 404);
    }
    // Delete country tax override for this store and country
    const deletedCountryTaxOverride = await country_tax_override_model_1.CountryTaxOverride.findOneAndDelete({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
    }).lean();
    if (!deletedCountryTaxOverride) {
        throw new error_utils_1.CustomError("Country tax override not found for this store and country", 404);
    }
    res.status(200).json({
        success: true,
        data: {},
        message: "Country tax override deleted successfully",
    });
});
