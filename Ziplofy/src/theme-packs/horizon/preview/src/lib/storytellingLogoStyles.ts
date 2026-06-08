import { cfgBool, cfgNumber, cfgString } from './config';

export type StorytellingLogoScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, StorytellingLogoScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type StorytellingLogoLayout = {
  scheme: StorytellingLogoScheme;
  logoFont: 'body' | 'subheading' | 'heading' | 'accent';
  sizeUnit: 'pixel' | 'percent';
  pixelHeight: number;
  percentWidth: number;
  customMobileSize: boolean;
  mobileSizeUnit: 'pixel' | 'percent';
  mobilePixelHeight: number;
  mobilePercentWidth: number;
  sectionWidth: 'page' | 'full';
  layoutAlignment: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

function readSizeUnit(config: Record<string, unknown> | null, settingsBase: string): 'pixel' | 'percent' {
  const raw = cfgString(config, `${settingsBase}.sizeUnit`, '');
  if (raw === 'pixel' || raw === 'percent') return raw;
  return 'pixel';
}

export function readStorytellingLogoLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): StorytellingLogoLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const scheme = SCHEMES[schemeKey] ?? SCHEMES['scheme-1'];
  const widthRaw = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const alignRaw = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const fontRaw = cfgString(config, `${settingsBase}.logoFont`, 'heading');

  let pixelHeight = cfgNumber(config, `${settingsBase}.pixelHeight`, 0);
  if (pixelHeight <= 0) {
    const legacyHeight = cfgString(config, `${settingsBase}.height`, '');
    pixelHeight =
      legacyHeight === 'small' ? 32 : legacyHeight === 'large' ? 64 : legacyHeight === 'auto' ? 40 : 48;
  }

  return {
    scheme,
    logoFont:
      fontRaw === 'body' || fontRaw === 'subheading' || fontRaw === 'accent' ? fontRaw : 'heading',
    sizeUnit: readSizeUnit(config, settingsBase),
    pixelHeight,
    percentWidth: cfgNumber(config, `${settingsBase}.percentWidth`, 100),
    customMobileSize: cfgBool(config, `${settingsBase}.customMobileSize`, false),
    mobileSizeUnit:
      cfgString(config, `${settingsBase}.mobileSizeUnit`) === 'pixel' ? 'pixel' : 'percent',
    mobilePixelHeight: cfgNumber(config, `${settingsBase}.mobilePixelHeight`, 120),
    mobilePercentWidth: cfgNumber(config, `${settingsBase}.mobilePercentWidth`, 100),
    sectionWidth: widthRaw === 'full' ? 'full' : 'page',
    layoutAlignment:
      alignRaw === 'left' || alignRaw === 'right' ? alignRaw : 'center',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 32),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 32),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function storytellingLogoJustify(alignment: string): string {
  if (alignment === 'left') return 'flex-start';
  if (alignment === 'right') return 'flex-end';
  return 'center';
}

export function storytellingLogoSizeVars(style: StorytellingLogoLayout): CSSPropertiesLike {
  const desktopHeight =
    style.sizeUnit === 'pixel' ? `${style.pixelHeight}px` : undefined;
  const desktopWidth =
    style.sizeUnit === 'percent' ? `${style.percentWidth}%` : undefined;
  const mobileHeight = style.customMobileSize
    ? style.mobileSizeUnit === 'pixel'
      ? `${style.mobilePixelHeight}px`
      : undefined
    : desktopHeight;
  const mobileWidth =
    style.customMobileSize && style.mobileSizeUnit === 'percent'
      ? `${style.mobilePercentWidth}%`
      : desktopWidth;

  return {
    ...(desktopHeight ? { '--logo-height': desktopHeight } : {}),
    ...(desktopWidth ? { '--logo-width': desktopWidth } : {}),
    ...(mobileHeight ? { '--logo-height-mobile': mobileHeight } : {}),
    ...(mobileWidth ? { '--logo-width-mobile': mobileWidth } : {}),
  };
}

type CSSPropertiesLike = Record<string, string>;

export function scopedStorytellingLogoCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-storytelling-logo-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
