import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';

export const THEME_LOGO_DESKTOP_HEIGHT_DEFAULT = 36;
export const THEME_LOGO_MOBILE_HEIGHT_DEFAULT = 28;
export const THEME_LOGO_HEIGHT_MIN = 12;
export const THEME_LOGO_HEIGHT_MAX = 120;

export const THEME_LOGO_DEFAULT_PATH = 'settings.logo.defaultUrl';
export const THEME_LOGO_INVERSE_PATH = 'settings.logo.inverseUrl';
export const THEME_LOGO_FAVICON_PATH = 'settings.logo.faviconUrl';
export const THEME_LOGO_DESKTOP_HEIGHT_PATH = 'settings.logo.desktopHeight';
export const THEME_LOGO_MOBILE_HEIGHT_PATH = 'settings.logo.mobileHeight';

export const THEME_LOGO_FAVICON_SCHEMA_GROUP = {
  id: 'logo-favicon',
  label: 'Logo and favicon',
  fields: [
    { path: THEME_LOGO_DEFAULT_PATH, type: 'text', label: 'Default logo' },
    { path: THEME_LOGO_INVERSE_PATH, type: 'text', label: 'Inverse logo' },
    { path: THEME_LOGO_DESKTOP_HEIGHT_PATH, type: 'number', label: 'Desktop height' },
    { path: THEME_LOGO_MOBILE_HEIGHT_PATH, type: 'number', label: 'Mobile height' },
    { path: THEME_LOGO_FAVICON_PATH, type: 'text', label: 'Favicon' },
  ],
} as const;

export function withThemeLogoFaviconSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'logo-favicon');
  const nextGroup = {
    id: THEME_LOGO_FAVICON_SCHEMA_GROUP.id,
    label: THEME_LOGO_FAVICON_SCHEMA_GROUP.label,
    fields: [...THEME_LOGO_FAVICON_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    groups.unshift(nextGroup);
  }

  return {
    ...schema,
    globalSettings: {
      label: schema.globalSettings?.label ?? 'Theme settings',
      groups,
    },
  };
}

export function ensureThemeLogoFaviconDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const logo = (settings.logo ?? {}) as Record<string, unknown>;
  if (!settings.logo || typeof settings.logo !== 'object') {
    settings.logo = logo;
  }
  if (logo.defaultUrl == null) logo.defaultUrl = '';
  if (logo.inverseUrl == null) logo.inverseUrl = '';
  if (logo.faviconUrl == null) logo.faviconUrl = '';
  if (logo.desktopHeight == null) logo.desktopHeight = THEME_LOGO_DESKTOP_HEIGHT_DEFAULT;
  if (logo.mobileHeight == null) logo.mobileHeight = THEME_LOGO_MOBILE_HEIGHT_DEFAULT;
  config.settings = settings;
}
