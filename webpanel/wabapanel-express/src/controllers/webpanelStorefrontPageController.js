const mongoose = require('mongoose');
const WebpanelStorePage = require('../models/WebpanelStorePage');
const { slugifyHandle } = require('../utils/slug.util');

function assertValidStoreId(storeId) {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    const err = new Error('Valid storeId is required');
    err.statusCode = 400;
    throw err;
  }
}

function normalizeHandle(raw) {
  try {
    return slugifyHandle(decodeURIComponent(String(raw || '').trim()));
  } catch {
    return slugifyHandle(String(raw || '').trim());
  }
}

function isPreviewRequest(req) {
  const preview = req.query.preview;
  return preview === '1' || preview === 'true';
}

function serializePublicPage(row) {
  return {
    _id: String(row._id),
    title: row.title,
    content: row.content || '',
    pageTitle: row.pageTitle || '',
    metaDescription: row.metaDescription || '',
    urlHandle: row.urlHandle,
    visibility: row.visibility || 'hidden',
    themeTemplate: row.themeTemplate || 'default',
    updatedAt: row.updatedAt,
  };
}

/** GET /api/storefront/:storeId/pages */
const listStorefrontPages = async (req, res) => {
  try {
    const { storeId } = req.params;
    assertValidStoreId(storeId);
    const preview = isPreviewRequest(req);
    const filter = { store: storeId };
    if (!preview) filter.visibility = 'visible';

    const rows = await WebpanelStorePage.find(filter).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: rows.map(serializePublicPage), count: rows.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list pages' });
  }
};

/** GET /api/storefront/:storeId/pages/by-handle/:urlHandle */
const getStorefrontPageByHandle = async (req, res) => {
  try {
    const { storeId, urlHandle } = req.params;
    assertValidStoreId(storeId);
    const handle = normalizeHandle(urlHandle);
    const preview = isPreviewRequest(req);

    const filter = { store: storeId, urlHandle: handle };
    if (!preview) filter.visibility = 'visible';

    let row = await WebpanelStorePage.findOne(filter).lean();
    if (!row && handle) {
      const fuzzyFilter = { store: storeId };
      if (!preview) fuzzyFilter.visibility = 'visible';
      const candidates = await WebpanelStorePage.find(fuzzyFilter).lean();
      row = candidates.find((p) => normalizeHandle(p.urlHandle) === handle) || null;
    }

    if (!row) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, data: serializePublicPage(row) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get page' });
  }
};

module.exports = {
  listStorefrontPages,
  getStorefrontPageByHandle,
};
