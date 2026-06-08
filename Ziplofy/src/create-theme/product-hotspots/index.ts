import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { producthotspotsPreview } from './preview';
import { applyPreset } from './preset';

export const productHotspotsElement: CreateThemeElement = {
  id: "product-hotspots",
  label: "Product hotspots",
  keywords: ["hotspots","interactive","image"],
  previewVariant: "product-hotspots",
  catalogIcon: "blocks",
  previewCaption: "Product hotspots",
  Preview: producthotspotsPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "product_hotspots",
    sectionType: "product-hotspots",
  },
  applyPreset,
};
