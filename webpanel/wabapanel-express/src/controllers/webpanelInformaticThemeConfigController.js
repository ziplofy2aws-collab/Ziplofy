const WebpanelStore = require('../models/WebpanelStore');
const WebpanelStoreInformaticThemeConfig = require('../models/WebpanelStoreInformaticThemeConfig');
const { isInformaticThemeInstalled } = require('./webpanelInformaticInstalledThemeController');
const {
  fetchCatalogEditorPack,
  readSavedConfig,
  buildMergedThemeConfig,
} = require('../utils/webpanelInformaticThemeRuntime.util');
const {
  writeStoreInformaticThemeConfigFile,
  deleteStoreInformaticThemeConfigFile,
} = require('../utils/webpanelThemeConfigFile');
const {
  redactThemeConfigSecrets,
  mergeThemeConfigSecrets,
} = require('../utils/informaticThemeConfigSecrets.util');

async function assertStoreForUser(req, storeId) {
  const mongoose = require('mongoose');
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

function buildEditorPayload(storeId, themeId, pack, savedConfig) {
  const schema = pack.schema || null;
  const packDefaultConfig = pack.config || {};
  const manifest = pack.manifest || null;
  const themeMeta = pack.theme || {};

  if (!schema || !packDefaultConfig || typeof packDefaultConfig !== 'object') {
    const err = new Error('Theme editor pack is missing schema or default config');
    err.statusCode = 502;
    throw err;
  }

  const mergedConfig = buildMergedThemeConfig(pack, savedConfig);

  return {
    storeId: String(storeId),
    themeId: String(themeId),
    themeName: themeMeta.name || 'Informatic',
    schema,
    manifest,
    config: redactThemeConfigSecrets(mergedConfig),
    packDefaultConfig: structuredClone(packDefaultConfig),
    saved: Boolean(savedConfig),
    canPersist: true,
    themeRuntime: {
      themeJsUrl: pack.assets?.themeJsUrl ?? themeMeta.themeJsUrl ?? null,
      themeCssUrl: pack.assets?.themeCssUrl ?? themeMeta.themeCssUrl ?? null,
    },
  };
}

/** @GET /api/stores/:storeId/informatic-theme-config/:themeId */
const getStoreInformaticThemeConfig = async (req, res) => {
  try {
    const { storeId, themeId } = req.params;
    await assertStoreForUser(req, storeId);

    const installed = await isInformaticThemeInstalled(storeId, themeId);
    if (!installed) {
      return res.status(403).json({
        success: false,
        message: 'Install this theme before customizing it.',
        code: 'THEME_NOT_INSTALLED',
      });
    }

    const pack = await fetchCatalogEditorPack(themeId);
    const savedConfig = await readSavedConfig(storeId, themeId);
    const data = buildEditorPayload(storeId, themeId, pack, savedConfig);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to load Informatic theme config',
    });
  }
};

/** @PUT /api/stores/:storeId/informatic-theme-config/:themeId */
const saveStoreInformaticThemeConfig = async (req, res) => {
  try {
    const { storeId, themeId } = req.params;
    const { config } = req.body || {};
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return res.status(400).json({ success: false, message: 'config object is required' });
    }

    const store = await assertStoreForUser(req, storeId);

    const installed = await isInformaticThemeInstalled(storeId, themeId);
    if (!installed) {
      return res.status(403).json({
        success: false,
        message: 'Install this theme before saving customizations.',
        code: 'THEME_NOT_INSTALLED',
      });
    }

    await fetchCatalogEditorPack(themeId);

    const existingSaved = await readSavedConfig(storeId, themeId);
    const configToSave = mergeThemeConfigSecrets(config, existingSaved);

    writeStoreInformaticThemeConfigFile(storeId, themeId, configToSave);

    await WebpanelStoreInformaticThemeConfig.findOneAndUpdate(
      { store: storeId, informaticThemeId: String(themeId) },
      {
        $set: {
          store: storeId,
          informaticThemeId: String(themeId),
          config: configToSave,
        },
      },
      { upsert: true, new: true }
    );

    store.appliedTheme = String(themeId);
    await store.save();

    res.json({
      success: true,
      message: 'Informatic theme saved',
      data: { storeId, themeId, saved: true, appliedTheme: store.appliedTheme },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to save Informatic theme config',
    });
  }
};

/** @DELETE /api/stores/:storeId/informatic-theme-config/:themeId — reset to catalog defaults */
const resetStoreInformaticThemeConfig = async (req, res) => {
  try {
    const { storeId, themeId } = req.params;
    await assertStoreForUser(req, storeId);

    const installed = await isInformaticThemeInstalled(storeId, themeId);
    if (!installed) {
      return res.status(403).json({
        success: false,
        message: 'Install this theme before resetting customizations.',
        code: 'THEME_NOT_INSTALLED',
      });
    }

    await WebpanelStoreInformaticThemeConfig.deleteOne({
      store: storeId,
      informaticThemeId: String(themeId),
    });
    deleteStoreInformaticThemeConfigFile(storeId, themeId);
    const pack = await fetchCatalogEditorPack(themeId);
    const data = buildEditorPayload(storeId, themeId, pack, null);
    res.json({ success: true, message: 'Theme config reset to defaults', data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to reset Informatic theme config',
    });
  }
};

module.exports = {
  getStoreInformaticThemeConfig,
  saveStoreInformaticThemeConfig,
  resetStoreInformaticThemeConfig,
};
