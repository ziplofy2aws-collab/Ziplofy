import { applyStorytellingVideoPreset } from '../../utils/storytelling-video-preset.util';

/** Defaults applied after pack blueprint clone. */
export function applyPreset(section: Record<string, unknown>): void {
  applyStorytellingVideoPreset(section);
}
