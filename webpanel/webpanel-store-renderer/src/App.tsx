import { StorefrontProvider } from '@/contexts/store.context';
import { IsValidStorefront } from '@/components/IsValidStorefront';
import { ThemePreviewApp } from '@/theme-preview/ThemePreviewApp';

/**
 * Web Panel Store Renderer — Informatic site host.
 * Resolves store from Host / subdomain, then renders the applied theme (upcoming).
 */
function App() {
  /**
   * Theme editor live preview — must render before the storefront gate: the
   * dedicated preview host (preview.crm-360.codiic.com) is not a store
   * subdomain, so IsValidStorefront would return StoreNotFound and the
   * postMessage handshake with the editor would never happen.
   */
  if (
    typeof window !== 'undefined' &&
    (window.location.pathname === '/theme-preview' ||
      window.location.pathname.startsWith('/theme-preview/'))
  ) {
    return <ThemePreviewApp />;
  }

  return (
    <StorefrontProvider>
      <IsValidStorefront />
    </StorefrontProvider>
  );
}

export default App;
