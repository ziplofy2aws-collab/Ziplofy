import { cfgNumber, cfgString } from './config';

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
    motionDirection: motion === 'reverse' ? 'reverse' : 'forward',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 24),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 24),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 24),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedTextMarqueeCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-text-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function textMarqueeKeyframes(scopeClass: string, direction: 'forward' | 'reverse'): string {
  return `
    @keyframes ${scopeClass}-marquee-forward {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes ${scopeClass}-marquee-reverse {
      from { transform: translateX(-50%); }
      to { transform: translateX(0); }
    }
    .${scopeClass}__track {
      animation: ${scopeClass}-marquee-${direction} 32s linear infinite;
    }
  `;
}
