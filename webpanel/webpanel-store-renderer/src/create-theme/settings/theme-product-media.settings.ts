import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';

export const THEME_PRODUCT_MEDIA_BORDER_STYLE_PATH = 'settings.productMedia.borderStyle';
export const THEME_PRODUCT_MEDIA_BORDER_THICKNESS_PATH = 'settings.productMedia.borderThickness';
export const THEME_PRODUCT_MEDIA_BORDER_OPACITY_PATH = 'settings.productMedia.borderOpacity';
export const THEME_PRODUCT_MEDIA_CORNER_RADIUS_PATH = 'settings.productMedia.cornerRadius';

export const THEME_PRODUCT_MEDIA_BORDER_STYLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
] as const;

export type ThemeProductMediaBorderStyle =
  (typeof THEME_PRODUCT_MEDIA_BORDER_STYLE_OPTIONS)[number]['value'];

export const THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MIN = 0;
export const THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MAX = 20;
export const THEME_PRODUCT_MEDIA_BORDER_OPACITY_MIN = 0;
export const THEME_PRODUCT_MEDIA_BORDER_OPACITY_MAX = 100;
export const THEME_PRODUCT_MEDIA_CORNER_RADIUS_MIN = 0;
export const THEME_PRODUCT_MEDIA_CORNER_RADIUS_MAX = 100;

export const THEME_DEFAULT_PRODUCT_MEDIA = {
  borderStyle: 'solid' as ThemeProductMediaBorderStyle,
  borderThickness: 1,
  borderOpacity: 50,
  cornerRadius: 0,
};

export type ThemeProductMediaSettings = {
  borderStyle: ThemeProductMediaBorderStyle;
  borderThickness: number;
  borderOpacity: number;
  cornerRadius: number;
};

function readProductMediaSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const productMedia = settings?.productMedia;
  return productMedia && typeof productMedia === 'object'
    ? (productMedia as Record<string, unknown>)
    : {};
}

function readLegacyCartProductMedia(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const cart = settings?.cart as Record<string, unknown> | undefined;
  const productMedia = cart?.productMedia;
  return productMedia && typeof productMedia === 'object'
    ? (productMedia as Record<string, unknown>)
    : {};
}

export function normalizeThemeProductMediaBorderStyle(
  value: unknown
): ThemeProductMediaBorderStyle {
  if (typeof value === 'string') {
    const match = THEME_PRODUCT_MEDIA_BORDER_STYLE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_PRODUCT_MEDIA_BORDER_STYLE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_PRODUCT_MEDIA.borderStyle;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function readThemeProductMediaSettings(
  config: Record<string, unknown> | null | undefined
): ThemeProductMediaSettings {
  const productMedia = readProductMediaSettings(config);
  const legacy = readLegacyCartProductMedia(config);

  const borderStyle = productMedia.borderStyle ?? legacy.borderStyle;
  const borderThickness = productMedia.borderThickness ?? legacy.borderThickness;
  const borderOpacity = productMedia.borderOpacity ?? legacy.borderOpacity;
  const cornerRadius = productMedia.cornerRadius ?? legacy.cornerRadius;

  return {
    borderStyle: normalizeThemeProductMediaBorderStyle(borderStyle),
    borderThickness: clampNumber(
      borderThickness,
      THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MIN,
      THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_PRODUCT_MEDIA.borderThickness
    ),
    borderOpacity: clampNumber(
      borderOpacity,
      THEME_PRODUCT_MEDIA_BORDER_OPACITY_MIN,
      THEME_PRODUCT_MEDIA_BORDER_OPACITY_MAX,
      THEME_DEFAULT_PRODUCT_MEDIA.borderOpacity
    ),
    cornerRadius: clampNumber(
      cornerRadius,
      THEME_PRODUCT_MEDIA_CORNER_RADIUS_MIN,
      THEME_PRODUCT_MEDIA_CORNER_RADIUS_MAX,
      THEME_DEFAULT_PRODUCT_MEDIA.cornerRadius
    ),
  };
}

export function readThemeProductMediaSettingsFromValues(
  values: Record<string, string | boolean>
): ThemeProductMediaSettings {
  return {
    borderStyle: normalizeThemeProductMediaBorderStyle(
      values[THEME_PRODUCT_MEDIA_BORDER_STYLE_PATH]
    ),
    borderThickness: clampNumber(
      values[THEME_PRODUCT_MEDIA_BORDER_THICKNESS_PATH],
      THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MIN,
      THEME_PRODUCT_MEDIA_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_PRODUCT_MEDIA.borderThickness
    ),
    borderOpacity: clampNumber(
      values[THEME_PRODUCT_MEDIA_BORDER_OPACITY_PATH],
      THEME_PRODUCT_MEDIA_BORDER_OPACITY_MIN,
      THEME_PRODUCT_MEDIA_BORDER_OPACITY_MAX,
      THEME_DEFAULT_PRODUCT_MEDIA.borderOpacity
    ),
    cornerRadius: clampNumber(
      values[THEME_PRODUCT_MEDIA_CORNER_RADIUS_PATH],
      THEME_PRODUCT_MEDIA_CORNER_RADIUS_MIN,
      THEME_PRODUCT_MEDIA_CORNER_RADIUS_MAX,
      THEME_DEFAULT_PRODUCT_MEDIA.cornerRadius
    ),
  };
}

export function seedThemeProductMediaValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const productMedia = readThemeProductMediaSettings(config);
  return {
    ...values,
    [THEME_PRODUCT_MEDIA_BORDER_STYLE_PATH]: productMedia.borderStyle,
    [THEME_PRODUCT_MEDIA_BORDER_THICKNESS_PATH]: String(productMedia.borderThickness),
    [THEME_PRODUCT_MEDIA_BORDER_OPACITY_PATH]: String(productMedia.borderOpacity),
    [THEME_PRODUCT_MEDIA_CORNER_RADIUS_PATH]: String(productMedia.cornerRadius),
  };
}

export function ensureThemeProductMediaDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const productMedia = (settings.productMedia ?? {}) as Record<string, unknown>;
  const legacy = readLegacyCartProductMedia(config);

  if (!settings.productMedia || typeof settings.productMedia !== 'object') {
    settings.productMedia = productMedia;
  }

  if (productMedia.borderStyle == null && legacy.borderStyle != null) {
    productMedia.borderStyle = legacy.borderStyle;
  }
  if (productMedia.cornerRadius == null && legacy.cornerRadius != null) {
    productMedia.cornerRadius = legacy.cornerRadius;
  }

  const resolved = readThemeProductMediaSettings({
    ...config,
    settings: { ...settings, productMedia },
  });

  productMedia.borderStyle = resolved.borderStyle;
  productMedia.borderThickness = resolved.borderThickness;
  productMedia.borderOpacity = resolved.borderOpacity;
  productMedia.cornerRadius = resolved.cornerRadius;

  settings.productMedia = productMedia;
  config.settings = settings;
}

export const THEME_PRODUCT_MEDIA_SCHEMA_GROUP = {
  id: 'product-media',
  label: 'Product media',
  fields: [
    { path: THEME_PRODUCT_MEDIA_BORDER_STYLE_PATH, type: 'text', label: 'Border style' },
    { path: THEME_PRODUCT_MEDIA_BORDER_THICKNESS_PATH, type: 'number', label: 'Border thickness' },
    { path: THEME_PRODUCT_MEDIA_BORDER_OPACITY_PATH, type: 'number', label: 'Border opacity' },
    { path: THEME_PRODUCT_MEDIA_CORNER_RADIUS_PATH, type: 'number', label: 'Corner radius' },
  ],
} as const;

export function withThemeProductMediaSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'product-media');
  const nextGroup = {
    id: THEME_PRODUCT_MEDIA_SCHEMA_GROUP.id,
    label: THEME_PRODUCT_MEDIA_SCHEMA_GROUP.label,
    fields: [...THEME_PRODUCT_MEDIA_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const drawersIndex = groups.findIndex((g) => g.id === 'drawers');
    if (drawersIndex >= 0) {
      groups.splice(drawersIndex + 1, 0, nextGroup);
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
