"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShippingProfileLocationSetting = exports.getShippingProfileLocationSettings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const shipping_profile_model_1 = require("../models/shipping-profile/shipping-profile.model");
const shipping_profile_location_settings_model_1 = require("../models/shipping-profile/shipping-profile-location-settings.model");
exports.getShippingProfileLocationSettings = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { profileId } = req.params;
    if (!profileId || !mongoose_1.default.isValidObjectId(profileId)) {
        throw new error_utils_1.CustomError('Valid shipping profile ID is required', 400);
    }
    const profile = await shipping_profile_model_1.ShippingProfile.findById(profileId).select('_id').lean();
    if (!profile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    const settings = await shipping_profile_location_settings_model_1.ShippingProfileLocationSettings.find({ shippingProfileId: profileId })
        .populate('locationId')
        .lean();
    const formatted = settings.map((setting) => {
        const location = setting.locationId;
        return {
            _id: setting._id,
            shippingProfileId: setting.shippingProfileId,
            locationId: setting.locationId,
            location: location && typeof location === 'object' && '_id' in location
                ? location
                : null,
            createNewRates: setting.createNewRates,
            removeRates: setting.removeRates,
            storeId: setting.storeId,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt,
        };
    });
    return res.status(200).json({
        success: true,
        data: formatted,
        message: 'Location settings fetched successfully',
        meta: {
            shippingProfileId: String(profileId),
            total: formatted.length,
        },
    });
});
exports.updateShippingProfileLocationSetting = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { profileId, locationId } = req.params;
    const { createNewRates, removeRates } = req.body;
    if (!profileId || !mongoose_1.default.isValidObjectId(profileId)) {
        throw new error_utils_1.CustomError('Valid shipping profile ID is required', 400);
    }
    if (!locationId || !mongoose_1.default.isValidObjectId(locationId)) {
        throw new error_utils_1.CustomError('Valid location ID is required', 400);
    }
    if (typeof createNewRates !== 'boolean' || typeof removeRates !== 'boolean') {
        throw new error_utils_1.CustomError('createNewRates and removeRates are required boolean values', 400);
    }
    const profile = await shipping_profile_model_1.ShippingProfile.findById(profileId).select('_id').lean();
    if (!profile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    const locationSetting = await shipping_profile_location_settings_model_1.ShippingProfileLocationSettings.findOneAndUpdate({ shippingProfileId: profileId, locationId }, {
        createNewRates,
        removeRates,
    }, { new: true })
        .populate('locationId')
        .lean();
    if (!locationSetting) {
        throw new error_utils_1.CustomError('Location setting not found for this shipping profile', 404);
    }
    const location = locationSetting.locationId;
    return res.status(200).json({
        success: true,
        data: {
            _id: locationSetting._id,
            shippingProfileId: locationSetting.shippingProfileId,
            locationId: locationSetting.locationId,
            location: location && typeof location === 'object' && '_id' in location
                ? location
                : null,
            createNewRates: locationSetting.createNewRates,
            removeRates: locationSetting.removeRates,
            storeId: locationSetting.storeId,
        },
        message: 'Location settings updated successfully',
        meta: {
            shippingProfileId: String(profileId),
        },
    });
});
