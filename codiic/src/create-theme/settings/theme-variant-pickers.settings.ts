import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import {
  resolveThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';

export const THEME_VARIANT_PICKERS_VARIANT_BACKGROUND_PATH =
  'settings.variantPickers.variant.backgroundColor';
export const THEME_VARIANT_PICKERS_VARIANT_TEXT_PATH = 'settings.variantPickers.variant.textColor';
export const THEME_VARIANT_PICKERS_VARIANT_BORDER_PATH =
  'settings.variantPickers.variant.borderColor';
export const THEME_VARIANT_PICKERS_SELECTED_BACKGROUND_PATH =
  'settings.variantPickers.selected.backgroundColor';
export const THEME_VARIANT_PICKERS_SELECTED_TEXT_PATH =
  'settings.variantPickers.selected.textColor';
export const THEME_VARIANT_PICKERS_SELECTED_BORDER_PATH =
  'settings.variantPickers.selected.borderColor';
export const THEME_VARIANT_PICKERS_BORDER_THICKNESS_PATH =
  'settings.variantPickers.borderThickness';
export const THEME_VARIANT_PICKERS_CORNER_RADIUS_PATH = 'settings.variantPickers.cornerRadius';
export const THEME_VARIANT_PICKERS_WIDTH_PATH = 'settings.variantPickers.width';

export const THEME_VARIANT_PICKERS_BORDER_THICKNESS_MIN = 0;
export const THEME_VARIANT_PICKERS_BORDER_THICKNESS_MAX = 20;
export const THEME_VARIANT_PICKERS_CORNER_RADIUS_MIN = 0;
export const THEME_VARIANT_PICKERS_CORNER_RADIUS_MAX = 100;

export const THEME_VARIANT_PICKERS_WIDTH_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

export type ThemeVariantPickerWidth = (typeof THEME_VARIANT_PICKERS_WIDTH_OPTIONS)[number]['value'];

export type ThemeVariantPickerColorGroup = {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
};

export const THEME_DEFAULT_VARIANT_PICKERS = {
  variant: {
    backgroundColor: 'palette',
    textColor: themePaletteColorValue(1),
    borderColor: themePaletteColorValue(2),
  },
  selected: {
    backgroundColor: themePaletteColorValue(1),
    textColor: 'palette',
    borderColor: themePaletteColorValue(1),
  },
  borderThickness: 1,
  cornerRadius: 14,
  width: 'fit' as ThemeVariantPickerWidth,
};

export type ThemeVariantPickersSettings = {
  variant: ThemeVariantPickerColorGroup;
  selected: ThemeVariantPickerColorGroup;
  borderThickness: number;
  cornerRadius: number;
  width: ThemeVariantPickerWidth;
};

function readVariantPickersSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const variantPickers = settings?.variantPickers;
  return variantPickers && typeof variantPickers === 'object'
    ? (variantPickers as Record<string, unknown>)
    : {};
}

function readColorGroup(
  raw: unknown,
  defaults: ThemeVariantPickerColorGroup
): ThemeVariantPickerColorGroup {
  const group = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    backgroundColor:
      typeof group.backgroundColor === 'string' && group.backgroundColor.trim()
        ? group.backgroundColor
        : defaults.backgroundColor,
    textColor:
      typeof group.textColor === 'string' && group.textColor.trim()
        ? group.textColor
        : defaults.textColor,
    borderColor:
      typeof group.borderColor === 'string' && group.borderColor.trim()
        ? group.borderColor
        : defaults.borderColor,
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeThemeVariantPickerWidth(value: unknown): ThemeVariantPickerWidth {
  if (typeof value === 'string') {
    const match = THEME_VARIANT_PICKERS_WIDTH_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_VARIANT_PICKERS_WIDTH_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_VARIANT_PICKERS.width;
}

export function readThemeVariantPickersSettings(
  config: Record<string, unknown> | null | undefined
): ThemeVariantPickersSettings {
  const variantPickers = readVariantPickersSettings(config);

  return {
    variant: readColorGroup(variantPickers.variant, THEME_DEFAULT_VARIANT_PICKERS.variant),
    selected: readColorGroup(variantPickers.selected, THEME_DEFAULT_VARIANT_PICKERS.selected),
    borderThickness: clampNumber(
      variantPickers.borderThickness,
      THEME_VARIANT_PICKERS_BORDER_THICKNESS_MIN,
      THEME_VARIANT_PICKERS_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_VARIANT_PICKERS.borderThickness
    ),
    cornerRadius: clampNumber(
      variantPickers.cornerRadius,
      THEME_VARIANT_PICKERS_CORNER_RADIUS_MIN,
      THEME_VARIANT_PICKERS_CORNER_RADIUS_MAX,
      THEME_DEFAULT_VARIANT_PICKERS.cornerRadius
    ),
    width: normalizeThemeVariantPickerWidth(variantPickers.width),
  };
}

export type ResolvedThemeVariantPickerColors = ThemeVariantPickersSettings & {
  variantBackgroundResolved: string;
  variantTextResolved: string;
  variantBorderResolved: string;
  selectedBackgroundResolved: string;
  selectedTextResolved: string;
  selectedBorderResolved: string;
};

export function resolveThemeVariantPickerColors(
  config: Record<string, unknown> | null | undefined
): ResolvedThemeVariantPickerColors {
  const variantPickers = readThemeVariantPickersSettings(config);
  return {
    ...variantPickers,
    variantBackgroundResolved: resolveThemePaletteColorSetting(
      config,
      variantPickers.variant.backgroundColor,
      0,
      '#ffffff'
    ),
    variantTextResolved: resolveThemePaletteColorSetting(
      config,
      variantPickers.variant.textColor,
      1,
      '#111827'
    ),
    variantBorderResolved: resolveThemePaletteColorSetting(
      config,
      variantPickers.variant.borderColor,
      1,
      '#111827'
    ),
    selectedBackgroundResolved: resolveThemePaletteColorSetting(
      config,
      variantPickers.selected.backgroundColor,
      1,
      '#111827'
    ),
    selectedTextResolved: resolveThemePaletteColorSetting(
      config,
      variantPickers.selected.textColor,
      0,
      '#ffffff'
    ),
    selectedBorderResolved: resolveThemePaletteColorSetting(
      config,
      variantPickers.selected.borderColor,
      1,
      '#111827'
    ),
  };
}

function readColorGroupFromValues(
  values: Record<string, string | boolean>,
  backgroundPath: string,
  textPath: string,
  borderPath: string,
  defaults: ThemeVariantPickerColorGroup
): ThemeVariantPickerColorGroup {
  return {
    backgroundColor:
      typeof values[backgroundPath] === 'string' && String(values[backgroundPath]).trim()
        ? String(values[backgroundPath])
        : defaults.backgroundColor,
    textColor:
      typeof values[textPath] === 'string' && String(values[textPath]).trim()
        ? String(values[textPath])
        : defaults.textColor,
    borderColor:
      typeof values[borderPath] === 'string' && String(values[borderPath]).trim()
        ? String(values[borderPath])
        : defaults.borderColor,
  };
}

export function readThemeVariantPickersSettingsFromValues(
  values: Record<string, string | boolean>
): ThemeVariantPickersSettings {
  return {
    variant: readColorGroupFromValues(
      values,
      THEME_VARIANT_PICKERS_VARIANT_BACKGROUND_PATH,
      THEME_VARIANT_PICKERS_VARIANT_TEXT_PATH,
      THEME_VARIANT_PICKERS_VARIANT_BORDER_PATH,
      THEME_DEFAULT_VARIANT_PICKERS.variant
    ),
    selected: readColorGroupFromValues(
      values,
      THEME_VARIANT_PICKERS_SELECTED_BACKGROUND_PATH,
      THEME_VARIANT_PICKERS_SELECTED_TEXT_PATH,
      THEME_VARIANT_PICKERS_SELECTED_BORDER_PATH,
      THEME_DEFAULT_VARIANT_PICKERS.selected
    ),
    borderThickness: clampNumber(
      values[THEME_VARIANT_PICKERS_BORDER_THICKNESS_PATH],
      THEME_VARIANT_PICKERS_BORDER_THICKNESS_MIN,
      THEME_VARIANT_PICKERS_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_VARIANT_PICKERS.borderThickness
    ),
    cornerRadius: clampNumber(
      values[THEME_VARIANT_PICKERS_CORNER_RADIUS_PATH],
      THEME_VARIANT_PICKERS_CORNER_RADIUS_MIN,
      THEME_VARIANT_PICKERS_CORNER_RADIUS_MAX,
      THEME_DEFAULT_VARIANT_PICKERS.cornerRadius
    ),
    width: normalizeThemeVariantPickerWidth(values[THEME_VARIANT_PICKERS_WIDTH_PATH]),
  };
}

export function seedThemeVariantPickersValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const variantPickers = readThemeVariantPickersSettings(config);
  return {
    ...values,
    [THEME_VARIANT_PICKERS_VARIANT_BACKGROUND_PATH]: variantPickers.variant.backgroundColor,
    [THEME_VARIANT_PICKERS_VARIANT_TEXT_PATH]: variantPickers.variant.textColor,
    [THEME_VARIANT_PICKERS_VARIANT_BORDER_PATH]: variantPickers.variant.borderColor,
    [THEME_VARIANT_PICKERS_SELECTED_BACKGROUND_PATH]: variantPickers.selected.backgroundColor,
    [THEME_VARIANT_PICKERS_SELECTED_TEXT_PATH]: variantPickers.selected.textColor,
    [THEME_VARIANT_PICKERS_SELECTED_BORDER_PATH]: variantPickers.selected.borderColor,
    [THEME_VARIANT_PICKERS_BORDER_THICKNESS_PATH]: String(variantPickers.borderThickness),
    [THEME_VARIANT_PICKERS_CORNER_RADIUS_PATH]: String(variantPickers.cornerRadius),
    [THEME_VARIANT_PICKERS_WIDTH_PATH]: variantPickers.width,
  };
}

export function ensureThemeVariantPickersDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const variantPickers = (settings.variantPickers ?? {}) as Record<string, unknown>;
  const variant = (variantPickers.variant ?? {}) as Record<string, unknown>;
  const selected = (variantPickers.selected ?? {}) as Record<string, unknown>;

  if (!settings.variantPickers || typeof settings.variantPickers !== 'object') {
    settings.variantPickers = variantPickers;
  }
  if (!variantPickers.variant || typeof variantPickers.variant !== 'object') {
    variantPickers.variant = variant;
  }
  if (!variantPickers.selected || typeof variantPickers.selected !== 'object') {
    variantPickers.selected = selected;
  }

  const resolved = readThemeVariantPickersSettings({
    ...config,
    settings: { ...settings, variantPickers: { ...variantPickers, variant, selected } },
  });

  variant.backgroundColor = resolved.variant.backgroundColor;
  variant.textColor = resolved.variant.textColor;
  variant.borderColor = resolved.variant.borderColor;
  selected.backgroundColor = resolved.selected.backgroundColor;
  selected.textColor = resolved.selected.textColor;
  selected.borderColor = resolved.selected.borderColor;
  variantPickers.borderThickness = resolved.borderThickness;
  variantPickers.cornerRadius = resolved.cornerRadius;
  variantPickers.width = resolved.width;
  variantPickers.variant = variant;
  variantPickers.selected = selected;

  settings.variantPickers = variantPickers;
  config.settings = settings;
}

export const THEME_VARIANT_PICKERS_SCHEMA_GROUP = {
  id: 'variant-pickers',
  label: 'Variant pickers',
  fields: [
    {
      path: THEME_VARIANT_PICKERS_VARIANT_BACKGROUND_PATH,
      type: 'text',
      label: 'Background',
    },
    { path: THEME_VARIANT_PICKERS_VARIANT_TEXT_PATH, type: 'text', label: 'Text' },
    { path: THEME_VARIANT_PICKERS_VARIANT_BORDER_PATH, type: 'text', label: 'Borders' },
    {
      path: THEME_VARIANT_PICKERS_SELECTED_BACKGROUND_PATH,
      type: 'text',
      label: 'Selected background',
    },
    { path: THEME_VARIANT_PICKERS_SELECTED_TEXT_PATH, type: 'text', label: 'Selected text' },
    { path: THEME_VARIANT_PICKERS_SELECTED_BORDER_PATH, type: 'text', label: 'Selected borders' },
    {
      path: THEME_VARIANT_PICKERS_BORDER_THICKNESS_PATH,
      type: 'number',
      label: 'Border thickness',
    },
    { path: THEME_VARIANT_PICKERS_CORNER_RADIUS_PATH, type: 'number', label: 'Corner radius' },
    { path: THEME_VARIANT_PICKERS_WIDTH_PATH, type: 'text', label: 'Width' },
  ],
} as const;

export function withThemeVariantPickersSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'variant-pickers');
  const nextGroup = {
    id: THEME_VARIANT_PICKERS_SCHEMA_GROUP.id,
    label: THEME_VARIANT_PICKERS_SCHEMA_GROUP.label,
    fields: [...THEME_VARIANT_PICKERS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const swatchesIndex = groups.findIndex((g) => g.id === 'swatches');
    if (swatchesIndex >= 0) {
      groups.splice(swatchesIndex + 1, 0, nextGroup);
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
