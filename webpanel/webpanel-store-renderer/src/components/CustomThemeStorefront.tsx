import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { axiosi } from '@/config/axios.config';
import type { StorefrontMeta } from '@/contexts/store.context';
import { ThemeConfigProvider } from '@render-store/sdk';
import { CustomThemeTemplatePage } from '../create-theme/runtime';
import { renderThemePageRoutes } from '../theme-preview/ThemePageRouteElements';

type RuntimeData = {
  themeId: string;
  themeName: string;
  themeConfig: Record<string, unknown>;
} | null;

/**
 * Live storefront for stores with an applied builder-made custom theme.
 * Renders all theme template routes through the create-theme composer.
 */
export function CustomThemeStorefront({ store }: { store: StorefrontMeta }) {
  const [runtime, setRuntime] = useState<RuntimeData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosi
      .get<{ success: boolean; data: RuntimeData }>(
        `/storefront/${store.storeId}/custom-theme-runtime`
      )
      .then((res) => {
        if (!cancelled) setRuntime(res.data?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setRuntime(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [store.storeId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontFamily: 'system-ui, sans-serif', color: '#78716c', fontSize: 14 }}>
          Loading store…
        </p>
      </div>
    );
  }

  if (!runtime?.themeConfig) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <p style={{ color: '#78716c', fontSize: 14 }}>This store's theme could not be loaded.</p>
      </div>
    );
  }

  return (
    <ThemeConfigProvider config={runtime.themeConfig}>
      <BrowserRouter>
        <Routes>
          {renderThemePageRoutes()}
          <Route path="*" element={<CustomThemeTemplatePage templateId="index" />} />
        </Routes>
      </BrowserRouter>
    </ThemeConfigProvider>
  );
}
