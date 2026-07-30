import type { ThemeEditorLoadResult } from './theme-editor-load';
import localHorizonDefaults from '../theme-packs/horizon/theme.default-config.json';
import localWatchDefaults from '../theme-packs/watch/theme.default-config.json';

function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/** Local remote-theme dist under render-store/codiic `public/remote-themes/{id}/`. */
export function isLocalRemoteThemeRuntimeEnabled(): boolean {
  // Default ON in Vite dev so editor shows the rebuilt theme without S3 re-upload.
  const fallback = Boolean(import.meta.env.DEV);
  return envFlag(
    (import.meta.env.VITE_THEME_EDITOR_LOCAL_REMOTE_THEME as string | undefined) ??
      (import.meta.env.VITE_THEME_EDITOR_LOCAL_HORIZON as string | undefined),
    fallback
  );
}

/** @deprecated use isLocalRemoteThemeRuntimeEnabled */
export function isLocalHorizonRuntimeEnabled(): boolean {
  return isLocalRemoteThemeRuntimeEnabled();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function detectLocalPackId(result: ThemeEditorLoadResult): 'horizon' | 'watch' | null {
  const blob = `${result.themeName ?? ''} ${result.themePath ?? ''} ${result.staticPackId ?? ''}`.toLowerCase();
  if (blob.includes('watch') || result.staticPackId === 'watch') return 'watch';
  if (blob.includes('horizon') || result.staticPackId === 'horizon') return 'horizon';

  const themeId = String((result.defaultConfig as { themeId?: string } | null)?.themeId ?? '').toLowerCase();
  if (themeId === 'watch') return 'watch';
  if (themeId === 'horizon') return 'horizon';

  const jsUrl = String(result.themeRuntime?.jsUrl ?? '').toLowerCase();
  if (jsUrl.includes('/remote-themes/watch/') || jsUrl.includes('/watch/')) return 'watch';
  if (jsUrl.includes('/remote-themes/horizon/') || jsUrl.includes('/horizon/')) return 'horizon';

  // Pack shape heuristic: Watch home section ids
  const indexSections = asRecord(
    asRecord(asRecord(result.config).templates).index
  ).sections;
  if (indexSections && typeof indexSections === 'object' && 'watch_hero' in indexSections) {
    return 'watch';
  }

  return null;
}

function stripPackDemoMediaUrls(value: unknown): unknown {
  if (typeof value === 'string') {
    if (/\/remote-themes\/[^/?#]+\/assets\//i.test(value)) return '';
    if (/(?:^https?:)?\/\/(?:images\.)?unsplash\.com\//i.test(value)) return '';
    return value;
  }
  if (Array.isArray(value)) return value.map(stripPackDemoMediaUrls);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripPackDemoMediaUrls(v);
    }
    return out;
  }
  return value;
}

function withoutBlogsMenuItems(config: Record<string, unknown>): Record<string, unknown> {
  const sections = asRecord(config.sections);
  const header = asRecord(sections.header);
  const blocks = asRecord(header.blocks);
  const menu = asRecord(blocks.menu);
  const settings = asRecord(menu.settings);
  const items = settings.items;
  if (!Array.isArray(items)) return config;

  const nextItems = items.filter((item) => {
    if (!item || typeof item !== 'object') return true;
    const row = item as { label?: unknown; href?: unknown };
    const label = String(row.label ?? '').trim().toLowerCase();
    const href = String(row.href ?? '').trim().toLowerCase();
    if (label === 'blogs' || href === '/blogs' || href.endsWith('/blogs')) return false;
    return true;
  });

  return {
    ...config,
    sections: {
      ...sections,
      header: {
        ...header,
        blocks: {
          ...blocks,
          menu: {
            ...menu,
            settings: {
              ...settings,
              items: nextItems,
            },
          },
        },
      },
    },
  };
}

function applyHorizonLocalDefaults(result: ThemeEditorLoadResult): ThemeEditorLoadResult {
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

  if (localDefaults.sections) nextConfig.sections = localDefaults.sections;
  if (localDefaults.layout_order) nextConfig.layout_order = localDefaults.layout_order;

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

function applyWatchLocalDefaults(result: ThemeEditorLoadResult): ThemeEditorLoadResult {
  const localDefaults = localWatchDefaults as Record<string, unknown>;
  const current = asRecord(result.config);
  const localTemplates = asRecord(localDefaults.templates);
  const localIndex = asRecord(localTemplates.index);
  const currentTemplates = asRecord(current.templates);
  const currentIndex = asRecord(currentTemplates.index);

  // Keep merchant section order when present; otherwise use Watch home stack.
  const sectionOrder =
    (Array.isArray(currentIndex.section_order) && currentIndex.section_order.length
      ? currentIndex.section_order
      : localIndex.section_order) ?? [];

  let nextConfig: Record<string, unknown> = {
    ...current,
    settings: {
      ...asRecord(localDefaults.settings),
      ...asRecord(current.settings),
    },
    templates: {
      ...localTemplates,
      ...currentTemplates,
      index: {
        ...localIndex,
        ...currentIndex,
        section_order: sectionOrder,
        sections: {
          ...asRecord(localIndex.sections),
          ...asRecord(currentIndex.sections),
        },
      },
    },
    sections: {
      ...asRecord(localDefaults.sections),
      ...asRecord(current.sections),
    },
    layout_order: current.layout_order ?? localDefaults.layout_order,
  };

  nextConfig = withoutBlogsMenuItems(nextConfig);
  // Drop pack demo media URLs from live editor config so placeholders win even
  // before theme.js re-resolves (and so saved store configs cannot keep exposing assets).
  nextConfig = stripPackDemoMediaUrls(nextConfig) as Record<string, unknown>;

  return {
    ...result,
    defaultConfig: stripPackDemoMediaUrls(localDefaults) as Record<string, unknown>,
    config: nextConfig,
    themeRuntime: {
      jsUrl: '/remote-themes/watch/theme.js',
      cssUrl: '/remote-themes/watch/theme.css',
    },
    notice:
      'Local Watch runtime (`remote-themes/watch`). Pack demo images are hidden in the editor — upload merchant media. Rebuild + sync locally; re-upload to S3 for production.',
  };
}

/**
 * Point preview at local remote-theme `theme.js` / `theme.css` in dev so stale S3
 * bundles cannot keep showing old layouts / pack demo assets.
 */
export function applyLocalRemoteThemeRuntime(result: ThemeEditorLoadResult): ThemeEditorLoadResult {
  if (!isLocalRemoteThemeRuntimeEnabled()) return result;
  const packId = detectLocalPackId(result);
  if (packId === 'watch') return applyWatchLocalDefaults(result);
  if (packId === 'horizon') return applyHorizonLocalDefaults(result);
  return result;
}

/** @deprecated use applyLocalRemoteThemeRuntime */
export function applyLocalHorizonRuntime(result: ThemeEditorLoadResult): ThemeEditorLoadResult {
  return applyLocalRemoteThemeRuntime(result);
}
