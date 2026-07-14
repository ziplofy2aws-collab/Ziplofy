import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  "sectionLabel": "Header",
  "sectionSettingsOrder": [
    {
      "key": "customerAccountMenu",
      "label": "Menu",
      "type": "text"
    },
    {
      "key": "searchIcon",
      "label": "Search icon",
      "type": "boolean"
    },
    {
      "key": "searchPosition",
      "label": "Position",
      "type": "text"
    },
    {
      "key": "searchRow",
      "label": "Row",
      "type": "text"
    },
    {
      "key": "searchPlaceholder",
      "label": "Search placeholder",
      "type": "text"
    },
    {
      "key": "countryRegionEnabled",
      "label": "Country/Region",
      "type": "boolean"
    },
    {
      "key": "showFlag",
      "label": "Flag",
      "type": "boolean"
    },
    {
      "key": "languageSelectorEnabled",
      "label": "Language selector",
      "type": "boolean"
    },
    {
      "key": "localizationFont",
      "label": "Font",
      "type": "text"
    },
    {
      "key": "localizationSize",
      "label": "Size",
      "type": "text"
    },
    {
      "key": "localizationPosition",
      "label": "Position",
      "type": "text"
    },
    {
      "key": "localizationRow",
      "label": "Row",
      "type": "text"
    },
    {
      "key": "sectionWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "headerHeight",
      "label": "Height",
      "type": "text"
    },
    {
      "key": "stickyMode",
      "label": "Sticky header",
      "type": "text"
    },
    {
      "key": "borderThickness",
      "label": "Border thickness",
      "type": "number"
    },
    {
      "key": "menuStyle",
      "label": "Menu style",
      "type": "text"
    },
    {
      "key": "topRowBackground",
      "label": "Top row background",
      "type": "text"
    },
    {
      "key": "topRowText",
      "label": "Top row text",
      "type": "text"
    },
    {
      "key": "cartBubbleStyle",
      "label": "Bubble style",
      "type": "select"
    },
    {
      "key": "cartBubbleBackground",
      "label": "Background",
      "type": "color"
    },
    {
      "key": "cartBubbleText",
      "label": "Text",
      "type": "color"
    },
    {
      "key": "homeTransparentBackground",
      "label": "Home page",
      "type": "boolean"
    },
    {
      "key": "productTransparentBackground",
      "label": "Product page",
      "type": "boolean"
    },
    {
      "key": "collectionTransparentBackground",
      "label": "Collection page",
      "type": "boolean"
    },
    {
      "key": "defaultLogoUrl",
      "label": "Default logo",
      "type": "text"
    },
    {
      "key": "cartType",
      "label": "Type",
      "type": "text"
    },
    {
      "key": "productTitleCase",
      "label": "Product title case",
      "type": "text"
    },
    {
      "key": "emptyCartLink",
      "label": "Empty cart button link",
      "type": "text"
    },
    {
      "key": "cartDrawerAutoOpen",
      "label": "\"Add to cart\" auto-opens drawer",
      "type": "boolean"
    },
    {
      "key": "cartLabel",
      "label": "Cart label",
      "type": "text"
    },
    {
      "key": "customCss",
      "label": "Custom CSS",
      "type": "textarea"
    }
  ],
  "blocks": [
    {
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
    },
    {
      "blockId": "menu",
      "label": "Menu",
      "settingsOrder": [
        { "key": "menu", "label": "Menu", "type": "select" },
        { "key": "backgroundColor", "label": "Background color", "type": "text" },
        { "key": "textColor", "label": "Text color", "type": "text" },
        { "key": "topLevelSize", "label": "Top level size", "type": "select" },
        { "key": "submenuSize", "label": "Submenu size", "type": "select" },
        { "key": "font", "label": "Font", "type": "select" },
        { "key": "textCase", "label": "Case", "type": "select" },
        { "key": "submenuMediaType", "label": "Media type", "type": "select" },
        { "key": "submenuImageRatio", "label": "Image ratio", "type": "select" },
        { "key": "submenuImageCornerRadius", "label": "Image corner radius", "type": "number" },
        { "key": "mobileNavigationBar", "label": "Navigation bar", "type": "boolean" },
        { "key": "mobileAccordion", "label": "Accordion", "type": "boolean" },
        { "key": "mobileDividers", "label": "Dividers", "type": "boolean" }
      ]
    }
  ]
};
