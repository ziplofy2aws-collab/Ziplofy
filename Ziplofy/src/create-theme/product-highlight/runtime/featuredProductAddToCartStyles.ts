import { cfgString } from '../../runtime/shared/config';

export type FeaturedProductAddToCartStyle = {
  style: 'primary' | 'secondary';
};

export function readFeaturedProductAddToCartStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): FeaturedProductAddToCartStyle {
  const raw = cfgString(config, `${settingsBase}.style`, 'secondary');
  return { style: raw === 'primary' ? 'primary' : 'secondary' };
}
