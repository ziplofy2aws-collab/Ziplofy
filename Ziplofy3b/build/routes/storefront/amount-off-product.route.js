"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontAmountOffProductRouter = void 0;
const express_1 = require("express");
const amount_off_product_controller_1 = require("../../controllers/storefront/amount-off-product.controller");
/**
 * Storefront amount-off-product discount routes (checkout).
 * Base path: /api/storefront/discounts/amount-off-product
 *
 * POST /check         – Get eligible automatic discounts for current cart (and optional customer).
 * POST /validate-code – Validate a discount code and return discount amount if valid.
 */
exports.storefrontAmountOffProductRouter = (0, express_1.Router)();
exports.storefrontAmountOffProductRouter.post('/check', amount_off_product_controller_1.checkEligibleAmountOffProductDiscounts);
exports.storefrontAmountOffProductRouter.post('/validate-code', amount_off_product_controller_1.validateAmountOffProductDiscountCode);
