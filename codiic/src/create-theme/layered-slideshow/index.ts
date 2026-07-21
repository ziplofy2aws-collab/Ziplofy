import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { layeredslideshowPreview } from './preview';
import { applyPreset } from './preset';

export const layeredSlideshowElement: CreateThemeElement = {
  id: "layered-slideshow",
  label: "Layered slideshow",
  keywords: ["carousel","layers"],
  previewVariant: "layered-slideshow",
  catalogIcon: "slideshow",
  previewCaption: "Layered slideshow",
  Preview: layeredslideshowPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "layered_slideshow",
    sectionType: "layered-slideshow",
  },
  applyPreset,
};
