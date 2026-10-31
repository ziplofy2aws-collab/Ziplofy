import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { richtextPreview } from './preview';
import { applyPreset } from './preset';

export const richTextElement: CreateThemeElement = {
  id: "rich-text",
  label: "Rich text",
  keywords: ["content","paragraph"],
  previewVariant: "rich-text",
  catalogIcon: "text",
  previewCaption: "Rich text",
  Preview: richtextPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "rich_text_section",
    sectionType: "rich-text",
  },
  applyPreset,
};
