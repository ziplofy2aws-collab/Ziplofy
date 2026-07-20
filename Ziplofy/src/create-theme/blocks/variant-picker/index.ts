import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { variantPickerBlockPreview } from './preview';

export const variantPickerBlock: CreateThemeBlock = {
  id: "variant-picker",
  label: "Variant picker",
  category: "product",
  keywords: ["options","size","color"],
  extendedOnly: true,
  Preview: variantPickerBlockPreview,
  editing,
};
