import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import { CustomTheme } from '../models/custom-theme.model';
import { InstalledThemes } from '../models/installed-themes.model';
import { Store } from '../models/store/store.model';
import { Theme } from '../models/theme.model';
import { listAllObjectKeysUnderPrefix, publicObjectUrlForKey } from './theme-s3-ingest';
import { ensureCatalogThemeCodeDir } from './theme-zip-from-s3.util';

export type ThemeS3AssetsShape = {
  contentRoot?: { prefix: string; fileCount?: number };
  zip?: { key: string; url: string };
  reactThemeJs?: { key: string; url: string };
  reactThemeCss?: { key: string; url: string };
};

/** Applied theme for a store (DB only — no S3 download). */
export type ResolvedAppliedStoreTheme = {
  storeId: string;
  appliedThemeId: string;
  themeName: string | null;
  isCustomTheme: boolean;
  runtimeThemeKey: string;
  s3Assets: ThemeS3AssetsShape | null;
  remoteThemeJsUrl: string | null;
  remoteThemeCssUrl: string | null;
};

export async function resolveAppliedStoreTheme(storeId: string): Promise<ResolvedAppliedStoreTheme | null> {
  const storeDoc = await Store.findById(storeId).select('appliedTheme').lean();
  const appliedThemeId = storeDoc?.appliedTheme ? String(storeDoc.appliedTheme) : null;
  if (!appliedThemeId) return null;

  const installed = await InstalledThemes.findOne({
    store: new Types.ObjectId(storeId),
    theme: new Types.ObjectId(appliedThemeId),
    uninstalledAt: null,
  }).lean();
  if (!installed) return null;

  const theme = await Theme.findById(appliedThemeId).lean();
  const customTheme = !theme ? await CustomTheme.findById(appliedThemeId).lean() : null;
  if (!theme && !customTheme) return null;

  const isCustomTheme = Boolean(!theme && customTheme);
  const runtimeThemeKey = isCustomTheme ? `custom-${appliedThemeId}` : appliedThemeId;
  const s3 = (theme?.s3Assets ?? null) as ThemeS3AssetsShape | null;
  const jsUrl =
    s3?.reactThemeJs?.url ??
    (s3?.reactThemeJs?.key ? publicObjectUrlForKey(s3.reactThemeJs.key) : null);
  const cssUrl =
    s3?.reactThemeCss?.url ??
    (s3?.reactThemeCss?.key ? publicObjectUrlForKey(s3.reactThemeCss.key) : null);

  return {
    storeId,
    appliedThemeId,
    themeName: isCustomTheme
      ? (customTheme as { name?: string })?.name ?? null
      : (theme as { name?: string })?.name ?? null,
    isCustomTheme,
    runtimeThemeKey,
    s3Assets: s3,
    remoteThemeJsUrl: jsUrl,
    remoteThemeCssUrl: cssUrl,
  };
}

/** Public HTTPS URL for a file under catalog `contentRoot` (no local download). */
export function catalogPublicUrlForRelativePath(
  s3Assets: ThemeS3AssetsShape,
  relativePath: string
): string | null {
  const rel = relativePath.replace(/^\/+/, '').replace(/\\/g, '/');
  if (!rel || rel.includes('..')) return null;

  if (rel === 'theme.js' || rel.endsWith('/theme.js')) {
    return s3Assets.reactThemeJs?.url ?? null;
  }
  if (rel === 'theme.css' || rel.endsWith('/theme.css')) {
    return s3Assets.reactThemeCss?.url ?? null;
  }

  const prefix = s3Assets.contentRoot?.prefix;
  if (!prefix) return null;
  const root = prefix.endsWith('/') ? prefix : `${prefix}/`;
  return publicObjectUrlForKey(`${root}${rel}`);
}

export async function listCatalogThemeFilesFromS3(
  s3Assets: ThemeS3AssetsShape
): Promise<Array<{ relativePath: string; url: string }>> {
  if (!s3Assets.contentRoot?.prefix) return [];
  const root = s3Assets.contentRoot.prefix.endsWith('/')
    ? s3Assets.contentRoot.prefix
    : `${s3Assets.contentRoot.prefix}/`;
  const keys = await listAllObjectKeysUnderPrefix(root);
  return keys.map((key) => ({
    relativePath: key.slice(root.length),
    url: publicObjectUrlForKey(key),
  }));
}

const LIQUID_TEMPLATE_NAME = /^[a-z][a-z0-9_-]{0,63}$/;

export async function listLiquidTemplateNamesFromS3(s3Assets: ThemeS3AssetsShape): Promise<string[]> {
  const files = await listCatalogThemeFilesFromS3(s3Assets);
  return files
    .filter((f) => f.relativePath.startsWith('templates/') && f.relativePath.endsWith('.liquid'))
    .map((f) => path.basename(f.relativePath, '.liquid'))
    .filter((name) => LIQUID_TEMPLATE_NAME.test(name))
    .sort();
}

export function isSafeLiquidTemplateName(name: string): boolean {
  return typeof name === 'string' && LIQUID_TEMPLATE_NAME.test(name);
}

/** Legacy liquid SSR: custom themes use disk; catalog themes still sync on render only. */
export async function resolveStorefrontLiquidRenderRoot(
  storeId: string,
  resolved: ResolvedAppliedStoreTheme
): Promise<{ runtimeBaseDir: string; runtimeBaseUrl: string } | null> {
  const host = process.env.PUBLIC_API_HOST || 'localhost';
  const protocol = process.env.PUBLIC_API_PROTOCOL || 'http';

  if (resolved.isCustomTheme) {
    const storeThemeDir = path.join(
      process.cwd(),
      'uploads',
      'stores',
      storeId,
      'themes',
      resolved.runtimeThemeKey
    );
    const unzippedThemeDir = path.join(storeThemeDir, 'unzippedTheme');
    const runtimeBaseDir = fs.existsSync(unzippedThemeDir) ? unzippedThemeDir : storeThemeDir;
    const runtimeBaseUrl = `${protocol}://${host}/api/themes/installed/${encodeURIComponent(
      storeId
    )}/${encodeURIComponent(resolved.runtimeThemeKey)}/runtime`;
    return { runtimeBaseDir, runtimeBaseUrl };
  }

  if (!resolved.s3Assets?.contentRoot?.prefix) return null;
  const theme = await Theme.findById(resolved.appliedThemeId).lean();
  if (!theme) return null;
  const runtimeBaseDir = await ensureCatalogThemeCodeDir(theme);
  const root = resolved.s3Assets.contentRoot.prefix.endsWith('/')
    ? resolved.s3Assets.contentRoot.prefix
    : `${resolved.s3Assets.contentRoot.prefix}/`;
  const runtimeBaseUrl = publicObjectUrlForKey(root).replace(/\/$/, '');
  return { runtimeBaseDir, runtimeBaseUrl };
}

export function themeHasLiquidTemplates(runtimeBaseDir: string): boolean {
  return fs.existsSync(path.join(runtimeBaseDir, 'templates', 'index.liquid'));
}
