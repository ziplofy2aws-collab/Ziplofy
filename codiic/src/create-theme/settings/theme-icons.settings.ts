import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';

export const THEME_ICONS_STROKE_PATH = 'settings.icons.stroke';

export const THEME_ICON_STROKE_OPTIONS = [
  { value: 'thin', label: 'Thin' },
  { value: 'default', label: 'Default' },
  { value: 'heavy', label: 'Heavy' },
] as const;

export type ThemeIconStroke = (typeof THEME_ICON_STROKE_OPTIONS)[number]['value'];

export const THEME_DEFAULT_ICONS = {
  stroke: 'default' as ThemeIconStroke,
};

export type ThemeIconsSettings = {
  stroke: ThemeIconStroke;
};

function readIconsSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const icons = settings?.icons;
  return icons && typeof icons === 'object' ? (icons as Record<string, unknown>) : {};
}

export function normalizeThemeIconStroke(value: unknown): ThemeIconStroke {
  if (typeof value === 'string') {
    const match = THEME_ICON_STROKE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_ICON_STROKE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_ICONS.stroke;
}

export function resolveThemeIconStrokeWidth(stroke: ThemeIconStroke): number {
  switch (stroke) {
    case 'thin':
      return 1.25;
    case 'heavy':
      return 2.25;
    default:
      return 1.75;
  }
}

export function readThemeIconsSettings(
  config: Record<string, unknown> | null | undefined
): ThemeIconsSettings {
  const icons = readIconsSettings(config);
  return {
    stroke: normalizeThemeIconStroke(icons.stroke),
  };
}

export function seedThemeIconsValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const icons = readThemeIconsSettings(config);
  return {
    ...values,
    [THEME_ICONS_STROKE_PATH]: icons.stroke,
  };
}

export function ensureThemeIconsDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const icons = (settings.icons ?? {}) as Record<string, unknown>;

  if (!settings.icons || typeof settings.icons !== 'object') {
    settings.icons = icons;
  }

  const resolved = readThemeIconsSettings({ ...config, settings: { ...settings, icons } });
  icons.stroke = resolved.stroke;

  settings.icons = icons;
  config.settings = settings;
}

export const THEME_ICONS_SCHEMA_GROUP = {
  id: 'icons',
  label: 'Icons',
  fields: [{ path: THEME_ICONS_STROKE_PATH, type: 'text', label: 'Stroke' }],
} as const;

export function withThemeIconsSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'icons');
  const nextGroup = {
    id: THEME_ICONS_SCHEMA_GROUP.id,
    label: THEME_ICONS_SCHEMA_GROUP.label,
    fields: [...THEME_ICONS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const productMediaIndex = groups.findIndex((g) => g.id === 'product-media');
    if (productMediaIndex >= 0) {
      groups.splice(productMediaIndex + 1, 0, nextGroup);
    } else {
      const drawersIndex = groups.findIndex((g) => g.id === 'drawers');
      if (drawersIndex >= 0) {
        groups.splice(drawersIndex + 1, 0, nextGroup);
      } else {
        groups.push(nextGroup);
      }
    }
  }

  return {
    ...schema,
    globalSettings: {
      label: schema.globalSettings?.label ?? 'Theme settings',
      groups,
    },
  };
}
