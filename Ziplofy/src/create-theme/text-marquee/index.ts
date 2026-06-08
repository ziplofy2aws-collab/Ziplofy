import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { textmarqueePreview } from './preview';
import { applyPreset } from './preset';

export const textMarqueeElement: CreateThemeElement = {
  id: "text-marquee",
  label: "Marquee",
  keywords: ["ticker","scroll","announcement"],
  previewVariant: "text-marquee",
  catalogIcon: "text",
  previewCaption: "Marquee",
  Preview: textmarqueePreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "text_marquee_section",
    sectionType: "text-marquee",
  },
  applyPreset,
};
