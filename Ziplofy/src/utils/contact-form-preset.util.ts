/** Shopify-style defaults for Contact form template sections. */

export function applyContactFormPreset(section: Record<string, unknown>): void {
  if (section.type !== 'contact-form') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'contact-form';
  settings.title = 'Contact us';
  settings.namePlaceholder = 'Name';
  settings.emailPlaceholder = 'Email';
  settings.phonePlaceholder = 'Phone';
  settings.commentPlaceholder = 'Comment';
  settings.submitLabel = 'Submit';
  settings.direction = 'vertical';
  settings.layoutAlignment = 'center';
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
  settings.paddingTop = 32;
  settings.paddingBottom = 32;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
