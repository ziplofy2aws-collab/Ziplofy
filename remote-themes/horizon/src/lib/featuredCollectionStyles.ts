import { cfgNumber, cfgString } from './config';

export type FeaturedCollectionScheme = {
  background: string;
  color: string;
  muted: string;
};

const COLOR_SCHEMES: Record<string, FeaturedCollectionScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f8fafc', color: '#0f172a', muted: '#64748b' },
  'scheme-3': { background: '#fff7ed', color: '#431407', muted: '#9a3412' },
  'scheme-4': { background: '#f5f3ff', color: '#4c1d95', muted: '#6d28d9' },
};

export function featuredCollectionColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: FeaturedCollectionScheme
): FeaturedCollectionScheme {
  const key = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  return COLOR_SCHEMES[key] ?? fallback;
}

export function featuredCollectionSectionWidth(
  config: Record<string, unknown> | null,
  settingsBase: string
): 'page' | 'full' {
  return cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page';
}

export function featuredCollectionPadding(config: Record<string, unknown> | null, settingsBase: string) {
  return {
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
  };
}

export function featuredCollectionGaps(config: Record<string, unknown> | null, settingsBase: string) {
  const legacy = cfgNumber(config, `${settingsBase}.gap`, 24);
  return {
    horizontal: cfgNumber(config, `${settingsBase}.horizontalGap`, legacy > 0 ? Math.min(legacy, 48) : 8),
    vertical: cfgNumber(config, `${settingsBase}.verticalGap`, 24),
    section: cfgNumber(config, `${settingsBase}.sectionGap`, 28),
  };
}

export function scopedFeaturedCollectionCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  const sel = `[data-ziplofy-section="${sectionId}"]`;
  return trimmed.replace(/:root/g, sel).replace(/&/g, sel);
}

export function alignToCss(alignment: string): 'left' | 'center' | 'right' {
  if (alignment === 'center' || alignment === 'right') return alignment;
  return 'left';
}
