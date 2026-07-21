import { getThemeConfigValue } from '@render-store/sdk';
import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type ProductHotspotsScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, ProductHotspotsScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type ProductHotspotData = {
  id: string;
  positionX: number;
  positionY: number;
  productId: string;
  productTitle: string;
  price: string;
  productImageUrl: string;
};

export type ProductHotspotsHeadingStyle = {
  width: string;
  maxWidth: string;
  typographyPreset: string;
  font: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textCase: string;
  wrap: string;
  color: string;
  backgroundEnabled: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export type ProductHotspotsLayout = {
  scheme: ProductHotspotsScheme;
  heading: string;
  headingStyle: ProductHotspotsHeadingStyle;
  imageUrl: string;
  mediaOverlay: boolean;
  sectionWidth: 'page' | 'full';
  sectionHeight: 'auto' | 'small' | 'medium' | 'large';
  hotspotColor: string;
  innerColor: string;
  popoverGap: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readProductHotspotsLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): ProductHotspotsLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const sectionHeight = cfgString(config, `${settingsBase}.sectionHeight`, 'auto');

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    heading: cfgString(config, `${settingsBase}.heading`),
    headingStyle: {
      width: cfgString(config, `${settingsBase}.headingWidth`, 'fit'),
      maxWidth: cfgString(config, `${settingsBase}.headingMaxWidth`, 'normal'),
      typographyPreset: cfgString(config, `${settingsBase}.headingTypographyPreset`, 'heading-4'),
      font: cfgString(config, `${settingsBase}.headingFont`, 'heading'),
      fontSize: cfgString(config, `${settingsBase}.headingFontSize`, 'default'),
      lineHeight: cfgString(config, `${settingsBase}.headingLineHeight`, 'normal'),
      letterSpacing: cfgString(config, `${settingsBase}.headingLetterSpacing`, 'normal'),
      textCase: cfgString(config, `${settingsBase}.headingTextCase`, 'default'),
      wrap: cfgString(config, `${settingsBase}.headingWrap`, 'pretty'),
      color: cfgString(config, `${settingsBase}.headingColor`, 'default'),
      backgroundEnabled: cfgBool(config, `${settingsBase}.headingBackgroundEnabled`, false),
      paddingTop: cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0),
      paddingBottom: cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0),
      paddingLeft: cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0),
      paddingRight: cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0),
    },
    imageUrl: cfgString(config, `${settingsBase}.imageUrl`, ''),
    mediaOverlay: Boolean(getThemeConfigValue(config, `${settingsBase}.mediaOverlay`)),
    sectionWidth: sectionWidth === 'full' ? 'full' : 'page',
    sectionHeight:
      sectionHeight === 'small' || sectionHeight === 'medium' || sectionHeight === 'large'
        ? sectionHeight
        : 'auto',
    hotspotColor: cfgString(config, `${settingsBase}.hotspotColor`, '#FFFFFF57'),
    innerColor: cfgString(config, `${settingsBase}.innerColor`, '#FFFFFF'),
    popoverGap: cfgNumber(config, `${settingsBase}.popoverGap`, 8),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function sceneMinHeight(height: ProductHotspotsLayout['sectionHeight']): string | undefined {
  if (height === 'small') return '320px';
  if (height === 'medium') return '420px';
  if (height === 'large') return '520px';
  return undefined;
}

export function headingMaxWidthPx(mode: string): number | undefined {
  if (mode === 'narrow') return 360;
  if (mode === 'none') return undefined;
  return 520;
}

export function productHotspotsHeadingCss(
  heading: ProductHotspotsHeadingStyle,
  schemeColor: string,
  fontHeading: string
): CSSProperties {
  const preset = heading.typographyPreset === 'body' ? 'paragraph' : heading.typographyPreset;
  const PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
    default: { fontSize: 28, fontWeight: 700, lineHeight: 1.25 },
    paragraph: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
    'heading-1': { fontSize: 48, fontWeight: 700, lineHeight: 1.1 },
    'heading-2': { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
    'heading-3': { fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
    'heading-4': { fontSize: 28, fontWeight: 600, lineHeight: 1.25 },
    'heading-5': { fontSize: 22, fontWeight: 600, lineHeight: 1.3 },
    'heading-6': { fontSize: 18, fontWeight: 600, lineHeight: 1.35 },
  };

  let typo: CSSProperties;
  if (preset === 'custom') {
    const sizePx =
      heading.fontSize && heading.fontSize !== 'default'
        ? Number.parseInt(heading.fontSize, 10)
        : NaN;
    typo = {
      fontFamily: fontHeading,
      fontSize: Number.isFinite(sizePx) ? sizePx : 28,
      fontWeight: heading.font === 'body' ? 400 : 700,
      lineHeight:
        heading.lineHeight === 'tight' ? 1.1 : heading.lineHeight === 'loose' ? 1.55 : 1.35,
      letterSpacing:
        heading.letterSpacing === 'tight'
          ? '-0.02em'
          : heading.letterSpacing === 'loose'
            ? '0.06em'
            : 'normal',
      textTransform:
        heading.textCase === 'uppercase'
          ? 'uppercase'
          : heading.textCase === 'lowercase'
            ? 'lowercase'
            : heading.textCase === 'capitalize'
              ? 'capitalize'
              : 'none',
      textWrap:
        heading.wrap === 'balance'
          ? 'balance'
          : heading.wrap === 'nowrap'
            ? 'nowrap'
            : 'pretty',
    };
  } else {
    const p = PRESETS[preset] ?? PRESETS['heading-4'];
    typo = {
      fontFamily: fontHeading,
      fontSize: p.fontSize,
      fontWeight: p.fontWeight,
      lineHeight: p.lineHeight,
    };
  }

  return {
    margin: '0 0 20px',
    ...typo,
    width: heading.width === 'fill' ? '100%' : 'fit-content',
    maxWidth: headingMaxWidthPx(heading.maxWidth),
    color: heading.color === '' || heading.color === 'default' ? schemeColor : heading.color,
    background: heading.backgroundEnabled ? 'rgba(0,0,0,0.04)' : undefined,
    borderRadius: heading.backgroundEnabled ? 8 : undefined,
    paddingTop: heading.paddingTop || undefined,
    paddingBottom: heading.paddingBottom || undefined,
    paddingLeft: heading.paddingLeft || undefined,
    paddingRight: heading.paddingRight || undefined,
    boxSizing: 'border-box',
  };
}

export function readProductHotspots(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): ProductHotspotData[] {
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

  return ids
    .map((id) => {
      const block = blocksMap[id] as
        | { enabled?: boolean; settings?: Record<string, unknown> }
        | undefined;
      if (!block || block.enabled === false) return null;
      const settings = block.settings ?? {};
      return {
        id,
        positionX: Number(settings.positionX ?? 50),
        positionY: Number(settings.positionY ?? 50),
        productId: String(settings.productId ?? ''),
        productTitle: String(settings.productTitle ?? 'Product title'),
        price: String(settings.price ?? 'Rs. 19.99'),
        productImageUrl: String(settings.productImageUrl ?? ''),
      };
    })
    .filter((h): h is ProductHotspotData => Boolean(h));
}

export function scopedProductHotspotsCss(sectionId: string, customCss: string): string {
  const scope = `.codiic-product-hotspots-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
