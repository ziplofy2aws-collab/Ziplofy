import { productCardDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-panel.utils';
import { productCardMediaDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-media-panel.utils';
import { productCardPriceDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-price-panel.utils';
import { productCardTitleDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-title-panel.utils';
import { textBlockDefaultSettings } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';
import {
  SEARCH_BLOCK_ORDER,
  SEARCH_RESULTS_BLOCK_ORDER,
  SEARCH_RESULTS_CARD_NESTED_ORDER,
} from './search-page-sidebar.util';

export const SEARCH_TEMPLATE_ID = 'search';
export const SEARCH_SECTION_ID = 'search';
export const SEARCH_RESULTS_SECTION_ID = 'search_results';

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
    mediaAspectRatio: '1/1',
    mediaCornerRadius: 0,
  };
}

function defaultSearchSection(): Record<string, unknown> {
  return {
    type: 'search',
    enabled: true,
    settings: {
      paddingTop: 48,
      paddingBottom: 24,
      sectionWidth: 'page',
    },
    blocks: {
      heading: {
        type: 'search-heading',
        enabled: true,
        settings: {
          ...textBlockDefaultSettings('Search'),
          typographyPreset: 'heading-1',
        },
      },
      search_input: {
        type: 'search-input',
        enabled: true,
        settings: {
          placeholder: 'Search',
        },
      },
    },
    block_order: [...SEARCH_BLOCK_ORDER],
  };
}

function defaultSearchResultsSection(): Record<string, unknown> {
  return {
    type: 'search-results',
    enabled: true,
    settings: {
      resultsHeading: 'Products',
      columns: 4,
      mobileColumns: '2',
      productsPerPage: 16,
      horizontalGap: 16,
      verticalGap: 28,
      sectionWidth: 'page',
      paddingTop: 24,
      paddingBottom: 56,
    },
    blocks: {
      filtering_and_sorting: {
        type: 'filtering-and-sorting',
        enabled: false,
        settings: {
          enableFiltering: true,
          enableSorting: true,
        },
      },
      product_card: {
        type: 'product-card',
        enabled: true,
        settings: productCardBlockSettings(),
        block_order: [...SEARCH_RESULTS_CARD_NESTED_ORDER],
        nested_block_order: [...SEARCH_RESULTS_CARD_NESTED_ORDER],
        blocks: {},
      },
    },
    block_order: [...SEARCH_RESULTS_BLOCK_ORDER],
  };
}

function ensureSearchTemplateBucket(
  templates: Record<string, Record<string, unknown>>
): { tpl: Record<string, unknown>; changed: boolean } {
  let tpl = templates[SEARCH_TEMPLATE_ID];
  let changed = false;
  if (!tpl || typeof tpl !== 'object') {
    tpl = {
      name: 'Search',
      sections: {},
      section_order: [],
    };
    templates[SEARCH_TEMPLATE_ID] = tpl;
    changed = true;
  }
  return { tpl, changed };
}

function seedSearchPageSections(tpl: Record<string, unknown>): boolean {
  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  let changed = false;

  if (!sections[SEARCH_SECTION_ID]) {
    sections[SEARCH_SECTION_ID] = defaultSearchSection();
    changed = true;
  }
  if (!sections[SEARCH_RESULTS_SECTION_ID]) {
    sections[SEARCH_RESULTS_SECTION_ID] = defaultSearchResultsSection();
    changed = true;
  }

  // Keep filtering hidden by default when already seeded without enabled flag.
  const filtering = sections[SEARCH_RESULTS_SECTION_ID]?.blocks as
    | Record<string, { enabled?: boolean }>
    | undefined;
  if (filtering?.filtering_and_sorting && filtering.filtering_and_sorting.enabled === undefined) {
    filtering.filtering_and_sorting.enabled = false;
    changed = true;
  }

  const desiredOrder = [SEARCH_SECTION_ID, SEARCH_RESULTS_SECTION_ID];
  for (const id of desiredOrder) {
    if (!order.includes(id)) {
      order.push(id);
      changed = true;
    }
  }

  // Prefer canonical order when only these two sections exist.
  const onlySearchSections =
    order.length === 2 &&
    order.includes(SEARCH_SECTION_ID) &&
    order.includes(SEARCH_RESULTS_SECTION_ID);
  if (onlySearchSections && (order[0] !== SEARCH_SECTION_ID || order[1] !== SEARCH_RESULTS_SECTION_ID)) {
    tpl.section_order = desiredOrder;
    changed = true;
  } else {
    tpl.section_order = order;
  }

  tpl.sections = sections;
  if (!tpl.name) {
    tpl.name = 'Search';
    changed = true;
  }
  return changed;
}

/** Ensure the Search page template has Search + Search results sections. */
export function ensureSearchPageTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let changed = false;

  const { tpl, changed: created } = ensureSearchTemplateBucket(templates);
  if (created) changed = true;
  if (seedSearchPageSections(tpl)) changed = true;

  return changed;
}
