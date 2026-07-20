import { Router } from 'express';
import { checkEligibleFreeShippingDiscounts, validateFreeShippingDiscountCode } from '../../controllers/storefront/free-shipping.controller';

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
export const storefrontFreeShippingRouter = Router();

storefrontFreeShippingRouter.post('/check', checkEligibleFreeShippingDiscounts);
storefrontFreeShippingRouter.post('/validate-code', validateFreeShippingDiscountCode);
