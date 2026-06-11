"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontSitemapRouter = void 0;
const express_1 = require("express");
const storefront_sitemap_controller_1 = require("../../controllers/storefront-sitemap.controller");
exports.storefrontSitemapRouter = (0, express_1.Router)();
exports.storefrontSitemapRouter.get('/sitemap.xml', storefront_sitemap_controller_1.getStorefrontSitemap);
