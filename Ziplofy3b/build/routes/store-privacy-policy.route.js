"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_privacy_policy_controller_1 = require("../controllers/store-privacy-policy.controller");
const router = (0, express_1.Router)();
// POST /api/store-privacy-policy
router.post('/', store_privacy_policy_controller_1.createStorePrivacyPolicy);
// PUT /api/store-privacy-policy/:id
router.put('/:id', store_privacy_policy_controller_1.updateStorePrivacyPolicy);
// GET /api/store-privacy-policy/store/:storeId
router.get('/store/:storeId', store_privacy_policy_controller_1.getStorePrivacyPolicyByStoreId);
exports.default = router;
