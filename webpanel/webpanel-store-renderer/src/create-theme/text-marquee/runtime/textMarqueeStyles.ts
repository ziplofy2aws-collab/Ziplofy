import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type TextMarqueeScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, TextMarqueeScheme> = {
  'scheme-1': { background: '#f6f6f7', color: '#111827' },
  'scheme-2': { background: '#ffffff', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type TextMarqueeLayout = {
  scheme: TextMarqueeScheme;
  backgroundColor: string;
  motionDirection: 'forward' | 'reverse';
  paddingTop: number;
  paddingBottom: number;
  layoutGap: number;
  customCss: string;
};

export function readTextMarqueeLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): TextMarqueeLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const motion = cfgString(config, `${settingsBase}.motionDirection`, 'forward');
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    backgroundColor: cfgString(config, `${settingsBase}.backgroundColor`, ''),
    motionDirection: motion === 'reverse' ? 'reverse' : 'forward',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 24),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 24),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 24),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export type TextMarqueeTextSettings = {
  width: string;
  maxWidth: string;
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

export function readTextMarqueeTextSettings(
  config: Record<string, unknown> | null,
  settingsBase: string
): TextMarqueeTextSettings {
  return {
    width: cfgString(config, `${settingsBase}.mqWidth`, 'fit'),
    maxWidth: cfgString(config, `${settingsBase}.mqMaxWidth`, 'normal'),
    preset: cfgString(config, `${settingsBase}.mqTypographyPreset`, 'default'),
    font: cfgString(config, `${settingsBase}.mqFont`, 'body'),
    fontSize: cfgString(config, `${settingsBase}.mqFontSize`, 'default'),
    lineHeight: cfgString(config, `${settingsBase}.mqLineHeight`, 'normal'),
    letterSpacing: cfgString(config, `${settingsBase}.mqLetterSpacing`, 'normal'),
    textCase: cfgString(config, `${settingsBase}.mqTextCase`, 'default'),
    wrap: cfgString(config, `${settingsBase}.mqWrap`, 'pretty'),
    color: cfgString(config, `${settingsBase}.mqColor`, ''),
    backgroundEnabled: cfgBool(config, `${settingsBase}.mqBackgroundEnabled`, false),
    backgroundColor: cfgString(config, `${settingsBase}.mqBackgroundColor`, ''),
    cornerRadius: cfgNumber(config, `${settingsBase}.mqCornerRadius`, 0),
    paddingTop: cfgNumber(config, `${settingsBase}.mqPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.mqPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.mqPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.mqPaddingRight`, 0),
  };
}

export function scopedTextMarqueeCss(sectionId: string, customCss: string): string {
  const scope = `.codiic-text-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function textMarqueeKeyframes(scopeClass: string, direction: 'forward' | 'reverse'): string {
  const forward = `${scopeClass}__track`;
  return `
    @keyframes ${scopeClass}-marquee-forward {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes ${scopeClass}-marquee-reverse {
      from { transform: translateX(-50%); }
      to { transform: translateX(0); }
    }
    .${forward} {
      animation: ${scopeClass}-marquee-${direction} 32s linear infinite;
    }
  `;
}
