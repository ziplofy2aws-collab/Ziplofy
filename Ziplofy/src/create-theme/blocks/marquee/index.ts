import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { marqueeBlockPreview } from './preview';

export const marqueeBlock: CreateThemeBlock = {
  id: "marquee",
  label: "Marquee",
  category: "decorative",
  keywords: ["scroll","ticker"],
  extendedOnly: false,
  Preview: marqueeBlockPreview,
  editing,
};
