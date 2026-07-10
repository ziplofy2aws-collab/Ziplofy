import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Layered slideshow",
  "sectionSettingsOrder": [
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
      "key": "cornerRadius",
      "label": "Corner radius",
      "type": "number"
    },
    {
      "key": "borderThickness",
      "label": "Border thickness",
      "type": "number"
    },
    {
      "key": "dropShadow",
      "label": "Drop shadow",
      "type": "boolean"
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
      "blockId": "slideshow_slide",
      "label": "Slide",
      "settingsOrder": [
        {
          "key": "title",
          "label": "Heading",
          "type": "text"
        },
        {
          "key": "body",
          "label": "Text",
          "type": "textarea"
        },
        {
          "key": "buttonLabel",
          "label": "Button label",
          "type": "text"
        },
        {
          "key": "buttonHref",
          "label": "Button link",
          "type": "text"
        },
        {
          "key": "imageUrl",
          "label": "Image",
          "type": "text"
        },
        {
          "key": "peekVariant",
          "label": "Peek style",
          "type": "text"
        }
      ]
    }
  ]
};
