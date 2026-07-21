import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Collection links: Spotlight",
  "sectionSettingsOrder": [
    {
      "key": "collectionsPicker",
      "label": "Collections",
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
      "key": "imagePosition",
      "label": "Image position",
      "type": "text"
    },
    {
      "key": "imageUrl",
      "label": "Image",
      "type": "text"
    },
    {
      "key": "backgroundColor",
      "label": "Background color",
      "type": "color"
    },
    {
      "key": "textColor",
      "label": "Text color",
      "type": "color"
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
    }
  ],
  "blocks": [
    {
      "blockId": "collection_link",
      "label": "Collection",
      "settingsOrder": [
        {
          "key": "title",
          "label": "Title",
          "type": "text"
        },
        {
          "key": "imageUrl",
          "label": "Image",
          "type": "text"
        },
        {
          "key": "typographyPreset",
          "label": "Preset",
          "type": "select"
        },
        {
          "key": "font",
          "label": "Font",
          "type": "select"
        },
        {
          "key": "fontSize",
          "label": "Size",
          "type": "select"
        },
        {
          "key": "lineHeight",
          "label": "Line height",
          "type": "select"
        },
        {
          "key": "letterSpacing",
          "label": "Letter spacing",
          "type": "select"
        },
        {
          "key": "textCase",
          "label": "Case",
          "type": "select"
        },
        {
          "key": "wrap",
          "label": "Wrap",
          "type": "select"
        },
        {
          "key": "imageHeight",
          "label": "Height",
          "type": "select"
        },
        {
          "key": "imageRatio",
          "label": "Ratio",
          "type": "select"
        },
        {
          "key": "imageCornerRadius",
          "label": "Corner radius",
          "type": "number"
        },
        {
          "key": "showCount",
          "label": "Show product count",
          "type": "boolean"
        }
      ]
    }
  ]
};
