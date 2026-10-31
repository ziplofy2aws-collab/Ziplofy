import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { awsBucket as bucketName, awsRegion, s3Client } from '../utils/s3-client';
import { stagingThemeFileKey } from '../utils/theme-s3-ingest';
import { informaticStagingPrefix, informaticStagingThemeFileKey } from '../utils/informatic-theme-s3-ingest';
import { env } from '../utils/env.utils';

// ── Local-disk upload sink (dev only) ────────────────────────────
// When AWS creds are placeholders ('local'/'placeholder'), presigned PUTs are
// redirected to PUT /api/aws/local-upload?key=... and files are served from
// GET /uploads/<key>. Lets the image picker work with no AWS account.
export const LOCAL_DISK_UPLOADS = ['local', 'placeholder', ''].includes(
  String(env.AWS_ACCESS_KEY_ID || '').trim().toLowerCase()
);
export const LOCAL_UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

const requestOrigin = (req: Request): string => {
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  return `${proto}://${req.get('host')}`;
};

// Uniform responder for every presigned-URL branch. In local mode the browser
// PUTs straight back to this server; otherwise it gets the real S3 URL.
const respondWithUploadTarget = async (
  req: Request,
  res: Response,
  opts: { key: string; contentType: string; expiresInSeconds: number }
): Promise<Response> => {
  const awsBucket = bucketName;
  let signedUrl: string;
  let objectUrl: string;
  if (LOCAL_DISK_UPLOADS) {
    const origin = requestOrigin(req);
    signedUrl = `${origin}/api/aws/local-upload?key=${encodeURIComponent(opts.key)}`;
    objectUrl = `${origin}/uploads/${opts.key.split('/').map(encodeURIComponent).join('/')}`;
  } else {
    const command = new PutObjectCommand({ Bucket: awsBucket, Key: opts.key, ContentType: opts.contentType });
    signedUrl = await getSignedUrl(s3Client, command, { expiresIn: opts.expiresInSeconds });
    objectUrl = `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${opts.key}`;
  }
  return res.status(200).json({
    success: true,
    message: 'Signed URL generated',
    data: {
      signedUrl,
      key: opts.key,
      bucket: awsBucket,
      region: awsRegion,
      method: 'PUT' as const,
      contentType: opts.contentType,
      expiresInSeconds: opts.expiresInSeconds,
      objectUrl,
    },
  });
};

const safeLocalKey = (raw: unknown): string | null => {
  const key = String(raw || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!key || key.length > 600) return null;
  if (key.split('/').some((seg) => seg === '..' || seg === '')) return null;
  return key;
};

// PUT /api/aws/local-upload?key=... — dev-only file sink. Mounted before
// `protect` in the router; guarded here by LOCAL_DISK_UPLOADS anyway.
export const localDiskUpload = asyncErrorHandler(async (req: Request, res: Response) => {
  if (!LOCAL_DISK_UPLOADS) throw new CustomError('Local disk uploads are disabled', 404);
  const key = safeLocalKey(req.query.key);
  if (!key) throw new CustomError('Invalid key', 400);
  const dest = path.join(LOCAL_UPLOAD_ROOT, key);
  if (!dest.startsWith(LOCAL_UPLOAD_ROOT + path.sep)) throw new CustomError('Invalid key', 400);
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  if (Buffer.isBuffer(req.body)) {
    await fs.promises.writeFile(dest, req.body);
  } else {
    await new Promise<void>((resolve, reject) => {
      const ws = fs.createWriteStream(dest);
      req.pipe(ws);
      req.on('error', reject);
      ws.on('error', reject);
      ws.on('finish', () => resolve());
    });
  }
  return res.status(200).json({ success: true, key });
});

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const sanitizeFilename = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const extractS3KeyFromUrl = (imageUrl: string): string | null => {
  try {
    const parsed = new URL(imageUrl);
    let key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    // Local-disk URLs are /uploads/<key> — strip the mount prefix
    if (key.startsWith('uploads/')) key = key.slice('uploads/'.length);
    return key || null;
  } catch {
    return null;
  }
};

export const generateImageUploadSignedUrl = asyncErrorHandler(async (req: Request, res: Response) => {
  const awsBucket = bucketName;

  const { fileName, fileType, folder = 'uploads/images', expiresInSeconds = 900 } = req.body as {
    fileName?: string;
    fileType?: string;
    folder?: string;
    expiresInSeconds?: number;
  };

  if (!fileName || typeof fileName !== 'string') {
    throw new CustomError('fileName is required', 400);
  }
  if (!fileType || typeof fileType !== 'string') {
    throw new CustomError('fileType is required', 400);
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.has(fileType)) {
    throw new CustomError('Unsupported fileType. Only image MIME types are allowed.', 400);
  }

  const safeExpires = Math.min(Math.max(Number(expiresInSeconds) || 900, 60), 3600);
  const parsedFolder = typeof folder === 'string' && folder.trim() ? folder.trim() : 'uploads/images';
  const extension = path.extname(fileName) || '';
  const baseName = sanitizeFilename(path.basename(fileName, extension)) || 'image';
  const key = `${parsedFolder.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${randomUUID()}-${baseName}${extension}`;

  return respondWithUploadTarget(req, res, { key, contentType: fileType, expiresInSeconds: safeExpires });
});

const THEME_ZIP_MIMES = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
]);
const THEME_JS_MIMES = new Set(['application/javascript', 'text/javascript']);
const THEME_CSS_MIMES = new Set(['text/css']);

/** Presigned PUT for admin theme pipeline: browser uploads directly to S3, then POST /themes/from-s3 finalizes. */
export const generateThemeUploadSignedUrl = asyncErrorHandler(async (req: Request, res: Response) => {
  const awsBucket = bucketName;
  const userId = req.user?.id;
  if (!userId || typeof userId !== 'string') {
    throw new CustomError('Unauthorized', 401);
  }

  const body = req.body as {
    sessionId?: string;
    fileName?: string;
    fileType?: string;
    assetKind?: 'zip' | 'thumbnail' | 'reactJs' | 'reactCss' | 'themeSchema' | 'themeDefaultConfig' | 'themeManifest' | 'themeFile';
    relativePath?: string;
    expiresInSeconds?: number;
    /** catalog (default) = ecommerce themes; informatic = content themes for webpanel */
    themePipeline?: 'catalog' | 'informatic';
  };

  const { sessionId, fileName, fileType, assetKind, expiresInSeconds = 900 } = body;
  const isInformatic = body.themePipeline === 'informatic';
  const stagingRoot = isInformatic ? 'informatic-themes/staging' : 'themes/staging';
  const stagingSessionPrefix = (uid: string, sid: string) => `${stagingRoot}/${uid}/${sid}/`;

  if (!sessionId || typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(sessionId)) {
    throw new CustomError(
      'sessionId is required (8-80 chars: letters, numbers, hyphens). Generate one UUID per upload batch.',
      400
    );
  }
  if (!fileName || typeof fileName !== 'string') {
    throw new CustomError('fileName is required', 400);
  }
  if (!fileType || typeof fileType !== 'string') {
    throw new CustomError('fileType is required', 400);
  }
  if (
    !assetKind ||
    ![
      'zip',
      'thumbnail',
      'reactJs',
      'reactCss',
      'themeSchema',
      'themeDefaultConfig',
      'themeManifest',
      'themeFile',
    ].includes(assetKind)
  ) {
    throw new CustomError(
      'assetKind must be zip | thumbnail | reactJs | reactCss | themeSchema | themeDefaultConfig | themeManifest | themeFile',
      400
    );
  }

  const safeExpires = Math.min(Math.max(Number(expiresInSeconds) || 900, 60), 3600);

  const isAllowedThemeStaticMime = (ct: string): boolean => {
    const t = (ct || '').trim().toLowerCase();
    if (!t || t === 'application/octet-stream') return true;
    if (t.startsWith('text/') || t.startsWith('image/') || t.startsWith('font/') || t.startsWith('video/')) {
      return true;
    }
    return ['application/json', 'application/javascript', 'application/wasm'].includes(t);
  };

  if (assetKind === 'themeFile') {
    const rp = body.relativePath;
    if (!rp || typeof rp !== 'string') {
      throw new CustomError('relativePath is required for themeFile (path within the theme folder)', 400);
    }
    if (!fileName || typeof fileName !== 'string') {
      throw new CustomError('fileName is required', 400);
    }
    if (!isAllowedThemeStaticMime(fileType)) {
      throw new CustomError('Unsupported fileType for themeFile upload.', 400);
    }
    const ct = fileType.trim() || 'application/octet-stream';
    const key = isInformatic
      ? informaticStagingThemeFileKey(userId, sessionId, rp)
      : stagingThemeFileKey(userId, sessionId, rp);
    return respondWithUploadTarget(req, res, { key, contentType: ct, expiresInSeconds: safeExpires });
  }

  let contentType = fileType;
  const ext = path.extname(fileName).toLowerCase();

  if (assetKind === 'zip') {
    if (ext !== '.zip') {
      throw new CustomError('ZIP upload must use a .zip file name.', 400);
    }
    if (!THEME_ZIP_MIMES.has(fileType)) {
      throw new CustomError('Unsupported ZIP MIME type.', 400);
    }
    if (fileType === 'application/octet-stream') {
      contentType = 'application/zip';
    }
    const base = sanitizeFilename(path.basename(fileName, ext)) || 'liquid-theme';
    const key = `${stagingSessionPrefix(userId, sessionId)}${base}${ext}`;
    return respondWithUploadTarget(req, res, { key, contentType, expiresInSeconds: safeExpires });
  }

  if (assetKind === 'thumbnail') {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(fileType)) {
      throw new CustomError('Thumbnail must be a supported image MIME type.', 400);
    }
    const extension = ext || (fileType.includes('png') ? '.png' : fileType.includes('webp') ? '.webp' : '.jpg');
    const base = sanitizeFilename(path.basename(fileName, ext)) || 'thumbnail';
    const key = `${stagingSessionPrefix(userId, sessionId)}thumb-${randomUUID()}-${base}${extension}`;
    return respondWithUploadTarget(req, res, { key, contentType: fileType, expiresInSeconds: safeExpires });
  }

  if (assetKind === 'reactJs') {
    if (ext !== '.js') {
      throw new CustomError('Remote theme JS must be a .js file.', 400);
    }
    let ct = (fileType && fileType.trim()) || 'application/javascript';
    if (ct === 'application/octet-stream') ct = 'application/javascript';
    if (!THEME_JS_MIMES.has(ct)) {
      throw new CustomError('Unsupported JavaScript MIME type for reactJs.', 400);
    }
    const key = `${stagingSessionPrefix(userId, sessionId)}remote-theme-${randomUUID()}.js`;
    return respondWithUploadTarget(req, res, { key, contentType: ct, expiresInSeconds: safeExpires });
  }

  const jsonThemeAssetKinds = ['themeSchema', 'themeDefaultConfig', 'themeManifest'] as const;
  if (jsonThemeAssetKinds.includes(assetKind as (typeof jsonThemeAssetKinds)[number])) {
    if (ext !== '.json') {
      throw new CustomError('Theme metadata files must be .json', 400);
    }
    const fixedName =
      assetKind === 'themeSchema'
        ? 'theme.schema.json'
        : assetKind === 'themeDefaultConfig'
          ? 'theme.default-config.json'
          : 'theme.manifest.json';
    let ct = (fileType && fileType.trim()) || 'application/json';
    if (ct === 'application/octet-stream') ct = 'application/json';
    const key = `${stagingSessionPrefix(userId, sessionId)}${fixedName}`;
    return respondWithUploadTarget(req, res, { key, contentType: ct, expiresInSeconds: safeExpires });
  }

  // reactCss
  if (ext !== '.css') {
    throw new CustomError('Remote theme CSS must be a .css file.', 400);
  }
  let ctCss = (fileType && fileType.trim()) || 'text/css';
  if (ctCss === 'application/octet-stream') ctCss = 'text/css';
  if (!THEME_CSS_MIMES.has(ctCss)) {
    throw new CustomError('Unsupported CSS MIME type.', 400);
  }
  const key = `${stagingSessionPrefix(userId, sessionId)}remote-theme-${randomUUID()}.css`;
  return respondWithUploadTarget(req, res, { key, contentType: ctCss, expiresInSeconds: safeExpires });
});

export const deleteImagesFromS3 = asyncErrorHandler(async (req: Request, res: Response) => {
  const awsBucket = bucketName;
  const { imageUrls, imageKeys } = req.body as { imageUrls?: string[]; imageKeys?: string[] };

  const normalizedImageKeys = Array.isArray(imageKeys)
    ? imageKeys
        .map((key) => (typeof key === 'string' ? key.trim() : ''))
        .filter(Boolean)
    : [];

  const normalizedImageUrls = Array.isArray(imageUrls)
    ? imageUrls
        .map((url) => (typeof url === 'string' ? url.trim() : ''))
        .filter(Boolean)
    : [];

  if (normalizedImageKeys.length === 0 && normalizedImageUrls.length === 0) {
    throw new CustomError('Provide a non-empty imageKeys or imageUrls array', 400);
  }

  const parsedKeysFromUrls = normalizedImageUrls
    .map((url) => extractS3KeyFromUrl(url))
    .filter((key): key is string => Boolean(key));
  const keys = Array.from(new Set([...normalizedImageKeys, ...parsedKeysFromUrls]));

  if (keys.length === 0) {
    throw new CustomError('No valid S3 image keys found from payload', 400);
  }

  if (LOCAL_DISK_UPLOADS) {
    const deletedKeys: string[] = [];
    for (const key of keys) {
      const safe = safeLocalKey(key);
      if (!safe) continue;
      const dest = path.join(LOCAL_UPLOAD_ROOT, safe);
      if (dest.startsWith(LOCAL_UPLOAD_ROOT + path.sep)) {
        await fs.promises.unlink(dest).then(() => deletedKeys.push(safe)).catch(() => {});
      }
    }
    return res.status(200).json({
      success: true,
      message: 'Images deleted from local storage',
      data: { deletedKeys, deletedCount: deletedKeys.length },
    });
  }

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: awsBucket,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
      Quiet: false,
    },
  });

  const deleteResult = await s3Client.send(deleteCommand);
  const deletedKeys = (deleteResult.Deleted || []).map((item) => item.Key).filter(Boolean);
  const failedDeletes = (deleteResult.Errors || []).map((err) => ({
    key: err.Key,
    code: err.Code,
    message: err.Message,
  }));

  if (failedDeletes.length > 0) {
    const details = failedDeletes
      .map((item) => `${item.key || 'unknown-key'} [${item.code || 'UNKNOWN'}: ${item.message || 'No message'}]`)
      .join(', ');
    throw new CustomError(
      `Failed to delete one or more images from S3: ${details}`,
      500
    );
  }

  return res.status(200).json({
    success: true,
    message: 'Images deleted from S3',
    data: {
      deletedKeys,
      deletedCount: deletedKeys.length,
    },
  });
});
