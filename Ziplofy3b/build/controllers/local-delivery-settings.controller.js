"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalDeliverySettingsByStoreId = exports.createLocalDeliverySettings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const local_delivery_settings_model_1 = require("../models/local-delivery-settings/local-delivery-settings.model");
const location_model_1 = require("../models/location/location.model");
const local_delivery_location_entry_model_1 = require("../models/local-delivery-settings/local-delivery-location-entry.model");
const error_utils_1 = require("../utils/error.utils");
exports.createLocalDeliverySettings = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('A valid storeId is required', 400);
    }
    const existing = await local_delivery_settings_model_1.LocalDeliverySettings.findOne({ storeId });
    if (existing) {
        throw new error_utils_1.CustomError('Local delivery settings already exist for this store', 409);
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const settings = await local_delivery_settings_model_1.LocalDeliverySettings.create([{ storeId }], { session });
        const storeLocations = await location_model_1.LocationModel.find({ storeId }).select(['_id', 'canLocalDeliver']).lean();
        if (storeLocations.length) {
            const entriesPayload = storeLocations.map((location) => ({
                localDeliveryId: settings[0]._id,
                locationId: location._id,
                canLocalDeliver: Boolean(location.canLocalDeliver),
                deliveryZoneType: 'radius',
                includeNeighboringStates: false,
                radiusUnit: 'km',
                deliveryZones: [],
            }));
            await local_delivery_location_entry_model_1.LocalDeliveryLocationEntry.insertMany(entriesPayload, { session });
        }
        await session.commitTransaction();
        return res.status(201).json({
            success: true,
            data: settings[0],
            message: 'Local delivery settings created successfully',
        });
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.getLocalDeliverySettingsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('A valid storeId is required', 400);
    }
    const settings = await local_delivery_settings_model_1.LocalDeliverySettings.findOne({ storeId });
    if (!settings) {
        throw new error_utils_1.CustomError('Local delivery settings not found for this store', 404);
    }
    return res.status(200).json({
        success: true,
        data: settings,
        message: 'Local delivery settings fetched successfully',
    });
});
