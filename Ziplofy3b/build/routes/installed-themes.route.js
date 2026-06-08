"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installedThemesRouter = void 0;
const express_1 = require("express");
const installed_themes_controller_1 = require("../controllers/installed-themes.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.installedThemesRouter = (0, express_1.Router)();
exports.installedThemesRouter.use(auth_middleware_1.protect);
// POST /api/installed-themes/install
exports.installedThemesRouter.post('/', installed_themes_controller_1.installThemeForStore);
// GET /api/installed-themes/store/:storeId
exports.installedThemesRouter.get('/store/:storeId', installed_themes_controller_1.getInstalledThemesByStore);
// DELETE /api/installed-themes/uninstall
exports.installedThemesRouter.delete('/:installedThemeId', installed_themes_controller_1.uninstallThemeForStore);
