import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { collectionlistgridPreview } from './preview';
import { applyPreset } from './preset';

export const collectionListGridElement: CreateThemeElement = {
  id: "collection-list-grid",
  label: "Collection list: Grid",
  keywords: ["collection","list","grid","categories"],
  previewVariant: "collection-list-grid",
  catalogIcon: "hero",
  previewCaption: "Collection list: Grid",
  Preview: collectionlistgridPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "collection_list_grid",
    sectionType: "collection-list-grid",
  },
  applyPreset,
};
