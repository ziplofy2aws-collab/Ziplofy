import { cfgNumber, cfgString } from '../../runtime/shared/config';

export type CollectionListCarouselScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, CollectionListCarouselScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type CollectionListCarouselLayout = {
  scheme: CollectionListCarouselScheme;
  heading: string;
  columns: number;
  mobileColumns: 1 | 2;
  horizontalGap: number;
  navigationIcon: 'arrows' | 'chevron' | 'none';
  navigationIconBackground: 'none' | 'circle' | 'square';
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readCollectionListCarouselLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionListCarouselLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const navIcon = cfgString(config, `${settingsBase}.navigationIcon`, 'arrows');
  const navBg = cfgString(config, `${settingsBase}.navigationIconBackground`, 'none');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const mobileCols = cfgString(config, `${settingsBase}.mobileColumns`, '1');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`, 'Shop by collection'),
    columns: Math.min(6, Math.max(1, cfgNumber(config, `${settingsBase}.columns`, 4))),
    mobileColumns: mobileCols === '2' ? 2 : 1,
    horizontalGap: cfgNumber(config, `${settingsBase}.horizontalGap`, 8),
    navigationIcon: navIcon === 'chevron' || navIcon === 'none' ? navIcon : 'arrows',
    navigationIconBackground: navBg === 'square' || navBg === 'circle' ? navBg : 'none',
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 12),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 24),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 24),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedCollectionListCarouselCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-collection-list-carousel-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
