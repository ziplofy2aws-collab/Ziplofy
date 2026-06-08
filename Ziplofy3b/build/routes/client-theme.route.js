"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientThemeRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_theme_controller_1 = require("../controllers/client-theme.controller");
exports.clientThemeRouter = (0, express_1.Router)();
// All routes require authentication
exports.clientThemeRouter.use(auth_middleware_1.protect);
// Get all available themes
exports.clientThemeRouter.get('/themes', client_theme_controller_1.getAvailableThemes);
// Get client's store information
exports.clientThemeRouter.get('/store', client_theme_controller_1.getClientStore);
// Install a theme to client's store
exports.clientThemeRouter.post('/install', client_theme_controller_1.installClientTheme);
// Get all installed themes for a specific store
exports.clientThemeRouter.get('/store/:storeId/themes', client_theme_controller_1.getClientInstalledThemes);
// Get details of a specific theme installation
exports.clientThemeRouter.get('/installation/:installationId', client_theme_controller_1.getClientThemeInstallation);
// Update customizations for an installed theme
exports.clientThemeRouter.put('/installation/:installationId/customize', client_theme_controller_1.updateClientThemeCustomizations);
// Uninstall a theme from client's store
exports.clientThemeRouter.delete('/installation/:installationId', client_theme_controller_1.uninstallClientTheme);
