import type { CreateThemeBlockEditing } from '../types';

export const editing: CreateThemeBlockEditing = {
  "blockId": "logo",
  "label": "Logo",
  "settingsOrder": [
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
