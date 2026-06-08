import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { heromarqueePreview } from './preview';
import { applyPreset } from './preset';

export const heroMarqueeElement: CreateThemeElement = {
  id: "hero-marquee",
  label: "Hero: Marquee",
  keywords: ["marquee","scroll"],
  previewVariant: "hero-marquee",
  catalogIcon: "hero",
  previewCaption: "Hero: Marquee",
  Preview: heromarqueePreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "hero_main",
    sectionType: "hero",
  },
  applyPreset,
};
