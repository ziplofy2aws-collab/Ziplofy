import fs from 'fs';
import path from 'path';

export type ThemeConfigFieldType = 'text' | 'textarea' | 'color' | 'boolean';

export type ThemeConfigFieldSchema = {
  key: string;
  label: string;
  type: ThemeConfigFieldType;
  default: string | boolean;
};

/** Editable surfaces for React catalog themes (merchant-facing). */
export const REACT_THEME_CONFIG_SCHEMA: ThemeConfigFieldSchema[] = [
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

export function buildDefaultThemeConfig(): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  for (const field of REACT_THEME_CONFIG_SCHEMA) {
    setNestedValue(config, field.key, field.default);
  }
  return config;
}

export function getNestedValue(obj: Record<string, unknown>, dotKey: string): unknown {
  const parts = dotKey.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function setNestedValue(obj: Record<string, unknown>, dotKey: string, value: unknown): void {
  const parts = dotKey.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export function mergeThemeConfig(
  saved: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const base = buildDefaultThemeConfig();
  if (!saved || typeof saved !== 'object') return base;
  return deepMerge(base, saved);
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v != null && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object') {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

export function configFromFormValues(
  values: Record<string, string | boolean>
): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  for (const field of REACT_THEME_CONFIG_SCHEMA) {
    const raw = values[field.key];
    if (raw === undefined) continue;
    setNestedValue(config, field.key, field.type === 'boolean' ? Boolean(raw) : String(raw));
  }
  return mergeThemeConfig(config);
}

export function formValuesFromConfig(config: Record<string, unknown>): Record<string, string | boolean> {
  const merged = mergeThemeConfig(config);
  const values: Record<string, string | boolean> = {};
  for (const field of REACT_THEME_CONFIG_SCHEMA) {
    const v = getNestedValue(merged, field.key);
    if (field.type === 'boolean') {
      values[field.key] = Boolean(v);
    } else {
      values[field.key] = v == null ? String(field.default) : String(v);
    }
  }
  return values;
}

export function storeThemeConfigFilePath(storeId: string, themeId: string): string {
  return path.join(
    process.cwd(),
    'uploads',
    'stores',
    storeId,
    'themes',
    themeId,
    'store-theme-config.json'
  );
}

export function writeStoreThemeConfigFile(
  storeId: string,
  themeId: string,
  config: Record<string, unknown>
): void {
  const filePath = storeThemeConfigFilePath(storeId, themeId);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
}

export function readStoreThemeConfigFile(storeId: string, themeId: string): Record<string, unknown> | null {
  const filePath = storeThemeConfigFilePath(storeId, themeId);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}
