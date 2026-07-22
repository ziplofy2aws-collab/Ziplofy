import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Slideshow: Full frame",
  "sectionSettingsOrder": [
    {
      "key": "sectionLayout",
      "label": "Layout",
      "type": "text"
    },
    {
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
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
      "key": "backgroundColor",
      "label": "Background color",
      "type": "color"
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
      "key": "autoRotate",
      "label": "Auto-rotate slides",
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
          "key": "headingWidth",
          "label": "Heading width",
          "type": "select"
        },
        {
          "key": "headingMaxWidth",
          "label": "Heading max width",
          "type": "select"
        },
        {
          "key": "headingAlignment",
          "label": "Heading alignment",
          "type": "select"
        },
        {
          "key": "headingTypographyPreset",
          "label": "Heading typography",
          "type": "select"
        },
        {
          "key": "headingColor",
          "label": "Heading color",
          "type": "text"
        },
        {
          "key": "headingBackgroundEnabled",
          "label": "Heading background",
          "type": "boolean"
        },
        {
          "key": "headingBackgroundColor",
          "label": "Heading background color",
          "type": "color"
        },
        {
          "key": "headingCornerRadius",
          "label": "Heading corner radius",
          "type": "number"
        },
        {
          "key": "headingPaddingTop",
          "label": "Heading padding top",
          "type": "number"
        },
        {
          "key": "headingPaddingBottom",
          "label": "Heading padding bottom",
          "type": "number"
        },
        {
          "key": "headingPaddingLeft",
          "label": "Heading padding left",
          "type": "number"
        },
        {
          "key": "headingPaddingRight",
          "label": "Heading padding right",
          "type": "number"
        },
        {
          "key": "bodyWidth",
          "label": "Body width",
          "type": "select"
        },
        {
          "key": "bodyMaxWidth",
          "label": "Body max width",
          "type": "select"
        },
        {
          "key": "bodyAlignment",
          "label": "Body alignment",
          "type": "select"
        },
        {
          "key": "bodyTypographyPreset",
          "label": "Body typography",
          "type": "select"
        },
        {
          "key": "bodyColor",
          "label": "Body color",
          "type": "color"
        },
        {
          "key": "bodyBackgroundEnabled",
          "label": "Body background",
          "type": "boolean"
        },
        {
          "key": "bodyBackgroundColor",
          "label": "Body background color",
          "type": "color"
        },
        {
          "key": "bodyCornerRadius",
          "label": "Body corner radius",
          "type": "number"
        },
        {
          "key": "bodyPaddingTop",
          "label": "Body padding top",
          "type": "number"
        },
        {
          "key": "bodyPaddingBottom",
          "label": "Body padding bottom",
          "type": "number"
        },
        {
          "key": "bodyPaddingLeft",
          "label": "Body padding left",
          "type": "number"
        },
        {
          "key": "bodyPaddingRight",
          "label": "Body padding right",
          "type": "number"
        },
        {
          "key": "buttonOpenInNewTab",
          "label": "Open link in new tab",
          "type": "boolean"
        },
        {
          "key": "buttonStyle",
          "label": "Button style",
          "type": "select"
        },
        {
          "key": "buttonLinkTextColor",
          "label": "Link text color",
          "type": "color"
        },
        {
          "key": "buttonCustomBackground",
          "label": "Button background",
          "type": "color"
        },
        {
          "key": "buttonCustomText",
          "label": "Button text color",
          "type": "color"
        },
        {
          "key": "buttonDesktopWidth",
          "label": "Desktop width",
          "type": "select"
        },
        {
          "key": "buttonDesktopCustomWidth",
          "label": "Desktop custom width",
          "type": "number"
        },
        {
          "key": "buttonMobileWidth",
          "label": "Mobile width",
          "type": "select"
        },
        {
          "key": "buttonMobileCustomWidth",
          "label": "Mobile custom width",
          "type": "number"
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
