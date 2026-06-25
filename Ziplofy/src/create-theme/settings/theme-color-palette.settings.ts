import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import { isColorDark, normalizeHexColor } from '../checkout/settings/checkout-color.utils';

export const THEME_COLOR_PALETTE_PATH = 'settings.colors.palette';

export const THEME_DEFAULT_COLOR_PALETTE = ['#ffffff', '#111827'] as const;

export const THEME_COLOR_FIELD_PATHS = {
  primary: 'settings.colors.primary',
  accent: 'settings.colors.accent',
  background: 'settings.colors.background',
  surface: 'settings.colors.surface',
  text: 'settings.colors.text',
  muted: 'settings.colors.muted',
  border: 'settings.colors.border',
} as const;

const MAX_PALETTE_SWATCHES = 12;

export function getThemePaletteColor(palette: string[], index: number, fallback: string): string {
  const color = palette[index]?.trim();
  return color ? normalizeHexColor(color, fallback) : fallback;
}

function deriveMuted(hex: string): string {
  const normalized = normalizeHexColor(hex, '#6b7280');
  if (isColorDark(normalized)) return '#9ca3af';
  return '#6b7280';
}

function deriveBorder(background: string): string {
  return isColorDark(background) ? 'rgba(255,255,255,0.14)' : '#e5e7eb';
}

/** Map palette swatches to theme color tokens used across sections. */
export function syncThemePaletteToFieldValues(palette: string[]): Record<string, string> {
  const background = getThemePaletteColor(palette, 0, '#ffffff');
  const text = getThemePaletteColor(palette, 1, '#111827');
  const accent = getThemePaletteColor(palette, 2, text);
  const muted = deriveMuted(text);
  const border = deriveBorder(background);

  const out: Record<string, string> = {
    [THEME_COLOR_FIELD_PATHS.primary]: text,
    [THEME_COLOR_FIELD_PATHS.accent]: accent,
    [THEME_COLOR_FIELD_PATHS.background]: background,
    [THEME_COLOR_FIELD_PATHS.surface]: background,
    [THEME_COLOR_FIELD_PATHS.text]: text,
    [THEME_COLOR_FIELD_PATHS.muted]: muted,
    [THEME_COLOR_FIELD_PATHS.border]: border,
  };

  palette.forEach((color, index) => {
    out[`${THEME_COLOR_PALETTE_PATH}.${index}`] = normalizeHexColor(
      color,
      THEME_DEFAULT_COLOR_PALETTE[index] ?? '#000000'
    );
  });

  return out;
}

export function readThemeColorPalette(config: Record<string, unknown> | null | undefined): string[] {
  if (!config || typeof config !== 'object') {
    return [...THEME_DEFAULT_COLOR_PALETTE];
  }

  const settings = config.settings as Record<string, unknown> | undefined;
  const colors = settings?.colors as Record<string, unknown> | undefined;
  const palette = colors?.palette;

  if (Array.isArray(palette) && palette.length >= 2) {
    return palette
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry, index) =>
        normalizeHexColor(entry, THEME_DEFAULT_COLOR_PALETTE[index] ?? '#000000')
      );
  }

  const background = normalizeHexColor(String(colors?.background ?? ''), '#ffffff');
  const primary = normalizeHexColor(String(colors?.primary ?? colors?.text ?? ''), '#111827');
  return [background, primary];
}

export function seedThemePaletteValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const palette = readThemeColorPalette(config);
  return { ...values, ...syncThemePaletteToFieldValues(palette) };
}

export function ensureThemeColorPaletteDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const colors = (settings.colors ?? {}) as Record<string, unknown>;
  if (!settings.colors || typeof settings.colors !== 'object') {
    settings.colors = colors;
  }

  const palette = readThemeColorPalette(config);
  colors.palette = palette;

  const fieldValues = syncThemePaletteToFieldValues(palette);
  for (const [path, value] of Object.entries(fieldValues)) {
    if (!path.startsWith('settings.colors.palette.')) {
      const key = path.replace('settings.colors.', '');
      if (colors[key] == null || colors[key] === '') {
        colors[key] = value;
      }
    }
  }

  settings.colors = colors;
  config.settings = settings;
}

export const THEME_COLOR_PALETTE_SCHEMA_GROUP = {
  id: 'colors',
  label: 'Color palette',
  fields: [
    ...Object.entries(THEME_COLOR_FIELD_PATHS).map(([key, path]) => ({
      path,
      type: key === 'border' ? 'text' : 'color',
      label: key,
    })),
    ...Array.from({ length: MAX_PALETTE_SWATCHES }, (_, index) => ({
      path: `${THEME_COLOR_PALETTE_PATH}.${index}`,
      type: 'text',
      label: `Palette ${index + 1}`,
    })),
  ],
} as const;

export function withThemeColorPaletteSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'colors');
  const nextGroup = {
    id: THEME_COLOR_PALETTE_SCHEMA_GROUP.id,
    label: THEME_COLOR_PALETTE_SCHEMA_GROUP.label,
    fields: [...THEME_COLOR_PALETTE_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    groups.splice(1, 0, nextGroup);
  }

  return {
    ...schema,
    globalSettings: {
      label: schema.globalSettings?.label ?? 'Theme settings',
      groups,
    },
  };
}

export type ThemeSchemeColors = {
  background: string;
  color: string;
  border: string;
  muted?: string;
};

/** Build scheme-1..N from palette for section color scheme pickers. */
export function resolveThemePaletteSchemes(
  config: Record<string, unknown> | null | undefined
): Record<string, ThemeSchemeColors> {
  const palette = readThemeColorPalette(config);
  const accent = getThemePaletteColor(palette, 2, getThemePaletteColor(palette, 1, '#111827'));
  const schemes: Record<string, ThemeSchemeColors> = {};

  palette.forEach((bg, index) => {
    const background = normalizeHexColor(bg, '#ffffff');
    const dark = isColorDark(background);
    schemes[`scheme-${index + 1}`] = {
      background,
      color: dark ? '#ffffff' : getThemePaletteColor(palette, 1, '#111827'),
      border: deriveBorder(background),
      muted: deriveMuted(dark ? '#ffffff' : '#111827'),
    };
  });

  const fallback = schemes['scheme-1'] ?? {
    background: '#ffffff',
    color: '#111827',
    border: '#e5e7eb',
  };

  for (let i = palette.length + 1; i <= 4; i += 1) {
    const key = `scheme-${i}`;
    if (!schemes[key]) {
      schemes[key] = i >= 3 ? (schemes['scheme-2'] ?? schemes['scheme-1'] ?? fallback) : fallback;
    }
  }

  if (!schemes['scheme-1']) schemes['scheme-1'] = { ...fallback };
  if (!schemes['scheme-2']) {
    schemes['scheme-2'] = {
      background: getThemePaletteColor(palette, 1, '#111827'),
      color: '#ffffff',
      border: 'rgba(255,255,255,0.14)',
      muted: '#d1d5db',
    };
  }

  schemes['scheme-accent'] = {
    background: accent,
    color: isColorDark(accent) ? '#ffffff' : '#111827',
    border: deriveBorder(accent),
  };

  return schemes;
}
