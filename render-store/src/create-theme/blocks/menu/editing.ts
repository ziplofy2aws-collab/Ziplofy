import type { CreateThemeBlockEditing } from '../types';

export const editing: CreateThemeBlockEditing = {
  "blockId": "menu",
  "label": "Menu",
  "settingsOrder": [
    {
      "key": "position",
      "label": "Position",
      "type": "text"
    },
    {
      "key": "row",
      "label": "Row",
      "type": "text"
    },
    {
      "key": "menu",
      "label": "Menu",
      "type": "text"
    },
    {
      "key": "colorScheme",
      "label": "Color scheme",
      "type": "text"
    },
    {
      "key": "topLevelSize",
      "label": "Top level size",
      "type": "text"
    },
    {
      "key": "submenuSize",
      "label": "Submenu size",
      "type": "text"
    },
    {
      "key": "font",
      "label": "Font",
      "type": "text"
    },
    {
      "key": "textCase",
      "label": "Case",
      "type": "text"
    },
    {
      "key": "submenuMediaType",
      "label": "Media type",
      "type": "text"
    },
    {
      "key": "submenuImageRatio",
      "label": "Image ratio",
      "type": "text"
    },
    {
      "key": "submenuImageCornerRadius",
      "label": "Image corner radius",
      "type": "number"
    },
    {
      "key": "mobileNavigationBar",
      "label": "Navigation bar",
      "type": "boolean"
    },
    {
      "key": "mobileAccordion",
      "label": "Accordion",
      "type": "boolean"
    },
    {
      "key": "mobileDividers",
      "label": "Dividers",
      "type": "boolean"
    }
  ]
};
