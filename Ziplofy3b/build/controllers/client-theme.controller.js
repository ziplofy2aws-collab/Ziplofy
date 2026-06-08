"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientStore = exports.uninstallClientTheme = exports.updateClientThemeCustomizations = exports.getClientThemeInstallation = exports.getClientInstalledThemes = exports.installClientTheme = exports.getAvailableThemes = void 0;
const error_utils_1 = require("../utils/error.utils");
const theme_clone_utils_1 = require("../utils/theme-clone.utils");
const theme_model_1 = require("../models/theme.model");
const store_model_1 = require("../models/store/store.model");
const installed_themes_model_1 = require("../models/installed-themes.model");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Get all available themes for clients
 */
exports.getAvailableThemes = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const themes = await theme_model_1.Theme.find({ status: 'active' })
        .select('name description category price previewImage installationCount')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: themes,
    });
});
/**
 * Install theme to client's store
 */
exports.installClientTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId, storeId } = req.body;
    const clientId = req.user?.id; // Assuming user ID is available in req.user
    if (!themeId || !storeId) {
        throw new error_utils_1.CustomError('Theme ID and Store ID are required', 400);
    }
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    const themePath = await (0, theme_clone_utils_1.cloneThemeToStore)(themeId, storeId, clientId);
    res.status(201).json({
        success: true,
        message: 'Theme installed successfully',
        data: { themePath },
    });
});
/**
 * Get all installed themes for a specific client's store
 */
exports.getClientInstalledThemes = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    const installedThemes = await (0, theme_clone_utils_1.getInstalledThemes)(storeId, new mongoose_1.default.Types.ObjectId(storeId).toString());
    res.status(200).json({
        success: true,
        data: installedThemes,
    });
});
/**
 * Get details of a specific theme installation for client
 */
exports.getClientThemeInstallation = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    const installedTheme = await (0, theme_clone_utils_1.getThemeInstallationDetails)(new mongoose_1.default.Types.ObjectId(installationId));
    // Verify that this installation belongs to the client
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    res.status(200).json({
        success: true,
        data: installedTheme,
    });
});
/**
 * Update customizations for an installed theme (client)
 */
exports.updateClientThemeCustomizations = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const { customizations } = req.body;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    if (!customizations || !Array.isArray(customizations)) {
        throw new error_utils_1.CustomError('Customizations array is required', 400);
    }
    // Verify ownership before updating
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    const updatedTheme = await (0, theme_clone_utils_1.updateThemeCustomization)(installedTheme.storeId.toString(), installedTheme.themeId.toString(), customizations);
    res.status(200).json({
        success: true,
        message: 'Theme customizations updated successfully',
        data: updatedTheme,
    });
});
/**
 * Uninstall a theme from client's store
 */
exports.uninstallClientTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    // Verify ownership before uninstalling
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    await (0, theme_clone_utils_1.uninstallTheme)(new mongoose_1.default.Types.ObjectId(installationId));
    res.status(200).json({
        success: true,
        message: 'Theme uninstalled successfully',
    });
});
/**
 * Get client's store information
 */
exports.getClientStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    const store = await store_model_1.Store.findOne({ userId: new mongoose_1.default.Types.ObjectId(clientId) });
    if (!store) {
        throw new error_utils_1.CustomError('Store not found for this client', 404);
    }
    res.status(200).json({
        success: true,
        data: store,
    });
});
