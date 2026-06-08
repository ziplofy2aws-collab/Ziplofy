"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocation = exports.updateLocation = exports.getLocationsByStoreId = exports.createLocation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const location_model_1 = require("../models/location/location.model");
const error_utils_1 = require("../utils/error.utils");
// Create location
exports.createLocation = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name, countryRegion, address, apartment, city, state, postalCode, phone, canShip, canLocalDeliver, canPickup, isFulfillmentAllowed, } = req.body;
    if (!storeId || !name || !countryRegion || !address || !city || !state || !postalCode || !phone) {
        throw new error_utils_1.CustomError('Missing required fields', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    const location = await location_model_1.LocationModel.create({
        storeId,
        name,
        countryRegion,
        address,
        apartment,
        city,
        state,
        postalCode,
        phone,
        canShip,
        canLocalDeliver,
        canPickup,
        isFulfillmentAllowed,
    });
    res.status(201).json({ success: true, data: location, message: 'Location created successfully' });
});
// Get locations by store id
exports.getLocationsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError('storeId is required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    const locations = await location_model_1.LocationModel.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: locations, count: locations.length });
});
// Update location
exports.updateLocation = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const update = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid location id', 400);
    }
    // If storeId provided in update, validate
    if (update.storeId && !mongoose_1.default.isValidObjectId(update.storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    const location = await location_model_1.LocationModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!location) {
        throw new error_utils_1.CustomError('Location not found', 404);
    }
    res.status(200).json({ success: true, data: location, message: 'Location updated successfully' });
});
// Delete location
exports.deleteLocation = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid location id', 400);
    }
    const deleted = await location_model_1.LocationModel.findByIdAndDelete(id);
    if (!deleted) {
        throw new error_utils_1.CustomError('Location not found', 404);
    }
    res.status(200).json({
        success: true,
        data: { deletedLocation: { id: deleted._id, name: deleted.name } },
        message: 'Location deleted successfully',
    });
});
