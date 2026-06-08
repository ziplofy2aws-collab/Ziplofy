import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ShippingProfile } from '../models/shipping-profile/shipping-profile.model';
import { ShippingProfileProductVariantsEntry } from '../models/shipping-profile/shipping-profile-product-variants-entry.model';
import { ShippingProfileLocationSettings } from '../models/shipping-profile/shipping-profile-location-settings.model';
import { ShippingProfileShippingZonesEntry } from '../models/shipping-profile/shipping-profile-shipping-zones-entry.model';
import { Store } from '../models/store/store.model';
import { LocationModel } from '../models/location/location.model';
import { ShippingZone } from '../models/shipping-zone/shipping-zone.model';
import { ShippingZoneCountryEntry } from '../models/shipping-zone/shipping-zone-country-entry.model';
import { ShippingZoneCountryStateEntry } from '../models/shipping-zone/shipping-zone-country-state-entry.model';
import { ShippingZoneRate } from '../models/shipping-zone/shipping-zone-rate.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

interface CreateShippingProfileBody {
  profileName?: string;
  storeId?: string;
}

interface UpdateShippingProfileBody {
  profileName?: string;
}

// Helper function to enrich profile with related data
const enrichProfileData = async (profileId: mongoose.Types.ObjectId) => {
  // Fetch product variants with populated data (including product info)
  const variantEntries = await ShippingProfileProductVariantsEntry.find({ shippingProfileId: profileId })
    .populate({
      path: 'productVariantId',
      populate: {
        path: 'productId',
        select: 'title imageUrls',
      },
    })
    .lean();
  const productVariantIds = variantEntries.map((entry) => {
    const variant = entry.productVariantId as any;
    // Return populated variant object if it exists, otherwise return the ID as string
    return variant && typeof variant === 'object' && '_id' in variant ? variant : String(entry.productVariantId);
  });

  // Fetch location settings with populated location data
  const locationEntries = await ShippingProfileLocationSettings.find({ shippingProfileId: profileId })
    .populate('locationId')
    .lean();
  const locationSettings = locationEntries.map((entry) => {
    const location = entry.locationId as any;
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
  const zoneEntries = await ShippingProfileShippingZonesEntry.find({ shippingProfileId: profileId })
    .populate('shippingZoneId')
    .lean();
  const shippingZoneIds = zoneEntries.map((entry) => {
    const zone = entry.shippingZoneId as any;
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
export const createShippingProfile = asyncErrorHandler(async (req: Request, res: Response) => {
  const { profileName, storeId } = req.body as CreateShippingProfileBody;

  // Validate required fields
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  if (!profileName || typeof profileName !== 'string' || !profileName.trim()) {
    throw new CustomError('profileName is required', 400);
  }

  // Verify store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  // Check if profile with same name already exists for this store
  const existingProfile = await ShippingProfile.findOne({
    storeId,
    profileName: profileName.trim(),
  }).lean();

  if (existingProfile) {
    throw new CustomError('Shipping profile with this name already exists for this store', 409);
  }

  // Create the profile
  const createdProfile = await ShippingProfile.create({
    storeId,
    profileName: profileName.trim(),
  });

  const profileId = createdProfile._id as mongoose.Types.ObjectId;

  // Fetch all locations for this store
  const storeLocations = await LocationModel.find({ storeId }).select('_id').lean();

  // Create location settings entries for all store locations with default "create new rates" option
  if (storeLocations.length > 0) {
    const locationEntries = storeLocations.map((location) => ({
      shippingProfileId: profileId,
      locationId: location._id,
      storeId,
      createNewRates: true,
      removeRates: false,
    }));
    await ShippingProfileLocationSettings.insertMany(locationEntries);
  }

  // Populate store reference
  const populatedProfile = await ShippingProfile.findById(createdProfile._id)
    .populate('storeId', 'storeName')
    .lean();

  if (!populatedProfile) {
    throw new CustomError('Failed to fetch created profile', 500);
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
export const getShippingProfilesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  // Verify store exists
  const store = await Store.findById(storeId).select('storeName').lean();
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  // Fetch all profiles for this store
  const profiles = await ShippingProfile.find({ storeId })
    .populate('storeId', 'storeName')
    .sort({ createdAt: -1 })
    .lean();

  // Enrich each profile with related data
  const enrichedProfiles = await Promise.all(
    profiles.map(async (profile) => {
      const enrichedData = await enrichProfileData(profile._id as mongoose.Types.ObjectId);
      return {
        ...profile,
        productVariantIds: enrichedData.productVariantIds,
        locationSettings: enrichedData.locationSettings,
        shippingZoneIds: enrichedData.shippingZoneIds,
      };
    })
  );

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
export const updateShippingProfile = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { profileName } = req.body as UpdateShippingProfileBody;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipping profile ID is required', 400);
  }

  // Verify profile exists
  const profile = await ShippingProfile.findById(id).lean();
  if (!profile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  const storeId = String(profile.storeId);
  const update: { profileName?: string } = {};

  // Update profile name if provided
  if (profileName !== undefined) {
    if (typeof profileName !== 'string' || !profileName.trim()) {
      throw new CustomError('profileName must be a non-empty string', 400);
    }

    // Check if another profile with same name exists for this store
    const existingProfile = await ShippingProfile.findOne({
      storeId: profile.storeId,
      profileName: profileName.trim(),
      _id: { $ne: id },
    }).lean();

    if (existingProfile) {
      throw new CustomError('Shipping profile with this name already exists for this store', 409);
    }

    update.profileName = profileName.trim();
  }

  if (profileName === undefined) {
    throw new CustomError('profileName is required to update a shipping profile', 400);
  }

  if (Object.keys(update).length > 0) {
    await ShippingProfile.findByIdAndUpdate(id, { $set: update });
  }

  // Fetch updated profile with store reference
  const updatedProfile = await ShippingProfile.findById(id)
    .populate('storeId', 'storeName')
    .lean();

  if (!updatedProfile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  // Get store info
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  // Enrich with related data
  const enrichedData = await enrichProfileData(new mongoose.Types.ObjectId(id));

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
export const deleteShippingProfile = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipping profile ID is required', 400);
  }

  const profile = await ShippingProfile.findById(id).lean();
  if (!profile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  const store = await Store.findById(profile.storeId).select('storeName').lean();

  // Gather related shipping zones for cleanup
  const zones = await ShippingZone.find({ shippingProfileId: id }).select('_id').lean();
  const zoneIds = zones.map((zone) => zone._id as mongoose.Types.ObjectId);

  let countryEntryIds: mongoose.Types.ObjectId[] = [];
  if (zoneIds.length > 0) {
    const countryEntries = await ShippingZoneCountryEntry.find({ shippingZoneId: { $in: zoneIds } })
      .select('_id')
      .lean();
    countryEntryIds = countryEntries.map((entry) => entry._id as mongoose.Types.ObjectId);
  }

  await Promise.all([
    ShippingProfileProductVariantsEntry.deleteMany({ shippingProfileId: id }),
    ShippingProfileLocationSettings.deleteMany({ shippingProfileId: id }),
    ShippingProfileShippingZonesEntry.deleteMany({ shippingProfileId: id }),
    zoneIds.length > 0 ? ShippingZoneRate.deleteMany({ shippingZoneId: { $in: zoneIds } }) : Promise.resolve(),
    countryEntryIds.length > 0
      ? ShippingZoneCountryStateEntry.deleteMany({ shippingZoneCountryEntryId: { $in: countryEntryIds } })
      : Promise.resolve(),
    zoneIds.length > 0 ? ShippingZoneCountryEntry.deleteMany({ shippingZoneId: { $in: zoneIds } }) : Promise.resolve(),
  ]);

  if (zoneIds.length > 0) {
    await ShippingZone.deleteMany({ _id: { $in: zoneIds } });
  }

  await ShippingProfile.findByIdAndDelete(id);

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

