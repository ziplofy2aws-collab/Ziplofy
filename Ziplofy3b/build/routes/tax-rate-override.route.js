"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxRateOverrideRouter = void 0;
const express_1 = require("express");
const tax_rate_override_controller_1 = require("../controllers/tax-rate-override.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.taxRateOverrideRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.taxRateOverrideRouter.use(auth_middleware_1.protect);
// Get states with tax details for a store and country (must come before other /store routes)
exports.taxRateOverrideRouter.get("/store/:storeId/country/:countryId/states", tax_rate_override_controller_1.getStatesWithTaxDetails);
// Delete all tax overrides for a store and country (must come before other /store routes)
exports.taxRateOverrideRouter.delete("/store/:storeId/country/:countryId", tax_rate_override_controller_1.deleteTaxOverridesByStoreAndCountry);
// Get tax rate by store ID and state ID (with optional filter: ?countryId=xxx)
// This must come before /store/:storeId to avoid route conflicts
exports.taxRateOverrideRouter.get("/store/:storeId/state/:stateId", tax_rate_override_controller_1.getTaxRateByStoreAndState);
// Get tax rates by store ID (with optional filters: ?countryId=xxx&stateId=xxx)
exports.taxRateOverrideRouter.get("/store/:storeId", tax_rate_override_controller_1.getTaxRatesByStoreId);
// Get tax rate by ID
exports.taxRateOverrideRouter.get("/:id", tax_rate_override_controller_1.getTaxRateById);
// Create a new tax rate
exports.taxRateOverrideRouter.post("/", tax_rate_override_controller_1.createTaxRate);
// Update a tax rate
exports.taxRateOverrideRouter.put("/:id", tax_rate_override_controller_1.updateTaxRate);
// Delete a tax rate
exports.taxRateOverrideRouter.delete("/:id", tax_rate_override_controller_1.deleteTaxRate);
