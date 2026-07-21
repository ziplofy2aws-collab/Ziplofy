import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import {
  getThemePaletteColor,
  readThemeColorPalette,
  resolveThemePaletteColorSetting,
} from './theme-color-palette.settings';

export const THEME_PAGE_BACKGROUND_COLOR_PATH = 'settings.page.backgroundColor';
export const THEME_PAGE_WIDTH_PATH = 'settings.page.pageWidth';
export const THEME_PAGE_CONTENT_MAX_WIDTH_PATH = 'settings.spacing.contentMaxWidth';

export const THEME_PAGE_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow', maxWidth: 1000 },
  { value: 'normal', label: 'Normal', maxWidth: 1200 },
  { value: 'wide', label: 'Wide', maxWidth: 1600 },
] as const;

export type ThemePageWidth = (typeof THEME_PAGE_WIDTH_OPTIONS)[number]['value'];

export const THEME_DEFAULT_PAGE_WIDTH: ThemePageWidth = 'narrow';

export function normalizeThemePageWidth(value: unknown): ThemePageWidth {
  if (typeof value === 'string') {
    const match = THEME_PAGE_WIDTH_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_PAGE_WIDTH_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_PAGE_WIDTH;
}

export function resolveThemePageMaxWidth(
  config: Record<string, unknown> | null | undefined
): number {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const page = settings?.page as Record<string, unknown> | undefined;
  const spacing = settings?.spacing as Record<string, unknown> | undefined;

  const widthKey = normalizeThemePageWidth(page?.pageWidth);
  const fromOption = THEME_PAGE_WIDTH_OPTIONS.find((opt) => opt.value === widthKey)?.maxWidth;
  if (fromOption) return fromOption;

  const raw = spacing?.contentMaxWidth;
  const parsed = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1200;
}

export function resolveThemePageBackgroundColor(
  config: Record<string, unknown> | null | undefined
): string {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const page = settings?.page as Record<string, unknown> | undefined;
  const colors = settings?.colors as Record<string, unknown> | undefined;

  const resolved = resolveThemePaletteColorSetting(
    config,
    page?.backgroundColor,
    0,
    '#ffffff'
  );

  if (page?.backgroundColor == null || page?.backgroundColor === '' || page?.backgroundColor === 'palette') {
    if (typeof colors?.background === 'string' && colors.background.trim()) {
      return colors.background;
    }
  }

  return resolved;
}

export function syncThemePageFieldValues(pageWidth: ThemePageWidth): Record<string, string | number> {
  const option = THEME_PAGE_WIDTH_OPTIONS.find((opt) => opt.value === pageWidth);
  return {
    [THEME_PAGE_WIDTH_PATH]: pageWidth,
    [THEME_PAGE_CONTENT_MAX_WIDTH_PATH]: option?.maxWidth ?? 1200,
  };
}

export function seedThemePageValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const settings = config.settings as Record<string, unknown> | undefined;
  const page = (settings?.page ?? {}) as Record<string, unknown>;
  const pageWidth = normalizeThemePageWidth(page.pageWidth);
  const widthFields = syncThemePageFieldValues(pageWidth);

  const backgroundColor =
    typeof page.backgroundColor === 'string' && page.backgroundColor.trim()
      ? page.backgroundColor
      : 'palette';

  return {
    ...values,
    ...Object.fromEntries(
      Object.entries(widthFields).map(([path, value]) => [path, String(value)])
    ),
    [THEME_PAGE_BACKGROUND_COLOR_PATH]: backgroundColor,
  };
}

export function ensureThemePageDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const page = (settings.page ?? {}) as Record<string, unknown>;
  const spacing = (settings.spacing ?? {}) as Record<string, unknown>;

  if (!settings.page || typeof settings.page !== 'object') {
    settings.page = page;
  }
  if (!settings.spacing || typeof settings.spacing !== 'object') {
    settings.spacing = spacing;
  }

  if (!page.backgroundColor) page.backgroundColor = 'palette';
  const pageWidth = normalizeThemePageWidth(page.pageWidth ?? THEME_DEFAULT_PAGE_WIDTH);
  page.pageWidth = pageWidth;
  spacing.contentMaxWidth = resolveThemePageMaxWidth(config);

  settings.page = page;
  settings.spacing = spacing;
  config.settings = settings;
}

export const THEME_PAGE_SCHEMA_GROUP = {
  id: 'page-layout',
  label: 'Page',
  fields: [
    { path: THEME_PAGE_BACKGROUND_COLOR_PATH, type: 'text', label: 'Background' },
    { path: THEME_PAGE_WIDTH_PATH, type: 'text', label: 'Page width' },
    { path: THEME_PAGE_CONTENT_MAX_WIDTH_PATH, type: 'number', label: 'Content max width' },
  ],
} as const;

export function withThemePageSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'page-layout');
  const nextGroup = {
    id: THEME_PAGE_SCHEMA_GROUP.id,
    label: THEME_PAGE_SCHEMA_GROUP.label,
    fields: [...THEME_PAGE_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const typographyIndex = groups.findIndex((g) => g.id === 'typography');
    if (typographyIndex >= 0) {
      groups.splice(typographyIndex + 1, 0, nextGroup);
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