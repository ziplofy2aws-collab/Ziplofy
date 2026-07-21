import { Request, Response } from 'express';
import { NotificationCategory } from '../models/notification-category/notification-category.model';
import { asyncErrorHandler } from '../utils/error.utils';

// GET /api/notification-categories
export const getAllNotificationCategories = asyncErrorHandler(async (_req: Request, res: Response) => {
  const categories = await NotificationCategory.find({}).sort({ name: 1 }).lean();
  return res.status(200).json({
    success: true,
    data: categories,
    message: 'Notification categories fetched successfully',
  });
});


