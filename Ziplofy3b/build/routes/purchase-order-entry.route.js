"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderEntryRouter = void 0;
const express_1 = require("express");
const purchase_order_entry_controller_1 = require("../controllers/purchase-order-entry.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.purchaseOrderEntryRouter = (0, express_1.Router)();
exports.purchaseOrderEntryRouter.use(auth_middleware_1.protect);
// GET /api/purchase-order-entries/purchase-order/:purchaseOrderId
exports.purchaseOrderEntryRouter.get('/purchase-order/:purchaseOrderId', purchase_order_entry_controller_1.getEntriesByPurchaseOrderId);
