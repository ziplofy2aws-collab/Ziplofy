import { cfgBool, cfgNumber, cfgString } from './config';

export type StorytellingVideoScheme = {
  background: string;
  color: string;
  muted: string;
  mediaPanel: string;
};

const SCHEMES: Record<string, StorytellingVideoScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#4b5563', mediaPanel: '#f0f0f0' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#4b5563', mediaPanel: '#ececec' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#475569', mediaPanel: '#e8eef2' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#5b21b6', mediaPanel: '#ede9fe' },
};

const HEIGHT_PX: Record<string, number> = {
  auto: 0,
  small: 320,
  medium: 420,
  large: 520,
};

export type StorytellingVideoLayout = {
  scheme: StorytellingVideoScheme;
  direction: 'vertical' | 'horizontal';
  layoutAlignment: string;
  position: string;
  layoutGap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  backgroundMedia: string;
  backgroundImageUrl: string;
  borderStyle: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
  videoOnRight: boolean;
};

function readHeight(config: Record<string, unknown> | null, settingsBase: string): string {
  const raw = cfgString(config, `${settingsBase}.height`, '');
  if (raw === 'auto' || raw === 'small' || raw === 'medium' || raw === 'large') return raw;
  return 'auto';
}

export function readStorytellingVideoLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): StorytellingVideoLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const directionRaw = cfgString(config, `${settingsBase}.direction`, '');
  const direction: 'vertical' | 'horizontal' =
    directionRaw === 'horizontal' ? 'horizontal' : 'vertical';

  let videoOnRight = true;
  if (!directionRaw) {
    const legacyPos = cfgString(config, `${settingsBase}.mediaPosition`, 'right');
    videoOnRight = legacyPos !== 'left';
  } else if (direction === 'horizontal') {
    const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'left');
    videoOnRight = align === 'right';
  }

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction,
    layoutAlignment: cfgString(config, `${settingsBase}.layoutAlignment`, 'left'),
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height: readHeight(config, settingsBase),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 32),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 32),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
    videoOnRight,
  };
}

export function storytellingVideoMinHeight(height: string): number | undefined {
  const px = HEIGHT_PX[height] ?? 0;
  return px > 0 ? px : undefined;
}

export function alignItemsForPosition(position: string): 'flex-start' | 'center' | 'flex-end' {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}

export function justifyContentForAlignment(alignment: string): string {
  if (alignment === 'right') return 'flex-end';
  if (alignment === 'center') return 'center';
  return 'flex-start';
}

export function scopedStorytellingVideoCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-storytelling-video-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
