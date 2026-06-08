import { Router } from "express";
import {
  applyThemeToStore,
  createTheme,
  createThemeFromS3,
  deleteTheme,
  downloadTheme,
  getInstalledThemes,
  getTheme,
  getThemes,
  getThemesStatic,
  getThemeStats,
  getThumbnail,
  getThemePreview,
  installTheme,
  serveInstalledThemeFiles,
  serveThemePreviewFiles,
  uninstallTheme,
  updateTheme,
  listThemeFiles,
  readThemeFile,
  saveUserFileEdit,
  getStoreThemeConfig,
  getThemeEditorPack,
  putStoreThemeConfig,
} from "../controllers/theme.controller";
import { authorize, authorizePermission, optionalAuth, protect } from "../middlewares/auth.middleware";
import { RoleType } from "../types";

export const themeRouter = Router();

// Public routes
themeRouter.route("/installed").get(getInstalledThemes);
themeRouter.route("/").get(getThemes);

themeRouter.route("/themesStatic").get(getThemesStatic);

// install theme - MUST come before /:id route
themeRouter.post("/install", installTheme);

// Serve installed theme files
themeRouter.route("/installed/:storeId/:themeId/*").get(serveInstalledThemeFiles);

// Theme preview routes - MUST come before /:id route
themeRouter.route("/preview/:themeId").get(getThemePreview);
themeRouter.route("/preview/:themeId/*").get(serveThemePreviewFiles);

// Expose theme files for editor publicly (read-only), but merge with user context if token provided
themeRouter.route("/files/:themeId").get(optionalAuth as any, listThemeFiles);
themeRouter.route("/file/:themeId").get(optionalAuth as any, readThemeFile);

// Protected routes
themeRouter.use(protect);

// S3-direct theme upload (must be before /:id)
themeRouter.post(
  "/from-s3",
  authorizePermission("Theme Management", "upload"),
  createThemeFromS3
);

themeRouter.post("/apply", applyThemeToStore);
themeRouter.route("/uninstall").delete(uninstallTheme);

themeRouter.get("/:themeId/editor-pack", getThemeEditorPack);
themeRouter.get("/:themeId/store-config", getStoreThemeConfig);
themeRouter.put("/:themeId/store-config", putStoreThemeConfig);

themeRouter.route("/:id").get(getTheme);
themeRouter.route("/:id/thumbnail").get(getThumbnail);
themeRouter.route("/stats").get(authorize(RoleType.SUPER_ADMIN), getThemeStats);

themeRouter.route("/:id/download").get(downloadTheme);

// Save user-specific edits (any authenticated user; no super-admin requirement)
themeRouter.route("/:themeId/save-edit").post(saveUserFileEdit);

// Legacy multipart catalog upload removed — returns 410 Gone
themeRouter.route("/").post(authorizePermission("Theme Management", "upload"), createTheme);

themeRouter
  .route("/:id")
  .put(authorizePermission("Theme Management", "edit"), updateTheme)
  .delete(authorizePermission("Theme Management", "edit"), deleteTheme);
