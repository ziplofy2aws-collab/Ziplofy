import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type EmailSignupScheme = {
  background: string;
  color: string;
  subtitleColor: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  placeholderColor: string;
  buttonColor: string;
};

const SCHEMES: Record<string, EmailSignupScheme> = {
  'scheme-1': {
    background: '#f6f6f7',
    color: '#111827',
    subtitleColor: '#6b7280',
    border: '#d1d5db',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    placeholderColor: '#9ca3af',
    buttonColor: '#374151',
  },
  'scheme-2': {
    background: '#eff6ff',
    color: '#0f172a',
    subtitleColor: '#64748b',
    border: '#bfdbfe',
    inputBg: '#ffffff',
    inputBorder: '#93c5fd',
    placeholderColor: '#94a3b8',
    buttonColor: '#1e3a5f',
  },
  'scheme-3': {
    background: '#fff7ed',
    color: '#431407',
    subtitleColor: '#9a3412',
    border: '#fed7aa',
    inputBg: '#ffffff',
    inputBorder: '#fdba74',
    placeholderColor: '#c2410c',
    buttonColor: '#431407',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    subtitleColor: '#6d28d9',
    border: '#ddd6fe',
    inputBg: '#ffffff',
    inputBorder: '#c4b5fd',
    placeholderColor: '#7c3aed',
    buttonColor: '#4c1d95',
  },
};

const HEIGHT_MIN: Record<string, number | undefined> = {
  auto: undefined,
  small: 280,
  medium: 400,
  large: 520,
};

export type EmailSignupLayout = {
  direction: 'vertical' | 'horizontal';
  alignment: 'left' | 'center' | 'right';
  position: 'top' | 'center' | 'bottom';
  gap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  minHeight?: number;
  colorScheme: EmailSignupScheme;
  backgroundMedia: 'none' | 'image';
  backgroundImageUrl: string;
  backgroundColor: string;
  borderStyle: 'none' | 'solid';
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readEmailSignupLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): EmailSignupLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const height = cfgString(config, `${settingsBase}.height`, 'auto');
  const direction = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const alignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const positionRaw = cfgString(config, `${settingsBase}.position`, 'center');

  return {
    direction: direction === 'horizontal' ? 'horizontal' : 'vertical',
    alignment: alignment === 'left' || alignment === 'right' ? alignment : 'center',
    position: positionRaw === 'top' || positionRaw === 'bottom' ? positionRaw : 'center',
    gap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeight: HEIGHT_MIN[height],
    colorScheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    backgroundMedia:
      cfgString(config, `${settingsBase}.backgroundMedia`, 'none') === 'image' ? 'image' : 'none',
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    backgroundColor: cfgString(config, `${settingsBase}.backgroundColor`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none') === 'solid' ? 'solid' : 'none',
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export type EmailSignupHeadingSettings = {
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

export function readEmailSignupHeading(
  config: Record<string, unknown> | null,
  settingsBase: string
): EmailSignupHeadingSettings {
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

export function readEmailSignupText(
  config: Record<string, unknown> | null,
  settingsBase: string
): EmailSignupHeadingSettings {
  const width = cfgString(config, `${settingsBase}.textWidth`, 'fill');
  const alignment = cfgString(config, `${settingsBase}.textAlignment`, 'center');
  return {
    width: width === 'fit' ? 'fit' : 'fill',
    maxWidth: cfgString(config, `${settingsBase}.textMaxWidth`, 'normal'),
    alignment: alignment === 'left' || alignment === 'right' ? alignment : 'center',
    preset: cfgString(config, `${settingsBase}.textTypographyPreset`, 'paragraph'),
    font: cfgString(config, `${settingsBase}.textFont`, 'body'),
    fontSize: cfgString(config, `${settingsBase}.textFontSize`, 'default'),
    lineHeight: cfgString(config, `${settingsBase}.textLineHeight`, 'normal'),
    letterSpacing: cfgString(config, `${settingsBase}.textLetterSpacing`, 'normal'),
    textCase: cfgString(config, `${settingsBase}.textTextCase`, 'default'),
    wrap: cfgString(config, `${settingsBase}.textWrap`, 'pretty'),
    color: cfgString(config, `${settingsBase}.textColor`, ''),
    backgroundEnabled: cfgBool(config, `${settingsBase}.textBackgroundEnabled`, false),
    backgroundColor: cfgString(config, `${settingsBase}.textBackgroundColor`, ''),
    cornerRadius: cfgNumber(config, `${settingsBase}.textCornerRadius`, 0),
    paddingTop: cfgNumber(config, `${settingsBase}.textPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.textPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.textPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.textPaddingRight`, 0),
  };
}

export type EmailSignupFormSettings = {
  width: 'fill' | 'custom';
  customWidth: number;
  headingText: string;
  headingColor: string;
  headingPreset: string;
  inputBorder: 'all' | 'bottom' | 'none';
  inputStyle: 'default' | 'custom';
  submitStyle: 'primary' | 'secondary' | 'link';
  submitLinkColor: string;
  submitDisplay: 'text' | 'arrow';
  integratedButton: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readEmailSignupForm(
  config: Record<string, unknown> | null,
  settingsBase: string
): EmailSignupFormSettings {
  const width = cfgString(config, `${settingsBase}.signupWidth`, 'fill');
  const inputBorder = cfgString(config, `${settingsBase}.signupInputBorder`, 'all');
  const submitStyle = cfgString(config, `${settingsBase}.signupSubmitStyle`, 'link');
  const submitDisplay = cfgString(config, `${settingsBase}.signupSubmitDisplay`, 'arrow');
  const inputStyle = cfgString(config, `${settingsBase}.signupInputStyle`, 'default');
  return {
    width: width === 'custom' ? 'custom' : 'fill',
    customWidth: cfgNumber(config, `${settingsBase}.signupCustomWidth`, 50),
    headingText: cfgString(config, `${settingsBase}.signupHeadingText`, ''),
    headingColor: cfgString(config, `${settingsBase}.signupHeadingColor`, ''),
    headingPreset: cfgString(config, `${settingsBase}.signupHeadingPreset`, 'heading-3'),
    inputBorder: inputBorder === 'bottom' ? 'bottom' : inputBorder === 'none' ? 'none' : 'all',
    inputStyle: inputStyle === 'custom' ? 'custom' : 'default',
    submitStyle:
      submitStyle === 'primary' ? 'primary' : submitStyle === 'secondary' ? 'secondary' : 'link',
    submitLinkColor: cfgString(config, `${settingsBase}.signupSubmitLinkColor`, ''),
    submitDisplay: submitDisplay === 'text' ? 'text' : 'arrow',
    integratedButton: cfgBool(config, `${settingsBase}.signupIntegratedButton`, true),
    paddingTop: cfgNumber(config, `${settingsBase}.signupPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.signupPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.signupPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.signupPaddingRight`, 0),
  };
}

export function scopedEmailSignupCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
