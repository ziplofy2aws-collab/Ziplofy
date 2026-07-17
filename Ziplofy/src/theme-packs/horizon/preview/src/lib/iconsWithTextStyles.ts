import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type IconsWithTextScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, IconsWithTextScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#111827' },
  'scheme-2': { background: '#ffffff', color: '#111827', muted: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#475569' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#5b21b6' },
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
  backgroundMedia: string;
  backgroundImageUrl: string;
  backgroundColor: string;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
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
  const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'left');
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
    height: cfgString(config, `${settingsBase}.height`, 'auto'),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    backgroundColor: cfgString(config, `${settingsBase}.backgroundColor`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${settingsBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${settingsBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${settingsBase}.borderColor`, 'default'),
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
  const scope = `.codiic-icons-with-text-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, '');
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Build CSS border from Style / Thickness / Opacity / Color (Shopify-style). */
export function resolveIconsWithTextBorderCss(
  borderStyle: string,
  thickness: number,
  opacity: number,
  borderColorHex: string,
  schemeBorder: string
): string | undefined {
  if (borderStyle !== 'solid' || thickness <= 0) return undefined;
  const base = borderColorHex?.startsWith('#') ? borderColorHex : schemeBorder;
  const rgb = hexToRgb(base);
  const alpha = Math.min(100, Math.max(0, opacity)) / 100;
  if (!rgb) return `${thickness}px solid ${schemeBorder}`;
  return `${thickness}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function iconsWithTextMobileStackCss(sectionId: string): string {
  const scope = `.codiic-icons-with-text-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  return `@media (max-width: 749px) { ${scope} { grid-template-columns: 1fr !important; } }`;
}
