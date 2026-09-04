const axios = require('axios');
const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const WebpanelInformaticInstalledTheme = require('../models/WebpanelInformaticInstalledTheme');

const CODIIC_API_BASE = (
  process.env.CODIIC_API_URL ||
  process.env.CODIIC_SERVER_URL ||
  'http://127.0.0.1:5000/api'
).replace(/\/$/, '');

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

async function fetchCatalogTheme(themeId) {
  const res = await axios.get(`${CODIIC_API_BASE}/informatic-themes/${themeId}`, {
    timeout: 30000,
  });
  if (!res.data?.success || !res.data?.data) {
    const err = new Error('Informatic theme not found in catalog');
    err.statusCode = 404;
    throw err;
  }
  return res.data.data;
}

async function listInstalledRows(storeId) {
  return WebpanelInformaticInstalledTheme.find({
    store: storeId,
    uninstalledAt: null,
  })
    .sort({ installedAt: -1 })
    .lean();
}

async function enrichInstalledThemes(rows) {
  const results = await Promise.all(
    rows.map(async (row) => {
      let catalog = null;
      try {
        catalog = await fetchCatalogTheme(String(row.informaticThemeId));
      } catch {
        catalog = null;
      }
      return {
        installedThemeId: String(row._id),
        informaticThemeId: String(row.informaticThemeId),
        installedAt: row.installedAt,
        uninstalledAt: row.uninstalledAt,
        name: catalog?.name || 'Informatic theme',
        description: catalog?.description || '',
        version: catalog?.version || '1.0.0',
        plan: catalog?.plan || 'free',
        thumbnailUrl: catalog?.thumbnailUrl ?? null,
        hasRemoteTheme: Boolean(catalog?.hasRemoteTheme),
        isActive: catalog?.isActive !== false,
      };
    })
  );
  return results;
}

/** Returns true when theme is actively installed for the store. */
async function isInformaticThemeInstalled(storeId, themeId) {
  const row = await WebpanelInformaticInstalledTheme.findOne({
    store: storeId,
    informaticThemeId: String(themeId),
    uninstalledAt: null,
  }).lean();
  return Boolean(row);
}

/** @GET /api/stores/:storeId/informatic-installed-themes */
const listStoreInformaticInstalledThemes = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const rows = await listInstalledRows(storeId);
    const data = await enrichInstalledThemes(rows);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to list installed Informatic themes',
    });
  }
};

/** @POST /api/stores/:storeId/informatic-installed-themes */
const installInformaticThemeForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const themeId = String(req.body?.themeId || req.body?.informaticThemeId || '').trim();
    if (!themeId) {
      return res.status(400).json({ success: false, message: 'themeId is required' });
    }

    await assertStoreForUser(req, storeId);
    await fetchCatalogTheme(themeId);

    await WebpanelInformaticInstalledTheme.findOneAndUpdate(
      { store: storeId, informaticThemeId: themeId },
      {
        $set: {
          store: storeId,
          informaticThemeId: themeId,
          installedAt: new Date(),
          uninstalledAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const rows = await listInstalledRows(storeId);
    const data = await enrichInstalledThemes(rows);
    res.status(200).json({
      success: true,
      message: 'Theme installed',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to install Informatic theme',
    });
  }
};

/** @DELETE /api/stores/:storeId/informatic-installed-themes/:installedThemeId */
const uninstallInformaticThemeForStore = async (req, res) => {
  try {
    const { storeId, installedThemeId } = req.params;
    await assertStoreForUser(req, storeId);

    if (!mongoose.Types.ObjectId.isValid(installedThemeId)) {
      return res.status(400).json({ success: false, message: 'Invalid installedThemeId' });
    }

    const row = await WebpanelInformaticInstalledTheme.findOne({
      _id: installedThemeId,
      store: storeId,
      uninstalledAt: null,
    });
    if (!row) {
      return res.status(404).json({ success: false, message: 'Installed theme not found' });
    }

    row.uninstalledAt = new Date();
    await row.save();

    const store = await WebpanelStore.findById(storeId);
    if (store && store.appliedTheme && String(store.appliedTheme) === String(row.informaticThemeId)) {
      store.appliedTheme = null;
      await store.save();
    }

    const rows = await listInstalledRows(storeId);
    const data = await enrichInstalledThemes(rows);
    res.json({
      success: true,
      message: 'Theme uninstalled',
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to uninstall Informatic theme',
    });
  }
};

/** @POST /api/stores/:storeId/informatic-installed-themes/apply */
const applyInformaticThemeForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const themeId = String(req.body?.themeId || req.body?.informaticThemeId || '').trim();
    if (!themeId) {
      return res.status(400).json({ success: false, message: 'themeId is required' });
    }

    const store = await assertStoreForUser(req, storeId);

    const installed = await isInformaticThemeInstalled(storeId, themeId);
    if (!installed) {
      return res.status(403).json({
        success: false,
        message: 'Install this theme before applying it to your store.',
        code: 'THEME_NOT_INSTALLED',
      });
    }

    await fetchCatalogTheme(themeId);

    store.appliedTheme = String(themeId);
    await store.save();

    const rows = await listInstalledRows(storeId);
    const data = await enrichInstalledThemes(rows);
    res.json({
      success: true,
      message: 'Theme applied to store',
      data: {
        appliedTheme: store.appliedTheme,
        installedThemes: data,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to apply Informatic theme',
    });
  }
};

module.exports = {
  listStoreInformaticInstalledThemes,
  installInformaticThemeForStore,
  uninstallInformaticThemeForStore,
  applyInformaticThemeForStore,
  isInformaticThemeInstalled,
};
