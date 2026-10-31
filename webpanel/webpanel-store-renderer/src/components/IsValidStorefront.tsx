import { useStorefront } from '@/contexts/store.context';
import { InformaticStorefrontContactFormProvider } from '@/contexts/informatic-contact-form.context';
import { InformaticStorefront } from '@/components/InformaticStorefront';
import { CustomThemeStorefront } from '@/components/CustomThemeStorefront';
import { StoreNotFound } from '@/components/StoreNotFound';
import { ThemePreviewApp } from '@/theme-preview/ThemePreviewApp';

function BootFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading store"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid rgba(17, 24, 39, 0.08)',
          borderTopColor: 'rgba(17, 24, 39, 0.4)',
          animation: 'wp-store-spin 0.7s linear infinite',
          boxSizing: 'border-box',
        }}
      />
      <style>{`@keyframes wp-store-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Gate: resolve Informatic store from Host → render theme, or beautiful not-found.
 */
export function IsValidStorefront() {
  const { isStoreFront, storeFrontChecked, storeFrontMeta, resolveError } = useStorefront();

  if (!storeFrontChecked) {
    return <BootFallback />;
  }

  if (!isStoreFront || !storeFrontMeta) {
    return (
      <StoreNotFound
        hostname={typeof window !== 'undefined' ? window.location.host : undefined}
        message={resolveError}
      />
    );
  }

  /** Theme-builder live preview iframe host. */
  if (
    typeof window !== 'undefined' &&
    window.location.pathname === '/theme-preview'
  ) {
    return <ThemePreviewApp />;
  }

  /** Stores with a builder-made custom theme render through the composer. */
  if (storeFrontMeta.appliedCustomThemeId) {
    return (
      <InformaticStorefrontContactFormProvider>
        <CustomThemeStorefront store={storeFrontMeta} />
      </InformaticStorefrontContactFormProvider>
    );
  }

  return <InformaticStorefront store={storeFrontMeta} />;
}
