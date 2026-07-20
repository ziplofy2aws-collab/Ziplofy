import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { customliquidPreview } from './preview';
import { applyPreset } from './preset';

export const customLiquidElement: CreateThemeElement = {
  id: "custom-liquid",
  label: "Custom Liquid",
  keywords: ["liquid","code","html","custom"],
  previewVariant: "text-block",
  catalogIcon: "code",
  previewCaption: "Add custom Liquid code to your theme",
  Preview: customliquidPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "hero_main",
    sectionType: "hero",
  },
  applyPreset,
};
