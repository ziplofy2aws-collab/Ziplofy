"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productOverrideRouter = void 0;
const express_1 = require("express");
const product_override_controller_1 = require("../controllers/product-override.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.productOverrideRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.productOverrideRouter.use(auth_middleware_1.protect);
// Get product overrides by store ID and country ID (must come before other routes)
exports.productOverrideRouter.get("/store/:storeId/country/:countryId", product_override_controller_1.getProductOverridesByStoreAndCountry);
// Get product override by ID
exports.productOverrideRouter.get("/:id", product_override_controller_1.getProductOverrideById);
// Create a new product override
exports.productOverrideRouter.post("/", product_override_controller_1.createProductOverride);
// Update a product override
exports.productOverrideRouter.put("/:id", product_override_controller_1.updateProductOverride);
// Delete a product override
exports.productOverrideRouter.delete("/:id", product_override_controller_1.deleteProductOverride);
