import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import { readBoolSetting } from './theme-animations.settings';

export const THEME_SWATCHES_VARIANT_IMAGES_PATH = 'settings.swatches.variantImages';
export const THEME_SWATCHES_WIDTH_PATH = 'settings.swatches.width';
export const THEME_SWATCHES_HEIGHT_PATH = 'settings.swatches.height';
export const THEME_SWATCHES_CORNER_RADIUS_PATH = 'settings.swatches.cornerRadius';
export const THEME_SWATCHES_BORDER_STYLE_PATH = 'settings.swatches.borderStyle';
export const THEME_SWATCHES_BORDER_THICKNESS_PATH = 'settings.swatches.borderThickness';
export const THEME_SWATCHES_BORDER_OPACITY_PATH = 'settings.swatches.borderOpacity';

export const THEME_SWATCHES_BORDER_STYLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
] as const;

export type ThemeSwatchesBorderStyle =
  (typeof THEME_SWATCHES_BORDER_STYLE_OPTIONS)[number]['value'];

export const THEME_SWATCHES_SIZE_MIN = 8;
export const THEME_SWATCHES_SIZE_MAX = 80;
export const THEME_SWATCHES_CORNER_RADIUS_MIN = 0;
export const THEME_SWATCHES_CORNER_RADIUS_MAX = 100;
export const THEME_SWATCHES_BORDER_THICKNESS_MIN = 0;
export const THEME_SWATCHES_BORDER_THICKNESS_MAX = 20;
export const THEME_SWATCHES_BORDER_OPACITY_MIN = 0;
export const THEME_SWATCHES_BORDER_OPACITY_MAX = 100;

export const THEME_DEFAULT_SWATCHES = {
  variantImages: false,
  width: 34,
  height: 34,
  cornerRadius: 32,
  borderStyle: 'solid' as ThemeSwatchesBorderStyle,
  borderThickness: 1,
  borderOpacity: 10,
};

export type ThemeSwatchesSettings = {
  variantImages: boolean;
  width: number;
  height: number;
  cornerRadius: number;
  borderStyle: ThemeSwatchesBorderStyle;
  borderThickness: number;
  borderOpacity: number;
};

function readSwatchesSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const swatches = settings?.swatches;
  return swatches && typeof swatches === 'object' ? (swatches as Record<string, unknown>) : {};
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeThemeSwatchesBorderStyle(value: unknown): ThemeSwatchesBorderStyle {
  if (typeof value === 'string') {
    const match = THEME_SWATCHES_BORDER_STYLE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_SWATCHES_BORDER_STYLE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_SWATCHES.borderStyle;
}

export function readThemeSwatchesSettings(
  config: Record<string, unknown> | null | undefined
): ThemeSwatchesSettings {
  const swatches = readSwatchesSettings(config);

  return {
    variantImages: readBoolSetting(swatches.variantImages, THEME_DEFAULT_SWATCHES.variantImages),
    width: clampNumber(
      swatches.width,
      THEME_SWATCHES_SIZE_MIN,
      THEME_SWATCHES_SIZE_MAX,
      THEME_DEFAULT_SWATCHES.width
    ),
    height: clampNumber(
      swatches.height,
      THEME_SWATCHES_SIZE_MIN,
      THEME_SWATCHES_SIZE_MAX,
      THEME_DEFAULT_SWATCHES.height
    ),
    cornerRadius: clampNumber(
      swatches.cornerRadius,
      THEME_SWATCHES_CORNER_RADIUS_MIN,
      THEME_SWATCHES_CORNER_RADIUS_MAX,
      THEME_DEFAULT_SWATCHES.cornerRadius
    ),
    borderStyle: normalizeThemeSwatchesBorderStyle(swatches.borderStyle),
    borderThickness: clampNumber(
      swatches.borderThickness,
      THEME_SWATCHES_BORDER_THICKNESS_MIN,
      THEME_SWATCHES_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_SWATCHES.borderThickness
    ),
    borderOpacity: clampNumber(
      swatches.borderOpacity,
      THEME_SWATCHES_BORDER_OPACITY_MIN,
      THEME_SWATCHES_BORDER_OPACITY_MAX,
      THEME_DEFAULT_SWATCHES.borderOpacity
    ),
  };
}

export function readThemeSwatchesSettingsFromValues(
  values: Record<string, string | boolean>
): ThemeSwatchesSettings {
  return {
    variantImages: readBoolSetting(
      values[THEME_SWATCHES_VARIANT_IMAGES_PATH],
      THEME_DEFAULT_SWATCHES.variantImages
    ),
    width: clampNumber(
      values[THEME_SWATCHES_WIDTH_PATH],
      THEME_SWATCHES_SIZE_MIN,
      THEME_SWATCHES_SIZE_MAX,
      THEME_DEFAULT_SWATCHES.width
    ),
    height: clampNumber(
      values[THEME_SWATCHES_HEIGHT_PATH],
      THEME_SWATCHES_SIZE_MIN,
      THEME_SWATCHES_SIZE_MAX,
      THEME_DEFAULT_SWATCHES.height
    ),
    cornerRadius: clampNumber(
      values[THEME_SWATCHES_CORNER_RADIUS_PATH],
      THEME_SWATCHES_CORNER_RADIUS_MIN,
      THEME_SWATCHES_CORNER_RADIUS_MAX,
      THEME_DEFAULT_SWATCHES.cornerRadius
    ),
    borderStyle: normalizeThemeSwatchesBorderStyle(values[THEME_SWATCHES_BORDER_STYLE_PATH]),
    borderThickness: clampNumber(
      values[THEME_SWATCHES_BORDER_THICKNESS_PATH],
      THEME_SWATCHES_BORDER_THICKNESS_MIN,
      THEME_SWATCHES_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_SWATCHES.borderThickness
    ),
    borderOpacity: clampNumber(
      values[THEME_SWATCHES_BORDER_OPACITY_PATH],
      THEME_SWATCHES_BORDER_OPACITY_MIN,
      THEME_SWATCHES_BORDER_OPACITY_MAX,
      THEME_DEFAULT_SWATCHES.borderOpacity
    ),
  };
}

export function seedThemeSwatchesValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const swatches = readThemeSwatchesSettings(config);
  return {
    ...values,
    [THEME_SWATCHES_VARIANT_IMAGES_PATH]: swatches.variantImages,
    [THEME_SWATCHES_WIDTH_PATH]: swatches.width,
    [THEME_SWATCHES_HEIGHT_PATH]: swatches.height,
    [THEME_SWATCHES_CORNER_RADIUS_PATH]: swatches.cornerRadius,
    [THEME_SWATCHES_BORDER_STYLE_PATH]: swatches.borderStyle,
    [THEME_SWATCHES_BORDER_THICKNESS_PATH]: swatches.borderThickness,
    [THEME_SWATCHES_BORDER_OPACITY_PATH]: swatches.borderOpacity,
  };
}

export function ensureThemeSwatchesDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const swatches = (settings.swatches ?? {}) as Record<string, unknown>;

  if (!settings.swatches || typeof settings.swatches !== 'object') {
    settings.swatches = swatches;
  }

  const resolved = readThemeSwatchesSettings({
    ...config,
    settings: { ...settings, swatches },
  });

  swatches.variantImages = resolved.variantImages;
  swatches.width = resolved.width;
  swatches.height = resolved.height;
  swatches.cornerRadius = resolved.cornerRadius;
  swatches.borderStyle = resolved.borderStyle;
  swatches.borderThickness = resolved.borderThickness;
  swatches.borderOpacity = resolved.borderOpacity;

  settings.swatches = swatches;
  config.settings = settings;
}

export const THEME_SWATCHES_SCHEMA_GROUP = {
  id: 'swatches',
  label: 'Swatches',
  fields: [
    { path: THEME_SWATCHES_VARIANT_IMAGES_PATH, type: 'boolean', label: 'Variant images' },
    { path: THEME_SWATCHES_WIDTH_PATH, type: 'number', label: 'Width' },
    { path: THEME_SWATCHES_HEIGHT_PATH, type: 'number', label: 'Height' },
    { path: THEME_SWATCHES_CORNER_RADIUS_PATH, type: 'number', label: 'Corner radius' },
    { path: THEME_SWATCHES_BORDER_STYLE_PATH, type: 'text', label: 'Borders' },
    { path: THEME_SWATCHES_BORDER_THICKNESS_PATH, type: 'number', label: 'Border thickness' },
    { path: THEME_SWATCHES_BORDER_OPACITY_PATH, type: 'number', label: 'Border opacity' },
  ],
} as const;

export function withThemeSwatchesSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'swatches');
  const nextGroup = {
    id: THEME_SWATCHES_SCHEMA_GROUP.id,
    label: THEME_SWATCHES_SCHEMA_GROUP.label,
    fields: [...THEME_SWATCHES_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const searchIndex = groups.findIndex((g) => g.id === 'search');
    if (searchIndex >= 0) {
      groups.splice(searchIndex + 1, 0, nextGroup);
    } else {
      groups.push(nextGroup);
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
