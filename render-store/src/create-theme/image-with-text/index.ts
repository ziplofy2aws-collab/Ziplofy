import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { imagewithtextPreview } from './preview';
import { applyPreset } from './preset';

export const imageWithTextElement: CreateThemeElement = {
  id: "image-with-text",
  label: "Image with text",
  keywords: ["media","copy"],
  previewVariant: "image-with-text",
  catalogIcon: "blocks",
  previewCaption: "Image with text",
  Preview: imagewithtextPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "image_with_text",
    sectionType: "image-with-text",
  },
  applyPreset,
};
