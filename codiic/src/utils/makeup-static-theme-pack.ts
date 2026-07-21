import makeupDefaultConfig from '../theme-packs/makeup/theme.default-config.json';
import makeupEditorSchema from '../theme-packs/makeup/theme.schema.json';

export type MakeupEditorSchema = typeof makeupEditorSchema;

function editorFieldType(type: string): 'text' | 'textarea' | 'color' | 'boolean' {
  if (type === 'textarea') return 'textarea';
  if (type === 'boolean') return 'boolean';
  if (type === 'color') return 'color';
  return 'text';
}

function getNested(obj: Record<string, unknown>, dotKey: string): unknown {
  const parts = dotKey.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function flattenMakeupEditorFields(schema: MakeupEditorSchema) {
  const fields: Array<{ key: string; label: string; type: 'text' | 'textarea' | 'color' | 'boolean'; default: string | boolean }> = [];
  const seen = new Set<string>();
  const push = (f: { path: string; type: string; label: string }) => {
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
    for (const b of layout.blocks ?? []) {
      for (const f of b.settingsFields ?? []) push(f);
    }
  }
  for (const tpl of schema.templates ?? []) {
    for (const sec of tpl.sections ?? []) {
      for (const f of sec.settingsFields ?? []) push(f);
    }
  }
  return fields;
}

export function formValuesFromMakeupConfig(config: Record<string, unknown>) {
  const schema = flattenMakeupEditorFields(makeupEditorSchema);
  const values: Record<string, string | boolean> = {};
  for (const field of schema) {
    const v = getNested(config, field.key);
    if (field.type === 'boolean') {
      values[field.key] = Boolean(v);
    } else {
      values[field.key] = v == null ? String(field.default) : String(v);
    }
  }
  return values;
}

/** @deprecated Use loadStaticThemeEditorPack() via VITE_THEME_EDITOR_STATIC_MODE */
export function getStaticMakeupThemePack() {
  const defaultConfig = makeupDefaultConfig as Record<string, unknown>;
  const editorSchema = makeupEditorSchema as MakeupEditorSchema;
  const values = formValuesFromMakeupConfig(defaultConfig);
  return {
    themeName: 'Lumière Beauty (preview)',
    editorSchema,
    defaultConfig,
    storeOverrides: {} as Record<string, unknown>,
    config: defaultConfig,
    values,
    configMode: 'sections' as const,
    themeRuntime: { jsUrl: null as string | null, cssUrl: null as string | null },
    isStatic: true,
  };
}

export function isMakeupThemeCandidate(themePath?: string | null, themeName?: string | null): boolean {
  const slug = String(themePath ?? themeName ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  return slug.includes('makeup') || slug.includes('lumiere');
}
