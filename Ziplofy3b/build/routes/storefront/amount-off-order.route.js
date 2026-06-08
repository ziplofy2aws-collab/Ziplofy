"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontAmountOffOrderRouter = void 0;
const express_1 = require("express");
const amount_off_order_controller_1 = require("../../controllers/storefront/amount-off-order.controller");
/**
 * Storefront amount-off-order discount routes (checkout).
 * Base path: /api/storefront/discounts/amount-off-order
 *
 * POST /check         – Get eligible automatic discounts for current cart (and optional customer).
 * POST /validate-code – Validate a discount code and return discount amount if valid.
 */
exports.storefrontAmountOffOrderRouter = (0, express_1.Router)();
exports.storefrontAmountOffOrderRouter.post('/check', amount_off_order_controller_1.checkEligibleAmountOffOrderDiscounts);
exports.storefrontAmountOffOrderRouter.post('/validate-code', amount_off_order_controller_1.validateAmountOffOrderDiscountCode);
