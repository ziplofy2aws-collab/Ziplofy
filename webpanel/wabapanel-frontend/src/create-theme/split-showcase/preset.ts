import { applySplitShowcasePreset } from '../../utils/hero-banner-variants.util';

/** Defaults when Split showcase is inserted from the section catalog. */
export function applyPreset(section: Record<string, unknown>): void {
  const instanceId = typeof section.id === 'string' ? section.id : 'hero_main';
  applySplitShowcasePreset(section, `sections.${instanceId}.blocks`);
}
