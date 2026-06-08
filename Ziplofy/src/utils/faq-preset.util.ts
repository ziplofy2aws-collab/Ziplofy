/** Shopify-style defaults for FAQ sections (Heading + Accordion rows). */

import { FAQ_SECTION_BLOCK_ORDER } from './faq-sidebar.util';
import { faqAccordionDefaultSettings } from '../create-theme/sidebar/theme-editor-faq-accordion-block-panel.utils';
import { faqAccordionRowDefaultSettings } from '../create-theme/sidebar/theme-editor-faq-accordion-row-panel.utils';
import { textBlockDefaultSettings } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';

const DEFAULT_FAQ_HEADING_TEXT = 'Frequently asked questions';

export const FAQ_HEADING_SECTION_STYLE_DEFAULTS: Record<string, string | number | boolean> = {
  title: DEFAULT_FAQ_HEADING_TEXT,
  headingWidth: 'fit',
  headingMaxWidth: 'normal',
  headingAlignment: 'left',
  headingTypographyPreset: 'heading-2',
  headingFont: 'body',
  headingFontSize: '16px',
  headingLineHeight: 'normal',
  headingLetterSpacing: 'normal',
  headingTextCase: 'default',
  headingWrap: 'pretty',
  headingColor: 'heading',
  headingBackgroundEnabled: false,
  headingBackgroundColor: '#00000026',
  headingCornerRadius: 0,
  headingPaddingTop: 0,
  headingPaddingBottom: 0,
  headingPaddingLeft: 0,
  headingPaddingRight: 0,
};

const DEFAULT_FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'What is the return policy?',
    answer:
      'We offer a 30-day return policy on most items. Products must be unused and in original packaging.',
  },
  {
    question: 'Are any purchases final sale?',
    answer: 'Yes, items marked final sale cannot be returned or exchanged.',
  },
  {
    question: 'When will I get my order?',
    answer: 'Most orders ship within 2–3 business days. Delivery times vary by location.',
  },
  {
    question: 'Where are your products manufactured?',
    answer: 'Our products are designed in-house and manufactured with trusted partners worldwide.',
  },
  {
    question: 'How much does shipping cost?',
    answer: 'Shipping is calculated at checkout. Free shipping may apply on qualifying orders.',
  },
];

function faqHeadingBlockSettings(text = DEFAULT_FAQ_HEADING_TEXT): Record<string, string> {
  return { heading: text };
}

export function faqSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  const rowBlocks: Record<string, unknown> = {};
  const rowOrder: string[] = [];
  DEFAULT_FAQ_ITEMS.forEach((item, i) => {
    const id = `row_${i + 1}`;
    rowBlocks[id] = {
      type: 'accordion-row',
      settings: faqAccordionRowDefaultSettings(item.question),
      block_order: ['text'],
      blocks: {
        text: {
          type: 'text',
          settings: textBlockDefaultSettings(item.answer),
        },
      },
    };
    rowOrder.push(id);
  });

  return {
    block_order: [...FAQ_SECTION_BLOCK_ORDER],
    blocks: {
      heading: {
        type: 'heading',
        settings: faqHeadingBlockSettings(),
      },
      accordion: {
        type: 'group',
        settings: { ...faqAccordionDefaultSettings() },
        block_order: rowOrder,
        blocks: rowBlocks,
      },
    },
  };
}

function isLegacyFaqSection(blocks: Record<string, unknown> | undefined): boolean {
  if (!blocks || typeof blocks !== 'object') return true;
  if (blocks.heading && blocks.accordion) return false;
  return Object.values(blocks).some((b) => {
    const block = b as { type?: string };
    return block.type === 'faq-item';
  });
}

function migrateLegacyFaqBlocks(
  section: Record<string, unknown>,
  legacyHeading: string
): boolean {
  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...section.block_order] : Object.keys(blocks);
  const items = order
    .map((id) => {
      const block = blocks[id];
      if (!block || block.type !== 'faq-item') return null;
      const settings = (block.settings ?? {}) as Record<string, unknown>;
      return {
        id,
        question: String(settings.question ?? ''),
        answer: String(settings.answer ?? ''),
      };
    })
    .filter((x): x is { id: string; question: string; answer: string } => x != null);

  const rowBlocks: Record<string, unknown> = {};
  const rowOrder: string[] = [];
  items.forEach((item, i) => {
    const rowId = `row_${i + 1}`;
    rowBlocks[rowId] = {
      type: 'accordion-row',
      settings: faqAccordionRowDefaultSettings(item.question),
      block_order: ['text'],
      blocks: {
        text: {
          type: 'text',
          settings: textBlockDefaultSettings(item.answer),
        },
      },
    };
    rowOrder.push(rowId);
  });

  const preset = faqSectionBlocks();
  const presetBlocks = preset.blocks as Record<string, Record<string, unknown>>;
  const headingText = legacyHeading.trim() || DEFAULT_FAQ_HEADING_TEXT;
  presetBlocks.heading.settings = faqHeadingBlockSettings(headingText);
  if (rowOrder.length) {
    presetBlocks.accordion.block_order = rowOrder;
    presetBlocks.accordion.blocks = rowBlocks;
  }

  section.blocks = preset.blocks;
  section.block_order = preset.block_order;
  return true;
}

/** Sync FAQ heading onto shared heading block paths (`title` + `blocks.heading.settings.heading`). */
function ensureFaqHeadingSettings(section: Record<string, unknown>): void {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const heading = (blocks.heading ?? { type: 'heading' }) as Record<string, unknown>;
  const headingSettings = (heading.settings ?? {}) as Record<string, unknown>;

  const legacyText = String(headingSettings.text ?? settings.heading ?? '').trim();
  const title = String(settings.title ?? '').trim();
  const blockHeading = String(headingSettings.heading ?? '').trim();
  const canonical = title || blockHeading || legacyText || DEFAULT_FAQ_HEADING_TEXT;

  settings.title = canonical;
  heading.type = 'heading';
  heading.settings = { ...headingSettings, heading: canonical };
  delete (heading.settings as Record<string, unknown>).text;
  blocks.heading = heading;

  for (const [key, value] of Object.entries(FAQ_HEADING_SECTION_STYLE_DEFAULTS)) {
    if (key === 'title') continue;
    if (settings[key] === undefined) settings[key] = value;
  }
  if (!String(settings.title ?? '').trim()) {
    settings.title = canonical;
  }

  section.settings = settings;
  section.blocks = blocks;
}

export function applyFaqPreset(section: Record<string, unknown>): void {
  if (section.type !== 'faq') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  const legacyHeading = String(settings.heading ?? '');
  settings.catalogVariant = 'faq';
  delete settings.heading;
  delete settings.openFirstItem;
  settings.direction = settings.direction ?? 'vertical';
  settings.layoutAlignment = settings.layoutAlignment ?? settings.headingAlignment ?? 'left';
  settings.position = settings.position ?? 'center';
  settings.layoutGap = settings.layoutGap ?? 32;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'auto';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundMedia = settings.backgroundMedia ?? 'none';
  settings.backgroundImageUrl = settings.backgroundImageUrl ?? '';
  settings.borderStyle = settings.borderStyle ?? 'none';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.backgroundOverlay = settings.backgroundOverlay ?? false;
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  delete settings.headingAlignment;
  section.settings = settings;

  const blocks = section.blocks as Record<string, unknown> | undefined;
  if (!blocks || isLegacyFaqSection(blocks)) {
    if (isLegacyFaqSection(blocks) && blocks && Object.keys(blocks).length) {
      migrateLegacyFaqBlocks(section, legacyHeading);
    } else {
      const preset = faqSectionBlocks();
      section.blocks = preset.blocks;
      section.block_order = preset.block_order;
    }
  }

  ensureFaqHeadingSettings(section);
  ensureFaqAccordionSettings(section);
  ensureFaqAccordionRowBlocks(section);
}

function ensureFaqAccordionRowBlocks(section: Record<string, unknown>): void {
  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const accordion = blocks.accordion;
  if (!accordion || typeof accordion !== 'object') return;

  const rowBlocks = (accordion.blocks ?? {}) as Record<string, Record<string, unknown>>;
  let changed = false;

  for (const row of Object.values(rowBlocks)) {
    if (!row || row.type !== 'accordion-row') continue;
    const settings = { ...((row.settings ?? {}) as Record<string, unknown>) };

    if (!String(settings.heading ?? '').trim() && settings.question) {
      settings.heading = settings.question;
      delete settings.question;
      changed = true;
    }

    const defaults = faqAccordionRowDefaultSettings(
      String(settings.heading ?? settings.question ?? 'Accordion row')
    );
    for (const [key, value] of Object.entries(defaults)) {
      if (key === 'heading') continue;
      if (settings[key] === undefined) {
        settings[key] = value;
        changed = true;
      }
    }
    if (!String(settings.heading ?? '').trim()) {
      settings.heading = defaults.heading;
      changed = true;
    }

    const nestedBlocks = (row.blocks ?? {}) as Record<string, Record<string, unknown>>;
    const nestedOrder = Array.isArray(row.block_order) ? [...row.block_order] : Object.keys(nestedBlocks);

    if (!nestedOrder.length) {
      const answer = String(settings.answer ?? '').trim();
      row.blocks = {
        text: {
          type: 'text',
          settings: textBlockDefaultSettings(answer),
        },
      };
      row.block_order = ['text'];
      delete settings.answer;
      changed = true;
    }

    const nested = (row.blocks ?? {}) as Record<string, Record<string, unknown>>;
    for (const nestedBlock of Object.values(nested)) {
      if (!nestedBlock || nestedBlock.type !== 'text') continue;
      const nestedSettings = { ...((nestedBlock.settings ?? {}) as Record<string, unknown>) };
      const defaults = textBlockDefaultSettings(String(nestedSettings.text ?? ''));
      for (const [key, value] of Object.entries(defaults)) {
        if (key === 'text') continue;
        if (nestedSettings[key] === undefined) {
          nestedSettings[key] = value;
          changed = true;
        }
      }
      nestedBlock.settings = nestedSettings;
    }
    row.blocks = nested;

    row.settings = settings;
  }

  if (changed) {
    accordion.blocks = rowBlocks;
    blocks.accordion = accordion;
    section.blocks = blocks;
  }
}

function ensureFaqAccordionSettings(section: Record<string, unknown>): void {
  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const accordion = (blocks.accordion ?? { type: 'group' }) as Record<string, unknown>;
  const settings = (accordion.settings ?? {}) as Record<string, unknown>;
  const defaults = faqAccordionDefaultSettings();

  for (const [key, value] of Object.entries(defaults)) {
    if (settings[key] === undefined) settings[key] = value;
  }

  accordion.type = 'group';
  accordion.settings = settings;
  blocks.accordion = accordion;
  section.blocks = blocks;
}

export function ensureFaqSectionBlocks(config: Record<string, unknown>): boolean {
  let changed = false;
  const templates = config.templates as Record<string, { sections?: Record<string, unknown> }> | undefined;
  if (templates) {
    for (const tpl of Object.values(templates)) {
      for (const sec of Object.values(tpl.sections ?? {})) {
        if ((sec as { type?: string }).type !== 'faq') continue;
        const before = JSON.stringify(sec);
        applyFaqPreset(sec as Record<string, unknown>);
        if (JSON.stringify(sec) !== before) changed = true;
      }
    }
  }
  const layoutSections = config.sections as Record<string, unknown> | undefined;
  if (layoutSections) {
    for (const sec of Object.values(layoutSections)) {
      if ((sec as { type?: string }).type !== 'faq') continue;
      const before = JSON.stringify(sec);
      applyFaqPreset(sec as Record<string, unknown>);
      if (JSON.stringify(sec) !== before) changed = true;
    }
  }
  return changed;
}
