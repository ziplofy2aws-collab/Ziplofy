import type { CSSProperties } from 'react';
import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

const TEXT_TYPOGRAPHY_PRESETS: Record<
  string,
  { fontSize: number; fontWeight: number; lineHeight: number; fontFamilyKey: 'heading' | 'body' }
> = {
  default: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  paragraph: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  body: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  'heading-1': { fontSize: 32, fontWeight: 600, lineHeight: 1.15, fontFamilyKey: 'heading' },
  'heading-2': { fontSize: 28, fontWeight: 600, lineHeight: 1.2, fontFamilyKey: 'heading' },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25, fontFamilyKey: 'heading' },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3, fontFamilyKey: 'heading' },
  'heading-5': { fontSize: 18, fontWeight: 600, lineHeight: 1.35, fontFamilyKey: 'heading' },
  'heading-6': { fontSize: 14, fontWeight: 600, lineHeight: 1.4, fontFamilyKey: 'heading' },
};

const TEXT_MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '280px',
  normal: '100%',
  wide: '100%',
  none: undefined,
};

export function readFaqTextBlockStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  themeFonts: { fontHeading: string; fontBody: string },
  color: string
): CSSProperties {
  const preset = cfgString(config, `${settingsBase}.typographyPreset`, 'default');
  const typo = TEXT_TYPOGRAPHY_PRESETS[preset] ?? TEXT_TYPOGRAPHY_PRESETS.default;
  const widthMode = cfgString(config, `${settingsBase}.width`, 'fill');
  const maxKey = cfgString(config, `${settingsBase}.maxWidth`, 'normal');
  const alignment = cfgString(config, `${settingsBase}.alignment`, 'left');
  const bgOn = cfgBool(config, `${settingsBase}.backgroundEnabled`, false);

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: TEXT_MAX_WIDTH[maxKey] ?? TEXT_MAX_WIDTH.normal,
    textAlign: alignment === 'center' || alignment === 'right' ? alignment : 'left',
    fontFamily: typo.fontFamilyKey === 'heading' ? themeFonts.fontHeading : themeFonts.fontBody,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    color,
    background: bgOn ? 'rgba(0,0,0,0.04)' : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
    borderRadius: bgOn ? 6 : 0,
    boxSizing: 'border-box',
  };
}

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

export type FaqTextBlock = {
  id: string;
  text: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  answerTextBlockId: string;
  textBlocks: FaqTextBlock[];
  openByDefault: boolean;
  rowImageIconUrl: string;
  rowIconWidth: number;
};

function isFaqBlockEnabled(block: Record<string, unknown> | null | undefined): boolean {
  if (!block || typeof block !== 'object') return false;
  return (block as { enabled?: boolean }).enabled !== false;
}

function readAccordionRowTextBlocks(block: Record<string, unknown>): FaqTextBlock[] {
  const nestedBlocks = (block.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(block.block_order)
    ? (block.block_order as string[])
    : Object.keys(nestedBlocks);
  const blocks: FaqTextBlock[] = [];
  for (const id of order) {
    const nested = nestedBlocks[id];
    if (!nested || nested.type !== 'text' || !isFaqBlockEnabled(nested)) continue;
    const settings = (nested.settings ?? {}) as Record<string, unknown>;
    blocks.push({ id, text: String(settings.text ?? '') });
  }
  if (blocks.length) return blocks;
  const settings = (block.settings ?? {}) as Record<string, unknown>;
  const legacy = String(settings.answer ?? '').trim();
  if (legacy) return [{ id: 'text', text: legacy }];
  return [{ id: 'text', text: '' }];
}

export function isFaqHeadingBlockEnabled(
  config: Record<string, unknown> | null,
  sectionBase: string
): boolean {
  const heading = getThemeConfigValue(config, `${sectionBase}.blocks.heading`) as
    | Record<string, unknown>
    | null;
  if (!heading) return true;
  return isFaqBlockEnabled(heading);
}

export function isFaqAccordionBlockEnabled(
  config: Record<string, unknown> | null,
  sectionBase: string
): boolean {
  const accordion = getThemeConfigValue(config, `${sectionBase}.blocks.accordion`) as
    | Record<string, unknown>
    | null;
  if (!accordion) return true;
  return isFaqBlockEnabled(accordion);
}

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
  const accordionBase = settingsBase.replace(/\.settings$/, '.blocks.accordion.settings');
  const openFirstItem =
    cfgBool(config, `${accordionBase}.openFirstItem`, false) ||
    cfgBool(config, `${settingsBase}.openFirstItem`, false);

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    layoutAlignment:
      alignRaw === 'center' || alignRaw === 'right' ? alignRaw : 'left',
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 32),
    openFirstItem,
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

const ACCORDION_TYPOGRAPHY_PRESETS: Record<
  string,
  { fontSize: number; fontWeight: number; lineHeight: number; fontFamilyKey: 'heading' | 'body' }
> = {
  default: { fontSize: 16, fontWeight: 400, lineHeight: 1.4, fontFamilyKey: 'body' },
  paragraph: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  body: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  'heading-1': { fontSize: 40, fontWeight: 700, lineHeight: 1.15, fontFamilyKey: 'heading' },
  'heading-2': { fontSize: 32, fontWeight: 600, lineHeight: 1.2, fontFamilyKey: 'heading' },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25, fontFamilyKey: 'heading' },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3, fontFamilyKey: 'heading' },
  'heading-5': { fontSize: 18, fontWeight: 600, lineHeight: 1.35, fontFamilyKey: 'heading' },
  'heading-6': { fontSize: 14, fontWeight: 600, lineHeight: 1.4, fontFamilyKey: 'heading' },
};

export type FaqAccordionStyle = {
  icon: 'caret' | 'plus';
  dividers: boolean;
  headingTypographyPreset: string;
  inheritColorScheme: boolean;
  borderStyle: string;
  cornerRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  openFirstItem: boolean;
};

export function readFaqAccordionStyle(
  config: Record<string, unknown> | null,
  accordionSettingsBase: string
): FaqAccordionStyle {
  const iconRaw = cfgString(config, `${accordionSettingsBase}.icon`, 'caret');
  return {
    icon: iconRaw === 'plus' ? 'plus' : 'caret',
    dividers: cfgBool(config, `${accordionSettingsBase}.dividers`, true),
    headingTypographyPreset: cfgString(
      config,
      `${accordionSettingsBase}.headingTypographyPreset`,
      'heading-5'
    ),
    inheritColorScheme: cfgBool(config, `${accordionSettingsBase}.inheritColorScheme`, false),
    borderStyle: cfgString(config, `${accordionSettingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${accordionSettingsBase}.cornerRadius`, 0),
    paddingTop: cfgNumber(config, `${accordionSettingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${accordionSettingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${accordionSettingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${accordionSettingsBase}.paddingRight`, 0),
    openFirstItem: cfgBool(config, `${accordionSettingsBase}.openFirstItem`, false),
  };
}

export function accordionQuestionTypography(
  preset: string,
  themeFonts: { fontHeading: string; fontBody: string }
): Pick<CSSProperties, 'fontSize' | 'fontWeight' | 'lineHeight' | 'fontFamily'> {
  const typo = ACCORDION_TYPOGRAPHY_PRESETS[preset] ?? ACCORDION_TYPOGRAPHY_PRESETS['heading-5'];
  return {
    fontFamily: typo.fontFamilyKey === 'heading' ? themeFonts.fontHeading : themeFonts.fontBody,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
  };
}

export function readFaqHeading(
  config: Record<string, unknown> | null,
  sectionBase: string,
  settingsBase: string
): string {
  const blocksBase = `${sectionBase}.blocks`;
  const title = cfgString(config, `${settingsBase}.title`, '');
  const blockHeading = cfgString(config, `${blocksBase}.heading.settings.heading`, '');
  const legacyText = cfgString(config, `${blocksBase}.heading.settings.text`, '');
  const legacySectionHeading = cfgString(config, `${settingsBase}.heading`, '');
  if (title.trim()) return title;
  if (blockHeading.trim()) return blockHeading;
  if (legacyText.trim()) return legacyText;
  if (legacySectionHeading.trim()) return legacySectionHeading;
  return 'Frequently asked questions';
}

function readLegacyFaqItems(
  config: Record<string, unknown> | null,
  sectionBase: string,
  blockOrder: string[]
): FaqItem[] {
  const blocksMap = getThemeConfigValue(config, `${sectionBase}.blocks`) as
    | Record<string, Record<string, unknown>>
    | null;
  if (!blocksMap) return [];
  const ids = blockOrder.length ? blockOrder : Object.keys(blocksMap);
  return ids
    .map((id) => {
      const block = blocksMap[id];
      if (!block || block.type !== 'faq-item') return null;
      const settings = (block.settings ?? {}) as Record<string, unknown>;
      const question = String(settings.question ?? '').trim();
      if (!question) return null;
      const textBlocks = [{ id, text: String(settings.answer ?? '') }];
      return {
        id,
        question,
        answer: textBlocks[0]?.text ?? '',
        answerTextBlockId: 'text',
        textBlocks,
        openByDefault: false,
        rowImageIconUrl: '',
        rowIconWidth: 20,
      };
    })
    .filter((x): x is FaqItem => x != null);
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

  const sectionRecord = getThemeConfigValue(config, sectionBase) as Record<string, unknown> | null;
  const blocksMap = (sectionRecord?.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const accordionBlock = blocksMap.accordion as
    | { blocks?: Record<string, Record<string, unknown>>; block_order?: string[] }
    | undefined;

  if (accordionBlock?.blocks) {
    const order = Array.isArray(accordionBlock.block_order)
      ? accordionBlock.block_order
      : Object.keys(accordionBlock.blocks);
    return order
      .map((id) => {
        const block = accordionBlock.blocks?.[id];
        if (!block || !isFaqBlockEnabled(block)) return null;
        const settings = (block.settings ?? {}) as Record<string, unknown>;
        const question = String(settings.heading ?? settings.question ?? '').trim();
        if (!question) return null;
        const textBlocks = readAccordionRowTextBlocks(block);
        const primary = textBlocks[0];
        return {
          id,
          question,
          answer: primary?.text ?? '',
          answerTextBlockId: primary?.id ?? 'text',
          textBlocks,
          openByDefault: Boolean(settings.openByDefault),
          rowImageIconUrl: String(settings.rowImageIconUrl ?? ''),
          rowIconWidth: Number(settings.rowIconWidth ?? 20) || 20,
        };
      })
      .filter((x): x is FaqItem => x != null);
  }

  const sectionOrder = Array.isArray(sectionRecord?.block_order)
    ? (sectionRecord!.block_order as string[])
    : Object.keys(blocksMap);
  return readLegacyFaqItems(config, sectionBase, sectionOrder);
}

export function scopedFaqCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-faq-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}
