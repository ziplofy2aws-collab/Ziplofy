import { cfgBool, cfgNumber, cfgString } from './config';

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
    background: '#f0f4f8',
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

  return {
    direction: direction === 'horizontal' ? 'horizontal' : 'vertical',
    alignment: alignment === 'left' || alignment === 'right' ? alignment : 'center',
    position: (['top', 'bottom'].includes(cfgString(config, `${settingsBase}.position`, 'center'))
      ? cfgString(config, `${settingsBase}.position`, 'center')
      : 'center') as 'top' | 'center' | 'bottom',
    gap: cfgNumber(config, `${settingsBase}.layoutGap`, 32),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeight: HEIGHT_MIN[height],
    colorScheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none') === 'image' ? 'image' : 'none',
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none') === 'solid' ? 'solid' : 'none',
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 32),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 32),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedContactFormCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
