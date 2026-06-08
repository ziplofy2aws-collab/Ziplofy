import { useStorefront } from './contexts/store.context';
import { CustomThemeRoutes } from './custom-theme/CustomThemeRoutes.tsx';
import { RemoteThemeProvider } from './themes/RemoteThemeProvider.tsx';
import { StorefrontRoutes } from './StorefrontRoutes.tsx';

/**
 * Resolves storefront subdomain / meta from `StorefrontProvider`, then either
 * shows loading, a helpful error, or the main app routes.
 */
export const IsValidStorefront = () => {
  const { isStoreFront, storeFrontChecked, storeFrontMeta, isStoreCustomTheme, themeConfig } =
    useStorefront();

  if (!storeFrontChecked) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ margin: 0 }}>Loading storefront…</p>
      </div>
    );
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

  if (isStoreCustomTheme && themeConfig) {
    return <CustomThemeRoutes />;
  }

  return (
    <RemoteThemeProvider>
      <StorefrontRoutes />
    </RemoteThemeProvider>
  );
};
