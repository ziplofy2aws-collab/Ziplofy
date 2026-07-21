import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import type { FooterScheme } from './footerStyles';

const HEADING_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  'heading-1': { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  'heading-2': { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
};

const INPUT_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  ...HEADING_PRESETS,
  paragraph: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 },
};

export type NewsletterBlockStyle = {
  blockWidth: 'fill' | 'custom';
  inheritColorScheme: boolean;
  colors: FooterScheme;
  heading: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    color: string;
    margin: string;
  };
  input: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    color: string;
    background: string;
    borderStyle: 'all' | 'none';
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
  };
  submit: {
    style: 'link' | 'button';
    display: 'text' | 'arrow';
    integrated: boolean;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

export function readNewsletterBlockStyle(
  config: Record<string, unknown> | null,
  newsletterBase: string,
  sectionScheme: FooterScheme,
  fonts: { fontHeading: string; fontBody: string },
  themeColors: { text: string; background: string; primary: string }
): NewsletterBlockStyle {
  const inheritColorScheme = cfgBool(config, `${newsletterBase}.inheritColorScheme`, true);
  const colors: FooterScheme = inheritColorScheme
    ? sectionScheme
    : {
        background: themeColors.background,
        color: themeColors.text,
        border: 'rgba(17, 24, 39, 0.12)',
      };

  const headingPreset = cfgString(config, `${newsletterBase}.headingTypographyPreset`, 'heading-3');
  const headingTypo = HEADING_PRESETS[headingPreset] ?? HEADING_PRESETS['heading-3'];

  const inputPreset = cfgString(config, `${newsletterBase}.inputTypographyPreset`, 'paragraph');
  const inputTypo = INPUT_PRESETS[inputPreset] ?? INPUT_PRESETS.paragraph;

  const inputBorder = cfgString(config, `${newsletterBase}.inputBorder`, 'all');
  const borderWidth = Math.max(0, cfgNumber(config, `${newsletterBase}.inputBorderThickness`, 1));
  const borderRadius = Math.max(0, cfgNumber(config, `${newsletterBase}.inputCornerRadius`, 100));

  const blockWidth = cfgString(config, `${newsletterBase}.blockWidth`, 'fill') === 'custom' ? 'custom' : 'fill';

  return {
    blockWidth,
    inheritColorScheme,
    colors,
    heading: {
      fontFamily: fonts.fontHeading,
      fontSize: headingTypo.fontSize,
      fontWeight: headingTypo.fontWeight,
      lineHeight: headingTypo.lineHeight,
      color: colors.color,
      margin: '0 0 16px',
    },
    input: {
      fontFamily: fonts.fontBody,
      fontSize: inputTypo.fontSize,
      fontWeight: inputTypo.fontWeight,
      lineHeight: inputTypo.lineHeight,
      color: colors.color,
      background: colors.background,
      borderStyle: inputBorder === 'none' ? 'none' : 'all',
      borderWidth,
      borderColor: colors.border,
      borderRadius,
    },
    submit: {
      style: cfgString(config, `${newsletterBase}.submitStyle`, 'button') === 'link' ? 'link' : 'button',
      display: cfgString(config, `${newsletterBase}.submitDisplay`, 'text') === 'arrow' ? 'arrow' : 'text',
      integrated: cfgBool(config, `${newsletterBase}.submitIntegratedButton`, false),
    },
    padding: {
      top: cfgNumber(config, `${newsletterBase}.paddingTop`, 0),
      right: cfgNumber(config, `${newsletterBase}.paddingRight`, 0),
      bottom: cfgNumber(config, `${newsletterBase}.paddingBottom`, 0),
      left: cfgNumber(config, `${newsletterBase}.paddingLeft`, 0),
    },
  };
}
