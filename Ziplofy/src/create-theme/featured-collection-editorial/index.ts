import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { featuredcollectioneditorialPreview } from './preview';
import { applyPreset } from './preset';

export const featuredCollectionEditorialElement: CreateThemeElement = {
  id: "featured-collection-editorial",
  label: "Featured collection: Editorial",
  keywords: ["collection","editorial","story"],
  previewVariant: "featured-collection-editorial",
  catalogIcon: "blocks",
  previewCaption: "Featured collection: Editorial",
  Preview: featuredcollectioneditorialPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "featured_collection",
    sectionType: "featured-collection",
  },
  applyPreset,
};
