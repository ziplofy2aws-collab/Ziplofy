"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const general_settings_controller_1 = require("../controllers/general-settings.controller");
const generalSettingsRouter = (0, express_1.Router)();
generalSettingsRouter.put('/:id', general_settings_controller_1.updateGeneralSettings);
generalSettingsRouter.get('/store/:storeId', general_settings_controller_1.getGeneralSettingsByStoreId);
exports.default = generalSettingsRouter;
