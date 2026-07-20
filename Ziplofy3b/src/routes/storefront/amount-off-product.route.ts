import { Router } from 'express';
import {
  checkEligibleAmountOffProductDiscounts,
  validateAmountOffProductDiscountCode,
} from '../../controllers/storefront/amount-off-product.controller';

/**
 * Storefront amount-off-product discount routes (checkout).
 * Base path: /api/storefront/discounts/amount-off-product
 *
 * POST /check         – Get eligible automatic discounts for current cart (and optional customer).
 * POST /validate-code – Validate a discount code and return discount amount if valid.
 */
export const storefrontAmountOffProductRouter = Router();

storefrontAmountOffProductRouter.post('/check', checkEligibleAmountOffProductDiscounts);
storefrontAmountOffProductRouter.post('/validate-code', validateAmountOffProductDiscountCode);
