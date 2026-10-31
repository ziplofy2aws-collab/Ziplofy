import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { productInventoryBlockPreview } from './preview';

export const productInventoryBlock: CreateThemeBlock = {
  id: "product-inventory",
  label: "Product inventory",
  category: "product",
  keywords: ["stock"],
  extendedOnly: true,
  Preview: productInventoryBlockPreview,
  editing,
};
