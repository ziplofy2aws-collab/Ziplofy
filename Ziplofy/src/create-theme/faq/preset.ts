import { applyFaqPreset } from '../../utils/faq-preset.util';

/** Defaults applied after pack blueprint clone. */
export function applyPreset(section: Record<string, unknown>): void {
  applyFaqPreset(section);
}
