import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { producthighlightPreview } from './preview';
import { applyPreset } from './preset';

export const productHighlightElement: CreateThemeElement = {
  id: "product-highlight",
  label: "Product highlight",
  keywords: ["highlight","spotlight"],
  previewVariant: "product-highlight",
  catalogIcon: "blocks",
  previewCaption: "Product highlight",
  Preview: producthighlightPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "product_highlight",
    sectionType: "product-highlight",
  },
  applyPreset,
};
