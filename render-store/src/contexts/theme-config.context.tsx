import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

export type ThemeConfig = Record<string, unknown>;

const ThemeConfigContext = createContext<ThemeConfig | null>(null);

declare global {
  interface Window {
    __ZIPLOFY_THEME_CONFIG__?: ThemeConfig;
  }
}

function applyThemeConfigCssVars(config: ThemeConfig | null): void {
  const root = document.documentElement;
  const colors = config?.colors as Record<string, string> | undefined;
  const typography = config?.typography as Record<string, string> | undefined;
  if (colors?.primary) root.style.setProperty('--ziplofy-primary', colors.primary);
  if (colors?.accent) root.style.setProperty('--ziplofy-accent', colors.accent);
  if (colors?.background) root.style.setProperty('--ziplofy-background', colors.background);
  if (typography?.fontFamily) root.style.setProperty('--ziplofy-font-family', typography.fontFamily);
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
    if (sig === lastSigRef.current && window.__ZIPLOFY_THEME_CONFIG__ === contextValue) return;

    if (contextValue && typeof contextValue === 'object') {
      window.__ZIPLOFY_THEME_CONFIG__ = contextValue;
    } else {
      delete window.__ZIPLOFY_THEME_CONFIG__;
    }
    applyThemeConfigCssVars(contextValue);
    window.dispatchEvent(
      new CustomEvent('ziplofy-theme-config-changed', { detail: contextValue ?? null })
    );
  }, [contextValue]);

  return (
    <ThemeConfigContext.Provider value={contextValue}>{children}</ThemeConfigContext.Provider>
  );
}

export function useThemeConfig(): ThemeConfig | null {
  return useContext(ThemeConfigContext);
}

/** Read nested config path, e.g. sections.header.blocks.menu.settings.items.0.label */
export function getThemeConfigValue(config: ThemeConfig | null, dotPath: string): unknown {
  if (!config) return undefined;
  const parts = dotPath.split('.');
  let cur: unknown = config;
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
