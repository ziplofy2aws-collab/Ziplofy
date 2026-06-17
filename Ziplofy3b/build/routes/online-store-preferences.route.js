"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const online_store_preferences_controller_1 = require("../controllers/online-store-preferences.controller");
const onlineStorePreferencesRouter = (0, express_1.Router)();
onlineStorePreferencesRouter.get('/store/:storeId', online_store_preferences_controller_1.getOnlineStorePreferencesByStoreId);
onlineStorePreferencesRouter.put('/:id', online_store_preferences_controller_1.updateOnlineStorePreferences);
exports.default = onlineStorePreferencesRouter;
