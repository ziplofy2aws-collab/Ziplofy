import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { faqPreview } from './preview';
import { applyPreset } from './preset';

export const faqElement: CreateThemeElement = {
  id: "faq",
  label: "FAQ",
  keywords: ["questions","accordion"],
  previewVariant: "faq",
  catalogIcon: "text",
  previewCaption: "FAQ",
  Preview: faqPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "faq_section",
    sectionType: "faq",
  },
  applyPreset,
};
