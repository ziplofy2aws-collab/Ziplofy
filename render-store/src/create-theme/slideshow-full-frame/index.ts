import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { slideshowfullframePreview } from './preview';
import { applyPreset } from './preset';

export const slideshowFullFrameElement: CreateThemeElement = {
  id: "slideshow-full-frame",
  label: "Slideshow: Full frame",
  keywords: ["carousel","full"],
  previewVariant: "slideshow-full-frame",
  catalogIcon: "slideshow",
  previewCaption: "Slideshow: Full frame",
  Preview: slideshowfullframePreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "slideshow_full_frame",
    sectionType: "slideshow-full-frame",
  },
  applyPreset,
};
