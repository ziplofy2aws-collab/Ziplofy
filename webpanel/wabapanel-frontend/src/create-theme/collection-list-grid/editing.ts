import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Collection list: Grid",
  "sectionSettingsOrder": [
    {
      "key": "heading",
      "label": "Heading",
      "type": "text"
    },
    {
      "key": "collectionsPicker",
      "label": "Collections",
      "type": "text"
    },
    {
      "key": "cardsLayoutType",
      "label": "Type",
      "type": "text"
    },
    {
      "key": "carouselOnMobile",
      "label": "Carousel on mobile",
      "type": "boolean"
    },
    {
      "key": "columns",
      "label": "Columns",
      "type": "number"
    },
    {
      "key": "mobileColumns",
      "label": "Mobile columns",
      "type": "text"
    },
    {
      "key": "horizontalGap",
      "label": "Horizontal gap",
      "type": "number"
    },
    {
      "key": "verticalGap",
      "label": "Vertical gap",
      "type": "number"
    },
    {
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "layoutGap",
      "label": "Gap",
      "type": "number"
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
      "blockId": "collection_tile",
      "label": "Collection",
      "settingsOrder": [
        {
          "key": "title",
          "label": "Title",
          "type": "text"
        },
        {
          "key": "collectionHandle",
          "label": "Collection",
          "type": "text"
        }
      ]
    }
  ]
};
