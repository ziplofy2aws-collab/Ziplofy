"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxAndDutiesGlobalSettingsRouter = void 0;
const express_1 = require("express");
const tax_and_duties_global_settings_controller_1 = require("../controllers/tax-and-duties-global-settings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.taxAndDutiesGlobalSettingsRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.taxAndDutiesGlobalSettingsRouter.use(auth_middleware_1.protect);
// Get tax and duties global settings by store ID
exports.taxAndDutiesGlobalSettingsRouter.get("/store/:storeId", tax_and_duties_global_settings_controller_1.getTaxAndDutiesGlobalSettingsByStoreId);
// Update tax and duties global settings by ID
exports.taxAndDutiesGlobalSettingsRouter.put("/:id", tax_and_duties_global_settings_controller_1.updateTaxAndDutiesGlobalSettings);
