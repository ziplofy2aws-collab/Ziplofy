"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSectionTheme = isSectionTheme;
exports.loadThemePackFromDisk = loadThemePackFromDisk;
exports.loadThemePack = loadThemePack;
exports.loadThemePackSync = loadThemePackSync;
exports.layoutBlueprintKey = layoutBlueprintKey;
exports.remapLayoutSchemaPath = remapLayoutSchemaPath;
exports.flattenEditorSchema = flattenEditorSchema;
exports.deepMergeConfig = deepMergeConfig;
exports.computeStoreOverrides = computeStoreOverrides;
exports.normalizeStoreOverrides = normalizeStoreOverrides;
exports.mergeThemePackConfig = mergeThemePackConfig;
exports.formValuesFromPackConfig = formValuesFromPackConfig;
exports.mergedConfigFromFormValues = mergedConfigFromFormValues;
exports.resolveStoreThemeConfig = resolveStoreThemeConfig;
exports.hasSectionEditorPack = hasSectionEditorPack;
exports.resolveStoreThemeConfigSync = resolveStoreThemeConfigSync;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const theme_config_util_js_1 = require("./theme-config.util.js");
const theme_s3_ingest_js_1 = require("./theme-s3-ingest.js");
const SECTION_THEME_SLUGS = new Set(['makeup', 'lumiere-beauty', 'lumiere']);
const packCache = new Map();
function normalizeThemeSlug(themePath) {
    return themePath
        .trim()
        .toLowerCase()
        .replace(/^\/+|\/+$/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function isSectionTheme(themePath) {
    if (!themePath)
        return false;
    const slug = normalizeThemeSlug(themePath);
    return SECTION_THEME_SLUGS.has(slug) || slug.includes('makeup') || slug.includes('lumiere');
}
const DEFAULT_CONFIG_NAMES = ['theme.default-config.json', 'theme.config.default.json'];
const SCHEMA_NAMES = ['theme.schema.json', 'theme.editor-schema.json'];
const MANIFEST_NAMES = ['theme.manifest.json'];
function resolvePackDir(themePath) {
    const slug = normalizeThemeSlug(themePath);
    const candidates = [
        path_1.default.join(__dirname, '..', 'theme-packs', slug),
        path_1.default.join(process.cwd(), 'src', 'theme-packs', slug),
        path_1.default.join(process.cwd(), 'build', 'theme-packs', slug),
    ];
    for (const dir of candidates) {
        for (const name of DEFAULT_CONFIG_NAMES) {
            if (fs_1.default.existsSync(path_1.default.join(dir, name)))
                return dir;
        }
    }
    return null;
}
function firstExistingFile(dir, names) {
    for (const name of names) {
        const p = path_1.default.join(dir, name);
        if (fs_1.default.existsSync(p))
            return p;
    }
    return null;
}
function readJsonFile(filePath) {
    try {
        const raw = fs_1.default.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    }
    catch {
        return null;
    }
}
async function fetchJsonUrl(url) {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok)
            return null;
        const parsed = (await res.json());
        return parsed && typeof parsed === 'object' ? parsed : null;
    }
    catch {
        return null;
    }
}
function loadThemePackFromDisk(themePath) {
    const slug = normalizeThemeSlug(themePath);
    const cached = packCache.get(`disk:${slug}`);
    if (cached)
        return cached;
    const dir = resolvePackDir(themePath);
    if (!dir)
        return null;
    const defaultPath = firstExistingFile(dir, DEFAULT_CONFIG_NAMES);
    const schemaPath = firstExistingFile(dir, SCHEMA_NAMES);
    if (!defaultPath || !schemaPath)
        return null;
    const defaultConfig = readJsonFile(defaultPath);
    const editorSchema = readJsonFile(schemaPath);
    if (!defaultConfig || !editorSchema)
        return null;
    const manifestPath = firstExistingFile(dir, MANIFEST_NAMES);
    const manifest = manifestPath ? readJsonFile(manifestPath) : undefined;
    const pack = { defaultConfig, editorSchema, manifest: manifest ?? undefined };
    packCache.set(`disk:${slug}`, pack);
    return pack;
}
async function loadThemePackFromS3Keys(s3Refs) {
    const schemaKey = s3Refs.reactThemeSchema?.key;
    const defaultKey = s3Refs.reactThemeDefaultConfig?.key;
    const manifestKey = s3Refs.reactThemeManifest?.key;
    if (!schemaKey || !defaultKey)
        return null;
    const [editorSchema, defaultConfig, manifestFromS3] = await Promise.all([
        (0, theme_s3_ingest_js_1.readS3JsonObject)(schemaKey),
        (0, theme_s3_ingest_js_1.readS3JsonObject)(defaultKey),
        manifestKey ? (0, theme_s3_ingest_js_1.readS3JsonObject)(manifestKey) : Promise.resolve(null),
    ]);
    if (!editorSchema || !defaultConfig)
        return null;
    return {
        defaultConfig,
        editorSchema,
        manifest: manifestFromS3 ?? undefined,
    };
}
async function loadThemePack(themePath, s3Refs) {
    const slug = normalizeThemeSlug(themePath);
    const cacheKey = `full:${slug}`;
    if (packCache.has(cacheKey))
        return packCache.get(cacheKey);
    const hasS3Keys = Boolean(s3Refs?.reactThemeSchema?.key && s3Refs?.reactThemeDefaultConfig?.key);
    if (hasS3Keys && s3Refs) {
        const fromS3 = await loadThemePackFromS3Keys(s3Refs);
        if (fromS3) {
            packCache.set(cacheKey, fromS3);
            return fromS3;
        }
    }
    const schemaUrl = s3Refs?.reactThemeSchema?.url;
    const defaultUrl = s3Refs?.reactThemeDefaultConfig?.url;
    const manifestUrl = s3Refs?.reactThemeManifest?.url;
    if (schemaUrl && defaultUrl) {
        const [editorSchema, defaultConfig, manifestFromS3] = await Promise.all([
            fetchJsonUrl(schemaUrl),
            fetchJsonUrl(defaultUrl),
            manifestUrl ? fetchJsonUrl(manifestUrl) : Promise.resolve(null),
        ]);
        if (editorSchema && defaultConfig) {
            const pack = {
                defaultConfig,
                editorSchema,
                manifest: manifestFromS3 ?? undefined,
            };
            packCache.set(cacheKey, pack);
            return pack;
        }
    }
    const disk = loadThemePackFromDisk(themePath);
    if (disk) {
        packCache.set(cacheKey, disk);
        return disk;
    }
    return null;
}
/** @deprecated Use loadThemePack async */
function loadThemePackSync(themePath) {
    return loadThemePackFromDisk(themePath);
}
function editorFieldType(type) {
    if (type === 'textarea')
        return 'textarea';
    if (type === 'boolean')
        return 'boolean';
    if (type === 'color')
        return 'color';
    return 'text';
}
function layoutBlueprintKey(sectionId) {
    if (sectionId === "announcement_bar" || sectionId.startsWith("announcement_bar_")) {
        return "announcement_bar";
    }
    if (sectionId === "header" || sectionId.startsWith("header_"))
        return "header";
    if (sectionId.startsWith("divider"))
        return "divider";
    return sectionId;
}
function remapLayoutSchemaPath(path, instanceId) {
    const blueprint = layoutBlueprintKey(instanceId);
    if (blueprint === instanceId)
        return path;
    return path.replace(`sections.${blueprint}.`, `sections.${instanceId}.`);
}
function collectPackFieldKeys(schema, config) {
    const fields = flattenEditorSchema(schema);
    const seen = new Set(fields.map((f) => f.key));
    const sections = (config.sections ?? {});
    for (const instanceId of Object.keys(sections)) {
        const blueprint = layoutBlueprintKey(instanceId);
        if (blueprint === instanceId)
            continue;
        const layout = schema.layout?.[blueprint];
        if (!layout)
            continue;
        const pushField = (f) => {
            if (!f.path)
                return;
            const key = remapLayoutSchemaPath(f.path, instanceId);
            if (seen.has(key))
                return;
            seen.add(key);
            fields.push({
                key,
                label: f.label || key,
                type: editorFieldType(f.type),
                default: f.type === "boolean" ? false : "",
            });
        };
        for (const f of layout.settingsFields ?? [])
            pushField(f);
        for (const block of layout.blocks ?? []) {
            for (const f of block.settingsFields ?? [])
                pushField(f);
            for (const nested of block.blocks ?? []) {
                for (const f of nested.settingsFields ?? [])
                    pushField(f);
            }
        }
    }
    return fields;
}
function resolvePackFieldType(key, typeByKey) {
    const direct = typeByKey.get(key);
    if (direct)
        return direct;
    const m = key.match(/^sections\.([^.]+)\.(.+)$/);
    if (!m)
        return undefined;
    const blueprint = layoutBlueprintKey(m[1]);
    if (blueprint === m[1])
        return undefined;
    return typeByKey.get(`sections.${blueprint}.${m[2]}`);
}
function flattenEditorSchema(schema) {
    const fields = [];
    const seen = new Set();
    const push = (f) => {
        if (!f.path || seen.has(f.path))
            return;
        seen.add(f.path);
        fields.push({
            key: f.path,
            label: f.label || f.path,
            type: editorFieldType(f.type),
            default: f.type === 'boolean' ? false : '',
        });
    };
    for (const group of schema.globalSettings?.groups ?? []) {
        for (const f of group.fields ?? [])
            push(f);
    }
    for (const layout of Object.values(schema.layout ?? {})) {
        for (const f of layout.settingsFields ?? [])
            push(f);
        for (const block of layout.blocks ?? []) {
            for (const f of block.settingsFields ?? [])
                push(f);
        }
    }
    for (const tpl of schema.templates ?? []) {
        for (const section of tpl.sections ?? []) {
            for (const f of section.settingsFields ?? [])
                push(f);
        }
    }
    return fields;
}
function deepMergeConfig(target, source) {
    const out = { ...target };
    for (const [k, v] of Object.entries(source)) {
        if (v != null &&
            typeof v === 'object' &&
            !Array.isArray(v) &&
            out[k] != null &&
            typeof out[k] === 'object' &&
            !Array.isArray(out[k])) {
            out[k] = deepMergeConfig(out[k], v);
        }
        else if (v !== undefined) {
            out[k] = v;
        }
    }
    return out;
}
function jsonEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
/** Store only merchant deltas from theme defaults. */
function computeStoreOverrides(merged, defaults) {
    const out = {};
    for (const [k, v] of Object.entries(merged)) {
        const dv = defaults[k];
        if (v != null &&
            typeof v === 'object' &&
            !Array.isArray(v) &&
            dv != null &&
            typeof dv === 'object' &&
            !Array.isArray(dv)) {
            const nested = computeStoreOverrides(v, dv);
            if (Object.keys(nested).length > 0)
                out[k] = nested;
        }
        else if (!jsonEqual(v, dv)) {
            out[k] = v;
        }
    }
    return out;
}
/** If legacy rows stored the full merged config, strip back to overrides only. */
function normalizeStoreOverrides(saved, pack) {
    if (!saved || typeof saved !== 'object')
        return {};
    if ('version' in saved && ('sections' in saved || 'templates' in saved)) {
        return computeStoreOverrides(saved, pack.defaultConfig);
    }
    return saved;
}
function mergeThemePackConfig(storeOverrides, pack) {
    const overrides = normalizeStoreOverrides(storeOverrides, pack);
    if (!Object.keys(overrides).length)
        return pack.defaultConfig;
    return deepMergeConfig(pack.defaultConfig, overrides);
}
function formValuesFromPackConfig(config, schema, editorSchema) {
    const fields = editorSchema != null ? collectPackFieldKeys(editorSchema, config) : schema;
    const values = {};
    for (const field of fields) {
        const v = (0, theme_config_util_js_1.getNestedValue)(config, field.key);
        if (field.type === 'boolean') {
            values[field.key] = Boolean(v);
        }
        else {
            values[field.key] = v == null ? String(field.default) : String(v);
        }
    }
    return values;
}
function mergedConfigFromFormValues(values, schema, defaultConfig, editorSchema) {
    const config = JSON.parse(JSON.stringify(defaultConfig));
    const fields = editorSchema != null
        ? collectPackFieldKeys(editorSchema, defaultConfig)
        : schema;
    const typeByKey = new Map(fields.map((f) => [f.key, f.type]));
    for (const [key, raw] of Object.entries(values)) {
        const type = resolvePackFieldType(key, typeByKey);
        if (!type)
            continue;
        (0, theme_config_util_js_1.setNestedValue)(config, key, type === 'boolean' ? Boolean(raw) : String(raw));
    }
    return config;
}
async function resolveStoreThemeConfig(saved, themePath, s3Refs) {
    if (themePath) {
        const pack = await loadThemePack(themePath, s3Refs);
        if (pack)
            return mergeThemePackConfig(saved ?? undefined, pack);
    }
    return (0, theme_config_util_js_1.mergeThemeConfig)(saved);
}
/** True when catalog S3 or disk has schema + default config for the section editor. */
function hasSectionEditorPack(pack, s3Refs) {
    if (pack)
        return true;
    return Boolean((s3Refs?.reactThemeSchema?.key && s3Refs?.reactThemeDefaultConfig?.key) ||
        (s3Refs?.reactThemeSchema?.url && s3Refs?.reactThemeDefaultConfig?.url));
}
function resolveStoreThemeConfigSync(saved, themePath) {
    if (themePath && isSectionTheme(themePath)) {
        const pack = loadThemePackFromDisk(themePath);
        if (pack)
            return mergeThemePackConfig(saved ?? undefined, pack);
    }
    return (0, theme_config_util_js_1.mergeThemeConfig)(saved);
}
