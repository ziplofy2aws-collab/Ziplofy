"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFrontCheckoutConfigurationRouter = void 0;
const express_1 = require("express");
const storefront_checkout_configuration_controller_1 = require("../../controllers/storefront-checkout-configuration.controller");
exports.storeFrontCheckoutConfigurationRouter = (0, express_1.Router)();
exports.storeFrontCheckoutConfigurationRouter.get('/store/:storeId', storefront_checkout_configuration_controller_1.getStorefrontCheckoutConfigurationByStoreId);
