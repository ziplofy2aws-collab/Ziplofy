const mongoose = require('mongoose');
const WebpanelStorePage = require('../models/WebpanelStorePage');
const { VISIBILITY } = require('../models/WebpanelStorePage');
const { slugifyHandle } = require('../utils/slug.util');
const { assertStoreForUser } = require('../utils/webpanelStoreAccess.util');
const { isReservedStorePageHandle } = require('../utils/reservedStorePageHandles.util');

function normalizeUrlHandle(raw, title) {
  const handle = slugifyHandle(raw || title);
  if (!/^[a-z0-9-]+$/.test(handle)) {
    const err = new Error('Valid URL handle is required');
    err.statusCode = 400;
    throw err;
  }
  if (isReservedStorePageHandle(handle)) {
    const err = new Error('This URL handle is reserved by the theme and cannot be used for a custom page');
    err.statusCode = 400;
    throw err;
  }
  return handle.slice(0, 100);
}

function normalizeVisibility(value) {
  return VISIBILITY.includes(value) ? value : 'hidden';
}

function normalizeThemeTemplate(value) {
  const template = typeof value === 'string' ? value.trim() : 'default';
  if (!template || template === 'default') return 'default';
  if (/^pages\.[a-z0-9-]+$/.test(template)) return template;
  return 'default';
}

function serializePage(row) {
  return {
    _id: String(row._id),
    storeId: String(row.store),
    title: row.title,
    content: row.content || '',
    pageTitle: row.pageTitle || '',
    metaDescription: row.metaDescription || '',
    urlHandle: row.urlHandle,
    visibility: row.visibility || 'hidden',
    themeTemplate: row.themeTemplate || 'default',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assertPageForStore(storeId, pageId) {
  if (!mongoose.Types.ObjectId.isValid(pageId)) {
    const err = new Error('Invalid page id');
    err.statusCode = 400;
    throw err;
  }
  const page = await WebpanelStorePage.findOne({ _id: pageId, store: storeId });
  if (!page) {
    const err = new Error('Page not found for this store');
    err.statusCode = 404;
    throw err;
  }
  return page;
}

/** GET /api/stores/:storeId/pages */
const listStorePages = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const rows = await WebpanelStorePage.find({ store: storeId }).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: rows.map(serializePage), count: rows.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list pages' });
  }
};

/** POST /api/stores/:storeId/pages */
const createStorePage = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const { title, content, pageTitle, metaDescription, urlHandle, visibility, themeTemplate } = req.body || {};
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }
    const handle = normalizeUrlHandle(urlHandle, title.trim());
    const existing = await WebpanelStorePage.findOne({ store: storeId, urlHandle: handle }).select('_id').lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'A page with this URL handle already exists' });
    }
    const row = await WebpanelStorePage.create({
      store: storeId,
      userId: req.user._id,
      title: title.trim(),
      content: typeof content === 'string' ? content : '',
      pageTitle: (pageTitle?.trim() || title.trim()).slice(0, 70),
      metaDescription: typeof metaDescription === 'string' ? metaDescription.trim().slice(0, 320) : '',
      urlHandle: handle,
      visibility: normalizeVisibility(visibility),
      themeTemplate: normalizeThemeTemplate(themeTemplate),
    });
    res.status(201).json({ success: true, data: serializePage(row), message: 'Page created' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to create page' });
  }
};

function normalizeUrlHandleParam(raw) {
  try {
    return slugifyHandle(decodeURIComponent(String(raw || '').trim()));
  } catch {
    return slugifyHandle(String(raw || '').trim());
  }
}

/** GET /api/stores/:storeId/pages/by-handle/:urlHandle — editor preview (includes hidden pages) */
const getStorePageByHandle = async (req, res) => {
  try {
    const { storeId, urlHandle } = req.params;
    await assertStoreForUser(req, storeId);
    const handle = normalizeUrlHandleParam(urlHandle);
    let row = await WebpanelStorePage.findOne({ store: storeId, urlHandle: handle }).lean();
    if (!row && handle) {
      const candidates = await WebpanelStorePage.find({ store: storeId }).lean();
      row = candidates.find((p) => normalizeUrlHandleParam(p.urlHandle) === handle) || null;
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, data: serializePage(row) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get page' });
  }
};

/** GET /api/stores/:storeId/pages/:pageId */
const getStorePage = async (req, res) => {
  try {
    const { storeId, pageId } = req.params;
    await assertStoreForUser(req, storeId);
    const page = await assertPageForStore(storeId, pageId);
    res.json({ success: true, data: serializePage(page) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get page' });
  }
};

/** PUT /api/stores/:storeId/pages/:pageId */
const updateStorePage = async (req, res) => {
  try {
    const { storeId, pageId } = req.params;
    await assertStoreForUser(req, storeId);
    const page = await assertPageForStore(storeId, pageId);
    const { title, content, pageTitle, metaDescription, urlHandle, visibility, themeTemplate } = req.body || {};

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: 'title cannot be empty' });
      }
      page.title = String(title).trim();
    }
    if (content !== undefined) page.content = typeof content === 'string' ? content : '';
    if (pageTitle !== undefined) page.pageTitle = String(pageTitle).trim().slice(0, 70);
    if (metaDescription !== undefined) page.metaDescription = String(metaDescription).trim().slice(0, 320);
    if (visibility !== undefined) page.visibility = normalizeVisibility(visibility);
    if (themeTemplate !== undefined) page.themeTemplate = normalizeThemeTemplate(themeTemplate);
    if (urlHandle !== undefined || title !== undefined) {
      const handle = normalizeUrlHandle(urlHandle ?? page.urlHandle, page.title);
      const duplicate = await WebpanelStorePage.findOne({
        store: storeId,
        urlHandle: handle,
        _id: { $ne: page._id },
      })
        .select('_id')
        .lean();
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'A page with this URL handle already exists' });
      }
      page.urlHandle = handle;
    }

    await page.save();
    res.json({ success: true, data: serializePage(page), message: 'Page updated' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update page' });
  }
};

/** DELETE /api/stores/:storeId/pages/:pageId */
const deleteStorePage = async (req, res) => {
  try {
    const { storeId, pageId } = req.params;
    await assertStoreForUser(req, storeId);
    const page = await assertPageForStore(storeId, pageId);
    await page.deleteOne();
    res.json({ success: true, deletedId: String(pageId), message: 'Page deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to delete page' });
  }
};

module.exports = {
  listStorePages,
  createStorePage,
  getStorePageByHandle,
  getStorePage,
  updateStorePage,
  deleteStorePage,
};
