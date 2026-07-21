import { applyProductHighlightPreset } from '../../utils/product-highlight-preset.util';

/** Defaults applied when inserting Product highlight from the catalog. */
export function applyPreset(section: Record<string, unknown>): void {
  applyProductHighlightPreset(section);
}
