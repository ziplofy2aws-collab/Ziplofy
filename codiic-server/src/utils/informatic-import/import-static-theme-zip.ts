/**
 * ZIP → Informatic catalog orchestration.
 *
 * Extracts an uploaded theme zip, converts index.html (+ siblings) into an
 * editor-compatible pack, then writes everything directly into the catalog
 * S3 layout used by `promoteInformaticFolderUploadToCatalog`:
 *
 *   informatic-themes/catalog/{themeId}/
 *     theme/<files…>               (static preview tree)
 *     remote-theme-dist/theme.{js,css,schema.json,default-config.json,manifest.json}
 *     thumbnail/thumbnail.<ext>
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import extractZip from 'extract-zip';
import { CustomError } from '../error.utils';
import {
  publicObjectUrlForKey,
  sanitizeThemeRelativePath,
  uploadS3Object,
  type ThemeCatalogS3Assets,
} from '../theme-s3-ingest';
import { INFORMATIC_CATALOG_ROOT } from '../informatic-theme-s3-ingest';
import {
  convertStaticThemeToInformaticPack,
  type ConvertedInformaticPack,
  type ImportedThemeFile,
} from './convert-static-theme';

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

function contentTypeFor(fileName: string): string {
  return CONTENT_TYPES[path.posix.extname(fileName).toLowerCase()] ?? 'application/octet-stream';
}

/** 1×1 transparent PNG used when the zip contains no image for a thumbnail. */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const SKIP_BASENAMES = new Set(['.ds_store', 'thumbs.db', 'desktop.ini', '__macosx']);

interface WalkedFile {
  absolutePath: string;
  /** Path relative to the extraction root. */
  extractedRel: string;
}

function walkDir(root: string, base = root, out: WalkedFile[] = []): WalkedFile[] {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') {
      if (SKIP_BASENAMES.has(entry.name.toLowerCase())) continue;
      if (entry.name.startsWith('.')) continue; // skip hidden files/dirs
    }
    const abs = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walkDir(abs, base, out);
    } else if (entry.isFile()) {
      const rel = path.relative(base, abs).split(path.sep).join('/');
      out.push({ absolutePath: abs, extractedRel: rel });
    }
  }
  return out;
}

/** If every file sits under a single top-level dir (zip wrapped in a folder), unwrap it. */
function unwrapSingleRoot(files: WalkedFile[], extractRoot: string): { root: string; files: WalkedFile[] } {
  const firstSegs = new Set(files.map((f) => f.extractedRel.split('/')[0]));
  const allNested = files.every((f) => f.extractedRel.includes('/'));
  if (firstSegs.size === 1 && allNested) {
    const seg = [...firstSegs][0];
    const root = path.join(extractRoot, seg);
    return {
      root,
      files: files.map((f) => ({ ...f, extractedRel: f.extractedRel.slice(seg.length + 1) })),
    };
  }
  return { root: extractRoot, files };
}

/** Locate the directory holding index.html (shortest path wins). */
function findContentRoot(files: WalkedFile[], searchRoot: string): { rootDir: string; files: ImportedThemeFile[] } {
  const indexFiles = files
    .filter((f) => path.posix.basename(f.extractedRel).toLowerCase() === 'index.html')
    .sort((a, b) => a.extractedRel.split('/').length - b.extractedRel.split('/').length);

  if (!indexFiles.length) {
    throw new CustomError('Theme upload must contain an index.html file.', 400);
  }

  const rootRel = path.posix.dirname(indexFiles[0].extractedRel);
  const rootDir = rootRel === '.' ? searchRoot : path.join(searchRoot, rootRel);

  const scoped = files
    .filter((f) => rootRel === '.' || f.extractedRel.startsWith(`${rootRel}/`))
    .map((f) => ({
      absolutePath: f.absolutePath,
      relativePath: rootRel === '.' ? f.extractedRel : f.extractedRel.slice(rootRel.length + 1),
    }))
    .filter((f) => f.relativePath && !f.relativePath.startsWith('..'));

  return { rootDir, files: scoped };
}

export interface ZipImportResult {
  s3Assets: ThemeCatalogS3Assets;
  manifestSummary: { themeId?: string; templates?: string[]; type?: string };
  conversionReport: ConvertedInformaticPack['report'];
  warnings: string[];
}

export async function importInformaticThemeFromZipBuffer(
  zipBuffer: Buffer,
  themeId: string,
  themeName: string,
  publicBaseUrl?: string
): Promise<ZipImportResult> {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'informatic-import-'));
  const zipPath = path.join(tmpBase, 'theme.zip');
  const extractRoot = path.join(tmpBase, 'extracted');

  try {
    fs.writeFileSync(zipPath, zipBuffer);
    try {
      await extractZip(zipPath, { dir: extractRoot });
    } catch (e: any) {
      throw new CustomError(`Could not unzip the uploaded file: ${e?.message || 'invalid archive'}`, 400);
    }

    return await importFromExtractedRoot(extractRoot, themeId, themeName, publicBaseUrl);
  } finally {
    try {
      fs.rmSync(tmpBase, { recursive: true, force: true });
    } catch {
      /* ignore cleanup errors */
    }
  }
}

/**
 * Same pipeline for unzipped uploads: multipart file list whose entries carry
 * their folder-relative path (`webkitRelativePath` from the browser folder
 * picker, or plain filenames for a flat selection).
 */
export async function importInformaticThemeFromFileList(
  entries: { name: string; buffer: Buffer }[],
  themeId: string,
  themeName: string,
  publicBaseUrl?: string
): Promise<ZipImportResult> {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'informatic-import-'));
  const root = path.join(tmpBase, 'files');

  try {
    for (const e of entries) {
      const rel = String(e.name || '')
        .replace(/\\/g, '/')
        .replace(/^\.?\//, '')
        .replace(/\/+$/, '');
      if (!rel || rel.split('/').some((seg) => seg === '..')) {
        throw new CustomError(`Unsafe file path in upload: ${e.name}`, 400);
      }
      const abs = path.join(root, ...rel.split('/'));
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, e.buffer);
    }

    return await importFromExtractedRoot(root, themeId, themeName, publicBaseUrl);
  } finally {
    try {
      fs.rmSync(tmpBase, { recursive: true, force: true });
    } catch {
      /* ignore cleanup errors */
    }
  }
}

/** Shared core: extracted theme dir → convert → upload to catalog layout. */
async function importFromExtractedRoot(
  extractRoot: string,
  themeId: string,
  themeName: string,
  publicBaseUrl?: string
): Promise<ZipImportResult> {
  {
    const walked = walkDir(extractRoot);
    if (!walked.length) {
      throw new CustomError('Theme upload is empty.', 400);
    }

    const unwrapped = unwrapSingleRoot(walked, extractRoot);
    const { files } = findContentRoot(unwrapped.files, unwrapped.root);

    for (const f of files) sanitizeThemeRelativePath(f.relativePath); // throws on traversal

    const catalogBase = `${INFORMATIC_CATALOG_ROOT}/${themeId}`;
    const contentBase = `${catalogBase}/theme`;

    // Catalog objects are private — browser-facing URLs go through the
    // backend file route when a public API base was supplied by the caller.
    const catalogUrl = (relKey: string) => {
      const encoded = relKey.split('/').filter(Boolean).map((s) => encodeURIComponent(s)).join('/');
      return publicBaseUrl
        ? `${publicBaseUrl}/api/informatic-themes/file/${themeId}/${encoded}`
        : publicObjectUrlForKey(`${catalogBase}/${encoded}`);
    };

    const assetUrl = (rel: string) => {
      const clean = String(rel || '').replace(/^\.?\//, '').replace(/\\/g, '/');
      if (/^https?:\/\//i.test(clean) || clean.startsWith('//') || clean.startsWith('data:')) return clean;
      return catalogUrl(`theme/${clean}`);
    };

    const pack = convertStaticThemeToInformaticPack({
      themeId,
      themeName,
      files,
      assetUrl,
    });

    // ---- Upload static theme tree (powers the catalog Preview modal).
    // Batched parallelism — sequential uploads made large themes crawl.
    const UPLOAD_CONCURRENCY = 8;
    for (let i = 0; i < files.length; i += UPLOAD_CONCURRENCY) {
      await Promise.all(
        files.slice(i, i + UPLOAD_CONCURRENCY).map((f) => {
          const rel = sanitizeThemeRelativePath(f.relativePath);
          const key = `${contentBase}/${rel.split('/').map((s) => encodeURIComponent(s)).join('/')}`;
          return uploadS3Object(key, fs.readFileSync(f.absolutePath), contentTypeFor(rel));
        })
      );
    }

    // ---- Upload generated dist files.
    const stamp = new Date();
    const distBase = `${catalogBase}/remote-theme-dist`;
    const distUploads: { key: string; body: string; contentType: string; out: keyof ThemeCatalogS3Assets }[] = [
      { key: `${distBase}/theme.js`, body: pack.themeJs, contentType: 'application/javascript', out: 'reactThemeJs' },
      { key: `${distBase}/theme.css`, body: pack.themeCss, contentType: 'text/css', out: 'reactThemeCss' },
      { key: `${distBase}/theme.schema.json`, body: pack.schemaJson, contentType: 'application/json', out: 'reactThemeSchema' },
      { key: `${distBase}/theme.default-config.json`, body: pack.defaultConfigJson, contentType: 'application/json', out: 'reactThemeDefaultConfig' },
      { key: `${distBase}/theme.manifest.json`, body: pack.manifestJson, contentType: 'application/json', out: 'reactThemeManifest' },
    ];

    const s3Assets: ThemeCatalogS3Assets = {
      contentRoot: { prefix: `${contentBase}/`, fileCount: files.length, uploadedAt: stamp },
    };

    await Promise.all(
      distUploads.map(async (d) => {
        await uploadS3Object(d.key, d.body, d.contentType);
        (s3Assets as any)[d.out] = {
          key: d.key,
          url: catalogUrl(d.key.slice(catalogBase.length + 1)),
          contentType: d.contentType,
          size: Buffer.byteLength(d.body),
          uploadedAt: stamp,
        };
      })
    );

    // ---- Thumbnail: theme image if present, else a transparent placeholder.
    const thumbRel = pack.thumbnailRelativePath;
    if (thumbRel) {
      const thumbAbs = files.find((f) => f.relativePath === thumbRel)?.absolutePath;
      const ext = path.posix.extname(thumbRel).toLowerCase() || '.png';
      const key = `${catalogBase}/thumbnail/thumbnail${ext}`;
      const body = thumbAbs ? fs.readFileSync(thumbAbs) : PLACEHOLDER_PNG;
      await uploadS3Object(key, body, contentTypeFor(thumbRel));
      s3Assets.thumbnail = {
        key,
        url: catalogUrl(`thumbnail/thumbnail${ext}`),
        contentType: contentTypeFor(thumbRel),
        size: body.length,
        uploadedAt: stamp,
      };
    } else {
      const key = `${catalogBase}/thumbnail/thumbnail.png`;
      await uploadS3Object(key, PLACEHOLDER_PNG, 'image/png');
      s3Assets.thumbnail = {
        key,
        url: catalogUrl('thumbnail/thumbnail.png'),
        contentType: 'image/png',
        size: PLACEHOLDER_PNG.length,
        uploadedAt: stamp,
      };
    }

    return {
      s3Assets,
      manifestSummary: {
        themeId,
        templates: (JSON.parse(pack.manifestJson).templates ?? []) as string[],
        type: 'react-remote',
      },
      conversionReport: pack.report,
      warnings: pack.warnings,
    };
  }
}
