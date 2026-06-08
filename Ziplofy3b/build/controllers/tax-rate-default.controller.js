"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaxDefaultById = exports.getTaxDefaultByCountryAndState = exports.getTaxDefaultsByCountryId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tax_rate_default_model_1 = require("../models/tax-rate-default/tax-rate-default.model");
const tax_rate_override_model_1 = require("../models/tax-rate-override/tax-rate-override.model");
const error_utils_1 = require("../utils/error.utils");
// Get tax defaults by country ID (with optional storeId to check for overrides)
exports.getTaxDefaultsByCountryId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { countryId } = req.params;
    const { storeId } = req.query;
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID", 400);
    }
    const countryObjectId = new mongoose_1.default.Types.ObjectId(countryId);
    // Get all tax defaults for this country
    const taxDefaults = await tax_rate_default_model_1.TaxDefault.find({
        countryId: countryObjectId,
    })
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code')
        .sort({ stateId: 1, taxLabel: 1 })
        .lean();
    // If storeId is provided, check for overrides
    if (storeId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
            throw new error_utils_1.CustomError("Invalid store ID", 400);
        }
        const storeObjectId = new mongoose_1.default.Types.ObjectId(storeId);
        // Get all tax overrides for this store and country
        const taxOverrides = await tax_rate_override_model_1.TaxRateOverride.find({
            storeId: storeObjectId,
            countryId: countryObjectId,
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
        // Get federal tax override (stateId = null) if it exists
        const federalTaxOverride = taxOverrides.find((override) => override.stateId === null || override.stateId === undefined);
        // Merge defaults with overrides
        const mergedTaxDefaults = taxDefaults.map((defaultTax) => {
            // For federal/country-level defaults (stateId === null)
            if (!defaultTax.stateId || defaultTax.stateId === null) {
                if (federalTaxOverride) {
                    // Use override values
                    return {
                        ...defaultTax,
                        taxRate: federalTaxOverride.taxRate,
                        taxLabel: federalTaxOverride.taxLabel || defaultTax.taxLabel,
                        calculationMethod: null, // Federal tax doesn't have calculation method
                        isOverride: true,
                        overridden: true,
                        overrideId: federalTaxOverride._id,
                    };
                }
                // Use default values
                return {
                    ...defaultTax,
                    isOverride: false,
                    overridden: false,
                    overrideId: null,
                };
            }
            // For state-level defaults
            const stateIdStr = typeof defaultTax.stateId === 'object' && defaultTax.stateId._id
                ? defaultTax.stateId._id.toString()
                : defaultTax.stateId.toString();
            const override = overrideMap.get(stateIdStr);
            if (override) {
                // Use override values
                return {
                    ...defaultTax,
                    taxRate: override.taxRate,
                    taxLabel: override.taxLabel || defaultTax.taxLabel,
                    calculationMethod: override.calculationMethod || defaultTax.calculationMethod,
                    isOverride: true,
                    overridden: true,
                    overrideId: override._id,
                };
            }
            // Use default values
            return {
                ...defaultTax,
                isOverride: false,
                overridden: false,
                overrideId: null,
            };
        });
        res.status(200).json({
            success: true,
            data: mergedTaxDefaults,
            count: mergedTaxDefaults.length,
        });
    }
    else {
        // No storeId provided, return defaults only
        const defaultsWithFlags = taxDefaults.map((defaultTax) => ({
            ...defaultTax,
            isOverride: false,
            overridden: false,
            overrideId: null,
        }));
        res.status(200).json({
            success: true,
            data: defaultsWithFlags,
            count: defaultsWithFlags.length,
        });
    }
});
// Get tax default by country ID and state ID
exports.getTaxDefaultByCountryAndState = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { countryId, stateId } = req.params;
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID", 400);
    }
    const filter = {
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
        stateId: stateId === 'null' || stateId === 'federal' ? null : new mongoose_1.default.Types.ObjectId(stateId),
    };
    const taxDefault = await tax_rate_default_model_1.TaxDefault.findOne(filter)
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code');
    if (!taxDefault) {
        throw new error_utils_1.CustomError("Tax default not found", 404);
    }
    res.status(200).json({
        success: true,
        data: taxDefault,
    });
});
// Get tax default by ID
exports.getTaxDefaultById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Tax default ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid tax default ID", 400);
    }
    const taxDefault = await tax_rate_default_model_1.TaxDefault.findById(id)
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code');
    if (!taxDefault) {
        throw new error_utils_1.CustomError("Tax default not found", 404);
    }
    res.status(200).json({
        success: true,
        data: taxDefault,
    });
});
