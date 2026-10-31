import { applySlideshowInsetPreset } from '../../utils/slideshow-inset-preset.util';

/** Defaults applied after pack blueprint clone. */
export function applyPreset(section: Record<string, unknown>): void {
  applySlideshowInsetPreset(section);
}
