import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreNotificationOverride } from '../models/store-notification-override/store-notification-override.model';
import { NotificationOption } from '../models/notification-option/notification-option.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// GET /api/notification-overrides/exists?storeId=...&optionId=...
export const checkNotificationOverrideExists = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId, optionId } = req.query as { storeId?: string; optionId?: string };

    if (!storeId || !optionId) {
      throw new CustomError('storeId and optionId are required', 400);
    }

    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Invalid storeId format', 400);
    }
    if (!mongoose.isValidObjectId(optionId)) {
      throw new CustomError('Invalid optionId format', 400);
    }

    const override = await StoreNotificationOverride.findOne({
      storeId,
      notificationOptionId: optionId,
    })
      .select('_id storeId notificationOptionId notificationKey emailSubject emailBody smsData enabled updatedAt createdAt')
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        exists: Boolean(override),
        override,
      },
      message: 'Notification override existence checked successfully',
    });
  }
);

// POST /api/notification-overrides
export const createNotificationOverride = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId, notificationOptionId, emailSubject, emailBody, smsData, enabled } = req.body;

    if (!storeId || !notificationOptionId) {
      throw new CustomError('storeId and notificationOptionId are required', 400);
    }

    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Invalid storeId format', 400);
    }
    if (!mongoose.isValidObjectId(notificationOptionId)) {
      throw new CustomError('Invalid notificationOptionId format', 400);
    }

    // Fetch the notification option to get the key
    const notificationOption = await NotificationOption.findById(notificationOptionId)
      .select('key')
      .lean();

    if (!notificationOption) {
      throw new CustomError('Notification option not found', 404);
    }

    // Check if override already exists
    const existingOverride = await StoreNotificationOverride.findOne({
      storeId,
      notificationOptionId,
    });

    if (existingOverride) {
      throw new CustomError('Notification override already exists for this store and option', 409);
    }

    // Create the override
    const override = await StoreNotificationOverride.create({
      storeId,
      notificationOptionId,
      notificationKey: notificationOption.key,
      emailSubject: emailSubject || undefined,
      emailBody: emailBody || undefined,
      smsData: smsData || undefined,
      enabled: enabled !== undefined ? enabled : true,
    });

    const createdOverride = await StoreNotificationOverride.findById(override._id).lean();

    return res.status(201).json({
      success: true,
      data: createdOverride,
      message: 'Notification override created successfully',
    });
  }
);

// DELETE /api/notification-overrides/:id
export const deleteNotificationOverride = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new CustomError('Invalid override id format', 400);
    }

    const override = await StoreNotificationOverride.findByIdAndDelete(id);

    if (!override) {
      throw new CustomError('Notification override not found', 404);
    }

    return res.status(200).json({
      success: true,
      data: override,
      message: 'Notification override deleted successfully',
    });
  }
);


