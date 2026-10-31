import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { spacerBlockPreview } from './preview';

export const spacerBlock: CreateThemeBlock = {
  id: "spacer",
  label: "Spacer",
  category: "layout",
  keywords: ["gap","space"],
  extendedOnly: true,
  Preview: spacerBlockPreview,
  editing,
};
