import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import extract from "extract-zip";
import { CustomTheme } from "../models/custom-theme.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { logActivity } from "../utils/activity-log.utils";

// Helper function to create custom theme directory structure
const createCustomThemeDirectory = (themeName: string) => {
  const baseDir = path.join(process.cwd(), "uploads/custom themes/");
  const safeName = themeName.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
  let themeDirName = safeName;
  let themeDirPath = path.join(baseDir, themeDirName);

  // If directory exists, append a unique suffix
  if (fs.existsSync(themeDirPath)) {
    const suffix = Date.now().toString().slice(-6);
    themeDirName = `${safeName}-${suffix}`;
    themeDirPath = path.join(baseDir, themeDirName);
  }

  // Create main theme directory
  if (!fs.existsSync(themeDirPath)) {
    fs.mkdirSync(themeDirPath, { recursive: true });
  }

  // Create subdirectories
  const thumbnailDirPath = path.join(themeDirPath, "thumbnail");
  const unzippedThemeDirPath = path.join(themeDirPath, "unzippedTheme");
  const zippedDirPath = path.join(themeDirPath, "zipped");

  [thumbnailDirPath, unzippedThemeDirPath, zippedDirPath].forEach((p) => {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });

  return {
    themeDir: themeDirPath,
    thumbnailDir: thumbnailDirPath,
    unzippedThemeDir: unzippedThemeDirPath,
    zippedDir: zippedDirPath,
    themeDirName,
  };
};

// Create custom theme
export const createCustomTheme = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // Check for multer errors (file too large, etc.)
    if ((req as any).fileValidationError) {
      throw new CustomError((req as any).fileValidationError, 413);
    }
    
    const { name, status: statusParam } = req.body;
    const status = statusParam === 'published' ? 'published' : 'draft';
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const zipFile = files?.zipFile?.[0];
    const thumbnailFile = files?.thumbnail?.[0];

    if (!name) {
      throw new CustomError("Name is required", 400);
    }

    if (!zipFile) {
      throw new CustomError("ZIP file is required", 400);
    }
    
    // Check file size (additional validation)
    const maxFileSize = 500 * 1024 * 1024; // 500MB
    if (zipFile.size > maxFileSize) {
      throw new CustomError(`ZIP file too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`, 413);
    }

    if (!req.user?.id) {
      throw new CustomError("User authentication required", 401);
    }

    // Create directory structure
    const themeDirs = createCustomThemeDirectory(name);

    let html = "";
    let css = "";

    try {
      // Move zip file to zipped directory
      const zipDestPath = path.join(themeDirs.zippedDir, zipFile.originalname || `${name}.zip`);
      fs.renameSync(zipFile.path, zipDestPath);

      // Extract ZIP file to unzippedTheme directory
      await extract(zipDestPath, { dir: themeDirs.unzippedThemeDir });
      console.log("ZIP extraction complete to:", themeDirs.unzippedThemeDir);

      // Normalize extraction: if a single top-level folder exists, move its contents up
      const items = fs.readdirSync(themeDirs.unzippedThemeDir);
      if (items.length === 1) {
        const onlyItemPath = path.join(themeDirs.unzippedThemeDir, items[0]);
        const stat = fs.statSync(onlyItemPath);
        if (stat.isDirectory()) {
          const moveUp = (src: string, dest: string) => {
            const entries = fs.readdirSync(src);
            entries.forEach((entry) => {
              const srcPath = path.join(src, entry);
              const destPath = path.join(dest, entry);
              const s = fs.statSync(srcPath);
              if (s.isDirectory()) {
                if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
                moveUp(srcPath, destPath);
              } else {
                fs.renameSync(srcPath, destPath);
              }
            });
          };
          moveUp(onlyItemPath, themeDirs.unzippedThemeDir);
          fs.rmSync(onlyItemPath, { recursive: true, force: true });
          console.log("Normalized extracted structure by removing top-level wrapper folder");
        }
      }

      // HTML and CSS are stored on disk, not in MongoDB to avoid 16MB document limit
      // Files are already extracted to themeDirs.unzippedThemeDir
      // We'll read them from disk when needed (in getCustomTheme)
    } catch (extractError: any) {
      // Clean up if extraction fails
      if (fs.existsSync(themeDirs.themeDir)) {
        fs.rmSync(themeDirs.themeDir, { recursive: true, force: true });
      }
      throw new CustomError(`ZIP extraction failed: ${extractError.message}`, 500);
    }

    // Save thumbnail if provided
    let thumbnailData: any = null;
    if (thumbnailFile) {
      const thumbnailExt = path.extname(thumbnailFile.originalname || '.png');
      const thumbnailFilename = `thumbnail${thumbnailExt}`;
      const thumbnailDestPath = path.join(themeDirs.thumbnailDir, thumbnailFilename);
      fs.renameSync(thumbnailFile.path, thumbnailDestPath);
      
      thumbnailData = {
        filename: thumbnailFilename,
        originalName: thumbnailFile.originalname,
        path: thumbnailDestPath,
        size: thumbnailFile.size,
        uploadDate: new Date(),
      };
    }

    // Create theme in database (without HTML/CSS to avoid MongoDB 16MB limit)
    // HTML/CSS are stored on disk and will be read from files when needed
    const customTheme = await CustomTheme.create({
      name,
      status,
      // html and css are not stored in DB - they're on disk
      themePath: themeDirs.themeDirName,
      directories: {
        theme: themeDirs.themeDir,
        thumbnail: themeDirs.thumbnailDir,
        unzippedTheme: themeDirs.unzippedThemeDir,
      },
      thumbnail: thumbnailData,
      createdBy: new Types.ObjectId(req.user.id),
    });

    const themeResponse = await CustomTheme.findById(customTheme._id)
      .populate("createdBy", "name email")
      .select("-directories -html -css");

    logActivity(req, {
      action: "custom_theme_upload",
      entityType: "custom_theme",
      entityId: customTheme._id.toString(),
      entityName: name,
      summary: `Uploaded custom theme "${name}"`,
      details: { themeId: customTheme._id.toString(), name, themePath: themeDirs.themeDirName },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: themeResponse,
      message: "Custom theme created successfully",
    });
  }
);

// Get all custom themes for the authenticated user
export const getCustomThemes = asyncErrorHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new CustomError("User authentication required", 401);
    }

    const customThemes = await CustomTheme.find({
      createdBy: new Types.ObjectId(req.user.id),
    })
      .populate("createdBy", "name email")
      .select("-directories -html -css")
      .sort({ createdAt: -1 });

    // Add thumbnail URLs to themes
    const themesWithThumbnails = customThemes.map((theme: any) => {
      const themeObj = theme.toObject();
      if (theme.thumbnail?.filename) {
        themeObj.thumbnailUrl = `${req.protocol}://${req.get("host")}/uploads/custom themes/${theme.themePath}/thumbnail/${theme.thumbnail.filename}`;
      }
      return themeObj;
    });

    res.status(200).json({
      success: true,
      data: themesWithThumbnails,
      count: themesWithThumbnails.length,
    });
  }
);

// Get single custom theme
export const getCustomTheme = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid theme ID format. Please use a valid theme ID.", 400);
    }

    if (!req.user?.id) {
      throw new CustomError("User authentication required", 401);
    }

    let customTheme;
    try {
      customTheme = await CustomTheme.findOne({
        _id: new Types.ObjectId(id),
        createdBy: new Types.ObjectId(req.user.id),
      }).populate("createdBy", "name email");
    } catch (error: any) {
      throw new CustomError("Invalid theme ID", 400);
    }

    if (!customTheme) {
      throw new CustomError("Custom theme not found or you don't have permission to access it", 404);
    }

    // Read HTML and CSS from files on disk (not from MongoDB to avoid 16MB limit)
    const themeObj = customTheme.toObject();
    const htmlPath = path.join(customTheme.directories.unzippedTheme, "index.html");
    const cssPath = path.join(customTheme.directories.unzippedTheme, "style.css");

    try {
      if (fs.existsSync(htmlPath)) {
        themeObj.html = fs.readFileSync(htmlPath, "utf-8");
      } else {
        themeObj.html = customTheme.html || "";
      }

      if (fs.existsSync(cssPath)) {
        themeObj.css = fs.readFileSync(cssPath, "utf-8");
      } else {
        themeObj.css = customTheme.css || "";
      }
    } catch (fileError: any) {
      console.error("Error reading theme files:", fileError);
      // Fallback to DB values if files don't exist (for backward compatibility)
      themeObj.html = customTheme.html || "";
      themeObj.css = customTheme.css || "";
    }

    res.status(200).json({
      success: true,
      data: themeObj,
    });
  }
);

// Update custom theme
export const updateCustomTheme = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // Check for multer errors (file too large, etc.)
    if ((req as any).fileValidationError) {
      throw new CustomError((req as any).fileValidationError, 413);
    }
    
    const { id } = req.params;
    const { name, status: statusParam } = req.body;
    const status = statusParam === 'published' ? 'published' : undefined;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const zipFile = files?.zipFile?.[0];
    const thumbnailFile = files?.thumbnail?.[0];
    
    // Check file size if zip file is provided
    if (zipFile) {
      const maxFileSize = 500 * 1024 * 1024; // 500MB
      if (zipFile.size > maxFileSize) {
        throw new CustomError(`ZIP file too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`, 413);
      }
    }

    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new CustomError(`Theme ID is required. Received: ${JSON.stringify(id)}`, 400);
    }

    const trimmedId = id.trim();
    if (!Types.ObjectId.isValid(trimmedId)) {
      throw new CustomError(`Invalid theme ID format: "${trimmedId}". Expected a valid MongoDB ObjectId (24 hex characters).`, 400);
    }

    if (!req.user?.id) {
      throw new CustomError("User authentication required", 401);
    }

    let customTheme;
    try {
      customTheme = await CustomTheme.findOne({
        _id: new Types.ObjectId(trimmedId),
        createdBy: new Types.ObjectId(req.user.id),
      });
    } catch (error: any) {
      throw new CustomError(`Failed to find theme with ID: ${trimmedId}. ${error.message}`, 400);
    }

    if (!customTheme) {
      throw new CustomError("Custom theme not found", 404);
    }

    // #region agent log
    fetch('http://127.0.0.1:7524/ingest/69f9ae5f-958d-4035-a412-e98057382aad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '025aee',
      },
      body: JSON.stringify({
        sessionId: '025aee',
        runId: 'initial',
        hypothesisId: 'H1',
        location: 'custom-theme.controller.ts:updateCustomTheme:before-mutate',
        message: 'updateCustomTheme loaded theme before mutations',
        data: {
          id: customTheme._id?.toString?.(),
          status: customTheme.status,
          thumbnail: customTheme.thumbnail,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    // Update name if provided
    if (name) {
      customTheme.name = name;
    }
    // Update status if provided
    if (status) {
      customTheme.status = status;
    }

    // If zip file is provided, extract and update HTML/CSS
    if (zipFile) {
      try {
        // Get zipped directory path
        const zippedDir = path.join(customTheme.directories.theme, "zipped");
        if (!fs.existsSync(zippedDir)) {
          fs.mkdirSync(zippedDir, { recursive: true });
        }

        // Move zip file to zipped directory
        const zipDestPath = path.join(zippedDir, zipFile.originalname || `${customTheme.name}.zip`);
        fs.renameSync(zipFile.path, zipDestPath);

        // Clear existing unzippedTheme directory
        if (fs.existsSync(customTheme.directories.unzippedTheme)) {
          fs.rmSync(customTheme.directories.unzippedTheme, { recursive: true, force: true });
        }
        fs.mkdirSync(customTheme.directories.unzippedTheme, { recursive: true });

        // Extract ZIP file to unzippedTheme directory
        await extract(zipDestPath, { dir: customTheme.directories.unzippedTheme });
        console.log("ZIP extraction complete to:", customTheme.directories.unzippedTheme);

        // Normalize extraction: if a single top-level folder exists, move its contents up
        const items = fs.readdirSync(customTheme.directories.unzippedTheme);
        if (items.length === 1) {
          const onlyItemPath = path.join(customTheme.directories.unzippedTheme, items[0]);
          const stat = fs.statSync(onlyItemPath);
          if (stat.isDirectory()) {
            const moveUp = (src: string, dest: string) => {
              const entries = fs.readdirSync(src);
              entries.forEach((entry) => {
                const srcPath = path.join(src, entry);
                const destPath = path.join(dest, entry);
                const s = fs.statSync(srcPath);
                if (s.isDirectory()) {
                  if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
                  moveUp(srcPath, destPath);
                } else {
                  fs.renameSync(srcPath, destPath);
                }
              });
            };
            moveUp(onlyItemPath, customTheme.directories.unzippedTheme);
            fs.rmSync(onlyItemPath, { recursive: true, force: true });
            console.log("Normalized extracted structure by removing top-level wrapper folder");
          }
        }

        // HTML and CSS are stored on disk, not in MongoDB to avoid 16MB document limit
        // Files are already extracted to customTheme.directories.unzippedTheme
        // We'll read them from disk when needed (in getCustomTheme)
      } catch (extractError: any) {
        throw new CustomError(`ZIP extraction failed: ${extractError.message}`, 500);
      }
    }

    // Update thumbnail if provided
    if (thumbnailFile) {
      const thumbnailExt = path.extname(thumbnailFile.originalname || '.png');
      const thumbnailFilename = `thumbnail${thumbnailExt}`;
      const thumbnailDestPath = path.join(customTheme.directories.thumbnail, thumbnailFilename);
      
      // Remove old thumbnail if exists
      if (customTheme.thumbnail?.filename) {
        const oldThumbnailPath = path.join(customTheme.directories.thumbnail, customTheme.thumbnail.filename);
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
      
      // Move new thumbnail
      fs.renameSync(thumbnailFile.path, thumbnailDestPath);
      
      customTheme.thumbnail = {
        filename: thumbnailFilename,
        originalName: thumbnailFile.originalname,
        path: thumbnailDestPath,
        size: thumbnailFile.size,
        uploadDate: new Date(),
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7524/ingest/69f9ae5f-958d-4035-a412-e98057382aad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '025aee',
      },
      body: JSON.stringify({
        sessionId: '025aee',
        runId: 'initial',
        hypothesisId: 'H2',
        location: 'custom-theme.controller.ts:updateCustomTheme:before-save',
        message: 'updateCustomTheme theme before save',
        data: {
          id: customTheme._id?.toString?.(),
          status: customTheme.status,
          thumbnail: customTheme.thumbnail,
          hasThumbnailFile: Boolean(thumbnailFile),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    customTheme.updatedAt = new Date();
    await customTheme.save();

    const themeDoc = await CustomTheme.findById(customTheme._id)
      .populate("createdBy", "name email")
      .select("-directories -html -css");

    // Shape response and ensure thumbnailUrl is present (like getCustomThemes)
    const themeResponse: any = themeDoc ? themeDoc.toObject() : null;
    if (themeResponse?.thumbnail?.filename && themeResponse?.themePath) {
      themeResponse.thumbnailUrl = `${req.protocol}://${req.get("host")}/uploads/custom themes/${themeResponse.themePath}/thumbnail/${themeResponse.thumbnail.filename}`;
    }

    // #region agent log
    fetch('http://127.0.0.1:7524/ingest/69f9ae5f-958d-4035-a412-e98057382aad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '025aee',
      },
      body: JSON.stringify({
        sessionId: '025aee',
        runId: 'post-fix',
        hypothesisId: 'H3',
        location: 'custom-theme.controller.ts:updateCustomTheme:after-load-response',
        message: 'updateCustomTheme shaped response from DB after save',
        data: {
          id: themeResponse?._id?.toString?.(),
          status: themeResponse?.status,
          thumbnail: themeResponse?.thumbnail,
          thumbnailUrl: themeResponse?.thumbnailUrl,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    res.status(200).json({
      success: true,
      data: themeResponse,
      message: "Custom theme updated successfully",
    });
  }
);

// Delete custom theme
// Install custom theme to a store (similar to installTheme for normal themes)
export const installCustomTheme = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { customThemeId, userId, storeId } = req.body as { 
      customThemeId: string; 
      userId: string; 
      storeId?: string;
    };

    if (!userId) {
      throw new CustomError("User ID is required", 400);
    }
    
    if (!customThemeId) {
      throw new CustomError("Custom theme ID is required", 400);
    }

    console.log('🔍 Installing custom theme:', { customThemeId, userId, storeId });

    // Validate IDs
    if (!Types.ObjectId.isValid(customThemeId)) {
      throw new CustomError("Invalid custom theme ID format", 400);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID format", 400);
    }

    const customThemeObjectId = new Types.ObjectId(customThemeId);
    const userObjectId = new Types.ObjectId(userId);

    // Load custom theme
    const customTheme = await CustomTheme.findById(customThemeObjectId);
    if (!customTheme) {
      throw new CustomError("Custom theme not found", 404);
    }

    // Check if user owns this theme
    if (customTheme.createdBy.toString() !== req.user?.id) {
      throw new CustomError("You don't have permission to install this theme", 403);
    }

    // Create store-specific theme directory
    // Use "custom-{customThemeId}" as the theme ID to distinguish from normal themes
    const storeIdToUse = storeId || userId;
    const themeIdForStore = `custom-${customThemeId}`;
    const storeThemeDir = path.join(
      process.cwd(), 
      'uploads', 
      'stores', 
      storeIdToUse, 
      'themes', 
      themeIdForStore
    );
    const unzippedThemeDir = path.join(storeThemeDir, 'unzippedTheme');
    const sourceThemeDir = customTheme.directories.unzippedTheme;

    console.log('📁 Source custom theme directory:', sourceThemeDir);
    console.log('📁 Store theme directory:', storeThemeDir);

    try {
      // Create store theme directory if it doesn't exist
      if (!fs.existsSync(storeThemeDir)) {
        fs.mkdirSync(storeThemeDir, { recursive: true });
        console.log('✅ Created store theme directory');
      }

      // Create unzippedTheme subdirectory
      if (!fs.existsSync(unzippedThemeDir)) {
        fs.mkdirSync(unzippedThemeDir, { recursive: true });
      }

      // Check if files already exist (preserve customizations)
      const hasExistingFiles = fs.existsSync(unzippedThemeDir) && 
                               fs.readdirSync(unzippedThemeDir).filter(f => f !== '.DS_Store').length > 0;

      // Copy theme files to store directory (only if no existing files)
      if (fs.existsSync(sourceThemeDir) && !hasExistingFiles) {
        const copyRecursive = (src: string, dest: string) => {
          const stats = fs.statSync(src);
          if (stats.isDirectory()) {
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true });
            }
            const files = fs.readdirSync(src);
            files.forEach(file => {
              copyRecursive(path.join(src, file), path.join(dest, file));
            });
          } else {
            fs.copyFileSync(src, dest);
          }
        };

        copyRecursive(sourceThemeDir, unzippedThemeDir);
        console.log('✅ Custom theme files copied to store directory');
      } else if (hasExistingFiles) {
        console.log('📁 Existing theme files found - preserving user edits');
      }

      await Store.findByIdAndUpdate(storeIdToUse, { $set: { appliedTheme: customThemeObjectId } });

      res.status(200).json({
        success: true,
        message: 'Custom theme installed successfully',
        data: {
          customThemeId: customTheme._id,
          themeId: themeIdForStore, // Special format: "custom-{customThemeId}"
          name: customTheme.name,
          storePath: storeThemeDir,
        },
      });
    } catch (error: any) {
      console.error('❌ Error installing custom theme:', error);
      throw new CustomError(
        `Failed to install custom theme: ${error?.message || 'Unknown error'}`,
        500
      );
    }
  }
);

// Uninstall custom theme from a store (removes installation directory)
export const uninstallCustomTheme = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { customThemeId, userId, storeId } = req.body as { 
      customThemeId: string; 
      userId: string; 
      storeId?: string;
    };

    if (!userId) {
      throw new CustomError("User ID is required", 400);
    }
    
    if (!customThemeId) {
      throw new CustomError("Custom theme ID is required", 400);
    }

    console.log('🔍 Uninstalling custom theme:', { customThemeId, userId, storeId });

    // Validate IDs
    if (!Types.ObjectId.isValid(customThemeId)) {
      throw new CustomError("Invalid custom theme ID format", 400);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid user ID format", 400);
    }

    const customThemeObjectId = new Types.ObjectId(customThemeId);
    const userObjectId = new Types.ObjectId(userId);

    // Load custom theme to verify it exists
    const customTheme = await CustomTheme.findById(customThemeObjectId);
    if (!customTheme) {
      throw new CustomError("Custom theme not found", 404);
    }

    // Check if user owns this theme
    if (customTheme.createdBy.toString() !== req.user?.id) {
      throw new CustomError("You don't have permission to uninstall this theme", 403);
    }

    // Get the installation directory path
    const storeIdToUse = storeId || userId;
    const themeIdForStore = `custom-${customThemeId}`;
    const storeThemeDir = path.join(
      process.cwd(), 
      'uploads', 
      'stores', 
      storeIdToUse, 
      'themes', 
      themeIdForStore
    );

    console.log('📁 Custom theme installation directory:', storeThemeDir);

    try {
      // Delete the installation directory if it exists
      if (fs.existsSync(storeThemeDir)) {
        fs.rmSync(storeThemeDir, { recursive: true, force: true });
        console.log('✅ Custom theme installation directory deleted');
      } else {
        console.log('⚠️ Custom theme installation directory not found (may have been already deleted)');
      }

      await Store.findOneAndUpdate(
        { _id: storeIdToUse, appliedTheme: customThemeObjectId },
        { $set: { appliedTheme: null } }
      );

      res.status(200).json({
        success: true,
        message: 'Custom theme uninstalled successfully',
      });
    } catch (error: any) {
      console.error('❌ Error uninstalling custom theme:', error);
      throw new CustomError(
        `Failed to uninstall custom theme: ${error?.message || 'Unknown error'}`,
        500
      );
    }
  }
);

export const deleteCustomTheme = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid theme ID format", 400);
    }

    if (!req.user?.id) {
      throw new CustomError("User authentication required", 401);
    }

    let customTheme;
    try {
      customTheme = await CustomTheme.findOne({
        _id: new Types.ObjectId(id),
        createdBy: new Types.ObjectId(req.user.id),
      });
    } catch (error: any) {
      throw new CustomError("Invalid theme ID", 400);
    }

    if (!customTheme) {
      throw new CustomError("Custom theme not found", 404);
    }

    // Delete directory and all files
    if (fs.existsSync(customTheme.directories.theme)) {
      fs.rmSync(customTheme.directories.theme, { recursive: true, force: true });
    }

    // Delete from database
    await CustomTheme.findByIdAndDelete(new Types.ObjectId(id));

    res.status(200).json({
      success: true,
      message: "Custom theme deleted successfully",
    });
  }
);

// Serve custom theme files
export const serveCustomThemeFiles = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { themeId } = req.params;
    
    // Extract file path from req.params[0] (wildcard parameter from /* route pattern)
    // Similar to how serveInstalledThemeFiles works
    let filePath = (req.params as any)[0] || '';
    
    if (!filePath) {
      // If params[0] is not available, try to extract from URL
      const urlMatch = req.url.match(/\/files\/(.+)$/);
      if (urlMatch && urlMatch[1]) {
        filePath = urlMatch[1];
      } else if (req.url.endsWith('/files') || req.url.endsWith('/files/')) {
        // If URL ends with /files, default to index.html
        filePath = 'index.html';
      } else {
        filePath = 'index.html';
      }
    }
    
    // Decode URL-encoded paths
    if (filePath) {
      try {
        filePath = decodeURIComponent(filePath);
      } catch (e) {
        // If decoding fails, use original path
        console.warn('Failed to decode file path:', filePath);
      }
    }
    
    console.log('📁 Serving custom theme file:', { 
      themeId, 
      filePath, 
      url: req.url,
      originalUrl: req.originalUrl,
      params: req.params,
      params0: (req.params as any)[0]
    });

    if (!Types.ObjectId.isValid(themeId)) {
      throw new CustomError("Invalid theme ID format", 400);
    }

    let customTheme;
    try {
      customTheme = await CustomTheme.findById(new Types.ObjectId(themeId));
    } catch (error: any) {
      throw new CustomError("Invalid theme ID", 400);
    }

    if (!customTheme) {
      throw new CustomError("Custom theme not found", 404);
    }

    // If user is authenticated, verify they own the theme (optional check)
    // If not authenticated, allow access for preview purposes
    if (req.user?.id) {
      const userId = new Types.ObjectId(req.user.id);
      const themeOwnerId = new Types.ObjectId(customTheme.createdBy);
      if (!userId.equals(themeOwnerId)) {
        // Allow preview even if not owner (for sharing purposes)
        // But log it for security
        console.log(`User ${req.user.id} accessing custom theme ${themeId} (not owner)`);
      }
    }

    const fullPath = path.join(
      customTheme.directories.unzippedTheme,
      filePath || "index.html"
    );

    // Security check: ensure the file is within the theme directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedThemeDir = path.resolve(
      customTheme.directories.unzippedTheme
    );

    if (!resolvedPath.startsWith(resolvedThemeDir)) {
      throw new CustomError("Invalid file path", 403);
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new CustomError("File not found", 404);
    }

    // Set appropriate headers for iframe embedding (for preview)
    const ext = path.extname(resolvedPath).toLowerCase();
    if (ext === '.html') {
      // Read and process HTML file
      let htmlContent = fs.readFileSync(resolvedPath, 'utf8');
      
      // Update relative paths to work with our file serving endpoint
      const baseUrl = `${req.protocol}://${req.get('host')}/api/custom-themes/${themeId}/files`;
      
      // Update src attributes (images, scripts, etc.)
      htmlContent = htmlContent.replace(/src=["'](?!https?:|data:|mailto:|tel:|javascript:|#|\/\/)([^"']+)["']/gi, (match, srcPath) => {
        // Handle relative paths
        const cleanPath = srcPath.startsWith('/') ? srcPath.substring(1) : srcPath;
        const quote = match[0]; // Preserve original quote style
        return `src=${quote}${baseUrl}/${cleanPath}${quote}`;
      });
      
      // Update href attributes (CSS, links, etc.)
      htmlContent = htmlContent.replace(/href=["'](?!https?:|data:|mailto:|tel:|javascript:|#|\/\/)([^"']+)["']/gi, (match, hrefPath) => {
        // Handle relative paths for CSS and other resources
        const cleanPath = hrefPath.startsWith('/') ? hrefPath.substring(1) : hrefPath;
        const quote = match[0]; // Preserve original quote style
        return `href=${quote}${baseUrl}/${cleanPath}${quote}`;
      });
      
      // Update srcset attributes (responsive images)
      htmlContent = htmlContent.replace(/srcset=["']([^"']+)["']/gi, (match, srcsetValue) => {
        const quote = match[0];
        const updatedSrcset = srcsetValue.split(',').map((entry: string) => {
          const trimmed = entry.trim();
          const parts = trimmed.split(/\s+/);
          const url = parts[0];
          const size = parts.slice(1).join(' ');
          
          // Skip if already absolute URL
          if (/^(https?:|data:|mailto:|tel:|javascript:|#|\/\/)/i.test(url)) {
            return trimmed;
          }
          
          // Make relative path absolute
          const cleanPath = url.startsWith('/') ? url.substring(1) : url;
          return size ? `${baseUrl}/${cleanPath} ${size}` : `${baseUrl}/${cleanPath}`;
        }).join(', ');
        
        return `srcset=${quote}${updatedSrcset}${quote}`;
      });
      
      // Update background-image URLs in style attributes and CSS
      htmlContent = htmlContent.replace(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/gi, (match, urlPath) => {
        // Skip if already absolute URL
        if (/^(https?:|data:|mailto:|tel:|javascript:|#|\/\/)/i.test(urlPath)) {
          return match;
        }
        const cleanPath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
        return `background-image: url('${baseUrl}/${cleanPath}')`;
      });
      
      // Ensure viewport meta tag exists for proper responsive rendering
      if (!htmlContent.includes('viewport')) {
        htmlContent = htmlContent.replace(
          /<head>/i,
          `<head><meta name="viewport" content="width=device-width, initial-scale=1.0">`
        );
      }
      
      // Ensure charset meta tag exists
      if (!htmlContent.includes('charset')) {
        htmlContent = htmlContent.replace(
          /<head>/i,
          `<head><meta charset="UTF-8">`
        );
      }
      
      // Check if CSS file exists and link it if not already linked
      const cssPath = path.join(customTheme.directories.unzippedTheme, 'style.css');
      const cssExists = fs.existsSync(cssPath);
      const hasCssLink = htmlContent.includes('style.css') || htmlContent.includes('<style>');
      
      // Inject CSS link if CSS file exists but isn't linked
      if (cssExists && !hasCssLink) {
        const cssLink = `<link rel="stylesheet" href="${baseUrl}/style.css">`;
        if (htmlContent.includes('</head>')) {
          htmlContent = htmlContent.replace('</head>', `${cssLink}</head>`);
        } else if (htmlContent.includes('<head>')) {
          htmlContent = htmlContent.replace('<head>', `<head>${cssLink}`);
        } else {
          htmlContent = `<head>${cssLink}</head>${htmlContent}`;
        }
      }
      
      // Inject base styles to ensure consistent rendering (box-sizing, etc.)
      const baseStyles = `
        <style>
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html {
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }
          body {
            margin: 0;
            padding: 0;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
          }
        </style>
      `;
      
      // Inject base styles before closing head tag or after opening head
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${baseStyles}</head>`);
      } else if (htmlContent.includes('<head>')) {
        htmlContent = htmlContent.replace('<head>', `<head>${baseStyles}`);
      } else {
        // No head tag, add one
        htmlContent = `<head>${baseStyles}</head>${htmlContent}`;
      }
      
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } else {
      // Set appropriate content type for other files
      const contentTypes: { [key: string]: string } = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.sendFile(resolvedPath);
    }
  }
);

