"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packagingRouter = void 0;
const express_1 = require("express");
const packaging_controller_1 = require("../controllers/packaging.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.packagingRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.packagingRouter.use(auth_middleware_1.protect);
// Create a new packaging
exports.packagingRouter.post("/", packaging_controller_1.createPackaging);
// Get all packaging for a specific store
exports.packagingRouter.get("/store/:storeId", packaging_controller_1.getPackagingByStoreId);
// Get default packaging for a store
exports.packagingRouter.get("/store/:storeId/default", packaging_controller_1.getDefaultPackaging);
// Get a specific packaging by ID
exports.packagingRouter.get("/:id", packaging_controller_1.getPackagingById);
// Update a packaging
exports.packagingRouter.put("/:id", packaging_controller_1.updatePackaging);
// Delete a packaging
exports.packagingRouter.delete("/:id", packaging_controller_1.deletePackaging);
