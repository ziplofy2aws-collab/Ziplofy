import { productCardDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-panel.utils';
import { productCardMediaDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-media-panel.utils';
import { productCardPriceDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-price-panel.utils';
import { productCardTitleDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-title-panel.utils';
import { mergeRecommendedProductsHeaderSettings } from '../create-theme/sidebar/theme-editor-recommended-products-header-panel.utils';
import {
  RECOMMENDED_PRODUCTS_CARD_NESTED_ORDER,
  RECOMMENDED_PRODUCTS_SECTION_BLOCK_ORDER,
} from './recommended-products-sidebar.util';

const CARD_SPECS = [
  { shirtColor: '#d45454', withSun: false },
  { shirtColor: '#5a9a6a', withSun: false },
  { shirtColor: '#4b5563', withSun: true },
  { shirtColor: '#d45454', withSun: false },
] as const;

function productCardBlockSettings(): Record<string, unknown> {
  return {
    ...productCardDefaultSettings(),
    ...productCardMediaDefaultSettings(),
    ...productCardTitleDefaultSettings(),
    ...productCardPriceDefaultSettings(),
    priceWidth: 'fit',
    showMedia: true,
    showTitle: true,
    showPrice: true,
  };
}

export function recommendedProductsSectionBlocks(): {
  block_order: string[];
  blocks: Record<string, unknown>;
} {
  return {
    block_order: [...RECOMMENDED_PRODUCTS_SECTION_BLOCK_ORDER],
    blocks: {
      product_card: {
        type: 'product-card',
        settings: productCardBlockSettings(),
        block_order: [...RECOMMENDED_PRODUCTS_CARD_NESTED_ORDER],
        nested_block_order: [...RECOMMENDED_PRODUCTS_CARD_NESTED_ORDER],
        blocks: {},
      },
    },
  };
}

/** Defaults for Recommended products sections. */
export function applyRecommendedProductsPreset(section: Record<string, unknown>): void {
  if (section.type !== 'recommended-products') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'recommended-products';
  settings.heading = settings.heading ?? 'Related products';
  mergeRecommendedProductsHeaderSettings(settings);
  settings.productId = settings.productId ?? '';
  settings.recommendationType = settings.recommendationType ?? 'related';
  settings.cardStyle = settings.cardStyle ?? 'grid';
  settings.carouselOnMobile = settings.carouselOnMobile ?? false;
  settings.productCount = settings.productCount ?? 4;
  settings.columns = settings.columns ?? 4;
  settings.mobileColumns = settings.mobileColumns ?? '2';
  settings.horizontalGap = settings.horizontalGap ?? 12;
  settings.verticalGap = settings.verticalGap ?? 24;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.layoutGap = settings.layoutGap ?? 28;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.backgroundColor = settings.backgroundColor ?? 'default';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];
  const hasProductCard = Boolean(blocks.product_card);

  if (!hasProductCard || order.some((id) => id.startsWith('product_'))) {
    const preset = recommendedProductsSectionBlocks();
    section.block_order = preset.block_order;
    section.blocks = JSON.parse(JSON.stringify(preset.blocks)) as Record<string, unknown>;
    return;
  }

  const productCard = blocks.product_card as {
    settings?: Record<string, unknown>;
    block_order?: string[];
    nested_block_order?: string[];
  };
  productCard.settings = { ...productCardBlockSettings(), ...(productCard.settings ?? {}) };
  productCard.block_order = [...RECOMMENDED_PRODUCTS_CARD_NESTED_ORDER];
  productCard.nested_block_order = [...RECOMMENDED_PRODUCTS_CARD_NESTED_ORDER];
  section.blocks = blocks;
  section.block_order = order.filter((id) => id === 'product_card').length
    ? order.filter((id) => id === 'product_card')
    : [...RECOMMENDED_PRODUCTS_SECTION_BLOCK_ORDER];
}

/** Ensure recommended-products sections use Header + Product card hierarchy. */
export function ensureRecommendedProductsSectionBlocks(
  config: Record<string, unknown>
): boolean {
  let changed = false;

  const migrateSection = (sec: Record<string, unknown>) => {
    if (sec.type !== 'recommended-products') return;
    const settings = (sec.settings ?? {}) as { catalogVariant?: string };
    if (settings.catalogVariant !== 'recommended-products' && settings.catalogVariant !== undefined) {
      return;
    }
    const before = JSON.stringify(sec);
    applyRecommendedProductsPreset(sec);
    if (JSON.stringify(sec) !== before) changed = true;
  };

  for (const sec of Object.values(
    (config.sections ?? {}) as Record<string, Record<string, unknown>>
  )) {
    migrateSection(sec);
  }

  const templates = config.templates as
    | Record<string, { sections?: Record<string, Record<string, unknown>> }>
    | undefined;
  for (const tpl of Object.values(templates ?? {})) {
    for (const sec of Object.values(tpl?.sections ?? {})) {
      migrateSection(sec);
    }
  }

  return changed;
}

export { CARD_SPECS };
