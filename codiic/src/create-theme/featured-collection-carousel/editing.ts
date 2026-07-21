import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Featured collection",
  "sectionSettingsOrder": [
    {
      "key": "collectionHandle",
      "label": "Collection",
      "type": "text"
    },
    {
      "key": "layoutType",
      "label": "Type",
      "type": "text"
    },
    {
      "key": "carouselOnMobile",
      "label": "Carousel on mobile",
      "type": "boolean"
    },
    {
      "key": "productsToShow",
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
      "key": "subtitle",
      "label": "Section subtitle (legacy)",
      "type": "textarea"
    },
    {
      "key": "showRating",
      "label": "Show ratings (legacy)",
      "type": "boolean"
    },
    {
      "key": "emptyMessage",
      "label": "Empty collection message",
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
      "key": "sectionGap",
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
      "blockId": "collection_header",
      "label": "Header",
      "settingsOrder": [
        {
          "key": "subtitle",
          "label": "Header subtitle",
          "type": "text"
        },
        {
          "key": "viewAllLabel",
          "label": "View all label",
          "type": "text"
        },
        {
          "key": "viewAllHref",
          "label": "View all link",
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
          "key": "alignTextBaseline",
          "label": "Align text baseline",
          "type": "boolean"
        },
        {
          "key": "layoutGap",
          "label": "Gap",
          "type": "number"
        },
        {
          "key": "direction",
          "label": "Direction",
          "type": "text"
        },
        {
          "key": "width",
          "label": "Width",
          "type": "text"
        },
        {
          "key": "mobileWidth",
          "label": "Mobile width",
          "type": "text"
        },
        {
          "key": "height",
          "label": "Height",
          "type": "text"
        },
        {
          "key": "inheritColorScheme",
          "label": "Inherit color scheme",
          "type": "boolean"
        },
        {
          "key": "backgroundMedia",
          "label": "Background media",
          "type": "text"
        },
        {
          "key": "backgroundImageUrl",
          "label": "Background image URL",
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
          "key": "paddingLeft",
          "label": "Left",
          "type": "number"
        },
        {
          "key": "paddingRight",
          "label": "Right",
          "type": "number"
        }
      ]
    },
    {
      "blockId": "product_card",
      "label": "Product card",
      "settingsOrder": [
        {
          "key": "verticalGap",
          "label": "Vertical gap",
          "type": "number"
        },
        {
          "key": "inheritColorScheme",
          "label": "Inherit color scheme",
          "type": "boolean"
        },
        {
          "key": "borderStyle",
          "label": "Style",
          "type": "text"
        },
        {
          "key": "cornerRadius",
          "label": "Corner radius",
          "type": "number"
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
          "key": "paddingLeft",
          "label": "Left",
          "type": "number"
        },
        {
          "key": "paddingRight",
          "label": "Right",
          "type": "number"
        },
        {
          "key": "showMedia",
          "label": "Show media",
          "type": "boolean"
        },
        {
          "key": "showTitle",
          "label": "Show title",
          "type": "boolean"
        },
        {
          "key": "showPrice",
          "label": "Show price",
          "type": "boolean"
        }
      ]
    }
  ]
};
