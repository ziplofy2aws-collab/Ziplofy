import { mobileMedia } from '../../runtime/shared/responsive';

/** Signature Large logo section background (Shopify Horizon preview). */
export const LARGE_LOGO_BACKGROUND = '#f0f1ed';

export function scopedLargeLogoMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} { padding-left: 20px !important; padding-right: 20px !important; }` +
      `.${scopeClass} .ziplofy-large-logo-corner { max-width: 100% !important; font-size: 14px !important; }` +
      `.${scopeClass} .ziplofy-large-logo-stage h1 { font-size: clamp(2.75rem, 14vw, 6rem) !important; }` +
      `.${scopeClass} .ziplofy-large-logo-stage { min-height: 200px !important; padding-top: 24px !important; }` +
      `.${scopeClass} { flex-direction: column !important; align-items: stretch !important; }`
  );
}
