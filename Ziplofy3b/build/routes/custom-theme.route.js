"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customThemeRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const custom_theme_controller_1 = require("../controllers/custom-theme.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.customThemeRouter = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = path_1.default.join(process.cwd(), 'uploads', 'temp');
        if (!fs_1.default.existsSync(tempDir))
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "zipFile") {
        if (file.mimetype === "application/zip" ||
            file.mimetype === "application/x-zip-compressed" ||
            file.mimetype === "application/octet-stream") {
            cb(null, true);
        }
        else {
            cb(new Error("Only ZIP files are allowed"));
        }
    }
    else if (file.fieldname === "thumbnail") {
        // Allow image files for thumbnails
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed for thumbnails"));
        }
    }
    else {
        cb(new Error("Unexpected field"));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit for large themes
        fieldSize: 500 * 1024 * 1024, // 500MB limit for form fields
    },
});
// Public route for serving custom theme files (for preview)
// This must come BEFORE protect middleware and other routes
// Express doesn't natively support * wildcards, so we use middleware to catch file requests
const isFileRequest = (req, res, next) => {
    // Check if the path matches /:themeId/files or /:themeId/files/*
    const pathMatch = req.path.match(/^\/([^\/]+)\/files(\/.*)?$/);
    if (pathMatch) {
        const themeId = pathMatch[1];
        const filePath = pathMatch[2] ? pathMatch[2].substring(1) : 'index.html'; // Remove leading /
        // Set params for the controller
        req.params.themeId = themeId;
        req.params[0] = filePath;
        // Use optionalAuth, then serve the file
        return auth_middleware_1.optionalAuth(req, res, () => {
            (0, custom_theme_controller_1.serveCustomThemeFiles)(req, res, next);
        });
    }
    // Not a file request, continue to next middleware
    next();
};
// Apply file request handler before protect
exports.customThemeRouter.use(isFileRequest);
// All other routes require authentication
exports.customThemeRouter.use(auth_middleware_1.protect);
// Get all custom themes for the authenticated user
exports.customThemeRouter.route("/").get(custom_theme_controller_1.getCustomThemes);
// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: `File too large. Maximum size is 500MB. ${err.message}`,
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error',
        });
    }
    next();
};
// Create custom theme (with zip file and optional thumbnail upload)
exports.customThemeRouter.route("/").post(upload.fields([
    { name: "zipFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]), handleMulterError, custom_theme_controller_1.createCustomTheme);
// Get single custom theme
exports.customThemeRouter.route("/:id").get(custom_theme_controller_1.getCustomTheme);
// Update custom theme (with zip file and optional thumbnail upload)
exports.customThemeRouter.route("/:id").put(upload.fields([
    { name: "zipFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]), handleMulterError, custom_theme_controller_1.updateCustomTheme);
// Delete custom theme
exports.customThemeRouter.route("/:id").delete(custom_theme_controller_1.deleteCustomTheme);
// Install custom theme to a store
exports.customThemeRouter.route("/install").post(custom_theme_controller_1.installCustomTheme);
// Uninstall custom theme from a store
exports.customThemeRouter.route("/uninstall").post(custom_theme_controller_1.uninstallCustomTheme);
