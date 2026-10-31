/** Defaults for Collection list: Grid sections. */

const TILE_VARIANTS = ['folded-shirts', 'hanger-shirts', 'hanging-sweaters'] as const;

function makeTile(index: number) {
  return {
    type: 'collection-tile',
    settings: {
      title: 'Collection title',
      collectionHandle: '',
      href: '/collections/all',
      illustrationVariant: TILE_VARIANTS[index % TILE_VARIANTS.length],
      imageUrl: '',
    },
  };
}

export function applyCollectionListGridPreset(section: Record<string, unknown>): void {
  if (section.type !== 'collection-list-grid') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'collection-list-grid';
  settings.heading = settings.heading ?? 'Shop by collection';
  settings.collectionsPicker = settings.collectionsPicker ?? '';
  settings.cardsLayoutType = settings.cardsLayoutType ?? 'grid';
  settings.carouselOnMobile = settings.carouselOnMobile ?? false;
  settings.columns = settings.columns ?? 3;
  settings.mobileColumns = settings.mobileColumns ?? '2';
  settings.horizontalGap = settings.horizontalGap ?? 8;
  settings.verticalGap = settings.verticalGap ?? 8;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.layoutGap = settings.layoutGap ?? 12;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];

  if (!order.length) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    for (let i = 0; i < 3; i++) {
      const id = `tile_${i + 1}`;
      nextBlocks[id] = makeTile(i);
      nextOrder.push(id);
    }
    section.blocks = nextBlocks;
    section.block_order = nextOrder;
    return;
  }

  section.blocks = blocks;
  section.block_order = order;
}
