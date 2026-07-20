/**
 * Canonical origin for storefront-hosted assets (e.g. `/src/themes/remote-runtime-shims/...`)
 * rewritten into remote theme bundles loaded from a blob URL.
 *
 * - Set `VITE_STOREFRONT_ORIGIN` in production when the public URL must be fixed (CDN, proxy,
 *   or preview host differs from where the SPA is served).
 * - Omit in development: falls back to `window.location.origin` (Vite dev server).
 */
export function getStorefrontAssetOrigin(): string {
  const fromEnv = import.meta.env.VITE_STOREFRONT_ORIGIN;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.replace(/\/$/, '').trim();
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
