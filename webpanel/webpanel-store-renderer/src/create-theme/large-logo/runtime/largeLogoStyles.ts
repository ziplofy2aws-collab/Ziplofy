import { mobileMedia } from '../../runtime/shared/responsive';

/** Signature Large logo section background (Shopify Horizon preview). */
export const LARGE_LOGO_BACKGROUND = '#f0f1ed';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0]! + normalized[0]!, 16);
    const g = parseInt(normalized[1]! + normalized[1]!, 16);
    const b = parseInt(normalized[2]! + normalized[2]!, 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  return null;
}

/** Build CSS border from Style / Thickness / Opacity / Color (Shopify-style). */
export function resolveLargeLogoBorderCss(
  borderStyle: string,
  thickness: number,
  opacity: number,
  borderColor: string,
  schemeBorder: string
): string | undefined {
  if (borderStyle !== 'solid' || thickness <= 0) return undefined;
  const base =
    !borderColor || borderColor === 'default'
      ? schemeBorder
      : borderColor.startsWith('#')
        ? borderColor
        : schemeBorder;
  const rgb = hexToRgb(base);
  const alpha = Math.min(100, Math.max(0, opacity)) / 100;
  if (!rgb) return `${thickness}px solid ${schemeBorder}`;
  return `${thickness}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Soft mobile tweaks — do not override section direction or logo size with !important. */
export function scopedLargeLogoMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} { padding-left: 20px !important; padding-right: 20px !important; }` +
      `.${scopeClass} .codiic-large-logo-corner { max-width: 100% !important; }`
  );
}
