import { buttonBlock } from './button';
import { headingBlock } from './heading';
import { logoBlock } from './logo';
import { textBlock } from './text';
import { jumboTextBlock } from './jumbo-text';
import { marqueeBlock } from './marquee';
import { groupBlock } from './group';
import { spacerBlock } from './spacer';
import { menuBlock } from './menu';
import { popupLinkBlock } from './popup-link';
import { buyButtonsBlock } from './buy-buttons';
import { descriptionBlock } from './description';
import { priceBlock } from './price';
import { productCardBlock } from './product-card';
import { productInventoryBlock } from './product-inventory';
import { recommendedProductsBlock } from './recommended-products';
import { reviewStarsBlock } from './review-stars';
import { skuBlock } from './sku';
import { specialInstructionsBlock } from './special-instructions';
import { swatchesBlock } from './swatches';
import { titleBlock } from './title';
import { variantPickerBlock } from './variant-picker';
import type { CreateThemeBlock } from './types';

export const CREATE_THEME_BLOCKS: Record<string, CreateThemeBlock> = {
  "button": buttonBlock,
  "heading": headingBlock,
  "logo": logoBlock,
  "text": textBlock,
  "jumbo-text": jumboTextBlock,
  "marquee": marqueeBlock,
  "group": groupBlock,
  "spacer": spacerBlock,
  "menu": menuBlock,
  "popup-link": popupLinkBlock,
  "buy-buttons": buyButtonsBlock,
  "description": descriptionBlock,
  "price": priceBlock,
  "product-card": productCardBlock,
  "product-inventory": productInventoryBlock,
  "recommended-products": recommendedProductsBlock,
  "review-stars": reviewStarsBlock,
  "sku": skuBlock,
  "special-instructions": specialInstructionsBlock,
  "swatches": swatchesBlock,
  "title": titleBlock,
  "variant-picker": variantPickerBlock,
};

export const CREATE_THEME_BLOCK_LIST = Object.values(CREATE_THEME_BLOCKS);
