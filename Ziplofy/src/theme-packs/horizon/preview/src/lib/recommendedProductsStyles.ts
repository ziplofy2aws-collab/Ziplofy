import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type RecommendedProductsScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, RecommendedProductsScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type RecommendedProductCardData = {
  id: string;
  shirtColor: string;
  withSun: boolean;
  productTitle: string;
  price: string;
};

export type RecommendedProductsLayout = {
  scheme: RecommendedProductsScheme;
  heading: string;
  cardStyle: 'grid' | 'carousel';
  carouselOnMobile: boolean;
  productCount: number;
  columns: number;
  mobileColumns: 1 | 2;
  horizontalGap: number;
  verticalGap: number;
  sectionWidth: 'page' | 'full';
  layoutGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readRecommendedProductsLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): RecommendedProductsLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const cardStyle = cfgString(config, `${settingsBase}.cardStyle`, 'grid');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const mobile = cfgString(config, `${settingsBase}.mobileColumns`, '2');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`),
    cardStyle: cardStyle === 'carousel' ? 'carousel' : 'grid',
    carouselOnMobile: Boolean(getThemeConfigValue(config, `${settingsBase}.carouselOnMobile`)),
    productCount: cfgNumber(config, `${settingsBase}.productCount`, 4),
    columns: cfgNumber(config, `${settingsBase}.columns`, 4),
    mobileColumns: mobile === '1' ? 1 : 2,
    horizontalGap: cfgNumber(config, `${settingsBase}.horizontalGap`, 12),
    verticalGap: cfgNumber(config, `${settingsBase}.verticalGap`, 24),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 28),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function readRecommendedProductCards(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template',
  productCount: number
): RecommendedProductCardData[] {
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
  const limit = Math.max(1, Math.min(12, productCount));

  return ids.slice(0, limit).map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    return {
      id,
      shirtColor: String(settings.shirtColor ?? '#d45454'),
      withSun: Boolean(settings.withSun),
      productTitle: String(settings.productTitle ?? ''),
      price: String(settings.price ?? ''),
    };
  });
}

export function scopedRecommendedProductsCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-recommended-products-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
