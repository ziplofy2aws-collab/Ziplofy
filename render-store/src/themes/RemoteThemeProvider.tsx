import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ThemeContract } from './contract';
import { useStorefront } from '../contexts/store.context';
import { getStorefrontAssetOrigin } from '../config/storefrontAssetOrigin';
import { loadRemoteTheme } from './loadRemoteTheme';
import { rewriteRemoteThemeImports } from './rewriteRemoteThemeImports';

type LoadedThemeContextValue = {
  contract: ThemeContract;
  reload: () => Promise<void>;
  switching: boolean;
};

const LoadedThemeContext = createContext<LoadedThemeContextValue | null>(null);

function isThemeStaticAssetPath(path: string): boolean {
  return (
    path.startsWith('/remote-themes/') ||
    path.startsWith('/static-editor-theme/') ||
    path.startsWith('/remote-theme-runtime/')
  );
}

/** Resolve `/api/...` paths for fetch/import (Vite dev proxy or `VITE_API_URL`). */
function resolveThemeAssetUrl(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (isThemeStaticAssetPath(path)) {
    return `${getStorefrontAssetOrigin()}${path}`;
  }
  const viteApi = import.meta.env.VITE_API_URL;
  const base = typeof viteApi === 'string' && viteApi.trim() !== '' ? viteApi.replace(/\/$/, '') : '';
  if (base) return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
  return `${window.location.origin}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

/**
 * Loads the React theme bundle from the API (`theme-runtime` → installed `remoteThemeDist/theme.js`).
 * Renders children only after a valid ThemeContract is available.
 */
export function RemoteThemeProvider({ children }: { children: ReactNode }) {
  const { remoteThemeJsUrl, remoteThemeCssUrl, activeThemeId, isStoreCustomTheme } = useStorefront();
  const [contract, setContract] = useState<ThemeContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const contractRef = useRef<ThemeContract | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    contractRef.current = contract;
  }, [contract]);

  const revokeBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    revokeBlob();

    if (!remoteThemeJsUrl) {
      setError(
        new Error(
          activeThemeId
            ? 'This theme has no uploaded React bundle (remoteThemeDist/theme.js). Upload theme.js in admin or apply a theme that includes it.'
            : 'No theme is applied to this store. Apply a theme in admin, then reload.'
        )
      );
      setContract(null);
      setLoading(false);
      return;
    }

    try {
      const jsUrl = resolveThemeAssetUrl(remoteThemeJsUrl);
      const res = await fetch(jsUrl, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to fetch theme bundle (${res.status}): ${jsUrl}`);
      }
      const raw = await res.text();
      const body = rewriteRemoteThemeImports(raw, getStorefrontAssetOrigin());
      const blob = new Blob([body], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;
      const next = await loadRemoteTheme(blobUrl);
      setContract(next);
    } catch (e) {
      let err = e instanceof Error ? e : new Error(String(e));
      if (
        typeof err.message === 'string' &&
        err.message.includes('Failed to fetch dynamically imported module') &&
        err.message.includes('blob:')
      ) {
        err = new Error(
          `${err.message}\n\n` +
            'The theme script was fetched, but a follow-up import failed (often a 404 on a dependency URL). ' +
            'Deploy a render-store build that includes `/remote-theme-runtime/*.js` and the matching `/assets/vendor-*.js` chunks, and hard-refresh the browser.'
        );
      }
      setError(err);
      const cur = contractRef.current;
      if (cur) {
        setContract(cur);
      } else {
        setContract(null);
      }
    } finally {
      setLoading(false);
    }
  }, [remoteThemeJsUrl, activeThemeId]);

  useEffect(() => {
    void load();
    return () => {
      revokeBlob();
    };
  }, [load]);

  const cssHref = useMemo(() => {
    if (!remoteThemeCssUrl) return '';
    return resolveThemeAssetUrl(remoteThemeCssUrl);
  }, [remoteThemeCssUrl]);

  useEffect(() => {
    const linkId = 'ziplofy-remote-theme-css';
    document.getElementById(linkId)?.remove();
    if (!contract || !cssHref) return;
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [contract, cssHref]);

  useEffect(() => {
    if (!contract) return;
    document.documentElement.dataset.ziplofyTheme = contract.id;
    return () => {
      delete document.documentElement.dataset.ziplofyTheme;
    };
  }, [contract]);

  const providerValue = useMemo((): LoadedThemeContextValue | null => {
    if (!contract) return null;
    return { contract, reload: load, switching: loading };
  }, [contract, load, loading]);

  const blockingLoad = loading && !contract;

  if (blockingLoad) {
    return (
      <div style={{ padding: 48, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ margin: 0 }}>Loading storefront theme…</p>
      </div>
    );
  }

  if (!providerValue) {
    return (
      <div style={{ padding: 24, maxWidth: 560, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 18, marginTop: 0 }}>Theme load failed</h1>
        <p style={{ color: '#444' }}>Could not load the theme bundle from the server.</p>
        <pre style={{ overflow: 'auto', background: '#f5f5f5', padding: 12, fontSize: 13 }}>{error?.message}</pre>
        <p style={{ color: '#666', fontSize: 14 }}>
          {isStoreCustomTheme ? (
            <>
              This store uses a <strong>custom theme</strong> (JSON from the theme creator). Ensure{' '}
              Apply a theme with an uploaded React bundle, or use a store custom theme (JSON + create-theme composer).
            </>
          ) : (
            <>
              Ensure the store has an applied theme and the theme was uploaded with <code>theme.js</code> (and
              optionally <code>theme.css</code>) under <code>remoteThemeDist</code>, then install the theme for this
              store.
            </>
          )}
        </p>
        <button type="button" onClick={() => void load()} style={{ marginTop: 12, padding: '8px 14px' }}>
          Retry
        </button>
      </div>
    );
  }

  return <LoadedThemeContext.Provider value={providerValue}>{children}</LoadedThemeContext.Provider>;
}

export function useLoadedThemeContract(): ThemeContract {
  const ctx = useContext(LoadedThemeContext);
  if (!ctx) {
    throw new Error('useLoadedThemeContract must be used within RemoteThemeProvider');
  }
  return ctx.contract;
}

/** @deprecated Local gaming/beauty/shoes switcher was removed; theme comes from the applied store theme only. */
export function useRemoteThemeSwitcher(): { switchTheme: () => void; switching: boolean; activeThemeId: ThemeContract['id'] } {
  const ctx = useContext(LoadedThemeContext);
  if (!ctx) {
    throw new Error('useRemoteThemeSwitcher must be used within RemoteThemeProvider after a successful theme load');
  }
  return {
    switchTheme: () => {},
    switching: ctx.switching,
    activeThemeId: ctx.contract.id,
  };
}
