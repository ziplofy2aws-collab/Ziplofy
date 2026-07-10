/** Shopify-style defaults for Image compare sections. */

export function applyImageComparePreset(section: Record<string, unknown>): void {
  if (section.type !== 'image-compare') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'image-compare';
  settings.heading = 'Find your perfect fit';
  settings.subheading = 'Discover the best of both worlds';
  settings.button1Label = 'View all';
  settings.button1Url = '/collections';
  settings.button2Label = 'Shop now';
  settings.button2Url = '/products';
  settings.imageBeforeUrl = '';
  settings.imageAfterUrl = '';
  settings.direction = 'horizontal';
  settings.verticalOnMobile = false;
  settings.layoutAlignment = 'space-between';
  settings.position = 'center';
  settings.layoutGap = 46;
  settings.sectionWidth = 'page';
  settings.height = 'small';
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
