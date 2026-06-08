"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_category_controller_1 = require("../controllers/notification-category.controller");
const notificationCategoryRouter = (0, express_1.Router)();
// GET /api/notification-categories
notificationCategoryRouter.get('/', notification_category_controller_1.getAllNotificationCategories);
exports.default = notificationCategoryRouter;
