import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { splitshowcasePreview } from './preview';
import { applyPreset } from './preset';

export const splitShowcaseElement: CreateThemeElement = {
  id: "split-showcase",
  label: "Split showcase",
  keywords: ["split","showcase"],
  previewVariant: "split-showcase",
  catalogIcon: "hero",
  previewCaption: "Split showcase",
  Preview: splitshowcasePreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "hero_main",
    sectionType: "hero",
  },
  applyPreset,
};
