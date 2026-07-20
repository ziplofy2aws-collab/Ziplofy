/** Shopify-style defaults for Custom section instances. */

export function applyCustomSectionPreset(section: Record<string, unknown>): void {
  if (section.type !== 'custom-section') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'custom-section';
  settings.direction = 'vertical';
  settings.layoutAlignment = 'left';
  settings.position = 'center';
  settings.layoutGap = 12;
  settings.sectionWidth = 'page';
  settings.height = 'small';
  settings.colorScheme = 'scheme-1';
  settings.backgroundMedia = 'none';
  settings.backgroundImageUrl = '';
  settings.borderStyle = 'none';
  settings.cornerRadius = 0;
  settings.backgroundOverlay = false;
  settings.paddingTop = 0;
  settings.paddingBottom = 0;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = section.blocks ?? {};
  section.block_order = section.block_order ?? [];
}
