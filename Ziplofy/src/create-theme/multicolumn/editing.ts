import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Multicolumn",
  "sectionSettingsOrder": [
    {
      "key": "direction",
      "label": "Direction",
      "type": "text"
    },
    {
      "key": "verticalOnMobile",
      "label": "Vertical on mobile",
      "type": "boolean"
    },
    {
      "key": "layoutAlignment",
      "label": "Alignment",
      "type": "text"
    },
    {
      "key": "position",
      "label": "Position",
      "type": "text"
    },
    {
      "key": "layoutGap",
      "label": "Gap",
      "type": "number"
    },
    {
      "key": "columns",
      "label": "Columns",
      "type": "number"
    },
    {
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "height",
      "label": "Height",
      "type": "text"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "backgroundMedia",
      "label": "Background media",
      "type": "text"
    },
    {
      "key": "backgroundImageUrl",
      "label": "Background image",
      "type": "text"
    },
    {
      "key": "borderStyle",
      "label": "Borders",
      "type": "text"
    },
    {
      "key": "cornerRadius",
      "label": "Corner radius",
      "type": "number"
    },
    {
      "key": "backgroundOverlay",
      "label": "Background overlay",
      "type": "boolean"
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
      "blockId": "multicolumn_item",
      "label": "Column",
      "settingsOrder": [
        {
          "key": "heading",
          "label": "Heading",
          "type": "text"
        },
        {
          "key": "text",
          "label": "Description",
          "type": "textarea"
        }
      ]
    }
  ]
};
