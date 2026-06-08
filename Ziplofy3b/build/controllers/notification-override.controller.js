"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationOverride = exports.createNotificationOverride = exports.checkNotificationOverrideExists = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_notification_override_model_1 = require("../models/store-notification-override/store-notification-override.model");
const notification_option_model_1 = require("../models/notification-option/notification-option.model");
const error_utils_1 = require("../utils/error.utils");
// GET /api/notification-overrides/exists?storeId=...&optionId=...
exports.checkNotificationOverrideExists = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, optionId } = req.query;
    if (!storeId || !optionId) {
        throw new error_utils_1.CustomError('storeId and optionId are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId format', 400);
    }
    if (!mongoose_1.default.isValidObjectId(optionId)) {
        throw new error_utils_1.CustomError('Invalid optionId format', 400);
    }
    const override = await store_notification_override_model_1.StoreNotificationOverride.findOne({
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
});
// POST /api/notification-overrides
exports.createNotificationOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, notificationOptionId, emailSubject, emailBody, smsData, enabled } = req.body;
    if (!storeId || !notificationOptionId) {
        throw new error_utils_1.CustomError('storeId and notificationOptionId are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId format', 400);
    }
    if (!mongoose_1.default.isValidObjectId(notificationOptionId)) {
        throw new error_utils_1.CustomError('Invalid notificationOptionId format', 400);
    }
    // Fetch the notification option to get the key
    const notificationOption = await notification_option_model_1.NotificationOption.findById(notificationOptionId)
        .select('key')
        .lean();
    if (!notificationOption) {
        throw new error_utils_1.CustomError('Notification option not found', 404);
    }
    // Check if override already exists
    const existingOverride = await store_notification_override_model_1.StoreNotificationOverride.findOne({
        storeId,
        notificationOptionId,
    });
    if (existingOverride) {
        throw new error_utils_1.CustomError('Notification override already exists for this store and option', 409);
    }
    // Create the override
    const override = await store_notification_override_model_1.StoreNotificationOverride.create({
        storeId,
        notificationOptionId,
        notificationKey: notificationOption.key,
        emailSubject: emailSubject || undefined,
        emailBody: emailBody || undefined,
        smsData: smsData || undefined,
        enabled: enabled !== undefined ? enabled : true,
    });
    const createdOverride = await store_notification_override_model_1.StoreNotificationOverride.findById(override._id).lean();
    return res.status(201).json({
        success: true,
        data: createdOverride,
        message: 'Notification override created successfully',
    });
});
// DELETE /api/notification-overrides/:id
exports.deleteNotificationOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid override id format', 400);
    }
    const override = await store_notification_override_model_1.StoreNotificationOverride.findByIdAndDelete(id);
    if (!override) {
        throw new error_utils_1.CustomError('Notification override not found', 404);
    }
    return res.status(200).json({
        success: true,
        data: override,
        message: 'Notification override deleted successfully',
    });
});
