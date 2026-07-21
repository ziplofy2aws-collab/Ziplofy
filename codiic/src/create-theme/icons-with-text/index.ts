import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { iconswithtextPreview } from './preview';
import { applyPreset } from './preset';

export const iconsWithTextElement: CreateThemeElement = {
  id: "icons-with-text",
  label: "Icons with text",
  keywords: ["features","icons"],
  previewVariant: "icons-with-text",
  catalogIcon: "text",
  previewCaption: "Icons with text",
  Preview: iconswithtextPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "icons_with_text",
    sectionType: "icons-with-text",
  },
  applyPreset,
};
