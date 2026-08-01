import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { applyThemeFaviconToDocument, readThemeFaviconUrl } from '@/seo/theme-favicon.util';
import {
  applyThemeTypographyCssVars,
  applyThemeTypographyFontsToDocument,
} from '@/theme/theme-typography.util';
import { readThemePageBackgroundForCss, readThemePageMaxWidthForCss } from '@/theme/theme-page.util';
import { readThemeButtonCssVars } from '@/theme/theme-buttons.util';

export type ThemeConfig = Record<string, unknown>;

const ThemeConfigContext = createContext<ThemeConfig | null>(null);

declare global {
  interface Window {
    __codiic_THEME_CONFIG__?: ThemeConfig;
  }
}

function applyThemeConfigCssVars(config: ThemeConfig | null): void {
  const root = document.documentElement;
  const settings = config?.settings as Record<string, unknown> | undefined;
  const colors = settings?.colors as Record<string, string> | undefined;
  if (colors?.primary) root.style.setProperty('--codiic-primary', colors.primary);
  if (colors?.accent) root.style.setProperty('--codiic-accent', colors.accent);
  if (colors?.background) root.style.setProperty('--codiic-background', colors.background);
  const pageBg = readThemePageBackgroundForCss(config);
  if (pageBg) root.style.setProperty('--codiic-background', pageBg);
  const pageMaxWidth = readThemePageMaxWidthForCss(config);
  if (pageMaxWidth) root.style.setProperty('--codiic-page-max-width', `${pageMaxWidth}px`);
  if (colors?.text) root.style.setProperty('--codiic-text', colors.text);
  if (colors?.surface) root.style.setProperty('--codiic-surface', colors.surface);
  if (colors?.muted) root.style.setProperty('--codiic-muted', colors.muted);
  if (colors?.border) root.style.setProperty('--codiic-border', colors.border);
  applyThemeTypographyCssVars(config);
  const buttonVars = readThemeButtonCssVars(config);
  for (const [key, value] of Object.entries(buttonVars)) {
    root.style.setProperty(key, value);
  }
}

function configSignature(config: ThemeConfig | null): string {
  if (!config) return '';
  try {
    return JSON.stringify(config);
  } catch {
    return String(Date.now());
  }
}

export function ThemeConfigProvider({
  config,
  children,
}: {
  config: ThemeConfig | null;
  children: ReactNode;
}) {
  const lastSigRef = useRef('');
  const stableConfigRef = useRef<ThemeConfig | null>(config);

  const contextValue = useMemo(() => {
    const sig = configSignature(config);
    if (sig !== lastSigRef.current) {
      lastSigRef.current = sig;
      stableConfigRef.current = config;
    }
    return stableConfigRef.current;
  }, [config]);

  useEffect(() => {
    const sig = configSignature(contextValue);
    if (sig === lastSigRef.current && window.__codiic_THEME_CONFIG__ === contextValue) return;

    if (contextValue && typeof contextValue === 'object') {
      window.__codiic_THEME_CONFIG__ = contextValue;
    } else {
      delete window.__codiic_THEME_CONFIG__;
    }
    applyThemeConfigCssVars(contextValue);
    applyThemeTypographyFontsToDocument(contextValue);
    applyThemeFaviconToDocument(readThemeFaviconUrl(contextValue));
    window.dispatchEvent(
      new CustomEvent('codiic-theme-config-changed', { detail: contextValue ?? null })
    );
  }, [contextValue]);

  return (
    <ThemeConfigContext.Provider value={contextValue}>{children}</ThemeConfigContext.Provider>
  );
}

export function useThemeConfig(): ThemeConfig | null {
  return useContext(ThemeConfigContext);
}

/** Walk a simple dot path (no dotted object keys). */
function getBySimpleDotPath(root: unknown, dotPath: string): unknown {
  if (!dotPath) return root;
  const parts = dotPath.split('.');
  let cur: unknown = root;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(p);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cur.length) return undefined;
      cur = cur[idx];
      continue;
    }
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/**
 * Read nested config path, e.g. sections.header.blocks.menu.settings.items.0.label
 * Template keys may contain dots (`product.sale`, `pages.about`) — match the longest
 * known `config.templates` key before walking the rest of the path.
 */
export function getThemeConfigValue(config: ThemeConfig | null, dotPath: string): unknown {
  if (!config) return undefined;

  if (dotPath.startsWith('templates.')) {
    const templates = (config as { templates?: Record<string, unknown> }).templates;
    if (templates && typeof templates === 'object' && !Array.isArray(templates)) {
      const rest = dotPath.slice('templates.'.length);
      const keys = Object.keys(templates).sort((a, b) => b.length - a.length);
      for (const key of keys) {
        if (rest === key) return templates[key];
        if (rest.startsWith(`${key}.`)) {
          return getBySimpleDotPath(templates[key], rest.slice(key.length + 1));
        }
      }
    }
  }

  return getBySimpleDotPath(config, dotPath);
}
