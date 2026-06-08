import type { CreateThemeBlockEditing } from '../types';

export const editing: CreateThemeBlockEditing = {
  "blockId": "price",
  "label": "Price",
  "settingsOrder": [
    {
      "key": "priceShowSaleFirst",
      "label": "Show sale price first",
      "type": "boolean"
    },
    {
      "key": "priceInstallments",
      "label": "Installments",
      "type": "boolean"
    },
    {
      "key": "priceTaxInfo",
      "label": "Tax information",
      "type": "boolean"
    },
    {
      "key": "priceTypographyPreset",
      "label": "Preset",
      "type": "text"
    },
    {
      "key": "priceWidth",
      "label": "Width",
      "type": "text"
    },
    {
      "key": "priceAlignment",
      "label": "Alignment",
      "type": "text"
    },
    {
      "key": "priceColor",
      "label": "Color",
      "type": "text"
    },
    {
      "key": "pricePaddingTop",
      "label": "Top",
      "type": "number"
    },
    {
      "key": "pricePaddingBottom",
      "label": "Bottom",
      "type": "number"
    },
    {
      "key": "pricePaddingLeft",
      "label": "Left",
      "type": "number"
    },
    {
      "key": "pricePaddingRight",
      "label": "Right",
      "type": "number"
    },
    {
      "key": "showPrice",
      "label": "Show price",
      "type": "boolean"
    }
  ]
};
