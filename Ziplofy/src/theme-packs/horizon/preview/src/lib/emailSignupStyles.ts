import { cfgBool, cfgNumber, cfgString } from './config';

export type EmailSignupScheme = {
  background: string;
  color: string;
  border: string;
  muted: string;
  inputBg: string;
  inputBorder: string;
  buttonColor: string;
};

const SCHEMES: Record<string, EmailSignupScheme> = {
  'scheme-1': {
    background: '#f6f6f7',
    color: '#111827',
    border: '#d1d5db',
    muted: '#6b7280',
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    buttonColor: '#111827',
  },
  'scheme-2': {
    background: '#eff6ff',
    color: '#0f172a',
    border: '#93c5fd',
    muted: '#475569',
    inputBg: '#ffffff',
    inputBorder: '#93c5fd',
    buttonColor: '#1e3a5f',
  },
  'scheme-3': {
    background: '#fff7ed',
    color: '#431407',
    border: '#fdba74',
    muted: '#9a3412',
    inputBg: '#ffffff',
    inputBorder: '#fdba74',
    buttonColor: '#431407',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    border: '#c4b5fd',
    muted: '#5b21b6',
    inputBg: '#ffffff',
    inputBorder: '#c4b5fd',
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

  return {
    direction: direction === 'horizontal' ? 'horizontal' : 'vertical',
    alignment: alignment === 'left' || alignment === 'right' ? alignment : 'center',
    position: (['top', 'bottom'].includes(cfgString(config, `${settingsBase}.position`, 'center'))
      ? cfgString(config, `${settingsBase}.position`, 'center')
      : 'center') as 'top' | 'center' | 'bottom',
    gap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeight: HEIGHT_MIN[height],
    colorScheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none') === 'image' ? 'image' : 'none',
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none') === 'solid' ? 'solid' : 'none',
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedEmailSignupCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
