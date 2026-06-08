import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { descriptionBlockPreview } from './preview';

export const descriptionBlock: CreateThemeBlock = {
  id: "description",
  label: "Description",
  category: "product",
  keywords: ["body","details"],
  extendedOnly: true,
  Preview: descriptionBlockPreview,
  editing,
};
