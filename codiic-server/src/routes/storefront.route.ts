import { Router } from 'express';
import {
  getStorefrontAccess,
  verifyStorefrontPassword,
} from '../controllers/storefront-access.controller';
import { getStorefrontPaymentMethods } from '../controllers/payment-provider.controller';
import {
  getStorefrontAddToCartLimit,
  getStorefrontCheckoutCustomerInformation,
} from '../controllers/checkout-settings.controller';
import { getStorefrontTaxRate } from '../controllers/storefront-tax.controller';
import { getStoreData, getStorefrontThemeRuntime, renderStorefront, serveThemeAsset } from '../controllers/storefront.controller';
import { renderStorefrontLiquidPage } from '../controllers/storefront-render.controller';
import { getStorefrontReactThemePack } from '../controllers/storefront-theme-pack.controller';
import { requireStorefrontAccessIfEnabled } from '../middlewares/storefront-access.middleware';

export const storefrontRouter = Router();

storefrontRouter.get('/:storeId/access', getStorefrontAccess);
storefrontRouter.post('/:storeId/verify-password', verifyStorefrontPassword);

storefrontRouter.use(requireStorefrontAccessIfEnabled);

// Storefront routes
storefrontRouter.route('/:storeId/payment-methods').get(getStorefrontPaymentMethods);
storefrontRouter
  .route('/:storeId/checkout-customer-information')
  .get(getStorefrontCheckoutCustomerInformation);
storefrontRouter.route('/:storeId/add-to-cart-limit').get(getStorefrontAddToCartLimit);
storefrontRouter.route('/:storeId/tax-rate').get(getStorefrontTaxRate);
storefrontRouter.route('/:storeId/render/page').get(renderStorefrontLiquidPage);
storefrontRouter.route('/:storeId/theme-runtime').get(getStorefrontThemeRuntime);
storefrontRouter.route('/:storeId/react-theme-pack').get(getStorefrontReactThemePack);
storefrontRouter.route('/:storeId').get(renderStorefront);
storefrontRouter.route('/:storeId/assets/:themeId/*').get(serveThemeAsset);
storefrontRouter.route('/:storeId/api/data').get(getStoreData);

