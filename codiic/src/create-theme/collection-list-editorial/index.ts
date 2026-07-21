import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { collectionlisteditorialPreview } from './preview';
import { applyPreset } from './preset';

export const collectionListEditorialElement: CreateThemeElement = {
  id: "collection-list-editorial",
  label: "Collection list: Editorial",
  keywords: ["collection","list","editorial","story"],
  previewVariant: "collection-list-editorial",
  catalogIcon: "hero",
  previewCaption: "Collection list: Editorial",
  Preview: collectionlisteditorialPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "collection_list_editorial",
    sectionType: "collection-list-editorial",
  },
  applyPreset,
};
