import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Collection links: Spotlight",
  "sectionSettingsOrder": [
    {
      "key": "collectionsPicker",
      "label": "Collections",
      "type": "text"
    },
    {
      "key": "layoutMode",
      "label": "Layout",
      "type": "text"
    },
    {
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "alignment",
      "label": "Alignment",
      "type": "text"
    },
    {
      "key": "imagePosition",
      "label": "Image position",
      "type": "text"
    },
    {
      "key": "imageUrl",
      "label": "Image",
      "type": "text"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "paddingTop",
      "label": "Top",
      "type": "number"
    },
    {
      "key": "paddingBottom",
      "label": "Bottom",
      "type": "number"
    },
    {
      "key": "customCss",
      "label": "Custom CSS",
      "type": "textarea"
    }
  ],
  "blocks": [
    {
      "blockId": "collection_link",
      "label": "Collection",
      "settingsOrder": [
        {
          "key": "title",
          "label": "Title",
          "type": "text"
        },
        {
          "key": "imageUrl",
          "label": "Image",
          "type": "text"
        }
      ]
    }
  ]
};
