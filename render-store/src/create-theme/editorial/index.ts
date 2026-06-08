import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { editorialPreview } from './preview';
import { applyPreset } from './preset';

export const editorialElement: CreateThemeElement = {
  id: "editorial",
  label: "Editorial",
  keywords: ["story","article"],
  previewVariant: "storytelling-editorial",
  catalogIcon: "text",
  previewCaption: "Editorial",
  Preview: editorialPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "editorial",
    sectionType: "editorial",
  },
  applyPreset,
};
