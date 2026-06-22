import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';
import type { CollectionIllustrationVariant } from './CollectionBentoIllustrations';

export type CollectionListBentoScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, CollectionListBentoScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type CollectionTileData = {
  id: string;
  title: string;
  href: string;
  illustrationVariant: CollectionIllustrationVariant;
  columnSpan: 1 | 2;
  imageUrl: string;
};

export type CollectionListBentoLayout = {
  scheme: CollectionListBentoScheme;
  heading: string;
  cardsLayoutType: 'bento' | 'carousel' | 'editorial' | 'grid';
  carouselOnMobile: boolean;
  cardsGap: number;
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

function parseIllustration(raw: string): CollectionIllustrationVariant {
  if (
    raw === 'hanger-shirts' ||
    raw === 'hanging-sweaters' ||
    raw === 'clothing-rack' ||
    raw === 'folded-shirts'
  ) {
    return raw;
  }
  return 'folded-shirts';
}

export function readCollectionListBentoLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionListBentoLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const cardsLayout = cfgString(config, `${settingsBase}.cardsLayoutType`);
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`),
    cardsLayoutType:
      cardsLayout === 'carousel' || cardsLayout === 'editorial' || cardsLayout === 'grid'
        ? cardsLayout
        : 'bento',
    carouselOnMobile: Boolean(getThemeConfigValue(config, `${settingsBase}.carouselOnMobile`)),
    cardsGap: cfgNumber(config, `${settingsBase}.cardsGap`, 8),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 12),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 24),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 24),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function readCollectionTiles(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): CollectionTileData[] {
  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const blocksPath = `${sectionBase}.blocks`;
  const order =
    placement === 'template'
      ? templateBlockOrder(config, templateId, sectionId, [])
      : layoutBlockOrder(config, sectionId, []);
  const blocksMap = getThemeConfigValue(config, blocksPath) as
    | Record<string, { settings?: Record<string, unknown> }>
    | null;
  if (!blocksMap || typeof blocksMap !== 'object') return [];

  const ids = order.length ? order : Object.keys(blocksMap);

  return ids.map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    const span = Number(settings.columnSpan ?? 1);
    return {
      id,
      title: String(settings.title ?? ''),
      href: String(settings.href ?? ''),
      illustrationVariant: parseIllustration(String(settings.illustrationVariant ?? 'folded-shirts')),
      columnSpan: span === 2 ? 2 : 1,
      imageUrl: String(settings.imageUrl ?? ''),
    };
  });
}

export function scopedCollectionListBentoCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-collection-list-bento-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
