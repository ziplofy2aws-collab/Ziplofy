import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type ContactFormScheme = {
  background: string;
  color: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  buttonBg: string;
  buttonColor: string;
};

const SCHEMES: Record<string, ContactFormScheme> = {
  'scheme-1': {
    background: '#ffffff',
    color: '#111827',
    border: '#d1d5db',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    buttonBg: '#111827',
    buttonColor: '#ffffff',
  },
  'scheme-2': {
    background: '#eff6ff',
    color: '#0f172a',
    border: '#bfdbfe',
    inputBg: '#ffffff',
    inputBorder: '#93c5fd',
    buttonBg: '#1e3a5f',
    buttonColor: '#ffffff',
  },
  'scheme-3': {
    background: '#fff7ed',
    color: '#431407',
    border: '#fed7aa',
    inputBg: '#ffffff',
    inputBorder: '#fdba74',
    buttonBg: '#431407',
    buttonColor: '#ffffff',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    border: '#ddd6fe',
    inputBg: '#ffffff',
    inputBorder: '#c4b5fd',
    buttonBg: '#4c1d95',
    buttonColor: '#ffffff',
  },
};

const HEIGHT_MIN: Record<string, number | undefined> = {
  auto: undefined,
  small: 320,
  medium: 480,
  large: 640,
};

export type ContactFormLayout = {
  direction: 'vertical' | 'horizontal';
  alignment: 'left' | 'center' | 'right';
  position: 'top' | 'center' | 'bottom';
  gap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  minHeight?: number;
  colorScheme: ContactFormScheme;
  backgroundColor: string;
  backgroundMedia: 'none' | 'image';
  backgroundImageUrl: string;
  borderStyle: 'none' | 'solid';
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readContactFormLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): ContactFormLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const height = cfgString(config, `${settingsBase}.height`, 'auto');
  const direction = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const alignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const positionRaw = cfgString(config, `${settingsBase}.position`, 'center');

  return {
    direction: direction === 'horizontal' ? 'horizontal' : 'vertical',
    alignment: alignment === 'left' || alignment === 'right' ? alignment : 'center',
    position: positionRaw === 'top' || positionRaw === 'bottom' ? positionRaw : 'center',
    gap: cfgNumber(config, `${settingsBase}.layoutGap`, 32),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeight: HEIGHT_MIN[height],
    colorScheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    backgroundColor: cfgString(config, `${settingsBase}.backgroundColor`, ''),
    backgroundMedia:
      cfgString(config, `${settingsBase}.backgroundMedia`, 'none') === 'image' ? 'image' : 'none',
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none') === 'solid' ? 'solid' : 'none',
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 32),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 32),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export type ContactFormHeadingSettings = {
  width: 'fit' | 'fill';
  maxWidth: string;
  alignment: 'left' | 'center' | 'right';
  preset: string;
  font: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textCase: string;
  wrap: string;
  color: string;
  backgroundEnabled: boolean;
  backgroundColor: string;
  cornerRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readContactFormHeading(
  config: Record<string, unknown> | null,
  settingsBase: string
): ContactFormHeadingSettings {
  const width = cfgString(config, `${settingsBase}.headingWidth`, 'fill');
  const alignment = cfgString(config, `${settingsBase}.headingAlignment`, 'center');
  return {
    width: width === 'fit' ? 'fit' : 'fill',
    maxWidth: cfgString(config, `${settingsBase}.headingMaxWidth`, 'normal'),
    alignment: alignment === 'left' || alignment === 'right' ? alignment : 'center',
    preset: cfgString(config, `${settingsBase}.headingTypographyPreset`, 'default'),
    font: cfgString(config, `${settingsBase}.headingFont`, 'heading'),
    fontSize: cfgString(config, `${settingsBase}.headingFontSize`, 'default'),
    lineHeight: cfgString(config, `${settingsBase}.headingLineHeight`, 'normal'),
    letterSpacing: cfgString(config, `${settingsBase}.headingLetterSpacing`, 'normal'),
    textCase: cfgString(config, `${settingsBase}.headingTextCase`, 'default'),
    wrap: cfgString(config, `${settingsBase}.headingWrap`, 'pretty'),
    color: cfgString(config, `${settingsBase}.headingColor`, ''),
    backgroundEnabled: cfgBool(config, `${settingsBase}.headingBackgroundEnabled`, false),
    backgroundColor: cfgString(config, `${settingsBase}.headingBackgroundColor`, ''),
    cornerRadius: cfgNumber(config, `${settingsBase}.headingCornerRadius`, 0),
    paddingTop: cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0),
  };
}

export type ContactFormFormGroupSettings = {
  desktopWidth: 'fit' | 'custom';
  desktopCustomWidth: number;
  mobileWidth: 'fit' | 'custom';
  mobileCustomWidth: number;
  backgroundColor: string;
  inputStyle: 'default' | 'custom';
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readContactFormFormGroup(
  config: Record<string, unknown> | null,
  settingsBase: string
): ContactFormFormGroupSettings {
  const desktopWidth = cfgString(config, `${settingsBase}.formDesktopWidth`, 'fit');
  const mobileWidth = cfgString(config, `${settingsBase}.formMobileWidth`, 'fit');
  const inputStyle = cfgString(config, `${settingsBase}.formInputStyle`, 'default');
  return {
    desktopWidth: desktopWidth === 'custom' ? 'custom' : 'fit',
    desktopCustomWidth: cfgNumber(config, `${settingsBase}.formDesktopCustomWidth`, 50),
    mobileWidth: mobileWidth === 'custom' ? 'custom' : 'fit',
    mobileCustomWidth: cfgNumber(config, `${settingsBase}.formMobileCustomWidth`, 100),
    backgroundColor: cfgString(config, `${settingsBase}.formBackgroundColor`, ''),
    inputStyle: inputStyle === 'custom' ? 'custom' : 'default',
    paddingTop: cfgNumber(config, `${settingsBase}.formPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.formPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.formPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.formPaddingRight`, 0),
  };
}

export type ContactFormSubmitButtonSettings = {
  style: 'primary' | 'secondary';
  desktopWidth: 'fit' | 'custom';
  desktopCustomWidth: number;
  mobileWidth: 'fit' | 'custom';
  mobileCustomWidth: number;
};

export function readContactFormSubmitButton(
  config: Record<string, unknown> | null,
  settingsBase: string
): ContactFormSubmitButtonSettings {
  const style = cfgString(config, `${settingsBase}.submitStyle`, 'primary');
  const desktopWidth = cfgString(config, `${settingsBase}.submitDesktopWidth`, 'fit');
  const mobileWidth = cfgString(config, `${settingsBase}.submitMobileWidth`, 'fit');
  return {
    style: style === 'secondary' ? 'secondary' : 'primary',
    desktopWidth: desktopWidth === 'custom' ? 'custom' : 'fit',
    desktopCustomWidth: cfgNumber(config, `${settingsBase}.submitDesktopCustomWidth`, 50),
    mobileWidth: mobileWidth === 'custom' ? 'custom' : 'fit',
    mobileCustomWidth: cfgNumber(config, `${settingsBase}.submitMobileCustomWidth`, 100),
  };
}

export function scopedContactFormCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-codiic-section="${sectionId}"]`);
}
