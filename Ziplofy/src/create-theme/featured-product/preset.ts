import { applyFeaturedProductPreset } from '../../utils/featured-product-preset.util';

export function applyPreset(section: Record<string, unknown>): void {
  applyFeaturedProductPreset(section);
}
