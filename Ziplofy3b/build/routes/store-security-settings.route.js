"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_security_settings_controller_1 = require("../controllers/store-security-settings.controller");
const storeSecuritySettingsRouter = (0, express_1.Router)();
// CRUD
storeSecuritySettingsRouter.get('/:storeId', store_security_settings_controller_1.getSecuritySettingsByStoreId);
storeSecuritySettingsRouter.patch('/:id', store_security_settings_controller_1.updateSecuritySettings); // For creation when create: true
storeSecuritySettingsRouter.get('/:id/generateNewCode', store_security_settings_controller_1.generateNewSecurityCode);
exports.default = storeSecuritySettingsRouter;
