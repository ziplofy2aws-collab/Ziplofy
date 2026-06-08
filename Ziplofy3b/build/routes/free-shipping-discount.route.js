"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeShippingDiscountRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const free_shipping_discount_controller_1 = require("../controllers/free-shipping-discount.controller");
exports.freeShippingDiscountRouter = (0, express_1.Router)();
exports.freeShippingDiscountRouter.use(auth_middleware_1.protect);
// Create
exports.freeShippingDiscountRouter.post('/', free_shipping_discount_controller_1.createFreeShippingDiscount);
// List by store
exports.freeShippingDiscountRouter.get('/store/:id', free_shipping_discount_controller_1.getFreeShippingDiscountsByStore);
// Get orders where this discount was used (must be before /:id)
exports.freeShippingDiscountRouter.get('/:id/orders', free_shipping_discount_controller_1.getOrdersByFreeShippingDiscount);
// Get by id (for edit)
exports.freeShippingDiscountRouter.get('/:id', free_shipping_discount_controller_1.getFreeShippingDiscountById);
// Update
exports.freeShippingDiscountRouter.put('/:id', free_shipping_discount_controller_1.updateFreeShippingDiscount);
// Delete
exports.freeShippingDiscountRouter.delete('/:id', free_shipping_discount_controller_1.deleteFreeShippingDiscount);
