import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { titleBlockPreview } from './preview';

export const titleBlock: CreateThemeBlock = {
  id: "title",
  label: "Title",
  category: "product",
  keywords: ["product name","heading"],
  extendedOnly: true,
  Preview: titleBlockPreview,
  editing,
};
