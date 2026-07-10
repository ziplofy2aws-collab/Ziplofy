import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import {
  resolveThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';
import { THEME_TEXT_CASE_OPTIONS } from './theme-typography.settings';

export const THEME_BUTTON_TRANSPARENT_VALUE = 'transparent';

export const THEME_BUTTONS_PRIMARY_BACKGROUND_PATH = 'settings.buttons.primary.background';
export const THEME_BUTTONS_PRIMARY_TEXT_PATH = 'settings.buttons.primary.text';
export const THEME_BUTTONS_PRIMARY_BORDER_PATH = 'settings.buttons.primary.border';
export const THEME_BUTTONS_PRIMARY_BORDER_THICKNESS_PATH =
  'settings.buttons.primary.borderThickness';
export const THEME_BUTTONS_PRIMARY_CORNER_RADIUS_PATH = 'settings.buttons.primary.cornerRadius';
export const THEME_BUTTONS_PRIMARY_FONT_PATH = 'settings.buttons.primary.font';
export const THEME_BUTTONS_PRIMARY_TEXT_CASE_PATH = 'settings.buttons.primary.textCase';

export const THEME_BUTTONS_SECONDARY_BACKGROUND_PATH = 'settings.buttons.secondary.background';
export const THEME_BUTTONS_SECONDARY_TEXT_PATH = 'settings.buttons.secondary.text';
export const THEME_BUTTONS_SECONDARY_BORDER_PATH = 'settings.buttons.secondary.border';
export const THEME_BUTTONS_SECONDARY_BORDER_THICKNESS_PATH =
  'settings.buttons.secondary.borderThickness';
export const THEME_BUTTONS_SECONDARY_CORNER_RADIUS_PATH = 'settings.buttons.secondary.cornerRadius';
export const THEME_BUTTONS_SECONDARY_FONT_PATH = 'settings.buttons.secondary.font';
export const THEME_BUTTONS_SECONDARY_TEXT_CASE_PATH = 'settings.buttons.secondary.textCase';

export const THEME_BUTTONS_PILLS_CORNER_RADIUS_PATH = 'settings.buttons.pills.cornerRadius';

export const THEME_BUTTON_CORNER_RADIUS_MIN = 0;
export const THEME_BUTTON_CORNER_RADIUS_MAX = 100;
export const THEME_BUTTON_BORDER_THICKNESS_MIN = 0;
export const THEME_BUTTON_BORDER_THICKNESS_MAX = 20;

export const THEME_BUTTON_FONT_OPTIONS = [
  { value: 'body', label: 'Body' },
  { value: 'accent', label: 'Accent' },
] as const;

export type ThemeButtonFontRole = (typeof THEME_BUTTON_FONT_OPTIONS)[number]['value'];
export type ThemeButtonTextCase = (typeof THEME_TEXT_CASE_OPTIONS)[number]['value'];
export type ThemeButtonVariant = 'primary' | 'secondary';

export const THEME_DEFAULT_BUTTONS = {
  primary: {
    background: themePaletteColorValue(1),
    text: 'palette',
    border: themePaletteColorValue(1),
    borderThickness: 0,
    cornerRadius: 14,
    font: 'body' as ThemeButtonFontRole,
    textCase: 'default' as ThemeButtonTextCase,
  },
  secondary: {
    background: THEME_BUTTON_TRANSPARENT_VALUE,
    text: themePaletteColorValue(1),
    border: themePaletteColorValue(1),
    borderThickness: 1,
    cornerRadius: 14,
    font: 'body' as ThemeButtonFontRole,
    textCase: 'default' as ThemeButtonTextCase,
  },
  pills: {
    cornerRadius: 40,
  },
};

export type ThemeButtonVariantSettings = {
  background: string;
  text: string;
  border: string;
  borderThickness: number;
  cornerRadius: number;
  font: ThemeButtonFontRole;
  textCase: ThemeButtonTextCase;
};

export type ThemeButtonsSettings = {
  primary: ThemeButtonVariantSettings;
  secondary: ThemeButtonVariantSettings;
  pills: { cornerRadius: number };
};

function readButtonsSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const buttons = settings?.buttons;
  return buttons && typeof buttons === 'object' ? (buttons as Record<string, unknown>) : {};
}

function readVariantSettings(
  buttons: Record<string, unknown>,
  variant: ThemeButtonVariant
): Record<string, unknown> {
  const raw = buttons[variant];
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}

export function isThemeButtonTransparentBackground(value: unknown): boolean {
  return value === THEME_BUTTON_TRANSPARENT_VALUE;
}

export function normalizeThemeButtonFontRole(value: unknown): ThemeButtonFontRole {
  if (typeof value === 'string') {
    const match = THEME_BUTTON_FONT_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_BUTTON_FONT_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_BUTTONS.primary.font;
}

export function normalizeThemeButtonTextCase(value: unknown): ThemeButtonTextCase {
  if (typeof value === 'string') {
    const match = THEME_TEXT_CASE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_TEXT_CASE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_BUTTONS.primary.textCase;
}

export function normalizeThemeButtonCornerRadius(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(
    THEME_BUTTON_CORNER_RADIUS_MAX,
    Math.max(THEME_BUTTON_CORNER_RADIUS_MIN, Math.round(parsed))
  );
}

export function normalizeThemeButtonBorderThickness(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(
    THEME_BUTTON_BORDER_THICKNESS_MAX,
    Math.max(THEME_BUTTON_BORDER_THICKNESS_MIN, Math.round(parsed))
  );
}

function readVariant(
  buttons: Record<string, unknown>,
  variant: ThemeButtonVariant
): ThemeButtonVariantSettings {
  const defaults = THEME_DEFAULT_BUTTONS[variant];
  const raw = readVariantSettings(buttons, variant);
  return {
    background:
      typeof raw.background === 'string' && raw.background.trim()
        ? raw.background
        : defaults.background,
    text: typeof raw.text === 'string' && raw.text.trim() ? raw.text : defaults.text,
    border: typeof raw.border === 'string' && raw.border.trim() ? raw.border : defaults.border,
    borderThickness: normalizeThemeButtonBorderThickness(
      raw.borderThickness,
      defaults.borderThickness
    ),
    cornerRadius: normalizeThemeButtonCornerRadius(raw.cornerRadius, defaults.cornerRadius),
    font: normalizeThemeButtonFontRole(raw.font ?? defaults.font),
    textCase: normalizeThemeButtonTextCase(raw.textCase ?? defaults.textCase),
  };
}

export function readThemeButtonsSettings(
  config: Record<string, unknown> | null | undefined
): ThemeButtonsSettings {
  const buttons = readButtonsSettings(config);
  const pills = (buttons.pills ?? {}) as Record<string, unknown>;
  return {
    primary: readVariant(buttons, 'primary'),
    secondary: readVariant(buttons, 'secondary'),
    pills: {
      cornerRadius: normalizeThemeButtonCornerRadius(
        pills.cornerRadius,
        THEME_DEFAULT_BUTTONS.pills.cornerRadius
      ),
    },
  };
}

export function resolveThemeButtonBackgroundColor(
  config: Record<string, unknown> | null | undefined,
  raw: unknown,
  defaultIndex: number,
  fallback: string
): string {
  if (isThemeButtonTransparentBackground(raw)) return 'transparent';
  return resolveThemePaletteColorSetting(config, raw, defaultIndex, fallback);
}

export function resolveThemeButtonBorderColor(
  config: Record<string, unknown> | null | undefined,
  raw: unknown,
  defaultIndex: number,
  fallback: string
): string {
  return resolveThemePaletteColorSetting(config, raw, defaultIndex, fallback);
}

export function resolveThemeButtonTextColor(
  config: Record<string, unknown> | null | undefined,
  raw: unknown,
  defaultIndex: number,
  fallback: string
): string {
  return resolveThemePaletteColorSetting(config, raw, defaultIndex, fallback);
}

function seedVariantValues(
  values: Record<string, string | boolean>,
  variant: ThemeButtonVariant,
  settings: ThemeButtonVariantSettings
): Record<string, string | boolean> {
  const prefix = `settings.buttons.${variant}`;
  return {
    ...values,
    [`${prefix}.background`]: settings.background,
    [`${prefix}.text`]: settings.text,
    [`${prefix}.border`]: settings.border,
    [`${prefix}.borderThickness`]: String(settings.borderThickness),
    [`${prefix}.cornerRadius`]: String(settings.cornerRadius),
    [`${prefix}.font`]: settings.font,
    [`${prefix}.textCase`]: settings.textCase,
  };
}

export function seedThemeButtonsValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const buttons = readThemeButtonsSettings(config);
  return {
    ...seedVariantValues(seedVariantValues(values, 'primary', buttons.primary), 'secondary', buttons.secondary),
    [THEME_BUTTONS_PILLS_CORNER_RADIUS_PATH]: String(buttons.pills.cornerRadius),
  };
}

function ensureVariantDefaults(
  buttons: Record<string, unknown>,
  variant: ThemeButtonVariant
): void {
  const defaults = THEME_DEFAULT_BUTTONS[variant];
  const raw = readVariantSettings(buttons, variant);
  if (!buttons[variant] || typeof buttons[variant] !== 'object') {
    buttons[variant] = raw;
  }
  if (!raw.background) raw.background = defaults.background;
  if (!raw.text) raw.text = defaults.text;
  if (!raw.border) raw.border = defaults.border;
  if (raw.borderThickness == null) raw.borderThickness = defaults.borderThickness;
  if (raw.cornerRadius == null) raw.cornerRadius = defaults.cornerRadius;
  if (!raw.font) raw.font = defaults.font;
  if (!raw.textCase) raw.textCase = defaults.textCase;
  buttons[variant] = raw;
}

export function ensureThemeButtonsDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const buttons = (settings.buttons ?? {}) as Record<string, unknown>;
  const pills = (buttons.pills ?? {}) as Record<string, unknown>;

  if (!settings.buttons || typeof settings.buttons !== 'object') {
    settings.buttons = buttons;
  }

  ensureVariantDefaults(buttons, 'primary');
  ensureVariantDefaults(buttons, 'secondary');

  if (!buttons.pills || typeof buttons.pills !== 'object') {
    buttons.pills = pills;
  }
  if (pills.cornerRadius == null) {
    pills.cornerRadius = THEME_DEFAULT_BUTTONS.pills.cornerRadius;
  }
  buttons.pills = pills;

  settings.buttons = buttons;
  config.settings = settings;
}

const BUTTON_VARIANT_FIELDS = (variant: ThemeButtonVariant) => [
  { path: `settings.buttons.${variant}.background`, type: 'text', label: 'Background' },
  { path: `settings.buttons.${variant}.text`, type: 'text', label: 'Text' },
  { path: `settings.buttons.${variant}.border`, type: 'text', label: 'Borders' },
  {
    path: `settings.buttons.${variant}.borderThickness`,
    type: 'number',
    label: 'Border thickness',
  },
  { path: `settings.buttons.${variant}.cornerRadius`, type: 'number', label: 'Corner radius' },
  { path: `settings.buttons.${variant}.font`, type: 'text', label: 'Font' },
  { path: `settings.buttons.${variant}.textCase`, type: 'text', label: 'Text case' },
];

export const THEME_BUTTONS_SCHEMA_GROUP = {
  id: 'buttons',
  label: 'Buttons',
  fields: [
    ...BUTTON_VARIANT_FIELDS('primary'),
    ...BUTTON_VARIANT_FIELDS('secondary'),
    {
      path: THEME_BUTTONS_PILLS_CORNER_RADIUS_PATH,
      type: 'number',
      label: 'Pills corner radius',
    },
  ],
} as const;

export function withThemeButtonsSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'buttons');
  const nextGroup = {
    id: THEME_BUTTONS_SCHEMA_GROUP.id,
    label: THEME_BUTTONS_SCHEMA_GROUP.label,
    fields: [...THEME_BUTTONS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const badgesIndex = groups.findIndex((g) => g.id === 'badges');
    if (badgesIndex >= 0) {
      groups.splice(badgesIndex + 1, 0, nextGroup);
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
