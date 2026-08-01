import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import { normalizeHexColor } from '../checkout/settings/checkout-color.utils';
import {
  CHECKOUT_TYPOGRAPHY_FONT_OPTIONS,
  normalizeCheckoutTypographyFont,
  resolveCheckoutFontFamily,
  resolveCheckoutGoogleFontName,
  type CheckoutTypographyFontOption,
} from '../checkout/settings/checkout-typography-fonts';
import { getThemePaletteColor, readThemeColorPalette } from './theme-color-palette.settings';

export const THEME_TYPOGRAPHY_EXTRA_FONTS: CheckoutTypographyFontOption[] = [
  {
    value: 'inter',
    label: 'Inter',
    family: '"Inter", system-ui, -apple-system, sans-serif',
    googleFont: 'Inter',
  },
];

export const THEME_TYPOGRAPHY_FONT_OPTIONS: CheckoutTypographyFontOption[] = [
  ...THEME_TYPOGRAPHY_EXTRA_FONTS,
  ...CHECKOUT_TYPOGRAPHY_FONT_OPTIONS.filter((font) => font.value !== 'inter'),
];

const FONT_BY_VALUE = new Map(THEME_TYPOGRAPHY_FONT_OPTIONS.map((font) => [font.value, font]));

export type ThemeFontRole = 'body' | 'subheading' | 'heading' | 'accent';
export type ThemeTextPresetId = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type ThemeLineHeightKey = 'tight' | 'normal' | 'loose';
export type ThemeLetterSpacingKey = 'tight' | 'normal' | 'loose';
export type ThemeTextCaseKey = 'default' | 'uppercase';

export type ThemeTextPreset = {
  font: ThemeFontRole | 'heading' | 'accent';
  size: number;
  lineHeight: ThemeLineHeightKey;
  letterSpacing: ThemeLetterSpacingKey;
  textCase: ThemeTextCaseKey;
};

export const THEME_TYPOGRAPHY_TEXT_COLOR_PATH = 'settings.typography.textColor';
export const THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH = 'settings.typography.fontBodyKey';
export const THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH = 'settings.typography.fontSubheadingKey';
export const THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH = 'settings.typography.fontHeadingKey';
export const THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH = 'settings.typography.fontAccentKey';

export const THEME_TYPOGRAPHY_FONT_BODY_WEIGHT_PATH = 'settings.typography.fontBodyWeight';
export const THEME_TYPOGRAPHY_FONT_SUBHEADING_WEIGHT_PATH = 'settings.typography.fontSubheadingWeight';
export const THEME_TYPOGRAPHY_FONT_HEADING_WEIGHT_PATH = 'settings.typography.fontHeadingWeight';
export const THEME_TYPOGRAPHY_FONT_ACCENT_WEIGHT_PATH = 'settings.typography.fontAccentWeight';

export const THEME_FONT_WEIGHT_OPTIONS = [
  { value: 'regular', label: 'Regular', weight: 400 },
  { value: 'medium', label: 'Medium', weight: 500 },
  { value: 'semibold', label: 'Semi Bold', weight: 600 },
  { value: 'bold', label: 'Bold', weight: 700 },
] as const;

export type ThemeFontWeightKey = (typeof THEME_FONT_WEIGHT_OPTIONS)[number]['value'];

/** Shopify-style system font list shown in the typography font picker. */
export const THEME_SYSTEM_FONT_PICKER_OPTIONS: CheckoutTypographyFontOption[] = [
  {
    value: 'mono',
    label: 'SF Mono',
    family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
    googleFont: null,
  },
  {
    value: 'arial',
    label: 'Helvetica',
    family: 'Helvetica, Arial, "Helvetica Neue", sans-serif',
    googleFont: null,
  },
  {
    value: 'serif',
    label: 'New York',
    family: '"New York", Georgia, "Times New Roman", serif',
    googleFont: null,
  },
  {
    value: 'system-ui',
    label: 'system_ui',
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    googleFont: null,
  },
];

export const THEME_OTHER_FONT_PICKER_OPTIONS = THEME_TYPOGRAPHY_FONT_OPTIONS.filter(
  (font) => font.googleFont && font.value !== 'default'
);

export function normalizeThemeFontWeight(value: unknown): ThemeFontWeightKey {
  if (typeof value === 'string') {
    const match = THEME_FONT_WEIGHT_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
  }
  return 'regular';
}

export function resolveThemeFontWeightNumber(value: unknown): number {
  const key = normalizeThemeFontWeight(value);
  return THEME_FONT_WEIGHT_OPTIONS.find((opt) => opt.value === key)?.weight ?? 400;
}

export function readThemeFontWeightForRole(
  config: Record<string, unknown> | null | undefined,
  role: 'body' | 'subheading' | 'heading' | 'accent'
): number {
  const typography = readTypographySettings(config);
  const key = themeFontWeightPathForRole(role).replace('settings.typography.', '');
  return resolveThemeFontWeightNumber(typography[key]);
}

export function themeFontWeightPathForRole(
  role: 'body' | 'subheading' | 'heading' | 'accent'
): string {
  if (role === 'subheading') return THEME_TYPOGRAPHY_FONT_SUBHEADING_WEIGHT_PATH;
  if (role === 'heading') return THEME_TYPOGRAPHY_FONT_HEADING_WEIGHT_PATH;
  if (role === 'accent') return THEME_TYPOGRAPHY_FONT_ACCENT_WEIGHT_PATH;
  return THEME_TYPOGRAPHY_FONT_BODY_WEIGHT_PATH;
}

export function themeFontKeyPathForRole(role: 'body' | 'subheading' | 'heading' | 'accent'): string {
  if (role === 'subheading') return THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH;
  if (role === 'heading') return THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH;
  if (role === 'accent') return THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH;
  return THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH;
}

export const THEME_TYPOGRAPHY_FONT_FAMILY_PATH = 'settings.typography.fontFamily';
export const THEME_TYPOGRAPHY_FONT_FAMILY_BODY_PATH = 'settings.typography.fontFamilyBody';
export const THEME_TYPOGRAPHY_FONT_FAMILY_SUBHEADING_PATH = 'settings.typography.fontFamilySubheading';
export const THEME_TYPOGRAPHY_FONT_FAMILY_ACCENT_PATH = 'settings.typography.fontFamilyAccent';

export const THEME_DEFAULT_FONT_KEYS = {
  body: 'inter',
  subheading: 'inter',
  heading: 'inter',
  accent: 'inter',
} as const;

export const THEME_DEFAULT_TEXT_PRESETS: Record<ThemeTextPresetId, ThemeTextPreset> = {
  paragraph: {
    font: 'body',
    size: 14,
    lineHeight: 'loose',
    letterSpacing: 'normal',
    textCase: 'default',
  },
  h1: {
    font: 'heading',
    size: 56,
    lineHeight: 'tight',
    letterSpacing: 'normal',
    textCase: 'default',
  },
  h2: {
    font: 'heading',
    size: 48,
    lineHeight: 'tight',
    letterSpacing: 'normal',
    textCase: 'default',
  },
  h3: {
    font: 'heading',
    size: 32,
    lineHeight: 'normal',
    letterSpacing: 'normal',
    textCase: 'default',
  },
  h4: {
    font: 'heading',
    size: 24,
    lineHeight: 'tight',
    letterSpacing: 'normal',
    textCase: 'default',
  },
  h5: {
    font: 'subheading',
    size: 14,
    lineHeight: 'loose',
    letterSpacing: 'normal',
    textCase: 'default',
  },
  h6: {
    font: 'subheading',
    size: 12,
    lineHeight: 'loose',
    letterSpacing: 'normal',
    textCase: 'default',
  },
};

export const THEME_FONT_SIZE_OPTIONS = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '40px',
  '48px',
  '56px',
  '64px',
  '72px',
] as const;

export const THEME_LINE_HEIGHT_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'loose', label: 'Loose' },
] as const;

export const THEME_LETTER_SPACING_OPTIONS = [...THEME_LINE_HEIGHT_OPTIONS];

export const THEME_TEXT_CASE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'Uppercase' },
] as const;

export const THEME_FONT_ROLE_OPTIONS = [
  { value: 'body', label: 'Body' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'heading', label: 'Heading' },
  { value: 'accent', label: 'Accent' },
] as const;

export const THEME_HEADING_ACCENT_FONT_OPTIONS = [
  { value: 'heading', label: 'Heading' },
  { value: 'accent', label: 'Accent' },
] as const;

export function themePresetPath(presetId: ThemeTextPresetId, key: keyof ThemeTextPreset): string {
  return `settings.typography.presets.${presetId}.${key}`;
}

export function normalizeThemeTypographyFont(value: unknown, fallback = 'inter'): string {
  if (typeof value === 'string' && FONT_BY_VALUE.has(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const byLabel = THEME_TYPOGRAPHY_FONT_OPTIONS.find(
      (font) => font.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  const normalized = normalizeCheckoutTypographyFont(value);
  if (FONT_BY_VALUE.has(normalized)) return normalized;
  return fallback;
}

export function resolveThemeFontFamilyFromKey(value: unknown, fallback = 'inter'): string {
  const key = normalizeThemeTypographyFont(value, fallback);
  return FONT_BY_VALUE.get(key)?.family ?? resolveCheckoutFontFamily(key);
}

export function resolveThemeGoogleFontFromKey(value: unknown, fallback = 'inter'): string | null {
  const key = normalizeThemeTypographyFont(value, fallback);
  return FONT_BY_VALUE.get(key)?.googleFont ?? resolveCheckoutGoogleFontName(key);
}

export type ThemeTypographyFonts = {
  fontBody: string;
  fontSubheading: string;
  fontHeading: string;
  fontAccent: string;
  googleFonts: string[];
};

export function syncThemeTypographyFontFields(keys: {
  body?: unknown;
  subheading?: unknown;
  heading?: unknown;
  accent?: unknown;
}): Record<string, string> {
  const bodyKey = normalizeThemeTypographyFont(keys.body, THEME_DEFAULT_FONT_KEYS.body);
  const subheadingKey = normalizeThemeTypographyFont(keys.subheading, THEME_DEFAULT_FONT_KEYS.subheading);
  const headingKey = normalizeThemeTypographyFont(keys.heading, THEME_DEFAULT_FONT_KEYS.heading);
  const accentKey = normalizeThemeTypographyFont(keys.accent, THEME_DEFAULT_FONT_KEYS.accent);

  return {
    [THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH]: bodyKey,
    [THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH]: subheadingKey,
    [THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH]: headingKey,
    [THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH]: accentKey,
    [THEME_TYPOGRAPHY_FONT_FAMILY_BODY_PATH]: resolveThemeFontFamilyFromKey(bodyKey),
    [THEME_TYPOGRAPHY_FONT_FAMILY_SUBHEADING_PATH]: resolveThemeFontFamilyFromKey(subheadingKey),
    [THEME_TYPOGRAPHY_FONT_FAMILY_PATH]: resolveThemeFontFamilyFromKey(headingKey),
    [THEME_TYPOGRAPHY_FONT_FAMILY_ACCENT_PATH]: resolveThemeFontFamilyFromKey(accentKey),
  };
}

function readTypographySettings(config: Record<string, unknown> | null | undefined): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const typography = settings?.typography;
  return typography && typeof typography === 'object' ? (typography as Record<string, unknown>) : {};
}

function inferFontKeyFromFamily(family: unknown, fallback: string): string {
  if (typeof family !== 'string' || !family.trim()) return fallback;
  const match = THEME_TYPOGRAPHY_FONT_OPTIONS.find((font) => family.includes(font.label));
  if (match) return match.value;
  if (family.includes('Playfair')) return 'playfair-display';
  if (family.includes('system-ui')) return 'system-ui';
  return fallback;
}

export function readThemeTextPresets(
  config: Record<string, unknown> | null | undefined
): Record<ThemeTextPresetId, ThemeTextPreset> {
  const typography = readTypographySettings(config);
  const presets = typography.presets as Record<string, Partial<ThemeTextPreset>> | undefined;
  const out = { ...THEME_DEFAULT_TEXT_PRESETS };

  for (const id of Object.keys(THEME_DEFAULT_TEXT_PRESETS) as ThemeTextPresetId[]) {
    const raw = presets?.[id];
    if (!raw || typeof raw !== 'object') continue;
    out[id] = {
      font: (raw.font as ThemeTextPreset['font']) ?? out[id].font,
      size: typeof raw.size === 'number' && raw.size > 0 ? raw.size : out[id].size,
      lineHeight: (raw.lineHeight as ThemeLineHeightKey) ?? out[id].lineHeight,
      letterSpacing: (raw.letterSpacing as ThemeLetterSpacingKey) ?? out[id].letterSpacing,
      textCase: (raw.textCase as ThemeTextCaseKey) ?? out[id].textCase,
    };
  }

  return out;
}

export function resolveThemeTypographyFonts(
  config: Record<string, unknown> | null | undefined
): ThemeTypographyFonts {
  const typography = readTypographySettings(config);
  const bodyKey = normalizeThemeTypographyFont(
    typography.fontBodyKey ?? inferFontKeyFromFamily(typography.fontFamilyBody, THEME_DEFAULT_FONT_KEYS.body),
    THEME_DEFAULT_FONT_KEYS.body
  );
  const subheadingKey = normalizeThemeTypographyFont(
    typography.fontSubheadingKey ?? bodyKey,
    THEME_DEFAULT_FONT_KEYS.subheading
  );
  const headingKey = normalizeThemeTypographyFont(
    typography.fontHeadingKey ?? inferFontKeyFromFamily(typography.fontFamily, THEME_DEFAULT_FONT_KEYS.heading),
    THEME_DEFAULT_FONT_KEYS.heading
  );
  const accentKey = normalizeThemeTypographyFont(
    typography.fontAccentKey ?? bodyKey,
    THEME_DEFAULT_FONT_KEYS.accent
  );

  const googleFonts = [
    resolveThemeGoogleFontFromKey(bodyKey),
    resolveThemeGoogleFontFromKey(subheadingKey),
    resolveThemeGoogleFontFromKey(headingKey),
    resolveThemeGoogleFontFromKey(accentKey),
  ].filter((font): font is string => Boolean(font));

  return {
    fontBody: resolveThemeFontFamilyFromKey(bodyKey),
    fontSubheading: resolveThemeFontFamilyFromKey(subheadingKey),
    fontHeading: resolveThemeFontFamilyFromKey(headingKey),
    fontAccent: resolveThemeFontFamilyFromKey(accentKey),
    googleFonts: [...new Set(googleFonts)],
  };
}

export function parseThemeTypographyTextColorSetting(
  raw: unknown
): { kind: 'palette'; index: number } | { kind: 'custom'; hex: string } {
  if (typeof raw !== 'string' || !raw.trim()) return { kind: 'palette', index: 1 };
  if (raw === 'palette') return { kind: 'palette', index: 1 };
  const match = /^palette:(\d+)$/.exec(raw.trim());
  if (match) {
    const index = Number(match[1]);
    return { kind: 'palette', index: Number.isFinite(index) ? index : 1 };
  }
  return { kind: 'custom', hex: normalizeHexColor(raw, '#111827') };
}

export function themeTypographyTextColorPaletteValue(index: number): string {
  return `palette:${index}`;
}

export function isThemeTypographyPaletteColor(raw: unknown): boolean {
  return parseThemeTypographyTextColorSetting(raw).kind === 'palette';
}

export function resolveThemeTypographyTextColor(
  config: Record<string, unknown> | null | undefined
): string {
  const typography = readTypographySettings(config);
  const parsed = parseThemeTypographyTextColorSetting(typography.textColor);
  if (parsed.kind === 'custom') return parsed.hex;

  const palette = readThemeColorPalette(config);
  return getThemePaletteColor(palette, parsed.index, '#111827');
}

export function seedThemeTypographyValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const typography = readTypographySettings(config);
  const fontFields = syncThemeTypographyFontFields({
    body: typography.fontBodyKey ?? typography.fontFamilyBody,
    subheading: typography.fontSubheadingKey ?? typography.fontFamilySubheading,
    heading: typography.fontHeadingKey ?? typography.fontFamily,
    accent: typography.fontAccentKey ?? typography.fontFamilyAccent,
  });

  const presetFields: Record<string, string> = {};
  const presets = readThemeTextPresets(config);
  for (const [id, preset] of Object.entries(presets) as [ThemeTextPresetId, ThemeTextPreset][]) {
    presetFields[themePresetPath(id, 'font')] = preset.font;
    presetFields[themePresetPath(id, 'size')] = String(preset.size);
    presetFields[themePresetPath(id, 'lineHeight')] = preset.lineHeight;
    presetFields[themePresetPath(id, 'letterSpacing')] = preset.letterSpacing;
    presetFields[themePresetPath(id, 'textCase')] = preset.textCase;
  }

  const textColor =
    typeof typography.textColor === 'string' && typography.textColor.trim()
      ? typography.textColor
      : 'palette';

  const weightFields: Record<string, string> = {
    [THEME_TYPOGRAPHY_FONT_BODY_WEIGHT_PATH]: normalizeThemeFontWeight(typography.fontBodyWeight),
    [THEME_TYPOGRAPHY_FONT_SUBHEADING_WEIGHT_PATH]: normalizeThemeFontWeight(
      typography.fontSubheadingWeight
    ),
    [THEME_TYPOGRAPHY_FONT_HEADING_WEIGHT_PATH]: normalizeThemeFontWeight(
      typography.fontHeadingWeight
    ),
    [THEME_TYPOGRAPHY_FONT_ACCENT_WEIGHT_PATH]: normalizeThemeFontWeight(typography.fontAccentWeight),
  };

  return {
    ...values,
    ...fontFields,
    ...presetFields,
    ...weightFields,
    [THEME_TYPOGRAPHY_TEXT_COLOR_PATH]: textColor,
  };
}

export function ensureThemeTypographyDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const typography = (settings.typography ?? {}) as Record<string, unknown>;
  if (!settings.typography || typeof settings.typography !== 'object') {
    settings.typography = typography;
  }

  if (!typography.textColor) typography.textColor = 'palette';

  const fontFields = syncThemeTypographyFontFields({
    body: typography.fontBodyKey ?? typography.fontFamilyBody ?? THEME_DEFAULT_FONT_KEYS.body,
    subheading:
      typography.fontSubheadingKey ?? typography.fontFamilySubheading ?? THEME_DEFAULT_FONT_KEYS.subheading,
    heading: typography.fontHeadingKey ?? typography.fontFamily ?? THEME_DEFAULT_FONT_KEYS.heading,
    accent: typography.fontAccentKey ?? typography.fontFamilyAccent ?? THEME_DEFAULT_FONT_KEYS.accent,
  });

  for (const [path, value] of Object.entries(fontFields)) {
    const key = path.replace('settings.typography.', '');
    if (typography[key] == null || typography[key] === '') {
      typography[key] = value;
    }
  }

  const presets = (typography.presets ?? {}) as Record<string, Record<string, unknown>>;
  typography.presets = presets;

  for (const [id, defaults] of Object.entries(THEME_DEFAULT_TEXT_PRESETS) as [
    ThemeTextPresetId,
    ThemeTextPreset,
  ][]) {
    const entry = (presets[id] ?? {}) as Record<string, unknown>;
    presets[id] = entry;
    if (entry.font == null) entry.font = defaults.font;
    if (entry.size == null) entry.size = defaults.size;
    if (entry.lineHeight == null) entry.lineHeight = defaults.lineHeight;
    if (entry.letterSpacing == null) entry.letterSpacing = defaults.letterSpacing;
    if (entry.textCase == null) entry.textCase = defaults.textCase;
  }

  if (typography.fontBodyWeight == null) typography.fontBodyWeight = 'regular';
  if (typography.fontSubheadingWeight == null) typography.fontSubheadingWeight = 'regular';
  if (typography.fontHeadingWeight == null) typography.fontHeadingWeight = 'regular';
  if (typography.fontAccentWeight == null) typography.fontAccentWeight = 'regular';

  settings.typography = typography;
  config.settings = settings;
}

function typographySchemaFields(): Array<{ path: string; type: string; label: string }> {
  const fields: Array<{ path: string; type: string; label: string }> = [
    { path: THEME_TYPOGRAPHY_TEXT_COLOR_PATH, type: 'text', label: 'Text color' },
    { path: THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH, type: 'text', label: 'Body font' },
    { path: THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH, type: 'text', label: 'Subheading font' },
    { path: THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH, type: 'text', label: 'Heading font' },
    { path: THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH, type: 'text', label: 'Accent font' },
    { path: THEME_TYPOGRAPHY_FONT_BODY_WEIGHT_PATH, type: 'text', label: 'Body font weight' },
    { path: THEME_TYPOGRAPHY_FONT_SUBHEADING_WEIGHT_PATH, type: 'text', label: 'Subheading font weight' },
    { path: THEME_TYPOGRAPHY_FONT_HEADING_WEIGHT_PATH, type: 'text', label: 'Heading font weight' },
    { path: THEME_TYPOGRAPHY_FONT_ACCENT_WEIGHT_PATH, type: 'text', label: 'Accent font weight' },
    { path: THEME_TYPOGRAPHY_FONT_FAMILY_PATH, type: 'text', label: 'Heading family' },
    { path: THEME_TYPOGRAPHY_FONT_FAMILY_BODY_PATH, type: 'text', label: 'Body family' },
    { path: THEME_TYPOGRAPHY_FONT_FAMILY_SUBHEADING_PATH, type: 'text', label: 'Subheading family' },
    { path: THEME_TYPOGRAPHY_FONT_FAMILY_ACCENT_PATH, type: 'text', label: 'Accent family' },
  ];

  for (const id of Object.keys(THEME_DEFAULT_TEXT_PRESETS) as ThemeTextPresetId[]) {
    for (const key of ['font', 'size', 'lineHeight', 'letterSpacing', 'textCase'] as const) {
      fields.push({
        path: themePresetPath(id, key),
        type: key === 'size' ? 'number' : 'text',
        label: `${id} ${key}`,
      });
    }
  }

  return fields;
}

export const THEME_TYPOGRAPHY_SCHEMA_GROUP = {
  id: 'typography',
  label: 'Typography',
  fields: typographySchemaFields(),
} as const;

export function withThemeTypographySchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'typography');
  const nextGroup = {
    id: THEME_TYPOGRAPHY_SCHEMA_GROUP.id,
    label: THEME_TYPOGRAPHY_SCHEMA_GROUP.label,
    fields: [...THEME_TYPOGRAPHY_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const colorsIndex = groups.findIndex((g) => g.id === 'colors');
    if (colorsIndex >= 0) {
      groups.splice(colorsIndex + 1, 0, nextGroup);
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
