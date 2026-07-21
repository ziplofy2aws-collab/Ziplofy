import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { productCardBlockPreview } from './preview';

export const productCardBlock: CreateThemeBlock = {
  id: "product-card",
  label: "Product card",
  category: "product",
  keywords: ["card","tile"],
  extendedOnly: true,
  Preview: productCardBlockPreview,
  editing,
};
