import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { recommendedProductsBlockPreview } from './preview';

export const recommendedProductsBlock: CreateThemeBlock = {
  id: "recommended-products",
  label: "Recommended products",
  category: "product",
  keywords: ["related","upsell"],
  extendedOnly: true,
  Preview: recommendedProductsBlockPreview,
  editing,
};
