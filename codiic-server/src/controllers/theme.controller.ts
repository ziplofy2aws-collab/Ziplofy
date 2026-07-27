// @ts-nocheck
import { Request, Response } from "express";
import fs from "fs";
import mongoose, { Types } from "mongoose";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { InstalledThemes } from "../models/installed-themes.model";
import { Theme } from "../models/theme.model";
import { CustomTheme } from "../models/custom-theme.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { logActivity } from "../utils/activity-log.utils";
import { canonicalStoreRef, storeAndUserScopeOr } from "../utils/installed-themes-query.util";
import {
  assertStagingFolderAndAuxiliaryKeys,
  assertStagingKeys,
  collectCatalogAssetKeysAsync,
  deleteS3Keys,
  downloadS3KeyToFile,
  listAllObjectKeysUnderPrefix,
  promoteStagingAuxiliaryToCatalog,
  promoteStagingThemeAssetsToCatalog,
  promoteStagingThemeFolderToCatalog,
  publicObjectUrlForKey,
  stagingThemeFileKey,
} from "../utils/theme-s3-ingest";
import {
  downloadS3PrefixToLocalDir,
  downloadS3ZipAndExtractToDir,
  ensureCatalogThemeCodeDir,
  invalidateCatalogThemeCache,
} from "../utils/theme-zip-from-s3.util";
import { listInstalledThemesForStore, resolveInstalledThemesStoreId } from "../utils/installed-themes-list.util";
import { catalogPublicUrlForRelativePath } from "../utils/storefront-liquid.util";
import {
  REACT_THEME_CONFIG_SCHEMA,
  formValuesFromConfig,
  readStoreThemeConfigFile,
  writeStoreThemeConfigFile,
} from "../utils/theme-config.util";
import {
  computeStoreOverrides,
  flattenEditorSchema,
  formValuesFromPackConfig,
  loadThemePack,
  mergedConfigFromFormValues,
  mergeThemePackConfig,
  normalizeStoreOverrides,
  resolveStoreThemeConfig,
} from "../utils/theme-pack.util";
import { StoreThemeConfig } from "../models/store-theme-config.model";
import {
  loadCatalogThemeEditorPack,
  loadStoreThemeConfig,
  saveStoreThemeConfig,
} from "../services/store-theme-config.service";
import { tmpdir } from "os";
import archiver from "archiver";

const THEME_FILE_CONTENT_TYPES: Record<string, string> = {
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

function sendThemeStaticFile(res: Response, diskPath: string): void {
  const ext = path.extname(diskPath).toLowerCase();
  res.setHeader("Content-Type", THEME_FILE_CONTENT_TYPES[ext] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(diskPath);
}

function assertPathWithinRoot(filePath: string, rootDir: string): string {
  const normalized = path.normalize(filePath);
  const root = path.normalize(rootDir);
  if (!normalized.startsWith(root)) {
    throw new CustomError("Access denied", 403);
  }
  return normalized;
}

function makeThemePathSlug(themeName: string): string {
  const base =
    themeName
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "theme";
  return `${base}-${uuidv4().slice(0, 8)}`;
}

function resolveThemeThumbnailUrl(_req: Request, theme: any) {
  return theme?.s3Assets?.thumbnail?.url || null;
}

function resolveThemeZipUrl(_req: Request, theme: any) {
  return theme?.s3Assets?.zip?.url || null;
}

/** Normalize a theme document for list/detail APIs (S3-first catalog shape). */
function withResolvedS3Urls(s3: Record<string, any>) {
  const out = { ...s3 };
  for (const field of ["reactThemeJs", "reactThemeCss", "reactThemeSchema", "reactThemeDefaultConfig", "reactThemeManifest"] as const) {
    const part = out[field];
    if (part?.key && !part.url) {
      out[field] = { ...part, url: publicObjectUrlForKey(part.key) };
    }
  }
  return out;
}

function formatThemeForClient(theme: any) {
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
    packageType: hasFolder ? ("folder" as const) : hasZip ? ("zip" as const) : null,
    contentFileCount: hasFolder ? s3.contentRoot?.fileCount ?? 0 : undefined,
    hasRemoteTheme: Boolean(s3.reactThemeJs?.key || s3.reactThemeCss?.key),
    previewUrl: s3.zip?.url ?? null,
  };
}

interface GetThemesQuery {
  search?: string;
  category?: string;
  plan?: string;
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
}

export const getThemes = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    plan,
    page = "1",
    limit = "10",
    sort = "createdAt",
    order = "desc",
  } = req.query as GetThemesQuery;

  // Build filter object
  const filter: any = { isActive: true };

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
  const sortConfig: any = {};
  sortConfig[sort] = order === "desc" ? -1 : 1;

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);

  const themes = await Theme.find(filter)
    .populate("uploadBy", "name email")
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .sort(sortConfig)
    .lean();

  const count = await Theme.countDocuments(filter);
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
export const getAllThemesPublic = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    plan,
    page = "1",
    limit = "10",
    sort = "createdAt",
    order = "desc",
  } = req.query as GetThemesQuery;

  const filter: any = { isActive: true };
  if (search) filter.$text = { $search: search };
  if (category && category !== "all") filter.category = category;
  if (plan && plan !== "all") filter.plan = plan;

  const sortConfig: any = {};
  sortConfig[sort] = order === "desc" ? -1 : 1;

  const docs = await Theme.find(filter)
    .populate("uploadBy", "name email")
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort(sortConfig)
    .lean();

  const count = await Theme.countDocuments(filter);

  const mapped = docs.map((t: any) => formatThemeForClient(t));

  res.status(200).json({
    success: true,
    data: mapped,
    totalPages: Math.ceil(count / parseInt(limit)),
    currentPage: parseInt(page),
    total: count,
  });
});

interface GetThemeParams {
  id: string;
}

export const getTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as GetThemeParams;

  const theme = await Theme.findById(id).populate("uploadBy", "name email");

  if (!theme) {
    throw new CustomError("Theme not found", 404);
  }

  res.status(200).json({
    success: true,
    data: formatThemeForClient(theme),
  });
});

interface CreateThemeBody {
  name: string;
  description?: string;
  category: string;
  plan: string;
  price?: number;
  version?: string;
  tags?: string;
}

export const createTheme = asyncErrorHandler(async (_req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    message:
      "Multipart theme upload is no longer supported. Upload assets with presigned PUT to S3, then POST /api/themes/from-s3 with s3 keys.",
  });
});

interface CreateThemeFromS3Body extends CreateThemeBody {
  s3SessionId: string;
  s3: {
    zipKey?: string;
    files?: { key: string; relativePath: string }[];
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  };
}

/** Create catalog theme: copy browser-staged S3 objects into themes/catalog/{id}/… (no local uploads/). */
export const createThemeFromS3 = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) {
    throw new CustomError("Unauthorized", 401);
  }

  const {
    name,
    description,
    category,
    plan,
    price,
    version,
    tags,
    s3SessionId,
    s3,
  } = req.body as CreateThemeFromS3Body;

  if (!name || !category || !plan) {
    throw new CustomError("name, category, and plan are required", 400);
  }
  if (!s3SessionId || typeof s3SessionId !== "string") {
    throw new CustomError("s3SessionId is required (same value used when requesting signed URLs)", 400);
  }
  if (!s3 || typeof s3 !== "object") {
    throw new CustomError("s3 payload is required", 400);
  }

  const hasZip = typeof s3.zipKey === "string" && s3.zipKey.length > 0;
  const hasFiles = Array.isArray(s3.files) && s3.files.length > 0;
  if (hasZip === hasFiles) {
    throw new CustomError("Provide exactly one of: s3.zipKey (legacy ZIP) or s3.files (folder upload)", 400);
  }

  const requireEditorConfigKeys = () => {
    const missing: string[] = [];
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
      throw new CustomError(
        `Editor theme config is required: ${missing.join(", ")}`,
        400
      );
    }
  };

  if (hasFiles) {
    requireEditorConfigKeys();
  }

  const newId = new Types.ObjectId();
  const themePath = makeThemePathSlug(name);

  let stagingKeys: string[];
  let s3Assets: any;

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
      stagingKeys = assertStagingKeys(
        { zipKey: s3.zipKey as string, ...auxKeys },
        userId,
        s3SessionId
      );
      s3Assets = await promoteStagingThemeAssetsToCatalog(newId.toString(), {
        zipKey: s3.zipKey as string,
        ...auxKeys,
      });
    } else {
      const files = s3.files as { key: string; relativePath: string }[];
      for (const f of files) {
        if (!f.key || typeof f.key !== "string" || !f.relativePath || typeof f.relativePath !== "string") {
          throw new CustomError("Each s3.files entry requires key and relativePath", 400);
        }
        const expected = stagingThemeFileKey(userId, s3SessionId, f.relativePath);
        if (f.key !== expected) {
          throw new CustomError("s3.files key does not match relativePath for this session", 400);
        }
      }
      stagingKeys = assertStagingFolderAndAuxiliaryKeys(
        files,
        {
          thumbnailKey: s3.thumbnailKey,
          reactJsKey: s3.reactJsKey,
          reactCssKey: s3.reactCssKey,
          themeSchemaKey: s3.themeSchemaKey,
          themeDefaultConfigKey: s3.themeDefaultConfigKey,
          themeManifestKey: s3.themeManifestKey,
        },
        userId,
        s3SessionId
      );
      const folderPart = await promoteStagingThemeFolderToCatalog(
        newId.toString(),
        files.map((f) => ({ key: f.key, relativePath: f.relativePath }))
      );
      const aux = await promoteStagingAuxiliaryToCatalog(newId.toString(), {
        thumbnailKey: s3.thumbnailKey,
        reactJsKey: s3.reactJsKey,
        reactCssKey: s3.reactCssKey,
        themeSchemaKey: s3.themeSchemaKey,
        themeDefaultConfigKey: s3.themeDefaultConfigKey,
        themeManifestKey: s3.themeManifestKey,
      });
      s3Assets = { ...folderPart, ...aux };
    }
  } catch (promoteErr: any) {
    console.error("[createThemeFromS3] promote staging → catalog failed:", promoteErr);
    if (promoteErr instanceof CustomError) throw promoteErr;
    throw new CustomError(
      `Could not finalize theme files in S3: ${promoteErr?.message || "unknown error"}`,
      500
    );
  }

  const theme = await Theme.create({
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
    uploadBy: req.user?.id ? new Types.ObjectId(req.user.id) : undefined,
  });

  try {
    await deleteS3Keys(stagingKeys);
  } catch (delErr) {
    console.warn("[createThemeFromS3] Failed to delete staging S3 keys:", delErr);
  }

  const themeResponse = await Theme.findById(theme._id).populate("uploadBy", "name email");

  logActivity(req, {
    action: "theme_upload",
    entityType: "theme",
    entityId: theme._id.toString(),
    entityName: name,
    summary: `Uploaded theme "${name}" (${category}, ${plan}) via S3`,
    details: { themeId: theme._id.toString(), name, category, plan, version: version || "1.0.0", source: "s3" },
  }).catch(() => {});

  res.status(201).json({
    success: true,
    data: themeResponse ? formatThemeForClient(themeResponse) : null,
    message: "Theme created from S3 successfully",
  });
});

interface UpdateThemeParams {
  id: string;
}

interface UpdateThemeBody {
  name?: string;
  description?: string;
  category?: string;
  plan?: string;
  price?: number;
  version?: string;
  tags?: string;
  isActive?: boolean;
}

export const updateTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as UpdateThemeParams;
  const {
    name,
    description,
    category,
    plan,
    price,
    version,
    tags,
    isActive,
  } = req.body as UpdateThemeBody;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (plan !== undefined) updateData.plan = plan;
  if (price !== undefined) updateData.price = price;
  if (version !== undefined) updateData.version = version;
  if (tags !== undefined) {
    updateData.tags =
      typeof tags === "string" ? tags.split(",").map((tag) => tag.trim()).filter(Boolean) : tags;
  }
  if (isActive !== undefined) updateData.isActive = isActive;

  const theme = await Theme.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("uploadBy", "name email");

  if (!theme) {
    throw new CustomError("Theme not found", 404);
  }

  logActivity(req, {
    action: "theme_update",
    entityType: "theme",
    entityId: id,
    entityName: theme.name,
    summary: `Updated theme "${theme.name}"`,
    details: { themeId: id, updates: updateData },
  }).catch(() => {});

  res.status(200).json({
    success: true,
    data: formatThemeForClient(theme),
    message: "Theme updated successfully",
  });
});

interface UpdateThemeFromS3Body {
  name?: string;
  description?: string;
  category?: string;
  plan?: string;
  price?: number;
  version?: string;
  tags?: string;
  isActive?: boolean;
  s3SessionId?: string;
  s3?: {
    files?: { key: string; relativePath: string }[];
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  };
}

/**
 * Update catalog theme metadata and/or replace S3 assets (folder, remote dist, editor JSON, thumbnail).
 * Browser stages new files with the same presigned flow as create, then this promotes into themes/catalog/{id}/.
 */
export const updateThemeFromS3 = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new CustomError("Unauthorized", 401);

  const { id } = req.params as unknown as UpdateThemeParams;
  const {
    name,
    description,
    category,
    plan,
    price,
    version,
    tags,
    isActive,
    s3SessionId,
    s3,
  } = req.body as UpdateThemeFromS3Body;

  const theme = await Theme.findById(id);
  if (!theme) throw new CustomError("Theme not found", 404);

  const hasS3Payload = s3 && typeof s3 === "object";
  const hasFiles = Boolean(hasS3Payload && Array.isArray(s3!.files) && s3!.files!.length > 0);
  const hasAux = Boolean(
    hasS3Payload &&
      (s3!.thumbnailKey ||
        s3!.reactJsKey ||
        s3!.reactCssKey ||
        s3!.themeSchemaKey ||
        s3!.themeDefaultConfigKey ||
        s3!.themeManifestKey)
  );

  if ((hasFiles || hasAux) && (!s3SessionId || typeof s3SessionId !== "string")) {
    throw new CustomError("s3SessionId is required when replacing theme files", 400);
  }

  let stagingKeys: string[] = [];
  const nextS3Assets: Record<string, unknown> = {
    ...((theme.s3Assets as any)?.toObject?.() ?? theme.s3Assets ?? {}),
  };
  let assetsChanged = false;

  try {
    if (hasFiles) {
      const files = s3!.files as { key: string; relativePath: string }[];
      for (const f of files) {
        if (!f.key || typeof f.key !== "string" || !f.relativePath || typeof f.relativePath !== "string") {
          throw new CustomError("Each s3.files entry requires key and relativePath", 400);
        }
        const expected = stagingThemeFileKey(userId, s3SessionId!, f.relativePath);
        if (f.key !== expected) {
          throw new CustomError("s3.files key does not match relativePath for this session", 400);
        }
      }

      const folderStaging = assertStagingFolderAndAuxiliaryKeys(
        files,
        {},
        userId,
        s3SessionId!
      );
      stagingKeys.push(...folderStaging);

      const themeFolderPrefix = `themes/catalog/${id}/theme/`;
      try {
        const oldKeys = await listAllObjectKeysUnderPrefix(themeFolderPrefix);
        if (oldKeys.length) await deleteS3Keys(oldKeys);
      } catch (delOldErr) {
        console.warn("[updateThemeFromS3] Failed to clear previous theme folder:", delOldErr);
      }

      if ((nextS3Assets as { zip?: { key?: string } }).zip?.key) {
        try {
          await deleteS3Keys([(nextS3Assets as { zip: { key: string } }).zip.key]);
        } catch {
          /* ignore */
        }
        delete (nextS3Assets as { zip?: unknown }).zip;
      }

      const folderPart = await promoteStagingThemeFolderToCatalog(
        id,
        files.map((f) => ({ key: f.key, relativePath: f.relativePath }))
      );
      nextS3Assets.contentRoot = folderPart.contentRoot;
      assetsChanged = true;
    }

    if (hasAux) {
      const auxKeys = {
        thumbnailKey: s3!.thumbnailKey,
        reactJsKey: s3!.reactJsKey,
        reactCssKey: s3!.reactCssKey,
        themeSchemaKey: s3!.themeSchemaKey,
        themeDefaultConfigKey: s3!.themeDefaultConfigKey,
        themeManifestKey: s3!.themeManifestKey,
      };
      const auxStaging = assertStagingFolderAndAuxiliaryKeys([], auxKeys, userId, s3SessionId!);
      stagingKeys.push(...auxStaging);

      const oldThumbKey = (nextS3Assets.thumbnail as { key?: string } | undefined)?.key;
      const aux = await promoteStagingAuxiliaryToCatalog(id, auxKeys);
      Object.assign(nextS3Assets, aux);

      // Thumbnail dest key can change extension — remove previous object if different.
      if (
        aux.thumbnail?.key &&
        oldThumbKey &&
        oldThumbKey !== aux.thumbnail.key
      ) {
        try {
          await deleteS3Keys([oldThumbKey]);
        } catch {
          /* ignore */
        }
      }
      assetsChanged = true;
    }
  } catch (promoteErr: any) {
    console.error("[updateThemeFromS3] promote staging → catalog failed:", promoteErr);
    if (promoteErr instanceof CustomError) throw promoteErr;
    throw new CustomError(
      `Could not update theme files in S3: ${promoteErr?.message || "unknown error"}`,
      500
    );
  }

  if (name !== undefined) theme.name = name;
  if (description !== undefined) theme.description = description;
  if (category !== undefined) theme.category = category;
  if (plan !== undefined) theme.plan = plan;
  if (price !== undefined) theme.price = price;
  if (version !== undefined) theme.version = version;
  if (tags !== undefined) {
    theme.tags =
      typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : (tags as any);
  }
  if (isActive !== undefined) theme.isActive = isActive;
  if (assetsChanged) {
    theme.s3Assets = nextS3Assets as any;
    theme.markModified("s3Assets");
  }
  theme.updatedAt = new Date();
  await theme.save();

  if (stagingKeys.length) {
    try {
      await deleteS3Keys(stagingKeys);
    } catch (delErr) {
      console.warn("[updateThemeFromS3] Failed to delete staging S3 keys:", delErr);
    }
  }

  if (assetsChanged) {
    invalidateCatalogThemeCache(id);
  }

  const themeResponse = await Theme.findById(theme._id).populate("uploadBy", "name email");

  logActivity(req, {
    action: "theme_update",
    entityType: "theme",
    entityId: id,
    entityName: theme.name,
    summary: `Updated theme "${theme.name}"${assetsChanged ? " (assets replaced)" : ""}`,
    details: {
      themeId: id,
      assetsChanged,
      replacedFolder: hasFiles,
      replacedAux: hasAux,
    },
  }).catch(() => {});

  res.status(200).json({
    success: true,
    data: themeResponse ? formatThemeForClient(themeResponse) : null,
    message: assetsChanged
      ? "Theme and assets updated successfully"
      : "Theme updated successfully",
  });
});

export const deleteTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log('🗑️ Delete theme request received:', { 
    themeId: id, 
    user: req.user?.name, 
    userRole: req.user?.role 
  });

  const theme = await Theme.findById(id);
  if (!theme) {
    console.log('❌ Theme not found:', id);
    throw new CustomError("Theme not found", 404);
  }

  logActivity(req, {
    action: "theme_delete",
    entityType: "theme",
    entityId: id,
    entityName: theme.name,
    summary: `Deleted theme "${theme.name}"`,
    details: { themeId: id, themePath: theme.themePath, category: theme.category },
  }).catch(() => {});

  console.log('✅ Theme found:', { 
    name: theme.name, 
    themePath: theme.themePath,
  });

  // Delete all installed instances of this theme
  const deletedInstances = await InstalledThemes.deleteMany({ theme: id });
  console.log('🗑️ Deleted installed instances:', deletedInstances.deletedCount);

  try {
    const keys = await collectCatalogAssetKeysAsync(theme.s3Assets as any);
    await deleteS3Keys(keys);
  } catch (s3Err) {
    console.warn("[deleteTheme] Failed to delete some catalog S3 objects:", s3Err);
  }

  // Delete the theme from database
  const deletedTheme = await Theme.findByIdAndDelete(id);
  console.log('✅ Theme deleted from database:', deletedTheme ? 'Success' : 'Failed');

  console.log('🎉 Theme deletion completed successfully');
  res.status(200).json({
    success: true,
    data: {},
    message: "Theme and all associated files deleted successfully",
  });
});

export const downloadTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const theme = await Theme.findById(id);
  if (!theme) {
    throw new CustomError("Theme not found", 404);
  }

  if (!theme.isActive) {
    throw new CustomError("Theme is not available for download", 400);
  }

  // Check user permissions based on plan
  if (theme.plan === "premium" && req.user?.role !== "super-admin") {
    throw new CustomError("Premium theme requires appropriate subscription", 403);
  }

  const zipUrl = theme.s3Assets?.zip?.url;
  const folderPrefix = theme.s3Assets?.contentRoot?.prefix;
  if (!zipUrl && !folderPrefix) {
    throw new CustomError("Theme download is not available", 404);
  }

  if (theme.downloads) {
    theme.downloads += 1;
  } else {
    theme.downloads = 1;
  }
  await theme.save();

  if (zipUrl) {
    res.redirect(302, zipUrl);
    return;
  }

  const tmpBase = path.join(tmpdir(), `codiic-theme-dl-${id}-${Date.now()}`);
  fs.mkdirSync(tmpBase, { recursive: true });
  const folderDir = path.join(tmpBase, "files");
  try {
    await downloadS3PrefixToLocalDir(folderPrefix!, folderDir);
    const safeName = `${theme.themePath || theme.name || "theme"}.zip`.replace(/[^\w.\-]+/g, "_");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      console.error("[downloadTheme] archiver:", err);
    });
    archive.on("end", () => {
      try {
        fs.rmSync(tmpBase, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    });
    archive.pipe(res);
    archive.directory(folderDir, false);
    await archive.finalize();
  } catch (e) {
    try {
      fs.rmSync(tmpBase, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    throw e;
  }
});

export const getThemeStructure = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const theme = await Theme.findById(id);
  if (!theme) {
    throw new CustomError("Theme not found", 404);
  }

  const extractPath = await ensureCatalogThemeCodeDir(theme);

  // Recursive function to get directory structure
  const getStructure = (dirPath: string, relativePath = ""): any[] => {
    const items = fs.readdirSync(dirPath);
    const structure: any[] = [];

    items.forEach((item) => {
      const fullPath = path.join(dirPath, item);
      const relPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        structure.push({
          name: item,
          type: "directory",
          path: relPath,
          children: getStructure(fullPath, relPath),
        });
      } else {
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

export const getThumbnail = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const theme = await Theme.findById(id);
  if (!theme) {
    throw new CustomError("Theme not found", 404);
  }

  const url = theme.s3Assets?.thumbnail?.url;
  if (!url) {
    throw new CustomError("Thumbnail not found", 404);
  }

  res.redirect(302, url);
});

export const getThemesStatic = asyncErrorHandler(async (req: Request, res: Response) => {
  const themes = await Theme.find();

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
export const installTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId, storeId } = req.body as { themeId: string; storeId?: string };

  if (!themeId) throw new CustomError("Theme ID is required", 400);
  if (!storeId) throw new CustomError("Store ID is required", 400);

  const themeObjectId = new Types.ObjectId(themeId);
  const theme = await Theme.findById(themeObjectId);
  if (!theme) throw new CustomError("Theme not found", 404);

  const storeRef = canonicalStoreRef(storeId);
  const installedTheme = await InstalledThemes.findOneAndUpdate(
    { store: storeRef, theme: themeObjectId },
    {
      $set: {
        store: storeRef,
        theme: themeObjectId,
        uninstalledAt: null,
        installedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const thumbnailUrl = resolveThemeThumbnailUrl(req, theme);

  logActivity(req, {
    action: "theme_install",
    entityType: "theme",
    entityId: themeId,
    entityName: theme.name,
    summary: `Installed theme "${theme.name}" for store`,
    details: { themeId, storeId, themeName: theme.name, category: theme.category },
  }).catch(() => {});

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

export const applyThemeToStore = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, themeId } = req.body as { storeId?: string; themeId?: string };

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }
  if (!themeId) {
    throw new CustomError("Theme ID is required", 400);
  }
  if (!Types.ObjectId.isValid(themeId)) {
    throw new CustomError("Invalid theme ID format", 400);
  }

  const store = await Store.findById(storeId).select("_id").lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  const themeObjectId = new Types.ObjectId(themeId);

  const installedRecord = await InstalledThemes.findOne({
    $and: [
      { $or: storeAndUserScopeOr(String(storeId)) },
      { theme: themeObjectId },
      { uninstalledAt: null },
    ],
  })
    .select("_id")
    .lean();

  const customTheme = await CustomTheme.findById(themeId).select("_id").lean();
  if (!installedRecord && !customTheme) {
    throw new CustomError("Theme is not installed for this store", 404);
  }

  await Store.findByIdAndUpdate(storeId, {
    $set: { appliedTheme: themeObjectId, appliedCustomThemeId: null },
  });

  res.status(200).json({
    success: true,
    message: "Theme applied successfully",
    data: { storeId, appliedTheme: themeId },
  });
});

export const serveInstalledThemeFiles = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, themeId } = req.params;
  const rawPath = req.params[0];
  if (!rawPath) throw new CustomError("File path is required", 400);

  const isCustomTheme = themeId.startsWith("custom-");
  const catalogThemeId = isCustomTheme ? themeId.replace(/^custom-/, "") : themeId;
  let rel = String(rawPath).replace(/^\/+/, "").replace(/\\/g, "/");

  if (rel.startsWith("runtime/")) rel = rel.slice("runtime/".length);
  else if (rel.startsWith("unzippedTheme/")) rel = rel.slice("unzippedTheme/".length);

  if (isCustomTheme) {
    const storeThemeDir = path.join(process.cwd(), "uploads", "stores", storeId, "themes", themeId);
    const unzippedDir = path.join(storeThemeDir, "unzippedTheme");
    let diskPath = path.join(unzippedDir, rel);
    if (!fs.existsSync(diskPath)) diskPath = path.join(storeThemeDir, rel);
    assertPathWithinRoot(diskPath, storeThemeDir);

    if (!fs.existsSync(diskPath) || fs.statSync(diskPath).isDirectory()) {
      const customTheme = await CustomTheme.findById(catalogThemeId).lean();
      if (!customTheme) throw new CustomError("Custom theme not found", 404);
      diskPath = path.join(customTheme.directories.unzippedTheme, rel);
    }
    if (!fs.existsSync(diskPath) || fs.statSync(diskPath).isDirectory()) {
      throw new CustomError("File not found", 404);
    }
    return sendThemeStaticFile(res, diskPath);
  }

  const installed = await InstalledThemes.findOne({
    store: new Types.ObjectId(storeId),
    theme: new Types.ObjectId(catalogThemeId),
    uninstalledAt: null,
  }).lean();
  if (!installed) throw new CustomError("Theme is not installed for this store", 404);

  const theme = await Theme.findById(catalogThemeId).lean();
  if (!theme) throw new CustomError("Theme not found", 404);

  const customizationPath = path.resolve(
    path.join(process.cwd(), "uploads", "stores", storeId, "themes", catalogThemeId, "customizations", rel)
  );
  const customizationRoot = path.resolve(
    path.join(process.cwd(), "uploads", "stores", storeId, "themes", catalogThemeId, "customizations")
  );
  if (
    customizationPath.startsWith(customizationRoot) &&
    fs.existsSync(customizationPath) &&
    fs.statSync(customizationPath).isFile()
  ) {
    return sendThemeStaticFile(res, customizationPath);
  }

  const s3Assets = theme.s3Assets as Parameters<typeof catalogPublicUrlForRelativePath>[0];
  const publicUrl = catalogPublicUrlForRelativePath(
    s3Assets,
    rel.startsWith("remoteThemeDist/") ? rel.replace(/^remoteThemeDist\//, "") : rel
  );
  if (!publicUrl) throw new CustomError("File not found", 404);
  return res.redirect(302, publicUrl);
});

export const getInstalledThemes = asyncErrorHandler(async (req: Request, res: Response) => {
  const storeId = resolveInstalledThemesStoreId(req);
  if (!storeId) throw new CustomError("storeId is required", 400);

  const data = await listInstalledThemesForStore(storeId);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.status(200).json(data);
});

interface UninstallThemeBody {
  installedThemeId: string;
}

export const uninstallTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { installedThemeId } = req.body as UninstallThemeBody;
  
  if (!installedThemeId) {
    throw new CustomError("installedThemeId is required", 400);
  }

  // Convert to ObjectId
  const installedThemeObjectId = new Types.ObjectId(installedThemeId);

  // Find the installed theme record BEFORE updating to get themeId and userId
  const installedTheme = await InstalledThemes.findById(installedThemeObjectId);
  if (!installedTheme) {
    throw new CustomError("Installation not found", 404);
  }

  const themeId = installedTheme.theme;
  const storeId = (installedTheme as any).store || (installedTheme as any).user;

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
function injectHtmlBaseHref(html: string, baseHref: string): string {
  const base = baseHref.endsWith("/") ? baseHref : `${baseHref}/`;
  const baseTag = `<base href="${base}">`;
  let out = html;
  if (/<base\b[^>]*>/i.test(out)) {
    out = out.replace(/<base\b[^>]*>/i, baseTag);
  } else if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n    ${baseTag}`);
  } else {
    out = `${baseTag}\n${out}`;
  }
  // Root-relative paths ignore <base>; point them at the same asset root.
  out = out.replace(
    /\b(src|href|poster)=(["'])\/(?!\/)([^"']*)\2/gi,
    (_m, attr: string, q: string, p: string) => `${attr}=${q}${base}${p}${q}`
  );
  out = out.replace(
    /url\(\s*(['"]?)\/(?!\/)([^)"']+)\1\s*\)/gi,
    (_m, q: string, p: string) => `url(${q}${base}${p}${q})`
  );
  return out;
}

export const getThemePreview = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params;
  
  if (!themeId) {
    throw new CustomError("Theme ID is required", 400);
  }

  const theme = await Theme.findById(themeId);
  if (!theme) {
    throw new CustomError("Theme not found", 404);
  }

  // Check if theme is active
  if (!theme.isActive) {
    throw new CustomError("Theme is not available for preview", 403);
  }

  // Get the main HTML file (index.html) from the theme's unzipped directory
  const codeDir = await ensureCatalogThemeCodeDir(theme);
  const themeIndexPath = path.join(codeDir, "index.html");

  if (!fs.existsSync(themeIndexPath)) {
    throw new CustomError("Theme preview not available - index.html not found", 404);
  }

  let htmlContent = fs.readFileSync(themeIndexPath, "utf8");

  // Relative assets must resolve like opening index.html on S3.
  // Without a trailing-slash base, `/preview/:id` makes `assets/x` resolve to
  // `/preview/assets/x` (theme id dropped) — so some images 404 while others
  // that were manually rewritten still work.
  const contentPrefix = theme.s3Assets?.contentRoot?.prefix;
  let baseHref: string;
  if (contentPrefix) {
    const root = contentPrefix.endsWith("/") ? contentPrefix : `${contentPrefix}/`;
    baseHref = publicObjectUrlForKey(root);
  } else {
    baseHref = `${req.protocol}://${req.get("host")}/api/themes/preview/${themeId}/`;
  }
  htmlContent = injectHtmlBaseHref(htmlContent, baseHref);
  
  // Set appropriate headers for HTML content
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.send(htmlContent);
});


// Recursively list files in directory (relative to baseDir)
function listFilesRecursive(baseDir: string, relative: string = ""): string[] {
  const dir = path.join(baseDir, relative);
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const ent of entries) {
    const relPath = path.join(relative, ent.name);
    if (ent.isDirectory()) {
      files.push(...listFilesRecursive(baseDir, relPath));
    } else {
      files.push(relPath.replace(/\\/g, '/'));
    }
  }
  return files;
}

function storeCustomizationsDir(storeId: string, themeId: string): string {
  return path.join(process.cwd(), "uploads", "stores", storeId, "themes", themeId, "customizations");
}

// List all theme files for editor
export const listThemeFiles = asyncErrorHandler(async (req: Request, res: Response) => {
  const themeId = req.params.themeId;
  const theme = await Theme.findById(themeId).lean();
  if (!theme) throw new CustomError("Theme not found", 404);
  const storeId = req.query.storeId as string | undefined;

  const fileSet = new Set<string>();
  if (theme.s3Assets?.zip?.key || theme.s3Assets?.contentRoot?.prefix) {
    const catDir = await ensureCatalogThemeCodeDir(theme);
    listFilesRecursive(catDir).forEach((p) => fileSet.add(p));
  }
  if (storeId) {
    const customDir = storeCustomizationsDir(storeId, themeId);
    if (fs.existsSync(customDir)) listFilesRecursive(customDir).forEach((p) => fileSet.add(p));
  }
  if (fileSet.size === 0) throw new CustomError("Theme source not found", 404);

  const files = Array.from(fileSet);
  res.json({ success: true, count: files.length, files });
});

// Read a specific theme file content
export const readThemeFile = asyncErrorHandler(async (req: Request, res: Response) => {
  const themeId = req.params.themeId;
  const relPath = String((req.query.path || "") as string);
  if (!relPath) throw new CustomError("path is required", 400);
  const theme = await Theme.findById(themeId).lean();
  if (!theme) throw new CustomError("Theme not found", 404);
  const userId = (req.user as any)?.id;
  const storeId = req.query.storeId as string | undefined;
  const layout = await resolveThemeEditorLayout(theme, storeId, userId);

  let abs: string | null = null;
  if (layout) {
    abs = resolveStoreThemeFilePath(layout, relPath);
  }
  if (!abs) {
    if (!theme.s3Assets?.zip?.key && !theme.s3Assets?.contentRoot?.prefix) {
      throw new CustomError("File not found", 404);
    }
    const themeCode = path.resolve(await ensureCatalogThemeCodeDir(theme));
    const fallbackAbs = path.resolve(path.join(themeCode, relPath));
    if (
      !fallbackAbs.startsWith(themeCode) ||
      !fs.existsSync(fallbackAbs) ||
      fs.statSync(fallbackAbs).isDirectory()
    ) {
      throw new CustomError("File not found", 404);
    }
    abs = fallbackAbs;
  }

  const content = fs.readFileSync(abs, "utf8");
  res.type("text/plain").send(content);
});

// Serve theme preview static files (CSS, JS, images, etc.)
export const serveThemePreviewFiles = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params;
  const filePath = req.params[0]; // Get the wildcard parameter

  if (!themeId) {
    throw new CustomError("Theme ID is required", 400);
  }

  if (!filePath) {
    throw new CustomError("File path is required", 400);
  }

  const theme = await Theme.findById(themeId);
  if (!theme) {
    throw new CustomError("Theme not found", 404);
  }

  if (!theme.isActive) {
    throw new CustomError("Theme is not available for preview", 403);
  }

  const rel = String(filePath).replace(/^\/+/, "").replace(/\\/g, "/");
  if (!rel || rel.includes("..")) {
    throw new CustomError("Access denied", 403);
  }

  // Folder themes: serve from public S3 content root (same URLs as opening index.html on S3).
  const contentPrefix = theme.s3Assets?.contentRoot?.prefix;
  if (contentPrefix) {
    const root = contentPrefix.endsWith("/") ? contentPrefix : `${contentPrefix}/`;
    const publicUrl = publicObjectUrlForKey(`${root}${rel}`);
    return res.redirect(302, publicUrl);
  }

  const codeDir = await ensureCatalogThemeCodeDir(theme);
  const fullFilePath = path.join(codeDir, rel);

  const themeDir = path.resolve(codeDir);
  const requestedFile = path.resolve(fullFilePath);
  
  if (!requestedFile.startsWith(themeDir)) {
    throw new CustomError("Access denied", 403);
  }

  // Check if file exists
  if (!fs.existsSync(fullFilePath)) {
    throw new CustomError("File not found", 404);
  }

  // Check if it's a directory
  if (fs.statSync(fullFilePath).isDirectory()) {
    throw new CustomError("Directory access not allowed", 403);
  }

  // Set appropriate content type based on file extension
  const ext = path.extname(fullFilePath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
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
export const saveUserFileEdit = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params as { themeId: string };
  const { path: relPath, content, storeId } = req.body as { path: string; content: string; storeId?: string };

  const userId = (req.user as any)?.id;
  if (!userId) throw new CustomError('Unauthorized', 401);
  if (!themeId) throw new CustomError('themeId is required', 400);
  if (!relPath) throw new CustomError('path is required', 400);

  console.log('💾 Save request received:', { 
    userId, 
    themeId, 
    path: relPath, 
    storeId, 
    contentLength: content?.length || 0 
  });

  const theme = await Theme.findById(themeId).lean();
  if (!theme) throw new CustomError('Theme not found', 404);

  if (!storeId) throw new CustomError("storeId is required", 400);

  const installed = await InstalledThemes.findOne({
    store: new Types.ObjectId(storeId),
    theme: new Types.ObjectId(themeId),
    uninstalledAt: null,
  }).lean();
  if (!installed) throw new CustomError("Theme is not installed for this store", 404);

  const customizationsDir = storeCustomizationsDir(storeId, themeId);
  if (!fs.existsSync(customizationsDir)) {
    fs.mkdirSync(customizationsDir, { recursive: true });
  }

  const abs = path.resolve(path.join(customizationsDir, relPath));
  const base = path.resolve(customizationsDir);
  if (!abs.startsWith(base)) throw new CustomError("Access denied", 403);

  const dirToEnsure = path.dirname(abs);
  if (!fs.existsSync(dirToEnsure)) {
    fs.mkdirSync(dirToEnsure, { recursive: true });
  }

  const contentToWrite = typeof content === "string" ? content : String(content);
  fs.writeFileSync(abs, contentToWrite, "utf8");
  const savedPath = abs;

  res.status(200).json({ 
    success: true, 
    message: 'File saved successfully',
    path: savedPath 
  });
});

/** GET /themes/:themeId/editor-pack — catalog schema, defaults, manifest, and runtime URLs. */
export const getThemeEditorPack = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params as { themeId: string };
  const data = await loadCatalogThemeEditorPack(themeId);
  res.status(200).json({ success: true, data });
});

/** GET /themes/:themeId/store-config?storeId= — merchant edits for an installed theme. */
export const getStoreThemeConfig = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params as { themeId: string };
  const storeId = String(req.query.storeId || "");
  const data = await loadStoreThemeConfig(storeId, themeId);
  res.status(200).json({ success: true, data });
});

/** PUT /themes/:themeId/store-config — body: { storeId, config } */
export const putStoreThemeConfig = asyncErrorHandler(async (req: Request, res: Response) => {
  const { themeId } = req.params as { themeId: string };
  const { storeId, config, overrides, values } = req.body as {
    storeId?: string;
    config?: Record<string, unknown>;
    overrides?: Record<string, unknown>;
    values?: Record<string, string | boolean>;
  };
  if (!storeId) throw new CustomError("storeId is required", 400);
  const data = await saveStoreThemeConfig(storeId, themeId, { config, overrides, values });
  res.status(200).json({
    success: true,
    message: "Theme configuration saved",
    data,
  });
});

export const getThemeStats = asyncErrorHandler(async (req: Request, res: Response) => {
  const stats = await Theme.aggregate([
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

  const categoryStats = await Theme.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const planStats = await Theme.aggregate([
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
