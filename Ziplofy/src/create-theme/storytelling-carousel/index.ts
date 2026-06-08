import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { storytellingcarouselPreview } from './preview';
import { applyPreset } from './preset';

export const storytellingCarouselElement: CreateThemeElement = {
  id: "storytelling-carousel",
  label: "Carousel",
  keywords: ["carousel","slides"],
  previewVariant: "storytelling-carousel",
  catalogIcon: "blocks",
  previewCaption: "Carousel",
  Preview: storytellingcarouselPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "storytelling_carousel",
    sectionType: "storytelling-carousel",
  },
  applyPreset,
};
