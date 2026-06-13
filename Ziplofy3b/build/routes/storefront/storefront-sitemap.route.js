"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontSitemapRouter = exports.storefrontSeoRouter = void 0;
const express_1 = require("express");
const storefront_robots_controller_1 = require("../../controllers/storefront-robots.controller");
const storefront_sitemap_controller_1 = require("../../controllers/storefront-sitemap.controller");
exports.storefrontSeoRouter = (0, express_1.Router)();
exports.storefrontSeoRouter.get('/sitemap.xml', storefront_sitemap_controller_1.getStorefrontSitemap);
exports.storefrontSeoRouter.get('/robots.txt', storefront_robots_controller_1.getStorefrontRobots);
/** @deprecated Use storefrontSeoRouter */
exports.storefrontSitemapRouter = exports.storefrontSeoRouter;
