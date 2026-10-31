import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { customsectionPreview } from './preview';
import { applyPreset } from './preset';

export const customSectionElement: CreateThemeElement = {
  id: "custom-section",
  label: "Custom section",
  keywords: ["blank","custom","blocks"],
  previewVariant: "custom-section",
  catalogIcon: "blocks",
  previewCaption: "Build a section with blocks and settings",
  Preview: customsectionPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "custom_section",
    sectionType: "custom-section",
  },
  applyPreset,
};
