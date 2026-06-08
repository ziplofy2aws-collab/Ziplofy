/** Defaults for Recommended products sections. */

const CARD_SPECS = [
  { shirtColor: '#d45454', withSun: false },
  { shirtColor: '#5a9a6a', withSun: false },
  { shirtColor: '#4b5563', withSun: true },
  { shirtColor: '#d45454', withSun: false },
] as const;

function makeCard(index: number) {
  const spec = CARD_SPECS[index % CARD_SPECS.length];
  return {
    type: 'recommended-product-card',
    settings: {
      shirtColor: spec.shirtColor,
      withSun: spec.withSun,
      productTitle: 'Product title',
      price: 'Rs. 19.99',
      productId: '',
    },
  };
}

export function applyRecommendedProductsPreset(section: Record<string, unknown>): void {
  if (section.type !== 'recommended-products') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'recommended-products';
  settings.heading = settings.heading ?? 'Related products';
  settings.productId = settings.productId ?? '';
  settings.recommendationType = settings.recommendationType ?? 'related';
  settings.cardStyle = settings.cardStyle ?? 'grid';
  settings.carouselOnMobile = settings.carouselOnMobile ?? false;
  settings.productCount = settings.productCount ?? 4;
  settings.columns = settings.columns ?? 4;
  settings.mobileColumns = settings.mobileColumns ?? '2';
  settings.horizontalGap = settings.horizontalGap ?? 12;
  settings.verticalGap = settings.verticalGap ?? 24;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.layoutGap = settings.layoutGap ?? 28;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];
  const count = Math.max(1, Math.min(12, Number(settings.productCount) || 4));

  if (!order.length) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = `product_${i + 1}`;
      nextBlocks[id] = makeCard(i);
      nextOrder.push(id);
    }
    section.blocks = nextBlocks;
    section.block_order = nextOrder;
    return;
  }

  section.block_order = order.slice(0, count);
  for (let i = order.length; i < count; i++) {
    const id = `product_${i + 1}`;
    if (!blocks[id]) blocks[id] = makeCard(i);
    (section.block_order as string[]).push(id);
  }
  section.blocks = blocks;
}
