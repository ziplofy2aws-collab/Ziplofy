/** Defaults for Storytelling carousel sections. */

const SLIDE_TITLES = ['Artistry in action', 'Uncompromising quality', 'Made to last'] as const;
const DEFAULT_DESC = 'Made with care and unconditionally loved by our customers.';

function makeSlide(title: string) {
  return {
    type: 'carousel-slide',
    settings: {
      title,
      description: DEFAULT_DESC,
      imageUrl: '',
    },
  };
}

export function applyStorytellingCarouselPreset(section: Record<string, unknown>): void {
  if (section.type !== 'storytelling-carousel') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'storytelling-carousel';
  settings.heading = settings.heading ?? 'Discover elevated design';
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
}
