import { Router } from "express";
import {
  createShippingOverride,
  getShippingOverridesByStoreAndCountry,
  getShippingOverrideById,
  updateShippingOverride,
  deleteShippingOverride,
} from "../controllers/shipping-override.controller";
import { protect } from "../middlewares/auth.middleware";

export const shippingOverrideRouter = Router();

// Protected routes (authentication required)
shippingOverrideRouter.use(protect);

// Get shipping overrides by store ID and country ID (must come before other routes)
shippingOverrideRouter.get("/store/:storeId/country/:countryId", getShippingOverridesByStoreAndCountry);

// Get shipping override by ID
shippingOverrideRouter.get("/:id", getShippingOverrideById);

// Create a new shipping override
shippingOverrideRouter.post("/", createShippingOverride);

// Update a shipping override
shippingOverrideRouter.put("/:id", updateShippingOverride);

// Delete a shipping override
shippingOverrideRouter.delete("/:id", deleteShippingOverride);

