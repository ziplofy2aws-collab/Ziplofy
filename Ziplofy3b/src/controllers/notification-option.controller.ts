import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NotificationOption } from '../models/notification-option/notification-option.model';
import { CustomError } from '../utils/error.utils';
import { asyncErrorHandler } from '../utils/error.utils';

// GET /api/notification-options?categoryId=...
export const getNotificationOptionsByCategoryId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.query;

    if (!categoryId) {
      throw new CustomError('Category ID is required', 400);
    }

    if (!mongoose.isValidObjectId(categoryId)) {
      throw new CustomError('Invalid category ID format', 400);
    }

    const options = await NotificationOption.find({
      notificationCategoryId: categoryId,
    })
      .sort({ optionName: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: options,
      message: 'Notification options fetched successfully',
    });
  }
);

