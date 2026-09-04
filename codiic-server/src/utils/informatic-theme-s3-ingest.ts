/**
 * S3 staging → catalog promotion for Informatic content themes.
 * Mirrors theme-s3-ingest.ts but uses informatic-themes/ prefix.
 */
import path from 'path';
import { CustomError } from './error.utils';
import {
  assertStagingKeys as assertCatalogStagingKeys,
  assertStagingFolderAndAuxiliaryKeys as assertCatalogFolderAndAuxiliaryKeys,
  copyS3ObjectSameBucket,
  deleteS3Keys,
  headS3Object,
  listAllObjectKeysUnderPrefix,
  publicObjectUrlForKey,
  promoteStagingAuxiliaryToCatalog as promoteCatalogAuxiliary,
  promoteStagingThemeFolderToCatalog as promoteCatalogFolder,
  resolveThemeContentRootSuffix,
  sanitizeThemeRelativePath,
  type ThemeCatalogS3Assets,
} from './theme-s3-ingest';

export const INFORMATIC_STAGING_ROOT = 'informatic-themes/staging';
export const INFORMATIC_CATALOG_ROOT = 'informatic-themes/catalog';

export function informaticStagingPrefix(userId: string, sessionId: string): string {
  return `${INFORMATIC_STAGING_ROOT}/${userId}/${sessionId}/`;
}

export function informaticStagingThemeFilesPrefix(userId: string, sessionId: string): string {
  return `${informaticStagingPrefix(userId, sessionId)}theme/`;
}

export function informaticStagingThemeFileKey(
  userId: string,
  sessionId: string,
  relativePath: string
): string {
  const rel = sanitizeThemeRelativePath(relativePath);
  const encodedRel = rel.split('/').map((seg) => encodeURIComponent(seg)).join('/');
  return `${informaticStagingThemeFilesPrefix(userId, sessionId)}${encodedRel}`;
}

export function assertInformaticStagingThemeFolderKeys(
  files: { key: string }[],
  userId: string,
  sessionId: string
): string[] {
  const prefix = informaticStagingThemeFilesPrefix(userId, sessionId);
  const keys: string[] = [];
  for (const f of files) {
    if (!f.key || typeof f.key !== 'string' || !f.key.startsWith(prefix)) {
      throw new CustomError('Invalid S3 key: theme file must belong to your Informatic staging prefix.', 403);
    }
    keys.push(f.key);
  }
  return keys;
}

export function assertInformaticStagingFolderAndAuxiliaryKeys(
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
  const fileKeys = assertInformaticStagingThemeFolderKeys(files, userId, sessionId);
  const prefix = informaticStagingPrefix(userId, sessionId);
  const auxKeys = [
    aux.thumbnailKey,
    aux.reactJsKey,
    aux.reactCssKey,
    aux.themeSchemaKey,
    aux.themeDefaultConfigKey,
    aux.themeManifestKey,
  ].filter((k): k is string => typeof k === 'string' && k.length > 0);
  for (const k of auxKeys) {
    if (!k.startsWith(prefix)) {
      throw new CustomError('Invalid S3 key: must belong to your Informatic staging session.', 403);
    }
  }
  return [...fileKeys, ...auxKeys];
}

async function promoteInformaticAuxiliaryToCatalog(
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
  const base = `${INFORMATIC_CATALOG_ROOT}/${themeId}`;
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
    const destKey = `${distBase}/theme.css`;
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

export async function promoteInformaticStagingFolderToCatalog(
  themeId: string,
  files: { key: string; relativePath: string }[]
): Promise<{ contentRoot: { prefix: string; fileCount: number; uploadedAt: Date } }> {
  const base = `${INFORMATIC_CATALOG_ROOT}/${themeId}/theme/`;
  const stamp = new Date();
  let count = 0;
  for (const f of files) {
    const rel = sanitizeThemeRelativePath(f.relativePath);
    const destKey = `${base}${rel}`;
    await copyS3ObjectSameBucket(f.key, destKey);
    count += 1;
  }
  const suffix = resolveThemeContentRootSuffix(files);
  const contentRootPrefix = suffix ? `${base}${suffix}/` : base;
  return {
    contentRoot: {
      prefix: contentRootPrefix,
      fileCount: count,
      uploadedAt: stamp,
    },
  };
}

export async function promoteInformaticStagingAssetsToCatalog(
  themeId: string,
  keys: {
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  }
): Promise<ThemeCatalogS3Assets> {
  return promoteInformaticAuxiliaryToCatalog(themeId, keys);
}

export async function promoteInformaticFolderUploadToCatalog(
  themeId: string,
  files: { key: string; relativePath: string }[],
  aux: {
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  }
): Promise<ThemeCatalogS3Assets> {
  const folderPart = await promoteInformaticStagingFolderToCatalog(themeId, files);
  const auxPart = await promoteInformaticAuxiliaryToCatalog(themeId, aux);
  return { ...folderPart, ...auxPart };
}

export {
  deleteS3Keys,
  listAllObjectKeysUnderPrefix,
  publicObjectUrlForKey,
  assertCatalogStagingKeys,
  assertCatalogFolderAndAuxiliaryKeys,
  promoteCatalogAuxiliary,
  promoteCatalogFolder,
};
