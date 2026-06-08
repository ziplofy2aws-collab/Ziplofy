import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { skuBlockPreview } from './preview';

export const skuBlock: CreateThemeBlock = {
  id: "sku",
  label: "SKU",
  category: "product",
  keywords: ["stock keeping unit"],
  extendedOnly: true,
  Preview: skuBlockPreview,
  editing,
};
