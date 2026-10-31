import { applyCollectionLinksSpotlightPreset } from '../../utils/collection-links-spotlight-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  const settings = section.settings;
  if (settings == null || typeof settings !== 'object' || Array.isArray(settings)) return;
  const s = settings as Record<string, unknown>;
  s.catalogVariant = 'collection-links-text';
  s.layoutMode = 'text';
  applyCollectionLinksSpotlightPreset(section);
}
