import { applyBottomAlignedHeroSection } from '../../utils/hero-bottom-aligned.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  const instanceId = typeof section.id === 'string' ? section.id : 'hero_main';
  applyBottomAlignedHeroSection(section, `sections.${instanceId}.blocks`);
}
