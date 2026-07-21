import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { buttonBlockPreview } from './preview';

export const buttonBlock: CreateThemeBlock = {
  id: "button",
  label: "Button",
  category: "basic",
  keywords: ["cta","link"],
  extendedOnly: false,
  Preview: buttonBlockPreview,
  editing,
};
