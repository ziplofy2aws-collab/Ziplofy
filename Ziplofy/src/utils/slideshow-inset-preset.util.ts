/** Defaults for Slideshow: Inset sections. */

const DEFAULT_SLIDES = [
  {
    title: 'New arrivals',
    body: 'Introducing our latest products, made especially for the season. Shop your favorites before they\'re gone!',
    peekVariant: 'landscape',
  },
  {
    title: 'Bestsellers',
    body: 'Our most-loved pieces, back in stock for a limited time.',
    peekVariant: 'landscape',
  },
] as const;

function makeSlide(spec: (typeof DEFAULT_SLIDES)[number]) {
  return {
    type: 'slideshow-slide',
    settings: {
      title: spec.title,
      body: spec.body,
      buttonLabel: 'Shop now',
      buttonHref: '/collections/all',
      imageUrl: '',
      peekVariant: spec.peekVariant,
    },
  };
}

export function applySlideshowInsetPreset(section: Record<string, unknown>): void {
  if (section.type !== 'slideshow-inset') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'slideshow-inset';
  settings.sectionLayout = settings.sectionLayout ?? 'with-hints';
  settings.fullWidthOnMobile = settings.fullWidthOnMobile ?? false;
  settings.gap = settings.gap ?? 18;
  settings.cornerRadius = settings.cornerRadius ?? 20;
  settings.mediaHeight = settings.mediaHeight ?? 'medium';
  settings.contentPosition = settings.contentPosition ?? 'below-media';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.navigationIcon = settings.navigationIcon ?? 'large-arrows';
  settings.navigationIconBackground = settings.navigationIconBackground ?? 'none';
  settings.pagination = settings.pagination ?? 'none';
  settings.paddingTop = settings.paddingTop ?? 0;
  settings.paddingBottom = settings.paddingBottom ?? 0;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];

  if (!order.length) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    DEFAULT_SLIDES.forEach((spec, i) => {
      const id = `slide_${i + 1}`;
      nextBlocks[id] = makeSlide(spec);
      nextOrder.push(id);
    });
    section.blocks = nextBlocks;
    section.block_order = nextOrder;
    return;
  }

  section.blocks = blocks;
  section.block_order = order;
}
