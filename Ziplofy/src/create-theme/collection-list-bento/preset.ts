import { applyCollectionListBentoPreset } from '../../utils/collection-list-bento-preset.util';

/** Defaults applied after pack blueprint clone. */
export function applyPreset(section: Record<string, unknown>): void {
  applyCollectionListBentoPreset(section);
}
