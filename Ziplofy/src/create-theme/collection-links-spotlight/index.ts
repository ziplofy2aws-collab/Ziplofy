import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { collectionlinksspotlightPreview } from './preview';
import { applyPreset } from './preset';

export const collectionLinksSpotlightElement: CreateThemeElement = {
  id: "collection-links-spotlight",
  label: "Collection links: Spotlight",
  keywords: ["collection","links","spotlight"],
  previewVariant: "collection-links-spotlight",
  catalogIcon: "link",
  previewCaption: "Collection links: Spotlight",
  Preview: collectionlinksspotlightPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "collection_links_spotlight",
    sectionType: "collection-links-spotlight",
  },
  applyPreset,
};
