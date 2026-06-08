"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uninstallTheme = exports.getThemeInstallationDetails = void 0;
exports.copyDirectory = copyDirectory;
exports.cloneThemeToStore = cloneThemeToStore;
exports.getInstalledThemes = getInstalledThemes;
exports.updateThemeCustomization = updateThemeCustomization;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const installed_themes_model_1 = require("../models/installed-themes.model");
const theme_model_1 = require("../models/theme.model");
const theme_zip_from_s3_util_1 = require("./theme-zip-from-s3.util");
const error_utils_1 = require("./error.utils");
const copyFile = (0, util_1.promisify)(fs_1.default.copyFile);
const mkdir = (0, util_1.promisify)(fs_1.default.mkdir);
const readdir = (0, util_1.promisify)(fs_1.default.readdir);
const stat = (0, util_1.promisify)(fs_1.default.stat);
/**
 * Recursively copy directory from source to destination
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
async function copyDirectory(src, dest) {
    try {
        // Create destination directory if it doesn't exist
        await mkdir(dest, { recursive: true });
        // Read all items in source directory
        const items = await readdir(src);
        for (const item of items) {
            const srcPath = path_1.default.join(src, item);
            const destPath = path_1.default.join(dest, item);
            const itemStat = await stat(srcPath);
            if (itemStat.isDirectory()) {
                // Recursively copy subdirectory
                await copyDirectory(srcPath, destPath);
            }
            else {
                // Copy file
                await copyFile(srcPath, destPath);
            }
        }
    }
    catch (error) {
        throw new Error(`Failed to copy directory from ${src} to ${dest}: ${error}`);
    }
}
/**
 * Clone theme to client's store directory
 * @param themeId - ID of the theme to clone
 * @param clientId - ID of the client
 * @param storeId - ID of the client's store
 * @returns Promise<string> - Path to the cloned theme directory
 */
async function cloneThemeToStore(themeId, clientId, storeId) {
    try {
        const theme = await theme_model_1.Theme.findById(themeId).lean();
        if (!theme) {
            throw new Error(`Theme with ID ${themeId} not found`);
        }
        const zipKey = theme.s3Assets?.zip?.key;
        const contentPrefix = theme.s3Assets?.contentRoot?.prefix;
        if (!zipKey && !contentPrefix) {
            throw new Error(`Theme ${themeId} has no S3 package to clone`);
        }
        const clientStorePath = path_1.default.join(process.cwd(), 'uploads', 'stores', storeId);
        const destinationThemePath = path_1.default.join(clientStorePath, 'themes', themeId);
        await mkdir(path_1.default.join(clientStorePath, 'themes'), { recursive: true });
        if (fs_1.default.existsSync(destinationThemePath)) {
            await fs_1.default.promises.rm(destinationThemePath, { recursive: true, force: true });
        }
        await mkdir(destinationThemePath, { recursive: true });
        const unzippedRoot = path_1.default.join(destinationThemePath, 'unzippedTheme');
        if (zipKey) {
            await (0, theme_zip_from_s3_util_1.downloadS3ZipAndExtractToDir)(zipKey, unzippedRoot);
        }
        else {
            await (0, theme_zip_from_s3_util_1.downloadS3PrefixToLocalDir)(contentPrefix, unzippedRoot);
        }
        const customizationsPath = path_1.default.join(destinationThemePath, 'customizations');
        const clientCodePath = path_1.default.join(destinationThemePath, 'client-code');
        const assetsPath = path_1.default.join(destinationThemePath, 'assets');
        const stylesPath = path_1.default.join(destinationThemePath, 'styles');
        const scriptsPath = path_1.default.join(destinationThemePath, 'scripts');
        await mkdir(customizationsPath, { recursive: true });
        await mkdir(clientCodePath, { recursive: true });
        await mkdir(assetsPath, { recursive: true });
        await mkdir(stylesPath, { recursive: true });
        await mkdir(scriptsPath, { recursive: true });
        await copyDirectory(unzippedRoot, clientCodePath);
        const themeConfig = {
            themeId,
            clientId,
            storeId,
            installedAt: new Date().toISOString(),
            status: 'installed',
            version: '1.0.0',
            customizations: [],
            isActive: false,
            themePath: destinationThemePath,
            clientCodePath: clientCodePath,
            customizationsPath: customizationsPath,
            assetsPath: assetsPath,
            stylesPath: stylesPath,
            scriptsPath: scriptsPath
        };
        const configPath = path_1.default.join(destinationThemePath, 'theme-config.json');
        await fs_1.default.promises.writeFile(configPath, JSON.stringify(themeConfig, null, 2));
        const readmeContent = `# Theme Customization Guide

## Directory Structure
- \`client-code/\` - Original theme source files (for reference)
- \`customizations/\` - Your custom modifications
- \`assets/\` - Images, fonts, and other assets
- \`styles/\` - CSS files for styling
- \`scripts/\` - JavaScript files for functionality
`;
        const readmePath = path_1.default.join(destinationThemePath, 'README.md');
        await fs_1.default.promises.writeFile(readmePath, readmeContent);
        return destinationThemePath;
    }
    catch (error) {
        throw new Error(`Failed to clone theme: ${error}`);
    }
}
/**
 * Get list of installed themes for a client
 * @param clientId - ID of the client
 * @param storeId - ID of the client's store
 * @returns Promise<Array> - List of installed themes
 */
async function getInstalledThemes(clientId, storeId) {
    try {
        const clientStorePath = path_1.default.join(__dirname, '../../uploads/stores', storeId, 'themes');
        if (!fs_1.default.existsSync(clientStorePath)) {
            return [];
        }
        const themes = await readdir(clientStorePath);
        const installedThemes = [];
        for (const theme of themes) {
            const themePath = path_1.default.join(clientStorePath, theme);
            const configPath = path_1.default.join(themePath, 'theme-config.json');
            if (fs_1.default.existsSync(configPath)) {
                const config = JSON.parse(await fs_1.default.promises.readFile(configPath, 'utf8'));
                installedThemes.push({
                    themeId: theme,
                    ...config,
                    themePath
                });
            }
        }
        return installedThemes;
    }
    catch (error) {
        throw new Error(`Failed to get installed themes: ${error}`);
    }
}
/**
 * Get details of a specific theme installation.
 * @param installationId The ID of the theme installation.
 * @returns The theme installation document.
 */
const getThemeInstallationDetails = async (installationId) => {
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId)
        .populate('themeId', 'name description previewImage')
        .lean();
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    return installedTheme;
};
exports.getThemeInstallationDetails = getThemeInstallationDetails;
/**
 * Uninstall a theme from a client's store.
 * This involves removing the cloned theme directory and updating the database status.
 * @param installationId The ID of the theme installation.
 * @returns A success message.
 */
const uninstallTheme = async (installationId) => {
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    // Remove the cloned theme directory
    if (installedTheme.themePath && fs_1.default.existsSync(installedTheme.themePath)) {
        await fs_1.default.promises.rm(installedTheme.themePath, { recursive: true, force: true });
    }
    // Update status in DB
    installedTheme.status = 'uninstalled';
    installedTheme.uninstalledAt = new Date();
    installedTheme.isActive = false; // Deactivate if uninstalled
    await installedTheme.save();
    return { message: 'Theme uninstalled successfully' };
};
exports.uninstallTheme = uninstallTheme;
/**
 * Update theme customization
 * @param storeId - ID of the client's store
 * @param themeId - ID of the theme
 * @param customization - Customization data
 */
async function updateThemeCustomization(storeId, themeId, customization) {
    try {
        const themePath = path_1.default.join(__dirname, '../../uploads/stores', storeId, 'themes', themeId);
        const configPath = path_1.default.join(themePath, 'theme-config.json');
        if (!fs_1.default.existsSync(configPath)) {
            throw new Error('Theme not found in client store');
        }
        const config = JSON.parse(await fs_1.default.promises.readFile(configPath, 'utf8'));
        config.customizations.push({
            ...customization,
            updatedAt: new Date().toISOString()
        });
        await fs_1.default.promises.writeFile(configPath, JSON.stringify(config, null, 2));
    }
    catch (error) {
        throw new Error(`Failed to update theme customization: ${error}`);
    }
}
