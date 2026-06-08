"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACT_THEME_CONFIG_SCHEMA = void 0;
exports.buildDefaultThemeConfig = buildDefaultThemeConfig;
exports.getNestedValue = getNestedValue;
exports.setNestedValue = setNestedValue;
exports.mergeThemeConfig = mergeThemeConfig;
exports.configFromFormValues = configFromFormValues;
exports.formValuesFromConfig = formValuesFromConfig;
exports.storeThemeConfigFilePath = storeThemeConfigFilePath;
exports.writeStoreThemeConfigFile = writeStoreThemeConfigFile;
exports.readStoreThemeConfigFile = readStoreThemeConfigFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/** Editable surfaces for React catalog themes (merchant-facing). */
exports.REACT_THEME_CONFIG_SCHEMA = [
    { key: 'hero.title', label: 'Hero title', type: 'text', default: 'Welcome to our store' },
    {
        key: 'hero.subtitle',
        label: 'Hero subtitle',
        type: 'textarea',
        default: 'Discover our latest collection',
    },
    { key: 'hero.ctaLabel', label: 'Hero button text', type: 'text', default: 'Shop now' },
    { key: 'hero.showCta', label: 'Show hero button', type: 'boolean', default: true },
    { key: 'colors.primary', label: 'Primary color', type: 'color', default: '#2563eb' },
    { key: 'colors.accent', label: 'Accent color', type: 'color', default: '#7c3aed' },
    { key: 'colors.background', label: 'Background color', type: 'color', default: '#ffffff' },
    {
        key: 'typography.fontFamily',
        label: 'Font family',
        type: 'text',
        default: 'system-ui, sans-serif',
    },
    { key: 'header.announcement', label: 'Top announcement bar', type: 'text', default: '' },
    { key: 'footer.copyright', label: 'Footer copyright', type: 'text', default: '' },
];
function buildDefaultThemeConfig() {
    const config = {};
    for (const field of exports.REACT_THEME_CONFIG_SCHEMA) {
        setNestedValue(config, field.key, field.default);
    }
    return config;
}
function getNestedValue(obj, dotKey) {
    const parts = dotKey.split('.');
    let cur = obj;
    for (const p of parts) {
        if (cur == null || typeof cur !== 'object')
            return undefined;
        cur = cur[p];
    }
    return cur;
}
function setNestedValue(obj, dotKey, value) {
    const parts = dotKey.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (cur[p] == null || typeof cur[p] !== 'object') {
            cur[p] = {};
        }
        cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
}
function mergeThemeConfig(saved) {
    const base = buildDefaultThemeConfig();
    if (!saved || typeof saved !== 'object')
        return base;
    return deepMerge(base, saved);
}
function deepMerge(target, source) {
    const out = { ...target };
    for (const [k, v] of Object.entries(source)) {
        if (v != null && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object') {
            out[k] = deepMerge(out[k], v);
        }
        else if (v !== undefined) {
            out[k] = v;
        }
    }
    return out;
}
function configFromFormValues(values) {
    const config = {};
    for (const field of exports.REACT_THEME_CONFIG_SCHEMA) {
        const raw = values[field.key];
        if (raw === undefined)
            continue;
        setNestedValue(config, field.key, field.type === 'boolean' ? Boolean(raw) : String(raw));
    }
    return mergeThemeConfig(config);
}
function formValuesFromConfig(config) {
    const merged = mergeThemeConfig(config);
    const values = {};
    for (const field of exports.REACT_THEME_CONFIG_SCHEMA) {
        const v = getNestedValue(merged, field.key);
        if (field.type === 'boolean') {
            values[field.key] = Boolean(v);
        }
        else {
            values[field.key] = v == null ? String(field.default) : String(v);
        }
    }
    return values;
}
function storeThemeConfigFilePath(storeId, themeId) {
    return path_1.default.join(process.cwd(), 'uploads', 'stores', storeId, 'themes', themeId, 'store-theme-config.json');
}
function writeStoreThemeConfigFile(storeId, themeId, config) {
    const filePath = storeThemeConfigFilePath(storeId, themeId);
    const dir = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    fs_1.default.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
}
function readStoreThemeConfigFile(storeId, themeId) {
    const filePath = storeThemeConfigFilePath(storeId, themeId);
    if (!fs_1.default.existsSync(filePath))
        return null;
    try {
        const raw = fs_1.default.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? parsed : null;
    }
    catch {
        return null;
    }
}
