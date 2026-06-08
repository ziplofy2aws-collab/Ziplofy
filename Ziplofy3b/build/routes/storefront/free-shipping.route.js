"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontFreeShippingRouter = void 0;
const express_1 = require("express");
const free_shipping_controller_1 = require("../../controllers/storefront/free-shipping.controller");
/**
 * Storefront free shipping discount routes (checkout).
 * Base path: /api/storefront/discounts/free-shipping
 *
 * POST /check         – Get eligible automatic free shipping discounts for current cart.
 *                       Use when page loads or cart/address changes to show "You qualify for free shipping!".
 *
 * POST /validate-code – Validate a discount code entered by the user.
 *                       Use when user submits a code; returns discount if valid and requirements match.
 */
exports.storefrontFreeShippingRouter = (0, express_1.Router)();
exports.storefrontFreeShippingRouter.post('/check', free_shipping_controller_1.checkEligibleFreeShippingDiscounts);
exports.storefrontFreeShippingRouter.post('/validate-code', free_shipping_controller_1.validateFreeShippingDiscountCode);
