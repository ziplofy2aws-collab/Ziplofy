import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { largelogoPreview } from './preview';
import { applyPreset } from './preset';

export const largeLogoElement: CreateThemeElement = {
  id: "large-logo",
  label: "Large logo",
  keywords: ["logo","brand"],
  previewVariant: "large-logo",
  catalogIcon: "hero",
  previewCaption: "Large logo",
  Preview: largelogoPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "hero_main",
    sectionType: "hero",
  },
  applyPreset,
};
