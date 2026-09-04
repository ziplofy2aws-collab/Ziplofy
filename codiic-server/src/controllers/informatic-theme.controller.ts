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
  promoteInformaticFolderUploadToCatalog,
  publicObjectUrlForKey,
} from '../utils/informatic-theme-s3-ingest';
import { readS3JsonObject, readS3Utf8Object } from '../utils/theme-s3-ingest';

function makeSlug(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'informatic-theme';
  return `${base}-${uuidv4().slice(0, 8)}`;
}

function withResolvedS3Urls(s3: Record<string, any>) {
  const out = { ...s3 };
  for (const field of [
    'reactThemeJs',
    'reactThemeCss',
    'reactThemeSchema',
    'reactThemeDefaultConfig',
    'reactThemeManifest',
    'thumbnail',
  ] as const) {
    const part = out[field];
    if (part?.key && !part.url) {
      out[field] = { ...part, url: publicObjectUrlForKey(part.key) };
    }
  }
  return out;
}

export function formatInformaticThemeForClient(theme: any) {
  const obj = theme?.toObject ? theme.toObject() : { ...theme };
  const s3 = withResolvedS3Urls(obj.s3Assets ?? {});
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
    data: docs.map((t) => formatInformaticThemeForClient(t)),
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
  res.json({ success: true, data: formatInformaticThemeForClient(theme) });
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
    data: populated ? formatInformaticThemeForClient(populated) : null,
    message: 'Informatic theme created successfully',
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
  res.json({ success: true, message: 'Informatic theme deactivated' });
});

export const getInformaticThemeEditorPack = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const theme = await InformaticTheme.findById(id).lean();
  if (!theme || !theme.isActive) {
    throw new CustomError('Informatic theme not found', 404);
  }
  const s3 = withResolvedS3Urls(theme.s3Assets ?? {});

  const fetchJson = async (key?: string) => {
    if (!key) return null;
    return readS3JsonObject(key);
  };

  const [schema, config, manifest] = await Promise.all([
    fetchJson(s3.reactThemeSchema?.key),
    fetchJson(s3.reactThemeDefaultConfig?.key),
    fetchJson(s3.reactThemeManifest?.key),
  ]);

  res.json({
    success: true,
    data: {
      theme: formatInformaticThemeForClient(theme),
      schema,
      config,
      manifest,
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
  if (/<base\b[^>]*>/i.test(out)) {
    out = out.replace(/<base\b[^>]*>/i, baseTag);
  } else if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n    ${baseTag}`);
  } else {
    out = `${baseTag}\n${out}`;
  }
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

  const baseHref = publicObjectUrlForKey(root);
  const patched = injectHtmlBaseHref(htmlContent, baseHref);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.send(patched);
});

/** Redirect static asset requests to public S3 URLs for catalog preview. */
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
  if (!rel || rel.includes('..')) {
    throw new CustomError('Access denied', 403);
  }

  const s3 = withResolvedS3Urls(theme.s3Assets ?? {});
  const contentPrefix = s3.contentRoot?.prefix;
  if (!contentPrefix) {
    throw new CustomError('File not found', 404);
  }

  const root = contentPrefix.endsWith('/') ? contentPrefix : `${contentPrefix}/`;
  const publicUrl = publicObjectUrlForKey(`${root}${rel}`);
  return res.redirect(302, publicUrl);
});
