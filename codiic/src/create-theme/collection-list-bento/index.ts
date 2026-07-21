import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { collectionlistbentoPreview } from './preview';
import { applyPreset } from './preset';

export const collectionListBentoElement: CreateThemeElement = {
  id: "collection-list-bento",
  label: "Collection list: Bento",
  keywords: ["collection","list","bento","grid"],
  previewVariant: "collection-list-bento",
  catalogIcon: "hero",
  previewCaption: "Collection list: Bento",
  Preview: collectionlistbentoPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "collection_list_bento",
    sectionType: "collection-list-bento",
  },
  applyPreset,
};
