import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { applyPoliciesLinksPreset } from './preset';
import { PoliciesLinksPreview } from './preview';

export const policiesLinksElement: CreateThemeElement = {
  id: 'policies-links',
  label: 'Policies and links',
  previewVariant: 'policies-links',
  catalogIcon: 'link',
  Preview: PoliciesLinksPreview,
  editing,
  insert: {
    placement: 'layout',
    group: 'footer',
    blueprintId: 'footer_utilities',
    sectionType: 'footer-utilities',
  },
  applyPreset: applyPoliciesLinksPreset,
};
