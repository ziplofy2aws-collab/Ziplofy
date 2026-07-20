import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import {
  resolveThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';

export const THEME_DRAWERS_BACKGROUND_COLOR_PATH = 'settings.drawers.backgroundColor';
export const THEME_DRAWERS_TEXT_COLOR_PATH = 'settings.drawers.textColor';
export const THEME_DRAWERS_BORDER_COLOR_PATH = 'settings.drawers.borderColor';

export const THEME_DEFAULT_DRAWERS = {
  backgroundColor: 'palette',
  textColor: themePaletteColorValue(1),
  borderColor: themePaletteColorValue(1),
};

export type ThemeDrawersSettings = {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
};

function readDrawersSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const drawers = settings?.drawers;
  return drawers && typeof drawers === 'object' ? (drawers as Record<string, unknown>) : {};
}

export function readThemeDrawersSettings(
  config: Record<string, unknown> | null | undefined
): ThemeDrawersSettings {
  const drawers = readDrawersSettings(config);
  return {
    backgroundColor:
      typeof drawers.backgroundColor === 'string' && drawers.backgroundColor.trim()
        ? drawers.backgroundColor
        : THEME_DEFAULT_DRAWERS.backgroundColor,
    textColor:
      typeof drawers.textColor === 'string' && drawers.textColor.trim()
        ? drawers.textColor
        : THEME_DEFAULT_DRAWERS.textColor,
    borderColor:
      typeof drawers.borderColor === 'string' && drawers.borderColor.trim()
        ? drawers.borderColor
        : THEME_DEFAULT_DRAWERS.borderColor,
  };
}

export function resolveThemeDrawerColors(
  config: Record<string, unknown> | null | undefined
): ThemeDrawersSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
  borderColorResolved: string;
} {
  const drawers = readThemeDrawersSettings(config);
  return {
    ...drawers,
    backgroundColorResolved: resolveThemePaletteColorSetting(
      config,
      drawers.backgroundColor,
      0,
      '#ffffff'
    ),
    textColorResolved: resolveThemePaletteColorSetting(config, drawers.textColor, 1, '#111827'),
    borderColorResolved: resolveThemePaletteColorSetting(config, drawers.borderColor, 1, '#111827'),
  };
}

export function seedThemeDrawersValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const drawers = readThemeDrawersSettings(config);
  return {
    ...values,
    [THEME_DRAWERS_BACKGROUND_COLOR_PATH]: drawers.backgroundColor,
    [THEME_DRAWERS_TEXT_COLOR_PATH]: drawers.textColor,
    [THEME_DRAWERS_BORDER_COLOR_PATH]: drawers.borderColor,
  };
}

export function ensureThemeDrawersDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const drawers = (settings.drawers ?? {}) as Record<string, unknown>;

  if (!settings.drawers || typeof settings.drawers !== 'object') {
    settings.drawers = drawers;
  }

  if (!drawers.backgroundColor) drawers.backgroundColor = THEME_DEFAULT_DRAWERS.backgroundColor;
  if (!drawers.textColor) drawers.textColor = THEME_DEFAULT_DRAWERS.textColor;
  if (!drawers.borderColor) drawers.borderColor = THEME_DEFAULT_DRAWERS.borderColor;

  settings.drawers = drawers;
  config.settings = settings;
}

export const THEME_DRAWERS_SCHEMA_GROUP = {
  id: 'drawers',
  label: 'Drawers',
  fields: [
    { path: THEME_DRAWERS_BACKGROUND_COLOR_PATH, type: 'text', label: 'Background color' },
    { path: THEME_DRAWERS_TEXT_COLOR_PATH, type: 'text', label: 'Text color' },
    { path: THEME_DRAWERS_BORDER_COLOR_PATH, type: 'text', label: 'Border color' },
  ],
} as const;

export function withThemeDrawersSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'drawers');
  const nextGroup = {
    id: THEME_DRAWERS_SCHEMA_GROUP.id,
    label: THEME_DRAWERS_SCHEMA_GROUP.label,
    fields: [...THEME_DRAWERS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const cartIndex = groups.findIndex((g) => g.id === 'cart');
    if (cartIndex >= 0) {
      groups.splice(cartIndex + 1, 0, nextGroup);
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
