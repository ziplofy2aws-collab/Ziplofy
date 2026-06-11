import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { layoutBlockOrder, templateBlockOrder } from '../../runtime/shared/structureOrder';
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

const DEFAULT_TILES: CollectionTileData[] = [
  {
    id: 'tile_1',
    title: 'Collection title',
    href: '/collections/all',
    illustrationVariant: 'folded-shirts',
    columnSpan: 1,
    imageUrl: '',
  },
  {
    id: 'tile_2',
    title: 'Collection title',
    href: '/collections/all',
    illustrationVariant: 'hanger-shirts',
    columnSpan: 2,
    imageUrl: '',
  },
  {
    id: 'tile_3',
    title: 'Collection title',
    href: '/collections/all',
    illustrationVariant: 'hanging-sweaters',
    columnSpan: 2,
    imageUrl: '',
  },
  {
    id: 'tile_4',
    title: 'Collection title',
    href: '/collections/all',
    illustrationVariant: 'clothing-rack',
    columnSpan: 1,
    imageUrl: '',
  },
];

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
    heading: cfgString(config, `${settingsBase}.heading`, 'Shop by collection'),
    cardsLayoutType:
      cardsLayout === 'carousel' || cardsLayout === 'editorial' || cardsLayout === 'grid'
        ? cardsLayout
        : 'bento',
    carouselOnMobile: cfgBool(config, `${settingsBase}.carouselOnMobile`, false),
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
  if (!blocksMap || typeof blocksMap !== 'object') return DEFAULT_TILES;

  const ids = order.length ? order : Object.keys(blocksMap);
  if (!ids.length) return DEFAULT_TILES;

  return ids.map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    const span = Number(settings.columnSpan ?? 1);
    return {
      id,
      title: String(settings.title ?? 'Collection title'),
      href: String(settings.href ?? '/collections/all'),
      illustrationVariant: parseIllustration(String(settings.illustrationVariant ?? 'folded-shirts')),
      columnSpan: span === 2 ? 2 : 1,
      imageUrl: String(settings.imageUrl ?? ''),
    };
  });
}

export function sectionScopeClass(sectionId: string): string {
  return `ziplofy-collection-list-bento-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
}

export function scopedCollectionListBentoCss(sectionId: string, customCss: string): string {
  const scope = `.${sectionScopeClass(sectionId)}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function collectionListBentoMobileCarouselCss(
  sectionId: string,
  enabled: boolean
): string {
  if (!enabled) return '';
  const scope = `.${sectionScopeClass(sectionId)}`;
  return `@media (max-width: 749px) {
    ${scope} .ziplofy-bento-grid {
      display: flex !important;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      grid-template-columns: unset !important;
      grid-template-rows: unset !important;
      gap: 8px;
      padding-bottom: 4px;
    }
    ${scope} .ziplofy-bento-tile {
      flex: 0 0 min(78vw, 280px);
      scroll-snap-align: start;
      grid-column: unset !important;
      min-height: 200px !important;
    }
  }`;
}
