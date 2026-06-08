"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImagesFromS3 = exports.generateThemeUploadSignedUrl = exports.generateImageUploadSignedUrl = void 0;
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const error_utils_1 = require("../utils/error.utils");
const s3_client_1 = require("../utils/s3-client");
const theme_s3_ingest_1 = require("../utils/theme-s3-ingest");
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);
const sanitizeFilename = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
const extractS3KeyFromUrl = (imageUrl) => {
    try {
        const parsed = new URL(imageUrl);
        const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
        return key || null;
    }
    catch {
        return null;
    }
};
exports.generateImageUploadSignedUrl = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const awsBucket = s3_client_1.awsBucket;
    const { fileName, fileType, folder = 'uploads/images', expiresInSeconds = 900 } = req.body;
    if (!fileName || typeof fileName !== 'string') {
        throw new error_utils_1.CustomError('fileName is required', 400);
    }
    if (!fileType || typeof fileType !== 'string') {
        throw new error_utils_1.CustomError('fileType is required', 400);
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.has(fileType)) {
        throw new error_utils_1.CustomError('Unsupported fileType. Only image MIME types are allowed.', 400);
    }
    const safeExpires = Math.min(Math.max(Number(expiresInSeconds) || 900, 60), 3600);
    const parsedFolder = typeof folder === 'string' && folder.trim() ? folder.trim() : 'uploads/images';
    const extension = path_1.default.extname(fileName) || '';
    const baseName = sanitizeFilename(path_1.default.basename(fileName, extension)) || 'image';
    const key = `${parsedFolder.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${(0, crypto_1.randomUUID)()}-${baseName}${extension}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: awsBucket,
        Key: key,
        ContentType: fileType,
    });
    const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: safeExpires });
    const objectUrl = `https://${awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
    return res.status(200).json({
        success: true,
        message: 'Signed URL generated',
        data: {
            signedUrl,
            key,
            bucket: awsBucket,
            region: s3_client_1.awsRegion,
            method: 'PUT',
            contentType: fileType,
            expiresInSeconds: safeExpires,
            objectUrl,
        },
    });
});
const THEME_ZIP_MIMES = new Set([
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
]);
const THEME_JS_MIMES = new Set(['application/javascript', 'text/javascript']);
const THEME_CSS_MIMES = new Set(['text/css']);
/** Presigned PUT for admin theme pipeline: browser uploads directly to S3, then POST /themes/from-s3 finalizes. */
exports.generateThemeUploadSignedUrl = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const awsBucket = s3_client_1.awsBucket;
    const userId = req.user?.id;
    if (!userId || typeof userId !== 'string') {
        throw new error_utils_1.CustomError('Unauthorized', 401);
    }
    const body = req.body;
    const { sessionId, fileName, fileType, assetKind, expiresInSeconds = 900 } = body;
    if (!sessionId || typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(sessionId)) {
        throw new error_utils_1.CustomError('sessionId is required (8-80 chars: letters, numbers, hyphens). Generate one UUID per upload batch.', 400);
    }
    if (!fileName || typeof fileName !== 'string') {
        throw new error_utils_1.CustomError('fileName is required', 400);
    }
    if (!fileType || typeof fileType !== 'string') {
        throw new error_utils_1.CustomError('fileType is required', 400);
    }
    if (!assetKind ||
        ![
            'zip',
            'thumbnail',
            'reactJs',
            'reactCss',
            'themeSchema',
            'themeDefaultConfig',
            'themeManifest',
            'themeFile',
        ].includes(assetKind)) {
        throw new error_utils_1.CustomError('assetKind must be zip | thumbnail | reactJs | reactCss | themeSchema | themeDefaultConfig | themeManifest | themeFile', 400);
    }
    const safeExpires = Math.min(Math.max(Number(expiresInSeconds) || 900, 60), 3600);
    const isAllowedThemeStaticMime = (ct) => {
        const t = (ct || '').trim().toLowerCase();
        if (!t || t === 'application/octet-stream')
            return true;
        if (t.startsWith('text/') || t.startsWith('image/') || t.startsWith('font/') || t.startsWith('video/')) {
            return true;
        }
        return ['application/json', 'application/javascript', 'application/wasm'].includes(t);
    };
    if (assetKind === 'themeFile') {
        const rp = body.relativePath;
        if (!rp || typeof rp !== 'string') {
            throw new error_utils_1.CustomError('relativePath is required for themeFile (path within the theme folder)', 400);
        }
        if (!fileName || typeof fileName !== 'string') {
            throw new error_utils_1.CustomError('fileName is required', 400);
        }
        if (!isAllowedThemeStaticMime(fileType)) {
            throw new error_utils_1.CustomError('Unsupported fileType for themeFile upload.', 400);
        }
        const ct = fileType.trim() || 'application/octet-stream';
        const key = (0, theme_s3_ingest_1.stagingThemeFileKey)(userId, sessionId, rp);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: awsBucket,
            Key: key,
            ContentType: ct,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: safeExpires });
        const objectUrl = `https://${awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
        return res.status(200).json({
            success: true,
            message: 'Signed URL generated',
            data: {
                signedUrl,
                key,
                bucket: awsBucket,
                region: s3_client_1.awsRegion,
                method: 'PUT',
                contentType: ct,
                expiresInSeconds: safeExpires,
                objectUrl,
            },
        });
    }
    let contentType = fileType;
    const ext = path_1.default.extname(fileName).toLowerCase();
    if (assetKind === 'zip') {
        if (ext !== '.zip') {
            throw new error_utils_1.CustomError('ZIP upload must use a .zip file name.', 400);
        }
        if (!THEME_ZIP_MIMES.has(fileType)) {
            throw new error_utils_1.CustomError('Unsupported ZIP MIME type.', 400);
        }
        if (fileType === 'application/octet-stream') {
            contentType = 'application/zip';
        }
        const base = sanitizeFilename(path_1.default.basename(fileName, ext)) || 'liquid-theme';
        const key = `themes/staging/${userId}/${sessionId}/${base}${ext}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: awsBucket,
            Key: key,
            ContentType: contentType,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: safeExpires });
        const objectUrl = `https://${awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
        return res.status(200).json({
            success: true,
            message: 'Signed URL generated',
            data: {
                signedUrl,
                key,
                bucket: awsBucket,
                region: s3_client_1.awsRegion,
                method: 'PUT',
                contentType,
                expiresInSeconds: safeExpires,
                objectUrl,
            },
        });
    }
    if (assetKind === 'thumbnail') {
        if (!ALLOWED_IMAGE_MIME_TYPES.has(fileType)) {
            throw new error_utils_1.CustomError('Thumbnail must be a supported image MIME type.', 400);
        }
        const extension = ext || (fileType.includes('png') ? '.png' : fileType.includes('webp') ? '.webp' : '.jpg');
        const base = sanitizeFilename(path_1.default.basename(fileName, ext)) || 'thumbnail';
        const key = `themes/staging/${userId}/${sessionId}/thumb-${(0, crypto_1.randomUUID)()}-${base}${extension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: awsBucket,
            Key: key,
            ContentType: fileType,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: safeExpires });
        const objectUrl = `https://${awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
        return res.status(200).json({
            success: true,
            message: 'Signed URL generated',
            data: {
                signedUrl,
                key,
                bucket: awsBucket,
                region: s3_client_1.awsRegion,
                method: 'PUT',
                contentType: fileType,
                expiresInSeconds: safeExpires,
                objectUrl,
            },
        });
    }
    if (assetKind === 'reactJs') {
        if (ext !== '.js') {
            throw new error_utils_1.CustomError('Remote theme JS must be a .js file.', 400);
        }
        let ct = (fileType && fileType.trim()) || 'application/javascript';
        if (ct === 'application/octet-stream')
            ct = 'application/javascript';
        if (!THEME_JS_MIMES.has(ct)) {
            throw new error_utils_1.CustomError('Unsupported JavaScript MIME type for reactJs.', 400);
        }
        const key = `themes/staging/${userId}/${sessionId}/remote-theme-${(0, crypto_1.randomUUID)()}.js`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: awsBucket,
            Key: key,
            ContentType: ct,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: safeExpires });
        const objectUrl = `https://${awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
        return res.status(200).json({
            success: true,
            message: 'Signed URL generated',
            data: {
                signedUrl,
                key,
                bucket: awsBucket,
                region: s3_client_1.awsRegion,
                method: 'PUT',
                contentType: ct,
                expiresInSeconds: safeExpires,
                objectUrl,
            },
        });
    }
    const jsonThemeAssetKinds = ['themeSchema', 'themeDefaultConfig', 'themeManifest'];
    if (jsonThemeAssetKinds.includes(assetKind)) {
        if (ext !== '.json') {
            throw new error_utils_1.CustomError('Theme metadata files must be .json', 400);
        }
        const fixedName = assetKind === 'themeSchema'
            ? 'theme.schema.json'
            : assetKind === 'themeDefaultConfig'
                ? 'theme.default-config.json'
                : 'theme.manifest.json';
        let ct = (fileType && fileType.trim()) || 'application/json';
        if (ct === 'application/octet-stream')
            ct = 'application/json';
        const key = `themes/staging/${userId}/${sessionId}/${fixedName}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: awsBucket,
            Key: key,
            ContentType: ct,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: safeExpires });
        const objectUrl = `https://${awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
        return res.status(200).json({
            success: true,
            message: 'Signed URL generated',
            data: {
                signedUrl,
                key,
                bucket: awsBucket,
                region: s3_client_1.awsRegion,
                method: 'PUT',
                contentType: ct,
                expiresInSeconds: safeExpires,
                objectUrl,
            },
        });
    }
    // reactCss
    if (ext !== '.css') {
        throw new error_utils_1.CustomError('Remote theme CSS must be a .css file.', 400);
    }
    let ctCss = (fileType && fileType.trim()) || 'text/css';
    if (ctCss === 'application/octet-stream')
        ctCss = 'text/css';
    if (!THEME_CSS_MIMES.has(ctCss)) {
        throw new error_utils_1.CustomError('Unsupported CSS MIME type.', 400);
    }
    const key = `themes/staging/${userId}/${sessionId}/remote-theme-${(0, crypto_1.randomUUID)()}.css`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: awsBucket,
        Key: key,
        ContentType: ctCss,
    });
    const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_client_1.s3Client, command, { expiresIn: safeExpires });
    const objectUrl = `https://${awsBucket}.s3.${s3_client_1.awsRegion}.amazonaws.com/${key}`;
    return res.status(200).json({
        success: true,
        message: 'Signed URL generated',
        data: {
            signedUrl,
            key,
            bucket: awsBucket,
            region: s3_client_1.awsRegion,
            method: 'PUT',
            contentType: ctCss,
            expiresInSeconds: safeExpires,
            objectUrl,
        },
    });
});
exports.deleteImagesFromS3 = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const awsBucket = s3_client_1.awsBucket;
    const { imageUrls, imageKeys } = req.body;
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
        throw new error_utils_1.CustomError('Provide a non-empty imageKeys or imageUrls array', 400);
    }
    const parsedKeysFromUrls = normalizedImageUrls
        .map((url) => extractS3KeyFromUrl(url))
        .filter((key) => Boolean(key));
    const keys = Array.from(new Set([...normalizedImageKeys, ...parsedKeysFromUrls]));
    if (keys.length === 0) {
        throw new error_utils_1.CustomError('No valid S3 image keys found from payload', 400);
    }
    const deleteCommand = new client_s3_1.DeleteObjectsCommand({
        Bucket: awsBucket,
        Delete: {
            Objects: keys.map((key) => ({ Key: key })),
            Quiet: false,
        },
    });
    const deleteResult = await s3_client_1.s3Client.send(deleteCommand);
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
        throw new error_utils_1.CustomError(`Failed to delete one or more images from S3: ${details}`, 500);
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
