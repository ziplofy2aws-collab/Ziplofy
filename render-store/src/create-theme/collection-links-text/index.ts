import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { collectionlinkstextPreview } from './preview';
import { applyPreset } from './preset';

export const collectionLinksTextElement: CreateThemeElement = {
  id: "collection-links-text",
  label: "Collection links: Text",
  keywords: ["collection","links","text"],
  previewVariant: "collection-links-text",
  catalogIcon: "link",
  previewCaption: "Collection links: Text",
  Preview: collectionlinkstextPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "collection_links_text",
    sectionType: "collection-links-spotlight",
  },
  applyPreset,
};
