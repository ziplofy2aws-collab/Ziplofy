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

/** Force logo/favicon form values into config (survives schema gaps on catalog packs). */
export function applyThemeLogoFaviconValuesToConfig(
  config: Record<string, unknown>,
  values: Record<string, string | boolean>
): void {
  ensureThemeLogoFaviconDefaults(config);
  const settings = config.settings as Record<string, unknown>;
  const logo = settings.logo as Record<string, unknown>;

  if (THEME_LOGO_DEFAULT_PATH in values) {
    logo.defaultUrl = String(values[THEME_LOGO_DEFAULT_PATH] ?? '');
  }
  if (THEME_LOGO_INVERSE_PATH in values) {
    logo.inverseUrl = String(values[THEME_LOGO_INVERSE_PATH] ?? '');
  }
  if (THEME_LOGO_FAVICON_PATH in values) {
    logo.faviconUrl = String(values[THEME_LOGO_FAVICON_PATH] ?? '');
  }
  if (THEME_LOGO_DESKTOP_HEIGHT_PATH in values) {
    const n = Number(values[THEME_LOGO_DESKTOP_HEIGHT_PATH]);
    logo.desktopHeight = Number.isFinite(n) ? n : THEME_LOGO_DESKTOP_HEIGHT_DEFAULT;
  }
  if (THEME_LOGO_MOBILE_HEIGHT_PATH in values) {
    const n = Number(values[THEME_LOGO_MOBILE_HEIGHT_PATH]);
    logo.mobileHeight = Number.isFinite(n) ? n : THEME_LOGO_MOBILE_HEIGHT_DEFAULT;
  }

  // Keep header logo fields aligned with the global default for theme Header runtime.
  const defaultUrl = String(logo.defaultUrl ?? '');
  if (THEME_LOGO_DEFAULT_PATH in values) {
    const sections = (config.sections ?? {}) as Record<string, unknown>;
    const header = (sections.header ?? null) as Record<string, unknown> | null;
    if (header && typeof header === 'object') {
      const headerSettings = ((header.settings ?? {}) as Record<string, unknown>) || {};
      headerSettings.defaultLogoUrl = defaultUrl;
      header.settings = headerSettings;
      const blocks = ((header.blocks ?? {}) as Record<string, unknown>) || {};
      const logoBlock = (blocks.logo ?? null) as Record<string, unknown> | null;
      if (logoBlock && typeof logoBlock === 'object') {
        const blockSettings = ((logoBlock.settings ?? {}) as Record<string, unknown>) || {};
        blockSettings.imageUrl = defaultUrl;
        logoBlock.settings = blockSettings;
        blocks.logo = logoBlock;
      }
      header.blocks = blocks;
      sections.header = header;
      config.sections = sections;
    }
  }
}

export function seedThemeLogoFaviconValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  ensureThemeLogoFaviconDefaults(config);
  const logo = ((config.settings as Record<string, unknown>).logo ?? {}) as Record<string, unknown>;
  return {
    ...values,
    [THEME_LOGO_DEFAULT_PATH]: String(logo.defaultUrl ?? ''),
    [THEME_LOGO_INVERSE_PATH]: String(logo.inverseUrl ?? ''),
    [THEME_LOGO_FAVICON_PATH]: String(logo.faviconUrl ?? ''),
    [THEME_LOGO_DESKTOP_HEIGHT_PATH]: String(
      logo.desktopHeight ?? THEME_LOGO_DESKTOP_HEIGHT_DEFAULT
    ),
    [THEME_LOGO_MOBILE_HEIGHT_PATH]: String(logo.mobileHeight ?? THEME_LOGO_MOBILE_HEIGHT_DEFAULT),
  };
}
