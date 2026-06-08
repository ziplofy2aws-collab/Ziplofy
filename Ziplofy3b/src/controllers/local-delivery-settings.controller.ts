import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { LocalDeliverySettings } from '../models/local-delivery-settings/local-delivery-settings.model';
import { LocationModel } from '../models/location/location.model';
import { LocalDeliveryLocationEntry } from '../models/local-delivery-settings/local-delivery-location-entry.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

interface CreateLocalDeliverySettingsBody {
  storeId?: string;
}

export const createLocalDeliverySettings = asyncErrorHandler(
  async (req: Request<unknown, unknown, CreateLocalDeliverySettingsBody>, res: Response) => {
    const { storeId } = req.body;

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('A valid storeId is required', 400);
    }

    const existing = await LocalDeliverySettings.findOne({ storeId });
    if (existing) {
      throw new CustomError('Local delivery settings already exist for this store', 409);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const settings = await LocalDeliverySettings.create([{ storeId }], { session });

      const storeLocations = await LocationModel.find({ storeId }).select(['_id', 'canLocalDeliver']).lean();

      if (storeLocations.length) {
        const entriesPayload = storeLocations.map((location) => ({
          localDeliveryId: settings[0]._id,
          locationId: location._id,
          canLocalDeliver: Boolean(location.canLocalDeliver),
          deliveryZoneType: 'radius' as const,
          includeNeighboringStates: false,
          radiusUnit: 'km' as const,
          deliveryZones: [],
        }));

        await LocalDeliveryLocationEntry.insertMany(entriesPayload, { session });
      }

      await session.commitTransaction();

      return res.status(201).json({
        success: true,
        data: settings[0],
        message: 'Local delivery settings created successfully',
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

export const getLocalDeliverySettingsByStoreId = asyncErrorHandler(
  async (req: Request<{ storeId?: string }>, res: Response) => {
    const { storeId } = req.params;

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('A valid storeId is required', 400);
    }

    const settings = await LocalDeliverySettings.findOne({ storeId });
    if (!settings) {
      throw new CustomError('Local delivery settings not found for this store', 404);
    }

    return res.status(200).json({
      success: true,
      data: settings,
      message: 'Local delivery settings fetched successfully',
    });
  }
);


