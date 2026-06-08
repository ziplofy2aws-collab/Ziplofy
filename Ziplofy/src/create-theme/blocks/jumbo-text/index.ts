import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { jumboTextBlockPreview } from './preview';

export const jumboTextBlock: CreateThemeBlock = {
  id: "jumbo-text",
  label: "Jumbo text",
  category: "decorative",
  keywords: ["large","display"],
  extendedOnly: false,
  Preview: jumboTextBlockPreview,
  editing,
};
