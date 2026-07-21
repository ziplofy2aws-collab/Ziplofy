import { Router } from "express";
import {
  getTaxAndDutiesGlobalSettingsByStoreId,
  updateTaxAndDutiesGlobalSettings,
} from "../controllers/tax-and-duties-global-settings.controller";
import { protect } from "../middlewares/auth.middleware";

export const taxAndDutiesGlobalSettingsRouter = Router();

// Protected routes (authentication required)
taxAndDutiesGlobalSettingsRouter.use(protect);

// Get tax and duties global settings by store ID
taxAndDutiesGlobalSettingsRouter.get("/store/:storeId", getTaxAndDutiesGlobalSettingsByStoreId);

// Update tax and duties global settings by ID
taxAndDutiesGlobalSettingsRouter.put("/:id", updateTaxAndDutiesGlobalSettings);

