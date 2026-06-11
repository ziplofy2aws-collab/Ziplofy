import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type CollectionListGridScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, CollectionListGridScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type CollectionListGridLayout = {
  scheme: CollectionListGridScheme;
  heading: string;
  columns: number;
  mobileColumns: 1 | 2;
  horizontalGap: number;
  verticalGap: number;
  carouselOnMobile: boolean;
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readCollectionListGridLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionListGridLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const mobileCols = cfgString(config, `${settingsBase}.mobileColumns`, '2');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`, 'Shop by collection'),
    columns: Math.min(6, Math.max(1, cfgNumber(config, `${settingsBase}.columns`, 4))),
    mobileColumns: mobileCols === '1' ? 1 : 2,
    horizontalGap: cfgNumber(config, `${settingsBase}.horizontalGap`, 8),
    verticalGap: cfgNumber(config, `${settingsBase}.verticalGap`, 8),
    carouselOnMobile: cfgBool(config, `${settingsBase}.carouselOnMobile`, false),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 12),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 24),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 24),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedCollectionListGridCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-collection-list-grid-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
