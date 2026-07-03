import type { CSSProperties } from 'react';
import { getThemeConfigValue } from '@render-store/sdk';
import { readHeroHeadingText } from '../../hero/runtime/heroHeadingStyles';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import {
  resolveTextBlockTypographyStyle,
  resolveThemeTypographyStyle,
  type ThemeFonts,
} from '../../runtime/shared/themeTypographyRuntime';

const TEXT_MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '280px',
  normal: '100%',
  wide: '100%',
  none: undefined,
};

export function readFaqTextBlockStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  themeFonts: ThemeFonts,
  color: string
): CSSProperties {
  const preset = cfgString(config, `${settingsBase}.typographyPreset`, 'default');
  const typo = resolveTextBlockTypographyStyle(config, `${settingsBase}`, preset, themeFonts);
  const widthMode = cfgString(config, `${settingsBase}.width`, 'fill');
  const maxKey = cfgString(config, `${settingsBase}.maxWidth`, 'normal');
  const alignment = cfgString(config, `${settingsBase}.alignment`, 'left');
  const bgOn = cfgBool(config, `${settingsBase}.backgroundEnabled`, false);
  const textColorRaw = cfgString(config, `${settingsBase}.textColor`, 'default');
  const resolvedColor =
    !textColorRaw || textColorRaw === 'default' ? color : textColorRaw;
  const bgColor = cfgString(config, `${settingsBase}.backgroundColor`, '#00000026');
  const cornerRadius = cfgNumber(config, `${settingsBase}.cornerRadius`, 0);

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: TEXT_MAX_WIDTH[maxKey] ?? TEXT_MAX_WIDTH.normal,
    textAlign: alignment === 'center' || alignment === 'right' ? alignment : 'left',
    fontFamily: typo.fontFamily,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    fontStyle: typo.fontStyle,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing,
    textTransform: typo.textTransform,
    color: resolvedColor,
    ...(typo.textWrap ? { textWrap: typo.textWrap } : {}),
    background: bgOn ? bgColor || 'rgba(0,0,0,0.04)' : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
    borderRadius: bgOn ? cornerRadius : 0,
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
  rowIcon: string;
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

function isFaqSectionBlockInOrder(
  config: Record<string, unknown> | null,
  sectionBase: string,
  blockId: string
): boolean {
  const section = getThemeConfigValue(config, sectionBase) as Record<string, unknown> | null;
  const order = Array.isArray(section?.block_order) ? (section.block_order as string[]) : [];
  if (order.length) return order.includes(blockId);
  const blocks = (section?.blocks ?? {}) as Record<string, unknown>;
  return blockId in blocks;
}

export function readFaqSectionBlockOrder(
  config: Record<string, unknown> | null,
  sectionBase: string
): Array<'heading' | 'accordion'> {
  const section = getThemeConfigValue(config, sectionBase) as Record<string, unknown> | null;
  const order = Array.isArray(section?.block_order) ? (section.block_order as string[]) : [];
  const allowed = ['heading', 'accordion'] as const;
  const fromOrder = order.filter((id): id is 'heading' | 'accordion' =>
    allowed.includes(id as 'heading' | 'accordion')
  );
  if (fromOrder.length) return fromOrder;
  const blocks = (section?.blocks ?? {}) as Record<string, unknown>;
  return allowed.filter((id) => id in blocks);
}

export function isFaqHeadingBlockEnabled(
  config: Record<string, unknown> | null,
  sectionBase: string
): boolean {
  if (!isFaqSectionBlockInOrder(config, sectionBase, 'heading')) return false;
  const heading = getThemeConfigValue(config, `${sectionBase}.blocks.heading`) as
    | Record<string, unknown>
    | null;
  if (!heading) return false;
  return isFaqBlockEnabled(heading);
}

export function isFaqAccordionBlockEnabled(
  config: Record<string, unknown> | null,
  sectionBase: string
): boolean {
  if (!isFaqSectionBlockInOrder(config, sectionBase, 'accordion')) return false;
  const accordion = getThemeConfigValue(config, `${sectionBase}.blocks.accordion`) as
    | Record<string, unknown>
    | null;
  if (!accordion) return false;
  return isFaqBlockEnabled(accordion);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  return null;
}

export function resolveFaqBorderCss(
  borderStyle: string,
  thickness: number,
  opacity: number,
  borderColor: string,
  schemeBorder: string
): string | undefined {
  if (borderStyle !== 'solid' || thickness <= 0) return undefined;
  const base =
    !borderColor || borderColor === 'default'
      ? schemeBorder
      : borderColor.startsWith('#')
        ? borderColor
        : schemeBorder;
  const rgb = hexToRgb(base);
  const alpha = Math.min(100, Math.max(0, opacity)) / 100;
  if (!rgb) return `${thickness}px solid ${schemeBorder}`;
  return `${thickness}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Viewport-relative heights so every preset scales the same way as Full screen / Custom. */
const HEIGHT_VH: Record<string, number> = {
  auto: 0,
  small: 40,
  medium: 60,
  large: 80,
  'full-screen': 100,
};

/** Resolves the section min-height CSS for the chosen Height option (all viewport-relative). */
function resolveFaqMinHeight(heightKey: string, customHeightPercent: number): string | undefined {
  // Custom height is a percentage of the viewport height (matches Shopify).
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
  verticalOnMobile: boolean;
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
  backgroundImagePosition: 'cover' | 'fit';
  backgroundVideoUrl: string;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  overlayColor: string;
  overlayStyle: 'solid' | 'gradient';
  overlayGradientDirection: 'up' | 'down';
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function faqLayoutFlexValue(align: string): 'flex-start' | 'center' | 'flex-end' {
  if (align === 'right' || align === 'flex-end') return 'flex-end';
  if (align === 'center') return 'center';
  return 'flex-start';
}

export function faqPositionFlexValue(position: string): 'flex-start' | 'center' | 'flex-end' {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
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

export function readFaqLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): FaqLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const dir = cfgString(config, `${settingsBase}.direction`, 'vertical');
  const alignRaw = cfgString(config, `${settingsBase}.layoutAlignment`, 'left');
  const height = cfgString(config, `${settingsBase}.height`, 'auto');
  const customHeight = cfgNumber(config, `${settingsBase}.customHeight`, 50);
  const accordionBase = settingsBase.replace(/\.settings$/, '.blocks.accordion.settings');
  const openFirstItem =
    cfgBool(config, `${accordionBase}.openFirstItem`, false) ||
    cfgBool(config, `${settingsBase}.openFirstItem`, false);

  return {
    scheme: resolveFaqScheme(schemeKey),
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    verticalOnMobile: cfgBool(config, `${settingsBase}.verticalOnMobile`, true),
    layoutAlignment:
      alignRaw === 'center' || alignRaw === 'right' ? alignRaw : 'left',
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 32),
    openFirstItem,
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    customHeight,
    minHeight: resolveFaqMinHeight(height, customHeight),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    backgroundImagePosition:
      cfgString(config, `${settingsBase}.backgroundImagePosition`, 'cover') === 'fit' ? 'fit' : 'cover',
    backgroundVideoUrl: cfgString(config, `${settingsBase}.backgroundVideoUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${settingsBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${settingsBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${settingsBase}.borderColor`, 'default'),
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

export type FaqAccordionStyle = {
  icon: 'caret' | 'plus';
  dividers: boolean;
  dividerColor: string;
  headingTypographyPreset: string;
  backgroundColor: string;
  textColor: string;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  openFirstItem: boolean;
};

export function readFaqAccordionTextColors(
  config: Record<string, unknown> | null,
  accordionSettingsBase: string,
  scheme: FaqScheme,
  themeText: string
): { question: string; answer: string } {
  const textColorInConfig = getThemeConfigValue(config, `${accordionSettingsBase}.textColor`);
  if (textColorInConfig == null) {
    const legacyInherit = cfgBool(config, `${accordionSettingsBase}.inheritColorScheme`, false);
    return legacyInherit
      ? { question: scheme.color, answer: scheme.muted }
      : { question: themeText, answer: themeText };
  }
  const textRaw = String(textColorInConfig);
  if (!textRaw || textRaw === 'default') {
    return { question: scheme.color, answer: scheme.muted };
  }
  return { question: textRaw, answer: textRaw };
}

export function readFaqAccordionStyle(
  config: Record<string, unknown> | null,
  accordionSettingsBase: string
): FaqAccordionStyle {
  const iconRaw = cfgString(config, `${accordionSettingsBase}.icon`, 'caret');
  return {
    icon: iconRaw === 'plus' ? 'plus' : 'caret',
    dividers: cfgBool(config, `${accordionSettingsBase}.dividers`, true),
    dividerColor: cfgString(config, `${accordionSettingsBase}.dividerColor`, 'default'),
    headingTypographyPreset: cfgString(
      config,
      `${accordionSettingsBase}.headingTypographyPreset`,
      'heading-5'
    ),
    backgroundColor: cfgString(config, `${accordionSettingsBase}.backgroundColor`, 'default'),
    textColor: cfgString(config, `${accordionSettingsBase}.textColor`, 'default'),
    borderStyle: cfgString(config, `${accordionSettingsBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${accordionSettingsBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${accordionSettingsBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${accordionSettingsBase}.borderColor`, 'default'),
    cornerRadius: cfgNumber(config, `${accordionSettingsBase}.cornerRadius`, 0),
    paddingTop: cfgNumber(config, `${accordionSettingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${accordionSettingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${accordionSettingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${accordionSettingsBase}.paddingRight`, 0),
    openFirstItem: cfgBool(config, `${accordionSettingsBase}.openFirstItem`, false),
  };
}

export function accordionQuestionTypography(
  config: Record<string, unknown> | null,
  preset: string,
  themeFonts: ThemeFonts
): Pick<CSSProperties, 'fontSize' | 'fontWeight' | 'lineHeight' | 'fontFamily' | 'fontStyle' | 'letterSpacing' | 'textTransform'> {
  const typo = resolveThemeTypographyStyle(config, preset, themeFonts);
  return {
    fontFamily: typo.fontFamily,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    fontStyle: typo.fontStyle,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing,
    textTransform: typo.textTransform,
  };
}

export function readFaqHeading(
  config: Record<string, unknown> | null,
  sectionBase: string,
  settingsBase: string
): string {
  const blocksBase = `${sectionBase}.blocks`;
  const text = readHeroHeadingText(config, settingsBase, blocksBase, 'heading');
  if (text.trim()) return text;
  const legacySectionHeading = cfgString(config, `${settingsBase}.heading`, '');
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
        rowIcon: 'none',
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
  placement: 'layout' | 'template',
  editorMode = false
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
        let question = String(settings.heading ?? settings.question ?? '').trim();
        if (!question) {
          if (!editorMode) return null;
          question = 'Accordion row';
        }
        const textBlocks = readAccordionRowTextBlocks(block);
        const primary = textBlocks[0];
        return {
          id,
          question,
          answer: primary?.text ?? '',
          answerTextBlockId: primary?.id ?? 'text',
          textBlocks,
          openByDefault: Boolean(settings.openByDefault),
          rowIcon: String(settings.rowIcon ?? 'none'),
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
