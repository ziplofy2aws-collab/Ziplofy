"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontOrderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("../../controllers/storefront/order.controller");
const storefront_auth_middleware_1 = require("../../middlewares/storefront-auth.middleware");
exports.storefrontOrderRouter = (0, express_1.Router)();
exports.storefrontOrderRouter.use(storefront_auth_middleware_1.storefrontProtect);
// Create a new order
exports.storefrontOrderRouter.post('/', order_controller_1.createOrder);
// Get all orders for a customer
exports.storefrontOrderRouter.get('/customer/:customerId', order_controller_1.getOrdersByCustomerId);
