import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from './config';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';

export type FaqScheme = {
  background: string;
  color: string;
  muted: string;
  border: string;
};

const SCHEMES: Record<string, FaqScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#4b5563', border: '#e5e7eb' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#4b5563', border: '#e5e7eb' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#475569', border: '#cbd5e1' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#5b21b6', border: '#ddd6fe' },
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const HEIGHT_PX: Record<string, number> = {
  auto: 0,
  small: 260,
  medium: 320,
  large: 400,
};

export type FaqLayout = {
  scheme: FaqScheme;
  direction: 'vertical' | 'horizontal';
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  layoutGap: number;
  openFirstItem: boolean;
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

export function readFaqLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): FaqLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const dir = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const alignRaw =
    cfgString(config, `${settingsBase}.layoutAlignment`, '') ||
    cfgString(config, `${settingsBase}.headingAlignment`, 'left');
  const height = cfgString(config, `${settingsBase}.height`, 'auto');
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    layoutAlignment:
      alignRaw === 'center' || alignRaw === 'right' ? alignRaw : 'left',
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 32),
    openFirstItem: cfgBool(config, `${settingsBase}.openFirstItem`, false),
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

export function readFaqItems(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template'
): FaqItem[] {
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
      const question = String(settings.question ?? '').trim();
      if (!question) return null;
      return {
        id,
        question,
        answer: String(settings.answer ?? ''),
      };
    })
    .filter((x): x is FaqItem => x != null);
}

export function scopedFaqCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-faq-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
