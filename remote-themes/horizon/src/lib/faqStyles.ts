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

function resolveFaqScheme(value: string): FaqScheme {
  const fallback = SCHEMES['scheme-1']!;
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value) ? value : '';
  if (hex) {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isLight = luminance > 0.6;
    return {
      background: hex,
      color: isLight ? '#111827' : '#ffffff',
      muted: isLight ? '#4b5563' : 'rgba(255,255,255,0.72)',
      border: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
    };
  }
  return SCHEMES[value] ?? fallback;
}

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const HEIGHT_VH: Record<string, number> = {
  auto: 0,
  small: 40,
  medium: 60,
  large: 80,
  'full-screen': 100,
};

function resolveFaqMinHeight(heightKey: string, customHeightPercent: number): string | undefined {
  if (heightKey === 'custom') {
    const pct = Math.min(Math.max(customHeightPercent, 0), 100);
    return pct > 0 ? `${pct}vh` : undefined;
  }
  const vh = HEIGHT_VH[heightKey] ?? 0;
  return vh > 0 ? `${vh}vh` : undefined;
}

export type FaqLayout = {
  scheme: FaqScheme;
  direction: 'vertical' | 'horizontal';
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  layoutGap: number;
  openFirstItem: boolean;
  sectionWidth: 'page' | 'full';
  height: string;
  customHeight: number;
  minHeight: string | undefined;
  backgroundMedia: string;
  backgroundImageUrl: string;
  borderStyle: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  overlayColor: string;
  overlayStyle: 'solid' | 'gradient';
  overlayGradientDirection: 'up' | 'down';
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
  const customHeight = cfgNumber(config, `${settingsBase}.customHeight`, 50);
  return {
    scheme: resolveFaqScheme(schemeKey),
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    layoutAlignment:
      alignRaw === 'center' || alignRaw === 'right' ? alignRaw : 'left',
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 32),
    openFirstItem: cfgBool(config, `${settingsBase}.openFirstItem`, false),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    customHeight,
    minHeight: resolveFaqMinHeight(height, customHeight),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    overlayColor: cfgString(config, `${settingsBase}.overlayColor`, '#00000066'),
    overlayStyle:
      cfgString(config, `${settingsBase}.overlayStyle`, 'solid') === 'gradient' ? 'gradient' : 'solid',
    overlayGradientDirection:
      cfgString(config, `${settingsBase}.overlayGradientDirection`, 'up') === 'down' ? 'down' : 'up',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function faqOverlayBackground(
  style: Pick<FaqLayout, 'overlayColor' | 'overlayStyle' | 'overlayGradientDirection'>
): string {
  if (style.overlayStyle === 'gradient') {
    return style.overlayGradientDirection === 'down'
      ? `linear-gradient(180deg, transparent 0%, ${style.overlayColor} 100%)`
      : `linear-gradient(180deg, ${style.overlayColor} 0%, transparent 100%)`;
  }
  return style.overlayColor;
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
  const scope = `.codiic-faq-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
