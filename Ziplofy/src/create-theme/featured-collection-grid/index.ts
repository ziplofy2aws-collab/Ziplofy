import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { featuredcollectiongridPreview } from './preview';
import { applyPreset } from './preset';

export const featuredCollectionGridElement: CreateThemeElement = {
  id: "featured-collection-grid",
  label: "Featured collection: Grid",
  keywords: ["collection","grid"],
  previewVariant: "featured-collection-grid",
  catalogIcon: "blocks",
  previewCaption: "Featured collection: Grid",
  Preview: featuredcollectiongridPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "featured_collection",
    sectionType: "featured-collection",
  },
  applyPreset,
};
