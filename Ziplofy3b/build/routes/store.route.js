"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRouter = void 0;
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.storeRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.storeRouter.use(auth_middleware_1.protect);
// Get stores for authenticated user
exports.storeRouter.get("/my-stores", store_controller_1.getStoresByUserId);
// Get stores for a specific user (super-admin/support-admin only)
exports.storeRouter.get("/user/:userId", store_controller_1.getStoresByUserParam);
// Create a new store
exports.storeRouter.post("/", store_controller_1.createStore);
// Update a store
exports.storeRouter.put('/:id', store_controller_1.updateStore);
