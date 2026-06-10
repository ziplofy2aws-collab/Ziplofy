import type { CSSProperties } from 'react';
import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { mobileMedia } from '../../runtime/shared/responsive';
import { layoutBlockOrder, templateBlockOrder } from '../../runtime/shared/structureOrder';

export type IconsWithTextScheme = {
  background: string;
  color: string;
};

const SCHEMES: Record<string, IconsWithTextScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#ffffff', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

export type IconWithTextItem = {
  id: string;
  icon: string;
  heading: string;
  text: string;
};

export type IconsWithTextLayout = {
  scheme: IconsWithTextScheme;
  direction: 'vertical' | 'horizontal';
  verticalOnMobile: boolean;
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  columns: number;
  layoutGap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  minHeightPx: number;
  backgroundMedia: string;
  backgroundImageUrl: string;
  borderStyle: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

const HEIGHT_PX: Record<string, number> = {
  auto: 0,
  small: 260,
  medium: 320,
  large: 400,
};

export function justifyItemsForAlignment(
  alignment: string
): 'start' | 'center' | 'end' {
  if (alignment === 'right') return 'end';
  if (alignment === 'center') return 'center';
  return 'start';
}

export function alignContentForPosition(position: string): 'start' | 'center' | 'end' {
  if (position === 'top') return 'start';
  if (position === 'bottom') return 'end';
  return 'center';
}

export function readIconsWithTextLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): IconsWithTextLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const dir = cfgString(config, `${settingsBase}.direction`, 'horizontal');
  const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const height = cfgString(config, `${settingsBase}.height`, 'auto');
  const cols = cfgNumber(config, `${settingsBase}.columns`, 3);
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'vertical' ? 'vertical' : 'horizontal',
    verticalOnMobile: cfgBool(config, `${settingsBase}.verticalOnMobile`, false),
    layoutAlignment: align === 'left' || align === 'right' ? align : 'center',
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    columns: Math.min(4, Math.max(2, cols)),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 32),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeightPx: HEIGHT_PX[height] ?? 0,
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function readIconWithTextItems(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): IconWithTextItem[] {
  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const blocksPath = `${sectionBase}.blocks`;
  const order =
    placement === 'template'
      ? templateBlockOrder(config, templateId, sectionId, [])
      : layoutBlockOrder(config, sectionId, []);
  const blocksMap = getThemeConfigValue(config, blocksPath) as Record<string, Record<string, unknown>> | null;
  if (!blocksMap || typeof blocksMap !== 'object') return [];

  const ids = order.length ? order : Object.keys(blocksMap);
  return ids
    .map((id) => {
      const block = blocksMap[id];
      if (!block) return null;
      const settings = (block.settings ?? {}) as Record<string, unknown>;
      const heading = String(settings.heading ?? settings.title ?? '').trim();
      if (!heading) return null;
      return {
        id,
        icon: String(settings.icon ?? 'eye'),
        heading,
        text: String(settings.text ?? ''),
      };
    })
    .filter((x): x is IconWithTextItem => x != null);
}

export function scopedIconsWithTextCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-icons-with-text-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function iconsWithTextMobileStackCss(sectionId: string): string {
  const scope = `.ziplofy-icons-with-text-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  return mobileMedia(`${scope} { grid-template-columns: 1fr !important; }`);
}

export function columnTypography(fontBody: string): {
  heading: CSSProperties;
  text: CSSProperties;
} {
  return {
    heading: {
      margin: 0,
      fontFamily: fontBody,
      fontSize: 17,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    text: {
      margin: 0,
      fontFamily: fontBody,
      fontSize: 15,
      fontWeight: 400,
      lineHeight: 1.5,
    },
  };
}
