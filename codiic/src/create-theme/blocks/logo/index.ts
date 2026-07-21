import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { logoBlockPreview } from './preview';

export const logoBlock: CreateThemeBlock = {
  id: "logo",
  label: "Logo",
  category: "basic",
  keywords: ["brand","image"],
  extendedOnly: false,
  Preview: logoBlockPreview,
  editing,
};
