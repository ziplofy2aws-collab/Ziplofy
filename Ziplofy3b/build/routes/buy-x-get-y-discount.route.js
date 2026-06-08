"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyXGetYDiscountRouter = void 0;
const express_1 = require("express");
const buy_x_get_y_discount_controller_1 = require("../controllers/buy-x-get-y-discount.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.buyXGetYDiscountRouter = (0, express_1.Router)();
exports.buyXGetYDiscountRouter.use(auth_middleware_1.protect);
// Create
exports.buyXGetYDiscountRouter.post('/', buy_x_get_y_discount_controller_1.createBuyXGetYDiscount);
// List by store (must be before /:id so "store" is not captured as id)
exports.buyXGetYDiscountRouter.get('/store/:id', buy_x_get_y_discount_controller_1.getBuyXGetYDiscountsByStore);
// Orders where this discount was used (must be before /:id)
exports.buyXGetYDiscountRouter.get('/:id/orders', buy_x_get_y_discount_controller_1.getOrdersByBuyXGetYDiscount);
// Get by id
exports.buyXGetYDiscountRouter.get('/:id', buy_x_get_y_discount_controller_1.getBuyXGetYDiscountById);
// Update
exports.buyXGetYDiscountRouter.put('/:id', buy_x_get_y_discount_controller_1.updateBuyXGetYDiscount);
// Delete
exports.buyXGetYDiscountRouter.delete('/:id', buy_x_get_y_discount_controller_1.deleteBuyXGetYDiscount);
