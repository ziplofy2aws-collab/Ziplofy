import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { popupLinkBlockPreview } from './preview';

export const popupLinkBlock: CreateThemeBlock = {
  id: "popup-link",
  label: "Popup link",
  category: "links",
  keywords: ["modal","dialog"],
  extendedOnly: true,
  Preview: popupLinkBlockPreview,
  editing,
};
