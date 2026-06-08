import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import {
  readLayeredSlideshowSlides,
  type LayeredSlideshowSlide,
} from './layeredSlideshowStyles';

export type SlideshowInsetScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, SlideshowInsetScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type SlideshowInsetLayout = {
  scheme: SlideshowInsetScheme;
  gap: number;
  cornerRadius: number;
  fullWidthOnMobile: boolean;
  mediaHeight: 'small' | 'medium' | 'large';
  contentPosition: 'on-media' | 'below-media';
  navigationIcon: 'large-arrows' | 'arrows' | 'chevron' | 'none';
  navigationIconBackground: 'none' | 'circle' | 'square';
  pagination: 'dots' | 'counter' | 'none';
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export type SlideshowInsetSlide = LayeredSlideshowSlide;

export function readSlideshowInsetLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): SlideshowInsetLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const mediaHeight = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  const contentPosition = cfgString(config, `${settingsBase}.contentPosition`);
  const navigationIcon = cfgString(config, `${settingsBase}.navigationIcon`, 'large-arrows');
  const navigationIconBackground = cfgString(
    config,
    `${settingsBase}.navigationIconBackground`,
    'none'
  );
  const pagination = cfgString(config, `${settingsBase}.pagination`, 'none');

  const iconBg =
    navigationIconBackground === 'circle' || navigationIconBackground === 'square'
      ? navigationIconBackground
      : 'none';

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    gap: cfgNumber(config, `${settingsBase}.gap`, 18),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 20),
    fullWidthOnMobile: Boolean(getThemeConfigValue(config, `${settingsBase}.fullWidthOnMobile`)),
    mediaHeight:
      mediaHeight === 'small' || mediaHeight === 'large' ? mediaHeight : 'medium',
    contentPosition: contentPosition === 'on-media' ? 'on-media' : 'below-media',
    navigationIcon:
      navigationIcon === 'arrows' ||
      navigationIcon === 'chevron' ||
      navigationIcon === 'none'
        ? navigationIcon
        : 'large-arrows',
    navigationIconBackground: iconBg,
    pagination:
      pagination === 'dots' || pagination === 'counter' ? pagination : 'none',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function slideshowInsetMediaHeight(height: SlideshowInsetLayout['mediaHeight']): number {
  if (height === 'small') return 280;
  if (height === 'large') return 440;
  return 360;
}

export function readSlideshowInsetSlides(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): SlideshowInsetSlide[] {
  return readLayeredSlideshowSlides(config, templateId, sectionId, placement);
}

export function scopedSlideshowInsetCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-slideshow-inset-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
