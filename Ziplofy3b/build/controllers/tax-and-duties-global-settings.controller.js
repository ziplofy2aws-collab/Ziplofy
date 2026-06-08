"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaxAndDutiesGlobalSettings = exports.getTaxAndDutiesGlobalSettingsByStoreId = void 0;
const tax_and_duties_global_settings_model_1 = require("../models/tax-and-duties-global-settings/tax-and-duties-global-settings.model");
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Get tax and duties global settings by store ID
exports.getTaxAndDutiesGlobalSettingsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Verify that the store exists
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    let settings = await tax_and_duties_global_settings_model_1.TaxAndDutiesGlobalSettings.findOne({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
    })
        .populate("storeId", "storeName");
    // If no settings exist, create default settings with all options set to false
    if (!settings) {
        const defaultSettingsData = {
            storeId: new mongoose_1.default.Types.ObjectId(storeId),
            includeSalesTaxInProductPriceAndShippingRate: false,
            chargeSalesTaxOnShipping: false,
            chargeVATOnDigitalGoods: false,
        };
        const newSettings = await tax_and_duties_global_settings_model_1.TaxAndDutiesGlobalSettings.create(defaultSettingsData);
        settings = await tax_and_duties_global_settings_model_1.TaxAndDutiesGlobalSettings.findById(newSettings._id)
            .populate("storeId", "storeName");
    }
    res.status(200).json({
        success: true,
        data: settings,
        message: "Tax and duties global settings fetched successfully",
    });
});
// Update tax and duties global settings by ID
exports.updateTaxAndDutiesGlobalSettings = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { includeSalesTaxInProductPriceAndShippingRate, chargeSalesTaxOnShipping, chargeVATOnDigitalGoods } = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Settings ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid settings ID format", 400);
    }
    // Build update payload with only provided fields
    const updatePayload = {};
    if (includeSalesTaxInProductPriceAndShippingRate !== undefined) {
        if (typeof includeSalesTaxInProductPriceAndShippingRate !== "boolean") {
            throw new error_utils_1.CustomError("includeSalesTaxInProductPriceAndShippingRate must be a boolean", 400);
        }
        updatePayload.includeSalesTaxInProductPriceAndShippingRate = includeSalesTaxInProductPriceAndShippingRate;
    }
    if (chargeSalesTaxOnShipping !== undefined) {
        if (typeof chargeSalesTaxOnShipping !== "boolean") {
            throw new error_utils_1.CustomError("chargeSalesTaxOnShipping must be a boolean", 400);
        }
        updatePayload.chargeSalesTaxOnShipping = chargeSalesTaxOnShipping;
    }
    if (chargeVATOnDigitalGoods !== undefined) {
        if (typeof chargeVATOnDigitalGoods !== "boolean") {
            throw new error_utils_1.CustomError("chargeVATOnDigitalGoods must be a boolean", 400);
        }
        updatePayload.chargeVATOnDigitalGoods = chargeVATOnDigitalGoods;
    }
    // Check if there's anything to update
    if (Object.keys(updatePayload).length === 0) {
        throw new error_utils_1.CustomError("No valid fields provided for update", 400);
    }
    // Update the settings
    const updatedSettings = await tax_and_duties_global_settings_model_1.TaxAndDutiesGlobalSettings.findByIdAndUpdate(id, { $set: updatePayload }, { new: true, runValidators: true })
        .populate("storeId", "storeName");
    if (!updatedSettings) {
        throw new error_utils_1.CustomError("Tax and duties global settings not found", 404);
    }
    res.status(200).json({
        success: true,
        data: updatedSettings,
        message: "Tax and duties global settings updated successfully",
    });
});
