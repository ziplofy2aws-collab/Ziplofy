import {
  PRODUCT_PAGE_BUY_BUTTONS_NESTED_ORDER,
  PRODUCT_PAGE_DETAILS_BLOCK_ORDER,
  PRODUCT_PAGE_HEADER_NESTED_ORDER,
  PRODUCT_PAGE_SECTION_BLOCK_ORDER,
} from './product-page-sidebar.util';
import { featuredProductDetailsDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-details-block-panel.utils';
import { featuredProductMediaDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-media-block-panel.utils';
import { featuredProductAddToCartDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-add-to-cart-panel.utils';
import { featuredProductBuyButtonsDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-buy-buttons-block-panel.utils';
import { featuredProductHeaderDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-header-block-panel.utils';
import { featuredProductHeaderPriceDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-header-price-panel.utils';
import { featuredProductHeaderTitleDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-header-title-panel.utils';
import { featuredProductVariantPickerDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-variant-picker-block-panel.utils';

export const PRODUCT_TEMPLATE_ID = 'product';
export const PRODUCT_MAIN_SECTION_ID = 'product_main';

function productMainSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  return {
    block_order: [...PRODUCT_PAGE_SECTION_BLOCK_ORDER],
    blocks: {
      product_media: {
        type: 'product-media',
        enabled: true,
        settings: { ...featuredProductMediaDefaultSettings(), showImage: true },
      },
      details: {
        type: 'group',
        enabled: true,
        settings: { ...featuredProductDetailsDefaultSettings() },
        block_order: [...PRODUCT_PAGE_DETAILS_BLOCK_ORDER],
        blocks: {
          header: {
            type: 'group',
            enabled: true,
            settings: { ...featuredProductHeaderDefaultSettings() },
            block_order: [...PRODUCT_PAGE_HEADER_NESTED_ORDER],
            blocks: {
              title: {
                type: 'title',
                enabled: true,
                settings: { ...featuredProductHeaderTitleDefaultSettings() },
              },
              price: {
                type: 'price',
                enabled: true,
                settings: { ...featuredProductHeaderPriceDefaultSettings() },
              },
            },
          },
          divider: {
            type: 'divider',
            enabled: true,
            settings: {},
          },
          variant_picker: {
            type: 'variant-picker',
            enabled: true,
            settings: { ...featuredProductVariantPickerDefaultSettings() },
          },
          buy_buttons: {
            type: 'buy-buttons',
            enabled: true,
            settings: { ...featuredProductBuyButtonsDefaultSettings() },
            block_order: [...PRODUCT_PAGE_BUY_BUTTONS_NESTED_ORDER],
            blocks: {
              quantity: {
                type: 'quantity',
                enabled: true,
                settings: { inputStyle: 'default' },
              },
              add_to_cart: {
                type: 'add-to-cart',
                enabled: true,
                settings: { ...featuredProductAddToCartDefaultSettings() },
              },
              accelerated_checkout: {
                type: 'accelerated-checkout',
                enabled: true,
                settings: {},
              },
            },
          },
          description: {
            type: 'description',
            enabled: true,
            settings: { showDescription: true },
          },
        },
      },
      disclosures: {
        type: 'disclosures',
        enabled: true,
        settings: {
          title: 'Disclosures',
          body: '',
        },
      },
    },
  };
}

function defaultProductMainSection(): Record<string, unknown> {
  const { block_order, blocks } = productMainSectionBlocks();
  return {
    type: 'product-main',
    enabled: true,
    settings: {
      layoutMode: 'split',
      paddingTop: 48,
      paddingBottom: 56,
      sectionWidth: 'page',
    },
    block_order,
    blocks,
  };
}

function needsProductMainReseed(sec: Record<string, unknown>): boolean {
  const blocks = (sec.blocks ?? {}) as Record<string, unknown>;
  if (!blocks.product_media || !blocks.details) return true;
  // Legacy flat product page shape.
  if (blocks.product_header || blocks.buy_box || blocks.product_content || blocks.trust_badges) {
    return true;
  }
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  if (!details?.blocks?.header || !details?.blocks?.buy_buttons) return true;
  if (!blocks.disclosures) return true;
  return false;
}

function ensureProductTemplateBucket(
  templates: Record<string, Record<string, unknown>>
): { tpl: Record<string, unknown>; changed: boolean } {
  let tpl = templates[PRODUCT_TEMPLATE_ID];
  let changed = false;
  if (!tpl || typeof tpl !== 'object') {
    tpl = {
      name: 'Default product',
      sections: {},
      section_order: [],
    };
    templates[PRODUCT_TEMPLATE_ID] = tpl;
    changed = true;
  }
  return { tpl, changed };
}

function seedProductMainSection(tpl: Record<string, unknown>): boolean {
  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  let changed = false;

  const existing = sections[PRODUCT_MAIN_SECTION_ID];
  if (!existing || needsProductMainReseed(existing)) {
    sections[PRODUCT_MAIN_SECTION_ID] = defaultProductMainSection();
    changed = true;
  }

  if (!order.includes(PRODUCT_MAIN_SECTION_ID)) {
    order.unshift(PRODUCT_MAIN_SECTION_ID);
    changed = true;
  }

  tpl.sections = sections;
  tpl.section_order = order;
  if (!tpl.name) {
    tpl.name = 'Default product';
    changed = true;
  }
  return changed;
}

/** Ensure product template has Product information hierarchy by default. */
export function ensureProductPageTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let changed = false;

  const { tpl, changed: created } = ensureProductTemplateBucket(templates);
  if (created) changed = true;
  if (seedProductMainSection(tpl)) changed = true;

  // Also upgrade alternate product.* templates that still use the legacy shape.
  for (const [tplId, alt] of Object.entries(templates)) {
    if (tplId === PRODUCT_TEMPLATE_ID || !tplId.startsWith('product.')) continue;
    if (!alt || typeof alt !== 'object') continue;
    const sections = (alt.sections ?? {}) as Record<string, Record<string, unknown>>;
    for (const [secId, sec] of Object.entries(sections)) {
      if (sec?.type !== 'product-main') continue;
      if (!needsProductMainReseed(sec)) continue;
      sections[secId] = defaultProductMainSection();
      changed = true;
    }
    alt.sections = sections;
  }

  return changed;
}
