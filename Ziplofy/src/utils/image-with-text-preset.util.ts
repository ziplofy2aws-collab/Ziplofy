/** Shopify-style defaults for Image with text sections. */

export function applyImageWithTextPreset(section: Record<string, unknown>): void {
  if (section.type !== 'image-with-text') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'image-with-text';
  settings.imageUrl = '';
  settings.heading = 'Our signature product';
  settings.description =
    'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.';
  settings.buttonLabel = 'Shop now';
  settings.buttonUrl = '/products';
  settings.direction = 'horizontal';
  settings.verticalOnMobile = false;
  settings.layoutAlignment = 'left';
  settings.position = 'center';
  settings.layoutGap = 32;
  settings.sectionWidth = 'page';
  settings.height = 'auto';
  settings.colorScheme = 'scheme-1';
  settings.backgroundMedia = 'none';
  settings.backgroundImageUrl = '';
  settings.borderStyle = 'none';
  settings.cornerRadius = 0;
  settings.backgroundOverlay = false;
  settings.paddingTop = 40;
  settings.paddingBottom = 40;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
