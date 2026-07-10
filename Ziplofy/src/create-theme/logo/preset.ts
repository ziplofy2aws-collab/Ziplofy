/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'logo';
  if (!settings.logoText) settings.logoText = 'My Store';
  if (!settings.layoutAlignment) settings.layoutAlignment = 'center';
  section.settings = settings;
}
