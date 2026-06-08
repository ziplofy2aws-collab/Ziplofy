"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeRouter = void 0;
const express_1 = require("express");
const theme_controller_1 = require("../controllers/theme.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
exports.themeRouter = (0, express_1.Router)();
// Public routes
exports.themeRouter.route("/installed").get(theme_controller_1.getInstalledThemes);
exports.themeRouter.route("/").get(theme_controller_1.getThemes);
exports.themeRouter.route("/themesStatic").get(theme_controller_1.getThemesStatic);
// install theme - MUST come before /:id route
exports.themeRouter.post("/install", theme_controller_1.installTheme);
// Serve installed theme files
exports.themeRouter.route("/installed/:storeId/:themeId/*").get(theme_controller_1.serveInstalledThemeFiles);
// Theme preview routes - MUST come before /:id route
exports.themeRouter.route("/preview/:themeId").get(theme_controller_1.getThemePreview);
exports.themeRouter.route("/preview/:themeId/*").get(theme_controller_1.serveThemePreviewFiles);
// Expose theme files for editor publicly (read-only), but merge with user context if token provided
exports.themeRouter.route("/files/:themeId").get(auth_middleware_1.optionalAuth, theme_controller_1.listThemeFiles);
exports.themeRouter.route("/file/:themeId").get(auth_middleware_1.optionalAuth, theme_controller_1.readThemeFile);
// Protected routes
exports.themeRouter.use(auth_middleware_1.protect);
// S3-direct theme upload (must be before /:id)
exports.themeRouter.post("/from-s3", (0, auth_middleware_1.authorizePermission)("Theme Management", "upload"), theme_controller_1.createThemeFromS3);
exports.themeRouter.post("/apply", theme_controller_1.applyThemeToStore);
exports.themeRouter.route("/uninstall").delete(theme_controller_1.uninstallTheme);
exports.themeRouter.get("/:themeId/editor-pack", theme_controller_1.getThemeEditorPack);
exports.themeRouter.get("/:themeId/store-config", theme_controller_1.getStoreThemeConfig);
exports.themeRouter.put("/:themeId/store-config", theme_controller_1.putStoreThemeConfig);
exports.themeRouter.route("/:id").get(theme_controller_1.getTheme);
exports.themeRouter.route("/:id/thumbnail").get(theme_controller_1.getThumbnail);
exports.themeRouter.route("/stats").get((0, auth_middleware_1.authorize)(types_1.RoleType.SUPER_ADMIN), theme_controller_1.getThemeStats);
exports.themeRouter.route("/:id/download").get(theme_controller_1.downloadTheme);
// Save user-specific edits (any authenticated user; no super-admin requirement)
exports.themeRouter.route("/:themeId/save-edit").post(theme_controller_1.saveUserFileEdit);
// Legacy multipart catalog upload removed — returns 410 Gone
exports.themeRouter.route("/").post((0, auth_middleware_1.authorizePermission)("Theme Management", "upload"), theme_controller_1.createTheme);
exports.themeRouter
    .route("/:id")
    .put((0, auth_middleware_1.authorizePermission)("Theme Management", "edit"), theme_controller_1.updateTheme)
    .delete((0, auth_middleware_1.authorizePermission)("Theme Management", "edit"), theme_controller_1.deleteTheme);
