import { Router } from "express";
import { createStorefrontNewsletterSubscription } from "../../controllers/newsletter-subscription.controller";

export const storeFrontNewsletterSubscriptionRouter = Router();

storeFrontNewsletterSubscriptionRouter.post("/", createStorefrontNewsletterSubscription);
