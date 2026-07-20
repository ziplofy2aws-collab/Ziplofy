/** Defaults for Collection list: Editorial sections. */

const TILE_VARIANTS = ['folded-shirts', 'hanger-shirts', 'hanging-sweaters', 'clothing-rack'] as const;

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

export function applyCollectionListEditorialPreset(section: Record<string, unknown>): void {
  if (section.type !== 'collection-list-editorial') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'collection-list-editorial';
  settings.heading = settings.heading ?? 'Shop by collection';
  settings.collectionsPicker = settings.collectionsPicker ?? '';
  settings.cardsLayoutType = settings.cardsLayoutType ?? 'editorial';
  settings.carouselOnMobile = settings.carouselOnMobile ?? false;
  settings.collectionCount = settings.collectionCount ?? 4;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.layoutGap = settings.layoutGap ?? 64;
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
    for (let i = 0; i < 4; i++) {
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
