import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { applyDividerPreset } from './preset';
import { DividerPreview } from './preview';

export const dividerElement: CreateThemeElement = {
  id: 'divider',
  label: 'Divider',
  previewVariant: 'divider',
  catalogIcon: 'divider',
  Preview: DividerPreview,
  editing,
  insert: {
    placement: 'layout',
    group: 'header',
    blueprintId: 'divider',
    sectionType: 'divider',
  },
  applyPreset: applyDividerPreset,
};
