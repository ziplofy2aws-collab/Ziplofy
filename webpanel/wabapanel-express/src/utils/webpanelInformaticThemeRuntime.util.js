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
const { injectInformaticDataSources } = require('./informaticIndustryData.util');

const {
  requireCodiicCatalogApiBase,
} = require('./codiicCatalogApi');

// Editor pack = catalog default config + schema + manifest read from S3 via
// codiic. It's identical for every storefront request, so cache briefly —
// saved config and live records still resolve per request.
const EDITOR_PACK_TTL_MS = 60_000;
const editorPackCache = new Map();

async function fetchCatalogEditorPack(themeId) {
  const key = String(themeId);
  const hit = editorPackCache.get(key);
  if (hit && Date.now() - hit.at < EDITOR_PACK_TTL_MS) return hit.pack;

  const base = requireCodiicCatalogApiBase();
  const res = await axios.get(`${base}/informatic-themes/${themeId}/editor-pack`, {
    timeout: 30000,
  });
  if (!res.data?.success || !res.data?.data) {
    const err = new Error('Informatic theme editor pack not found');
    err.statusCode = 404;
    throw err;
  }
  const pack = patchInformaticEditorPack(res.data.data);
  editorPackCache.set(key, { at: Date.now(), pack });
  return pack;
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
async function resolveStoreInformaticThemeRuntime(storeId, appliedThemeId, opts = {}) {
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
  mergedConfig = await injectInformaticDataSources(mergedConfig, {
    store,
    origin: opts.origin || '',
  });

  // Uploaded static themes ship their original files under s3Assets.contentRoot.
  // When present, the storefront renders the original site (real CSS/JS/routing)
  // via the theme-site route instead of the contract approximation.
  const hasStaticSite = Boolean(themeMeta.s3Assets?.contentRoot?.prefix);

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
    staticSiteUrl: hasStaticSite ? `/api/storefront/${storeId}/theme-site/${themeId}/` : null,
  };
}

module.exports = {
  fetchCatalogEditorPack,
  readSavedConfig,
  buildMergedThemeConfig,
  resolveStoreInformaticThemeRuntime,
  patchInformaticEditorPack,
};
