"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNotificationCategories = void 0;
const notification_category_model_1 = require("../models/notification-category/notification-category.model");
const error_utils_1 = require("../utils/error.utils");
// GET /api/notification-categories
exports.getAllNotificationCategories = (0, error_utils_1.asyncErrorHandler)(async (_req, res) => {
    const categories = await notification_category_model_1.NotificationCategory.find({}).sort({ name: 1 }).lean();
    return res.status(200).json({
        success: true,
        data: categories,
        message: 'Notification categories fetched successfully',
    });
});
