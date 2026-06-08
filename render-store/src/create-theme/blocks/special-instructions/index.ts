import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { specialInstructionsBlockPreview } from './preview';

export const specialInstructionsBlock: CreateThemeBlock = {
  id: "special-instructions",
  label: "Special instructions",
  category: "product",
  keywords: ["note","gift message"],
  extendedOnly: true,
  Preview: specialInstructionsBlockPreview,
  editing,
};
