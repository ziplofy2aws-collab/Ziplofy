/** Defaults for Collection list: Bento sections. */

const TILE_SPECS = [
  { illustrationVariant: 'folded-shirts', columnSpan: 1 },
  { illustrationVariant: 'hanger-shirts', columnSpan: 2 },
  { illustrationVariant: 'hanging-sweaters', columnSpan: 2 },
  { illustrationVariant: 'clothing-rack', columnSpan: 1 },
] as const;

function makeTile(index: number) {
  const spec = TILE_SPECS[index % TILE_SPECS.length];
  return {
    type: 'collection-tile',
    settings: {
      title: 'Collection title',
      collectionHandle: '',
      href: '/collections/all',
      illustrationVariant: spec.illustrationVariant,
      columnSpan: spec.columnSpan,
      imageUrl: '',
    },
  };
}

export function applyCollectionListBentoPreset(section: Record<string, unknown>): void {
  if (section.type !== 'collection-list-bento') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'collection-list-bento';
  settings.heading = settings.heading ?? 'Shop by collection';
  settings.collectionsPicker = settings.collectionsPicker ?? '';
  settings.cardsLayoutType = settings.cardsLayoutType ?? 'bento';
  settings.carouselOnMobile = settings.carouselOnMobile ?? false;
  settings.cardsGap = settings.cardsGap ?? 8;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.layoutGap = settings.layoutGap ?? 12;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 24;
  settings.paddingBottom = settings.paddingBottom ?? 24;
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
