"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_option_controller_1 = require("../controllers/notification-option.controller");
const notificationOptionRouter = (0, express_1.Router)();
// GET /api/notification-options?categoryId=...
notificationOptionRouter.get('/', notification_option_controller_1.getNotificationOptionsByCategoryId);
exports.default = notificationOptionRouter;
