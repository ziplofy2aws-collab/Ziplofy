const axios = require('axios');
const WebpanelStoreInformaticThemeConfig = require('../models/WebpanelStoreInformaticThemeConfig');
const { isInformaticThemeInstalled } = require('../controllers/webpanelInformaticInstalledThemeController');
const WebpanelStore = require('../models/WebpanelStore');
const { deepMerge } = require('./deepMerge');
const {
  loadReferencePackConfig,
  patchInformaticRuntimeTemplates,
  patchInformaticEditorPack,
} = require('./informaticRuntimeTemplates.util');
const { readStoreInformaticThemeConfigFile } = require('./webpanelThemeConfigFile');
const { enrichInformaticWhatsappWidgetConfig } = require('./informaticThemeWhatsapp.util');

const CODIIC_API_BASE = (
  process.env.CODIIC_API_URL ||
  process.env.CODIIC_SERVER_URL ||
  'http://127.0.0.1:5000/api'
).replace(/\/$/, '');

async function fetchCatalogEditorPack(themeId) {
  const res = await axios.get(`${CODIIC_API_BASE}/informatic-themes/${themeId}/editor-pack`, {
    timeout: 30000,
  });
  if (!res.data?.success || !res.data?.data) {
    const err = new Error('Informatic theme editor pack not found');
    err.statusCode = 404;
    throw err;
  }
  return patchInformaticEditorPack(res.data.data);
}

async function readSavedConfig(storeId, themeId) {
  const row = await WebpanelStoreInformaticThemeConfig.findOne({
    store: storeId,
    informaticThemeId: String(themeId),
  }).lean();
  const fromFile = readStoreInformaticThemeConfigFile(storeId, themeId);
  return row?.config || fromFile || null;
}

function buildMergedThemeConfig(pack, savedConfig) {
  const packDefaultConfig = pack.config || {};
  if (!packDefaultConfig || typeof packDefaultConfig !== 'object') {
    const err = new Error('Theme editor pack is missing default config');
    err.statusCode = 502;
    throw err;
  }
  const reference = loadReferencePackConfig();
  const merged = savedConfig
    ? deepMerge(structuredClone(packDefaultConfig), savedConfig)
    : structuredClone(packDefaultConfig);
  return patchInformaticRuntimeTemplates(merged, reference || packDefaultConfig);
}

/**
 * Resolve live Informatic theme payload for a webpanel store storefront.
 * Returns null when no applied + installed theme is configured.
 */
async function resolveStoreInformaticThemeRuntime(storeId, appliedThemeId) {
  const themeId = appliedThemeId ? String(appliedThemeId).trim() : '';
  if (!themeId) {
    return null;
  }

  const installed = await isInformaticThemeInstalled(storeId, themeId);
  if (!installed) {
    return null;
  }

  const pack = await fetchCatalogEditorPack(themeId);
  const savedConfig = await readSavedConfig(storeId, themeId);
  const themeMeta = pack.theme || {};
  let mergedConfig = buildMergedThemeConfig(pack, savedConfig);

  const store = await WebpanelStore.findById(storeId).populate('workspace').lean();
  if (store?.workspace) {
    mergedConfig = enrichInformaticWhatsappWidgetConfig(mergedConfig, store.workspace);
  }

  return {
    storeId: String(storeId),
    themeId,
    themeName: themeMeta.name || 'Informatic',
    themeKind: 'catalog',
    isStoreCustomTheme: false,
    themeConfig: mergedConfig,
    remoteThemeJsUrl: pack.assets?.themeJsUrl ?? themeMeta.themeJsUrl ?? null,
    remoteThemeCssUrl: pack.assets?.themeCssUrl ?? themeMeta.themeCssUrl ?? null,
    hasSavedConfig: Boolean(savedConfig),
  };
}

module.exports = {
  fetchCatalogEditorPack,
  readSavedConfig,
  buildMergedThemeConfig,
  resolveStoreInformaticThemeRuntime,
  patchInformaticEditorPack,
};
