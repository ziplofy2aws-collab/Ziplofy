"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_checkout_configuration_controller_1 = require("../controllers/store-checkout-configuration.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const storeCheckoutConfigurationRouter = (0, express_1.Router)();
storeCheckoutConfigurationRouter.use(auth_middleware_1.protect);
/** GET /api/store-checkout-configurations/store/:storeId */
storeCheckoutConfigurationRouter.get('/store/:storeId', store_checkout_configuration_controller_1.getStoreCheckoutConfigurationByStoreId);
/** GET /api/store-checkout-configurations/:id */
storeCheckoutConfigurationRouter.get('/:id', store_checkout_configuration_controller_1.getStoreCheckoutConfigurationById);
/** POST /api/store-checkout-configurations */
storeCheckoutConfigurationRouter.post('/', store_checkout_configuration_controller_1.createStoreCheckoutConfiguration);
/** PUT /api/store-checkout-configurations/:id */
storeCheckoutConfigurationRouter.put('/:id', store_checkout_configuration_controller_1.updateStoreCheckoutConfiguration);
/** DELETE /api/store-checkout-configurations/:id */
storeCheckoutConfigurationRouter.delete('/:id', store_checkout_configuration_controller_1.deleteStoreCheckoutConfiguration);
exports.default = storeCheckoutConfigurationRouter;
