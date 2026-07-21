import { applyLargeLogoPreset } from '../../utils/hero-banner-variants.util';

/** Defaults when Large logo is inserted from the section catalog. */
export function applyPreset(section: Record<string, unknown>): void {
  const instanceId = typeof section.id === 'string' ? section.id : 'hero_main';
  applyLargeLogoPreset(section, `sections.${instanceId}.blocks`);
}
