import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type CollectionListEditorialScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, CollectionListEditorialScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type CollectionListEditorialLayout = {
  scheme: CollectionListEditorialScheme;
  heading: string;
  collectionCount: number;
  carouselOnMobile: boolean;
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readCollectionListEditorialLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionListEditorialLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`, 'Shop by collection'),
    collectionCount: Math.min(8, Math.max(1, cfgNumber(config, `${settingsBase}.collectionCount`, 4))),
    carouselOnMobile: cfgBool(config, `${settingsBase}.carouselOnMobile`, false),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 12),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 24),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 24),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedCollectionListEditorialCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-collection-list-editorial-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function editorialTilePlacement(index: number): {
  gridColumn: string;
  marginTop: number;
  minHeight: number;
  wideIllustration: boolean;
} {
  const mod = index % 4;
  if (mod === 0) {
    return { gridColumn: '1', marginTop: 0, minHeight: 200, wideIllustration: false };
  }
  if (mod === 1) {
    return { gridColumn: '2', marginTop: 56, minHeight: 200, wideIllustration: false };
  }
  return { gridColumn: '1 / -1', marginTop: 0, minHeight: mod === 2 ? 160 : 180, wideIllustration: true };
}
