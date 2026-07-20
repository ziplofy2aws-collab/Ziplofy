import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Recommended products",
  "sectionSettingsOrder": [
    {
      "key": "heading",
      "label": "Heading",
      "type": "text"
    },
    {
      "key": "productId",
      "label": "Product",
      "type": "text"
    },
    {
      "key": "recommendationType",
      "label": "Type",
      "type": "text"
    },
    {
      "key": "cardStyle",
      "label": "Style",
      "type": "text"
    },
    {
      "key": "carouselOnMobile",
      "label": "Carousel on mobile",
      "type": "boolean"
    },
    {
      "key": "productCount",
      "label": "Product count",
      "type": "number"
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
      "blockId": "recommended_product_card",
      "label": "Product card",
      "settingsOrder": []
    }
  ]
};
