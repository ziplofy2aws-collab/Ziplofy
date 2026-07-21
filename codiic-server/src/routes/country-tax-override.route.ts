import { Router } from "express";
import {
  createCountryTaxOverride,
  getCountryTaxOverrideByStoreAndCountry,
  updateCountryTaxOverrideByStoreAndCountry,
  deleteCountryTaxOverrideByStoreAndCountry,
} from "../controllers/country-tax-override.controller";
import { protect } from "../middlewares/auth.middleware";

export const countryTaxOverrideRouter = Router();

// Protected routes (authentication required)
countryTaxOverrideRouter.use(protect);

// Get country tax override by store ID and country ID (must come before other routes)
countryTaxOverrideRouter.get("/store/:storeId/country/:countryId", getCountryTaxOverrideByStoreAndCountry);

// Create a new country tax override
countryTaxOverrideRouter.post("/", createCountryTaxOverride);

// Update country tax override by store ID and country ID
countryTaxOverrideRouter.put("/store/:storeId/country/:countryId", updateCountryTaxOverrideByStoreAndCountry);

// Delete country tax override by store ID and country ID
countryTaxOverrideRouter.delete("/store/:storeId/country/:countryId", deleteCountryTaxOverrideByStoreAndCountry);

