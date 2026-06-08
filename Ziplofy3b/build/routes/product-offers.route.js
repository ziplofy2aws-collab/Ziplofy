"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productOffersRouter = void 0;
const express_1 = require("express");
const product_offers_controller_1 = require("../controllers/product-offers.controller");
exports.productOffersRouter = (0, express_1.Router)();
// Public endpoint used by storefront product page to fetch free-shipping offers for a product
exports.productOffersRouter.get('/free-shipping/product/:id', product_offers_controller_1.getFreeShippingOffersForProduct);
// Public endpoint used by storefront product page to fetch amount-off-order offers for a product
exports.productOffersRouter.get('/amount-off-order/product/:id', product_offers_controller_1.getAmountOffOrderOffersForProduct);
// Public endpoint used by storefront product page to fetch amount-off-products offers for a product
exports.productOffersRouter.get('/amount-off-products/product/:id', product_offers_controller_1.getAmountOffProductsOffersForProduct);
// Public endpoint used by storefront product page to fetch buy-x-get-y offers for a product
exports.productOffersRouter.get('/buy-x-get-y/product/:id', product_offers_controller_1.getBuyXGetYOffersForProduct);
