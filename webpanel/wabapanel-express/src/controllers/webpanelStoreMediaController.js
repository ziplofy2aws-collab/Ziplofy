const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const WebpanelStoreMedia = require('../models/WebpanelStoreMedia');
const s3Service = require('../services/s3Service');

function defaultStoreMediaFolder(storeId) {
  return `webpanel-stores/${storeId}/media`;
}

async function assertStoreForUser(req, storeId) {
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    const err = new Error('Invalid store id');
    err.statusCode = 400;
    throw err;
  }
  const store = await WebpanelStore.findOne({ _id: storeId, userId: req.user._id });
  if (!store) {
    const err = new Error('Store not found');
    err.statusCode = 404;
    throw err;
  }
  return store;
}

function serializeMedia(row) {
  const url = row.url || s3Service.getPublicObjectUrl(row.key) || '';
  return {
    _id: String(row._id),
    storeId: String(row.store),
    key: row.key,
    originalName: row.originalName || '',
    mimeType: row.mimeType || '',
    size: row.size || 0,
    url,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function extractS3KeyFromUrl(urlString, bucket) {
  if (!urlString || !bucket) return null;
  try {
    const u = new URL(String(urlString));
    const host = u.hostname.toLowerCase();
    const path = decodeURIComponent(u.pathname.replace(/^\/+/, ''));
    if (!path) return null;
    if (host === `${bucket}.s3.amazonaws.com` || host.startsWith(`${bucket}.s3.`)) {
      return path;
    }
    if (host.startsWith('s3.') && path.startsWith(`${bucket}/`)) {
      return path.slice(bucket.length + 1);
    }
  } catch {
    /* ignore malformed URLs */
  }
  return null;
}

async function resolveStoreMediaKey(storeId, urlOrKey) {
  const trimmed = String(urlOrKey || '').trim();
  if (!trimmed) return null;

  const expectedPrefix = `${defaultStoreMediaFolder(storeId)}/`;
  if (trimmed.startsWith(expectedPrefix)) return trimmed;

  const row = await WebpanelStoreMedia.findOne({
    store: storeId,
    $or: [{ url: trimmed }, { key: trimmed }],
  })
    .select('key')
    .lean();
  if (row?.key && String(row.key).startsWith(expectedPrefix)) {
    return row.key;
  }

  const meta = s3Service.getMeta();
  if (meta.bucket) {
    const fromUrl = extractS3KeyFromUrl(trimmed, meta.bucket);
    if (fromUrl?.startsWith(expectedPrefix)) return fromUrl;
  }

  return null;
}

/** GET /api/stores/:storeId/media/editor-proxy?url=... — same-origin blob for canvas export */
const proxyStoreMediaForEditor = async (req, res) => {
  try {
    const { storeId } = req.params;
    const source = req.query.url || req.query.key;
    await assertStoreForUser(req, storeId);

    const mediaKey = await resolveStoreMediaKey(storeId, source);
    if (!mediaKey) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unauthorized media URL for this store',
      });
    }

    const { buffer, contentType } = await s3Service.getObjectBuffer(mediaKey);
    const type = String(contentType || '').startsWith('image/') ? contentType : 'image/png';
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buffer);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to load media for editor',
    });
  }
};

/** GET /api/stores/:storeId/media */
const listStoreMedia = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const rows = await WebpanelStoreMedia.find({ store: storeId }).sort({ createdAt: -1 }).lean();
    const data = rows.map(serializeMedia);
    res.json({
      success: true,
      data,
      count: data.length,
      s3: s3Service.getMeta(),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to list store media',
    });
  }
};

/** POST /api/stores/:storeId/media/register */
const registerStoreMedia = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { key, originalName, mimeType, size, url } = req.body || {};
    await assertStoreForUser(req, storeId);

    const trimmedKey = String(key || '').trim();
    if (!trimmedKey) {
      return res.status(400).json({ success: false, message: 'key is required (S3 object key)' });
    }

    const expectedPrefix = `${defaultStoreMediaFolder(storeId)}/`;
    if (!trimmedKey.startsWith(expectedPrefix)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid key for this store',
      });
    }

    const objectUrl = url || s3Service.getPublicObjectUrl(trimmedKey) || '';

    let row;
    try {
      row = await WebpanelStoreMedia.create({
        store: storeId,
        userId: req.user._id,
        key: trimmedKey,
        originalName: String(originalName || '').trim(),
        mimeType: String(mimeType || '').trim(),
        size: Number(size) || 0,
        url: objectUrl,
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'This file is already registered for this store',
        });
      }
      throw err;
    }

    res.status(201).json({
      success: true,
      message: 'Media registered',
      data: serializeMedia(row.toObject()),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to register media',
    });
  }
};

/** DELETE /api/stores/:storeId/media/:mediaId */
const deleteStoreMedia = async (req, res) => {
  try {
    const { storeId, mediaId } = req.params;
    await assertStoreForUser(req, storeId);

    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({ success: false, message: 'Invalid media id' });
    }

    const row = await WebpanelStoreMedia.findOne({ _id: mediaId, store: storeId });
    if (!row) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    await s3Service.deleteObjects([row.key]);
    await row.deleteOne();

    res.json({
      success: true,
      message: 'Media deleted',
      data: { id: mediaId, key: row.key },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete media',
    });
  }
};

/** DELETE /api/stores/:storeId/media — remove all media for store */
const deleteAllStoreMedia = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);

    const rows = await WebpanelStoreMedia.find({ store: storeId }).select('key').lean();
    const keys = Array.from(new Set(rows.map((r) => r.key).filter(Boolean)));

    if (keys.length) {
      await s3Service.deleteObjects(keys);
    }

    const result = await WebpanelStoreMedia.deleteMany({ store: storeId });

    res.json({
      success: true,
      message: keys.length ? `Deleted ${keys.length} file(s) from S3 and database` : 'No media to delete',
      data: {
        deletedFromS3: keys.length,
        deletedFromDatabase: result.deletedCount || 0,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete all store media',
    });
  }
};

module.exports = {
  defaultStoreMediaFolder,
  listStoreMedia,
  registerStoreMedia,
  proxyStoreMediaForEditor,
  deleteStoreMedia,
  deleteAllStoreMedia,
};
