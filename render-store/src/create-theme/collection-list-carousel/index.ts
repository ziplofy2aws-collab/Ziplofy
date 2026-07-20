import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { collectionlistcarouselPreview } from './preview';
import { applyPreset } from './preset';

export const collectionListCarouselElement: CreateThemeElement = {
  id: "collection-list-carousel",
  label: "Collection list: Carousel",
  keywords: ["collection","list","carousel","slider"],
  previewVariant: "collection-list-carousel",
  catalogIcon: "hero",
  previewCaption: "Collection list: Carousel",
  Preview: collectionlistcarouselPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "collection_list_carousel",
    sectionType: "collection-list-carousel",
  },
  applyPreset,
};
