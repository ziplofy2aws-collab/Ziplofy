import { cfgBool, cfgNumber, cfgString } from './config';

function readPalette(config: Record<string, unknown> | null): string[] {
  const palette = (config?.settings as Record<string, unknown> | undefined)?.colors as
    | Record<string, unknown>
    | undefined;
  const raw = palette?.palette;
  if (Array.isArray(raw) && raw.length >= 2) {
    return raw.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
  }
  return ['#ffffff', '#111827'];
}

function resolvePriceColor(
  config: Record<string, unknown> | null,
  colorKey: string,
  colors: { text: string; heading: string; accent: string; muted: string }
): string {
  if (colorKey === '' || colorKey === 'default' || colorKey === 'text') return colors.text;
  if (colorKey.startsWith('#')) return colorKey;
  if (colorKey === 'palette' || /^palette:\d+$/.test(colorKey)) {
    const palette = readPalette(config);
    const match = /^palette:(\d+)$/.exec(colorKey);
    const index = match ? Number(match[1]) : 1;
    return palette[index] ?? colors.text;
  }
  if (colorKey === 'heading') return colors.heading;
  if (colorKey === 'accent') return colors.accent;
  if (colorKey === 'muted') return colors.muted;
  return colors.text;
}

const TYPOGRAPHY_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  default: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  'heading-6': { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  'heading-5': { fontSize: 16, fontWeight: 600, lineHeight: 1.35 },
  'heading-4': { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
};

export type ProductCardPriceStyle = {
  width: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  color: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  showSaleFirst: boolean;
  showInstallments: boolean;
  showTaxInfo: boolean;
};

export function readProductCardPriceStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fontBody: string,
  colors: { text: string; heading: string; accent: string; muted: string }
): ProductCardPriceStyle {
  const preset = cfgString(config, `${settingsBase}.priceTypographyPreset`);
  const typo = TYPOGRAPHY_PRESETS[preset] ?? TYPOGRAPHY_PRESETS['heading-6'];
  const widthMode = cfgString(config, `${settingsBase}.priceWidth`, 'fill');
  const align = cfgString(config, `${settingsBase}.priceAlignment`, 'left');
  const colorKey = cfgString(config, `${settingsBase}.priceColor`, '');
  const color = resolvePriceColor(config, colorKey, colors);
  const textAlign =
    align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    textAlign,
    fontFamily: fontBody,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    color,
    paddingTop: cfgNumber(config, `${settingsBase}.pricePaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.pricePaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.pricePaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.pricePaddingRight`, 0),
    showSaleFirst: cfgBool(config, `${settingsBase}.priceShowSaleFirst`, true),
    showInstallments: cfgBool(config, `${settingsBase}.priceInstallments`, false),
    showTaxInfo: cfgBool(config, `${settingsBase}.priceTaxInfo`, false),
  };
}

export function formatProductCardPrice(
  price: number,
  compareAtPrice: number | null | undefined,
  style: ProductCardPriceStyle,
  format: (n: number) => string
): { primary: string; compareAt?: string } {
  const onSale =
    compareAtPrice != null && compareAtPrice > price && Number.isFinite(compareAtPrice);
  if (style.showSaleFirst && onSale) {
    return { primary: format(price), compareAt: format(compareAtPrice) };
  }
  if (onSale && !style.showSaleFirst) {
    return { primary: format(compareAtPrice), compareAt: format(price) };
  }
  return { primary: format(price) };
}
