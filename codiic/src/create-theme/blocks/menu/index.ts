import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { menuBlockPreview } from './preview';

export const menuBlock: CreateThemeBlock = {
  id: "menu",
  label: "Menu",
  category: "links",
  keywords: ["navigation"],
  extendedOnly: true,
  Preview: menuBlockPreview,
  editing,
};
