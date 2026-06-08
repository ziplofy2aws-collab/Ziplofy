import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { groupBlockPreview } from './preview';

export const groupBlock: CreateThemeBlock = {
  id: "group",
  label: "Group",
  category: "layout",
  keywords: ["container","wrapper"],
  extendedOnly: false,
  Preview: groupBlockPreview,
  editing,
};
