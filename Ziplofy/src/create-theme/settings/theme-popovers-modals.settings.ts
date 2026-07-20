import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import { readBoolSetting } from './theme-animations.settings';
import {
  resolveThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';

export const THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH =
  'settings.popoversModals.backgroundColor';
export const THEME_POPOVERS_MODALS_TEXT_COLOR_PATH = 'settings.popoversModals.textColor';
export const THEME_POPOVERS_MODALS_CORNER_RADIUS_PATH = 'settings.popoversModals.cornerRadius';
export const THEME_POPOVERS_MODALS_BORDER_COLOR_PATH = 'settings.popoversModals.borderColor';
export const THEME_POPOVERS_MODALS_BORDER_THICKNESS_PATH =
  'settings.popoversModals.borderThickness';
export const THEME_POPOVERS_MODALS_DROP_SHADOW_PATH = 'settings.popoversModals.dropShadow';
export const THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH = 'settings.popoversModals.shadowColor';

export const THEME_POPOVERS_MODALS_CORNER_RADIUS_MIN = 0;
export const THEME_POPOVERS_MODALS_CORNER_RADIUS_MAX = 100;
export const THEME_POPOVERS_MODALS_BORDER_THICKNESS_MIN = 0;
export const THEME_POPOVERS_MODALS_BORDER_THICKNESS_MAX = 20;

export const THEME_DEFAULT_POPOVERS_MODALS = {
  backgroundColor: 'palette',
  textColor: themePaletteColorValue(1),
  cornerRadius: 14,
  borderColor: themePaletteColorValue(1),
  borderThickness: 1,
  dropShadow: true,
  shadowColor: themePaletteColorValue(1),
};

export type ThemePopoversModalsSettings = {
  backgroundColor: string;
  textColor: string;
  cornerRadius: number;
  borderColor: string;
  borderThickness: number;
  dropShadow: boolean;
  shadowColor: string;
};

function readPopoversModalsSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const popoversModals = settings?.popoversModals;
  return popoversModals && typeof popoversModals === 'object'
    ? (popoversModals as Record<string, unknown>)
    : {};
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function readThemePopoversModalsSettings(
  config: Record<string, unknown> | null | undefined
): ThemePopoversModalsSettings {
  const popoversModals = readPopoversModalsSettings(config);

  return {
    backgroundColor:
      typeof popoversModals.backgroundColor === 'string' && popoversModals.backgroundColor.trim()
        ? popoversModals.backgroundColor
        : THEME_DEFAULT_POPOVERS_MODALS.backgroundColor,
    textColor:
      typeof popoversModals.textColor === 'string' && popoversModals.textColor.trim()
        ? popoversModals.textColor
        : THEME_DEFAULT_POPOVERS_MODALS.textColor,
    cornerRadius: clampNumber(
      popoversModals.cornerRadius,
      THEME_POPOVERS_MODALS_CORNER_RADIUS_MIN,
      THEME_POPOVERS_MODALS_CORNER_RADIUS_MAX,
      THEME_DEFAULT_POPOVERS_MODALS.cornerRadius
    ),
    borderColor:
      typeof popoversModals.borderColor === 'string' && popoversModals.borderColor.trim()
        ? popoversModals.borderColor
        : THEME_DEFAULT_POPOVERS_MODALS.borderColor,
    borderThickness: clampNumber(
      popoversModals.borderThickness,
      THEME_POPOVERS_MODALS_BORDER_THICKNESS_MIN,
      THEME_POPOVERS_MODALS_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_POPOVERS_MODALS.borderThickness
    ),
    dropShadow: readBoolSetting(
      popoversModals.dropShadow,
      THEME_DEFAULT_POPOVERS_MODALS.dropShadow
    ),
    shadowColor:
      typeof popoversModals.shadowColor === 'string' && popoversModals.shadowColor.trim()
        ? popoversModals.shadowColor
        : THEME_DEFAULT_POPOVERS_MODALS.shadowColor,
  };
}

export function resolveThemePopoversModalsColors(
  config: Record<string, unknown> | null | undefined
): ThemePopoversModalsSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
  borderColorResolved: string;
  shadowColorResolved: string;
} {
  const popoversModals = readThemePopoversModalsSettings(config);
  return {
    ...popoversModals,
    backgroundColorResolved: resolveThemePaletteColorSetting(
      config,
      popoversModals.backgroundColor,
      0,
      '#ffffff'
    ),
    textColorResolved: resolveThemePaletteColorSetting(
      config,
      popoversModals.textColor,
      1,
      '#111827'
    ),
    borderColorResolved: resolveThemePaletteColorSetting(
      config,
      popoversModals.borderColor,
      1,
      '#111827'
    ),
    shadowColorResolved: resolveThemePaletteColorSetting(
      config,
      popoversModals.shadowColor,
      1,
      '#111827'
    ),
  };
}

export function readThemePopoversModalsSettingsFromValues(
  values: Record<string, string | boolean>
): ThemePopoversModalsSettings {
  return {
    backgroundColor:
      typeof values[THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH] === 'string' &&
      String(values[THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH]).trim()
        ? String(values[THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH])
        : THEME_DEFAULT_POPOVERS_MODALS.backgroundColor,
    textColor:
      typeof values[THEME_POPOVERS_MODALS_TEXT_COLOR_PATH] === 'string' &&
      String(values[THEME_POPOVERS_MODALS_TEXT_COLOR_PATH]).trim()
        ? String(values[THEME_POPOVERS_MODALS_TEXT_COLOR_PATH])
        : THEME_DEFAULT_POPOVERS_MODALS.textColor,
    cornerRadius: clampNumber(
      values[THEME_POPOVERS_MODALS_CORNER_RADIUS_PATH],
      THEME_POPOVERS_MODALS_CORNER_RADIUS_MIN,
      THEME_POPOVERS_MODALS_CORNER_RADIUS_MAX,
      THEME_DEFAULT_POPOVERS_MODALS.cornerRadius
    ),
    borderColor:
      typeof values[THEME_POPOVERS_MODALS_BORDER_COLOR_PATH] === 'string' &&
      String(values[THEME_POPOVERS_MODALS_BORDER_COLOR_PATH]).trim()
        ? String(values[THEME_POPOVERS_MODALS_BORDER_COLOR_PATH])
        : THEME_DEFAULT_POPOVERS_MODALS.borderColor,
    borderThickness: clampNumber(
      values[THEME_POPOVERS_MODALS_BORDER_THICKNESS_PATH],
      THEME_POPOVERS_MODALS_BORDER_THICKNESS_MIN,
      THEME_POPOVERS_MODALS_BORDER_THICKNESS_MAX,
      THEME_DEFAULT_POPOVERS_MODALS.borderThickness
    ),
    dropShadow: readBoolSetting(
      values[THEME_POPOVERS_MODALS_DROP_SHADOW_PATH],
      THEME_DEFAULT_POPOVERS_MODALS.dropShadow
    ),
    shadowColor:
      typeof values[THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH] === 'string' &&
      String(values[THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH]).trim()
        ? String(values[THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH])
        : THEME_DEFAULT_POPOVERS_MODALS.shadowColor,
  };
}

export function seedThemePopoversModalsValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const popoversModals = readThemePopoversModalsSettings(config);
  return {
    ...values,
    [THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH]: popoversModals.backgroundColor,
    [THEME_POPOVERS_MODALS_TEXT_COLOR_PATH]: popoversModals.textColor,
    [THEME_POPOVERS_MODALS_CORNER_RADIUS_PATH]: String(popoversModals.cornerRadius),
    [THEME_POPOVERS_MODALS_BORDER_COLOR_PATH]: popoversModals.borderColor,
    [THEME_POPOVERS_MODALS_BORDER_THICKNESS_PATH]: String(popoversModals.borderThickness),
    [THEME_POPOVERS_MODALS_DROP_SHADOW_PATH]: popoversModals.dropShadow,
    [THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH]: popoversModals.shadowColor,
  };
}

export function ensureThemePopoversModalsDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const popoversModals = (settings.popoversModals ?? {}) as Record<string, unknown>;

  if (!settings.popoversModals || typeof settings.popoversModals !== 'object') {
    settings.popoversModals = popoversModals;
  }

  const resolved = readThemePopoversModalsSettings({
    ...config,
    settings: { ...settings, popoversModals },
  });

  popoversModals.backgroundColor = resolved.backgroundColor;
  popoversModals.textColor = resolved.textColor;
  popoversModals.cornerRadius = resolved.cornerRadius;
  popoversModals.borderColor = resolved.borderColor;
  popoversModals.borderThickness = resolved.borderThickness;
  popoversModals.dropShadow = resolved.dropShadow;
  popoversModals.shadowColor = resolved.shadowColor;

  settings.popoversModals = popoversModals;
  config.settings = settings;
}

export const THEME_POPOVERS_MODALS_SCHEMA_GROUP = {
  id: 'popovers-modals',
  label: 'Popovers and modals',
  fields: [
    { path: THEME_POPOVERS_MODALS_BACKGROUND_COLOR_PATH, type: 'text', label: 'Background color' },
    { path: THEME_POPOVERS_MODALS_TEXT_COLOR_PATH, type: 'text', label: 'Text color' },
    { path: THEME_POPOVERS_MODALS_CORNER_RADIUS_PATH, type: 'number', label: 'Corner radius' },
    { path: THEME_POPOVERS_MODALS_BORDER_COLOR_PATH, type: 'text', label: 'Border color' },
    { path: THEME_POPOVERS_MODALS_BORDER_THICKNESS_PATH, type: 'number', label: 'Border thickness' },
    { path: THEME_POPOVERS_MODALS_DROP_SHADOW_PATH, type: 'boolean', label: 'Drop shadow' },
    { path: THEME_POPOVERS_MODALS_SHADOW_COLOR_PATH, type: 'text', label: 'Shadow' },
  ],
} as const;

export function withThemePopoversModalsSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'popovers-modals');
  const nextGroup = {
    id: THEME_POPOVERS_MODALS_SCHEMA_GROUP.id,
    label: THEME_POPOVERS_MODALS_SCHEMA_GROUP.label,
    fields: [...THEME_POPOVERS_MODALS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const inputFieldsIndex = groups.findIndex((g) => g.id === 'input-fields');
    if (inputFieldsIndex >= 0) {
      groups.splice(inputFieldsIndex + 1, 0, nextGroup);
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
