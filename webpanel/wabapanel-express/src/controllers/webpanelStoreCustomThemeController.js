const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const WebpanelStoreCustomTheme = require('../models/WebpanelStoreCustomTheme');

async function assertStoreOwnership(req, storeId) {
  if (!mongoose.isValidObjectId(storeId)) return null;
  const store = await WebpanelStore.findOne({ _id: storeId, userId: req.user._id });
  return store || null;
}

function parseThemeConfig(raw) {
  if (raw === null || raw === undefined) {
    const err = new Error('themeConfig is required');
    err.statusCode = 400;
    throw err;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    const err = new Error('themeConfig must be a JSON object');
    err.statusCode = 400;
    throw err;
  }
  return raw;
}

// @GET /api/stores/:storeId/custom-themes
const listStoreCustomThemes = async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await assertStoreOwnership(req, storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    const themes = await WebpanelStoreCustomTheme.find({ store: storeId })
      .sort({ updatedAt: -1 })
      .lean();
    const data = themes.map((t) => ({ ...t, storeId: t.store }));
    res.json({ success: true, data, count: data.length });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @POST /api/stores/:storeId/custom-themes
const createStoreCustomTheme = async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await assertStoreOwnership(req, storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    const { themeName, themeDesc, themeConfig } = req.body || {};
    const name = typeof themeName === 'string' ? themeName.trim() : '';
    if (!name) return res.status(400).json({ success: false, message: 'themeName is required' });

    const config = parseThemeConfig(themeConfig);
    const desc =
      themeDesc !== undefined && themeDesc !== null ? String(themeDesc).trim() : undefined;

    const created = await WebpanelStoreCustomTheme.create({
      store: storeId,
      themeName: name,
      ...(desc ? { themeDesc: desc } : {}),
      themeConfig: config,
    });
    res.status(201).json({ success: true, data: { ...created.toObject(), storeId } });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

async function loadOwnedTheme(req, id) {
  if (!mongoose.isValidObjectId(id)) return { error: 404 };
  const theme = await WebpanelStoreCustomTheme.findById(id);
  if (!theme) return { error: 404 };
  const store = await WebpanelStore.findOne({ _id: theme.store, userId: req.user._id });
  if (!store) return { error: 403 };
  return { theme, store };
}

// @PUT /api/custom-themes/:id
const updateStoreCustomTheme = async (req, res) => {
  try {
    const { theme, error } = await loadOwnedTheme(req, req.params.id);
    if (error) return res.status(error).json({ success: false, message: 'Theme not found' });

    const { themeName, themeDesc, themeConfig } = req.body || {};
    if (themeName !== undefined) {
      const name = String(themeName).trim();
      if (!name) return res.status(400).json({ success: false, message: 'themeName cannot be empty' });
      theme.themeName = name;
    }
    if (themeDesc !== undefined) {
      theme.themeDesc = themeDesc ? String(themeDesc).trim() : null;
    }
    if (themeConfig !== undefined) {
      theme.themeConfig = parseThemeConfig(themeConfig);
      theme.markModified('themeConfig');
    }
    await theme.save();
    res.json({ success: true, data: { ...theme.toObject(), storeId: theme.store } });
  } catch (e) {
    res.status(e.statusCode || 500).json({ success: false, message: e.message });
  }
};

// @DELETE /api/custom-themes/:id
const deleteStoreCustomTheme = async (req, res) => {
  try {
    const { theme, store, error } = await loadOwnedTheme(req, req.params.id);
    if (error) return res.status(error).json({ success: false, message: 'Theme not found' });
    if (store.appliedCustomThemeId && String(store.appliedCustomThemeId) === String(theme._id)) {
      store.appliedCustomThemeId = null;
      await store.save();
    }
    await theme.deleteOne();
    res.json({ success: true, data: { deletedId: req.params.id } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @POST /api/stores/:storeId/apply-custom-theme — mutually exclusive with appliedTheme
const applyCustomThemeForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { themeId } = req.body || {};
    const store = await assertStoreOwnership(req, storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    const theme = await WebpanelStoreCustomTheme.findOne({ _id: themeId, store: storeId });
    if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });

    store.appliedCustomThemeId = theme._id;
    store.appliedTheme = null;
    await store.save();
    res.json({ success: true, data: store });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// @GET /api/storefront/:storeId/custom-theme-runtime — public, consumed by webpanel-store-renderer
const getStorefrontCustomThemeRuntime = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!mongoose.isValidObjectId(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid storeId' });
    }
    const store = await WebpanelStore.findById(storeId)
      .select('appliedCustomThemeId storeName')
      .lean();
    if (!store?.appliedCustomThemeId) {
      return res.json({ success: true, data: null });
    }
    const theme = await WebpanelStoreCustomTheme.findById(store.appliedCustomThemeId).lean();
    if (!theme) return res.json({ success: true, data: null });
    res.json({
      success: true,
      data: {
        themeId: String(theme._id),
        themeName: theme.themeName,
        themeConfig: theme.themeConfig,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  listStoreCustomThemes,
  createStoreCustomTheme,
  updateStoreCustomTheme,
  deleteStoreCustomTheme,
  applyCustomThemeForStore,
  getStorefrontCustomThemeRuntime,
};
