import { Router } from 'express';
import { getStorefrontSitemap } from '../../controllers/storefront-sitemap.controller';

export const storefrontSitemapRouter = Router();

storefrontSitemapRouter.get('/sitemap.xml', getStorefrontSitemap);
