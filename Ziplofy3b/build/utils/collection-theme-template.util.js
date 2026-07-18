"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCollectionThemeTemplate = isValidCollectionThemeTemplate;
exports.normalizeCollectionThemeTemplate = normalizeCollectionThemeTemplate;
exports.formatCollectionThemeTemplateLabel = formatCollectionThemeTemplateLabel;
exports.resolveCollectionLiquidTemplate = resolveCollectionLiquidTemplate;
exports.resolveCollectionJsonTemplateId = resolveCollectionJsonTemplateId;
exports.listCollectionThemeTemplatesForStore = listCollectionThemeTemplatesForStore;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const store_custom_theme_model_1 = require("../models/store-custom-theme/store-custom-theme.model");
const store_theme_config_model_1 = require("../models/store-theme-config.model");
const theme_model_1 = require("../models/theme.model");
const theme_config_util_1 = require("./theme-config.util");
const theme_pack_util_1 = require("./theme-pack.util");
const storefront_liquid_util_1 = require("./storefront-liquid.util");
const storefront_theme_resolution_util_1 = require("./storefront-theme-resolution.util");
const DEFAULT_OPTION = {
    value: "default",
    label: "Default collection",
};
function isValidCollectionThemeTemplate(value) {
    if (typeof value !== "string")
        return false;
    const normalized = value.trim().toLowerCase();
    if (!normalized)
        return false;
    if (normalized === "default" || normalized === "collection")
        return true;
    if (!normalized.startsWith("collection."))
        return false;
    const slug = normalized.slice("collection.".length);
    return (0, storefront_liquid_util_1.isSafeLiquidTemplateName)(slug);
}
function normalizeCollectionThemeTemplate(value) {
    if (typeof value !== "string")
        return DEFAULT_OPTION.value;
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === "collection")
        return DEFAULT_OPTION.value;
    return normalized;
}
function formatCollectionThemeTemplateLabel(templateId) {
    const normalized = templateId.trim().toLowerCase();
    if (normalized === "default" || normalized === "collection") {
        return DEFAULT_OPTION.label;
    }
    const suffix = normalized.startsWith("collection.")
        ? normalized.slice("collection.".length)
        : normalized;
    const words = suffix
        .split(/[-_.]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
    return words.length ? words.join(" ") : DEFAULT_OPTION.label;
}
function resolveCollectionLiquidTemplate(themeTemplate) {
    const normalized = normalizeCollectionThemeTemplate(themeTemplate ?? DEFAULT_OPTION.value);
    if (normalized === DEFAULT_OPTION.value)
        return "collection";
    return normalized;
}
function resolveCollectionJsonTemplateId(themeTemplate) {
    return resolveCollectionLiquidTemplate(themeTemplate);
}
function addTemplateOption(options, seen, templateId, label) {
    const normalized = normalizeCollectionThemeTemplate(templateId === "collection" ? "default" : templateId);
    if (seen.has(normalized))
        return;
    seen.add(normalized);
    options.push({
        value: normalized,
        label: label?.trim() || formatCollectionThemeTemplateLabel(normalized),
    });
}
function collectJsonTemplateOptions(themeConfig, options, seen) {
    const templates = themeConfig?.templates;
    if (!templates || typeof templates !== "object")
        return;
    for (const [key, rawValue] of Object.entries(templates)) {
        const normalizedKey = key.trim().toLowerCase();
        if (normalizedKey !== "collection" && !normalizedKey.startsWith("collection."))
            continue;
        const label = rawValue && typeof rawValue === "object" && "name" in rawValue
            ? String(rawValue.name ?? "")
            : undefined;
        addTemplateOption(options, seen, normalizedKey, label);
    }
}
async function listCollectionThemeTemplatesForStore(storeId) {
    const options = [DEFAULT_OPTION];
    const seen = new Set([DEFAULT_OPTION.value]);
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        return options;
    }
    const source = await (0, storefront_theme_resolution_util_1.resolveStorefrontThemeSource)(storeId);
    const storeObjectId = new mongoose_2.Types.ObjectId(storeId);
    if (source.kind === "store-custom" && source.storeCustomThemeId) {
        const customDoc = await store_custom_theme_model_1.StoreCustomTheme.findOne({
            _id: source.storeCustomThemeId,
            storeId: storeObjectId,
        })
            .select("themeConfig")
            .lean();
        collectJsonTemplateOptions(customDoc?.themeConfig ?? null, options, seen);
    }
    else if (source.kind === "catalog" && source.catalogThemeId) {
        const resolved = await (0, storefront_liquid_util_1.resolveAppliedStoreTheme)(storeId);
        if (resolved?.s3Assets) {
            const liquidTemplates = await (0, storefront_liquid_util_1.listLiquidTemplateNamesFromS3)(resolved.s3Assets);
            for (const templateName of liquidTemplates) {
                if (templateName === "collection") {
                    addTemplateOption(options, seen, "default");
                    continue;
                }
                if (templateName.startsWith("collection.")) {
                    const slug = templateName.slice("collection.".length);
                    if ((0, storefront_liquid_util_1.isSafeLiquidTemplateName)(slug)) {
                        addTemplateOption(options, seen, templateName);
                    }
                }
            }
        }
        const configRow = await store_theme_config_model_1.StoreThemeConfig.findOne({
            store: storeObjectId,
            theme: new mongoose_2.Types.ObjectId(source.catalogThemeId),
        }).lean();
        const theme = await theme_model_1.Theme.findById(source.catalogThemeId).lean();
        const themePath = theme ? String(theme.themePath ?? "") : null;
        const s3Assets = theme ? theme.s3Assets : null;
        const configFromFile = (0, theme_config_util_1.readStoreThemeConfigFile)(storeId, source.catalogThemeId);
        const themeConfig = await (0, theme_pack_util_1.resolveStoreThemeConfig)(configRow?.config ?? configFromFile ?? undefined, themePath, s3Assets);
        collectJsonTemplateOptions(themeConfig, options, seen);
    }
    const customThemes = await store_custom_theme_model_1.StoreCustomTheme.find({ storeId: storeObjectId })
        .select("themeConfig")
        .sort({ updatedAt: -1 })
        .lean();
    for (const theme of customThemes) {
        collectJsonTemplateOptions(theme.themeConfig ?? null, options, seen);
    }
    return options.sort((a, b) => {
        if (a.value === DEFAULT_OPTION.value)
            return -1;
        if (b.value === DEFAULT_OPTION.value)
            return 1;
        return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    });
}
