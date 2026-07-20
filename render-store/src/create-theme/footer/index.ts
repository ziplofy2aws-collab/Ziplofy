import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { applyFooterPreset } from './preset';
import { FooterPreview } from './preview';

export const footerElement: CreateThemeElement = {
  id: 'footer',
  label: 'Footer',
  previewVariant: 'footer-section',
  catalogIcon: 'form',
  previewCaption: 'Email signup with heading and subscribe form',
  Preview: FooterPreview,
  editing,
  insert: {
    placement: 'layout',
    group: 'footer',
    blueprintId: 'footer',
    sectionType: 'footer',
  },
  applyPreset: applyFooterPreset,
};
