"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stagingPrefix = stagingPrefix;
exports.stagingThemeFilesPrefix = stagingThemeFilesPrefix;
exports.stagingThemeFileKey = stagingThemeFileKey;
exports.sanitizeThemeRelativePath = sanitizeThemeRelativePath;
exports.assertStagingThemeFolderKeys = assertStagingThemeFolderKeys;
exports.assertStagingFolderAndAuxiliaryKeys = assertStagingFolderAndAuxiliaryKeys;
exports.assertStagingKeys = assertStagingKeys;
exports.downloadS3KeyToFile = downloadS3KeyToFile;
exports.readS3JsonObject = readS3JsonObject;
exports.publicObjectUrlForKey = publicObjectUrlForKey;
exports.copyS3ObjectSameBucket = copyS3ObjectSameBucket;
exports.headS3Object = headS3Object;
exports.listAllObjectKeysUnderPrefix = listAllObjectKeysUnderPrefix;
exports.promoteStagingAuxiliaryToCatalog = promoteStagingAuxiliaryToCatalog;
exports.promoteStagingThemeFolderToCatalog = promoteStagingThemeFolderToCatalog;
exports.promoteStagingThemeAssetsToCatalog = promoteStagingThemeAssetsToCatalog;
exports.collectCatalogAssetKeysAsync = collectCatalogAssetKeysAsync;
exports.deleteS3Keys = deleteS3Keys;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const promises_1 = require("stream/promises");
const error_utils_1 = require("./error.utils");
const s3_client_1 = require("./s3-client");
function stagingPrefix(userId, sessionId) {
    return `themes/staging/${userId}/${sessionId}/`;
}
/** Staging prefix for multi-file static themes (HTML/CSS/JS tree under `theme/`). */
function stagingThemeFilesPrefix(userId, sessionId) {
    return `${stagingPrefix(userId, sessionId)}theme/`;
}
/** Deterministic S3 key for one file under the staging `theme/` folder. */
function stagingThemeFileKey(userId, sessionId, relativePath) {
    const rel = sanitizeThemeRelativePath(relativePath);
    const encodedRel = rel.split('/').map((seg) => encodeURIComponent(seg)).join('/');
    return `${stagingThemeFilesPrefix(userId, sessionId)}${encodedRel}`;
}
/** Normalize and validate a relative path inside a theme folder (no `..`, no NUL). */
function sanitizeThemeRelativePath(raw) {
    const n = String(raw || '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .trim();
    if (!n || n.length > 2048) {
        throw new error_utils_1.CustomError('Invalid relativePath (empty or too long)', 400);
    }
    const segs = n.split('/').filter(Boolean);
    for (const s of segs) {
        if (s === '.' || s === '..') {
            throw new error_utils_1.CustomError('Invalid relativePath (path traversal)', 400);
        }
        if (/[\x00-\x1f]/.test(s)) {
            throw new error_utils_1.CustomError('Invalid relativePath', 400);
        }
    }
    return segs.join('/');
}
function assertStagingThemeFolderKeys(files, userId, sessionId) {
    const prefix = stagingThemeFilesPrefix(userId, sessionId);
    const keys = [];
    for (const f of files) {
        if (!f.key || typeof f.key !== 'string' || !f.key.startsWith(prefix)) {
            throw new error_utils_1.CustomError('Invalid S3 key: theme file must belong to your staging theme/ prefix.', 403);
        }
        keys.push(f.key);
    }
    return keys;
}
/** Folder theme files + optional thumbnail / remote dist keys under the same staging session. */
function assertStagingFolderAndAuxiliaryKeys(files, aux, userId, sessionId) {
    const fileKeys = assertStagingThemeFolderKeys(files, userId, sessionId);
    const prefix = stagingPrefix(userId, sessionId);
    const auxKeys = [
        aux.thumbnailKey,
        aux.reactJsKey,
        aux.reactCssKey,
        aux.themeSchemaKey,
        aux.themeDefaultConfigKey,
        aux.themeManifestKey,
    ].filter((k) => typeof k === 'string' && k.length > 0);
    for (const k of auxKeys) {
        if (!k.startsWith(prefix)) {
            throw new error_utils_1.CustomError('Invalid S3 key: must belong to your staging upload session.', 403);
        }
    }
    return [...fileKeys, ...auxKeys];
}
/** Ensures every non-empty key starts with the caller's staging prefix; returns defined keys. */
function assertStagingKeys(keys, userId, sessionId) {
    const prefix = stagingPrefix(userId, sessionId);
    const all = [
        keys.zipKey,
        keys.thumbnailKey,
        keys.reactJsKey,
        keys.reactCssKey,
        keys.themeSchemaKey,
        keys.themeDefaultConfigKey,
        keys.themeManifestKey,
    ].filter((k) => typeof k === 'string' && k.length > 0);
    for (const k of all) {
        if (!k.startsWith(prefix)) {
            throw new error_utils_1.CustomError('Invalid S3 key: must belong to your staging upload session.', 403);
        }
    }
    return all;
}
async function downloadS3KeyToFile(key, destPath) {
    const res = await s3_client_1.s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: s3_client_1.awsBucket, Key: key }));
    const body = res.Body;
    if (!body) {
        throw new error_utils_1.CustomError('Empty or missing S3 object', 500);
    }
    const rs = body;
    await (0, promises_1.pipeline)(rs, fs_1.default.createWriteStream(destPath));
}
/** Read and parse a JSON object from S3 (theme.schema / default-config / manifest). */
async function readS3JsonObject(key) {
    try {
        const res = await s3_client_1.s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: s3_client_1.awsBucket, Key: key }));
        const body = res.Body;
        if (!body)
            return null;
        const chunks = [];
        const rs = body;
        for await (const chunk of rs) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const raw = Buffer.concat(chunks).toString('utf8');
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    }
    catch {
        return null;
    }
}
function publicObjectUrlForKey(key) {
    return `https://${s3_client_1.awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
}
/** Copy an object to another key in the same bucket (used to promote staging → catalog). */
async function copyS3ObjectSameBucket(srcKey, destKey) {
    const copySource = `${s3_client_1.awsBucket}/${encodeURIComponent(srcKey).replace(/%2F/g, '/')}`;
    await s3_client_1.s3Client.send(new client_s3_1.CopyObjectCommand({
        Bucket: s3_client_1.awsBucket,
        CopySource: copySource,
        Key: destKey,
    }));
}
async function headS3Object(key) {
    const h = await s3_client_1.s3Client.send(new client_s3_1.HeadObjectCommand({ Bucket: s3_client_1.awsBucket, Key: key }));
    return {
        size: Number(h.ContentLength ?? 0),
        contentType: (h.ContentType && h.ContentType.trim()) || 'application/octet-stream',
    };
}
function catalogZipBaseNameFromStagingKey(zipKey) {
    return path_1.default.basename(zipKey).replace(/[^\w.\-]+/g, '_').replace(/^\.+/, '') || 'theme.zip';
}
async function listAllObjectKeysUnderPrefix(prefix) {
    const keys = [];
    let ContinuationToken;
    const p = prefix.endsWith('/') ? prefix : `${prefix}/`;
    do {
        const resp = await s3_client_1.s3Client.send(new client_s3_1.ListObjectsV2Command({
            Bucket: s3_client_1.awsBucket,
            Prefix: p,
            ContinuationToken,
        }));
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
async function promoteStagingAuxiliaryToCatalog(themeId, keys) {
    const base = `themes/catalog/${themeId}`;
    const distBase = `${base}/remote-theme-dist`;
    const stamp = () => new Date();
    const out = {};
    if (keys.thumbnailKey) {
        const ext = path_1.default.extname(keys.thumbnailKey) || '.jpg';
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
async function promoteStagingThemeFolderToCatalog(themeId, files) {
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
async function promoteStagingThemeAssetsToCatalog(themeId, keys) {
    const base = `themes/catalog/${themeId}`;
    const stamp = () => new Date();
    const zipDestKey = `${base}/zipped/${catalogZipBaseNameFromStagingKey(keys.zipKey)}`;
    await copyS3ObjectSameBucket(keys.zipKey, zipDestKey);
    const zipHead = await headS3Object(zipDestKey);
    const aux = await promoteStagingAuxiliaryToCatalog(themeId, keys);
    const out = {
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
async function collectCatalogAssetKeysAsync(s3) {
    if (!s3)
        return [];
    const keys = [
        s3.zip?.key,
        s3.thumbnail?.key,
        s3.reactThemeJs?.key,
        s3.reactThemeCss?.key,
        s3.reactThemeSchema?.key,
        s3.reactThemeDefaultConfig?.key,
        s3.reactThemeManifest?.key,
    ].filter((k) => typeof k === 'string' && k.length > 0);
    if (s3.contentRoot?.prefix) {
        const under = await listAllObjectKeysUnderPrefix(s3.contentRoot.prefix);
        keys.push(...under);
    }
    return Array.from(new Set(keys));
}
async function deleteS3Keys(keys) {
    const uniq = Array.from(new Set(keys.filter(Boolean)));
    if (uniq.length === 0)
        return;
    const chunkSize = 1000;
    for (let i = 0; i < uniq.length; i += chunkSize) {
        const slice = uniq.slice(i, i + chunkSize);
        await s3_client_1.s3Client.send(new client_s3_1.DeleteObjectsCommand({
            Bucket: s3_client_1.awsBucket,
            Delete: {
                Objects: slice.map((Key) => ({ Key })),
                Quiet: true,
            },
        }));
    }
}
