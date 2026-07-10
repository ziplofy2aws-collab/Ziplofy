import { applyContactFormPreset } from '../../utils/contact-form-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  applyContactFormPreset(section);
}
