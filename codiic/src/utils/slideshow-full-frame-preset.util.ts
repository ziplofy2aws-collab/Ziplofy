/** Defaults for Slideshow: Full frame sections. */

const DEFAULT_SLIDES = [
  {
    title: 'New arrivals',
    body: "Introducing our latest products, made especially for the season. Shop your favorites before they're gone!",
    peekVariant: 'landscape' as const,
  },
  {
    title: 'Bestsellers',
    body: 'Our most-loved pieces, back in stock for a limited time.',
    peekVariant: 'figure' as const,
  },
] as const;

function makeSlide(spec: (typeof DEFAULT_SLIDES)[number]) {
  return {
    type: 'slideshow-slide',
    enabled: true,
    settings: {
      title: spec.title,
      body: spec.body,
      buttonLabel: 'Shop now',
      buttonHref: '/collections/all',
      imageUrl: '',
      peekVariant: spec.peekVariant,
      direction: 'vertical',
      alignment: 'center',
      position: 'center',
      gap: 12,
      backgroundColor: '',
      mediaOverlay: false,
      paddingTop: 48,
      paddingBottom: 48,
      paddingLeft: 48,
      paddingRight: 48,
      headingWidth: 'fit',
      headingMaxWidth: 'normal',
      headingAlignment: 'center',
      headingTypographyPreset: 'heading-1',
      headingColor: 'heading',
      bodyWidth: 'fit',
      bodyMaxWidth: 'normal',
      bodyAlignment: 'center',
      bodyTypographyPreset: 'paragraph',
      buttonStyle: 'primary',
      buttonOpenInNewTab: false,
    },
  };
}

export function applySlideshowFullFramePreset(section: Record<string, unknown>): void {
  if (section.type !== 'slideshow-full-frame') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'slideshow-full-frame';
  settings.sectionLayout = settings.sectionLayout ?? 'full-frame';
  settings.sectionWidth = settings.sectionWidth ?? 'full';
  settings.mediaHeight = settings.mediaHeight ?? 'medium';
  settings.contentPosition = settings.contentPosition ?? 'on-media';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundColor = settings.backgroundColor ?? '';
  settings.navigationIcon = settings.navigationIcon ?? 'large-arrows';
  settings.navigationIconBackground = settings.navigationIconBackground ?? 'none';
  settings.navigationIconColor = settings.navigationIconColor ?? '';
  settings.pagination = settings.pagination ?? 'dots';
  settings.autoRotate = settings.autoRotate ?? false;
  settings.paddingTop = settings.paddingTop ?? 0;
  settings.paddingBottom = settings.paddingBottom ?? 0;
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

  // Backfill layout defaults on existing slides so older themes get editable options.
  for (const id of order) {
    const block = blocks[id];
    if (!block || typeof block !== 'object') continue;
    const slideSettings = {
      ...((block.settings ?? {}) as Record<string, unknown>),
    };
    slideSettings.direction = slideSettings.direction ?? 'vertical';
    slideSettings.alignment = slideSettings.alignment ?? 'center';
    slideSettings.position = slideSettings.position ?? 'center';
    slideSettings.gap = slideSettings.gap ?? 12;
    slideSettings.backgroundColor = slideSettings.backgroundColor ?? '';
    slideSettings.mediaOverlay = slideSettings.mediaOverlay ?? false;
    slideSettings.paddingTop = slideSettings.paddingTop ?? 48;
    slideSettings.paddingBottom = slideSettings.paddingBottom ?? 48;
    slideSettings.paddingLeft = slideSettings.paddingLeft ?? 48;
    slideSettings.paddingRight = slideSettings.paddingRight ?? 48;
    slideSettings.peekVariant =
      slideSettings.peekVariant ?? (id.endsWith('2') ? 'figure' : 'landscape');
    slideSettings.buttonLabel = slideSettings.buttonLabel ?? 'Shop now';
    slideSettings.buttonHref = slideSettings.buttonHref ?? '/collections/all';
    block.settings = slideSettings;
    block.type = block.type ?? 'slideshow-slide';
    block.enabled = block.enabled !== false;
  }

  section.blocks = blocks;
  section.block_order = order;
}
