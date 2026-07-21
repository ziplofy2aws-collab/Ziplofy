import { Router } from 'express';
import { getStorefrontCheckoutConfigurationByStoreId } from '../../controllers/storefront-checkout-configuration.controller';

export const storeFrontCheckoutConfigurationRouter = Router();

storeFrontCheckoutConfigurationRouter.get(
  '/store/:storeId',
  getStorefrontCheckoutConfigurationByStoreId
);
