import type { ComponentType } from 'react';
import type { CreateThemeBlockEditing } from '../types';

export type CreateThemeBlockCategory =
  | 'basic'
  | 'collection'
  | 'decorative'
  | 'footer'
  | 'forms'
  | 'layout'
  | 'links'
  | 'product';

export type CreateThemeBlock = {
  id: string;
  label: string;
  category: CreateThemeBlockCategory;
  keywords: string[];
  extendedOnly?: boolean;
  Preview: ComponentType;
  editing: CreateThemeBlockEditing;
};
