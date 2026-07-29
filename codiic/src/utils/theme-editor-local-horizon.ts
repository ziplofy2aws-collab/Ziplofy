import type { ThemeEditorLoadResult } from './theme-editor-load';
import localHorizonDefaults from '../theme-packs/horizon/theme.default-config.json';

function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/** Local Horizon dist under render-store/codiic `public/remote-themes/horizon/`. */
export function isLocalHorizonRuntimeEnabled(): boolean {
  // Default ON in Vite dev so editor shows the rebuilt theme without S3 re-upload.
  const fallback = Boolean(import.meta.env.DEV);
  return envFlag(import.meta.env.VITE_THEME_EDITOR_LOCAL_HORIZON as string | undefined, fallback);
}

function isHorizonTheme(result: ThemeEditorLoadResult): boolean {
  const name = `${result.themeName ?? ''} ${result.themePath ?? ''}`.toLowerCase();
  if (name.includes('horizon')) return true;
  const themeId = String((result.defaultConfig as { themeId?: string } | null)?.themeId ?? '');
  return themeId.toLowerCase() === 'horizon';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Point preview at local Horizon `theme.js` / `theme.css` and refresh home defaults
 * so stale S3 + DB config cannot keep showing the old Welcome layout.
 */
export function applyLocalHorizonRuntime(result: ThemeEditorLoadResult): ThemeEditorLoadResult {
  if (!isLocalHorizonRuntimeEnabled() || !isHorizonTheme(result)) return result;

  const localDefaults = localHorizonDefaults as Record<string, unknown>;
  const localSettings = asRecord(localDefaults.settings);
  const localTemplates = asRecord(localDefaults.templates);
  const localIndex = {
    ...asRecord(localTemplates.index),
    section_order: ['hero_main', 'featured_collection', 'image_with_text', 'email_signup'],
    sectionOrder: ['hero_main', 'featured_collection', 'image_with_text', 'email_signup'],
  };

  const current = asRecord(result.config);
  const currentSettings = asRecord(current.settings);
  const currentTemplates = asRecord(current.templates);

  const nextConfig: Record<string, unknown> = {
    ...current,
    ...localDefaults,
    settings: {
      ...currentSettings,
      ...localSettings,
      colors: {
        ...asRecord(currentSettings.colors),
        ...asRecord(localSettings.colors),
      },
      typography: {
        ...asRecord(currentSettings.typography),
        ...asRecord(localSettings.typography),
      },
    },
    templates: {
      ...currentTemplates,
      ...localTemplates,
      index: localIndex,
    },
    sections: asRecord(localDefaults.sections).announcement_bar
      ? localDefaults.sections
      : current.sections ?? localDefaults.sections,
  };

  // Prefer local layout chrome colors/sections when present
  if (localDefaults.sections) {
    nextConfig.sections = localDefaults.sections;
  }
  if (localDefaults.layout_order) {
    nextConfig.layout_order = localDefaults.layout_order;
  }

  return {
    ...result,
    defaultConfig: localDefaults,
    config: nextConfig,
    themeRuntime: {
      jsUrl: '/remote-themes/horizon/theme.js',
      cssUrl: '/remote-themes/horizon/theme.css',
    },
    notice:
      'Local Horizon runtime (`remote-themes/horizon`). Rebuild + sync to see design changes. Re-upload to S3 for production.',
  };
}
