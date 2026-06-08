"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingOverride = exports.updateShippingOverride = exports.getShippingOverrideById = exports.getShippingOverridesByStoreAndCountry = exports.createShippingOverride = void 0;
const shipping_override_model_1 = require("../models/shipping-override/shipping-override.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new shipping override
exports.createShippingOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId, stateId, taxRate, isActive } = req.body;
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
    // If stateId is provided, validate it and check for duplicates
    if (stateId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(stateId)) {
            throw new error_utils_1.CustomError("Invalid state ID format", 400);
        }
        // Check if shipping override already exists for this store-country-state combination
        const existingShippingOverride = await shipping_override_model_1.ShippingOverride.findOne({
            storeId,
            countryId,
            stateId: new mongoose_1.default.Types.ObjectId(stateId),
        });
        if (existingShippingOverride) {
            throw new error_utils_1.CustomError(`Shipping override already exists for this state. You cannot add the same state twice for this store and country.`, 400);
        }
    }
    else {
        // Check for country-level override (null stateId)
        const existingShippingOverride = await shipping_override_model_1.ShippingOverride.findOne({
            storeId,
            countryId,
            stateId: null,
        });
        if (existingShippingOverride) {
            throw new error_utils_1.CustomError("Shipping override already exists for this country at the federal level", 400);
        }
    }
    const shippingOverrideData = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
        stateId: stateId ? new mongoose_1.default.Types.ObjectId(stateId) : null,
        taxRate,
        isActive: isActive !== undefined ? isActive : true,
    };
    const newShippingOverride = await shipping_override_model_1.ShippingOverride.create(shippingOverrideData);
    const populatedShippingOverride = await shipping_override_model_1.ShippingOverride.findById(newShippingOverride._id)
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
exports.getShippingOverridesByStoreAndCountry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
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
    const shippingOverrides = await shipping_override_model_1.ShippingOverride.find({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
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
exports.getShippingOverrideById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Shipping override ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid shipping override ID", 400);
    }
    const shippingOverride = await shipping_override_model_1.ShippingOverride.findById(id)
        .populate('storeId', 'storeName')
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code');
    if (!shippingOverride) {
        throw new error_utils_1.CustomError("Shipping override not found", 404);
    }
    res.status(200).json({
        success: true,
        data: shippingOverride,
    });
});
// Update a shipping override
exports.updateShippingOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { taxRate, isActive } = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Shipping override ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid shipping override ID", 400);
    }
    const update = {};
    if (taxRate !== undefined) {
        if (taxRate < 0 || taxRate > 100) {
            throw new error_utils_1.CustomError("Tax rate must be between 0 and 100", 400);
        }
        update.taxRate = taxRate;
    }
    if (isActive !== undefined) {
        update.isActive = isActive;
    }
    const updatedShippingOverride = await shipping_override_model_1.ShippingOverride.findByIdAndUpdate(id, update, { new: true, runValidators: true })
        .populate('storeId', 'storeName')
        .populate('countryId', 'name iso2')
        .populate('stateId', 'name code');
    if (!updatedShippingOverride) {
        throw new error_utils_1.CustomError("Shipping override not found", 404);
    }
    res.status(200).json({
        success: true,
        data: updatedShippingOverride,
        message: "Shipping override updated successfully",
    });
});
// Delete a shipping override
exports.deleteShippingOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Shipping override ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid shipping override ID", 400);
    }
    const deletedShippingOverride = await shipping_override_model_1.ShippingOverride.findByIdAndDelete(id);
    if (!deletedShippingOverride) {
        throw new error_utils_1.CustomError("Shipping override not found", 404);
    }
    res.status(200).json({
        success: true,
        data: {},
        message: "Shipping override deleted successfully",
    });
});
