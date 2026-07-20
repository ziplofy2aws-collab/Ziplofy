/** Shopify Horizon–style defaults for Storytelling Logo sections. */

export function applyStorytellingLogoPreset(section: Record<string, unknown>): void {
  if (section.type !== 'storytelling-logo') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'logo';
  settings.logoText = 'My Store';
  settings.logoImageUrl = '';
  settings.logoLinkUrl = '/';
  settings.logoFont = 'heading';
  settings.sizeUnit = 'pixel';
  settings.pixelHeight = 48;
  settings.percentWidth = 100;
  settings.customMobileSize = false;
  settings.mobileSizeUnit = 'percent';
  settings.mobilePercentWidth = 100;
  settings.mobilePixelHeight = 120;
  settings.sectionWidth = 'page';
  settings.layoutAlignment = 'center';
  settings.colorScheme = 'scheme-1';
  settings.paddingTop = 32;
  settings.paddingBottom = 32;
  settings.defaultLogoUrl = '';
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
