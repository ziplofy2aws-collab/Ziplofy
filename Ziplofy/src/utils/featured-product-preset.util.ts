import {
  FEATURED_PRODUCT_BUY_BUTTONS_NESTED_ORDER,
  FEATURED_PRODUCT_DETAILS_BLOCK_ORDER,
  FEATURED_PRODUCT_HEADER_NESTED_ORDER,
  FEATURED_PRODUCT_SECTION_BLOCK_ORDER,
} from './featured-product-sidebar.util';
import { featuredProductDetailsDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-details-block-panel.utils';
import { featuredProductAddToCartDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-add-to-cart-panel.utils';
import { featuredProductBuyButtonsDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-buy-buttons-block-panel.utils';
import { featuredProductHeaderDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-header-block-panel.utils';
import { featuredProductHeaderPriceDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-header-price-panel.utils';
import { featuredProductHeaderTitleDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-header-title-panel.utils';
import { featuredProductReviewStarsDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-review-stars-block-panel.utils';
import { featuredProductVariantPickerDefaultSettings } from '../create-theme/sidebar/theme-editor-featured-product-variant-picker-block-panel.utils';

/** Block tree for Featured product sidebar (Product media + Details). */
export function featuredProductSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  return {
    block_order: [...FEATURED_PRODUCT_SECTION_BLOCK_ORDER],
    blocks: {
      product_media: {
        type: 'product-media',
        settings: {
          aspectRatio: 'auto',
          constrainToScreenHeight: true,
          mediaFit: 'contain',
          cornerRadius: 0,
          extendMediaToScreenEdge: false,
          enableZoom: true,
          videoLooping: false,
          hideUnselectedVariantMedia: true,
          carouselIcons: 'arrows',
          carouselPagination: 'counter',
          carouselMobilePagination: 'dots',
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      details: {
        type: 'group',
        settings: { ...featuredProductDetailsDefaultSettings() },
        block_order: [...FEATURED_PRODUCT_DETAILS_BLOCK_ORDER],
        blocks: {
          header: {
            type: 'group',
            settings: { ...featuredProductHeaderDefaultSettings() },
            block_order: [...FEATURED_PRODUCT_HEADER_NESTED_ORDER],
            blocks: {
              title: { type: 'title', settings: { ...featuredProductHeaderTitleDefaultSettings() } },
              price: { type: 'price', settings: { ...featuredProductHeaderPriceDefaultSettings() } },
            },
          },
          review_stars: {
            type: 'review-stars',
            settings: { ...featuredProductReviewStarsDefaultSettings() },
          },
          variant_picker: {
            type: 'variant-picker',
            settings: { ...featuredProductVariantPickerDefaultSettings() },
          },
          buy_buttons: {
            type: 'buy-buttons',
            settings: { ...featuredProductBuyButtonsDefaultSettings() },
            block_order: [...FEATURED_PRODUCT_BUY_BUTTONS_NESTED_ORDER],
            blocks: {
              quantity: { type: 'quantity', settings: {} },
              add_to_cart: {
                type: 'add-to-cart',
                settings: { ...featuredProductAddToCartDefaultSettings() },
              },
              accelerated_checkout: { type: 'accelerated-checkout', settings: {} },
            },
          },
        },
      },
    },
  };
}

function mergeFeaturedProductDetailsSettings(blocks: Record<string, unknown>): boolean {
  const details = blocks.details as { settings?: Record<string, unknown> } | undefined;
  if (!details) return false;
  const defaults = featuredProductDetailsDefaultSettings();
  const current = (details.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  const changed = Object.keys(defaults).some((key) => current[key] === undefined);
  details.settings = merged;
  return changed;
}

function mergeFeaturedProductHeaderTitleSettings(blocks: Record<string, unknown>): boolean {
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  const header = details?.blocks?.header as { blocks?: Record<string, unknown> } | undefined;
  const title = header?.blocks?.title as { settings?: Record<string, unknown> } | undefined;
  if (!title) return false;
  const defaults = featuredProductHeaderTitleDefaultSettings();
  const current = (title.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  const changed = Object.keys(defaults).some((key) => current[key] === undefined);
  title.settings = merged;
  return changed;
}

function mergeFeaturedProductHeaderBlockSettings(blocks: Record<string, unknown>): boolean {
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  const header = details?.blocks?.header as { settings?: Record<string, unknown> } | undefined;
  if (!header) return false;
  const defaults = featuredProductHeaderDefaultSettings();
  const current = (header.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  const changed = Object.keys(defaults).some((key) => current[key] === undefined);
  header.settings = merged;
  return changed;
}

function mergeFeaturedProductAddToCartSettings(
  blocks: Record<string, unknown>,
  sectionSettings?: Record<string, unknown>
): boolean {
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  const buyButtons = details?.blocks?.buy_buttons as { blocks?: Record<string, unknown> } | undefined;
  const addToCart = buyButtons?.blocks?.add_to_cart as { settings?: Record<string, unknown> } | undefined;
  if (!addToCart) return false;
  const defaults = featuredProductAddToCartDefaultSettings();
  const current = (addToCart.settings ?? {}) as Record<string, unknown>;
  const merged = {
    ...defaults,
    ...current,
    buttonLabel: current.buttonLabel ?? sectionSettings?.buttonLabel ?? defaults.buttonLabel,
  };
  const changed = Object.keys(defaults).some((key) => current[key] === undefined);
  addToCart.settings = merged;
  return changed;
}

function mergeFeaturedProductReviewStarsSettings(blocks: Record<string, unknown>): boolean {
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  const reviewStars = details?.blocks?.review_stars as { settings?: Record<string, unknown> } | undefined;
  if (!reviewStars) return false;
  const defaults = featuredProductReviewStarsDefaultSettings();
  const current = (reviewStars.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  const changed = Object.keys(defaults).some((key) => current[key] === undefined);
  reviewStars.settings = merged;
  return changed;
}

function mergeFeaturedProductVariantPickerSettings(blocks: Record<string, unknown>): boolean {
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  const variantPicker = details?.blocks?.variant_picker as { settings?: Record<string, unknown> } | undefined;
  if (!variantPicker) return false;
  const defaults = featuredProductVariantPickerDefaultSettings();
  const current = (variantPicker.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  const changed = Object.keys(defaults).some((key) => current[key] === undefined);
  variantPicker.settings = merged;
  return changed;
}

function mergeFeaturedProductBuyButtonsSettings(blocks: Record<string, unknown>): boolean {
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  const buyButtons = details?.blocks?.buy_buttons as {
    settings?: Record<string, unknown>;
    blocks?: Record<string, unknown>;
    block_order?: string[];
  } | undefined;
  if (!buyButtons) return false;
  let changed = false;

  const defaults = featuredProductBuyButtonsDefaultSettings();
  const current = (buyButtons.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  if (Object.keys(defaults).some((key) => current[key] === undefined)) changed = true;
  buyButtons.settings = merged;

  buyButtons.blocks = (buyButtons.blocks ?? {}) as Record<string, unknown>;
  buyButtons.block_order = Array.isArray(buyButtons.block_order) ? buyButtons.block_order : [];

  const nestedDefaults: Record<string, { type: string; settings: Record<string, unknown> }> = {
    quantity: { type: 'quantity', settings: {} },
    add_to_cart: { type: 'add-to-cart', settings: { ...featuredProductAddToCartDefaultSettings() } },
    accelerated_checkout: { type: 'accelerated-checkout', settings: {} },
  };

  for (const [id, preset] of Object.entries(nestedDefaults)) {
    if (!buyButtons.blocks[id]) {
      buyButtons.blocks[id] = { ...preset };
      changed = true;
    }
    if (!buyButtons.block_order.includes(id)) {
      buyButtons.block_order.push(id);
      changed = true;
    }
  }

  const canonicalOrder = [...FEATURED_PRODUCT_BUY_BUTTONS_NESTED_ORDER];
  const ordered = canonicalOrder.filter((id) => buyButtons.block_order!.includes(id));
  const trailing = buyButtons.block_order!.filter((id) => !canonicalOrder.includes(id as (typeof canonicalOrder)[number]));
  const nextOrder = [...ordered, ...trailing];
  if (nextOrder.join('|') !== buyButtons.block_order!.join('|')) {
    buyButtons.block_order = nextOrder;
    changed = true;
  }

  return changed;
}

function mergeFeaturedProductHeaderPriceSettings(blocks: Record<string, unknown>): boolean {
  const details = blocks.details as { blocks?: Record<string, unknown> } | undefined;
  const header = details?.blocks?.header as { blocks?: Record<string, unknown> } | undefined;
  const price = header?.blocks?.price as { settings?: Record<string, unknown> } | undefined;
  if (!price) return false;
  const defaults = featuredProductHeaderPriceDefaultSettings();
  const current = (price.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  const changed = Object.keys(defaults).some((key) => current[key] === undefined);
  price.settings = merged;
  return changed;
}

/** Ensure featured-product sections have block hierarchy (for older configs). */
export function ensureFeaturedProductSectionBlocks(
  config: Record<string, unknown>
): boolean {
  let changed = false;
  const templates = config.templates as
    | Record<string, { sections?: Record<string, Record<string, unknown>> }>
    | undefined;
  for (const tpl of Object.values(templates ?? {})) {
    for (const sec of Object.values(tpl?.sections ?? {})) {
      if (sec.type !== 'product-highlight') continue;
      const settings = (sec.settings ?? {}) as { catalogVariant?: string };
      if (settings.catalogVariant !== 'featured-product') continue;
      const blocks = sec.blocks as Record<string, unknown> | undefined;
      const order = sec.block_order as string[] | undefined;
      if (blocks?.product_media && blocks?.details && order?.includes('product_media')) {
        if (blocks && mergeFeaturedProductDetailsSettings(blocks)) changed = true;
        if (blocks && mergeFeaturedProductHeaderBlockSettings(blocks)) changed = true;
        if (blocks && mergeFeaturedProductHeaderTitleSettings(blocks)) changed = true;
        if (blocks && mergeFeaturedProductHeaderPriceSettings(blocks)) changed = true;
        if (blocks && mergeFeaturedProductReviewStarsSettings(blocks)) changed = true;
        if (blocks && mergeFeaturedProductVariantPickerSettings(blocks)) changed = true;
        if (blocks && mergeFeaturedProductBuyButtonsSettings(blocks)) changed = true;
        if (blocks && mergeFeaturedProductAddToCartSettings(blocks, sec.settings as Record<string, unknown>))
          changed = true;
        continue;
      }
      const preset = featuredProductSectionBlocks();
      sec.block_order = preset.block_order;
      sec.blocks = JSON.parse(JSON.stringify(preset.blocks)) as Record<string, unknown>;
      changed = true;
    }
  }
  return changed;
}

/** Catalog preset for Featured product (product-highlight variant). */

export function applyFeaturedProductPreset(section: Record<string, unknown>): void {
  if (section.type !== 'product-highlight') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'featured-product';
  settings.productId = settings.productId ?? '';
  settings.productTitle = settings.productTitle ?? 'Product title';
  settings.price = settings.price ?? 'Rs. 19.99';
  settings.productImageUrl = settings.productImageUrl ?? '';
  settings.mediaPosition = settings.mediaPosition ?? 'left';
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.equalColumns = settings.equalColumns ?? true;
  settings.limitProductDetailsWidth = settings.limitProductDetailsWidth ?? false;
  settings.layoutGap = settings.layoutGap ?? 48;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.showRating = settings.showRating ?? false;
  settings.rating = settings.rating ?? 4.5;
  settings.reviewCount = settings.reviewCount ?? 3;
  settings.showTaxNote = settings.showTaxNote ?? true;
  settings.taxNote = settings.taxNote ?? 'Taxes included.';
  settings.buttonLabel = settings.buttonLabel ?? 'Sold out';
  settings.soldOut = settings.soldOut ?? true;
  settings.paddingTop = settings.paddingTop ?? 40;
  settings.paddingBottom = settings.paddingBottom ?? 40;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;
  const { block_order, blocks } = featuredProductSectionBlocks();
  section.block_order = block_order;
  section.blocks = blocks;
}
