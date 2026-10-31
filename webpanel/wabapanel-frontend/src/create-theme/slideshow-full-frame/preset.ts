import { applySlideshowFullFramePreset } from '../../utils/slideshow-full-frame-preset.util';

/** Defaults applied after pack blueprint clone. */
export function applyPreset(section: Record<string, unknown>): void {
  applySlideshowFullFramePreset(section);
}
