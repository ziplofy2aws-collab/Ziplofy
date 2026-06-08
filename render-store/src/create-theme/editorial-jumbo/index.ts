import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { editorialjumboPreview } from './preview';
import { applyPreset } from './preset';

export const editorialJumboElement: CreateThemeElement = {
  id: "editorial-jumbo",
  label: "Editorial: Jumbo text",
  keywords: ["large","display","headline"],
  previewVariant: "storytelling-editorial-jumbo",
  catalogIcon: "text",
  previewCaption: "Editorial: Jumbo text",
  Preview: editorialjumboPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "editorial_jumbo",
    sectionType: "editorial-jumbo",
  },
  applyPreset,
};
