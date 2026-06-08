import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { pullquotePreview } from './preview';
import { applyPreset } from './preset';

export const pullQuoteElement: CreateThemeElement = {
  id: "pull-quote",
  label: "Pull quote",
  keywords: ["quote","testimonial"],
  previewVariant: "pull-quote",
  catalogIcon: "text",
  previewCaption: "Pull quote",
  Preview: pullquotePreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "pull_quote_section",
    sectionType: "pull-quote",
  },
  applyPreset,
};
