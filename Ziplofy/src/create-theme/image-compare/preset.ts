import { applyImageComparePreset } from '../../utils/image-compare-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  applyImageComparePreset(section);
}
