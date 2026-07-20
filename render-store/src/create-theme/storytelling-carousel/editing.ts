import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Carousel",
  "sectionSettingsOrder": [
    {
      "key": "heading",
      "label": "Heading",
      "type": "text"
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
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "horizontalGap",
      "label": "Horizontal gap",
      "type": "number"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "navIcon",
      "label": "Icon",
      "type": "text"
    },
    {
      "key": "navIconBackground",
      "label": "Icon background",
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
      "blockId": "carousel_slide",
      "label": "Slide",
      "settingsOrder": [
        {
          "key": "title",
          "label": "Title",
          "type": "text"
        },
        {
          "key": "description",
          "label": "Description",
          "type": "textarea"
        },
        {
          "key": "imageUrl",
          "label": "Image URL",
          "type": "text"
        }
      ]
    }
  ]
};
