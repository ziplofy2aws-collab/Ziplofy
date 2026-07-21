import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { heroPreview } from './preview';
import { applyPreset } from './preset';

export const heroElement: CreateThemeElement = {
  id: "hero",
  label: "Hero",
  previewVariant: "hero",
  catalogIcon: "hero",
  previewCaption: "Hero",
  Preview: heroPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "hero_main",
    sectionType: "hero",
  },
  applyPreset,
};
