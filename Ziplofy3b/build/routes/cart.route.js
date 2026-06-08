"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const storefront_auth_middleware_1 = require("../middlewares/storefront-auth.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.cartRouter = (0, express_1.Router)();
// Admin route to get all user carts for a store (store owners only)
exports.cartRouter.get('/store/:storeId', auth_middleware_1.protect, cart_controller_1.getStoreUserCarts);
exports.cartRouter.use(storefront_auth_middleware_1.storefrontProtect);
// Create or set quantity for a cart entry
exports.cartRouter.post('/', cart_controller_1.createCartEntry);
// Get all cart entries for a customer
exports.cartRouter.get('/customer/:customerId', cart_controller_1.getCustomerCartEntries);
// Update quantity for a cart entry
exports.cartRouter.patch('/:id', cart_controller_1.updateCartEntry);
// Delete a cart entry
exports.cartRouter.delete('/:id', cart_controller_1.deleteCartEntry);
