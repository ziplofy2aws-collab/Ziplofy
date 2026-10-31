/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  const settings = section.settings as Record<string, unknown> | undefined;
  if (!settings || typeof settings !== 'object') return;
  settings.catalogVariant = 'recommended-products';
}
