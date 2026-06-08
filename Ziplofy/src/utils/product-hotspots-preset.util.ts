/** Defaults for Product hotspots sections. */

const DEFAULT_POSITIONS = [
  { x: 50, y: 10 },
  { x: 22, y: 38 },
  { x: 58, y: 55 },
  { x: 35, y: 50 },
  { x: 76, y: 48 },
] as const;

function makeHotspot(x: number, y: number) {
  return {
    type: 'product-hotspot',
    settings: {
      positionX: x,
      positionY: y,
      productId: '',
      productTitle: 'Product title',
      price: 'Rs. 19.99',
    },
  };
}

export function applyProductHotspotsPreset(section: Record<string, unknown>): void {
  if (section.type !== 'product-hotspots') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'product-hotspots';
  settings.heading = settings.heading ?? 'Shop the look';
  settings.imageUrl = settings.imageUrl ?? '';
  settings.mediaOverlay = settings.mediaOverlay ?? false;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.sectionHeight = settings.sectionHeight ?? 'auto';
  settings.hotspotColor = settings.hotspotColor ?? '#FFFFFF57';
  settings.innerColor = settings.innerColor ?? '#FFFFFF';
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.popoverGap = settings.popoverGap ?? 8;
  settings.titleTypography = settings.titleTypography ?? 'default';
  settings.priceTypography = settings.priceTypography ?? 'default';
  settings.paddingTop = settings.paddingTop ?? 40;
  settings.paddingBottom = settings.paddingBottom ?? 40;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];

  if (!order.length) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    DEFAULT_POSITIONS.forEach((p, i) => {
      const id = `hotspot_${i + 1}`;
      nextBlocks[id] = makeHotspot(p.x, p.y);
      nextOrder.push(id);
    });
    section.blocks = nextBlocks;
    section.block_order = nextOrder;
    return;
  }

  section.blocks = blocks;
  section.block_order = order;
}
