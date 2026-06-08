"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_shipping_policy_controller_1 = require("../controllers/store-shipping-policy.controller");
const storeShippingPolicyRouter = (0, express_1.Router)();
storeShippingPolicyRouter.post('/', store_shipping_policy_controller_1.createStoreShippingPolicy);
storeShippingPolicyRouter.put('/:id', store_shipping_policy_controller_1.updateStoreShippingPolicy);
storeShippingPolicyRouter.get('/store/:storeId', store_shipping_policy_controller_1.getStoreShippingPolicyByStoreId);
exports.default = storeShippingPolicyRouter;
