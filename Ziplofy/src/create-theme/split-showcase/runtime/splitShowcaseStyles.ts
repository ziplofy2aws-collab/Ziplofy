export function splitShowcaseResponsiveCss(sectionId: string, verticalOnMobile: boolean): string {
  if (!verticalOnMobile) return '';
  const root = `[data-ziplofy-section="${sectionId}"] .split-showcase-grid`;
  const tile = `[data-ziplofy-section="${sectionId}"] .split-showcase-tile`;
  return `@media (max-width: 749px) { ${root} { flex-direction: column !important; } ${tile} { flex: 1 1 auto !important; width: 100% !important; min-height: 280px !important; } }`;
}
