import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { priceBlockPreview } from './preview';

export const priceBlock: CreateThemeBlock = {
  id: "price",
  label: "Price",
  category: "product",
  keywords: ["money","cost"],
  extendedOnly: true,
  Preview: priceBlockPreview,
  editing,
};
