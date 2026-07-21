import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { LocalDeliveryLocationEntry } from '../models/local-delivery-settings/local-delivery-location-entry.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

export const getLocalDeliveryLocationEntriesByLocalDeliveryId = asyncErrorHandler(
  async (req: Request<{ localDeliveryId?: string }>, res: Response) => {
    const { localDeliveryId } = req.params;

    if (!localDeliveryId || !mongoose.isValidObjectId(localDeliveryId)) {
      throw new CustomError('A valid localDeliveryId is required', 400);
    }

    const entries = await LocalDeliveryLocationEntry.find({ localDeliveryId })
      .populate('locationId')
      .lean();

    return res.status(200).json({
      success: true,
      data: entries,
      message: 'Local delivery location entries fetched successfully',
    });
  }
);

