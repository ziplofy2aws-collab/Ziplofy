import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Split showcase",
  "sectionSettingsOrder": [
    {
      "key": "media1Type",
      "label": "Type",
      "type": "text"
    },
    {
      "key": "media1ImageUrl",
      "label": "Image",
      "type": "text"
    },
    {
      "key": "media2Type",
      "label": "Type",
      "type": "text"
    },
    {
      "key": "media2ImageUrl",
      "label": "Image",
      "type": "text"
    },
    {
      "key": "mobileStackMedia",
      "label": "Stack media",
      "type": "boolean"
    },
    {
      "key": "mobileDifferentMedia",
      "label": "Show different media on mobile",
      "type": "boolean"
    },
    {
      "key": "mobileImageUrl",
      "label": "Mobile image",
      "type": "text"
    },
    {
      "key": "sectionLink",
      "label": "Link",
      "type": "text"
    },
    {
      "key": "sectionLinkNewTab",
      "label": "Open link in new tab",
      "type": "boolean"
    },
    {
      "key": "direction",
      "label": "Direction",
      "type": "text"
    },
    {
      "key": "alignTextBaseline",
      "label": "Align text baseline",
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
      "key": "customHeight",
      "label": "Custom height",
      "type": "number"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "mediaOverlay",
      "label": "Background overlay",
      "type": "boolean"
    },
    {
      "key": "borderStyle",
      "label": "Style",
      "type": "text"
    },
    {
      "key": "borderThickness",
      "label": "Thickness",
      "type": "number"
    },
    {
      "key": "borderOpacity",
      "label": "Opacity",
      "type": "number"
    },
    {
      "key": "borderColor",
      "label": "Color",
      "type": "text"
    },
    {
      "key": "cornerRadius",
      "label": "Corner radius",
      "type": "number"
    },
    {
      "key": "overlayColor",
      "label": "Overlay color",
      "type": "text"
    },
    {
      "key": "overlayStyle",
      "label": "Overlay style",
      "type": "text"
    },
    {
      "key": "blurredReflection",
      "label": "Blurred reflection",
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
      "key": "eyebrow",
      "label": "Eyebrow",
      "type": "text"
    },
    {
      "key": "subtitle",
      "label": "Text",
      "type": "textarea"
    }
  ],
  "blocks": [
    {
      "blockId": "heading",
      "label": "Text",
      "settingsOrder": [
        {
          "key": "title",
          "label": "Text",
          "type": "textarea"
        },
        {
          "key": "headingWidth",
          "label": "Width",
          "type": "text"
        },
        {
          "key": "headingMaxWidth",
          "label": "Max width",
          "type": "text"
        },
        {
          "key": "headingTypographyPreset",
          "label": "Preset",
          "type": "text"
        },
        {
          "key": "headingColor",
          "label": "Color",
          "type": "text"
        },
        {
          "key": "headingBackgroundEnabled",
          "label": "Background",
          "type": "boolean"
        },
        {
          "key": "headingPaddingTop",
          "label": "Top",
          "type": "number"
        },
        {
          "key": "headingPaddingBottom",
          "label": "Bottom",
          "type": "number"
        },
        {
          "key": "headingPaddingLeft",
          "label": "Left",
          "type": "number"
        },
        {
          "key": "headingPaddingRight",
          "label": "Right",
          "type": "number"
        }
      ]
    },
    {
      "blockId": "text_2",
      "label": "Text",
      "settingsOrder": [
        {
          "key": "text",
          "label": "Text",
          "type": "textarea"
        }
      ]
    },
    {
      "blockId": "primary_button",
      "label": "Button",
      "settingsOrder": [
        {
          "key": "label",
          "label": "Label",
          "type": "text"
        },
        {
          "key": "href",
          "label": "Link",
          "type": "text"
        },
        {
          "key": "openInNewTab",
          "label": "Open link in new tab",
          "type": "boolean"
        },
        {
          "key": "buttonStyle",
          "label": "Style",
          "type": "text"
        },
        {
          "key": "desktopWidth",
          "label": "Desktop width",
          "type": "text"
        },
        {
          "key": "mobileWidth",
          "label": "Mobile width",
          "type": "text"
        },
        {
          "key": "ariaLabel",
          "label": "Accessibility label",
          "type": "text"
        }
      ]
    },
    {
      "blockId": "secondary_button",
      "label": "Secondary button",
      "settingsOrder": [
        {
          "key": "label",
          "label": "Label",
          "type": "text"
        },
        {
          "key": "href",
          "label": "Link",
          "type": "text"
        },
        {
          "key": "openInNewTab",
          "label": "Open link in new tab",
          "type": "boolean"
        },
        {
          "key": "buttonStyle",
          "label": "Style",
          "type": "text"
        },
        {
          "key": "desktopWidth",
          "label": "Desktop width",
          "type": "text"
        },
        {
          "key": "mobileWidth",
          "label": "Mobile width",
          "type": "text"
        },
        {
          "key": "ariaLabel",
          "label": "Accessibility label",
          "type": "text"
        }
      ]
    }
  ]
};
