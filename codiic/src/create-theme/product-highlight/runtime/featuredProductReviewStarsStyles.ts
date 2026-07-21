import { cfgBool, cfgString } from '../../runtime/shared/config';

export type FeaturedProductReviewStarsStyle = {
  style: 'shaded' | 'default';
  reviewCount: boolean;
  textColor: string;
  typographyPreset: string;
  width: 'fit' | 'fill';
  alignment: 'left' | 'center' | 'right';
};

export function resolveFeaturedProductReviewStarsTextColor(
  config: Record<string, unknown> | null,
  settingsBase: string,
  schemeColor: string,
  themeAccent: string
): string {
  const textColor = cfgString(config, `${settingsBase}.textColor`, '');
  if (textColor && textColor !== 'default') return textColor;

  const legacyColor = cfgString(config, `${settingsBase}.color`, '');
  if (legacyColor === 'link') return themeAccent;
  if (legacyColor === 'text') return schemeColor;

  return schemeColor;
}

export function readFeaturedProductReviewStarsStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  schemeColor = '#111827',
  themeAccent = '#111827'
): FeaturedProductReviewStarsStyle {
  const rawStyle = cfgString(config, `${settingsBase}.style`, 'shaded');
  const rawWidth = cfgString(config, `${settingsBase}.width`, 'fill');
  const rawAlign = cfgString(config, `${settingsBase}.alignment`, 'left');
  return {
    style: rawStyle === 'default' ? 'default' : 'shaded',
    reviewCount: cfgBool(config, `${settingsBase}.reviewCount`, false),
    textColor: resolveFeaturedProductReviewStarsTextColor(
      config,
      settingsBase,
      schemeColor,
      themeAccent
    ),
    typographyPreset: cfgString(config, `${settingsBase}.typographyPreset`, 'paragraph'),
    width: rawWidth === 'fit' ? 'fit' : 'fill',
    alignment:
      rawAlign === 'center' ? 'center' : rawAlign === 'right' ? 'right' : 'left',
  };
}

export function reviewStarsTypography(
  preset: string,
  fontBody: string,
  fontHeading: string
): { fontFamily: string; fontSize: number; lineHeight: number } {
  switch (preset) {
    case 'heading-6':
      return { fontFamily: fontHeading, fontSize: 16, lineHeight: 1.35 };
    case 'heading-5':
      return { fontFamily: fontHeading, fontSize: 18, lineHeight: 1.35 };
    case 'body':
      return { fontFamily: fontBody, fontSize: 15, lineHeight: 1.5 };
    case 'default':
      return { fontFamily: fontBody, fontSize: 14, lineHeight: 1.45 };
    case 'paragraph':
    default:
      return { fontFamily: fontBody, fontSize: 14, lineHeight: 1.5 };
  }
}
