import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createCustomTheme,
  deleteCustomTheme,
  getCustomTheme,
  getCustomThemes,
  installCustomTheme,
  serveCustomThemeFiles,
  uninstallCustomTheme,
  updateCustomTheme,
} from "../controllers/custom-theme.controller";
import { protect, optionalAuth } from "../middlewares/auth.middleware";

export const customThemeRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === "zipFile") {
    if (
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.mimetype === "application/octet-stream"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are allowed"));
    }
  } else if (file.fieldname === "thumbnail") {
    // Allow image files for thumbnails
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for thumbnails"));
    }
  } else {
    cb(new Error("Unexpected field"));
  }
};

const upload = multer({
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
const isFileRequest = (req: any, res: any, next: any) => {
  // Check if the path matches /:themeId/files or /:themeId/files/*
  const pathMatch = req.path.match(/^\/([^\/]+)\/files(\/.*)?$/);
  if (pathMatch) {
    const themeId = pathMatch[1];
    const filePath = pathMatch[2] ? pathMatch[2].substring(1) : 'index.html'; // Remove leading /
    
    // Set params for the controller
    req.params.themeId = themeId;
    req.params[0] = filePath;
    
    // Use optionalAuth, then serve the file
    return (optionalAuth as any)(req, res, () => {
      serveCustomThemeFiles(req, res, next);
    });
  }
  // Not a file request, continue to next middleware
  next();
};

// Apply file request handler before protect
customThemeRouter.use(isFileRequest);

// All other routes require authentication
customThemeRouter.use(protect);

// Get all custom themes for the authenticated user
customThemeRouter.route("/").get(getCustomThemes);

// Error handler for multer errors
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
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
customThemeRouter.route("/").post(
  upload.fields([
    { name: "zipFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  handleMulterError,
  createCustomTheme
);

// Get single custom theme
customThemeRouter.route("/:id").get(getCustomTheme);

// Update custom theme (with zip file and optional thumbnail upload)
customThemeRouter.route("/:id").put(
  upload.fields([
    { name: "zipFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  handleMulterError,
  updateCustomTheme
);

// Delete custom theme
customThemeRouter.route("/:id").delete(deleteCustomTheme);

// Install custom theme to a store
customThemeRouter.route("/install").post(installCustomTheme);

// Uninstall custom theme from a store
customThemeRouter.route("/uninstall").post(uninstallCustomTheme);

