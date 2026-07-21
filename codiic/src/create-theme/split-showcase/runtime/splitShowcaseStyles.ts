import { atMobileBreakpoint } from '../../runtime/shared/responsive';

export function splitShowcaseResponsiveCss(sectionId: string, verticalOnMobile: boolean): string {
  if (!verticalOnMobile) return '';
  const root = `[data-codiic-section="${sectionId}"] .split-showcase-grid`;
  const tile = `[data-codiic-section="${sectionId}"] .split-showcase-tile`;
  return atMobileBreakpoint(
    `${root} { flex-direction: column !important; } ${tile} { flex: 1 1 auto !important; width: 100% !important; min-height: 280px !important; }`
  );
}
