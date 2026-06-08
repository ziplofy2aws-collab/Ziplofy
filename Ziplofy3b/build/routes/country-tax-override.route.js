"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryTaxOverrideRouter = void 0;
const express_1 = require("express");
const country_tax_override_controller_1 = require("../controllers/country-tax-override.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.countryTaxOverrideRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.countryTaxOverrideRouter.use(auth_middleware_1.protect);
// Get country tax override by store ID and country ID (must come before other routes)
exports.countryTaxOverrideRouter.get("/store/:storeId/country/:countryId", country_tax_override_controller_1.getCountryTaxOverrideByStoreAndCountry);
// Create a new country tax override
exports.countryTaxOverrideRouter.post("/", country_tax_override_controller_1.createCountryTaxOverride);
// Update country tax override by store ID and country ID
exports.countryTaxOverrideRouter.put("/store/:storeId/country/:countryId", country_tax_override_controller_1.updateCountryTaxOverrideByStoreAndCountry);
// Delete country tax override by store ID and country ID
exports.countryTaxOverrideRouter.delete("/store/:storeId/country/:countryId", country_tax_override_controller_1.deleteCountryTaxOverrideByStoreAndCountry);
