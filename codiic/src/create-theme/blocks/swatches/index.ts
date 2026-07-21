import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { swatchesBlockPreview } from './preview';

export const swatchesBlock: CreateThemeBlock = {
  id: "swatches",
  label: "Swatches",
  category: "product",
  keywords: ["color","variant"],
  extendedOnly: true,
  Preview: swatchesBlockPreview,
  editing,
};
