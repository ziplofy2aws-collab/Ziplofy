import fs from 'fs';
import path from 'path';
import {
  type ThemeConfigFieldSchema,
  getNestedValue,
  mergeThemeConfig,
  setNestedValue,
} from './theme-config.util.js';
import { readS3JsonObject } from './theme-s3-ingest.js';

const SECTION_THEME_SLUGS = new Set(['makeup', 'lumiere-beauty', 'lumiere']);

export type EditorFieldDef = {
  path: string;
  type: string;
  label: string;
};

/** Section / layout block tree (supports nested groups). */
export type EditorBlockDef = {
  id?: string;
  label?: string;
  type?: string;
  settingsFields?: EditorFieldDef[];
  blocks?: EditorBlockDef[];
};

export type EditorSchemaDoc = {
  version?: string;
  themeId?: string;
  description?: string;
  globalSettings?: {
    label?: string;
    groups?: Array<{ id?: string; label?: string; fields?: EditorFieldDef[] }>;
  };
  layout?: Record<
    string,
    {
      configPath?: string;
      label?: string;
      settingsFields?: EditorFieldDef[];
      blocks?: EditorBlockDef[];
    }
  >;
  templates?: Array<{
    id: string;
    label?: string;
    sections?: Array<{
      id?: string;
      type?: string;
      label?: string;
      hasBlocks?: boolean;
      settingsFields?: EditorFieldDef[];
      blocks?: EditorBlockDef[];
    }>;
  }>;
};

export type ThemePackS3Refs = {
  reactThemeSchema?: { url?: string; key?: string };
  reactThemeDefaultConfig?: { url?: string; key?: string };
  reactThemeManifest?: { url?: string; key?: string };
};

export type ThemePack = {
  defaultConfig: Record<string, unknown>;
  editorSchema: EditorSchemaDoc;
  manifest?: Record<string, unknown>;
};

const packCache = new Map<string, ThemePack>();

function normalizeThemeSlug(themePath: string): string {
  return themePath
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isSectionTheme(themePath: string | null | undefined): boolean {
  if (!themePath) return false;
  const slug = normalizeThemeSlug(themePath);
  return SECTION_THEME_SLUGS.has(slug) || slug.includes('makeup') || slug.includes('lumiere');
}

const DEFAULT_CONFIG_NAMES = ['theme.default-config.json', 'theme.config.default.json'];
const SCHEMA_NAMES = ['theme.schema.json', 'theme.editor-schema.json'];
const MANIFEST_NAMES = ['theme.manifest.json'];

function resolvePackDir(themePath: string): string | null {
  const slug = normalizeThemeSlug(themePath);
  const candidates = [
    path.join(__dirname, '..', 'theme-packs', slug),
    path.join(process.cwd(), 'src', 'theme-packs', slug),
    path.join(process.cwd(), 'build', 'theme-packs', slug),
  ];
  for (const dir of candidates) {
    for (const name of DEFAULT_CONFIG_NAMES) {
      if (fs.existsSync(path.join(dir, name))) return dir;
    }
  }
  return null;
}

function firstExistingFile(dir: string, names: string[]): string | null {
  for (const name of names) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as T;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchJsonUrl<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const parsed = (await res.json()) as T;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function loadThemePackFromDisk(themePath: string): ThemePack | null {
  const slug = normalizeThemeSlug(themePath);
  const cached = packCache.get(`disk:${slug}`);
  if (cached) return cached;

  const dir = resolvePackDir(themePath);
  if (!dir) return null;

  const defaultPath = firstExistingFile(dir, DEFAULT_CONFIG_NAMES);
  const schemaPath = firstExistingFile(dir, SCHEMA_NAMES);
  if (!defaultPath || !schemaPath) return null;

  const defaultConfig = readJsonFile<Record<string, unknown>>(defaultPath);
  const editorSchema = readJsonFile<EditorSchemaDoc>(schemaPath);
  if (!defaultConfig || !editorSchema) return null;

  const manifestPath = firstExistingFile(dir, MANIFEST_NAMES);
  const manifest = manifestPath ? readJsonFile<Record<string, unknown>>(manifestPath) : undefined;

  const pack: ThemePack = { defaultConfig, editorSchema, manifest: manifest ?? undefined };
  packCache.set(`disk:${slug}`, pack);
  return pack;
}

async function loadThemePackFromS3Keys(s3Refs: ThemePackS3Refs): Promise<ThemePack | null> {
  const schemaKey = s3Refs.reactThemeSchema?.key;
  const defaultKey = s3Refs.reactThemeDefaultConfig?.key;
  const manifestKey = s3Refs.reactThemeManifest?.key;
  if (!schemaKey || !defaultKey) return null;

  const [editorSchema, defaultConfig, manifestFromS3] = await Promise.all([
    readS3JsonObject<EditorSchemaDoc>(schemaKey),
    readS3JsonObject<Record<string, unknown>>(defaultKey),
    manifestKey ? readS3JsonObject<Record<string, unknown>>(manifestKey) : Promise.resolve(null),
  ]);

  if (!editorSchema || !defaultConfig) return null;
  return {
    defaultConfig,
    editorSchema,
    manifest: manifestFromS3 ?? undefined,
  };
}

export async function loadThemePack(
  themePath: string,
  s3Refs?: ThemePackS3Refs | null
): Promise<ThemePack | null> {
  const slug = normalizeThemeSlug(themePath);
  const cacheKey = `full:${slug}`;
  if (packCache.has(cacheKey)) return packCache.get(cacheKey)!;

  const hasS3Keys = Boolean(
    s3Refs?.reactThemeSchema?.key && s3Refs?.reactThemeDefaultConfig?.key
  );

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
      fetchJsonUrl<EditorSchemaDoc>(schemaUrl),
      fetchJsonUrl<Record<string, unknown>>(defaultUrl),
      manifestUrl ? fetchJsonUrl<Record<string, unknown>>(manifestUrl) : Promise.resolve(null),
    ]);
    if (editorSchema && defaultConfig) {
      const pack: ThemePack = {
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
export function loadThemePackSync(themePath: string): ThemePack | null {
  return loadThemePackFromDisk(themePath);
}

function editorFieldType(type: string): ThemeConfigFieldSchema['type'] {
  if (type === 'textarea') return 'textarea';
  if (type === 'boolean') return 'boolean';
  if (type === 'color') return 'color';
  return 'text';
}

export function layoutBlueprintKey(sectionId: string): string {
  if (sectionId === "announcement_bar" || sectionId.startsWith("announcement_bar_")) {
    return "announcement_bar";
  }
  if (sectionId === "header" || sectionId.startsWith("header_")) return "header";
  if (sectionId.startsWith("divider")) return "divider";
  return sectionId;
}

export function remapLayoutSchemaPath(path: string, instanceId: string): string {
  const blueprint = layoutBlueprintKey(instanceId);
  if (blueprint === instanceId) return path;
  return path.replace(`sections.${blueprint}.`, `sections.${instanceId}.`);
}

function collectPackFieldKeys(
  schema: EditorSchemaDoc,
  config: Record<string, unknown>
): ThemeConfigFieldSchema[] {
  const fields = flattenEditorSchema(schema);
  const seen = new Set(fields.map((f) => f.key));

  const sections = (config.sections ?? {}) as Record<string, unknown>;
  for (const instanceId of Object.keys(sections)) {
    const blueprint = layoutBlueprintKey(instanceId);
    if (blueprint === instanceId) continue;
    const layout = schema.layout?.[blueprint];
    if (!layout) continue;

    const pushField = (f: EditorFieldDef) => {
      if (!f.path) return;
      const key = remapLayoutSchemaPath(f.path, instanceId);
      if (seen.has(key)) return;
      seen.add(key);
      fields.push({
        key,
        label: f.label || key,
        type: editorFieldType(f.type),
        default: f.type === "boolean" ? false : "",
      });
    };

    for (const f of layout.settingsFields ?? []) pushField(f);
    for (const block of layout.blocks ?? []) {
      for (const f of block.settingsFields ?? []) pushField(f);
      for (const nested of block.blocks ?? []) {
        for (const f of nested.settingsFields ?? []) pushField(f);
      }
    }
  }

  return fields;
}

function resolvePackFieldType(
  key: string,
  typeByKey: Map<string, ThemeConfigFieldSchema["type"]>
): ThemeConfigFieldSchema["type"] | undefined {
  const direct = typeByKey.get(key);
  if (direct) return direct;
  const m = key.match(/^sections\.([^.]+)\.(.+)$/);
  if (!m) return undefined;
  const blueprint = layoutBlueprintKey(m[1]);
  if (blueprint === m[1]) return undefined;
  return typeByKey.get(`sections.${blueprint}.${m[2]}`);
}

export function flattenEditorSchema(schema: EditorSchemaDoc): ThemeConfigFieldSchema[] {
  const fields: ThemeConfigFieldSchema[] = [];
  const seen = new Set<string>();

  const push = (f: EditorFieldDef) => {
    if (!f.path || seen.has(f.path)) return;
    seen.add(f.path);
    fields.push({
      key: f.path,
      label: f.label || f.path,
      type: editorFieldType(f.type),
      default: f.type === 'boolean' ? false : '',
    });
  };

  for (const group of schema.globalSettings?.groups ?? []) {
    for (const f of group.fields ?? []) push(f);
  }

  for (const layout of Object.values(schema.layout ?? {})) {
    for (const f of layout.settingsFields ?? []) push(f);
    for (const block of layout.blocks ?? []) {
      for (const f of block.settingsFields ?? []) push(f);
    }
  }

  for (const tpl of schema.templates ?? []) {
    for (const section of tpl.sections ?? []) {
      for (const f of section.settingsFields ?? []) push(f);
    }
  }

  return fields;
}

export function deepMergeConfig(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (
      v != null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      out[k] != null &&
      typeof out[k] === 'object' &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMergeConfig(out[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Store only merchant deltas from theme defaults. */
export function computeStoreOverrides(
  merged: Record<string, unknown>,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(merged)) {
    const dv = defaults[k];
    if (
      v != null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      dv != null &&
      typeof dv === 'object' &&
      !Array.isArray(dv)
    ) {
      const nested = computeStoreOverrides(
        v as Record<string, unknown>,
        dv as Record<string, unknown>
      );
      if (Object.keys(nested).length > 0) out[k] = nested;
    } else if (!jsonEqual(v, dv)) {
      out[k] = v;
    }
  }
  return out;
}

/** If legacy rows stored the full merged config, strip back to overrides only. */
export function normalizeStoreOverrides(
  saved: Record<string, unknown> | null | undefined,
  pack: ThemePack
): Record<string, unknown> {
  if (!saved || typeof saved !== 'object') return {};
  if ('version' in saved && ('sections' in saved || 'templates' in saved)) {
    return computeStoreOverrides(saved, pack.defaultConfig);
  }
  return saved;
}

export function mergeThemePackConfig(
  storeOverrides: Record<string, unknown> | null | undefined,
  pack: ThemePack
): Record<string, unknown> {
  const overrides = normalizeStoreOverrides(storeOverrides, pack);
  if (!Object.keys(overrides).length) return pack.defaultConfig;
  return deepMergeConfig(pack.defaultConfig, overrides);
}

export function formValuesFromPackConfig(
  config: Record<string, unknown>,
  schema: ThemeConfigFieldSchema[],
  editorSchema?: EditorSchemaDoc | null
): Record<string, string | boolean> {
  const fields =
    editorSchema != null ? collectPackFieldKeys(editorSchema, config) : schema;
  const values: Record<string, string | boolean> = {};
  for (const field of fields) {
    const v = getNestedValue(config, field.key);
    if (field.type === 'boolean') {
      values[field.key] = Boolean(v);
    } else {
      values[field.key] = v == null ? String(field.default) : String(v);
    }
  }
  return values;
}

export function mergedConfigFromFormValues(
  values: Record<string, string | boolean>,
  schema: ThemeConfigFieldSchema[],
  defaultConfig: Record<string, unknown>,
  editorSchema?: EditorSchemaDoc | null
): Record<string, unknown> {
  const config = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
  const fields =
    editorSchema != null
      ? collectPackFieldKeys(editorSchema, defaultConfig)
      : schema;
  const typeByKey = new Map(fields.map((f) => [f.key, f.type]));

  for (const [key, raw] of Object.entries(values)) {
    const type = resolvePackFieldType(key, typeByKey);
    if (!type) continue;
    setNestedValue(config, key, type === 'boolean' ? Boolean(raw) : String(raw));
  }
  return config;
}

export async function resolveStoreThemeConfig(
  saved: Record<string, unknown> | null | undefined,
  themePath?: string | null,
  s3Refs?: ThemePackS3Refs | null
): Promise<Record<string, unknown>> {
  if (themePath) {
    const pack = await loadThemePack(themePath, s3Refs);
    if (pack) return mergeThemePackConfig(saved ?? undefined, pack);
  }
  return mergeThemeConfig(saved);
}

/** True when catalog S3 or disk has schema + default config for the section editor. */
export function hasSectionEditorPack(
  pack: ThemePack | null | undefined,
  s3Refs?: ThemePackS3Refs | null
): boolean {
  if (pack) return true;
  return Boolean(
    (s3Refs?.reactThemeSchema?.key && s3Refs?.reactThemeDefaultConfig?.key) ||
      (s3Refs?.reactThemeSchema?.url && s3Refs?.reactThemeDefaultConfig?.url)
  );
}

export function resolveStoreThemeConfigSync(
  saved: Record<string, unknown> | null | undefined,
  themePath?: string | null
): Record<string, unknown> {
  if (themePath && isSectionTheme(themePath)) {
    const pack = loadThemePackFromDisk(themePath);
    if (pack) return mergeThemePackConfig(saved ?? undefined, pack);
  }
  return mergeThemeConfig(saved);
}
