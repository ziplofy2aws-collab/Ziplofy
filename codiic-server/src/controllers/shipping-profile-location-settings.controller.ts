import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { ShippingProfile } from '../models/shipping-profile/shipping-profile.model';
import { ShippingProfileLocationSettings } from '../models/shipping-profile/shipping-profile-location-settings.model';

interface UpdateLocationSettingBody {
  createNewRates?: boolean;
  removeRates?: boolean;
}

export const getShippingProfileLocationSettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { profileId } = req.params;

  if (!profileId || !mongoose.isValidObjectId(profileId)) {
    throw new CustomError('Valid shipping profile ID is required', 400);
  }

  const profile = await ShippingProfile.findById(profileId).select('_id').lean();
  if (!profile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  const settings = await ShippingProfileLocationSettings.find({ shippingProfileId: profileId })
    .populate('locationId')
    .lean();

  const formatted = settings.map((setting) => {
    const location = setting.locationId as any;
    return {
      _id: setting._id,
      shippingProfileId: setting.shippingProfileId,
      locationId: setting.locationId,
      location:
        location && typeof location === 'object' && '_id' in location
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

export const updateShippingProfileLocationSetting = asyncErrorHandler(async (req: Request, res: Response) => {
  const { profileId, locationId } = req.params;
  const { createNewRates, removeRates } = req.body as UpdateLocationSettingBody;

  if (!profileId || !mongoose.isValidObjectId(profileId)) {
    throw new CustomError('Valid shipping profile ID is required', 400);
  }

  if (!locationId || !mongoose.isValidObjectId(locationId)) {
    throw new CustomError('Valid location ID is required', 400);
  }

  if (typeof createNewRates !== 'boolean' || typeof removeRates !== 'boolean') {
    throw new CustomError('createNewRates and removeRates are required boolean values', 400);
  }

  const profile = await ShippingProfile.findById(profileId).select('_id').lean();
  if (!profile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  const locationSetting = await ShippingProfileLocationSettings.findOneAndUpdate(
    { shippingProfileId: profileId, locationId },
    {
      createNewRates,
      removeRates,
    },
    { new: true }
  )
    .populate('locationId')
    .lean();

  if (!locationSetting) {
    throw new CustomError('Location setting not found for this shipping profile', 404);
  }

  const location = locationSetting.locationId as any;

  return res.status(200).json({
    success: true,
    data: {
      _id: locationSetting._id,
      shippingProfileId: locationSetting.shippingProfileId,
      locationId: locationSetting.locationId,
      location:
        location && typeof location === 'object' && '_id' in location
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

