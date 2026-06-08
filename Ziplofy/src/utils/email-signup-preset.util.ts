/** Shopify-style defaults for Email signup template sections. */

export function applyEmailSignupPreset(section: Record<string, unknown>): void {
  if (section.type !== 'email-signup') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'email-signup';
  settings.title = 'Subscribe to our emails';
  settings.subtitle = 'Be the first to know about new collections and special offers.';
  settings.placeholder = 'Email address';
  settings.direction = 'vertical';
  settings.layoutAlignment = 'center';
  settings.position = 'center';
  settings.layoutGap = 16;
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
