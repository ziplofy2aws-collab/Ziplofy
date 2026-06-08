import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { featuredcollectioncarouselPreview } from './preview';
import { applyPreset } from './preset';

export const featuredCollectionCarouselElement: CreateThemeElement = {
  id: "featured-collection-carousel",
  label: "Featured collection: Carousel",
  keywords: ["collection","carousel","slider"],
  previewVariant: "featured-collection-carousel",
  catalogIcon: "blocks",
  previewCaption: "Featured collection: Carousel",
  Preview: featuredcollectioncarouselPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "featured_collection",
    sectionType: "featured-collection",
  },
  applyPreset,
};
