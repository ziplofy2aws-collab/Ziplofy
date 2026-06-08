import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { applyHeaderPreset } from './preset';
import { HeaderPreview } from './preview';

export const headerElement: CreateThemeElement = {
  id: 'header',
  label: 'Header',
  keywords: ['navigation', 'menu', 'logo', 'search', 'cart'],
  previewVariant: 'header',
  catalogIcon: 'section',
  previewCaption: 'My Store, main menu links, search, account, and cart',
  Preview: HeaderPreview,
  editing,
  insert: {
    placement: 'layout',
    group: 'header',
    blueprintId: 'header',
    sectionType: 'header',
  },
  applyPreset: applyHeaderPreset,
};
