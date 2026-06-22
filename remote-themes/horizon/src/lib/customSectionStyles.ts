import { cfgBool, cfgNumber, cfgString } from './config';

export type CustomSectionScheme = {
  background: string;
  color: string;
  border: string;
};

const SCHEMES: Record<string, CustomSectionScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', border: '#d1d5db' },
  'scheme-2': { background: '#f8fafc', color: '#0f172a', border: '#93c5fd' },
  'scheme-3': { background: '#fff7ed', color: '#431407', border: '#fdba74' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', border: '#c4b5fd' },
};

const HEIGHT_MIN: Record<string, number | undefined> = {
  auto: 120,
  small: 280,
  medium: 480,
  large: 640,
};

export type CustomSectionStyle = {
  direction: 'vertical' | 'horizontal';
  alignment: 'left' | 'center' | 'right';
  position: 'top' | 'center' | 'bottom';
  gap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  minHeight: number;
  colorScheme: CustomSectionScheme;
  backgroundMedia: 'none' | 'image';
  backgroundImageUrl: string;
  borderStyle: 'none' | 'solid';
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readCustomSectionStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): CustomSectionStyle {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const height = cfgString(config, `${settingsBase}.height`, 'small');
  const direction = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const alignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'left');
  const legacyMinHeight = cfgNumber(config, `${settingsBase}.minHeight`, 0);
  const heightMin = HEIGHT_MIN[height];

  return {
    direction: direction === 'horizontal' ? 'horizontal' : 'vertical',
    alignment: alignment === 'left' || alignment === 'right' ? alignment : 'center',
    position: (['top', 'bottom'].includes(cfgString(config, `${settingsBase}.position`, 'center'))
      ? cfgString(config, `${settingsBase}.position`, 'center')
      : 'center') as 'top' | 'center' | 'bottom',
    gap: cfgNumber(config, `${settingsBase}.layoutGap`, 12),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeight: heightMin ?? (legacyMinHeight > 0 ? legacyMinHeight : HEIGHT_MIN.small ?? 280),
    colorScheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none') === 'image' ? 'image' : 'none',
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none') === 'solid' ? 'solid' : 'none',
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedCustomSectionCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
