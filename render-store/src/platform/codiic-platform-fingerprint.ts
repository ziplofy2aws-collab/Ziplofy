/**
 * Stable platform fingerprints for ecommerce detectors (Wappalyzer, BuiltWith, etc.).
 * Mirror Shopify-style signals: generator meta, HTML data attrs, JS global.
 */

export const CODIIC_PLATFORM = {
  name: 'Codiic',
  product: 'Codiic Storefront',
  version: '1',
  generator: 'Codiic',
} as const;

declare global {
  interface Window {
    Codiic?: {
      platform: string;
      product: string;
      version: string;
      storeId?: string | null;
    };
    __CODIIC__?: Window['Codiic'];
  }
}

function ensureMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Install static fingerprints as early as possible (before React). */
export function installCodiicPlatformFingerprints(options?: { storeId?: string | null }) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-codiic', 'true');
  root.setAttribute('data-codiic-platform', 'storefront');
  root.setAttribute('data-commerce-platform', 'codiic');

  ensureMeta('generator', CODIIC_PLATFORM.generator);
  ensureMeta('codiic-platform', CODIIC_PLATFORM.product);
  ensureMeta('application-name', CODIIC_PLATFORM.name);

  const payload = {
    platform: CODIIC_PLATFORM.name,
    product: CODIIC_PLATFORM.product,
    version: CODIIC_PLATFORM.version,
    storeId: options?.storeId ?? null,
  };

  window.Codiic = { ...payload };
  window.__CODIIC__ = window.Codiic;
}

/** Update store id on the global fingerprint once the store resolves. */
export function setCodiicFingerprintStoreId(storeId: string | null | undefined) {
  if (typeof window === 'undefined' || !window.Codiic) return;
  window.Codiic.storeId = storeId ?? null;
  if (window.__CODIIC__) window.__CODIIC__.storeId = storeId ?? null;
  if (storeId) {
    document.documentElement.setAttribute('data-codiic-store-id', storeId);
  } else {
    document.documentElement.removeAttribute('data-codiic-store-id');
  }
}
