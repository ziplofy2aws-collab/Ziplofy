"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeneralSettingsByStoreId = exports.updateGeneralSettings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const general_settings_model_1 = require("../models/general-settings/general-settings.model");
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("../utils/error.utils");
const extractPayload = (body) => {
    const payload = {};
    const assignIfDefined = (key) => {
        if (body[key] !== undefined) {
            payload[key] = body[key];
        }
    };
    assignIfDefined('backupRegion');
    assignIfDefined('unitSystem');
    assignIfDefined('weightUnit');
    assignIfDefined('timeZone');
    assignIfDefined('orderIdPrefix');
    assignIfDefined('orderIdSuffix');
    assignIfDefined('fulfillmentOption');
    assignIfDefined('notifyCustomers');
    assignIfDefined('fulfillHighRiskOrders');
    assignIfDefined('autoArchive');
    assignIfDefined('storeName');
    assignIfDefined('storeEmail');
    assignIfDefined('storePhone');
    assignIfDefined('legalBusinessName');
    assignIfDefined('billingCountry');
    assignIfDefined('billingAddress');
    assignIfDefined('billingApartment');
    assignIfDefined('billingCity');
    assignIfDefined('billingState');
    assignIfDefined('billingPinCode');
    return payload;
};
exports.updateGeneralSettings = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid general settings id is required', 400);
    }
    const payload = extractPayload(req.body);
    // Update general settings
    const updated = await general_settings_model_1.GeneralSettings.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!updated) {
        throw new error_utils_1.CustomError('General settings not found', 404);
    }
    // If storeName is being updated, also update the Store model using storeId from request
    if (payload.storeName !== undefined && storeId) {
        if (!mongoose_1.default.isValidObjectId(storeId)) {
            throw new error_utils_1.CustomError('Valid storeId is required', 400);
        }
        await store_model_1.Store.findByIdAndUpdate(storeId, { $set: { storeName: payload.storeName } }, { new: true });
    }
    return res.status(200).json({ success: true, data: updated, message: 'General settings updated' });
});
exports.getGeneralSettingsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const settings = await general_settings_model_1.GeneralSettings.findOne({ storeId });
    return res.status(200).json({
        success: true,
        data: settings,
        message: settings ? 'General settings fetched' : 'No general settings found for this store',
    });
});
