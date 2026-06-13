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
