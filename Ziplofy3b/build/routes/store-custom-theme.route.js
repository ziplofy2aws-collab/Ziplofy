"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_custom_theme_controller_1 = require("../controllers/store-custom-theme.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const storeCustomThemeRouter = (0, express_1.Router)();
storeCustomThemeRouter.use(auth_middleware_1.protect);
/** GET /api/store-custom-themes/store/:storeId */
storeCustomThemeRouter.get('/store/:storeId', store_custom_theme_controller_1.getStoreCustomThemesByStoreId);
/** POST /api/store-custom-themes */
storeCustomThemeRouter.post('/', store_custom_theme_controller_1.createStoreCustomTheme);
/** PUT /api/store-custom-themes/:id */
storeCustomThemeRouter.put('/:id', store_custom_theme_controller_1.updateStoreCustomTheme);
/** DELETE /api/store-custom-themes/:id */
storeCustomThemeRouter.delete('/:id', store_custom_theme_controller_1.deleteStoreCustomTheme);
exports.default = storeCustomThemeRouter;
