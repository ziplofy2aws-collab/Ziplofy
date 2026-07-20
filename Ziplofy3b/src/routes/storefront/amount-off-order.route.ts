import { Router } from 'express';
import {
  checkEligibleAmountOffOrderDiscounts,
  validateAmountOffOrderDiscountCode,
} from '../../controllers/storefront/amount-off-order.controller';

/**
 * Storefront amount-off-order discount routes (checkout).
 * Base path: /api/storefront/discounts/amount-off-order
 *
 * POST /check         – Get eligible automatic discounts for current cart (and optional customer).
 * POST /validate-code – Validate a discount code and return discount amount if valid.
 */
export const storefrontAmountOffOrderRouter = Router();

storefrontAmountOffOrderRouter.post('/check', checkEligibleAmountOffOrderDiscounts);
storefrontAmountOffOrderRouter.post('/validate-code', validateAmountOffOrderDiscountCode);
