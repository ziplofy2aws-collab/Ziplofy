import { Router } from "express";
import { getNewsletterSubscriptionsByStoreId } from "../controllers/newsletter-subscription.controller";
import { protect } from "../middlewares/auth.middleware";

export const newsletterSubscriptionRouter = Router();

newsletterSubscriptionRouter.use(protect);

newsletterSubscriptionRouter.get("/store/:storeId", getNewsletterSubscriptionsByStoreId);
