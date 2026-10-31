/** Defaults for Collection links: Spotlight sections. */

function makeLink() {
  return {
    type: 'collection-link',
    settings: {
      title: 'Collection title',
      typographyPreset: 'heading-5',
      font: 'body',
      fontSize: 'default',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textCase: 'default',
      wrap: 'pretty',
      productCount: 5,
      collectionHandle: '',
      href: '/collections/all',
      imageUrl: '',
      imageHeight: 'medium',
      imageRatio: 'portrait',
      imageCornerRadius: 0,
      showCount: false,
    },
  };
}

export function applyCollectionLinksSpotlightPreset(section: Record<string, unknown>): void {
  if (section.type !== 'collection-links-spotlight') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  const catalogVariant = String(settings.catalogVariant ?? 'collection-links-spotlight');
  settings.catalogVariant = catalogVariant;
  settings.collectionsPicker = settings.collectionsPicker ?? '';
  const isText = catalogVariant === 'collection-links-text';
  settings.layoutMode = isText ? 'text' : 'spotlight';
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.alignment = isText ? (settings.alignment ?? 'center') : (settings.alignment ?? 'left');
  settings.imagePosition = settings.imagePosition ?? 'right';
  settings.imageUrl = settings.imageUrl ?? '';
  settings.backgroundColor = settings.backgroundColor ?? '';
  settings.textColor = settings.textColor ?? '';
  settings.paddingTop = settings.paddingTop ?? 40;
  settings.paddingBottom = settings.paddingBottom ?? 40;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];

  if (!order.length) {
    section.blocks = { link_1: makeLink() };
    section.block_order = ['link_1'];
    return;
  }

  section.blocks = blocks;
  section.block_order = order;
}
