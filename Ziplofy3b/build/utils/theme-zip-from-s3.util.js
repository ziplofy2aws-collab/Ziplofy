"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeExtractedSingleTopLevelWrapper = normalizeExtractedSingleTopLevelWrapper;
exports.downloadS3PrefixToLocalDir = downloadS3PrefixToLocalDir;
exports.downloadS3ZipAndExtractToDir = downloadS3ZipAndExtractToDir;
exports.ensureCatalogThemeCodeDir = ensureCatalogThemeCodeDir;
exports.ensureCatalogRemoteDistDir = ensureCatalogRemoteDistDir;
const extract_zip_1 = __importDefault(require("extract-zip"));
const fs_1 = __importDefault(require("fs"));
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const error_utils_1 = require("./error.utils");
const theme_s3_ingest_1 = require("./theme-s3-ingest");
/** If the zip contained a single top-level folder, lift its contents into `targetDir`. */
function normalizeExtractedSingleTopLevelWrapper(targetDir) {
    const items = fs_1.default.readdirSync(targetDir);
    if (items.length !== 1)
        return;
    const onlyItemPath = path_1.default.join(targetDir, items[0]);
    const stat = fs_1.default.statSync(onlyItemPath);
    if (!stat.isDirectory())
        return;
    const moveUp = (src, dest) => {
        const entries = fs_1.default.readdirSync(src);
        entries.forEach((entry) => {
            const srcPath = path_1.default.join(src, entry);
            const destPath = path_1.default.join(dest, entry);
            const s = fs_1.default.statSync(srcPath);
            if (s.isDirectory()) {
                if (!fs_1.default.existsSync(destPath))
                    fs_1.default.mkdirSync(destPath, { recursive: true });
                moveUp(srcPath, destPath);
            }
            else {
                fs_1.default.renameSync(srcPath, destPath);
            }
        });
    };
    moveUp(onlyItemPath, targetDir);
    fs_1.default.rmSync(onlyItemPath, { recursive: true, force: true });
}
/**
 * Download every object under an S3 prefix into `destCodeDir`, preserving relative paths
 * (directory is replaced if it already exists).
 */
async function downloadS3PrefixToLocalDir(prefix, destCodeDir) {
    const p = prefix.endsWith('/') ? prefix : `${prefix}/`;
    if (fs_1.default.existsSync(destCodeDir))
        fs_1.default.rmSync(destCodeDir, { recursive: true, force: true });
    fs_1.default.mkdirSync(destCodeDir, { recursive: true });
    const allKeys = await (0, theme_s3_ingest_1.listAllObjectKeysUnderPrefix)(p);
    if (allKeys.length === 0) {
        throw new error_utils_1.CustomError('Theme folder is empty in S3', 404);
    }
    for (const key of allKeys) {
        const rel = key.slice(p.length);
        if (!rel || rel.includes('..'))
            continue;
        const outPath = path_1.default.join(destCodeDir, rel);
        fs_1.default.mkdirSync(path_1.default.dirname(outPath), { recursive: true });
        await (0, theme_s3_ingest_1.downloadS3KeyToFile)(key, outPath);
    }
}
/**
 * Download a theme ZIP from S3 and extract Liquid sources into `destCodeDir`
 * (directory is replaced if it already exists).
 */
async function downloadS3ZipAndExtractToDir(zipKey, destCodeDir) {
    const tmpZip = path_1.default.join((0, os_1.tmpdir)(), `ziplofy-theme-${Date.now()}-${Math.random().toString(36).slice(2)}.zip`);
    if (fs_1.default.existsSync(destCodeDir))
        fs_1.default.rmSync(destCodeDir, { recursive: true, force: true });
    fs_1.default.mkdirSync(destCodeDir, { recursive: true });
    await (0, theme_s3_ingest_1.downloadS3KeyToFile)(zipKey, tmpZip);
    await (0, extract_zip_1.default)(tmpZip, { dir: destCodeDir });
    fs_1.default.unlinkSync(tmpZip);
    normalizeExtractedSingleTopLevelWrapper(destCodeDir);
}
function catalogCacheRoot(themeId) {
    return path_1.default.join((0, os_1.tmpdir)(), 'ziplofy-catalog-themes', themeId);
}
/** Download catalog theme from S3 to temp (preview / storefront render only — not on install). */
async function ensureCatalogThemeCodeDir(theme) {
    const id = String(theme._id);
    const zipKey = theme.s3Assets?.zip?.key;
    const folderPrefix = theme.s3Assets?.contentRoot?.prefix;
    if (!zipKey && !folderPrefix)
        throw new error_utils_1.CustomError('Theme has no S3 package', 404);
    const cacheRoot = catalogCacheRoot(id);
    const codeDir = path_1.default.join(cacheRoot, 'code');
    const metaPath = path_1.default.join(cacheRoot, '.meta.json');
    const mode = zipKey ? 'zip' : 'folder';
    const ref = zipKey ?? folderPrefix ?? '';
    const folderFileCount = theme.s3Assets?.contentRoot?.fileCount;
    let skip = false;
    if (fs_1.default.existsSync(metaPath)) {
        try {
            const meta = JSON.parse(fs_1.default.readFileSync(metaPath, 'utf8'));
            if (meta.mode === mode &&
                meta.ref === ref &&
                (mode !== 'folder' || meta.folderFileCount === folderFileCount) &&
                fs_1.default.existsSync(codeDir) &&
                fs_1.default.readdirSync(codeDir).length > 0) {
                skip = true;
            }
        }
        catch {
            /* re-sync */
        }
    }
    if (!skip) {
        if (fs_1.default.existsSync(cacheRoot))
            fs_1.default.rmSync(cacheRoot, { recursive: true, force: true });
        fs_1.default.mkdirSync(codeDir, { recursive: true });
        if (zipKey) {
            await downloadS3ZipAndExtractToDir(zipKey, codeDir);
        }
        else {
            await downloadS3PrefixToLocalDir(folderPrefix, codeDir);
        }
        fs_1.default.writeFileSync(metaPath, JSON.stringify({
            mode,
            ref,
            folderFileCount: mode === 'folder' ? folderFileCount : undefined,
            ts: Date.now(),
        }));
    }
    return codeDir;
}
async function ensureCatalogRemoteDistDir(theme) {
    const id = String(theme._id);
    const distDir = path_1.default.join(catalogCacheRoot(id), 'remoteThemeDist');
    const jsKey = theme.s3Assets?.reactThemeJs?.key;
    const cssKey = theme.s3Assets?.reactThemeCss?.key;
    if (!jsKey && !cssKey)
        return distDir;
    fs_1.default.mkdirSync(distDir, { recursive: true });
    if (jsKey && !fs_1.default.existsSync(path_1.default.join(distDir, 'theme.js'))) {
        await (0, theme_s3_ingest_1.downloadS3KeyToFile)(jsKey, path_1.default.join(distDir, 'theme.js'));
    }
    if (cssKey && !fs_1.default.existsSync(path_1.default.join(distDir, 'theme.css'))) {
        await (0, theme_s3_ingest_1.downloadS3KeyToFile)(cssKey, path_1.default.join(distDir, 'theme.css'));
    }
    return distDir;
}
