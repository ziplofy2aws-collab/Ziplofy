/** Defaults for Storytelling carousel sections. */

import {
  storytellingCarouselCardImageDefaultSettings,
  storytellingCarouselCardHeadingDefaultSettings,
  storytellingCarouselCardTextDefaultSettings,
  storytellingCarouselHeaderDefaultSettings,
} from '../create-theme/sidebar/theme-editor-storytelling-carousel-block-panel.utils';
import { seedStorytellingCarouselCardGroupInSettings } from '../create-theme/sidebar/theme-editor-storytelling-carousel-card-panel.utils';
import { seedStorytellingCarouselContentGroupInSettings } from '../create-theme/sidebar/theme-editor-storytelling-carousel-content-group-panel.utils';
import { seedStorytellingCarouselHeaderGroupInSettings } from '../create-theme/sidebar/theme-editor-storytelling-carousel-header-panel.utils';

const SLIDE_TITLES = ['Artistry in action', 'Uncompromising quality', 'Made to last'] as const;

function makeSlide(title: string) {
  return {
    type: 'carousel-slide',
    settings: seedStorytellingCarouselCardGroupInSettings({
      ...storytellingCarouselCardImageDefaultSettings(),
      ...storytellingCarouselCardHeadingDefaultSettings(),
      ...storytellingCarouselCardTextDefaultSettings(),
      title,
    } as Record<string, unknown>),
  };
}

export function applyStorytellingCarouselPreset(section: Record<string, unknown>): void {
  if (section.type !== 'storytelling-carousel') return;

  const settings = seedStorytellingCarouselHeaderGroupInSettings(
    seedStorytellingCarouselContentGroupInSettings(
      (section.settings ?? {}) as Record<string, unknown>
    )
  );
  settings.catalogVariant = settings.catalogVariant ?? 'storytelling-carousel';
  const headerDefaults = storytellingCarouselHeaderDefaultSettings();
  for (const [key, value] of Object.entries(headerDefaults)) {
    if (settings[key] === undefined) settings[key] = value;
  }
  settings.columns = settings.columns ?? 3;
  settings.mobileColumns = settings.mobileColumns ?? '1';
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.horizontalGap = settings.horizontalGap ?? 12;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.navIcon = settings.navIcon ?? 'arrows';
  settings.navIconBackground = settings.navIconBackground ?? 'none';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];

  if (!order.length) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    for (let i = 0; i < SLIDE_TITLES.length; i++) {
      const id = `slide_${i + 1}`;
      nextBlocks[id] = makeSlide(SLIDE_TITLES[i]);
      nextOrder.push(id);
    }
    section.blocks = nextBlocks;
    section.block_order = nextOrder;
    return;
  }

  section.blocks = blocks;
  section.block_order = order;

  const imageDefaults = storytellingCarouselCardImageDefaultSettings();
  const textDefaults = storytellingCarouselCardTextDefaultSettings();
  const headingDefaults = storytellingCarouselCardHeadingDefaultSettings();
  for (const slideId of order) {
    const block = blocks[slideId];
    if (!block || typeof block !== 'object') continue;
    const settings = (block.settings ?? {}) as Record<string, unknown>;
    for (const [key, value] of Object.entries(imageDefaults)) {
      if (settings[key] === undefined) settings[key] = value;
    }
    for (const [key, value] of Object.entries(headingDefaults)) {
      if (key === 'title') continue;
      if (settings[key] === undefined) settings[key] = value;
    }
    for (const [key, value] of Object.entries(textDefaults)) {
      if (settings[key] === undefined) settings[key] = value;
    }
    block.settings = seedStorytellingCarouselCardGroupInSettings(settings);
    blocks[slideId] = block;
  }
  section.blocks = blocks;
}
