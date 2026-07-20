import { Router } from "express";
import {
  createTaxRate,
  getTaxRatesByStoreId,
  getTaxRateByStoreAndState,
  updateTaxRate,
  deleteTaxRate,
  getTaxRateById,
  getStatesWithTaxDetails,
  deleteTaxOverridesByStoreAndCountry,
} from "../controllers/tax-rate-override.controller";
import { protect } from "../middlewares/auth.middleware";

export const taxRateOverrideRouter = Router();

// Protected routes (authentication required)
taxRateOverrideRouter.use(protect);

// Get states with tax details for a store and country (must come before other /store routes)
taxRateOverrideRouter.get("/store/:storeId/country/:countryId/states", getStatesWithTaxDetails);

// Delete all tax overrides for a store and country (must come before other /store routes)
taxRateOverrideRouter.delete("/store/:storeId/country/:countryId", deleteTaxOverridesByStoreAndCountry);

// Get tax rate by store ID and state ID (with optional filter: ?countryId=xxx)
// This must come before /store/:storeId to avoid route conflicts
taxRateOverrideRouter.get("/store/:storeId/state/:stateId", getTaxRateByStoreAndState);

// Get tax rates by store ID (with optional filters: ?countryId=xxx&stateId=xxx)
taxRateOverrideRouter.get("/store/:storeId", getTaxRatesByStoreId);

// Get tax rate by ID
taxRateOverrideRouter.get("/:id", getTaxRateById);

// Create a new tax rate
taxRateOverrideRouter.post("/", createTaxRate);

// Update a tax rate
taxRateOverrideRouter.put("/:id", updateTaxRate);

// Delete a tax rate
taxRateOverrideRouter.delete("/:id", deleteTaxRate);

