import extract from 'extract-zip';
import fs from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { CustomError } from './error.utils';
import { downloadS3KeyToFile, listAllObjectKeysUnderPrefix } from './theme-s3-ingest';

/** If the zip contained a single top-level folder, lift its contents into `targetDir`. */
export function normalizeExtractedSingleTopLevelWrapper(targetDir: string) {
  const items = fs.readdirSync(targetDir);
  if (items.length !== 1) return;
  const onlyItemPath = path.join(targetDir, items[0]);
  const stat = fs.statSync(onlyItemPath);
  if (!stat.isDirectory()) return;
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
  moveUp(onlyItemPath, targetDir);
  fs.rmSync(onlyItemPath, { recursive: true, force: true });
}

/**
 * Download every object under an S3 prefix into `destCodeDir`, preserving relative paths
 * (directory is replaced if it already exists).
 */
export async function downloadS3PrefixToLocalDir(prefix: string, destCodeDir: string): Promise<void> {
  const p = prefix.endsWith('/') ? prefix : `${prefix}/`;
  if (fs.existsSync(destCodeDir)) fs.rmSync(destCodeDir, { recursive: true, force: true });
  fs.mkdirSync(destCodeDir, { recursive: true });
  const allKeys = await listAllObjectKeysUnderPrefix(p);
  if (allKeys.length === 0) {
    throw new CustomError('Theme folder is empty in S3', 404);
  }
  for (const key of allKeys) {
    const rel = key.slice(p.length);
    if (!rel || rel.includes('..')) continue;
    const outPath = path.join(destCodeDir, rel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await downloadS3KeyToFile(key, outPath);
  }
}

/**
 * Download a theme ZIP from S3 and extract Liquid sources into `destCodeDir`
 * (directory is replaced if it already exists).
 */
export async function downloadS3ZipAndExtractToDir(zipKey: string, destCodeDir: string): Promise<void> {
  const tmpZip = path.join(tmpdir(), `ziplofy-theme-${Date.now()}-${Math.random().toString(36).slice(2)}.zip`);
  if (fs.existsSync(destCodeDir)) fs.rmSync(destCodeDir, { recursive: true, force: true });
  fs.mkdirSync(destCodeDir, { recursive: true });
  await downloadS3KeyToFile(zipKey, tmpZip);
  await extract(tmpZip, { dir: destCodeDir });
  fs.unlinkSync(tmpZip);
  normalizeExtractedSingleTopLevelWrapper(destCodeDir);
}

function catalogCacheRoot(themeId: string): string {
  return path.join(tmpdir(), 'ziplofy-catalog-themes', themeId);
}

/** Download catalog theme from S3 to temp (preview / storefront render only — not on install). */
export async function ensureCatalogThemeCodeDir(theme: {
  _id: unknown;
  s3Assets?: {
    zip?: { key?: string };
    contentRoot?: { prefix?: string; fileCount?: number };
  };
}): Promise<string> {
  const id = String(theme._id);
  const zipKey = theme.s3Assets?.zip?.key;
  const folderPrefix = theme.s3Assets?.contentRoot?.prefix;
  if (!zipKey && !folderPrefix) throw new CustomError('Theme has no S3 package', 404);

  const cacheRoot = catalogCacheRoot(id);
  const codeDir = path.join(cacheRoot, 'code');
  const metaPath = path.join(cacheRoot, '.meta.json');
  const mode = zipKey ? 'zip' : 'folder';
  const ref = zipKey ?? folderPrefix ?? '';
  const folderFileCount = theme.s3Assets?.contentRoot?.fileCount;

  let skip = false;
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (
        meta.mode === mode &&
        meta.ref === ref &&
        (mode !== 'folder' || meta.folderFileCount === folderFileCount) &&
        fs.existsSync(codeDir) &&
        fs.readdirSync(codeDir).length > 0
      ) {
        skip = true;
      }
    } catch {
      /* re-sync */
    }
  }
  if (!skip) {
    if (fs.existsSync(cacheRoot)) fs.rmSync(cacheRoot, { recursive: true, force: true });
    fs.mkdirSync(codeDir, { recursive: true });
    if (zipKey) {
      await downloadS3ZipAndExtractToDir(zipKey, codeDir);
    } else {
      await downloadS3PrefixToLocalDir(folderPrefix!, codeDir);
    }
    fs.writeFileSync(
      metaPath,
      JSON.stringify({
        mode,
        ref,
        folderFileCount: mode === 'folder' ? folderFileCount : undefined,
        ts: Date.now(),
      })
    );
  }
  return codeDir;
}

export async function ensureCatalogRemoteDistDir(theme: {
  _id: unknown;
  s3Assets?: { reactThemeJs?: { key?: string }; reactThemeCss?: { key?: string } };
}): Promise<string> {
  const id = String(theme._id);
  const distDir = path.join(catalogCacheRoot(id), 'remoteThemeDist');
  const jsKey = theme.s3Assets?.reactThemeJs?.key;
  const cssKey = theme.s3Assets?.reactThemeCss?.key;
  if (!jsKey && !cssKey) return distDir;

  fs.mkdirSync(distDir, { recursive: true });
  if (jsKey && !fs.existsSync(path.join(distDir, 'theme.js'))) {
    await downloadS3KeyToFile(jsKey, path.join(distDir, 'theme.js'));
  }
  if (cssKey && !fs.existsSync(path.join(distDir, 'theme.css'))) {
    await downloadS3KeyToFile(cssKey, path.join(distDir, 'theme.css'));
  }
  return distDir;
}
