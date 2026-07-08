"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStorefrontThemeSource = resolveStorefrontThemeSource;
const mongoose_1 = require("mongoose");
const store_model_1 = require("../models/store/store.model");
const store_custom_theme_model_1 = require("../models/store-custom-theme/store-custom-theme.model");
const storefront_liquid_util_1 = require("./storefront-liquid.util");
async function resolveStoreCustomThemeSource(storeId, customThemeId) {
    const customDoc = await store_custom_theme_model_1.StoreCustomTheme.findOne({
        _id: customThemeId,
        storeId: new mongoose_1.Types.ObjectId(storeId),
    })
        .select('themeName themeConfig')
        .lean();
    if (!customDoc?.themeConfig || typeof customDoc.themeConfig !== 'object') {
        return null;
    }
    return {
        kind: 'store-custom',
        storeCustomThemeId: customThemeId,
        storeCustomThemeName: customDoc.themeName ?? 'Custom theme',
        catalogThemeId: null,
        catalogThemeName: null,
    };
}
/**
 * Single source of truth for which theme is live on a store.
 * `appliedTheme` and `appliedCustomThemeId` are mutually exclusive on write;
 * when both are present (legacy data), catalog `appliedTheme` is resolved first.
 */
async function resolveStorefrontThemeSource(storeId) {
    const storeDoc = await store_model_1.Store.findById(storeId)
        .select('appliedCustomThemeId appliedTheme')
        .lean();
    const hasCatalogPointer = Boolean(storeDoc?.appliedTheme);
    const customThemeId = storeDoc?.appliedCustomThemeId
        ? String(storeDoc.appliedCustomThemeId)
        : null;
    if (hasCatalogPointer) {
        const resolved = await (0, storefront_liquid_util_1.resolveAppliedStoreTheme)(storeId);
        if (resolved) {
            return {
                kind: 'catalog',
                storeCustomThemeId: null,
                storeCustomThemeName: null,
                catalogThemeId: resolved.appliedThemeId,
                catalogThemeName: resolved.themeName,
            };
        }
    }
    if (customThemeId) {
        const custom = await resolveStoreCustomThemeSource(storeId, customThemeId);
        if (custom) {
            return custom;
        }
    }
    return {
        kind: 'none',
        storeCustomThemeId: null,
        storeCustomThemeName: null,
        catalogThemeId: null,
        catalogThemeName: null,
    };
}
