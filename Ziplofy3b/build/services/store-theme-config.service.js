"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCatalogThemeEditorPack = loadCatalogThemeEditorPack;
exports.loadStoreThemeConfig = loadStoreThemeConfig;
exports.saveStoreThemeConfig = saveStoreThemeConfig;
const mongoose_1 = require("mongoose");
const theme_model_1 = require("../models/theme.model");
const installed_themes_model_1 = require("../models/installed-themes.model");
const store_theme_config_model_1 = require("../models/store-theme-config.model");
const error_utils_1 = require("../utils/error.utils");
const theme_config_util_1 = require("../utils/theme-config.util");
const theme_pack_util_1 = require("../utils/theme-pack.util");
const installed_themes_query_util_1 = require("../utils/installed-themes-query.util");
const theme_pack_editor_util_1 = require("../utils/theme-pack-editor.util");
const theme_s3_ingest_1 = require("../utils/theme-s3-ingest");
function withResolvedS3Urls(s3) {
    const out = { ...s3 };
    for (const field of [
        "reactThemeJs",
        "reactThemeCss",
        "reactThemeSchema",
        "reactThemeDefaultConfig",
        "reactThemeManifest",
    ]) {
        const part = out[field];
        if (part?.key && !part.url) {
            out[field] = { ...part, url: (0, theme_s3_ingest_1.publicObjectUrlForKey)(part.key) };
        }
    }
    return out;
}
async function isThemeInstalled(storeId, themeId) {
    const installed = await installed_themes_model_1.InstalledThemes.findOne({
        $and: [
            { $or: (0, installed_themes_query_util_1.storeAndUserScopeOr)(storeId) },
            { theme: new mongoose_1.Types.ObjectId(themeId) },
            { uninstalledAt: null },
        ],
    }).lean();
    return Boolean(installed);
}
async function assertThemeInstalled(storeId, themeId) {
    if (!(await isThemeInstalled(storeId, themeId))) {
        throw new error_utils_1.CustomError("Theme is not installed for this store. Install it from Themes, then save your changes.", 404);
    }
}
function normalizePack(pack) {
    if (!pack)
        return { pack: null, blockCatalog: null };
    const prepared = (0, theme_pack_editor_util_1.prepareThemePackForEditor)(pack);
    return {
        pack: prepared,
        blockCatalog: (0, theme_pack_editor_util_1.buildBlockCatalogFromPack)(prepared),
    };
}
async function loadThemeAndPack(themeId) {
    let theme = await theme_model_1.Theme.findById(themeId).lean();
    if (!theme) {
        theme = await theme_model_1.Theme.findOne({ themePath: themeId }).lean();
    }
    if (!theme)
        throw new error_utils_1.CustomError("Theme not found", 404);
    const themePath = String(theme.themePath ?? "");
    const s3 = withResolvedS3Urls((theme.s3Assets ?? {}));
    const s3Refs = s3;
    const rawPack = await (0, theme_pack_util_1.loadThemePack)(themePath, s3Refs);
    const packLoadedFromS3 = Boolean(rawPack &&
        s3Refs.reactThemeSchema?.key &&
        s3Refs.reactThemeDefaultConfig?.key);
    const { pack, blockCatalog } = normalizePack(rawPack);
    if (!pack && !(0, theme_pack_util_1.hasSectionEditorPack)(null, s3Refs)) {
        throw new error_utils_1.CustomError("Theme editor pack not found. Upload theme.schema.json, theme.default-config.json, and theme.manifest.json with the theme.", 404);
    }
    return {
        theme: theme,
        themePath,
        s3,
        s3Refs,
        pack,
        blockCatalog,
        packLoadedFromS3,
    };
}
async function readSavedOverrides(storeId, themeId) {
    const storeRef = (0, installed_themes_query_util_1.canonicalStoreRef)(storeId);
    const themeRef = new mongoose_1.Types.ObjectId(themeId);
    const row = await store_theme_config_model_1.StoreThemeConfig.findOne({ store: storeRef, theme: themeRef }).lean();
    const fromFile = (0, theme_config_util_1.readStoreThemeConfigFile)(storeId, themeId);
    return row?.config ?? fromFile ?? undefined;
}
function themeRuntimeFromS3(s3) {
    return {
        jsUrl: s3?.reactThemeJs?.url ?? null,
        cssUrl: s3?.reactThemeCss?.url ?? null,
    };
}
function buildPayloadFromPack(base, pack, storeOverrides, installed) {
    const merged = pack
        ? (0, theme_pack_util_1.mergeThemePackConfig)(storeOverrides, pack)
        : storeOverrides;
    const schema = pack ? (0, theme_pack_util_1.flattenEditorSchema)(pack.editorSchema) : theme_config_util_1.REACT_THEME_CONFIG_SCHEMA;
    const values = pack
        ? (0, theme_pack_util_1.formValuesFromPackConfig)(merged, schema, pack.editorSchema)
        : (0, theme_config_util_1.formValuesFromConfig)(merged);
    return {
        ...base,
        storeOverrides: storeOverrides ?? {},
        schema,
        config: merged,
        values,
        installed,
        canPersist: installed && Boolean(pack),
        notice: installed
            ? null
            : "Theme is not installed on this store — preview uses catalog defaults. Install the theme to save changes.",
    };
}
/** Catalog-only editor assets (schema, defaults, manifest, runtime URLs) for a theme id. */
async function loadCatalogThemeEditorPack(themeId) {
    const { theme, themePath, s3, pack, blockCatalog, packLoadedFromS3 } = await loadThemeAndPack(themeId);
    const schema = pack ? (0, theme_pack_util_1.flattenEditorSchema)(pack.editorSchema) : theme_config_util_1.REACT_THEME_CONFIG_SCHEMA;
    const values = pack
        ? (0, theme_pack_util_1.formValuesFromPackConfig)(pack.defaultConfig, schema, pack.editorSchema)
        : (0, theme_config_util_1.formValuesFromConfig)({});
    return {
        themeId,
        themeName: String(theme.name ?? "Theme"),
        themePath,
        configMode: pack ? "sections" : "flat",
        editorSchema: pack?.editorSchema ?? null,
        defaultConfig: pack?.defaultConfig ?? null,
        manifest: pack?.manifest ?? null,
        blockCatalog,
        packLoadedFromS3,
        values,
        themeRuntime: themeRuntimeFromS3(s3),
    };
}
async function loadStoreThemeConfig(storeId, themeId) {
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    const { theme, themePath, s3, pack, blockCatalog, packLoadedFromS3 } = await loadThemeAndPack(themeId);
    const installed = await isThemeInstalled(storeId, themeId);
    const rawSaved = installed ? await readSavedOverrides(storeId, themeId) : {};
    const storeOverrides = pack ? (0, theme_pack_util_1.normalizeStoreOverrides)(rawSaved, pack) : rawSaved ?? {};
    return buildPayloadFromPack({
        storeId,
        themeId,
        themeName: String(theme.name ?? "Theme"),
        themePath,
        configMode: pack ? "sections" : "flat",
        editorSchema: pack?.editorSchema ?? null,
        defaultConfig: pack?.defaultConfig ?? null,
        manifest: pack?.manifest ?? null,
        blockCatalog,
        packLoadedFromS3,
        themeRuntime: themeRuntimeFromS3(s3),
    }, pack, storeOverrides, installed);
}
async function saveStoreThemeConfig(storeId, themeId, body) {
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    const { config, overrides, values } = body;
    if (!config && !overrides && !values) {
        throw new error_utils_1.CustomError("config, overrides, or values is required", 400);
    }
    await assertThemeInstalled(storeId, themeId);
    const { theme, themePath, s3, pack, blockCatalog, packLoadedFromS3 } = await loadThemeAndPack(themeId);
    let storeOverridesToSave;
    let merged;
    if (pack) {
        const flatSchema = (0, theme_pack_util_1.flattenEditorSchema)(pack.editorSchema);
        if (overrides && typeof overrides === "object") {
            storeOverridesToSave = overrides;
            merged = (0, theme_pack_util_1.mergeThemePackConfig)(storeOverridesToSave, pack);
        }
        else if (values && typeof values === "object") {
            merged = (0, theme_pack_util_1.mergedConfigFromFormValues)(values, flatSchema, pack.defaultConfig, pack.editorSchema);
            storeOverridesToSave = (0, theme_pack_util_1.computeStoreOverrides)(merged, pack.defaultConfig);
        }
        else if (config && typeof config === "object") {
            merged = (0, theme_pack_util_1.mergeThemePackConfig)(config, pack);
            storeOverridesToSave = (0, theme_pack_util_1.computeStoreOverrides)(merged, pack.defaultConfig);
        }
        else {
            throw new error_utils_1.CustomError("Invalid payload", 400);
        }
    }
    else {
        if (!config || typeof config !== "object") {
            throw new error_utils_1.CustomError("config object is required for flat themes", 400);
        }
        merged = await (0, theme_pack_util_1.resolveStoreThemeConfig)(config, themePath, null);
        storeOverridesToSave = merged;
    }
    (0, theme_config_util_1.writeStoreThemeConfigFile)(storeId, themeId, storeOverridesToSave);
    const storeRef = (0, installed_themes_query_util_1.canonicalStoreRef)(storeId);
    const themeRef = new mongoose_1.Types.ObjectId(themeId);
    await store_theme_config_model_1.StoreThemeConfig.findOneAndUpdate({ store: storeRef, theme: themeRef }, { $set: { config: storeOverridesToSave, store: storeRef, theme: themeRef } }, { upsert: true, new: true });
    return buildPayloadFromPack({
        storeId,
        themeId,
        themeName: String(theme.name ?? "Theme"),
        themePath,
        configMode: pack ? "sections" : "flat",
        editorSchema: pack?.editorSchema ?? null,
        defaultConfig: pack?.defaultConfig ?? null,
        manifest: pack?.manifest ?? null,
        blockCatalog,
        packLoadedFromS3,
        themeRuntime: themeRuntimeFromS3(s3),
    }, pack, storeOverridesToSave, true);
}
