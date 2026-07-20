import { applyEditorialJumboPreset } from '../../utils/editorial-jumbo-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  applyEditorialJumboPreset(section);
}
