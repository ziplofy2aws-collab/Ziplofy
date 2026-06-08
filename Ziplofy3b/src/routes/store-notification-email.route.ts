import { Router } from "express";
import {
  createStoreNotificationEmail,
  updateStoreNotificationEmail,
  getStoreNotificationEmailByStoreId,
} from "../controllers/store-notification-email.controller";
import { protect } from "../middlewares/auth.middleware";

export const storeNotificationEmailRouter = Router();

// Protected routes (authentication required)
storeNotificationEmailRouter.use(protect);

// Get store notification email by store ID (must come before other routes)
storeNotificationEmailRouter.get("/store/:storeId", getStoreNotificationEmailByStoreId);

// Create a new store notification email
storeNotificationEmailRouter.post("/", createStoreNotificationEmail);

// Update store notification email by ID
storeNotificationEmailRouter.put("/:id", updateStoreNotificationEmail);

