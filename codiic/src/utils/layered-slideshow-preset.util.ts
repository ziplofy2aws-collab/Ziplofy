/** Defaults for Layered slideshow sections. */

const DEFAULT_SLIDES = [
  {
    title: 'New arrivals',
    body: "Introducing our latest products, made especially for the season. Shop your favorites before they're gone!",
    peekVariant: 'figure',
  },
  {
    title: 'Bestsellers',
    body: 'Discover the bestsellers that have captured the hearts of our customers with their perfect blend of functionality and style.',
    peekVariant: 'landscape',
  },
  {
    title: 'Limited drops',
    body: 'Fresh seasonal pieces, available for a short time only. Grab them while stocks last.',
    peekVariant: 'figure',
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
      direction: 'vertical',
      alignment: 'left',
      position: 'top',
      gap: 12,
      backgroundColor: '',
      mediaOverlay: false,
      paddingTop: 40,
      paddingBottom: 40,
      paddingLeft: 36,
      paddingRight: 36,
    },
  };
}

export function applyLayeredSlideshowPreset(section: Record<string, unknown>): void {
  if (section.type !== 'layered-slideshow') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'layered-slideshow';
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.height = settings.height ?? 'medium';
  settings.cornerRadius = settings.cornerRadius ?? 0;
  settings.borderThickness = settings.borderThickness ?? 1;
  settings.dropShadow = settings.dropShadow ?? false;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 40;
  settings.paddingBottom = settings.paddingBottom ?? 40;
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
