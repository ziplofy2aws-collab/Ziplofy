import { cfgBool, cfgString } from '../../runtime/shared/config';

export type FeaturedProductReviewStarsStyle = {
  style: 'shaded' | 'default';
  reviewCount: boolean;
  color: 'text' | 'link';
  typographyPreset: string;
  width: 'fit' | 'fill';
  alignment: 'left' | 'center' | 'right';
};

export function readFeaturedProductReviewStarsStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): FeaturedProductReviewStarsStyle {
  const rawStyle = cfgString(config, `${settingsBase}.style`, 'shaded');
  const rawColor = cfgString(config, `${settingsBase}.color`, 'link');
  const rawWidth = cfgString(config, `${settingsBase}.width`, 'fill');
  const rawAlign = cfgString(config, `${settingsBase}.alignment`, 'left');
  return {
    style: rawStyle === 'default' ? 'default' : 'shaded',
    reviewCount: cfgBool(config, `${settingsBase}.reviewCount`, true),
    color: rawColor === 'text' ? 'text' : 'link',
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
