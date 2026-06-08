/** Shopify-style defaults for Divider sections. */

export function applyDividerPreset(section: Record<string, unknown>): void {
  if (section.type !== 'divider') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'divider';
  settings.colorScheme = 'scheme-1';
  settings.sectionWidth = 'page';
  settings.thickness = 1;
  settings.length = 100;
  settings.paddingTop = 16;
  settings.paddingBottom = 16;
  settings.customCss = '';
  section.settings = settings;
}
