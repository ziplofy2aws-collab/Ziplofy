import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { buyButtonsBlockPreview } from './preview';

export const buyButtonsBlock: CreateThemeBlock = {
  id: "buy-buttons",
  label: "Buy buttons",
  category: "product",
  keywords: ["add to cart","checkout"],
  extendedOnly: true,
  Preview: buyButtonsBlockPreview,
  editing,
};
