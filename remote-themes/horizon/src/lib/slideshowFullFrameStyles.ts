import { getThemeConfigValue } from '@render-store/sdk';
import { cfgNumber, cfgString } from './config';
import {
  readLayeredSlideshowSlides,
  type LayeredSlideshowSlide,
} from './layeredSlideshowStyles';

export type SlideshowFullFrameScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, SlideshowFullFrameScheme> = {
  'scheme-1': { background: '#ddd6c8', color: '#ffffff', muted: 'rgba(255,255,255,0.92)' },
  'scheme-2': { background: '#1e3a5f', color: '#ffffff', muted: 'rgba(255,255,255,0.9)' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

export type SlideshowFullFrameLayout = {
  scheme: SlideshowFullFrameScheme;
  sectionWidth: 'page' | 'full';
  mediaHeight: 'small' | 'medium' | 'large';
  contentPosition: 'on-media' | 'below-media';
  navigationIcon: 'large-arrows' | 'arrows' | 'chevron' | 'none';
  navigationIconBackground: 'none' | 'circle' | 'square';
  pagination: 'dots' | 'counter' | 'none';
  autoRotate: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export type SlideshowFullFrameSlide = LayeredSlideshowSlide;

export function readSlideshowFullFrameLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): SlideshowFullFrameLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const mediaHeight = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'full');
  const contentPosition = cfgString(config, `${settingsBase}.contentPosition`, 'on-media');
  const navigationIcon = cfgString(config, `${settingsBase}.navigationIcon`, 'large-arrows');
  const navigationIconBackground = cfgString(
    config,
    `${settingsBase}.navigationIconBackground`,
    'none'
  );
  const pagination = cfgString(config, `${settingsBase}.pagination`);

  const iconBg =
    navigationIconBackground === 'circle' || navigationIconBackground === 'square'
      ? navigationIconBackground
      : 'none';

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    sectionWidth: sectionWidth === 'page' ? 'page' : 'full',
    mediaHeight:
      mediaHeight === 'small' || mediaHeight === 'large' ? mediaHeight : 'medium',
    contentPosition: contentPosition === 'below-media' ? 'below-media' : 'on-media',
    navigationIcon:
      navigationIcon === 'arrows' ||
      navigationIcon === 'chevron' ||
      navigationIcon === 'none'
        ? navigationIcon
        : 'large-arrows',
    navigationIconBackground: iconBg,
    pagination:
      pagination === 'counter' || pagination === 'none' ? pagination : 'dots',
    autoRotate: Boolean(getThemeConfigValue(config, `${settingsBase}.autoRotate`)),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function slideshowFullFrameMediaHeight(height: SlideshowFullFrameLayout['mediaHeight']): number {
  if (height === 'small') return 420;
  if (height === 'large') return 640;
  return 520;
}

export function readSlideshowFullFrameSlides(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): SlideshowFullFrameSlide[] {
  return readLayeredSlideshowSlides(config, templateId, sectionId, placement);
}

export function scopedSlideshowFullFrameCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-slideshow-full-frame-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
