import { atMobileBreakpoint } from '../../runtime/shared/responsive';

export function splitShowcaseResponsiveCss(sectionId: string, verticalOnMobile: boolean): string {
  if (!verticalOnMobile) return '';
  const root = `[data-codiic-section="${sectionId}"] .split-showcase-grid`;
  const tile = `[data-codiic-section="${sectionId}"] .split-showcase-tile`;
  return atMobileBreakpoint(
    `${root} { grid-template-columns: minmax(0, 1fr) !important; } ` +
      `${tile} { width: 100% !important; min-height: 280px !important; }`
  );
}
