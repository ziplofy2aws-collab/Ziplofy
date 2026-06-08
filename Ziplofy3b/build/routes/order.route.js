"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.orderRouter = (0, express_1.Router)();
exports.orderRouter.use(auth_middleware_1.protect);
// GET /api/orders/store/:storeId - Get all orders by store ID
exports.orderRouter.get('/store/:storeId', order_controller_1.getOrdersByStoreId);
// GET /api/orders/:id - Get order by ID
exports.orderRouter.get('/:id', order_controller_1.getOrderById);
