import { Router } from 'express';
import {
  getStorefrontAccess,
  verifyStorefrontPassword,
} from '../controllers/storefront-access.controller';
import { getStoreData, getStorefrontThemeRuntime, renderStorefront, serveThemeAsset } from '../controllers/storefront.controller';
import { renderStorefrontLiquidPage } from '../controllers/storefront-render.controller';
import { getStorefrontReactThemePack } from '../controllers/storefront-theme-pack.controller';
import { requireStorefrontAccessIfEnabled } from '../middlewares/storefront-access.middleware';

export const storefrontRouter = Router();

storefrontRouter.get('/:storeId/access', getStorefrontAccess);
storefrontRouter.post('/:storeId/verify-password', verifyStorefrontPassword);

storefrontRouter.use(requireStorefrontAccessIfEnabled);

// Storefront routes
storefrontRouter.route('/:storeId/render/page').get(renderStorefrontLiquidPage);
storefrontRouter.route('/:storeId/theme-runtime').get(getStorefrontThemeRuntime);
storefrontRouter.route('/:storeId/react-theme-pack').get(getStorefrontReactThemePack);
storefrontRouter.route('/:storeId').get(renderStorefront);
storefrontRouter.route('/:storeId/assets/:themeId/*').get(serveThemeAsset);
storefrontRouter.route('/:storeId/api/data').get(getStoreData);

