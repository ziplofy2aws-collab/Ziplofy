"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAppliedStoreTheme = resolveAppliedStoreTheme;
exports.catalogPublicUrlForRelativePath = catalogPublicUrlForRelativePath;
exports.listCatalogThemeFilesFromS3 = listCatalogThemeFilesFromS3;
exports.listLiquidTemplateNamesFromS3 = listLiquidTemplateNamesFromS3;
exports.isSafeLiquidTemplateName = isSafeLiquidTemplateName;
exports.resolveStorefrontLiquidRenderRoot = resolveStorefrontLiquidRenderRoot;
exports.themeHasLiquidTemplates = themeHasLiquidTemplates;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = require("mongoose");
const custom_theme_model_1 = require("../models/custom-theme.model");
const installed_themes_model_1 = require("../models/installed-themes.model");
const store_model_1 = require("../models/store/store.model");
const theme_model_1 = require("../models/theme.model");
const theme_s3_ingest_1 = require("./theme-s3-ingest");
const theme_zip_from_s3_util_1 = require("./theme-zip-from-s3.util");
async function resolveAppliedStoreTheme(storeId) {
    const storeDoc = await store_model_1.Store.findById(storeId).select('appliedTheme').lean();
    const appliedThemeId = storeDoc?.appliedTheme ? String(storeDoc.appliedTheme) : null;
    if (!appliedThemeId)
        return null;
    const installed = await installed_themes_model_1.InstalledThemes.findOne({
        store: new mongoose_1.Types.ObjectId(storeId),
        theme: new mongoose_1.Types.ObjectId(appliedThemeId),
        uninstalledAt: null,
    }).lean();
    if (!installed)
        return null;
    const theme = await theme_model_1.Theme.findById(appliedThemeId).lean();
    const customTheme = !theme ? await custom_theme_model_1.CustomTheme.findById(appliedThemeId).lean() : null;
    if (!theme && !customTheme)
        return null;
    const isCustomTheme = Boolean(!theme && customTheme);
    const runtimeThemeKey = isCustomTheme ? `custom-${appliedThemeId}` : appliedThemeId;
    const s3 = (theme?.s3Assets ?? null);
    const jsUrl = s3?.reactThemeJs?.url ??
        (s3?.reactThemeJs?.key ? (0, theme_s3_ingest_1.publicObjectUrlForKey)(s3.reactThemeJs.key) : null);
    const cssUrl = s3?.reactThemeCss?.url ??
        (s3?.reactThemeCss?.key ? (0, theme_s3_ingest_1.publicObjectUrlForKey)(s3.reactThemeCss.key) : null);
    return {
        storeId,
        appliedThemeId,
        themeName: isCustomTheme
            ? customTheme?.name ?? null
            : theme?.name ?? null,
        isCustomTheme,
        runtimeThemeKey,
        s3Assets: s3,
        remoteThemeJsUrl: jsUrl,
        remoteThemeCssUrl: cssUrl,
    };
}
/** Public HTTPS URL for a file under catalog `contentRoot` (no local download). */
function catalogPublicUrlForRelativePath(s3Assets, relativePath) {
    const rel = relativePath.replace(/^\/+/, '').replace(/\\/g, '/');
    if (!rel || rel.includes('..'))
        return null;
    if (rel === 'theme.js' || rel.endsWith('/theme.js')) {
        return s3Assets.reactThemeJs?.url ?? null;
    }
    if (rel === 'theme.css' || rel.endsWith('/theme.css')) {
        return s3Assets.reactThemeCss?.url ?? null;
    }
    const prefix = s3Assets.contentRoot?.prefix;
    if (!prefix)
        return null;
    const root = prefix.endsWith('/') ? prefix : `${prefix}/`;
    return (0, theme_s3_ingest_1.publicObjectUrlForKey)(`${root}${rel}`);
}
async function listCatalogThemeFilesFromS3(s3Assets) {
    if (!s3Assets.contentRoot?.prefix)
        return [];
    const root = s3Assets.contentRoot.prefix.endsWith('/')
        ? s3Assets.contentRoot.prefix
        : `${s3Assets.contentRoot.prefix}/`;
    const keys = await (0, theme_s3_ingest_1.listAllObjectKeysUnderPrefix)(root);
    return keys.map((key) => ({
        relativePath: key.slice(root.length),
        url: (0, theme_s3_ingest_1.publicObjectUrlForKey)(key),
    }));
}
const LIQUID_TEMPLATE_NAME = /^[a-z][a-z0-9_-]{0,63}$/;
async function listLiquidTemplateNamesFromS3(s3Assets) {
    const files = await listCatalogThemeFilesFromS3(s3Assets);
    return files
        .filter((f) => f.relativePath.startsWith('templates/') && f.relativePath.endsWith('.liquid'))
        .map((f) => path_1.default.basename(f.relativePath, '.liquid'))
        .filter((name) => LIQUID_TEMPLATE_NAME.test(name))
        .sort();
}
function isSafeLiquidTemplateName(name) {
    return typeof name === 'string' && LIQUID_TEMPLATE_NAME.test(name);
}
/** Legacy liquid SSR: custom themes use disk; catalog themes still sync on render only. */
async function resolveStorefrontLiquidRenderRoot(storeId, resolved) {
    const host = process.env.PUBLIC_API_HOST || 'localhost';
    const protocol = process.env.PUBLIC_API_PROTOCOL || 'http';
    if (resolved.isCustomTheme) {
        const storeThemeDir = path_1.default.join(process.cwd(), 'uploads', 'stores', storeId, 'themes', resolved.runtimeThemeKey);
        const unzippedThemeDir = path_1.default.join(storeThemeDir, 'unzippedTheme');
        const runtimeBaseDir = fs_1.default.existsSync(unzippedThemeDir) ? unzippedThemeDir : storeThemeDir;
        const runtimeBaseUrl = `${protocol}://${host}/api/themes/installed/${encodeURIComponent(storeId)}/${encodeURIComponent(resolved.runtimeThemeKey)}/runtime`;
        return { runtimeBaseDir, runtimeBaseUrl };
    }
    if (!resolved.s3Assets?.contentRoot?.prefix)
        return null;
    const theme = await theme_model_1.Theme.findById(resolved.appliedThemeId).lean();
    if (!theme)
        return null;
    const runtimeBaseDir = await (0, theme_zip_from_s3_util_1.ensureCatalogThemeCodeDir)(theme);
    const root = resolved.s3Assets.contentRoot.prefix.endsWith('/')
        ? resolved.s3Assets.contentRoot.prefix
        : `${resolved.s3Assets.contentRoot.prefix}/`;
    const runtimeBaseUrl = (0, theme_s3_ingest_1.publicObjectUrlForKey)(root).replace(/\/$/, '');
    return { runtimeBaseDir, runtimeBaseUrl };
}
function themeHasLiquidTemplates(runtimeBaseDir) {
    return fs_1.default.existsSync(path_1.default.join(runtimeBaseDir, 'templates', 'index.liquid'));
}
