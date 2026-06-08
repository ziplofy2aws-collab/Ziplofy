"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontBuyXGetYRouter = void 0;
const express_1 = require("express");
const buy_x_get_y_controller_1 = require("../../controllers/storefront/buy-x-get-y.controller");
/**
 * Storefront Buy X Get Y discount routes (checkout).
 * Base path: /api/storefront/discounts/buy-x-get-y
 *
 * POST /check         – Get eligible automatic Buy X Get Y discounts for current cart (and optional customer).
 * POST /validate-code – Validate a discount code and return discount amount if valid.
 */
exports.storefrontBuyXGetYRouter = (0, express_1.Router)();
exports.storefrontBuyXGetYRouter.post('/check', buy_x_get_y_controller_1.checkEligibleBuyXGetYDiscounts);
exports.storefrontBuyXGetYRouter.post('/validate-code', buy_x_get_y_controller_1.validateBuyXGetYDiscountCode);
