"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThemeInstallationDetails = exports.updateTheme = exports.uninstallTheme = exports.getClientInstalledThemes = exports.installTheme = void 0;
const error_utils_1 = require("../utils/error.utils");
const theme_clone_utils_1 = require("../utils/theme-clone.utils");
const theme_model_1 = require("../models/theme.model");
const store_model_1 = require("../models/store/store.model");
const installed_themes_model_1 = require("../models/installed-themes.model");
/**
 * Install theme to client's store
 */
exports.installTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId, storeId } = req.body;
    const clientId = req.user?.id; // Assuming user ID is available in req.user
    if (!themeId || !storeId) {
        throw new error_utils_1.CustomError('Theme ID and Store ID are required', 400);
    }
    // Verify theme exists
    const theme = await theme_model_1.Theme.findById(themeId);
    if (!theme) {
        throw new error_utils_1.CustomError('Theme not found', 404);
    }
    // Verify store belongs to client
    const store = await store_model_1.Store.findById(storeId);
    if (!store) {
        throw new error_utils_1.CustomError('Store not found', 404);
    }
    if (store.userId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Unauthorized: Store does not belong to client', 403);
    }
    // Check if theme is already installed
    const existingInstallation = await installed_themes_model_1.InstalledThemes.findOne({
        themeId,
        storeId,
        status: 'installed'
    });
    if (existingInstallation) {
        throw new error_utils_1.CustomError('Theme is already installed in this store', 400);
    }
    try {
        // Clone theme to client's store
        const clonedThemePath = await (0, theme_clone_utils_1.cloneThemeToStore)(themeId, clientId, storeId);
        // Create installation record in database
        const installation = await installed_themes_model_1.InstalledThemes.create({
            themeId,
            storeId,
            clientId,
            status: 'installed',
            installedAt: new Date(),
            themePath: clonedThemePath,
            customizations: []
        });
        // Update theme installation count
        await theme_model_1.Theme.findByIdAndUpdate(themeId, {
            $inc: { installationCount: 1 }
        });
        res.status(201).json({
            success: true,
            message: 'Theme installed successfully',
            data: {
                installationId: installation._id,
                themeId,
                storeId,
                themePath: clonedThemePath,
                installedAt: installation.installedAt
            }
        });
    }
    catch (error) {
        throw new error_utils_1.CustomError(`Failed to install theme: ${error}`, 500);
    }
});
/**
 * Get installed themes for a client's store
 */
exports.getClientInstalledThemes = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const clientId = req.user?.id;
    if (!storeId) {
        throw new error_utils_1.CustomError('Store ID is required', 400);
    }
    // Verify store belongs to client
    const store = await store_model_1.Store.findById(storeId);
    if (!store) {
        throw new error_utils_1.CustomError('Store not found', 404);
    }
    if (store.userId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Unauthorized: Store does not belong to client', 403);
    }
    try {
        // Get installed themes from database
        const installedThemes = await installed_themes_model_1.InstalledThemes.find({
            storeId,
            status: 'installed'
        }).populate('themeId', 'name description previewImage category');
        // Get additional file system information
        const themesWithDetails = await Promise.all(installedThemes.map(async (installation) => {
            try {
                const fileSystemThemes = await (0, theme_clone_utils_1.getInstalledThemes)(clientId, storeId);
                const fileSystemTheme = fileSystemThemes.find(t => t.themeId === installation.themeId.toString());
                return {
                    ...installation.toObject(),
                    fileSystemInfo: fileSystemTheme || null
                };
            }
            catch (error) {
                return installation.toObject();
            }
        }));
        res.status(200).json({
            success: true,
            data: themesWithDetails
        });
    }
    catch (error) {
        throw new error_utils_1.CustomError(`Failed to get installed themes: ${error}`, 500);
    }
});
/**
 * Uninstall theme from client's store
 */
exports.uninstallTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const clientId = req.user?.id;
    if (!installationId) {
        throw new error_utils_1.CustomError('Installation ID is required', 400);
    }
    // Find installation record
    const installation = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installation) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    // Verify client owns this installation
    if (installation.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Unauthorized: You do not own this theme installation', 403);
    }
    try {
        // Update installation status
        await installed_themes_model_1.InstalledThemes.findByIdAndUpdate(installationId, {
            status: 'uninstalled',
            uninstalledAt: new Date()
        });
        // Update theme installation count
        await theme_model_1.Theme.findByIdAndUpdate(installation.themeId, {
            $inc: { installationCount: -1 }
        });
        res.status(200).json({
            success: true,
            message: 'Theme uninstalled successfully'
        });
    }
    catch (error) {
        throw new error_utils_1.CustomError(`Failed to uninstall theme: ${error}`, 500);
    }
});
/**
 * Update theme customization
 */
exports.updateTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const { customization } = req.body;
    const clientId = req.user?.id;
    if (!installationId) {
        throw new error_utils_1.CustomError('Installation ID is required', 400);
    }
    if (!customization) {
        throw new error_utils_1.CustomError('Customization data is required', 400);
    }
    // Find installation record
    const installation = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installation) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    // Verify client owns this installation
    if (installation.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Unauthorized: You do not own this theme installation', 403);
    }
    try {
        // Update customization in database
        await installed_themes_model_1.InstalledThemes.findByIdAndUpdate(installationId, {
            $push: { customizations: { ...customization, updatedAt: new Date() } }
        });
        // Update file system customization
        await (0, theme_clone_utils_1.updateThemeCustomization)(installation.storeId.toString(), installation.themeId.toString(), customization);
        res.status(200).json({
            success: true,
            message: 'Theme customization updated successfully'
        });
    }
    catch (error) {
        throw new error_utils_1.CustomError(`Failed to update theme customization: ${error}`, 500);
    }
});
/**
 * Get theme installation details
 */
exports.getThemeInstallationDetails = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const clientId = req.user?.id;
    if (!installationId) {
        throw new error_utils_1.CustomError('Installation ID is required', 400);
    }
    // Find installation record
    const installation = await installed_themes_model_1.InstalledThemes.findById(installationId)
        .populate('themeId', 'name description previewImage category')
        .populate('storeId', 'name subdomain');
    if (!installation) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    // Verify client owns this installation
    if (installation.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Unauthorized: You do not own this theme installation', 403);
    }
    try {
        // Get file system information
        const fileSystemThemes = await (0, theme_clone_utils_1.getInstalledThemes)(clientId, installation.storeId.toString());
        const fileSystemTheme = fileSystemThemes.find(t => t.themeId === installation.themeId.toString());
        res.status(200).json({
            success: true,
            data: {
                ...installation.toObject(),
                fileSystemInfo: fileSystemTheme || null
            }
        });
    }
    catch (error) {
        throw new error_utils_1.CustomError(`Failed to get theme installation details: ${error}`, 500);
    }
});
