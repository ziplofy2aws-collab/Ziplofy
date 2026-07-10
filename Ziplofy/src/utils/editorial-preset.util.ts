/** Shopify-style defaults for Editorial sections. */

export function applyEditorialPreset(section: Record<string, unknown>): void {
  if (section.type !== 'editorial') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'editorial';
  settings.imageUrl = '';
  settings.subheading = 'Bestseller';
  settings.heading = 'Our signature product';
  settings.description =
    'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.';
  settings.linkLabel = 'Shop now';
  settings.linkUrl = '/products';
  settings.mediaPosition = 'left';
  settings.mediaWidth = 'medium';
  settings.mediaHeight = 'medium';
  settings.sectionWidth = 'page';
  settings.colorScheme = 'scheme-4';
  settings.paddingTop = 0;
  settings.paddingBottom = 0;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
