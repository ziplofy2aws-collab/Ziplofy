"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderRouter = void 0;
const express_1 = require("express");
const purchase_order_controller_1 = require("../controllers/purchase-order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.purchaseOrderRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.purchaseOrderRouter.use(auth_middleware_1.protect);
// Create a new purchase order
exports.purchaseOrderRouter.post("/", purchase_order_controller_1.createPurchaseOrder);
// Get all purchase orders by store ID
exports.purchaseOrderRouter.get("/store/:storeId", purchase_order_controller_1.getPurchaseOrdersByStoreId);
// Mark as ordered
exports.purchaseOrderRouter.patch('/:id/mark-ordered', purchase_order_controller_1.markPurchaseOrderAsOrdered);
// Receive inventory
exports.purchaseOrderRouter.post('/:id/receive', purchase_order_controller_1.receivePurchaseOrderInventory);
