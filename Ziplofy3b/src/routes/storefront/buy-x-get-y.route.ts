import { Router } from 'express';
import {
  checkEligibleBuyXGetYDiscounts,
  validateBuyXGetYDiscountCode,
} from '../../controllers/storefront/buy-x-get-y.controller';

/**
 * Storefront Buy X Get Y discount routes (checkout).
 * Base path: /api/storefront/discounts/buy-x-get-y
 *
 * POST /check         – Get eligible automatic Buy X Get Y discounts for current cart (and optional customer).
 * POST /validate-code – Validate a discount code and return discount amount if valid.
 */
export const storefrontBuyXGetYRouter = Router();

storefrontBuyXGetYRouter.post('/check', checkEligibleBuyXGetYDiscounts);
storefrontBuyXGetYRouter.post('/validate-code', validateBuyXGetYDiscountCode);
