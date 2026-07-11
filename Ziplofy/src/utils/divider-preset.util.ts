/** Shopify-style defaults for Divider sections. */

export function applyDividerPreset(section: Record<string, unknown>): void {
  if (section.type !== 'divider') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'divider';
  delete settings.colorScheme;
  if (settings.backgroundColor === undefined) settings.backgroundColor = '';
  if (settings.color === undefined) settings.color = '';
  settings.sectionWidth = 'page';
  settings.thickness = 1;
  settings.length = 100;
  settings.paddingTop = 16;
  settings.paddingBottom = 16;
  settings.customCss = '';
  section.settings = settings;
}
