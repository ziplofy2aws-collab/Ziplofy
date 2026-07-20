import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { slideshowinsetPreview } from './preview';
import { applyPreset } from './preset';

export const slideshowInsetElement: CreateThemeElement = {
  id: "slideshow-inset",
  label: "Slideshow: Inset",
  keywords: ["carousel","inset"],
  previewVariant: "slideshow-inset",
  catalogIcon: "slideshow",
  previewCaption: "Slideshow: Inset",
  Preview: slideshowinsetPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "slideshow_inset",
    sectionType: "slideshow-inset",
  },
  applyPreset,
};
