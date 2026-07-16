import { lazy, Suspense } from 'react';
import { StorePasswordThemeGate } from './components/StorePasswordThemeGate';
import { useStorefrontAccess } from './contexts/store-access.context';
import { useStorefront } from './contexts/store.context';
import { shouldUseComposerRuntime } from './utils/themeComposer';

const CustomThemeRoutes = lazy(() =>
  import('./custom-theme/CustomThemeRoutes.tsx').then((m) => ({ default: m.CustomThemeRoutes }))
);
const RemoteThemeProvider = lazy(() =>
  import('./themes/RemoteThemeProvider.tsx').then((m) => ({ default: m.RemoteThemeProvider }))
);
const StorefrontRoutes = lazy(() =>
  import('./StorefrontRoutes.tsx').then((m) => ({ default: m.StorefrontRoutes }))
);

/** Silent boot placeholder with a subtle centered spinner. */
function StorefrontBootFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      style={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid rgba(17, 24, 39, 0.08)',
          borderTopColor: 'rgba(17, 24, 39, 0.35)',
          animation: 'codiic-store-spin 0.7s linear infinite',
          boxSizing: 'border-box',
        }}
      />
      <style>{`@keyframes codiic-store-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Resolves storefront subdomain / meta from `StorefrontProvider`, then either
 * shows loading, a helpful error, password gate, or the main app routes.
 */
export const IsValidStorefront = () => {
  const {
    isStoreFront,
    storeFrontChecked,
    storeFrontMeta,
    isStoreCustomTheme,
    themeConfig,
    remoteThemeJsUrl,
    storeAssetsLoading,
    storeAssetsReady,
  } = useStorefront();
  const { checked: accessChecked, loading: accessLoading, passwordProtectionEnabled, unlocked } =
    useStorefrontAccess();

  if (!storeFrontChecked) {
    return <StorefrontBootFallback />;
  }

  if (!isStoreFront || !storeFrontMeta) {
    return (
      <div style={{ padding: 24, maxWidth: 520, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 18, marginTop: 0 }}>Storefront unavailable</h1>
        <p style={{ margin: '0 0 12px', color: '#444' }}>
          This hostname is not a valid store subdomain, or the store could not be resolved.
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          For local development, set <code>VITE_STORE_SUBDOMAIN</code> in your <code>.env</code> file to match a
          store subdomain, then reload.
        </p>
      </div>
    );
  }

  // Wait for both access and theme — they load in parallel after subdomain resolve.
  if (!accessChecked || accessLoading || storeAssetsLoading || !storeAssetsReady) {
    return <StorefrontBootFallback />;
  }

  if (passwordProtectionEnabled && !unlocked) {
    return <StorePasswordThemeGate />;
  }

  const useComposer = shouldUseComposerRuntime({
    isStoreCustomTheme,
    themeConfig,
    remoteThemeJsUrl,
  });

  if (useComposer && themeConfig) {
    return (
      <Suspense fallback={<StorefrontBootFallback />}>
        <CustomThemeRoutes />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<StorefrontBootFallback />}>
      <RemoteThemeProvider>
        <StorefrontRoutes />
      </RemoteThemeProvider>
    </Suspense>
  );
};
