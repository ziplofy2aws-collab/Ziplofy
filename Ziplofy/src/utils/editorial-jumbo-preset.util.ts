/** Shopify-style defaults for Editorial: Jumbo text sections. */

export function applyEditorialJumboPreset(section: Record<string, unknown>): void {
  if (section.type !== 'editorial-jumbo') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'editorial-jumbo';
  settings.headline = 'UP THE ANTE';
  settings.imageUrl = '';
  settings.mediaPosition = 'right';
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
