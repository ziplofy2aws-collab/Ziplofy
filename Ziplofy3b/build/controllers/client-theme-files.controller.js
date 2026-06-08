"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteThemeFile = exports.createThemeFile = exports.updateThemeFileContent = exports.getThemeFileContent = exports.getThemeFileStructure = void 0;
const error_utils_1 = require("../utils/error.utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const installed_themes_model_1 = require("../models/installed-themes.model");
/**
 * Get theme file structure for client
 */
exports.getThemeFileStructure = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    const themePath = installedTheme.themePath;
    if (!fs_1.default.existsSync(themePath)) {
        throw new error_utils_1.CustomError('Theme directory not found', 404);
    }
    const fileStructure = await getDirectoryStructure(themePath);
    res.status(200).json({
        success: true,
        data: {
            installationId,
            themePath,
            fileStructure,
            directories: {
                clientCode: path_1.default.join(themePath, 'client-code'),
                customizations: path_1.default.join(themePath, 'customizations'),
                assets: path_1.default.join(themePath, 'assets'),
                styles: path_1.default.join(themePath, 'styles'),
                scripts: path_1.default.join(themePath, 'scripts')
            }
        }
    });
});
/**
 * Get specific theme file content
 */
exports.getThemeFileContent = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId, filePath } = req.params;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    const fullPath = path_1.default.join(installedTheme.themePath, filePath);
    // Security check - ensure file is within theme directory
    if (!fullPath.startsWith(installedTheme.themePath)) {
        throw new error_utils_1.CustomError('Access denied. Invalid file path.', 403);
    }
    if (!fs_1.default.existsSync(fullPath)) {
        throw new error_utils_1.CustomError('File not found', 404);
    }
    const stats = fs_1.default.statSync(fullPath);
    if (stats.isDirectory()) {
        throw new error_utils_1.CustomError('Path is a directory, not a file', 400);
    }
    const content = fs_1.default.readFileSync(fullPath, 'utf8');
    const fileExtension = path_1.default.extname(fullPath);
    res.status(200).json({
        success: true,
        data: {
            filePath,
            content,
            fileExtension,
            size: stats.size,
            lastModified: stats.mtime
        }
    });
});
/**
 * Update theme file content
 */
exports.updateThemeFileContent = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId, filePath } = req.params;
    const { content } = req.body;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    if (!content) {
        throw new error_utils_1.CustomError('File content is required', 400);
    }
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    const fullPath = path_1.default.join(installedTheme.themePath, filePath);
    // Security check - ensure file is within theme directory
    if (!fullPath.startsWith(installedTheme.themePath)) {
        throw new error_utils_1.CustomError('Access denied. Invalid file path.', 403);
    }
    // Create directory if it doesn't exist
    const dir = path_1.default.dirname(fullPath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    // Write file content
    fs_1.default.writeFileSync(fullPath, content, 'utf8');
    // Update theme installation record
    installedTheme.updatedAt = new Date();
    await installedTheme.save();
    res.status(200).json({
        success: true,
        message: 'File updated successfully',
        data: {
            filePath,
            lastModified: new Date()
        }
    });
});
/**
 * Create new theme file
 */
exports.createThemeFile = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId } = req.params;
    const { filePath, content } = req.body;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    if (!filePath || !content) {
        throw new error_utils_1.CustomError('File path and content are required', 400);
    }
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    const fullPath = path_1.default.join(installedTheme.themePath, filePath);
    // Security check - ensure file is within theme directory
    if (!fullPath.startsWith(installedTheme.themePath)) {
        throw new error_utils_1.CustomError('Access denied. Invalid file path.', 403);
    }
    // Check if file already exists
    if (fs_1.default.existsSync(fullPath)) {
        throw new error_utils_1.CustomError('File already exists', 409);
    }
    // Create directory if it doesn't exist
    const dir = path_1.default.dirname(fullPath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    // Write file content
    fs_1.default.writeFileSync(fullPath, content, 'utf8');
    res.status(201).json({
        success: true,
        message: 'File created successfully',
        data: {
            filePath,
            created: new Date()
        }
    });
});
/**
 * Delete theme file
 */
exports.deleteThemeFile = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installationId, filePath } = req.params;
    const clientId = req.user?.id;
    if (!clientId) {
        throw new error_utils_1.CustomError('Client ID not found in request', 401);
    }
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installationId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError('Theme installation not found', 404);
    }
    if (installedTheme.clientId.toString() !== clientId) {
        throw new error_utils_1.CustomError('Access denied. This theme installation does not belong to you.', 403);
    }
    const fullPath = path_1.default.join(installedTheme.themePath, filePath);
    // Security check - ensure file is within theme directory
    if (!fullPath.startsWith(installedTheme.themePath)) {
        throw new error_utils_1.CustomError('Access denied. Invalid file path.', 403);
    }
    if (!fs_1.default.existsSync(fullPath)) {
        throw new error_utils_1.CustomError('File not found', 404);
    }
    // Don't allow deletion of critical files
    const criticalFiles = ['theme-config.json', 'README.md'];
    if (criticalFiles.includes(path_1.default.basename(fullPath))) {
        throw new error_utils_1.CustomError('Cannot delete critical theme files', 403);
    }
    fs_1.default.unlinkSync(fullPath);
    res.status(200).json({
        success: true,
        message: 'File deleted successfully'
    });
});
/**
 * Helper function to get directory structure
 */
async function getDirectoryStructure(dirPath, basePath = '') {
    const items = fs_1.default.readdirSync(dirPath);
    const structure = [];
    for (const item of items) {
        const fullPath = path_1.default.join(dirPath, item);
        const relativePath = path_1.default.join(basePath, item);
        const stats = fs_1.default.statSync(fullPath);
        if (stats.isDirectory()) {
            const children = await getDirectoryStructure(fullPath, relativePath);
            structure.push({
                name: item,
                type: 'directory',
                path: relativePath,
                children
            });
        }
        else {
            structure.push({
                name: item,
                type: 'file',
                path: relativePath,
                size: stats.size,
                lastModified: stats.mtime
            });
        }
    }
    return structure;
}
