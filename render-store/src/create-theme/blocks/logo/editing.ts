import type { CreateThemeBlockEditing } from '../types';

export const editing: CreateThemeBlockEditing = {
  "blockId": "logo",
  "label": "Logo",
  "settingsOrder": [
    {
      "key": "text",
      "label": "Store name",
      "type": "text"
    },
    {
      "key": "tagline",
      "label": "Tagline",
      "type": "text"
    },
    {
      "key": "position",
      "label": "Position",
      "type": "text"
    },
    {
      "key": "hideLogoOnHomePage",
      "label": "Hide logo on home page",
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
    }
  ]
};
