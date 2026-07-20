import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { imagecomparePreview } from './preview';
import { applyPreset } from './preset';

export const imageCompareElement: CreateThemeElement = {
  id: "image-compare",
  label: "Image compare",
  keywords: ["before","after","slider"],
  previewVariant: "image-compare",
  catalogIcon: "blocks",
  previewCaption: "Image compare",
  Preview: imagecomparePreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "image_compare",
    sectionType: "image-compare",
  },
  applyPreset,
};
