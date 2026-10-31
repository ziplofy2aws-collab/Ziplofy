import { cfgBool, cfgNumber, cfgString } from './config';
import { mobileMedia } from './responsive';

export const THEME_LOGO_DESKTOP_HEIGHT_DEFAULT = 36;
export const THEME_LOGO_MOBILE_HEIGHT_DEFAULT = 28;

/** Editor-only asset paths — work under Vite locally, 404 on merchant storefront hosts. */
function storefrontSafeMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/remote-themes/')) return '';
  if (trimmed.startsWith('/static-editor-theme/')) return '';
  return trimmed;
}

export function resolveThemeLogoUrls(config: Record<string, unknown> | null): {
  defaultUrl: string;
  inverseUrl: string;
  faviconUrl: string;
} {
  const themeDefault = storefrontSafeMediaUrl(
    cfgString(config, 'settings.logo.defaultUrl', '')
  );
  const themeInverse = storefrontSafeMediaUrl(
    cfgString(config, 'settings.logo.inverseUrl', '')
  );
  const headerDefault = storefrontSafeMediaUrl(
    cfgString(config, 'sections.header.settings.defaultLogoUrl', '')
  );
  const blockLogo = storefrontSafeMediaUrl(
    cfgString(config, 'sections.header.blocks.logo.settings.imageUrl', '')
  );
  const faviconUrl = storefrontSafeMediaUrl(
    cfgString(config, 'settings.logo.faviconUrl', '')
  );

  return {
    defaultUrl: themeDefault || headerDefault || blockLogo,
    inverseUrl: themeInverse,
    faviconUrl,
  };
}

export function shouldUseInverseThemeLogo(
  config: Record<string, unknown> | null,
  sectionId: string,
  pathname: string
): boolean {
  const settingsBase = `sections.${sectionId}.settings`;
  const isHome = pathname === '/' || pathname === '';
  const isProduct = pathname.startsWith('/product/') || pathname.startsWith('/products/');
  const isCollection =
    pathname.startsWith('/collection/') ||
    (pathname.startsWith('/collections/') && pathname !== '/collections/all');

  if (isHome && cfgBool(config, `${settingsBase}.homeTransparentBackground`, false)) {
    return true;
  }
  if (isProduct && cfgBool(config, `${settingsBase}.productTransparentBackground`, false)) {
    return true;
  }
  if (isCollection && cfgBool(config, `${settingsBase}.collectionTransparentBackground`, false)) {
    return true;
  }
  return false;
}

export function resolveActiveThemeLogoUrl(
  config: Record<string, unknown> | null,
  sectionId: string,
  pathname: string
): string {
  const { defaultUrl, inverseUrl } = resolveThemeLogoUrls(config);
  if (shouldUseInverseThemeLogo(config, sectionId, pathname) && inverseUrl) {
    return inverseUrl;
  }
  return defaultUrl;
}

export function resolveThemeLogoHeights(config: Record<string, unknown> | null): {
  desktop: number;
  mobile: number;
} {
  const desktop = Math.max(
    12,
    Math.min(120, cfgNumber(config, 'settings.logo.desktopHeight', THEME_LOGO_DESKTOP_HEIGHT_DEFAULT))
  );
  const mobile = Math.max(
    12,
    Math.min(120, cfgNumber(config, 'settings.logo.mobileHeight', THEME_LOGO_MOBILE_HEIGHT_DEFAULT))
  );
  return { desktop, mobile };
}

export function scopedHeaderLogoHeightCss(
  sectionId: string,
  desktop: number,
  mobile: number
): string {
  const sel = `[data-codiic-section="${sectionId}"] .codiic-header-logo-img`;
  return `${sel}{height:${desktop}px;max-height:${desktop}px;width:auto;object-fit:contain;display:block;}\n${mobileMedia(`${sel}{height:${mobile}px;max-height:${mobile}px;}`)}`;
}
