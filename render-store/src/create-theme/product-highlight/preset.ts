import { PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER, PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER } from './sidebar-blocks';

function productHighlightSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  return {
    block_order: [...PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER],
    blocks: {
      product_media: {
        type: 'product-media',
        settings: {
          aspectRatio: 'auto',
          constrainToScreenHeight: true,
          mediaFit: 'cover',
          cornerRadius: 0,
          extendMediaToScreenEdge: false,
          enableZoom: false,
          videoLooping: false,
          hideUnselectedVariantMedia: false,
          carouselIcons: 'arrows',
          carouselPagination: 'counter',
          carouselMobilePagination: 'dots',
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      product: {
        type: 'group',
        block_order: [...PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER],
        blocks: {
          title: { type: 'title', settings: { typographyPreset: 'heading-3' } },
          price: { type: 'price', settings: { typographyPreset: 'default' } },
          image: { type: 'image', settings: { aspectRatio: 'auto', constrainToScreenHeight: true } },
          swatches: { type: 'swatches', settings: { alignment: 'left' } },
        },
      },
    },
  };
}

/** Defaults applied when inserting Product highlight from the catalog. */
export function applyPreset(section: Record<string, unknown>): void {
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
