"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_account_settings_controller_1 = require("../controllers/customer-account-settings.controller");
const customerAccountSettingsRouter = (0, express_1.Router)();
// GET /api/customer-account-settings/store/:storeId
customerAccountSettingsRouter.get('/store/:storeId', customer_account_settings_controller_1.getCustomerAccountSettingsByStoreId);
// PUT /api/customer-account-settings/:id
customerAccountSettingsRouter.put('/:id', customer_account_settings_controller_1.updateCustomerAccountSettings);
exports.default = customerAccountSettingsRouter;
