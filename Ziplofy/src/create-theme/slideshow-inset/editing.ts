import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Slideshow: Inset",
  "sectionSettingsOrder": [
    {
      "key": "sectionLayout",
      "label": "Layout",
      "type": "text"
    },
    {
      "key": "fullWidthOnMobile",
      "label": "Full width on mobile",
      "type": "boolean"
    },
    {
      "key": "gap",
      "label": "Gap",
      "type": "number"
    },
    {
      "key": "cornerRadius",
      "label": "Corner radius",
      "type": "number"
    },
    {
      "key": "mediaHeight",
      "label": "Media height",
      "type": "text"
    },
    {
      "key": "contentPosition",
      "label": "Content position",
      "type": "text"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "navigationIcon",
      "label": "Icons",
      "type": "text"
    },
    {
      "key": "navigationIconBackground",
      "label": "Icon background",
      "type": "text"
    },
    {
      "key": "pagination",
      "label": "Pagination",
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
