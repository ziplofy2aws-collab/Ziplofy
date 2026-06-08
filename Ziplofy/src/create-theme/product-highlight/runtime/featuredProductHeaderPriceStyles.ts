import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

const TYPOGRAPHY_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  default: { fontSize: 16, fontWeight: 400, lineHeight: 1.4 },
  'heading-6': { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
  'heading-5': { fontSize: 16, fontWeight: 600, lineHeight: 1.35 },
  'heading-4': { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
};

export type FeaturedProductHeaderPriceStyle = {
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
  showSalePriceFirst: boolean;
  showInstallments: boolean;
  showTaxInformation: boolean;
  marginTop: number;
  marginBottom: number;
};

export function readFeaturedProductHeaderPriceStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fontBody: string,
  colors: { text: string; heading: string; accent: string; muted: string }
): FeaturedProductHeaderPriceStyle {
  const preset = cfgString(config, `${settingsBase}.typographyPreset`, 'default');
  const typo = TYPOGRAPHY_PRESETS[preset] ?? TYPOGRAPHY_PRESETS.default;
  const widthMode = cfgString(config, `${settingsBase}.width`, 'fit');
  const align = cfgString(config, `${settingsBase}.alignment`, 'left');
  const colorKey = cfgString(config, `${settingsBase}.color`, 'text');
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
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
    showSalePriceFirst: cfgBool(config, `${settingsBase}.showSalePriceFirst`, false),
    showInstallments: cfgBool(config, `${settingsBase}.installments`, false),
    showTaxInformation: cfgBool(config, `${settingsBase}.taxInformation`, false),
    marginTop: 8,
    marginBottom: 0,
  };
}
