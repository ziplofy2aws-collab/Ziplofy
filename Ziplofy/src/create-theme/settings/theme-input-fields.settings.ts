import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import {
  resolveThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';
import {
  type ThemeTextPresetId,
  THEME_DEFAULT_TEXT_PRESETS,
} from './theme-typography.settings';

export const THEME_INPUT_FIELDS_BACKGROUND_COLOR_PATH = 'settings.inputFields.backgroundColor';
export const THEME_INPUT_FIELDS_TEXT_COLOR_PATH = 'settings.inputFields.textColor';
export const THEME_INPUT_FIELDS_BORDER_COLOR_PATH = 'settings.inputFields.borderColor';
export const THEME_INPUT_FIELDS_BORDER_THICKNESS_PATH = 'settings.inputFields.borderThickness';
export const THEME_INPUT_FIELDS_CORNER_RADIUS_PATH = 'settings.inputFields.cornerRadius';
export const THEME_INPUT_FIELDS_TEXT_PRESET_PATH = 'settings.inputFields.textPreset';

export const THEME_INPUT_FIELDS_BORDER_THICKNESS_MIN = 0;
export const THEME_INPUT_FIELDS_BORDER_THICKNESS_MAX = 20;
export const THEME_INPUT_FIELDS_CORNER_RADIUS_MIN = 0;
export const THEME_INPUT_FIELDS_CORNER_RADIUS_MAX = 100;

export const THEME_INPUT_FIELDS_TEXT_PRESET_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
] as const;

export type ThemeInputFieldsTextPreset =
  (typeof THEME_INPUT_FIELDS_TEXT_PRESET_OPTIONS)[number]['value'];

export const THEME_DEFAULT_INPUT_FIELDS = {
  backgroundColor: 'palette',
  textColor: themePaletteColorValue(1),
  borderColor: themePaletteColorValue(1),
  borderThickness: 1,
  cornerRadius: 4,
  textPreset: 'paragraph' as ThemeInputFieldsTextPreset,
};

export type ThemeInputFieldsSettings = {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderThickness: number;
  cornerRadius: number;
  textPreset: ThemeInputFieldsTextPreset;
};

function readInputFieldsSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const inputFields = settings?.inputFields;
  return inputFields && typeof inputFields === 'object'
    ? (inputFields as Record<string, unknown>)
    : {};
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeThemeInputFieldsTextPreset(value: unknown): ThemeInputFieldsTextPreset {
  if (typeof value === 'string') {
    const match = THEME_INPUT_FIELDS_TEXT_PRESET_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_INPUT_FIELDS_TEXT_PRESET_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_INPUT_FIELDS.textPreset;
}

export function readThemeInputFieldsSettings(
  config: Record<string, unknown> | null | undefined
): ThemeInputFieldsSettings {
  const inputFields = readInputFieldsSettings(config);

  return {
    backgroundColor:
      typeof inputFields.backgroundColor === 'string' && inputFields.backgroundColor.trim()
        ? inputFields.backgroundColor
        : THEME_DEFAULT_INPUT_FIELDS.backgroundColor,
    textColor:
      typeof inputFields.textColor === 'string' && inputFields.textColor.trim()
        ? inputFields.textColor
        : THEME_DEFAULT_INPUT_FIELDS.textColor,
    borderColor:
      typeof inputFields.borderColor === 'string' && inputFields.borderColor.trim()
        ? inputFields.borderColor
        : THEME_DEFAULT_INPUT_FIELDS.borderColor,
    borderThickness: clampNumber(
      inputFields.borderThickness,
      THEME_INPUT_FIELDS_BORDER_THICKNESS_MIN,
      THEME_INPUT_FIELDS_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_INPUT_FIELDS.borderThickness
    ),
    cornerRadius: clampNumber(
      inputFields.cornerRadius,
      THEME_INPUT_FIELDS_CORNER_RADIUS_MIN,
      THEME_INPUT_FIELDS_CORNER_RADIUS_MAX,
      THEME_DEFAULT_INPUT_FIELDS.cornerRadius
    ),
    textPreset: normalizeThemeInputFieldsTextPreset(inputFields.textPreset),
  };
}

export function resolveThemeInputFieldColors(
  config: Record<string, unknown> | null | undefined
): ThemeInputFieldsSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
  borderColorResolved: string;
} {
  const inputFields = readThemeInputFieldsSettings(config);
  return {
    ...inputFields,
    backgroundColorResolved: resolveThemePaletteColorSetting(
      config,
      inputFields.backgroundColor,
      0,
      '#ffffff'
    ),
    textColorResolved: resolveThemePaletteColorSetting(
      config,
      inputFields.textColor,
      1,
      '#111827'
    ),
    borderColorResolved: resolveThemePaletteColorSetting(
      config,
      inputFields.borderColor,
      1,
      '#111827'
    ),
  };
}

export function readThemeInputFieldsSettingsFromValues(
  values: Record<string, string | boolean>
): ThemeInputFieldsSettings {
  return {
    backgroundColor:
      typeof values[THEME_INPUT_FIELDS_BACKGROUND_COLOR_PATH] === 'string' &&
      String(values[THEME_INPUT_FIELDS_BACKGROUND_COLOR_PATH]).trim()
        ? String(values[THEME_INPUT_FIELDS_BACKGROUND_COLOR_PATH])
        : THEME_DEFAULT_INPUT_FIELDS.backgroundColor,
    textColor:
      typeof values[THEME_INPUT_FIELDS_TEXT_COLOR_PATH] === 'string' &&
      String(values[THEME_INPUT_FIELDS_TEXT_COLOR_PATH]).trim()
        ? String(values[THEME_INPUT_FIELDS_TEXT_COLOR_PATH])
        : THEME_DEFAULT_INPUT_FIELDS.textColor,
    borderColor:
      typeof values[THEME_INPUT_FIELDS_BORDER_COLOR_PATH] === 'string' &&
      String(values[THEME_INPUT_FIELDS_BORDER_COLOR_PATH]).trim()
        ? String(values[THEME_INPUT_FIELDS_BORDER_COLOR_PATH])
        : THEME_DEFAULT_INPUT_FIELDS.borderColor,
    borderThickness: clampNumber(
      values[THEME_INPUT_FIELDS_BORDER_THICKNESS_PATH],
      THEME_INPUT_FIELDS_BORDER_THICKNESS_MIN,
      THEME_INPUT_FIELDS_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_INPUT_FIELDS.borderThickness
    ),
    cornerRadius: clampNumber(
      values[THEME_INPUT_FIELDS_CORNER_RADIUS_PATH],
      THEME_INPUT_FIELDS_CORNER_RADIUS_MIN,
      THEME_INPUT_FIELDS_CORNER_RADIUS_MAX,
      THEME_DEFAULT_INPUT_FIELDS.cornerRadius
    ),
    textPreset: normalizeThemeInputFieldsTextPreset(values[THEME_INPUT_FIELDS_TEXT_PRESET_PATH]),
  };
}

export function seedThemeInputFieldsValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const inputFields = readThemeInputFieldsSettings(config);
  return {
    ...values,
    [THEME_INPUT_FIELDS_BACKGROUND_COLOR_PATH]: inputFields.backgroundColor,
    [THEME_INPUT_FIELDS_TEXT_COLOR_PATH]: inputFields.textColor,
    [THEME_INPUT_FIELDS_BORDER_COLOR_PATH]: inputFields.borderColor,
    [THEME_INPUT_FIELDS_BORDER_THICKNESS_PATH]: String(inputFields.borderThickness),
    [THEME_INPUT_FIELDS_CORNER_RADIUS_PATH]: String(inputFields.cornerRadius),
    [THEME_INPUT_FIELDS_TEXT_PRESET_PATH]: inputFields.textPreset,
  };
}

export function ensureThemeInputFieldsDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const inputFields = (settings.inputFields ?? {}) as Record<string, unknown>;

  if (!settings.inputFields || typeof settings.inputFields !== 'object') {
    settings.inputFields = inputFields;
  }

  const resolved = readThemeInputFieldsSettings({
    ...config,
    settings: { ...settings, inputFields },
  });

  inputFields.backgroundColor = resolved.backgroundColor;
  inputFields.textColor = resolved.textColor;
  inputFields.borderColor = resolved.borderColor;
  inputFields.borderThickness = resolved.borderThickness;
  inputFields.cornerRadius = resolved.cornerRadius;
  inputFields.textPreset = resolved.textPreset;

  settings.inputFields = inputFields;
  config.settings = settings;
}

export function themeInputFieldsTextPresetId(
  preset: ThemeInputFieldsTextPreset
): ThemeTextPresetId {
  return preset in THEME_DEFAULT_TEXT_PRESETS ? (preset as ThemeTextPresetId) : 'paragraph';
}

export const THEME_INPUT_FIELDS_SCHEMA_GROUP = {
  id: 'input-fields',
  label: 'Input fields',
  fields: [
    { path: THEME_INPUT_FIELDS_BACKGROUND_COLOR_PATH, type: 'text', label: 'Background' },
    { path: THEME_INPUT_FIELDS_TEXT_COLOR_PATH, type: 'text', label: 'Text' },
    { path: THEME_INPUT_FIELDS_BORDER_COLOR_PATH, type: 'text', label: 'Borders' },
    { path: THEME_INPUT_FIELDS_BORDER_THICKNESS_PATH, type: 'number', label: 'Border thickness' },
    { path: THEME_INPUT_FIELDS_CORNER_RADIUS_PATH, type: 'number', label: 'Corner radius' },
    { path: THEME_INPUT_FIELDS_TEXT_PRESET_PATH, type: 'text', label: 'Text preset' },
  ],
} as const;

export function withThemeInputFieldsSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'input-fields');
  const nextGroup = {
    id: THEME_INPUT_FIELDS_SCHEMA_GROUP.id,
    label: THEME_INPUT_FIELDS_SCHEMA_GROUP.label,
    fields: [...THEME_INPUT_FIELDS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const iconsIndex = groups.findIndex((g) => g.id === 'icons');
    if (iconsIndex >= 0) {
      groups.splice(iconsIndex + 1, 0, nextGroup);
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
