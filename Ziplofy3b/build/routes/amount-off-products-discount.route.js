"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const amount_off_products_discount_controller_1 = require("../controllers/amount-off-products-discount.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.post('/', amount_off_products_discount_controller_1.AmountOffProductsDiscountController.createDiscount);
router.get('/store/:id', amount_off_products_discount_controller_1.AmountOffProductsDiscountController.getDiscountsByStore);
// Get orders where this discount was used (must be before /:id)
router.get('/:id/orders', amount_off_products_discount_controller_1.AmountOffProductsDiscountController.getOrdersByDiscount);
router.get('/:id', amount_off_products_discount_controller_1.AmountOffProductsDiscountController.getDiscountById);
router.put('/:id', amount_off_products_discount_controller_1.AmountOffProductsDiscountController.updateDiscount);
router.delete('/:id', amount_off_products_discount_controller_1.AmountOffProductsDiscountController.deleteDiscount);
exports.default = router;
