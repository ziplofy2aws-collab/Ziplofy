/**
 * Mobile-first responsive helpers for create-theme section runtimes.
 * Breakpoint matches Shopify theme editor mobile preview (749px).
 */
export const MOBILE_MAX_WIDTH_PX = 749;

export function mobileMedia(css: string): string {
  return `@media (max-width: ${MOBILE_MAX_WIDTH_PX}px) { ${css} }`;
}

export function desktopMedia(css: string): string {
  return `@media (min-width: ${MOBILE_MAX_WIDTH_PX + 1}px) { ${css} }`;
}

export function combineResponsiveCss(
  ...parts: (string | null | undefined | false)[]
): string {
  return parts.filter(Boolean).join('\n');
}

export function sectionScopeClass(prefix: string, sectionId: string): string {
  return `${prefix}-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
}

/** Reduce horizontal section padding on small screens. */
export function scopedMobileHorizontalPadCss(scopeClass: string, mobilePad = 16): string {
  return mobileMedia(
    `.${scopeClass} { padding-left: ${mobilePad}px !important; padding-right: ${mobilePad}px !important; }`
  );
}

/** Stack a horizontal flex row into a single column on mobile. */
export function scopedMobileFlexStackCss(
  scopeClass: string,
  options?: { stretchChildren?: boolean }
): string {
  const stretch = options?.stretchChildren !== false;
  const childRules = stretch
    ? `.${scopeClass} > * { flex: none !important; width: 100% !important; max-width: 100% !important; }`
    : '';
  return mobileMedia(
    `.${scopeClass} { flex-direction: column !important; align-items: stretch !important; } ${childRules}`
  );
}

/** Collapse multi-column grids to one column on mobile. */
export function scopedMobileGridSingleColumnCss(scopeClass: string): string {
  return mobileMedia(`.${scopeClass} { grid-template-columns: 1fr !important; }`);
}

/** Generic flex column stack (no child width overrides). */
export function scopedMobileStackCss(scopeClass: string): string {
  return mobileMedia(`.${scopeClass} { flex-direction: column !important; }`);
}

export function scopedProductSplitMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} { grid-template-columns: 1fr !important; } .${scopeClass} > * { order: unset !important; min-height: 200px !important; }`
  );
}

export function scopedCollectionLinksSpotlightMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} .ziplofy-cl-spotlight-row { flex-direction: column !important; }` +
      `.${scopeClass} .ziplofy-cl-links-col { padding: 24px 20px !important; border: none !important; }` +
      `.${scopeClass} .ziplofy-cl-media-col { min-height: 200px !important; padding: 16px !important; }`
  );
}

export function scopedCollectionLinksTextMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} .ziplofy-cl-links-text { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }`
  );
}

export function scopedFooterMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} .ziplofy-footer-row { flex-direction: column !important; align-items: stretch !important; gap: 24px !important; }` +
      `.${scopeClass} .ziplofy-footer-form { max-width: 100% !important; min-width: 0 !important; flex: 1 1 auto !important; }`
  );
}

export function scopedAnnouncementMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} { padding-left: 16px !important; padding-right: 16px !important; }` +
      `.${scopeClass} .ziplofy-announcement-message { font-size: 13px !important; line-height: 1.35 !important; }`
  );
}

export function scopedFaqAccordionMobileCss(scopeClass: string): string {
  return mobileMedia(
    `.${scopeClass} button[aria-expanded] { padding: 16px 0 !important; gap: 12px !important; }` +
      `.${scopeClass} button[aria-expanded] > span:first-of-type { min-width: 0 !important; }`
  );
}

export function scopedHeaderResponsiveCss(sectionId: string): string {
  const scope = `[data-ziplofy-section="${sectionId}"]`;
  return combineResponsiveCss(
    desktopMedia(
      `${scope} .ziplofy-header-mobile-nav { display: none !important; }` +
        `${scope} .ziplofy-header-menu-toggle { display: none !important; }`
    ),
    mobileMedia(
      `${scope} .ziplofy-header-desktop-nav { display: none !important; }` +
        `${scope} .ziplofy-header-desktop-nav-row { display: none !important; }` +
        `${scope} .ziplofy-header-menu-toggle { display: inline-flex !important; }` +
        `${scope} .ziplofy-header-inner { padding-left: 16px !important; padding-right: 16px !important; }` +
        `${scope} .ziplofy-header-main-row { gap: 12px !important; flex-wrap: nowrap !important; }` +
        `${scope} .ziplofy-header-brand-cluster { gap: 0 !important; }`
    )
  );
}

export function scopedTextMarqueeMobileCss(scopeClass: string): string {
  return mobileMedia(`.${scopeClass} { padding-left: 16px !important; padding-right: 16px !important; }`);
}
