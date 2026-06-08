"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryLevelRouter = void 0;
const express_1 = require("express");
const inventory_level_controller_1 = require("../controllers/inventory-level.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.inventoryLevelRouter = (0, express_1.Router)();
// All routes are protected
exports.inventoryLevelRouter.use(auth_middleware_1.protect);
// GET /api/inventory-levels/location/:locationId
exports.inventoryLevelRouter.get('/location/:locationId', inventory_level_controller_1.getInventoryLevelsByLocation);
// PUT /api/inventory-levels/:id
exports.inventoryLevelRouter.put('/:id', inventory_level_controller_1.updateInventoryLevel);
