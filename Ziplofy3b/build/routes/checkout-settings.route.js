"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkout_settings_controller_1 = require("../controllers/checkout-settings.controller");
const router = (0, express_1.Router)();
router.put('/:id', checkout_settings_controller_1.updateCheckoutSettings);
router.get('/store/:storeId', checkout_settings_controller_1.getCheckoutSettingsByStoreId);
exports.default = router;
