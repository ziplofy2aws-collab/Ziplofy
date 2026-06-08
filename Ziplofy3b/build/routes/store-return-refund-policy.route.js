"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_return_refund_policy_controller_1 = require("../controllers/store-return-refund-policy.controller");
const router = (0, express_1.Router)();
router.post('/', store_return_refund_policy_controller_1.createStoreReturnRefundPolicy);
router.put('/:id', store_return_refund_policy_controller_1.updateStoreReturnRefundPolicy);
router.get('/store/:storeId', store_return_refund_policy_controller_1.getStoreReturnRefundPolicyByStoreId);
exports.default = router;
