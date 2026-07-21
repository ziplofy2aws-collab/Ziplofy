import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import type { Readable } from 'stream';
import { CustomError } from './error.utils';
import { awsBucket, awsRegion, s3Client } from './s3-client';

export function stagingPrefix(userId: string, sessionId: string): string {
  return `themes/staging/${userId}/${sessionId}/`;
}

/** Staging prefix for multi-file static themes (HTML/CSS/JS tree under `theme/`). */
export function stagingThemeFilesPrefix(userId: string, sessionId: string): string {
  return `${stagingPrefix(userId, sessionId)}theme/`;
}

/** Deterministic S3 key for one file under the staging `theme/` folder. */
export function stagingThemeFileKey(userId: string, sessionId: string, relativePath: string): string {
  const rel = sanitizeThemeRelativePath(relativePath);
  const encodedRel = rel.split('/').map((seg) => encodeURIComponent(seg)).join('/');
  return `${stagingThemeFilesPrefix(userId, sessionId)}${encodedRel}`;
}

/** Normalize and validate a relative path inside a theme folder (no `..`, no NUL). */
export function sanitizeThemeRelativePath(raw: string): string {
  const n = String(raw || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .trim();
  if (!n || n.length > 2048) {
    throw new CustomError('Invalid relativePath (empty or too long)', 400);
  }
  const segs = n.split('/').filter(Boolean);
  for (const s of segs) {
    if (s === '.' || s === '..') {
      throw new CustomError('Invalid relativePath (path traversal)', 400);
    }
    if (/[\x00-\x1f]/.test(s)) {
      throw new CustomError('Invalid relativePath', 400);
    }
  }
  return segs.join('/');
}

export function assertStagingThemeFolderKeys(
  files: { key: string }[],
  userId: string,
  sessionId: string
): string[] {
  const prefix = stagingThemeFilesPrefix(userId, sessionId);
  const keys: string[] = [];
  for (const f of files) {
    if (!f.key || typeof f.key !== 'string' || !f.key.startsWith(prefix)) {
      throw new CustomError('Invalid S3 key: theme file must belong to your staging theme/ prefix.', 403);
    }
    keys.push(f.key);
  }
  return keys;
}

/** Folder theme files + optional thumbnail / remote dist keys under the same staging session. */
export function assertStagingFolderAndAuxiliaryKeys(
  files: { key: string }[],
  aux: {
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  },
  userId: string,
  sessionId: string
): string[] {
  const fileKeys = assertStagingThemeFolderKeys(files, userId, sessionId);
  const prefix = stagingPrefix(userId, sessionId);
  const auxKeys = [
    aux.thumbnailKey,
    aux.reactJsKey,
    aux.reactCssKey,
    aux.themeSchemaKey,
    aux.themeDefaultConfigKey,
    aux.themeManifestKey,
  ].filter(
    (k): k is string => typeof k === 'string' && k.length > 0
  );
  for (const k of auxKeys) {
    if (!k.startsWith(prefix)) {
      throw new CustomError('Invalid S3 key: must belong to your staging upload session.', 403);
    }
  }
  return [...fileKeys, ...auxKeys];
}

/** Ensures every non-empty key starts with the caller's staging prefix; returns defined keys. */
export function assertStagingKeys(
  keys: {
    zipKey: string;
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  },
  userId: string,
  sessionId: string
): string[] {
  const prefix = stagingPrefix(userId, sessionId);
  const all = [
    keys.zipKey,
    keys.thumbnailKey,
    keys.reactJsKey,
    keys.reactCssKey,
    keys.themeSchemaKey,
    keys.themeDefaultConfigKey,
    keys.themeManifestKey,
  ].filter(
    (k): k is string => typeof k === 'string' && k.length > 0
  );
  for (const k of all) {
    if (!k.startsWith(prefix)) {
      throw new CustomError('Invalid S3 key: must belong to your staging upload session.', 403);
    }
  }
  return all;
}

export async function downloadS3KeyToFile(key: string, destPath: string): Promise<void> {
  const res = await s3Client.send(new GetObjectCommand({ Bucket: awsBucket, Key: key }));
  const body = res.Body;
  if (!body) {
    throw new CustomError('Empty or missing S3 object', 500);
  }
  const rs = body as Readable;
  await pipeline(rs, fs.createWriteStream(destPath));
}

/** Read and parse a JSON object from S3 (theme.schema / default-config / manifest). */
export async function readS3JsonObject<T = Record<string, unknown>>(key: string): Promise<T | null> {
  try {
    const res = await s3Client.send(new GetObjectCommand({ Bucket: awsBucket, Key: key }));
    const body = res.Body;
    if (!body) return null;
    const chunks: Buffer[] = [];
    const rs = body as Readable;
    for await (const chunk of rs) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    const parsed = JSON.parse(raw) as T;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function publicObjectUrlForKey(key: string): string {
  return `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${key}`;
}

export type ThemeContentRoot = { prefix: string; fileCount: number; uploadedAt: Date };

export type ThemeCatalogS3Assets = {
  /** When the catalog theme is a flat file tree (no single ZIP). */
  contentRoot?: ThemeContentRoot;
  zip?: { key: string; url: string; contentType: string; size: number; uploadedAt: Date };
  thumbnail?: { key: string; url: string; contentType: string; size: number; uploadedAt: Date };
  reactThemeJs?: { key: string; url: string; contentType: string; size: number; uploadedAt: Date };
  reactThemeCss?: { key: string; url: string; contentType: string; size: number; uploadedAt: Date };
  reactThemeSchema?: { key: string; url: string; contentType: string; size: number; uploadedAt: Date };
  reactThemeDefaultConfig?: { key: string; url: string; contentType: string; size: number; uploadedAt: Date };
  reactThemeManifest?: { key: string; url: string; contentType: string; size: number; uploadedAt: Date };
};

/** Copy an object to another key in the same bucket (used to promote staging → catalog). */
export async function copyS3ObjectSameBucket(srcKey: string, destKey: string): Promise<void> {
  const copySource = `${awsBucket}/${encodeURIComponent(srcKey).replace(/%2F/g, '/')}`;
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: awsBucket,
      CopySource: copySource,
      Key: destKey,
    })
  );
}

export async function headS3Object(key: string): Promise<{ size: number; contentType: string }> {
  const h = await s3Client.send(new HeadObjectCommand({ Bucket: awsBucket, Key: key }));
  return {
    size: Number(h.ContentLength ?? 0),
    contentType: (h.ContentType && h.ContentType.trim()) || 'application/octet-stream',
  };
}

function catalogZipBaseNameFromStagingKey(zipKey: string): string {
  return path.basename(zipKey).replace(/[^\w.\-]+/g, '_').replace(/^\.+/, '') || 'theme.zip';
}

export async function listAllObjectKeysUnderPrefix(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let ContinuationToken: string | undefined;
  const p = prefix.endsWith('/') ? prefix : `${prefix}/`;
  do {
    const resp = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: awsBucket,
        Prefix: p,
        ContinuationToken,
      })
    );
    for (const obj of resp.Contents ?? []) {
      if (obj.Key && !obj.Key.endsWith('/')) {
        keys.push(obj.Key);
      }
    }
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return keys;
}

/** Thumbnail + remote React dist only (ZIP or folder promotion composes this). */
export async function promoteStagingAuxiliaryToCatalog(
  themeId: string,
  keys: {
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  }
): Promise<
  Pick<
    ThemeCatalogS3Assets,
    | 'thumbnail'
    | 'reactThemeJs'
    | 'reactThemeCss'
    | 'reactThemeSchema'
    | 'reactThemeDefaultConfig'
    | 'reactThemeManifest'
  >
> {
  const base = `themes/catalog/${themeId}`;
  const distBase = `${base}/remote-theme-dist`;
  const stamp = () => new Date();
  const out: Pick<
    ThemeCatalogS3Assets,
    | 'thumbnail'
    | 'reactThemeJs'
    | 'reactThemeCss'
    | 'reactThemeSchema'
    | 'reactThemeDefaultConfig'
    | 'reactThemeManifest'
  > = {};

  if (keys.thumbnailKey) {
    const ext = path.extname(keys.thumbnailKey) || '.jpg';
    const destKey = `${base}/thumbnail/thumbnail${ext}`;
    await copyS3ObjectSameBucket(keys.thumbnailKey, destKey);
    const h = await headS3Object(destKey);
    out.thumbnail = {
      key: destKey,
      url: publicObjectUrlForKey(destKey),
      contentType: h.contentType,
      size: h.size,
      uploadedAt: stamp(),
    };
  }

  if (keys.reactJsKey) {
    const destKey = `${distBase}/theme.js`;
    await copyS3ObjectSameBucket(keys.reactJsKey, destKey);
    const h = await headS3Object(destKey);
    out.reactThemeJs = {
      key: destKey,
      url: publicObjectUrlForKey(destKey),
      contentType: 'application/javascript',
      size: h.size,
      uploadedAt: stamp(),
    };
  }

  if (keys.reactCssKey) {
    const destKey = `${base}/remote-theme-dist/theme.css`;
    await copyS3ObjectSameBucket(keys.reactCssKey, destKey);
    const h = await headS3Object(destKey);
    out.reactThemeCss = {
      key: destKey,
      url: publicObjectUrlForKey(destKey),
      contentType: 'text/css',
      size: h.size,
      uploadedAt: stamp(),
    };
  }

  if (keys.themeSchemaKey) {
    const destKey = `${distBase}/theme.schema.json`;
    await copyS3ObjectSameBucket(keys.themeSchemaKey, destKey);
    const h = await headS3Object(destKey);
    out.reactThemeSchema = {
      key: destKey,
      url: publicObjectUrlForKey(destKey),
      contentType: 'application/json',
      size: h.size,
      uploadedAt: stamp(),
    };
  }

  if (keys.themeDefaultConfigKey) {
    const destKey = `${distBase}/theme.default-config.json`;
    await copyS3ObjectSameBucket(keys.themeDefaultConfigKey, destKey);
    const h = await headS3Object(destKey);
    out.reactThemeDefaultConfig = {
      key: destKey,
      url: publicObjectUrlForKey(destKey),
      contentType: 'application/json',
      size: h.size,
      uploadedAt: stamp(),
    };
  }

  if (keys.themeManifestKey) {
    const destKey = `${distBase}/theme.manifest.json`;
    await copyS3ObjectSameBucket(keys.themeManifestKey, destKey);
    const h = await headS3Object(destKey);
    out.reactThemeManifest = {
      key: destKey,
      url: publicObjectUrlForKey(destKey),
      contentType: 'application/json',
      size: h.size,
      uploadedAt: stamp(),
    };
  }

  return out;
}

/**
 * Copy staged static theme files into `themes/catalog/{themeId}/theme/…`.
 */
export async function promoteStagingThemeFolderToCatalog(
  themeId: string,
  files: { key: string; relativePath: string }[]
): Promise<{ contentRoot: ThemeContentRoot }> {
  const base = `themes/catalog/${themeId}/theme/`;
  const stamp = new Date();
  let count = 0;
  for (const f of files) {
    const rel = sanitizeThemeRelativePath(f.relativePath);
    const destKey = `${base}${rel}`;
    await copyS3ObjectSameBucket(f.key, destKey);
    count += 1;
  }
  return {
    contentRoot: {
      prefix: base,
      fileCount: count,
      uploadedAt: stamp,
    },
  };
}

/**
 * Copy staged browser uploads into durable catalog keys under themes/catalog/{themeId}/…
 * (no local uploads/ directory).
 */
export async function promoteStagingThemeAssetsToCatalog(
  themeId: string,
  keys: {
    zipKey: string;
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  }
): Promise<ThemeCatalogS3Assets> {
  const base = `themes/catalog/${themeId}`;
  const stamp = () => new Date();

  const zipDestKey = `${base}/zipped/${catalogZipBaseNameFromStagingKey(keys.zipKey)}`;
  await copyS3ObjectSameBucket(keys.zipKey, zipDestKey);
  const zipHead = await headS3Object(zipDestKey);
  const aux = await promoteStagingAuxiliaryToCatalog(themeId, keys);
  const out: ThemeCatalogS3Assets = {
    zip: {
      key: zipDestKey,
      url: publicObjectUrlForKey(zipDestKey),
      contentType: 'application/zip',
      size: zipHead.size,
      uploadedAt: stamp(),
    },
    ...aux,
  };

  return out;
}

/** Keys to delete for a catalog theme (includes every object under `contentRoot` when present). */
export async function collectCatalogAssetKeysAsync(
  s3: Partial<ThemeCatalogS3Assets> | null | undefined
): Promise<string[]> {
  if (!s3) return [];
  const keys = [
    s3.zip?.key,
    s3.thumbnail?.key,
    s3.reactThemeJs?.key,
    s3.reactThemeCss?.key,
    s3.reactThemeSchema?.key,
    s3.reactThemeDefaultConfig?.key,
    s3.reactThemeManifest?.key,
  ].filter(
    (k): k is string => typeof k === 'string' && k.length > 0
  );
  if (s3.contentRoot?.prefix) {
    const under = await listAllObjectKeysUnderPrefix(s3.contentRoot.prefix);
    keys.push(...under);
  }
  return Array.from(new Set(keys));
}

export async function deleteS3Keys(keys: string[]): Promise<void> {
  const uniq = Array.from(new Set(keys.filter(Boolean)));
  if (uniq.length === 0) return;
  const chunkSize = 1000;
  for (let i = 0; i < uniq.length; i += chunkSize) {
    const slice = uniq.slice(i, i + chunkSize);
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: awsBucket,
        Delete: {
          Objects: slice.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
  }
}
