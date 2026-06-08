"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThemeStats = exports.putStoreThemeConfig = exports.getStoreThemeConfig = exports.getThemeEditorPack = exports.saveUserFileEdit = exports.serveThemePreviewFiles = exports.readThemeFile = exports.listThemeFiles = exports.getThemePreview = exports.uninstallTheme = exports.getInstalledThemes = exports.serveInstalledThemeFiles = exports.applyThemeToStore = exports.installTheme = exports.getThemesStatic = exports.getThumbnail = exports.getThemeStructure = exports.downloadTheme = exports.deleteTheme = exports.updateTheme = exports.createThemeFromS3 = exports.createTheme = exports.getTheme = exports.getAllThemesPublic = exports.getThemes = void 0;
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = require("mongoose");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const installed_themes_model_1 = require("../models/installed-themes.model");
const theme_model_1 = require("../models/theme.model");
const custom_theme_model_1 = require("../models/custom-theme.model");
const store_model_1 = require("../models/store/store.model");
const edit_verification_otp_model_1 = require("../models/edit-verification-otp.model");
const role_model_1 = require("../models/role.model");
const user_model_1 = require("../models/user.model");
const error_utils_1 = require("../utils/error.utils");
const activity_log_utils_1 = require("../utils/activity-log.utils");
const installed_themes_query_util_1 = require("../utils/installed-themes-query.util");
const theme_s3_ingest_1 = require("../utils/theme-s3-ingest");
const theme_zip_from_s3_util_1 = require("../utils/theme-zip-from-s3.util");
const installed_themes_list_util_1 = require("../utils/installed-themes-list.util");
const storefront_liquid_util_1 = require("../utils/storefront-liquid.util");
const theme_zip_from_s3_util_2 = require("../utils/theme-zip-from-s3.util");
const store_theme_config_service_1 = require("../services/store-theme-config.service");
const os_1 = require("os");
const archiver_1 = __importDefault(require("archiver"));
const THEME_FILE_CONTENT_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
};
function sendThemeStaticFile(res, diskPath) {
    const ext = path_1.default.extname(diskPath).toLowerCase();
    res.setHeader("Content-Type", THEME_FILE_CONTENT_TYPES[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(diskPath);
}
function assertPathWithinRoot(filePath, rootDir) {
    const normalized = path_1.default.normalize(filePath);
    const root = path_1.default.normalize(rootDir);
    if (!normalized.startsWith(root)) {
        throw new error_utils_1.CustomError("Access denied", 403);
    }
    return normalized;
}
function makeThemePathSlug(themeName) {
    const base = themeName
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "theme";
    return `${base}-${(0, uuid_1.v4)().slice(0, 8)}`;
}
function resolveThemeThumbnailUrl(_req, theme) {
    return theme?.s3Assets?.thumbnail?.url || null;
}
function resolveThemeZipUrl(_req, theme) {
    return theme?.s3Assets?.zip?.url || null;
}
/** Normalize a theme document for list/detail APIs (S3-first catalog shape). */
function withResolvedS3Urls(s3) {
    const out = { ...s3 };
    for (const field of ["reactThemeJs", "reactThemeCss", "reactThemeSchema", "reactThemeDefaultConfig", "reactThemeManifest"]) {
        const part = out[field];
        if (part?.key && !part.url) {
            out[field] = { ...part, url: (0, theme_s3_ingest_1.publicObjectUrlForKey)(part.key) };
        }
    }
    return out;
}
function formatThemeForClient(theme) {
    const obj = theme?.toObject ? theme.toObject() : { ...theme };
    const s3 = withResolvedS3Urls(obj.s3Assets ?? {});
    const hasFolder = Boolean(s3.contentRoot?.prefix);
    const hasZip = Boolean(s3.zip?.key);
    return {
        _id: obj._id,
        name: obj.name,
        description: obj.description,
        category: obj.category,
        plan: obj.plan,
        price: obj.price,
        version: obj.version,
        tags: obj.tags,
        themePath: obj.themePath,
        isActive: obj.isActive,
        downloads: obj.downloads,
        installationCount: obj.installationCount,
        rating: obj.rating,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
        uploadBy: obj.uploadBy,
        s3Assets: s3,
        thumbnailUrl: s3.thumbnail?.url ?? null,
        zipUrl: s3.zip?.url ?? null,
        packageType: hasFolder ? "folder" : hasZip ? "zip" : null,
        contentFileCount: hasFolder ? s3.contentRoot?.fileCount ?? 0 : undefined,
        hasRemoteTheme: Boolean(s3.reactThemeJs?.key || s3.reactThemeCss?.key),
        previewUrl: s3.zip?.url ?? null,
    };
}
exports.getThemes = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { search, category, plan, page = "1", limit = "10", sort = "createdAt", order = "desc", } = req.query;
    // Build filter object
    const filter = { isActive: true };
    if (search) {
        filter.$text = { $search: search };
    }
    if (category && category !== "all") {
        filter.category = category;
    }
    if (plan && plan !== "all") {
        filter.plan = plan;
    }
    // Sort configuration
    const sortConfig = {};
    sortConfig[sort] = order === "desc" ? -1 : 1;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const themes = await theme_model_1.Theme.find(filter)
        .populate("uploadBy", "name email")
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .sort(sortConfig)
        .lean();
    const count = await theme_model_1.Theme.countDocuments(filter);
    const data = themes.map((t) => formatThemeForClient(t));
    res.status(200).json({
        success: true,
        data,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        total: count,
    });
});
// Public paginated list including thumbnailUrl and zipUrl
exports.getAllThemesPublic = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { search, category, plan, page = "1", limit = "10", sort = "createdAt", order = "desc", } = req.query;
    const filter = { isActive: true };
    if (search)
        filter.$text = { $search: search };
    if (category && category !== "all")
        filter.category = category;
    if (plan && plan !== "all")
        filter.plan = plan;
    const sortConfig = {};
    sortConfig[sort] = order === "desc" ? -1 : 1;
    const docs = await theme_model_1.Theme.find(filter)
        .populate("uploadBy", "name email")
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .sort(sortConfig)
        .lean();
    const count = await theme_model_1.Theme.countDocuments(filter);
    const mapped = docs.map((t) => formatThemeForClient(t));
    res.status(200).json({
        success: true,
        data: mapped,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        total: count,
    });
});
exports.getTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const theme = await theme_model_1.Theme.findById(id).populate("uploadBy", "name email");
    if (!theme) {
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    res.status(200).json({
        success: true,
        data: formatThemeForClient(theme),
    });
});
exports.createTheme = (0, error_utils_1.asyncErrorHandler)(async (_req, res) => {
    res.status(410).json({
        success: false,
        message: "Multipart theme upload is no longer supported. Upload assets with presigned PUT to S3, then POST /api/themes/from-s3 with s3 keys.",
    });
});
/** Create catalog theme: copy browser-staged S3 objects into themes/catalog/{id}/… (no local uploads/). */
exports.createThemeFromS3 = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("Unauthorized", 401);
    }
    const { name, description, category, plan, price, version, tags, s3SessionId, s3, } = req.body;
    if (!name || !category || !plan) {
        throw new error_utils_1.CustomError("name, category, and plan are required", 400);
    }
    if (!s3SessionId || typeof s3SessionId !== "string") {
        throw new error_utils_1.CustomError("s3SessionId is required (same value used when requesting signed URLs)", 400);
    }
    if (!s3 || typeof s3 !== "object") {
        throw new error_utils_1.CustomError("s3 payload is required", 400);
    }
    const hasZip = typeof s3.zipKey === "string" && s3.zipKey.length > 0;
    const hasFiles = Array.isArray(s3.files) && s3.files.length > 0;
    if (hasZip === hasFiles) {
        throw new error_utils_1.CustomError("Provide exactly one of: s3.zipKey (legacy ZIP) or s3.files (folder upload)", 400);
    }
    const requireEditorConfigKeys = () => {
        const missing = [];
        if (typeof s3.themeSchemaKey !== "string" || !s3.themeSchemaKey.length) {
            missing.push("themeSchemaKey (theme.schema.json)");
        }
        if (typeof s3.themeDefaultConfigKey !== "string" || !s3.themeDefaultConfigKey.length) {
            missing.push("themeDefaultConfigKey (theme.default-config.json)");
        }
        if (typeof s3.themeManifestKey !== "string" || !s3.themeManifestKey.length) {
            missing.push("themeManifestKey (theme.manifest.json)");
        }
        if (missing.length) {
            throw new error_utils_1.CustomError(`Editor theme config is required: ${missing.join(", ")}`, 400);
        }
    };
    if (hasFiles) {
        requireEditorConfigKeys();
    }
    const newId = new mongoose_1.Types.ObjectId();
    const themePath = makeThemePathSlug(name);
    let stagingKeys;
    let s3Assets;
    try {
        if (hasZip) {
            const auxKeys = {
                thumbnailKey: s3.thumbnailKey,
                reactJsKey: s3.reactJsKey,
                reactCssKey: s3.reactCssKey,
                themeSchemaKey: s3.themeSchemaKey,
                themeDefaultConfigKey: s3.themeDefaultConfigKey,
                themeManifestKey: s3.themeManifestKey,
            };
            stagingKeys = (0, theme_s3_ingest_1.assertStagingKeys)({ zipKey: s3.zipKey, ...auxKeys }, userId, s3SessionId);
            s3Assets = await (0, theme_s3_ingest_1.promoteStagingThemeAssetsToCatalog)(newId.toString(), {
                zipKey: s3.zipKey,
                ...auxKeys,
            });
        }
        else {
            const files = s3.files;
            for (const f of files) {
                if (!f.key || typeof f.key !== "string" || !f.relativePath || typeof f.relativePath !== "string") {
                    throw new error_utils_1.CustomError("Each s3.files entry requires key and relativePath", 400);
                }
                const expected = (0, theme_s3_ingest_1.stagingThemeFileKey)(userId, s3SessionId, f.relativePath);
                if (f.key !== expected) {
                    throw new error_utils_1.CustomError("s3.files key does not match relativePath for this session", 400);
                }
            }
            stagingKeys = (0, theme_s3_ingest_1.assertStagingFolderAndAuxiliaryKeys)(files, {
                thumbnailKey: s3.thumbnailKey,
                reactJsKey: s3.reactJsKey,
                reactCssKey: s3.reactCssKey,
                themeSchemaKey: s3.themeSchemaKey,
                themeDefaultConfigKey: s3.themeDefaultConfigKey,
                themeManifestKey: s3.themeManifestKey,
            }, userId, s3SessionId);
            const folderPart = await (0, theme_s3_ingest_1.promoteStagingThemeFolderToCatalog)(newId.toString(), files.map((f) => ({ key: f.key, relativePath: f.relativePath })));
            const aux = await (0, theme_s3_ingest_1.promoteStagingAuxiliaryToCatalog)(newId.toString(), {
                thumbnailKey: s3.thumbnailKey,
                reactJsKey: s3.reactJsKey,
                reactCssKey: s3.reactCssKey,
                themeSchemaKey: s3.themeSchemaKey,
                themeDefaultConfigKey: s3.themeDefaultConfigKey,
                themeManifestKey: s3.themeManifestKey,
            });
            s3Assets = { ...folderPart, ...aux };
        }
    }
    catch (promoteErr) {
        console.error("[createThemeFromS3] promote staging → catalog failed:", promoteErr);
        if (promoteErr instanceof error_utils_1.CustomError)
            throw promoteErr;
        throw new error_utils_1.CustomError(`Could not finalize theme files in S3: ${promoteErr?.message || "unknown error"}`, 500);
    }
    const theme = await theme_model_1.Theme.create({
        _id: newId,
        name,
        description,
        category,
        plan,
        price: price || 0,
        version: version || "1.0.0",
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        themePath,
        s3Assets,
        uploadBy: req.user?.id ? new mongoose_1.Types.ObjectId(req.user.id) : undefined,
    });
    try {
        await (0, theme_s3_ingest_1.deleteS3Keys)(stagingKeys);
    }
    catch (delErr) {
        console.warn("[createThemeFromS3] Failed to delete staging S3 keys:", delErr);
    }
    const themeResponse = await theme_model_1.Theme.findById(theme._id).populate("uploadBy", "name email");
    (0, activity_log_utils_1.logActivity)(req, {
        action: "theme_upload",
        entityType: "theme",
        entityId: theme._id.toString(),
        entityName: name,
        summary: `Uploaded theme "${name}" (${category}, ${plan}) via S3`,
        details: { themeId: theme._id.toString(), name, category, plan, version: version || "1.0.0", source: "s3" },
    }).catch(() => { });
    res.status(201).json({
        success: true,
        data: themeResponse ? formatThemeForClient(themeResponse) : null,
        message: "Theme created from S3 successfully",
    });
});
exports.updateTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, description, category, plan, price, version, tags, isActive, } = req.body;
    const updateData = {
        name,
        description,
        category,
        plan,
        price,
        version,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : undefined,
        isActive,
        updatedAt: new Date(),
    };
    const theme = await theme_model_1.Theme.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate("uploadBy", "name email");
    if (!theme) {
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    (0, activity_log_utils_1.logActivity)(req, {
        action: "theme_update",
        entityType: "theme",
        entityId: id,
        entityName: theme.name,
        summary: `Updated theme "${theme.name}"`,
        details: { themeId: id, updates: { name, description, category, plan, price, version, tags, isActive } },
    }).catch(() => { });
    res.status(200).json({
        success: true,
        data: theme,
    });
});
exports.deleteTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { editOtp } = req.body || {};
    // OTP required for all users (including super-admin) - sent to super-admin email
    const otp = editOtp || req.headers["x-edit-otp"];
    if (!otp || typeof otp !== "string") {
        throw new error_utils_1.CustomError("Edit verification OTP is required. Request OTP to be sent to super-admin email.", 403);
    }
    const superAdminRole = await role_model_1.Role.findOne({ name: "super-admin" });
    if (!superAdminRole)
        throw new error_utils_1.CustomError("Super-admin role not found", 500);
    const superAdminUser = await user_model_1.User.findOne({ role: superAdminRole._id });
    if (!superAdminUser)
        throw new error_utils_1.CustomError("No super-admin found", 500);
    const superAdminEmail = superAdminUser.email;
    const otpRecord = await edit_verification_otp_model_1.EditVerificationOtp.findOne({ email: superAdminEmail });
    if (!otpRecord)
        throw new error_utils_1.CustomError("OTP expired or not found. Please request a new code.", 400);
    if (otpRecord.expiresAt < new Date()) {
        await edit_verification_otp_model_1.EditVerificationOtp.deleteMany({ email: superAdminEmail });
        throw new error_utils_1.CustomError("OTP expired. Please request a new code.", 400);
    }
    if (otpRecord.code !== otp.trim()) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new error_utils_1.CustomError("Invalid verification code", 400);
    }
    await edit_verification_otp_model_1.EditVerificationOtp.deleteMany({ email: superAdminEmail });
    console.log('🗑️ Delete theme request received:', {
        themeId: id,
        user: req.user?.name,
        userRole: req.user?.role
    });
    const theme = await theme_model_1.Theme.findById(id);
    if (!theme) {
        console.log('❌ Theme not found:', id);
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    (0, activity_log_utils_1.logActivity)(req, {
        action: "theme_delete",
        entityType: "theme",
        entityId: id,
        entityName: theme.name,
        summary: `Deleted theme "${theme.name}"`,
        details: { themeId: id, themePath: theme.themePath, category: theme.category },
    }).catch(() => { });
    console.log('✅ Theme found:', {
        name: theme.name,
        themePath: theme.themePath,
    });
    // Delete all installed instances of this theme
    const deletedInstances = await installed_themes_model_1.InstalledThemes.deleteMany({ theme: id });
    console.log('🗑️ Deleted installed instances:', deletedInstances.deletedCount);
    try {
        const keys = await (0, theme_s3_ingest_1.collectCatalogAssetKeysAsync)(theme.s3Assets);
        await (0, theme_s3_ingest_1.deleteS3Keys)(keys);
    }
    catch (s3Err) {
        console.warn("[deleteTheme] Failed to delete some catalog S3 objects:", s3Err);
    }
    // Delete the theme from database
    const deletedTheme = await theme_model_1.Theme.findByIdAndDelete(id);
    console.log('✅ Theme deleted from database:', deletedTheme ? 'Success' : 'Failed');
    console.log('🎉 Theme deletion completed successfully');
    res.status(200).json({
        success: true,
        data: {},
        message: "Theme and all associated files deleted successfully",
    });
});
exports.downloadTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const theme = await theme_model_1.Theme.findById(id);
    if (!theme) {
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    if (!theme.isActive) {
        throw new error_utils_1.CustomError("Theme is not available for download", 400);
    }
    // Check user permissions based on plan
    if (theme.plan === "premium" && req.user?.role !== "super-admin") {
        throw new error_utils_1.CustomError("Premium theme requires appropriate subscription", 403);
    }
    const zipUrl = theme.s3Assets?.zip?.url;
    const folderPrefix = theme.s3Assets?.contentRoot?.prefix;
    if (!zipUrl && !folderPrefix) {
        throw new error_utils_1.CustomError("Theme download is not available", 404);
    }
    if (theme.downloads) {
        theme.downloads += 1;
    }
    else {
        theme.downloads = 1;
    }
    await theme.save();
    if (zipUrl) {
        res.redirect(302, zipUrl);
        return;
    }
    const tmpBase = path_1.default.join((0, os_1.tmpdir)(), `ziplofy-theme-dl-${id}-${Date.now()}`);
    fs_1.default.mkdirSync(tmpBase, { recursive: true });
    const folderDir = path_1.default.join(tmpBase, "files");
    try {
        await (0, theme_zip_from_s3_util_1.downloadS3PrefixToLocalDir)(folderPrefix, folderDir);
        const safeName = `${theme.themePath || theme.name || "theme"}.zip`.replace(/[^\w.\-]+/g, "_");
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        archive.on("error", (err) => {
            console.error("[downloadTheme] archiver:", err);
        });
        archive.on("end", () => {
            try {
                fs_1.default.rmSync(tmpBase, { recursive: true, force: true });
            }
            catch {
                /* ignore */
            }
        });
        archive.pipe(res);
        archive.directory(folderDir, false);
        await archive.finalize();
    }
    catch (e) {
        try {
            fs_1.default.rmSync(tmpBase, { recursive: true, force: true });
        }
        catch {
            /* ignore */
        }
        throw e;
    }
});
exports.getThemeStructure = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const theme = await theme_model_1.Theme.findById(id);
    if (!theme) {
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    const extractPath = await (0, theme_zip_from_s3_util_2.ensureCatalogThemeCodeDir)(theme);
    // Recursive function to get directory structure
    const getStructure = (dirPath, relativePath = "") => {
        const items = fs_1.default.readdirSync(dirPath);
        const structure = [];
        items.forEach((item) => {
            const fullPath = path_1.default.join(dirPath, item);
            const relPath = path_1.default.join(relativePath, item);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                structure.push({
                    name: item,
                    type: "directory",
                    path: relPath,
                    children: getStructure(fullPath, relPath),
                });
            }
            else {
                structure.push({
                    name: item,
                    type: "file",
                    path: relPath,
                    size: stat.size,
                    modified: stat.mtime,
                });
            }
        });
        return structure;
    };
    const fileStructure = getStructure(extractPath);
    res.status(200).json({
        success: true,
        data: {
            theme: theme.name,
            structure: fileStructure,
        },
    });
});
exports.getThumbnail = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const theme = await theme_model_1.Theme.findById(id);
    if (!theme) {
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    const url = theme.s3Assets?.thumbnail?.url;
    if (!url) {
        throw new error_utils_1.CustomError("Thumbnail not found", 404);
    }
    res.redirect(302, url);
});
exports.getThemesStatic = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const themes = await theme_model_1.Theme.find();
    const updatedThemes = themes.map((theme) => {
        const thumbnailUrl = resolveThemeThumbnailUrl(req, theme);
        return {
            _id: theme._id,
            name: theme.name,
            description: theme.description,
            category: theme.category,
            thumbnailUrl,
        };
    });
    res.status(200).json({
        success: true,
        data: updatedThemes,
    });
});
/** Record which theme is installed for a store (store + theme only; no file copy). */
exports.installTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId, storeId } = req.body;
    if (!themeId)
        throw new error_utils_1.CustomError("Theme ID is required", 400);
    if (!storeId)
        throw new error_utils_1.CustomError("Store ID is required", 400);
    const themeObjectId = new mongoose_1.Types.ObjectId(themeId);
    const theme = await theme_model_1.Theme.findById(themeObjectId);
    if (!theme)
        throw new error_utils_1.CustomError("Theme not found", 404);
    const storeRef = (0, installed_themes_query_util_1.canonicalStoreRef)(storeId);
    const installedTheme = await installed_themes_model_1.InstalledThemes.findOneAndUpdate({ store: storeRef, theme: themeObjectId }, {
        $set: {
            store: storeRef,
            theme: themeObjectId,
            uninstalledAt: null,
            installedAt: new Date(),
        },
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const thumbnailUrl = resolveThemeThumbnailUrl(req, theme);
    (0, activity_log_utils_1.logActivity)(req, {
        action: "theme_install",
        entityType: "theme",
        entityId: themeId,
        entityName: theme.name,
        summary: `Installed theme "${theme.name}" for store`,
        details: { themeId, storeId, themeName: theme.name, category: theme.category },
    }).catch(() => { });
    res.status(200).json({
        success: true,
        message: "Theme installed successfully",
        data: {
            _id: theme._id,
            name: theme.name,
            description: theme.description,
            category: theme.category,
            thumbnailUrl,
            packageType: theme.s3Assets?.contentRoot?.prefix ? "folder" : theme.s3Assets?.zip?.key ? "zip" : null,
            installedThemeId: installedTheme._id,
        },
    });
});
exports.applyThemeToStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, themeId } = req.body;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!themeId) {
        throw new error_utils_1.CustomError("Theme ID is required", 400);
    }
    if (!mongoose_1.Types.ObjectId.isValid(themeId)) {
        throw new error_utils_1.CustomError("Invalid theme ID format", 400);
    }
    const store = await store_model_1.Store.findById(storeId).select("_id").lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    const themeObjectId = new mongoose_1.Types.ObjectId(themeId);
    const installedRecord = await installed_themes_model_1.InstalledThemes.findOne({
        $and: [
            { $or: (0, installed_themes_query_util_1.storeAndUserScopeOr)(String(storeId)) },
            { theme: themeObjectId },
            { uninstalledAt: null },
        ],
    })
        .select("_id")
        .lean();
    const customTheme = await custom_theme_model_1.CustomTheme.findById(themeId).select("_id").lean();
    if (!installedRecord && !customTheme) {
        throw new error_utils_1.CustomError("Theme is not installed for this store", 404);
    }
    await store_model_1.Store.findByIdAndUpdate(storeId, { $set: { appliedTheme: themeObjectId } });
    res.status(200).json({
        success: true,
        message: "Theme applied successfully",
        data: { storeId, appliedTheme: themeId },
    });
});
exports.serveInstalledThemeFiles = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, themeId } = req.params;
    const rawPath = req.params[0];
    if (!rawPath)
        throw new error_utils_1.CustomError("File path is required", 400);
    const isCustomTheme = themeId.startsWith("custom-");
    const catalogThemeId = isCustomTheme ? themeId.replace(/^custom-/, "") : themeId;
    let rel = String(rawPath).replace(/^\/+/, "").replace(/\\/g, "/");
    if (rel.startsWith("runtime/"))
        rel = rel.slice("runtime/".length);
    else if (rel.startsWith("unzippedTheme/"))
        rel = rel.slice("unzippedTheme/".length);
    if (isCustomTheme) {
        const storeThemeDir = path_1.default.join(process.cwd(), "uploads", "stores", storeId, "themes", themeId);
        const unzippedDir = path_1.default.join(storeThemeDir, "unzippedTheme");
        let diskPath = path_1.default.join(unzippedDir, rel);
        if (!fs_1.default.existsSync(diskPath))
            diskPath = path_1.default.join(storeThemeDir, rel);
        assertPathWithinRoot(diskPath, storeThemeDir);
        if (!fs_1.default.existsSync(diskPath) || fs_1.default.statSync(diskPath).isDirectory()) {
            const customTheme = await custom_theme_model_1.CustomTheme.findById(catalogThemeId).lean();
            if (!customTheme)
                throw new error_utils_1.CustomError("Custom theme not found", 404);
            diskPath = path_1.default.join(customTheme.directories.unzippedTheme, rel);
        }
        if (!fs_1.default.existsSync(diskPath) || fs_1.default.statSync(diskPath).isDirectory()) {
            throw new error_utils_1.CustomError("File not found", 404);
        }
        return sendThemeStaticFile(res, diskPath);
    }
    const installed = await installed_themes_model_1.InstalledThemes.findOne({
        store: new mongoose_1.Types.ObjectId(storeId),
        theme: new mongoose_1.Types.ObjectId(catalogThemeId),
        uninstalledAt: null,
    }).lean();
    if (!installed)
        throw new error_utils_1.CustomError("Theme is not installed for this store", 404);
    const theme = await theme_model_1.Theme.findById(catalogThemeId).lean();
    if (!theme)
        throw new error_utils_1.CustomError("Theme not found", 404);
    const customizationPath = path_1.default.resolve(path_1.default.join(process.cwd(), "uploads", "stores", storeId, "themes", catalogThemeId, "customizations", rel));
    const customizationRoot = path_1.default.resolve(path_1.default.join(process.cwd(), "uploads", "stores", storeId, "themes", catalogThemeId, "customizations"));
    if (customizationPath.startsWith(customizationRoot) &&
        fs_1.default.existsSync(customizationPath) &&
        fs_1.default.statSync(customizationPath).isFile()) {
        return sendThemeStaticFile(res, customizationPath);
    }
    const s3Assets = theme.s3Assets;
    const publicUrl = (0, storefront_liquid_util_1.catalogPublicUrlForRelativePath)(s3Assets, rel.startsWith("remoteThemeDist/") ? rel.replace(/^remoteThemeDist\//, "") : rel);
    if (!publicUrl)
        throw new error_utils_1.CustomError("File not found", 404);
    return res.redirect(302, publicUrl);
});
exports.getInstalledThemes = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const storeId = (0, installed_themes_list_util_1.resolveInstalledThemesStoreId)(req);
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    const data = await (0, installed_themes_list_util_1.listInstalledThemesForStore)(storeId);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).json(data);
});
exports.uninstallTheme = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { installedThemeId } = req.body;
    if (!installedThemeId) {
        throw new error_utils_1.CustomError("installedThemeId is required", 400);
    }
    // Convert to ObjectId
    const installedThemeObjectId = new mongoose_1.Types.ObjectId(installedThemeId);
    // Find the installed theme record BEFORE updating to get themeId and userId
    const installedTheme = await installed_themes_model_1.InstalledThemes.findById(installedThemeObjectId);
    if (!installedTheme) {
        throw new error_utils_1.CustomError("Installation not found", 404);
    }
    const themeId = installedTheme.theme;
    const storeId = installedTheme.store || installedTheme.user;
    // Mark as uninstalled; keep row for historical reference.
    installedTheme.uninstalledAt = new Date();
    await installedTheme.save();
    // NOTE: We do NOT delete the theme files from uploads/stores/{userId}/themes/{themeId}/
    // This preserves any customizations the user made to the theme
    // The files will remain available for future re-installation with customizations intact
    console.log(`✅ Theme uninstalled (marked inactive): ${themeId} for store: ${storeId}`);
    res.status(200).json({
        success: true,
        installedThemeId,
        message: "Theme uninstalled successfully. Store customizations on disk are preserved if present.",
    });
});
// Theme preview functionality
exports.getThemePreview = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId } = req.params;
    if (!themeId) {
        throw new error_utils_1.CustomError("Theme ID is required", 400);
    }
    const theme = await theme_model_1.Theme.findById(themeId);
    if (!theme) {
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    // Check if theme is active
    if (!theme.isActive) {
        throw new error_utils_1.CustomError("Theme is not available for preview", 403);
    }
    // Get the main HTML file (index.html) from the theme's unzipped directory
    const codeDir = await (0, theme_zip_from_s3_util_2.ensureCatalogThemeCodeDir)(theme);
    const themeIndexPath = path_1.default.join(codeDir, "index.html");
    if (!fs_1.default.existsSync(themeIndexPath)) {
        throw new error_utils_1.CustomError("Theme preview not available - index.html not found", 404);
    }
    // Read the HTML content
    let htmlContent = fs_1.default.readFileSync(themeIndexPath, 'utf8');
    // Update relative paths to work with our preview endpoint
    const baseUrl = `${req.protocol}://${req.get('host')}/api/themes/preview/${themeId}`;
    htmlContent = htmlContent.replace(/src="(?!http)([^"]+)"/g, `src="${baseUrl}/$1"`);
    htmlContent = htmlContent.replace(/href="(?!http)([^"]+)"/g, `href="${baseUrl}/$1"`);
    // Set appropriate headers for HTML content
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    res.send(htmlContent);
});
// Recursively list files in directory (relative to baseDir)
function listFilesRecursive(baseDir, relative = "") {
    const dir = path_1.default.join(baseDir, relative);
    if (!fs_1.default.existsSync(dir))
        return [];
    const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const ent of entries) {
        const relPath = path_1.default.join(relative, ent.name);
        if (ent.isDirectory()) {
            files.push(...listFilesRecursive(baseDir, relPath));
        }
        else {
            files.push(relPath.replace(/\\/g, '/'));
        }
    }
    return files;
}
function storeCustomizationsDir(storeId, themeId) {
    return path_1.default.join(process.cwd(), "uploads", "stores", storeId, "themes", themeId, "customizations");
}
// List all theme files for editor
exports.listThemeFiles = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const themeId = req.params.themeId;
    const theme = await theme_model_1.Theme.findById(themeId).lean();
    if (!theme)
        throw new error_utils_1.CustomError("Theme not found", 404);
    const storeId = req.query.storeId;
    const fileSet = new Set();
    if (theme.s3Assets?.zip?.key || theme.s3Assets?.contentRoot?.prefix) {
        const catDir = await (0, theme_zip_from_s3_util_2.ensureCatalogThemeCodeDir)(theme);
        listFilesRecursive(catDir).forEach((p) => fileSet.add(p));
    }
    if (storeId) {
        const customDir = storeCustomizationsDir(storeId, themeId);
        if (fs_1.default.existsSync(customDir))
            listFilesRecursive(customDir).forEach((p) => fileSet.add(p));
    }
    if (fileSet.size === 0)
        throw new error_utils_1.CustomError("Theme source not found", 404);
    const files = Array.from(fileSet);
    res.json({ success: true, count: files.length, files });
});
// Read a specific theme file content
exports.readThemeFile = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const themeId = req.params.themeId;
    const relPath = String((req.query.path || ""));
    if (!relPath)
        throw new error_utils_1.CustomError("path is required", 400);
    const theme = await theme_model_1.Theme.findById(themeId).lean();
    if (!theme)
        throw new error_utils_1.CustomError("Theme not found", 404);
    const userId = req.user?.id;
    const storeId = req.query.storeId;
    const layout = await resolveThemeEditorLayout(theme, storeId, userId);
    let abs = null;
    if (layout) {
        abs = resolveStoreThemeFilePath(layout, relPath);
    }
    if (!abs) {
        if (!theme.s3Assets?.zip?.key && !theme.s3Assets?.contentRoot?.prefix) {
            throw new error_utils_1.CustomError("File not found", 404);
        }
        const themeCode = path_1.default.resolve(await (0, theme_zip_from_s3_util_2.ensureCatalogThemeCodeDir)(theme));
        const fallbackAbs = path_1.default.resolve(path_1.default.join(themeCode, relPath));
        if (!fallbackAbs.startsWith(themeCode) ||
            !fs_1.default.existsSync(fallbackAbs) ||
            fs_1.default.statSync(fallbackAbs).isDirectory()) {
            throw new error_utils_1.CustomError("File not found", 404);
        }
        abs = fallbackAbs;
    }
    const content = fs_1.default.readFileSync(abs, "utf8");
    res.type("text/plain").send(content);
});
// Serve theme preview static files (CSS, JS, images, etc.)
exports.serveThemePreviewFiles = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId } = req.params;
    const filePath = req.params[0]; // Get the wildcard parameter
    if (!themeId) {
        throw new error_utils_1.CustomError("Theme ID is required", 400);
    }
    if (!filePath) {
        throw new error_utils_1.CustomError("File path is required", 400);
    }
    const theme = await theme_model_1.Theme.findById(themeId);
    if (!theme) {
        throw new error_utils_1.CustomError("Theme not found", 404);
    }
    if (!theme.isActive) {
        throw new error_utils_1.CustomError("Theme is not available for preview", 403);
    }
    const codeDir = await (0, theme_zip_from_s3_util_2.ensureCatalogThemeCodeDir)(theme);
    const fullFilePath = path_1.default.join(codeDir, filePath);
    const themeDir = path_1.default.resolve(codeDir);
    const requestedFile = path_1.default.resolve(fullFilePath);
    if (!requestedFile.startsWith(themeDir)) {
        throw new error_utils_1.CustomError("Access denied", 403);
    }
    // Check if file exists
    if (!fs_1.default.existsSync(fullFilePath)) {
        throw new error_utils_1.CustomError("File not found", 404);
    }
    // Check if it's a directory
    if (fs_1.default.statSync(fullFilePath).isDirectory()) {
        throw new error_utils_1.CustomError("Directory access not allowed", 403);
    }
    // Set appropriate content type based on file extension
    const ext = path_1.default.extname(fullFilePath).toLowerCase();
    const contentTypes = {
        '.html': 'text/html',
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
    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=3600');
    // Allow iframe embedding for theme preview
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    // Send the file
    res.sendFile(fullFilePath);
});
// Save an edited file for the authenticated user under their installed theme directory
exports.saveUserFileEdit = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId } = req.params;
    const { path: relPath, content, storeId } = req.body;
    const userId = req.user?.id;
    if (!userId)
        throw new error_utils_1.CustomError('Unauthorized', 401);
    if (!themeId)
        throw new error_utils_1.CustomError('themeId is required', 400);
    if (!relPath)
        throw new error_utils_1.CustomError('path is required', 400);
    console.log('💾 Save request received:', {
        userId,
        themeId,
        path: relPath,
        storeId,
        contentLength: content?.length || 0
    });
    const theme = await theme_model_1.Theme.findById(themeId).lean();
    if (!theme)
        throw new error_utils_1.CustomError('Theme not found', 404);
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    const installed = await installed_themes_model_1.InstalledThemes.findOne({
        store: new mongoose_1.Types.ObjectId(storeId),
        theme: new mongoose_1.Types.ObjectId(themeId),
        uninstalledAt: null,
    }).lean();
    if (!installed)
        throw new error_utils_1.CustomError("Theme is not installed for this store", 404);
    const customizationsDir = storeCustomizationsDir(storeId, themeId);
    if (!fs_1.default.existsSync(customizationsDir)) {
        fs_1.default.mkdirSync(customizationsDir, { recursive: true });
    }
    const abs = path_1.default.resolve(path_1.default.join(customizationsDir, relPath));
    const base = path_1.default.resolve(customizationsDir);
    if (!abs.startsWith(base))
        throw new error_utils_1.CustomError("Access denied", 403);
    const dirToEnsure = path_1.default.dirname(abs);
    if (!fs_1.default.existsSync(dirToEnsure)) {
        fs_1.default.mkdirSync(dirToEnsure, { recursive: true });
    }
    const contentToWrite = typeof content === "string" ? content : String(content);
    fs_1.default.writeFileSync(abs, contentToWrite, "utf8");
    const savedPath = abs;
    res.status(200).json({
        success: true,
        message: 'File saved successfully',
        path: savedPath
    });
});
/** GET /themes/:themeId/editor-pack — catalog schema, defaults, manifest, and runtime URLs. */
exports.getThemeEditorPack = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId } = req.params;
    const data = await (0, store_theme_config_service_1.loadCatalogThemeEditorPack)(themeId);
    res.status(200).json({ success: true, data });
});
/** GET /themes/:themeId/store-config?storeId= — merchant edits for an installed theme. */
exports.getStoreThemeConfig = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId } = req.params;
    const storeId = String(req.query.storeId || "");
    const data = await (0, store_theme_config_service_1.loadStoreThemeConfig)(storeId, themeId);
    res.status(200).json({ success: true, data });
});
/** PUT /themes/:themeId/store-config — body: { storeId, config } */
exports.putStoreThemeConfig = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { themeId } = req.params;
    const { storeId, config, overrides, values } = req.body;
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    const data = await (0, store_theme_config_service_1.saveStoreThemeConfig)(storeId, themeId, { config, overrides, values });
    res.status(200).json({
        success: true,
        message: "Theme configuration saved",
        data,
    });
});
exports.getThemeStats = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const stats = await theme_model_1.Theme.aggregate([
        {
            $group: {
                _id: null,
                totalThemes: { $sum: 1 },
                totalDownloads: { $sum: "$downloads" },
                averageRating: { $avg: "$rating.average" },
            },
        },
        {
            $project: {
                _id: 0,
                totalThemes: 1,
                totalDownloads: 1,
                averageRating: { $round: ["$averageRating", 2] },
            },
        },
    ]);
    const categoryStats = await theme_model_1.Theme.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
            },
        },
    ]);
    const planStats = await theme_model_1.Theme.aggregate([
        {
            $group: {
                _id: "$plan",
                count: { $sum: 1 },
            },
        },
    ]);
    res.status(200).json({
        success: true,
        data: {
            overall: stats[0] || {
                totalThemes: 0,
                totalDownloads: 0,
                averageRating: 0,
            },
            byCategory: categoryStats,
            byPlan: planStats,
        },
    });
});
