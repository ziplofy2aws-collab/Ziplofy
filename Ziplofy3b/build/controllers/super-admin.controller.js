"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuperAdminNotifications = void 0;
const superadmin_notifications_model_1 = require("../models/superadmin-notifications.model");
const error_utils_1 = require("../utils/error.utils");
exports.getSuperAdminNotifications = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const notifications = await superadmin_notifications_model_1.SuperAdminNotification.find({})
        .sort({ createdAt: -1 })
        .populate({
        path: "userId",
        select: "email name",
    });
    res.status(200).json({ notifications });
});
