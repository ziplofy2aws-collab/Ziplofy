"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderTagRouter = void 0;
const express_1 = require("express");
const purchase_order_tag_controller_1 = require("../controllers/purchase-order-tag.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.purchaseOrderTagRouter = (0, express_1.Router)();
// Protected routes (authentication required)
exports.purchaseOrderTagRouter.use(auth_middleware_1.protect);
// Create a new purchase order tag
exports.purchaseOrderTagRouter.post("/", purchase_order_tag_controller_1.createPurchaseOrderTag);
// Get all purchase order tags by store ID
exports.purchaseOrderTagRouter.get("/store/:storeId", purchase_order_tag_controller_1.getPurchaseOrderTagsByStoreId);
// Delete a purchase order tag by ID
exports.purchaseOrderTagRouter.delete("/:id", purchase_order_tag_controller_1.deletePurchaseOrderTag);
