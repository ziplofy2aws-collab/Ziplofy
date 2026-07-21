import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import {
  resolveThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';
import {
  THEME_FONT_ROLE_OPTIONS,
  THEME_TEXT_CASE_OPTIONS,
  type ThemeFontRole,
} from './theme-typography.settings';

export const THEME_BADGES_POSITION_PATH = 'settings.badges.position';
export const THEME_BADGES_CORNER_RADIUS_PATH = 'settings.badges.cornerRadius';
export const THEME_BADGES_SALE_BACKGROUND_PATH = 'settings.badges.saleBackground';
export const THEME_BADGES_SALE_TEXT_PATH = 'settings.badges.saleText';
export const THEME_BADGES_SOLD_OUT_BACKGROUND_PATH = 'settings.badges.soldOutBackground';
export const THEME_BADGES_SOLD_OUT_TEXT_PATH = 'settings.badges.soldOutText';
export const THEME_BADGES_FONT_PATH = 'settings.badges.font';
export const THEME_BADGES_TEXT_CASE_PATH = 'settings.badges.textCase';

export const THEME_BADGE_CORNER_RADIUS_MIN = 0;
export const THEME_BADGE_CORNER_RADIUS_MAX = 100;
export const THEME_BADGE_CORNER_RADIUS_DEFAULT = 100;

export const THEME_BADGE_POSITION_OPTIONS = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
] as const;

export type ThemeBadgePosition = (typeof THEME_BADGE_POSITION_OPTIONS)[number]['value'];
export type ThemeBadgeTextCase = (typeof THEME_TEXT_CASE_OPTIONS)[number]['value'];

export const THEME_DEFAULT_BADGES = {
  position: 'top-right' as ThemeBadgePosition,
  cornerRadius: THEME_BADGE_CORNER_RADIUS_DEFAULT,
  saleBackground: 'palette',
  saleText: themePaletteColorValue(1),
  soldOutBackground: '#EEF1EA',
  soldOutText: themePaletteColorValue(1),
  font: 'body' as ThemeFontRole,
  textCase: 'default' as ThemeBadgeTextCase,
};

export type ThemeBadgesSettings = {
  position: ThemeBadgePosition;
  cornerRadius: number;
  saleBackground: string;
  saleText: string;
  soldOutBackground: string;
  soldOutText: string;
  font: ThemeFontRole;
  textCase: ThemeBadgeTextCase;
};

function readBadgesSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const badges = settings?.badges;
  return badges && typeof badges === 'object' ? (badges as Record<string, unknown>) : {};
}

export function normalizeThemeBadgePosition(value: unknown): ThemeBadgePosition {
  if (typeof value === 'string') {
    const match = THEME_BADGE_POSITION_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_BADGE_POSITION_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_BADGES.position;
}

export function normalizeThemeBadgeTextCase(value: unknown): ThemeBadgeTextCase {
  if (typeof value === 'string') {
    const match = THEME_TEXT_CASE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_TEXT_CASE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_BADGES.textCase;
}

export function normalizeThemeBadgeFontRole(value: unknown): ThemeFontRole {
  if (typeof value === 'string') {
    const match = THEME_FONT_ROLE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value as ThemeFontRole;
    const byLabel = THEME_FONT_ROLE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value as ThemeFontRole;
  }
  return THEME_DEFAULT_BADGES.font;
}

export function normalizeThemeBadgeCornerRadius(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return THEME_DEFAULT_BADGES.cornerRadius;
  return Math.min(
    THEME_BADGE_CORNER_RADIUS_MAX,
    Math.max(THEME_BADGE_CORNER_RADIUS_MIN, Math.round(parsed))
  );
}

export function readThemeBadgesSettings(
  config: Record<string, unknown> | null | undefined
): ThemeBadgesSettings {
  const badges = readBadgesSettings(config);
  return {
    position: normalizeThemeBadgePosition(badges.position),
    cornerRadius: normalizeThemeBadgeCornerRadius(badges.cornerRadius),
    saleBackground:
      typeof badges.saleBackground === 'string' && badges.saleBackground.trim()
        ? badges.saleBackground
        : THEME_DEFAULT_BADGES.saleBackground,
    saleText:
      typeof badges.saleText === 'string' && badges.saleText.trim()
        ? badges.saleText
        : THEME_DEFAULT_BADGES.saleText,
    soldOutBackground:
      typeof badges.soldOutBackground === 'string' && badges.soldOutBackground.trim()
        ? badges.soldOutBackground
        : THEME_DEFAULT_BADGES.soldOutBackground,
    soldOutText:
      typeof badges.soldOutText === 'string' && badges.soldOutText.trim()
        ? badges.soldOutText
        : THEME_DEFAULT_BADGES.soldOutText,
    font: normalizeThemeBadgeFontRole(badges.font),
    textCase: normalizeThemeBadgeTextCase(badges.textCase),
  };
}

export function resolveThemeBadgeColors(
  config: Record<string, unknown> | null | undefined
): Pick<ThemeBadgesSettings, 'saleBackground' | 'saleText' | 'soldOutBackground' | 'soldOutText'> & {
  saleBackgroundColor: string;
  saleTextColor: string;
  soldOutBackgroundColor: string;
  soldOutTextColor: string;
} {
  const badges = readThemeBadgesSettings(config);
  return {
    ...badges,
    saleBackgroundColor: resolveThemePaletteColorSetting(
      config,
      badges.saleBackground,
      0,
      '#ffffff'
    ),
    saleTextColor: resolveThemePaletteColorSetting(config, badges.saleText, 1, '#111827'),
    soldOutBackgroundColor: resolveThemePaletteColorSetting(
      config,
      badges.soldOutBackground,
      0,
      '#EEF1EA'
    ),
    soldOutTextColor: resolveThemePaletteColorSetting(config, badges.soldOutText, 1, '#111827'),
  };
}

export function seedThemeBadgesValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const badges = readThemeBadgesSettings(config);
  return {
    ...values,
    [THEME_BADGES_POSITION_PATH]: badges.position,
    [THEME_BADGES_CORNER_RADIUS_PATH]: String(badges.cornerRadius),
    [THEME_BADGES_SALE_BACKGROUND_PATH]: badges.saleBackground,
    [THEME_BADGES_SALE_TEXT_PATH]: badges.saleText,
    [THEME_BADGES_SOLD_OUT_BACKGROUND_PATH]: badges.soldOutBackground,
    [THEME_BADGES_SOLD_OUT_TEXT_PATH]: badges.soldOutText,
    [THEME_BADGES_FONT_PATH]: badges.font,
    [THEME_BADGES_TEXT_CASE_PATH]: badges.textCase,
  };
}

export function ensureThemeBadgesDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const badges = (settings.badges ?? {}) as Record<string, unknown>;

  if (!settings.badges || typeof settings.badges !== 'object') {
    settings.badges = badges;
  }

  if (badges.position == null) badges.position = THEME_DEFAULT_BADGES.position;
  if (badges.cornerRadius == null) badges.cornerRadius = THEME_DEFAULT_BADGES.cornerRadius;
  if (!badges.saleBackground) badges.saleBackground = THEME_DEFAULT_BADGES.saleBackground;
  if (!badges.saleText) badges.saleText = THEME_DEFAULT_BADGES.saleText;
  if (!badges.soldOutBackground) badges.soldOutBackground = THEME_DEFAULT_BADGES.soldOutBackground;
  if (!badges.soldOutText) badges.soldOutText = THEME_DEFAULT_BADGES.soldOutText;
  if (!badges.font) badges.font = THEME_DEFAULT_BADGES.font;
  if (!badges.textCase) badges.textCase = THEME_DEFAULT_BADGES.textCase;

  settings.badges = badges;
  config.settings = settings;
}

export const THEME_BADGES_SCHEMA_GROUP = {
  id: 'badges',
  label: 'Badges',
  fields: [
    { path: THEME_BADGES_POSITION_PATH, type: 'text', label: 'Position on cards' },
    { path: THEME_BADGES_CORNER_RADIUS_PATH, type: 'number', label: 'Corner radius' },
    { path: THEME_BADGES_SALE_BACKGROUND_PATH, type: 'text', label: 'Sale badge background' },
    { path: THEME_BADGES_SALE_TEXT_PATH, type: 'text', label: 'Sale badge text' },
    {
      path: THEME_BADGES_SOLD_OUT_BACKGROUND_PATH,
      type: 'text',
      label: 'Sold out badge background',
    },
    { path: THEME_BADGES_SOLD_OUT_TEXT_PATH, type: 'text', label: 'Sold out badge text' },
    { path: THEME_BADGES_FONT_PATH, type: 'text', label: 'Font' },
    { path: THEME_BADGES_TEXT_CASE_PATH, type: 'text', label: 'Case' },
  ],
} as const;

export function withThemeBadgesSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'badges');
  const nextGroup = {
    id: THEME_BADGES_SCHEMA_GROUP.id,
    label: THEME_BADGES_SCHEMA_GROUP.label,
    fields: [...THEME_BADGES_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const animationsIndex = groups.findIndex((g) => g.id === 'animations');
    if (animationsIndex >= 0) {
      groups.splice(animationsIndex + 1, 0, nextGroup);
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
