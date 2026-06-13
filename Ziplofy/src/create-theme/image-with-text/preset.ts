import { applyImageWithTextPreset } from '../../utils/image-with-text-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  applyImageWithTextPreset(section);
}
