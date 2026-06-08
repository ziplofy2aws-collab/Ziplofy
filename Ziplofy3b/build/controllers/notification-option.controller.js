"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationOptionsByCategoryId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_option_model_1 = require("../models/notification-option/notification-option.model");
const error_utils_1 = require("../utils/error.utils");
const error_utils_2 = require("../utils/error.utils");
// GET /api/notification-options?categoryId=...
exports.getNotificationOptionsByCategoryId = (0, error_utils_2.asyncErrorHandler)(async (req, res) => {
    const { categoryId } = req.query;
    if (!categoryId) {
        throw new error_utils_1.CustomError('Category ID is required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(categoryId)) {
        throw new error_utils_1.CustomError('Invalid category ID format', 400);
    }
    const options = await notification_option_model_1.NotificationOption.find({
        notificationCategoryId: categoryId,
    })
        .sort({ optionName: 1 })
        .lean();
    return res.status(200).json({
        success: true,
        data: options,
        message: 'Notification options fetched successfully',
    });
});
