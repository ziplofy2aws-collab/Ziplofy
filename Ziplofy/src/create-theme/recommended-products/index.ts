import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { recommendedproductsPreview } from './preview';
import { applyPreset } from './preset';

export const recommendedProductsElement: CreateThemeElement = {
  id: "recommended-products",
  label: "Recommended products",
  keywords: ["recommendations","related","upsell"],
  previewVariant: "recommended-products",
  catalogIcon: "blocks",
  previewCaption: "Recommended products",
  Preview: recommendedproductsPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "recommended_products",
    sectionType: "recommended-products",
  },
  applyPreset,
};
