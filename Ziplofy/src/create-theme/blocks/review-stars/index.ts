import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { reviewStarsBlockPreview } from './preview';

export const reviewStarsBlock: CreateThemeBlock = {
  id: "review-stars",
  label: "Review stars",
  category: "product",
  keywords: ["rating","reviews"],
  extendedOnly: true,
  Preview: reviewStarsBlockPreview,
  editing,
};
