import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { emailsignupPreview } from './preview';
import { applyPreset } from './preset';

export const emailSignupElement: CreateThemeElement = {
  id: "email-signup",
  label: "Email signup",
  keywords: ["newsletter","subscribe","mailing"],
  previewVariant: "newsletter",
  catalogIcon: "form",
  previewCaption: "Collect emails with a signup form",
  Preview: emailsignupPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "email_signup",
    sectionType: "email-signup",
  },
  applyPreset,
};
