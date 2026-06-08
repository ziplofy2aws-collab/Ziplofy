/** Shopify-style defaults for Product highlight sections. */

export function applyProductHighlightPreset(section: Record<string, unknown>): void {
  if (section.type !== 'product-highlight') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'product-highlight';
  settings.productId = '';
  settings.productTitle = 'Product title';
  settings.price = 'Rs. 19.99';
  settings.productImageUrl = '';
  settings.mediaPosition = 'left';
  settings.colorScheme = 'scheme-3';
  settings.paddingTop = 0;
  settings.paddingBottom = 0;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
