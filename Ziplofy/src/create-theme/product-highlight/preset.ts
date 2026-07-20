/** Defaults applied when inserting Product highlight from the catalog. */
export function applyPreset(section: Record<string, unknown>): void {
  if (section.type !== 'product-highlight') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'product-highlight';
  settings.productId = settings.productId ?? '';
  settings.productTitle = settings.productTitle ?? 'Product title';
  settings.price = settings.price ?? 'Rs. 19.99';
  settings.productImageUrl = settings.productImageUrl ?? '';
  settings.mediaPosition = settings.mediaPosition ?? 'left';
  settings.colorScheme = settings.colorScheme ?? 'scheme-3';
  settings.paddingTop = settings.paddingTop ?? 0;
  settings.paddingBottom = settings.paddingBottom ?? 0;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
