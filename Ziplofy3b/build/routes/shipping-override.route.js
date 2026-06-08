"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingOverrideRouter = void 0;
const express_1 = require("express");
const shipping_override_controller_1 = require("../controllers/shipping-override.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.shippingOverrideRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.shippingOverrideRouter.use(auth_middleware_1.protect);
// Get shipping overrides by store ID and country ID (must come before other routes)
exports.shippingOverrideRouter.get("/store/:storeId/country/:countryId", shipping_override_controller_1.getShippingOverridesByStoreAndCountry);
// Get shipping override by ID
exports.shippingOverrideRouter.get("/:id", shipping_override_controller_1.getShippingOverrideById);
// Create a new shipping override
exports.shippingOverrideRouter.post("/", shipping_override_controller_1.createShippingOverride);
// Update a shipping override
exports.shippingOverrideRouter.put("/:id", shipping_override_controller_1.updateShippingOverride);
// Delete a shipping override
exports.shippingOverrideRouter.delete("/:id", shipping_override_controller_1.deleteShippingOverride);
