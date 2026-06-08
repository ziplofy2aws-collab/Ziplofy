"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingProfile = exports.updateShippingProfile = exports.getShippingProfilesByStoreId = exports.createShippingProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const shipping_profile_model_1 = require("../models/shipping-profile/shipping-profile.model");
const shipping_profile_product_variants_entry_model_1 = require("../models/shipping-profile/shipping-profile-product-variants-entry.model");
const shipping_profile_location_settings_model_1 = require("../models/shipping-profile/shipping-profile-location-settings.model");
const shipping_profile_shipping_zones_entry_model_1 = require("../models/shipping-profile/shipping-profile-shipping-zones-entry.model");
const store_model_1 = require("../models/store/store.model");
const location_model_1 = require("../models/location/location.model");
const shipping_zone_model_1 = require("../models/shipping-zone/shipping-zone.model");
const shipping_zone_country_entry_model_1 = require("../models/shipping-zone/shipping-zone-country-entry.model");
const shipping_zone_country_state_entry_model_1 = require("../models/shipping-zone/shipping-zone-country-state-entry.model");
const shipping_zone_rate_model_1 = require("../models/shipping-zone/shipping-zone-rate.model");
const error_utils_1 = require("../utils/error.utils");
// Helper function to enrich profile with related data
const enrichProfileData = async (profileId) => {
    // Fetch product variants with populated data (including product info)
    const variantEntries = await shipping_profile_product_variants_entry_model_1.ShippingProfileProductVariantsEntry.find({ shippingProfileId: profileId })
        .populate({
        path: 'productVariantId',
        populate: {
            path: 'productId',
            select: 'title imageUrls',
        },
    })
        .lean();
    const productVariantIds = variantEntries.map((entry) => {
        const variant = entry.productVariantId;
        // Return populated variant object if it exists, otherwise return the ID as string
        return variant && typeof variant === 'object' && '_id' in variant ? variant : String(entry.productVariantId);
    });
    // Fetch location settings with populated location data
    const locationEntries = await shipping_profile_location_settings_model_1.ShippingProfileLocationSettings.find({ shippingProfileId: profileId })
        .populate('locationId')
        .lean();
    const locationSettings = locationEntries.map((entry) => {
        const location = entry.locationId;
        // Extract locationId as string (either from populated object or direct ID)
        const locationIdString = location && typeof location === 'object' && '_id' in location
            ? String(location._id)
            : String(entry.locationId);
        return {
            locationId: locationIdString, // Always return the ID as string
            location: location && typeof location === 'object' && '_id' in location ? location : null, // Populated location object or null
            createNewRates: entry.createNewRates,
            removeRates: entry.removeRates,
        };
    });
    // Fetch shipping zones with populated data
    const zoneEntries = await shipping_profile_shipping_zones_entry_model_1.ShippingProfileShippingZonesEntry.find({ shippingProfileId: profileId })
        .populate('shippingZoneId')
        .lean();
    const shippingZoneIds = zoneEntries.map((entry) => {
        const zone = entry.shippingZoneId;
        // Return populated zone object if it exists, otherwise return the ID as string
        return zone && typeof zone === 'object' && '_id' in zone ? zone : String(entry.shippingZoneId);
    });
    return {
        productVariantIds,
        locationSettings,
        shippingZoneIds,
    };
};
// POST /shipping-profiles
exports.createShippingProfile = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { profileName, storeId } = req.body;
    // Validate required fields
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    if (!profileName || typeof profileName !== 'string' || !profileName.trim()) {
        throw new error_utils_1.CustomError('profileName is required', 400);
    }
    // Verify store exists
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError('Store not found', 404);
    }
    // Check if profile with same name already exists for this store
    const existingProfile = await shipping_profile_model_1.ShippingProfile.findOne({
        storeId,
        profileName: profileName.trim(),
    }).lean();
    if (existingProfile) {
        throw new error_utils_1.CustomError('Shipping profile with this name already exists for this store', 409);
    }
    // Create the profile
    const createdProfile = await shipping_profile_model_1.ShippingProfile.create({
        storeId,
        profileName: profileName.trim(),
    });
    const profileId = createdProfile._id;
    // Fetch all locations for this store
    const storeLocations = await location_model_1.LocationModel.find({ storeId }).select('_id').lean();
    // Create location settings entries for all store locations with default "create new rates" option
    if (storeLocations.length > 0) {
        const locationEntries = storeLocations.map((location) => ({
            shippingProfileId: profileId,
            locationId: location._id,
            storeId,
            createNewRates: true,
            removeRates: false,
        }));
        await shipping_profile_location_settings_model_1.ShippingProfileLocationSettings.insertMany(locationEntries);
    }
    // Populate store reference
    const populatedProfile = await shipping_profile_model_1.ShippingProfile.findById(createdProfile._id)
        .populate('storeId', 'storeName')
        .lean();
    if (!populatedProfile) {
        throw new error_utils_1.CustomError('Failed to fetch created profile', 500);
    }
    // Enrich with related data
    const enrichedData = await enrichProfileData(profileId);
    // Build response data with consistent shape
    const responseData = {
        ...populatedProfile,
        productVariantIds: enrichedData.productVariantIds,
        locationSettings: enrichedData.locationSettings,
        shippingZoneIds: enrichedData.shippingZoneIds,
    };
    return res.status(201).json({
        success: true,
        data: responseData,
        message: 'Shipping profile created successfully',
        meta: {
            store: {
                id: String(store._id),
                name: store.storeName,
            },
            productVariantsCount: enrichedData.productVariantIds.length,
            locationsCount: enrichedData.locationSettings.length,
            shippingZonesCount: enrichedData.shippingZoneIds.length,
        },
    });
});
// GET /shipping-profiles/store/:storeId
exports.getShippingProfilesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    // Verify store exists
    const store = await store_model_1.Store.findById(storeId).select('storeName').lean();
    if (!store) {
        throw new error_utils_1.CustomError('Store not found', 404);
    }
    // Fetch all profiles for this store
    const profiles = await shipping_profile_model_1.ShippingProfile.find({ storeId })
        .populate('storeId', 'storeName')
        .sort({ createdAt: -1 })
        .lean();
    // Enrich each profile with related data
    const enrichedProfiles = await Promise.all(profiles.map(async (profile) => {
        const enrichedData = await enrichProfileData(profile._id);
        return {
            ...profile,
            productVariantIds: enrichedData.productVariantIds,
            locationSettings: enrichedData.locationSettings,
            shippingZoneIds: enrichedData.shippingZoneIds,
        };
    }));
    return res.status(200).json({
        success: true,
        data: enrichedProfiles,
        message: 'Shipping profiles fetched successfully',
        meta: {
            total: enrichedProfiles.length,
            store: {
                id: String(store._id),
                name: store.storeName,
            },
        },
    });
});
// PUT /shipping-profiles/:id
exports.updateShippingProfile = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { profileName } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipping profile ID is required', 400);
    }
    // Verify profile exists
    const profile = await shipping_profile_model_1.ShippingProfile.findById(id).lean();
    if (!profile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    const storeId = String(profile.storeId);
    const update = {};
    // Update profile name if provided
    if (profileName !== undefined) {
        if (typeof profileName !== 'string' || !profileName.trim()) {
            throw new error_utils_1.CustomError('profileName must be a non-empty string', 400);
        }
        // Check if another profile with same name exists for this store
        const existingProfile = await shipping_profile_model_1.ShippingProfile.findOne({
            storeId: profile.storeId,
            profileName: profileName.trim(),
            _id: { $ne: id },
        }).lean();
        if (existingProfile) {
            throw new error_utils_1.CustomError('Shipping profile with this name already exists for this store', 409);
        }
        update.profileName = profileName.trim();
    }
    if (profileName === undefined) {
        throw new error_utils_1.CustomError('profileName is required to update a shipping profile', 400);
    }
    if (Object.keys(update).length > 0) {
        await shipping_profile_model_1.ShippingProfile.findByIdAndUpdate(id, { $set: update });
    }
    // Fetch updated profile with store reference
    const updatedProfile = await shipping_profile_model_1.ShippingProfile.findById(id)
        .populate('storeId', 'storeName')
        .lean();
    if (!updatedProfile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    // Get store info
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError('Store not found', 404);
    }
    // Enrich with related data
    const enrichedData = await enrichProfileData(new mongoose_1.default.Types.ObjectId(id));
    // Build response data with consistent shape
    const responseData = {
        ...updatedProfile,
        productVariantIds: enrichedData.productVariantIds,
        locationSettings: enrichedData.locationSettings,
        shippingZoneIds: enrichedData.shippingZoneIds,
    };
    return res.status(200).json({
        success: true,
        data: responseData,
        message: 'Shipping profile updated successfully',
        meta: {
            store: {
                id: String(store._id),
                name: store.storeName,
            },
            productVariantsCount: enrichedData.productVariantIds.length,
            locationsCount: enrichedData.locationSettings.length,
            shippingZonesCount: enrichedData.shippingZoneIds.length,
        },
    });
});
// DELETE /shipping-profiles/:id
exports.deleteShippingProfile = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipping profile ID is required', 400);
    }
    const profile = await shipping_profile_model_1.ShippingProfile.findById(id).lean();
    if (!profile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    const store = await store_model_1.Store.findById(profile.storeId).select('storeName').lean();
    // Gather related shipping zones for cleanup
    const zones = await shipping_zone_model_1.ShippingZone.find({ shippingProfileId: id }).select('_id').lean();
    const zoneIds = zones.map((zone) => zone._id);
    let countryEntryIds = [];
    if (zoneIds.length > 0) {
        const countryEntries = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.find({ shippingZoneId: { $in: zoneIds } })
            .select('_id')
            .lean();
        countryEntryIds = countryEntries.map((entry) => entry._id);
    }
    await Promise.all([
        shipping_profile_product_variants_entry_model_1.ShippingProfileProductVariantsEntry.deleteMany({ shippingProfileId: id }),
        shipping_profile_location_settings_model_1.ShippingProfileLocationSettings.deleteMany({ shippingProfileId: id }),
        shipping_profile_shipping_zones_entry_model_1.ShippingProfileShippingZonesEntry.deleteMany({ shippingProfileId: id }),
        zoneIds.length > 0 ? shipping_zone_rate_model_1.ShippingZoneRate.deleteMany({ shippingZoneId: { $in: zoneIds } }) : Promise.resolve(),
        countryEntryIds.length > 0
            ? shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.deleteMany({ shippingZoneCountryEntryId: { $in: countryEntryIds } })
            : Promise.resolve(),
        zoneIds.length > 0 ? shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.deleteMany({ shippingZoneId: { $in: zoneIds } }) : Promise.resolve(),
    ]);
    if (zoneIds.length > 0) {
        await shipping_zone_model_1.ShippingZone.deleteMany({ _id: { $in: zoneIds } });
    }
    await shipping_profile_model_1.ShippingProfile.findByIdAndDelete(id);
    return res.status(200).json({
        success: true,
        data: { deletedId: String(id) },
        message: 'Shipping profile deleted successfully',
        meta: {
            store: store
                ? {
                    id: String(store._id),
                    name: store.storeName,
                }
                : undefined,
            removed: {
                shippingZones: zoneIds.length,
                countryEntries: countryEntryIds.length,
            },
        },
    });
});
