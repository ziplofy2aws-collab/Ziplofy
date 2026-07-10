import { cfgBool, cfgNumber, cfgString } from './config';

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
  const colorKey = cfgString(config, `${settingsBase}.priceColor`, 'text');
  const color =
    colorKey === 'heading'
      ? colors.heading
      : colorKey === 'accent'
        ? colors.accent
        : colorKey === 'muted'
          ? colors.muted
          : colors.text;
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
