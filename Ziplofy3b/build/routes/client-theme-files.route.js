"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientThemeFilesRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_theme_files_controller_1 = require("../controllers/client-theme-files.controller");
exports.clientThemeFilesRouter = (0, express_1.Router)();
// All routes require authentication
exports.clientThemeFilesRouter.use(auth_middleware_1.protect);
// Get theme file structure
exports.clientThemeFilesRouter.get('/installation/:installationId/structure', client_theme_files_controller_1.getThemeFileStructure);
// Get specific file content
exports.clientThemeFilesRouter.get('/installation/:installationId/file/*', client_theme_files_controller_1.getThemeFileContent);
// Update file content
exports.clientThemeFilesRouter.put('/installation/:installationId/file/*', client_theme_files_controller_1.updateThemeFileContent);
// Create new file
exports.clientThemeFilesRouter.post('/installation/:installationId/file', client_theme_files_controller_1.createThemeFile);
// Delete file
exports.clientThemeFilesRouter.delete('/installation/:installationId/file/*', client_theme_files_controller_1.deleteThemeFile);
