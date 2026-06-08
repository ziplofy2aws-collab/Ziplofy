import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { textBlockPreview } from './preview';

export const textBlock: CreateThemeBlock = {
  id: "text",
  label: "Text",
  category: "basic",
  keywords: ["paragraph","body"],
  extendedOnly: false,
  Preview: textBlockPreview,
  editing,
};
