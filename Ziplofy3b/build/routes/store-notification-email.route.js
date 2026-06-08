"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeNotificationEmailRouter = void 0;
const express_1 = require("express");
const store_notification_email_controller_1 = require("../controllers/store-notification-email.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.storeNotificationEmailRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.storeNotificationEmailRouter.use(auth_middleware_1.protect);
// Get store notification email by store ID (must come before other routes)
exports.storeNotificationEmailRouter.get("/store/:storeId", store_notification_email_controller_1.getStoreNotificationEmailByStoreId);
// Create a new store notification email
exports.storeNotificationEmailRouter.post("/", store_notification_email_controller_1.createStoreNotificationEmail);
// Update store notification email by ID
exports.storeNotificationEmailRouter.put("/:id", store_notification_email_controller_1.updateStoreNotificationEmail);
