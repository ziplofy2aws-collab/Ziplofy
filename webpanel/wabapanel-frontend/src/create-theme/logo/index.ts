import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { logoPreview } from './preview';
import { applyPreset } from './preset';

export const logoElement: CreateThemeElement = {
  id: "logo",
  label: "Logo",
  keywords: ["brand"],
  previewVariant: "storytelling-logo",
  catalogIcon: "blocks",
  previewCaption: "Logo",
  Preview: logoPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "storytelling_logo",
    sectionType: "storytelling-logo",
  },
  applyPreset,
};
