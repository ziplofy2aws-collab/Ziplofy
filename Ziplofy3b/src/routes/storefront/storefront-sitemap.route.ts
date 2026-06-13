import { Router } from 'express';
import { getStorefrontRobots } from '../../controllers/storefront-robots.controller';
import { getStorefrontSitemap } from '../../controllers/storefront-sitemap.controller';

export const storefrontSeoRouter = Router();

storefrontSeoRouter.get('/sitemap.xml', getStorefrontSitemap);
storefrontSeoRouter.get('/robots.txt', getStorefrontRobots);

/** @deprecated Use storefrontSeoRouter */
export const storefrontSitemapRouter = storefrontSeoRouter;
