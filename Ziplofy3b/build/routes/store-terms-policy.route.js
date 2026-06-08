"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_terms_policy_controller_1 = require("../controllers/store-terms-policy.controller");
const storeTermsPolicyRouter = (0, express_1.Router)();
storeTermsPolicyRouter.post('/', store_terms_policy_controller_1.createStoreTermsPolicy);
storeTermsPolicyRouter.put('/:id', store_terms_policy_controller_1.updateStoreTermsPolicy);
storeTermsPolicyRouter.get('/store/:storeId', store_terms_policy_controller_1.getStoreTermsPolicyByStoreId);
exports.default = storeTermsPolicyRouter;
