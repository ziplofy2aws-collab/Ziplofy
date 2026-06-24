"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFrontPoliciesRouter = void 0;
const express_1 = require("express");
const storefront_policies_controller_1 = require("../../controllers/storefront-policies.controller");
exports.storeFrontPoliciesRouter = (0, express_1.Router)();
exports.storeFrontPoliciesRouter.get('/store/:storeId', storefront_policies_controller_1.getStorefrontWrittenPoliciesByStoreId);
exports.storeFrontPoliciesRouter.get('/store/:storeId/type/:policyType', storefront_policies_controller_1.getStorefrontPolicyByType);
