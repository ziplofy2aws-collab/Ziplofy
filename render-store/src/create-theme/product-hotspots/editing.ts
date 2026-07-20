import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Product hotspots",
  "sectionSettingsOrder": [
    {
      "key": "heading",
      "label": "Heading",
      "type": "text"
    },
    {
      "key": "imageUrl",
      "label": "Image",
      "type": "text"
    },
    {
      "key": "mediaOverlay",
      "label": "Media overlay",
      "type": "boolean"
    },
    {
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "sectionHeight",
      "label": "Height",
      "type": "text"
    },
    {
      "key": "hotspotColor",
      "label": "Hotspot color",
      "type": "text"
    },
    {
      "key": "innerColor",
      "label": "Inner color",
      "type": "text"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "popoverGap",
      "label": "Vertical gap",
      "type": "number"
    },
    {
      "key": "titleTypography",
      "label": "Product title typography",
      "type": "text"
    },
    {
      "key": "priceTypography",
      "label": "Product price typography",
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
      "blockId": "product_hotspot",
      "label": "Hotspot",
      "settingsOrder": [
        {
          "key": "positionX",
          "label": "Horizontal position",
          "type": "number"
        }
      ]
    }
  ]
};
