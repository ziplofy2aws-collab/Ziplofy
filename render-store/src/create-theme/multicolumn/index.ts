import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { multicolumnPreview } from './preview';
import { applyPreset } from './preset';

export const multicolumnElement: CreateThemeElement = {
  id: "multicolumn",
  label: "Multicolumn",
  keywords: ["columns","grid"],
  previewVariant: "multicolumn",
  catalogIcon: "text",
  previewCaption: "Multicolumn",
  Preview: multicolumnPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "multicolumn_section",
    sectionType: "multicolumn",
  },
  applyPreset,
};
