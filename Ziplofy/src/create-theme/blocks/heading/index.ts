import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { headingBlockPreview } from './preview';

export const headingBlock: CreateThemeBlock = {
  id: "heading",
  label: "Heading",
  category: "basic",
  keywords: ["title","h1"],
  extendedOnly: false,
  Preview: headingBlockPreview,
  editing,
};
