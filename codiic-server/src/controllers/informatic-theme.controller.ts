import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { InformaticTheme } from '../models/informatic-theme.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { logActivity } from '../utils/activity-log.utils';
import {
  assertInformaticStagingFolderAndAuxiliaryKeys,
  deleteS3Keys,
  informaticStagingThemeFileKey,
  INFORMATIC_CATALOG_ROOT,
  promoteInformaticFolderUploadToCatalog,
  publicObjectUrlForKey,
} from '../utils/informatic-theme-s3-ingest';
import {
  readS3JsonObject,
  readS3Utf8Object,
  streamS3ObjectToResponse,
} from '../utils/theme-s3-ingest';
import { awsBucket, awsRegion } from '../utils/s3-client';
import {
  importInformaticThemeFromFileList,
  importInformaticThemeFromZipBuffer,
} from '../utils/informatic-import/import-static-theme-zip';

function makeSlug(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'informatic-theme';
  return `${base}-${uuidv4().slice(0, 8)}`;
}

/**
 * Absolute public origin of this API, derived from the incoming request.
 * Catalog assets are private on S3, so browsers must fetch them through
 * this backend — the URLs we emit need the host the client actually used.
 */
export function apiBaseFromReq(req: Request): string {
  const proto = String(req.get('x-forwarded-proto') || req.protocol || 'http')
    .split(',')[0]
    .trim();
  return `${proto}://${req.get('host')}`;
}

/** URL that streams a file under `informatic-themes/catalog/<themeId>/` through the backend. */
export function informaticFileUrl(apiBase: string, themeId: string, relKey: string): string {
  const encoded = relKey
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  return `${apiBase}/api/informatic-themes/file/${themeId}/${encoded}`;
}

function withResolvedS3Urls(s3: Record<string, any>, themeId?: string, apiBase?: string) {
  const out = { ...s3 };
  const catalogPrefix = themeId ? `${INFORMATIC_CATALOG_ROOT}/${themeId}/` : null;
  for (const field of [
    'reactThemeJs',
    'reactThemeCss',
    'reactThemeSchema',
    'reactThemeDefaultConfig',
    'reactThemeManifest',
    'thumbnail',
  ] as const) {
    const part = out[field];
    if (!part?.key) continue;
    const key = String(part.key);
    if (catalogPrefix && apiBase && key.startsWith(catalogPrefix)) {
      out[field] = { ...part, url: informaticFileUrl(apiBase, themeId!, key.slice(catalogPrefix.length)) };
    } else if (!part.url) {
      out[field] = { ...part, url: publicObjectUrlForKey(key) };
    }
  }
  return out;
}

/**
 * Rewrite raw S3 catalog URLs inside a JSON blob (schema/config/manifest) to
 * the backend file route. Older imports stored private S3 URLs that browsers
 * cannot read; rewriting at serve time fixes them without re-uploading.
 */
function rewriteCatalogS3Urls(value: any, themeId: string, apiBase: string): any {
  if (value == null) return value;
  const prefix = `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${INFORMATIC_CATALOG_ROOT}/${themeId}/`;
  const walk = (v: any): any => {
    if (typeof v === 'string') {
      if (!v.startsWith(prefix)) return v;
      const rel = v
        .slice(prefix.length)
        .split('/')
        .map((s) => {
          try {
            return decodeURIComponent(s);
          } catch {
            return s;
          }
        })
        .join('/');
      return informaticFileUrl(apiBase, themeId, rel);
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const o: Record<string, any> = {};
      for (const k of Object.keys(v)) o[k] = walk(v[k]);
      return o;
    }
    return v;
  };
  return walk(value);
}

export function formatInformaticThemeForClient(theme: any, apiBase?: string) {
  const obj = theme?.toObject ? theme.toObject() : { ...theme };
  const s3 = withResolvedS3Urls(obj.s3Assets ?? {}, String(obj._id ?? ''), apiBase);
  return {
    _id: obj._id,
    id: String(obj._id),
    name: obj.name,
    description: obj.description,
    slug: obj.slug,
    plan: obj.plan,
    price: obj.price,
    version: obj.version,
    tags: obj.tags,
    isActive: obj.isActive,
    isDefault: obj.isDefault,
    manifestSummary: obj.manifestSummary,
    s3Assets: s3,
    thumbnailUrl: s3.thumbnail?.url ?? null,
    themeJsUrl: s3.reactThemeJs?.url ?? null,
    themeCssUrl: s3.reactThemeCss?.url ?? null,
    schemaUrl: s3.reactThemeSchema?.url ?? null,
    defaultConfigUrl: s3.reactThemeDefaultConfig?.url ?? null,
    manifestUrl: s3.reactThemeManifest?.url ?? null,
    hasRemoteTheme: Boolean(s3.reactThemeJs?.key || s3.reactThemeCss?.key),
    contentFileCount: s3.contentRoot?.fileCount ?? 0,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    uploadBy: obj.uploadBy,
  };
}

interface CreateInformaticThemeFromS3Body {
  name: string;
  description?: string;
  plan: string;
  price?: number;
  version?: string;
  tags?: string;
  s3SessionId: string;
  s3: {
    files: { key: string; relativePath: string }[];
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  };
}

export const listInformaticThemes = asyncErrorHandler(async (req: Request, res: Response) => {
  const { search, page = '1', limit = '24', includeInactive } = req.query as {
    search?: string;
    page?: string;
    limit?: string;
    includeInactive?: string;
  };

  const filter: Record<string, unknown> = {};
  if (includeInactive !== 'true') {
    filter.isActive = true;
  }
  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 24));
  const skip = (pageNum - 1) * limitNum;

  const [docs, total] = await Promise.all([
    InformaticTheme.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    InformaticTheme.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: docs.map((t) => formatInformaticThemeForClient(t, apiBaseFromReq(req))),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const getInformaticTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const theme = await InformaticTheme.findById(id).populate('uploadBy', 'name email');
  if (!theme) {
    throw new CustomError('Informatic theme not found', 404);
  }
  res.json({ success: true, data: formatInformaticThemeForClient(theme, apiBaseFromReq(req)) });
});

export const createInformaticThemeFromS3 = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) {
    throw new CustomError('Unauthorized', 401);
  }

  const { name, description, plan, price, version, tags, s3SessionId, s3 } =
    req.body as CreateInformaticThemeFromS3Body;

  if (!name?.trim() || !plan) {
    throw new CustomError('name and plan are required', 400);
  }
  if (!s3SessionId || typeof s3SessionId !== 'string') {
    throw new CustomError('s3SessionId is required', 400);
  }
  if (!s3 || typeof s3 !== 'object') {
    throw new CustomError('s3 payload is required', 400);
  }

  const files = Array.isArray(s3.files) ? s3.files : [];
  if (files.length === 0) {
    throw new CustomError('At least one theme folder file is required in s3.files', 400);
  }

  const missing: string[] = [];
  if (!s3.themeSchemaKey) missing.push('themeSchemaKey');
  if (!s3.themeDefaultConfigKey) missing.push('themeDefaultConfigKey');
  if (!s3.themeManifestKey) missing.push('themeManifestKey');
  if (!s3.reactJsKey) missing.push('reactJsKey');
  if (!s3.reactCssKey) missing.push('reactCssKey');
  if (!s3.thumbnailKey) missing.push('thumbnailKey');
  if (missing.length) {
    throw new CustomError(`Required Informatic theme assets: ${missing.join(', ')}`, 400);
  }

  for (const f of files) {
    if (!f.key || !f.relativePath) {
      throw new CustomError('Each s3.files entry requires key and relativePath', 400);
    }
    const expected = informaticStagingThemeFileKey(userId, s3SessionId, f.relativePath);
    if (f.key !== expected) {
      throw new CustomError('s3.files key does not match relativePath for this session', 400);
    }
  }

  const newId = new Types.ObjectId();
  const slug = makeSlug(name);

  let stagingKeys: string[];
  let s3Assets: any;

  try {
    stagingKeys = assertInformaticStagingFolderAndAuxiliaryKeys(
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
    s3Assets = await promoteInformaticFolderUploadToCatalog(newId.toString(), files, {
      thumbnailKey: s3.thumbnailKey,
      reactJsKey: s3.reactJsKey,
      reactCssKey: s3.reactCssKey,
      themeSchemaKey: s3.themeSchemaKey,
      themeDefaultConfigKey: s3.themeDefaultConfigKey,
      themeManifestKey: s3.themeManifestKey,
    });
  } catch (promoteErr: any) {
    if (promoteErr instanceof CustomError) throw promoteErr;
    throw new CustomError(
      `Could not finalize Informatic theme in S3: ${promoteErr?.message || 'unknown error'}`,
      500
    );
  }

  let manifestSummary: { themeId?: string; templates?: string[]; type?: string } = {
    type: 'react-remote',
  };
  if (s3Assets.reactThemeManifest?.key) {
    const manifest = await readS3JsonObject<Record<string, unknown>>(s3Assets.reactThemeManifest.key);
    if (manifest) {
      manifestSummary = {
        themeId: typeof manifest.id === 'string' ? manifest.id : undefined,
        templates: Array.isArray(manifest.templates)
          ? manifest.templates.map((t) => (typeof t === 'string' ? t : String((t as any)?.id ?? t)))
          : undefined,
        type: typeof manifest.type === 'string' ? manifest.type : 'react-remote',
      };
    }
  }

  const theme = await InformaticTheme.create({
    _id: newId,
    name: name.trim(),
    description,
    slug,
    plan,
    price: price || 0,
    version: version || '1.0.0',
    tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    s3Assets,
    manifestSummary,
    uploadBy: new Types.ObjectId(userId),
  });

  try {
    await deleteS3Keys(stagingKeys);
  } catch (delErr) {
    console.warn('[createInformaticThemeFromS3] Failed to delete staging keys:', delErr);
  }

  const populated = await InformaticTheme.findById(theme._id).populate('uploadBy', 'name email');

  logActivity(req, {
    action: 'informatic_theme_upload',
    entityType: 'informatic_theme',
    entityId: theme._id.toString(),
    entityName: name,
    summary: `Uploaded Informatic theme "${name}" via S3`,
    details: { themeId: theme._id.toString(), slug, plan, version: version || '1.0.0' },
  }).catch(() => {});

  res.status(201).json({
    success: true,
    data: populated ? formatInformaticThemeForClient(populated, apiBaseFromReq(req)) : null,
    message: 'Informatic theme created successfully',
  });
});

/**
 * POST /api/informatic-themes/import-zip (multipart, field: `file`)
 *
 * One-shot import: unzip → convert static HTML into an editor-compatible
 * pack (schema/default-config/manifest/theme.js/theme.css) → upload to the
 * catalog S3 layout → register the InformaticTheme doc.
 */
export const importInformaticThemeZip = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) {
    throw new CustomError('Unauthorized', 401);
  }

  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file?.buffer?.length) {
    throw new CustomError('A theme .zip file is required (multipart field `file`).', 400);
  }

  const { name, description, plan, price, version, tags } = req.body as {
    name?: string;
    description?: string;
    plan?: string;
    price?: string | number;
    version?: string;
    tags?: string;
  };

  if (!name?.trim() || !plan) {
    throw new CustomError('name and plan are required', 400);
  }

  const newId = new Types.ObjectId();
  const slug = makeSlug(name);

  let imported;
  try {
    imported = await importInformaticThemeFromZipBuffer(
      file.buffer,
      newId.toString(),
      name.trim(),
      apiBaseFromReq(req)
    );
  } catch (err: any) {
    if (err instanceof CustomError) throw err;
    throw new CustomError(
      `Theme import failed: ${err?.message || 'unknown error'}`,
      500
    );
  }

  const priceNum = Number(price);
  const theme = await InformaticTheme.create({
    _id: newId,
    name: name.trim(),
    description,
    slug,
    plan,
    price: Number.isFinite(priceNum) ? priceNum : 0,
    version: version || '1.0.0',
    tags: tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
    s3Assets: imported.s3Assets,
    manifestSummary: imported.manifestSummary,
    uploadBy: new Types.ObjectId(userId),
  });

  const populated = await InformaticTheme.findById(theme._id).populate('uploadBy', 'name email');

  logActivity(req, {
    action: 'informatic_theme_import_zip',
    entityType: 'informatic_theme',
    entityId: theme._id.toString(),
    entityName: name,
    summary: `Imported Informatic theme "${name}" from zip`,
    details: {
      themeId: theme._id.toString(),
      slug,
      plan,
      version: version || '1.0.0',
      warnings: imported.warnings,
      conversion: imported.conversionReport,
    },
  }).catch(() => {});

  res.status(201).json({
    success: true,
    data: populated ? formatInformaticThemeForClient(populated, apiBaseFromReq(req)) : null,
    conversion: imported.conversionReport,
    warnings: imported.warnings,
    message: 'Informatic theme imported and converted successfully',
  });
});

/**
 * POST /api/informatic-themes/import-folder (multipart, field: `files[]`)
 *
 * Same conversion pipeline as import-zip for an unzipped folder upload: each
 * multipart file carries its folder-relative path (webkitRelativePath from the
 * browser directory picker), the tree is rebuilt server-side and converted.
 */
export const importInformaticThemeFolder = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) {
    throw new CustomError('Unauthorized', 401);
  }

  const files = (req as Request & { files?: Express.Multer.File[] }).files ?? [];
  if (!files.length) {
    throw new CustomError('Theme folder files are required (multipart field `files`).', 400);
  }

  const { name, description, plan, price, version, tags } = req.body as {
    name?: string;
    description?: string;
    plan?: string;
    price?: string | number;
    version?: string;
    tags?: string;
  };

  if (!name?.trim() || !plan) {
    throw new CustomError('name and plan are required', 400);
  }

  const newId = new Types.ObjectId();
  const slug = makeSlug(name);

  let imported;
  try {
    imported = await importInformaticThemeFromFileList(
      files.map((f) => ({ name: f.originalname, buffer: f.buffer })),
      newId.toString(),
      name.trim(),
      apiBaseFromReq(req)
    );
  } catch (err: any) {
    if (err instanceof CustomError) throw err;
    throw new CustomError(
      `Theme import failed: ${err?.message || 'unknown error'}`,
      500
    );
  }

  const priceNum = Number(price);
  const theme = await InformaticTheme.create({
    _id: newId,
    name: name.trim(),
    description,
    slug,
    plan,
    price: Number.isFinite(priceNum) ? priceNum : 0,
    version: version || '1.0.0',
    tags: tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
    s3Assets: imported.s3Assets,
    manifestSummary: imported.manifestSummary,
    uploadBy: new Types.ObjectId(userId),
  });

  const populated = await InformaticTheme.findById(theme._id).populate('uploadBy', 'name email');

  logActivity(req, {
    action: 'informatic_theme_import_folder',
    entityType: 'informatic_theme',
    entityId: theme._id.toString(),
    entityName: name,
    summary: `Imported Informatic theme "${name}" from folder`,
    details: {
      themeId: theme._id.toString(),
      slug,
      plan,
      version: version || '1.0.0',
      warnings: imported.warnings,
      conversion: imported.conversionReport,
    },
  }).catch(() => {});

  res.status(201).json({
    success: true,
    data: populated ? formatInformaticThemeForClient(populated, apiBaseFromReq(req)) : null,
    conversion: imported.conversionReport,
    warnings: imported.warnings,
    message: 'Informatic theme imported and converted successfully',
  });
});

export const deleteInformaticTheme = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const theme = await InformaticTheme.findById(id);
  if (!theme) {
    throw new CustomError('Informatic theme not found', 404);
  }
  theme.isActive = false;
  await theme.save();
  dropEditorPackCache(id);
  res.json({ success: true, message: 'Informatic theme deactivated' });
});

// Editor-pack payloads are immutable per theme — s3Assets are only assigned
// at import time and never mutated — so the raw S3 reads can be cached
// indefinitely. Cache misses are coalesced so concurrent editor loads share
// one upstream read instead of tripling S3 calls.
const editorPackCache = new Map<
  string,
  { at: number; schema: unknown; config: unknown; manifest: unknown }
>();
const editorPackInflight = new Map<
  string,
  Promise<{ schema: unknown; config: unknown; manifest: unknown }>
>();
const EDITOR_PACK_CACHE_TTL_MS = 30 * 60 * 1000;

function dropEditorPackCache(themeId: string): void {
  editorPackCache.delete(themeId);
  editorPackInflight.delete(themeId);
}

async function loadEditorPackJson(id: string, s3: ReturnType<typeof withResolvedS3Urls>) {
  const fetchJson = async (key?: string) => {
    if (!key) return null;
    return readS3JsonObject(key);
  };
  const [schema, config, manifest] = await Promise.all([
    fetchJson(s3.reactThemeSchema?.key),
    fetchJson(s3.reactThemeDefaultConfig?.key),
    fetchJson(s3.reactThemeManifest?.key),
  ]);
  return { schema, config, manifest };
}

async function getEditorPackJson(id: string, s3: ReturnType<typeof withResolvedS3Urls>) {
  const hit = editorPackCache.get(id);
  if (hit && Date.now() - hit.at < EDITOR_PACK_CACHE_TTL_MS) return hit;
  const inflight = editorPackInflight.get(id);
  if (inflight) return inflight;
  const p = loadEditorPackJson(id, s3)
    .then((pack) => {
      editorPackCache.set(id, { at: Date.now(), ...pack });
      editorPackInflight.delete(id);
      return pack;
    })
    .catch((e) => {
      editorPackInflight.delete(id);
      throw e;
    });
  editorPackInflight.set(id, p);
  return p;
}

export const getInformaticThemeEditorPack = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const theme = await InformaticTheme.findById(id).lean();
  if (!theme || !theme.isActive) {
    throw new CustomError('Informatic theme not found', 404);
  }
  const apiBase = apiBaseFromReq(req);
  const s3 = withResolvedS3Urls(theme.s3Assets ?? {}, id, apiBase);

  const { schema, config, manifest } = await getEditorPackJson(id, s3);

  res.json({
    success: true,
    data: {
      theme: formatInformaticThemeForClient(theme, apiBase),
      schema,
      config: rewriteCatalogS3Urls(config, id, apiBase),
      manifest: rewriteCatalogS3Urls(manifest, id, apiBase),
      assets: {
        themeJsUrl: s3.reactThemeJs?.url ?? null,
        themeCssUrl: s3.reactThemeCss?.url ?? null,
      },
    },
  });
});

function injectHtmlBaseHref(html: string, baseHref: string): string {
  const base = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  const baseTag = `<base href="${base}">`;
  let out = html;
  // Rewrite root-absolute asset paths first so the injected <base> tag's own
  // href is never touched by the attribute rewrites below.
  out = out.replace(
    /\b(src|href|poster)=(["'])\/(?!\/)([^"']*)\2/gi,
    (_m, attr: string, q: string, p: string) => `${attr}=${q}${base}${p}${q}`
  );
  out = out.replace(
    /url\(\s*(['"]?)\/(?!\/)([^)"']+)\1\s*\)/gi,
    (_m, q: string, p: string) => `url(${q}${base}${p}${q})`
  );
  if (/<base\b[^>]*>/i.test(out)) {
    out = out.replace(/<base\b[^>]*>/i, baseTag);
  } else if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n    ${baseTag}`);
  } else {
    out = `${baseTag}\n${out}`;
  }
  return out;
}

/** Serve catalog static preview (pre-uploaded content folder on S3). */
export const getInformaticThemePreview = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new CustomError('Theme ID is required', 400);

  const theme = await InformaticTheme.findById(id).lean();
  if (!theme || !theme.isActive) {
    throw new CustomError('Informatic theme not found', 404);
  }

  const s3 = withResolvedS3Urls(theme.s3Assets ?? {});
  const contentPrefix = s3.contentRoot?.prefix;
  if (!contentPrefix) {
    throw new CustomError('Theme preview not available — no static content uploaded', 404);
  }

  const root = contentPrefix.endsWith('/') ? contentPrefix : `${contentPrefix}/`;
  const indexKey = `${root}index.html`;
  const htmlContent = await readS3Utf8Object(indexKey);
  if (!htmlContent) {
    throw new CustomError('Theme preview not available — index.html not found', 404);
  }

  // Point relative assets at the preview wildcard route — S3 objects are
  // private, so browsers must fetch CSS/JS/images through the backend.
  const baseHref = `/api/informatic-themes/preview/${id}/`;
  const patched = injectHtmlBaseHref(htmlContent, baseHref);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.send(patched);
});

/** Stream static preview assets from the private catalog prefix on S3. */
export const serveInformaticThemePreviewFiles = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const filePath = (req.params as { 0?: string })[0];
  if (!id) throw new CustomError('Theme ID is required', 400);
  if (!filePath) throw new CustomError('File path is required', 400);

  const theme = await InformaticTheme.findById(id).lean();
  if (!theme || !theme.isActive) {
    throw new CustomError('Informatic theme not found', 404);
  }

  const rel = String(filePath).replace(/^\/+/, '').replace(/\\/g, '/');
  if (!rel || rel.split('/').includes('..')) {
    throw new CustomError('Access denied', 403);
  }

  const s3 = withResolvedS3Urls(theme.s3Assets ?? {});
  const contentPrefix = s3.contentRoot?.prefix;
  if (!contentPrefix) {
    throw new CustomError('File not found', 404);
  }

  const root = contentPrefix.endsWith('/') ? contentPrefix : `${contentPrefix}/`;
  const encodedRel = rel.split('/').map(encodeURIComponent).join('/');

  // HTML sub-pages (e.g. packages.html navigated to from index.html) get the
  // same <base> injection as the index so their relative assets/links keep
  // resolving through this private preview route.
  if (/\.html?$/i.test(rel)) {
    let htmlContent: string | null = null;
    for (const key of [`${root}${rel}`, `${root}${encodedRel}`]) {
      htmlContent = await readS3Utf8Object(key);
      if (htmlContent) break;
    }
    if (!htmlContent) throw new CustomError('File not found', 404);
    const patched = injectHtmlBaseHref(htmlContent, `/api/informatic-themes/preview/${id}/`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    return res.send(patched);
  }

  await streamS3ObjectToResponse([`${root}${rel}`, `${root}${encodedRel}`], res);
});

/**
 * Publicly stream any file stored under `informatic-themes/catalog/<id>/`
 * (theme/, remote-theme-dist/, thumbnail/). Catalog objects are private on
 * S3, so all browser-facing asset URLs point at this route.
 */
export const serveInformaticThemeFile = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const filePath = (req.params as { 0?: string })[0];
  if (!id) throw new CustomError('Theme ID is required', 400);
  if (!filePath) throw new CustomError('File path is required', 400);

  const theme = await InformaticTheme.findById(id).lean();
  if (!theme || !theme.isActive) {
    throw new CustomError('Informatic theme not found', 404);
  }

  const rel = String(filePath).replace(/^\/+/, '').replace(/\\/g, '/');
  if (!rel || rel.split('/').includes('..')) {
    throw new CustomError('Access denied', 403);
  }

  const encodedRel = rel.split('/').map(encodeURIComponent).join('/');
  await streamS3ObjectToResponse(
    [
      `${INFORMATIC_CATALOG_ROOT}/${id}/${rel}`,
      `${INFORMATIC_CATALOG_ROOT}/${id}/${encodedRel}`,
    ],
    res
  );
});
