import { Router } from 'express';
import {
  getFreeShippingOffersForProduct,
  getAmountOffOrderOffersForProduct,
  getAmountOffProductsOffersForProduct,
  getBuyXGetYOffersForProduct,
} from '../controllers/product-offers.controller';

export const productOffersRouter = Router();

// Public endpoint used by storefront product page to fetch free-shipping offers for a product
productOffersRouter.get('/free-shipping/product/:id', getFreeShippingOffersForProduct);

// Public endpoint used by storefront product page to fetch amount-off-order offers for a product
productOffersRouter.get('/amount-off-order/product/:id', getAmountOffOrderOffersForProduct);

// Public endpoint used by storefront product page to fetch amount-off-products offers for a product
productOffersRouter.get('/amount-off-products/product/:id', getAmountOffProductsOffersForProduct);

// Public endpoint used by storefront product page to fetch buy-x-get-y offers for a product
productOffersRouter.get('/buy-x-get-y/product/:id', getBuyXGetYOffersForProduct);

