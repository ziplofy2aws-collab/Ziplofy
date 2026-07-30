import { isThemeEditorPreview } from '@/utils/theme-editor-preview';

/**
 * Remote theme pack demo media policy.
 *
 * Pack / stock demo images may ship with an installable theme for catalog
 * marketing and local design. In the theme editor and on the live storefront
 * those URLs must resolve to same-size placeholders so layout stays stable
 * without exposing theme-pack assets. Opt in with:
 *   - `document.documentElement.dataset.ziplofyPackDemoAssets = '1'`
 *   - or `?packDemoAssets=1` / `?demoAssets=1` on the storefront URL
 */

const PACK_ASSET_PATH_RE = /\/remote-themes\/[^/?#]+\/assets\//i;
const DEMO_STOCK_HOST_RE = /(?:^https?:)?\/\/(?:images\.)?unsplash\.com\//i;
/** Watch/Horizon pack filenames (catches relative or host-rewritten asset URLs). */
const PACK_DEMO_FILENAME_RE =
  /(?:^|\/)(?:hero-banner|mobile-hero|mobile-banner|banner|BS|NL|NA|coll|promo|BG|insta|logo)[-_]?\d*(?:-hover)?\.(?:png|jpe?g|webp|gif|mp4)(?:$|\?)/i;

export function shouldShowRemoteThemePackDemoAssets(): boolean {
  // Theme editor iframe / preview always uses placeholders.
  if (typeof document !== 'undefined') {
    if (
      document.documentElement.classList.contains('codiic-theme-preview-root') ||
      isThemeEditorPreview()
    ) {
      return false;
    }
    const flag = document.documentElement.dataset.ziplofyPackDemoAssets;
    if (flag === '1' || flag === 'true') return true;
  }
  // Live / catalog showcase opt-in only (keeps applied storefronts asset-safe by default).
  if (typeof window !== 'undefined') {
    try {
      const q = new URLSearchParams(window.location.search);
      const v = q.get('packDemoAssets') ?? q.get('demoAssets');
      if (v === '1' || v === 'true') return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

/** True when the URL points at theme-pack demo media (not merchant uploads). */
export function isRemoteThemePackDemoMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:image/svg+xml')) return false;
  if (PACK_ASSET_PATH_RE.test(trimmed) || DEMO_STOCK_HOST_RE.test(trimmed)) return true;
  // Relative / CDN-rewritten pack files still count as demo media.
  if (PACK_DEMO_FILENAME_RE.test(trimmed) && !/\/uploads?\//i.test(trimmed)) return true;
  return false;
}

/** Neutral SVG placeholder — use with object-fit so layout size is preserved. */
export function remoteThemeMediaPlaceholderUrl(label = 'Your image goes here'): string {
  const safe = label.replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
  <rect fill="#ececec" width="1600" height="1200"/>
  <rect x="64" y="64" width="1472" height="1072" rx="12" fill="none" stroke="#b8b8b8" stroke-width="3" stroke-dasharray="14 12"/>
  <g fill="#8a8a8a" font-family="system-ui,-apple-system,Segoe UI,sans-serif" text-anchor="middle">
    <text x="800" y="580" font-size="42" font-weight="600">${safe}</text>
    <text x="800" y="640" font-size="24" font-weight="400">Upload an image in the theme editor</text>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Resolve media for remote themes.
 * Merchant/custom URLs always win. Pack demo URLs and empty values become
 * placeholders unless pack demo assets are explicitly enabled.
 */
export function resolveRemoteThemeMediaUrl(
  configuredUrl: string | null | undefined,
  packDemoUrl?: string | null
): string {
  const configured = (configuredUrl ?? '').trim();
  const packDemo = (packDemoUrl ?? '').trim();
  const showDemo = shouldShowRemoteThemePackDemoAssets();

  if (configured && !isRemoteThemePackDemoMediaUrl(configured)) {
    return configured;
  }

  if (showDemo) {
    if (configured) return configured;
    if (packDemo) return packDemo;
    return remoteThemeMediaPlaceholderUrl();
  }

  return remoteThemeMediaPlaceholderUrl();
}
