"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productOverrideEntryRouter = void 0;
const express_1 = require("express");
const product_override_entry_controller_1 = require("../controllers/product-override-entry.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.productOverrideEntryRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.productOverrideEntryRouter.use(auth_middleware_1.protect);
// Get product override entries by product override ID (must come before other routes)
exports.productOverrideEntryRouter.get("/product-override/:productOverrideId", product_override_entry_controller_1.getProductOverrideEntriesByProductOverrideId);
// Create a new product override entry
exports.productOverrideEntryRouter.post("/", product_override_entry_controller_1.createProductOverrideEntry);
// Delete a product override entry
exports.productOverrideEntryRouter.delete("/:id", product_override_entry_controller_1.deleteProductOverrideEntry);
