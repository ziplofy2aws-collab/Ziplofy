import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { notFoundMainPreview } from './preview';
import { defaultNotFoundMainSection } from './preset';

export const notFoundMainElement: CreateThemeElement = {
  id: 'not-found-main',
  label: '404',
  keywords: ['404', 'not found', 'error', 'page not found'],
  previewVariant: 'rich-text',
  catalogIcon: 'text',
  previewCaption: 'Page not found message with a continue shopping button',
  allowedPreviewPages: ['404'],
  Preview: notFoundMainPreview,
  editing,
  insert: {
    placement: 'template',
    group: 'template',
    blueprintId: 'not_found_main',
    sectionType: 'not-found-main',
  },
  applyPreset: (section) => {
    const preset = defaultNotFoundMainSection();
    Object.assign(section, JSON.parse(JSON.stringify(preset)));
  },
};
