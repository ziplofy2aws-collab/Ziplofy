import { productHighlightMediaDefaultSettings } from '../create-theme/sidebar/theme-editor-product-highlight-media-block-panel.utils';
import {
  PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER,
  PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER,
} from './product-highlight-sidebar.util';
import {
  productHighlightProductImageDefaultSettings,
  productHighlightProductPriceDefaultSettings,
  productHighlightProductSwatchesDefaultSettings,
  productHighlightProductTitleDefaultSettings,
} from '../create-theme/sidebar/theme-editor-product-highlight-product-block-panel.utils';

/** Block tree for Product highlight sidebar (Product media + Product group). */
export function productHighlightSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  return {
    block_order: [...PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER],
    blocks: {
      product_media: {
        type: 'product-media',
        settings: { ...productHighlightMediaDefaultSettings() },
      },
      product: {
        type: 'group',
        block_order: [...PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER],
        blocks: {
          title: { type: 'title', settings: { ...productHighlightProductTitleDefaultSettings() } },
          price: { type: 'price', settings: { ...productHighlightProductPriceDefaultSettings() } },
          image: { type: 'image', settings: { ...productHighlightProductImageDefaultSettings() } },
          swatches: {
            type: 'swatches',
            settings: { ...productHighlightProductSwatchesDefaultSettings() },
          },
        },
      },
    },
  };
}

/** Shopify-style defaults for Product highlight sections. */
export function applyProductHighlightPreset(section: Record<string, unknown>): void {
  if (section.type !== 'product-highlight') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'product-highlight';
  settings.productId = settings.productId ?? '';
  settings.productTitle = settings.productTitle ?? 'Product title';
  settings.price = settings.price ?? 'Rs. 19.99';
  settings.productImageUrl = settings.productImageUrl ?? '';
  settings.mediaPosition = settings.mediaPosition ?? 'left';
  settings.backgroundColor = settings.backgroundColor ?? 'default';
  settings.colorScheme = settings.colorScheme ?? 'scheme-3';
  settings.paddingTop = settings.paddingTop ?? 0;
  settings.paddingBottom = settings.paddingBottom ?? 0;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const { block_order, blocks } = productHighlightSectionBlocks();
  section.block_order = block_order;
  section.blocks = blocks;
}

function mergeProductHighlightProductNestedBlocks(blocks: Record<string, unknown>): boolean {
  const product = blocks.product as {
    blocks?: Record<string, unknown>;
    block_order?: string[];
  } | undefined;
  if (!product) return false;

  let changed = false;
  product.blocks = (product.blocks ?? {}) as Record<string, unknown>;
  product.block_order = Array.isArray(product.block_order) ? product.block_order : [];

  for (const id of PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER) {
    if (!product.blocks[id]) {
      const defaults =
        id === 'title'
          ? productHighlightProductTitleDefaultSettings()
          : id === 'price'
            ? productHighlightProductPriceDefaultSettings()
            : id === 'image'
              ? productHighlightProductImageDefaultSettings()
              : productHighlightProductSwatchesDefaultSettings();
      product.blocks[id] = {
        type: id === 'swatches' ? 'swatches' : id,
        settings: { ...defaults },
      };
      changed = true;
    } else {
      const block = product.blocks[id] as { settings?: Record<string, unknown> };
      const defaults =
        id === 'title'
          ? productHighlightProductTitleDefaultSettings()
          : id === 'price'
            ? productHighlightProductPriceDefaultSettings()
            : id === 'image'
              ? productHighlightProductImageDefaultSettings()
              : productHighlightProductSwatchesDefaultSettings();
      const current = (block.settings ?? {}) as Record<string, unknown>;
      const merged = { ...defaults, ...current };
      if (Object.keys(defaults).some((key) => current[key] === undefined)) {
        block.settings = merged;
        changed = true;
      }
    }
    if (!product.block_order.includes(id)) {
      product.block_order.push(id);
      changed = true;
    }
  }

  const canonical = [...PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER];
  const ordered = canonical.filter((id) => product.block_order!.includes(id));
  const trailing = product.block_order!.filter(
    (id) => !canonical.includes(id as (typeof canonical)[number])
  );
  const nextOrder = [...ordered, ...trailing];
  if (nextOrder.join('|') !== product.block_order!.join('|')) {
    product.block_order = nextOrder;
    changed = true;
  }

  return changed;
}

function mergeProductHighlightProductMediaSettings(blocks: Record<string, unknown>): boolean {
  const productMedia = blocks.product_media as { settings?: Record<string, unknown> } | undefined;
  if (!productMedia) return false;
  const defaults = productHighlightMediaDefaultSettings();
  const current = (productMedia.settings ?? {}) as Record<string, unknown>;
  const merged = { ...defaults, ...current };
  if (Object.keys(defaults).some((key) => current[key] === undefined)) {
    productMedia.settings = merged;
    return true;
  }
  return false;
}

/** Ensure product-highlight sections have block hierarchy (for older configs). */
export function ensureProductHighlightSectionBlocks(
  config: Record<string, unknown>
): boolean {
  let changed = false;
  const templates = config.templates as
    | Record<string, { sections?: Record<string, Record<string, unknown>> }>
    | undefined;

  for (const tpl of Object.values(templates ?? {})) {
    for (const sec of Object.values(tpl?.sections ?? {})) {
      if (sec.type !== 'product-highlight') continue;
      const settings = (sec.settings ?? {}) as { catalogVariant?: string; backgroundColor?: string };
      if (settings.catalogVariant !== 'product-highlight') continue;

      if (settings.backgroundColor === undefined) {
        settings.backgroundColor = 'default';
        sec.settings = settings;
        changed = true;
      }

      const blocks = sec.blocks as Record<string, unknown> | undefined;
      const order = sec.block_order as string[] | undefined;
      if (blocks?.product_media && blocks?.product && order?.includes('product_media')) {
        if (mergeProductHighlightProductNestedBlocks(blocks)) changed = true;
        if (mergeProductHighlightProductMediaSettings(blocks)) changed = true;
        continue;
      }

      const preset = productHighlightSectionBlocks();
      sec.block_order = preset.block_order;
      sec.blocks = JSON.parse(JSON.stringify(preset.blocks)) as Record<string, unknown>;
      changed = true;
    }
  }

  return changed;
}
