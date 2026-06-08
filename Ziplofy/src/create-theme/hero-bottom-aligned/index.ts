import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { herobottomalignedPreview } from './preview';
import { applyPreset } from './preset';

export const heroBottomAlignedElement: CreateThemeElement = {
  id: "hero-bottom-aligned",
  label: "Hero: Bottom aligned",
  keywords: ["bottom","aligned"],
  previewVariant: "hero-bottom-aligned",
  catalogIcon: "hero",
  previewCaption: "Hero: Bottom aligned",
  Preview: herobottomalignedPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "hero_main",
    sectionType: "hero",
  },
  applyPreset,
};
