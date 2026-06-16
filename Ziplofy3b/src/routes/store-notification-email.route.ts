import { Router } from "express";
import {
  createStoreNotificationEmail,
  updateStoreNotificationEmail,
  getStoreNotificationEmailByStoreId,
  sendStoreNotificationEmailVerification,
  verifyStoreNotificationEmail,
} from "../controllers/store-notification-email.controller";
import { protect } from "../middlewares/auth.middleware";

export const storeNotificationEmailRouter = Router();

// Public verification route (email link lands in frontend, then calls this API)
storeNotificationEmailRouter.post("/verify", verifyStoreNotificationEmail);

// Protected routes (authentication required)
storeNotificationEmailRouter.use(protect);

// Get store notification email by store ID (must come before other routes)
storeNotificationEmailRouter.get("/store/:storeId", getStoreNotificationEmailByStoreId);

// Create a new store notification email
storeNotificationEmailRouter.post("/", createStoreNotificationEmail);

// Send verification email for a sender email record
storeNotificationEmailRouter.post("/:id/send-verification", sendStoreNotificationEmailVerification);

// Update store notification email by ID
storeNotificationEmailRouter.put("/:id", updateStoreNotificationEmail);
