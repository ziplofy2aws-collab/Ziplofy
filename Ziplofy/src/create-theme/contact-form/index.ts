import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { contactformPreview } from './preview';
import { applyPreset } from './preset';

export const contactFormElement: CreateThemeElement = {
  id: "contact-form",
  label: "Contact form",
  keywords: ["email","message","inquiry","contact"],
  previewVariant: "contact-form",
  catalogIcon: "form",
  previewCaption: "Let customers send you a message",
  Preview: contactformPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "contact_form",
    sectionType: "contact-form",
  },
  applyPreset,
};
