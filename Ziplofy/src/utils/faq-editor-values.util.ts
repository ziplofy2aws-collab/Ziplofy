import { faqAccordionDefaultSettings } from '../create-theme/sidebar/theme-editor-faq-accordion-block-panel.utils';
import { faqAccordionRowDefaultSettings } from '../create-theme/sidebar/theme-editor-faq-accordion-row-panel.utils';
import { textBlockDefaultSettings } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function pruneByPrefix(
  values: Record<string, string | boolean>,
  prefix: string
): Record<string, string | boolean> {
  const next: Record<string, string | boolean> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!key.startsWith(prefix)) next[key] = value;
  }
  return next;
}

export function pruneValuesForFaqAccordionRow(
  values: Record<string, string | boolean>,
  scope: 'template' | 'layout',
  tplId: string | undefined,
  sectionInstanceId: string,
  rowId: string
): Record<string, string | boolean> {
  const prefix =
    scope === 'template' && tplId
      ? `templates.${tplId}.sections.${sectionInstanceId}.blocks.accordion.blocks.${rowId}`
      : `sections.${sectionInstanceId}.blocks.accordion.blocks.${rowId}`;
  return pruneByPrefix(values, prefix);
}

export function pruneValuesForFaqRowText(
  values: Record<string, string | boolean>,
  scope: 'template' | 'layout',
  tplId: string | undefined,
  sectionInstanceId: string,
  rowId: string,
  textId: string
): Record<string, string | boolean> {
  const prefix =
    scope === 'template' && tplId
      ? `templates.${tplId}.sections.${sectionInstanceId}.blocks.accordion.blocks.${rowId}.blocks.${textId}`
      : `sections.${sectionInstanceId}.blocks.accordion.blocks.${rowId}.blocks.${textId}`;
  return pruneByPrefix(values, prefix);
}

/** Seed form values after adding FAQ section-level heading or accordion block. */
export function extendValuesForFaqSectionBlock(
  values: Record<string, string | boolean>,
  scope: 'template' | 'layout',
  tplId: string | undefined,
  sectionInstanceId: string,
  blockInstanceId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const next = { ...values };
  const sectionBase =
    scope === 'template' && tplId
      ? `templates.${tplId}.sections.${sectionInstanceId}`
      : `sections.${sectionInstanceId}`;

  if (blockInstanceId === 'heading') {
    const headingPath = `${sectionBase}.blocks.heading.settings.heading`;
    const titlePath = `${sectionBase}.settings.title`;
    const rawHeading = getNested(config, headingPath.split('.'));
    const rawTitle = getNested(config, titlePath.split('.'));
    const text = String(rawHeading ?? rawTitle ?? 'Frequently asked questions');
    next[headingPath] = text;
    next[titlePath] = text;
    return next;
  }

  if (blockInstanceId === 'accordion') {
    const settingsBase = `${sectionBase}.blocks.accordion.settings`;
    for (const [key, value] of Object.entries(faqAccordionDefaultSettings())) {
      const path = `${settingsBase}.${key}`;
      const raw = getNested(config, path.split('.'));
      if (raw !== undefined) {
        next[path] = typeof value === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
      } else {
        next[path] = typeof value === 'boolean' ? value : String(value);
      }
    }
    const accordion = getNested(config, `${sectionBase}.blocks.accordion`.split('.')) as
      | { block_order?: string[] }
      | undefined;
    const rowOrder = Array.isArray(accordion?.block_order) ? accordion.block_order : [];
    for (const rowId of rowOrder) {
      next = extendValuesForNewFaqAccordionRow(
        next,
        scope,
        tplId,
        sectionInstanceId,
        rowId,
        config
      );
    }
  }

  return next;
}

const FAQ_HEADING_SETTING_KEYS = new Set([
  'title',
  'heading',
  'headingWidth',
  'headingMaxWidth',
  'headingAlignment',
  'headingTypographyPreset',
  'headingFont',
  'headingFontSize',
  'headingLineHeight',
  'headingLetterSpacing',
  'headingTextCase',
  'headingWrap',
  'headingColor',
  'headingBackgroundEnabled',
  'headingBackgroundColor',
  'headingCornerRadius',
  'headingPaddingTop',
  'headingPaddingBottom',
  'headingPaddingLeft',
  'headingPaddingRight',
]);

/** Remove values when FAQ section-level heading or accordion block is deleted. */
export function pruneValuesForFaqSectionBlock(
  values: Record<string, string | boolean>,
  scope: 'template' | 'layout',
  tplId: string | undefined,
  sectionInstanceId: string,
  blockInstanceId: 'heading' | 'accordion'
): Record<string, string | boolean> {
  const sectionBase =
    scope === 'template' && tplId
      ? `templates.${tplId}.sections.${sectionInstanceId}`
      : `sections.${sectionInstanceId}`;
  let next = pruneByPrefix(values, `${sectionBase}.blocks.${blockInstanceId}`);
  if (blockInstanceId === 'heading') {
    const settingsPrefix = `${sectionBase}.settings.`;
    for (const [key, value] of Object.entries(next)) {
      if (!key.startsWith(settingsPrefix)) continue;
      const settingKey = key.slice(settingsPrefix.length).split('.')[0] ?? '';
      if (FAQ_HEADING_SETTING_KEYS.has(settingKey)) {
        delete next[key];
      }
    }
  }
  return next;
}

/** Seed defaults when a new accordion row is inserted (row settings + default text block). */
export function extendValuesForNewFaqAccordionRow(
  values: Record<string, string | boolean>,
  scope: 'template' | 'layout',
  tplId: string | undefined,
  sectionInstanceId: string,
  rowId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const next = { ...values };
  const rowBase =
    scope === 'template' && tplId
      ? `templates.${tplId}.sections.${sectionInstanceId}.blocks.accordion.blocks.${rowId}`
      : `sections.${sectionInstanceId}.blocks.accordion.blocks.${rowId}`;

  for (const [key, value] of Object.entries(faqAccordionRowDefaultSettings())) {
    const path = `${rowBase}.settings.${key}`;
    const raw = getNested(config, path.split('.'));
    if (raw !== undefined) {
      next[path] = typeof value === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
    } else {
      next[path] = typeof value === 'boolean' ? value : String(value);
    }
  }

  const row = getNested(config, rowBase.split('.')) as
    | { block_order?: string[]; blocks?: Record<string, { settings?: Record<string, unknown> }> }
    | undefined;
  const textOrder = Array.isArray(row?.block_order) ? row.block_order : Object.keys(row?.blocks ?? {});
  const textId = textOrder[0] ?? 'text';
  const textDefaults = textBlockDefaultSettings();
  for (const [key, value] of Object.entries(textDefaults)) {
    const path = `${rowBase}.blocks.${textId}.settings.${key}`;
    const raw = getNested(config, path.split('.'));
    if (raw !== undefined) {
      next[path] = typeof value === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
    } else {
      next[path] = typeof value === 'boolean' ? value : String(value);
    }
  }

  return next;
}
