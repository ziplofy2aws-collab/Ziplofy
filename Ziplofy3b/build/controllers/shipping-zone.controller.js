"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingZone = exports.updateShippingZone = exports.getShippingZonesByShippingProfileId = exports.createShippingZone = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const shipping_zone_model_1 = require("../models/shipping-zone/shipping-zone.model");
const shipping_zone_country_entry_model_1 = require("../models/shipping-zone/shipping-zone-country-entry.model");
const shipping_zone_country_state_entry_model_1 = require("../models/shipping-zone/shipping-zone-country-state-entry.model");
const shipping_profile_model_1 = require("../models/shipping-profile/shipping-profile.model");
const country_model_1 = require("../models/country/country.model");
const state_model_1 = require("../models/state/state.model");
const error_utils_1 = require("../utils/error.utils");
const shipping_zone_rate_model_1 = require("../models/shipping-zone/shipping-zone-rate.model");
// POST /shipping-zones
exports.createShippingZone = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { zoneName, shippingProfileId, countries } = req.body;
    if (!shippingProfileId || !mongoose_1.default.isValidObjectId(shippingProfileId)) {
        throw new error_utils_1.CustomError('Valid shippingProfileId is required', 400);
    }
    if (!zoneName || typeof zoneName !== 'string' || !zoneName.trim()) {
        throw new error_utils_1.CustomError('zoneName is required', 400);
    }
    if (!countries || !Array.isArray(countries) || countries.length === 0) {
        throw new error_utils_1.CustomError('At least one country is required', 400);
    }
    // Verify shipping profile exists
    const shippingProfile = await shipping_profile_model_1.ShippingProfile.findById(shippingProfileId).lean();
    if (!shippingProfile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    // Check if zone with same name already exists for this shipping profile
    const existingZone = await shipping_zone_model_1.ShippingZone.findOne({ shippingProfileId, zoneName: zoneName.trim() }).lean();
    if (existingZone) {
        throw new error_utils_1.CustomError('Shipping zone with this name already exists for this shipping profile', 409);
    }
    // Validate countries and states
    const countryIds = new Set();
    for (const countryEntry of countries) {
        if (!countryEntry.countryId || !mongoose_1.default.isValidObjectId(countryEntry.countryId)) {
            throw new error_utils_1.CustomError('Invalid countryId provided', 400);
        }
        if (countryIds.has(countryEntry.countryId)) {
            throw new error_utils_1.CustomError('Duplicate countryId found', 400);
        }
        countryIds.add(countryEntry.countryId);
        // Validate stateIds if provided
        if (countryEntry.stateIds && Array.isArray(countryEntry.stateIds)) {
            const stateIdSet = new Set();
            for (const stateId of countryEntry.stateIds) {
                if (!mongoose_1.default.isValidObjectId(stateId)) {
                    throw new error_utils_1.CustomError(`Invalid stateId: ${stateId}`, 400);
                }
                if (stateIdSet.has(stateId)) {
                    throw new error_utils_1.CustomError(`Duplicate stateId: ${stateId}`, 400);
                }
                stateIdSet.add(stateId);
            }
        }
    }
    // Verify all countries exist
    const countryIdsArray = Array.from(countryIds);
    const existingCountries = await country_model_1.Country.find({ _id: { $in: countryIdsArray } }).lean();
    if (existingCountries.length !== countryIdsArray.length) {
        throw new error_utils_1.CustomError('One or more countries not found', 404);
    }
    // Verify all states exist and belong to their respective countries
    const allStateIds = [];
    const stateToCountryMap = new Map();
    for (const countryEntry of countries) {
        if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
            allStateIds.push(...countryEntry.stateIds);
            countryEntry.stateIds.forEach((stateId) => {
                stateToCountryMap.set(stateId, countryEntry.countryId);
            });
        }
    }
    if (allStateIds.length > 0) {
        const existingStates = await state_model_1.State.find({ _id: { $in: allStateIds } }).lean();
        if (existingStates.length !== allStateIds.length) {
            throw new error_utils_1.CustomError('One or more states not found', 404);
        }
        // Verify states belong to their respective countries
        for (const state of existingStates) {
            const expectedCountryId = stateToCountryMap.get(String(state._id));
            if (String(state.countryId) !== expectedCountryId) {
                throw new error_utils_1.CustomError(`State ${state.name} does not belong to the specified country`, 400);
            }
        }
    }
    // Create shipping zone
    const createdZone = await shipping_zone_model_1.ShippingZone.create({
        shippingProfileId,
        zoneName: zoneName.trim(),
    });
    // Create country entries and state entries
    const countryEntries = [];
    const stateEntries = [];
    for (const countryEntry of countries) {
        // Create country entry
        const countryEntryDoc = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.create({
            shippingZoneId: createdZone._id,
            countryId: countryEntry.countryId,
        });
        countryEntries.push(countryEntryDoc);
        // Create state entries if provided
        if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
            for (const stateId of countryEntry.stateIds) {
                stateEntries.push({
                    stateId,
                    shippingZoneCountryEntryId: countryEntryDoc._id,
                });
            }
        }
    }
    // Bulk create state entries if any
    if (stateEntries.length > 0) {
        await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.insertMany(stateEntries);
    }
    // Populate countries and states for the created zone
    const countryEntriesForResponse = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.find({
        shippingZoneId: createdZone._id,
    })
        .populate('countryId', 'name iso2 flagEmoji')
        .lean();
    const countriesWithStates = await Promise.all(countryEntriesForResponse.map(async (countryEntry) => {
        const stateEntries = await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.find({
            shippingZoneCountryEntryId: countryEntry._id,
        })
            .populate('stateId', 'name code')
            .lean();
        const country = countryEntry.countryId;
        const totalStates = await state_model_1.State.countDocuments({ countryId: countryEntry.countryId });
        const stateIds = stateEntries.map((se) => {
            const stateId = se.stateId;
            if (stateId && typeof stateId === 'object' && '_id' in stateId) {
                return String(stateId._id);
            }
            return String(stateId);
        });
        const countryIdValue = country && typeof country === 'object' && '_id' in country
            ? String(country._id)
            : String(countryEntry.countryId);
        return {
            countryId: countryIdValue,
            countryName: country?.name || '',
            countryIso2: country?.iso2 || '',
            countryFlag: country?.flagEmoji || '',
            selectedStatesCount: stateEntries.length,
            totalStatesCount: totalStates,
            stateIds: stateIds,
        };
    }));
    const populated = await shipping_zone_model_1.ShippingZone.findById(createdZone._id)
        .populate('shippingProfileId', 'profileName')
        .lean();
    return res.status(201).json({
        success: true,
        data: {
            ...populated,
            countries: countriesWithStates,
        },
        message: 'Shipping zone created successfully',
        meta: {
            shippingProfile: {
                id: String(shippingProfile._id),
                name: shippingProfile.profileName,
            },
            countriesCount: countryEntries.length,
            statesCount: stateEntries.length,
        },
    });
});
// GET /shipping-zones/profile/:shippingProfileId
exports.getShippingZonesByShippingProfileId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { shippingProfileId } = req.params;
    if (!shippingProfileId || !mongoose_1.default.isValidObjectId(shippingProfileId)) {
        throw new error_utils_1.CustomError('Valid shippingProfileId is required', 400);
    }
    // Verify shipping profile exists
    const shippingProfile = await shipping_profile_model_1.ShippingProfile.findById(shippingProfileId).lean();
    if (!shippingProfile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    const zones = await shipping_zone_model_1.ShippingZone.find({ shippingProfileId })
        .populate('shippingProfileId', 'profileName')
        .sort({ createdAt: -1 })
        .lean();
    // Populate countries and states for each zone
    const zonesWithDetails = await Promise.all(zones.map(async (zone) => {
        const countryEntries = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.find({
            shippingZoneId: zone._id,
        })
            .populate('countryId', 'name iso2 flagEmoji')
            .lean();
        const countriesWithStates = await Promise.all(countryEntries.map(async (countryEntry) => {
            const stateEntries = await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.find({
                shippingZoneCountryEntryId: countryEntry._id,
            })
                .populate('stateId', 'name code')
                .lean();
            const country = countryEntry.countryId;
            const totalStates = await state_model_1.State.countDocuments({ countryId: countryEntry.countryId });
            // Extract state IDs as strings (handle both populated objects and string IDs)
            const stateIds = stateEntries.map((se) => {
                const stateId = se.stateId;
                if (stateId && typeof stateId === 'object' && '_id' in stateId) {
                    return String(stateId._id);
                }
                return String(stateId);
            });
            // Extract country ID as string
            const countryIdValue = country && typeof country === 'object' && '_id' in country
                ? String(country._id)
                : String(countryEntry.countryId);
            return {
                countryId: countryIdValue,
                countryName: country?.name || '',
                countryIso2: country?.iso2 || '',
                countryFlag: country?.flagEmoji || '',
                selectedStatesCount: stateEntries.length,
                totalStatesCount: totalStates,
                stateIds: stateIds,
            };
        }));
        return {
            ...zone,
            countries: countriesWithStates,
        };
    }));
    return res.status(200).json({
        success: true,
        data: zonesWithDetails,
        message: 'Shipping zones fetched successfully',
        meta: {
            total: zones.length,
            shippingProfile: {
                id: String(shippingProfile._id),
                name: shippingProfile.profileName,
            },
        },
    });
});
// PUT /shipping-zones/:id
exports.updateShippingZone = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { zoneName, countries } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipping zone ID is required', 400);
    }
    const zone = await shipping_zone_model_1.ShippingZone.findById(id).lean();
    if (!zone) {
        throw new error_utils_1.CustomError('Shipping zone not found', 404);
    }
    const update = {};
    if (zoneName !== undefined) {
        if (typeof zoneName !== 'string' || !zoneName.trim()) {
            throw new error_utils_1.CustomError('zoneName must be a non-empty string', 400);
        }
        // Check if another zone with same name exists for this shipping profile
        const existingZone = await shipping_zone_model_1.ShippingZone.findOne({
            shippingProfileId: zone.shippingProfileId,
            zoneName: zoneName.trim(),
            _id: { $ne: id },
        }).lean();
        if (existingZone) {
            throw new error_utils_1.CustomError('Shipping zone with this name already exists for this shipping profile', 409);
        }
        update.zoneName = zoneName.trim();
    }
    // Update countries and states if provided
    if (countries !== undefined) {
        if (!Array.isArray(countries) || countries.length === 0) {
            throw new error_utils_1.CustomError('At least one country is required', 400);
        }
        // Validate countries and states (same validation as create)
        const countryIds = new Set();
        for (const countryEntry of countries) {
            if (!countryEntry.countryId || !mongoose_1.default.isValidObjectId(countryEntry.countryId)) {
                throw new error_utils_1.CustomError('Invalid countryId provided', 400);
            }
            if (countryIds.has(countryEntry.countryId)) {
                throw new error_utils_1.CustomError('Duplicate countryId found', 400);
            }
            countryIds.add(countryEntry.countryId);
            if (countryEntry.stateIds && Array.isArray(countryEntry.stateIds)) {
                const stateIdSet = new Set();
                for (const stateId of countryEntry.stateIds) {
                    if (!mongoose_1.default.isValidObjectId(stateId)) {
                        throw new error_utils_1.CustomError(`Invalid stateId: ${stateId}`, 400);
                    }
                    if (stateIdSet.has(stateId)) {
                        throw new error_utils_1.CustomError(`Duplicate stateId: ${stateId}`, 400);
                    }
                    stateIdSet.add(stateId);
                }
            }
        }
        // Verify all countries exist
        const countryIdsArray = Array.from(countryIds);
        const existingCountries = await country_model_1.Country.find({ _id: { $in: countryIdsArray } }).lean();
        if (existingCountries.length !== countryIdsArray.length) {
            throw new error_utils_1.CustomError('One or more countries not found', 404);
        }
        // Verify all states exist and belong to their respective countries
        const allStateIds = [];
        const stateToCountryMap = new Map();
        for (const countryEntry of countries) {
            if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
                allStateIds.push(...countryEntry.stateIds);
                countryEntry.stateIds.forEach((stateId) => {
                    stateToCountryMap.set(stateId, countryEntry.countryId);
                });
            }
        }
        if (allStateIds.length > 0) {
            const existingStates = await state_model_1.State.find({ _id: { $in: allStateIds } }).lean();
            if (existingStates.length !== allStateIds.length) {
                throw new error_utils_1.CustomError('One or more states not found', 404);
            }
            for (const state of existingStates) {
                const expectedCountryId = stateToCountryMap.get(String(state._id));
                if (String(state.countryId) !== expectedCountryId) {
                    throw new error_utils_1.CustomError(`State ${state.name} does not belong to the specified country`, 400);
                }
            }
        }
        // Delete existing country and state entries
        const existingCountryEntries = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.find({
            shippingZoneId: id,
        }).lean();
        const countryEntryIds = existingCountryEntries.map((ce) => ce._id);
        if (countryEntryIds.length > 0) {
            await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.deleteMany({
                shippingZoneCountryEntryId: { $in: countryEntryIds },
            });
        }
        await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.deleteMany({ shippingZoneId: id });
        // Create new country entries and state entries
        const countryEntries = [];
        const stateEntries = [];
        for (const countryEntry of countries) {
            const countryEntryDoc = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.create({
                shippingZoneId: id,
                countryId: countryEntry.countryId,
            });
            countryEntries.push(countryEntryDoc);
            if (countryEntry.stateIds && countryEntry.stateIds.length > 0) {
                for (const stateId of countryEntry.stateIds) {
                    stateEntries.push({
                        stateId,
                        shippingZoneCountryEntryId: countryEntryDoc._id,
                    });
                }
            }
        }
        if (stateEntries.length > 0) {
            await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.insertMany(stateEntries);
        }
    }
    if (Object.keys(update).length === 0 && countries === undefined) {
        throw new error_utils_1.CustomError('No valid fields to update', 400);
    }
    const updated = await shipping_zone_model_1.ShippingZone.findByIdAndUpdate(id, { $set: update }, { new: true })
        .populate('shippingProfileId', 'profileName')
        .lean();
    if (!updated) {
        throw new error_utils_1.CustomError('Shipping zone not found', 404);
    }
    // Populate countries and states for the updated zone
    const countryEntriesForResponse = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.find({
        shippingZoneId: id,
    })
        .populate('countryId', 'name iso2 flagEmoji')
        .lean();
    const countriesWithStates = await Promise.all(countryEntriesForResponse.map(async (countryEntry) => {
        const stateEntries = await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.find({
            shippingZoneCountryEntryId: countryEntry._id,
        })
            .populate('stateId', 'name code')
            .lean();
        const country = countryEntry.countryId;
        const totalStates = await state_model_1.State.countDocuments({ countryId: countryEntry.countryId });
        const stateIds = stateEntries.map((se) => {
            const stateId = se.stateId;
            if (stateId && typeof stateId === 'object' && '_id' in stateId) {
                return String(stateId._id);
            }
            return String(stateId);
        });
        const countryIdValue = country && typeof country === 'object' && '_id' in country
            ? String(country._id)
            : String(countryEntry.countryId);
        return {
            countryId: countryIdValue,
            countryName: country?.name || '',
            countryIso2: country?.iso2 || '',
            countryFlag: country?.flagEmoji || '',
            selectedStatesCount: stateEntries.length,
            totalStatesCount: totalStates,
            stateIds: stateIds,
        };
    }));
    // Extract shipping profile info from populated shippingProfileId
    const populatedProfile = updated.shippingProfileId && typeof updated.shippingProfileId === 'object' && 'profileName' in updated.shippingProfileId
        ? updated.shippingProfileId
        : null;
    // Get shipping profile info - fetch if not populated
    let profileInfo;
    if (populatedProfile) {
        profileInfo = {
            id: String(populatedProfile._id),
            name: populatedProfile.profileName,
        };
    }
    else {
        // Fallback: fetch shipping profile if not populated
        const profile = await shipping_profile_model_1.ShippingProfile.findById(zone.shippingProfileId).lean();
        if (!profile) {
            throw new error_utils_1.CustomError('Shipping profile not found', 404);
        }
        profileInfo = {
            id: String(profile._id),
            name: profile.profileName,
        };
    }
    // Get counts - always include if countries were updated, otherwise use existing counts
    const countriesCount = countries !== undefined
        ? countryEntriesForResponse.length
        : countriesWithStates.length;
    const statesCount = countries !== undefined
        ? countriesWithStates.reduce((sum, country) => sum + country.selectedStatesCount, 0)
        : countriesWithStates.reduce((sum, country) => sum + country.selectedStatesCount, 0);
    return res.status(200).json({
        success: true,
        data: {
            ...updated,
            countries: countriesWithStates,
        },
        message: 'Shipping zone updated successfully',
        meta: {
            shippingProfile: profileInfo,
            countriesCount,
            statesCount,
        },
    });
});
// DELETE /shipping-zones/:id
exports.deleteShippingZone = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipping zone ID is required', 400);
    }
    const zone = await shipping_zone_model_1.ShippingZone.findById(id).populate('shippingProfileId', 'profileName').lean();
    if (!zone) {
        throw new error_utils_1.CustomError('Shipping zone not found', 404);
    }
    let profileInfo;
    if (zone.shippingProfileId && typeof zone.shippingProfileId === 'object' && 'profileName' in zone.shippingProfileId) {
        profileInfo = {
            id: String(zone.shippingProfileId._id),
            name: zone.shippingProfileId.profileName,
        };
    }
    else {
        const profile = await shipping_profile_model_1.ShippingProfile.findById(zone.shippingProfileId).lean();
        if (!profile) {
            throw new error_utils_1.CustomError('Shipping profile not found', 404);
        }
        profileInfo = {
            id: String(profile._id),
            name: profile.profileName,
        };
    }
    const countryEntries = await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.find({ shippingZoneId: id })
        .select('_id')
        .lean();
    const countryEntryIds = countryEntries.map((entry) => entry._id);
    const statesDeleted = countryEntryIds.length
        ? await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.countDocuments({
            shippingZoneCountryEntryId: { $in: countryEntryIds },
        })
        : 0;
    if (countryEntryIds.length) {
        await shipping_zone_country_state_entry_model_1.ShippingZoneCountryStateEntry.deleteMany({
            shippingZoneCountryEntryId: { $in: countryEntryIds },
        });
    }
    await shipping_zone_country_entry_model_1.ShippingZoneCountryEntry.deleteMany({ shippingZoneId: id });
    const ratesDeleted = await shipping_zone_rate_model_1.ShippingZoneRate.countDocuments({ shippingZoneId: id });
    if (ratesDeleted > 0) {
        await shipping_zone_rate_model_1.ShippingZoneRate.deleteMany({ shippingZoneId: id });
    }
    await shipping_zone_model_1.ShippingZone.findByIdAndDelete(id);
    return res.status(200).json({
        success: true,
        data: {
            _id: String(zone._id),
            zoneName: zone.zoneName,
            shippingProfileId: zone.shippingProfileId,
        },
        message: 'Shipping zone deleted successfully',
        meta: {
            shippingProfile: profileInfo,
            countriesDeleted: countryEntries.length,
            statesDeleted,
            ratesDeleted,
        },
    });
});
