import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type MulticolumnScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, MulticolumnScheme> = {
  'scheme-1': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#475569' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#5b21b6' },
};

export type MulticolumnItem = {
  id: string;
  heading: string;
  text: string;
};

export type MulticolumnLayout = {
  scheme: MulticolumnScheme;
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
  borderStyle: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function justifyItemsForAlignment(alignment: string): 'start' | 'center' | 'end' {
  if (alignment === 'right') return 'end';
  if (alignment === 'center') return 'center';
  return 'start';
}

export function alignContentForPosition(position: string): 'start' | 'center' | 'end' {
  if (position === 'top') return 'start';
  if (position === 'bottom') return 'end';
  return 'center';
}

export function readMulticolumnLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): MulticolumnLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const dir = cfgString(config, `${settingsBase}.direction`, 'horizontal');
  const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const cols = cfgNumber(config, `${settingsBase}.columns`, 3);
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'vertical' ? 'vertical' : 'horizontal',
    verticalOnMobile: cfgBool(config, `${settingsBase}.verticalOnMobile`, true),
    layoutAlignment: align === 'left' || align === 'right' ? align : 'center',
    position: cfgString(config, `${settingsBase}.position`, 'top'),
    columns: Math.min(4, Math.max(2, cols)),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height: cfgString(config, `${settingsBase}.height`, 'auto'),
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

export function readMulticolumnItems(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): MulticolumnItem[] {
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
        heading,
        text: String(settings.text ?? ''),
      };
    })
    .filter((x): x is MulticolumnItem => x != null);
}

export function scopedMulticolumnCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-multicolumn-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function multicolumnMobileStackCss(sectionId: string): string {
  const scope = `.ziplofy-multicolumn-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  return `@media (max-width: 749px) { ${scope} { grid-template-columns: 1fr !important; } }`;
}
