"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_override_controller_1 = require("../controllers/notification-override.controller");
const notificationOverrideRouter = (0, express_1.Router)();
// GET /api/notification-overrides/exists?storeId=...&optionId=...
notificationOverrideRouter.get('/exists', notification_override_controller_1.checkNotificationOverrideExists);
// POST /api/notification-overrides
notificationOverrideRouter.post('/', notification_override_controller_1.createNotificationOverride);
// DELETE /api/notification-overrides/:id
notificationOverrideRouter.delete('/:id', notification_override_controller_1.deleteNotificationOverride);
exports.default = notificationOverrideRouter;
