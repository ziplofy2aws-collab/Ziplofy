import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { featuredproductPreview } from './preview';
import { applyPreset } from './preset';

export const featuredProductElement: CreateThemeElement = {
  id: "featured-product",
  label: "Featured product",
  keywords: ["single","spotlight"],
  previewVariant: "featured-product",
  catalogIcon: "blocks",
  previewCaption: "Featured product",
  Preview: featuredproductPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "product_highlight",
    sectionType: "product-highlight",
  },
  applyPreset,
};
