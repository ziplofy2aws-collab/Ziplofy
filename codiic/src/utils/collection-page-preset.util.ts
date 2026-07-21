import { productCardDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-panel.utils';
import { productCardMediaDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-media-panel.utils';
import { productCardPriceDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-price-panel.utils';
import { productCardTitleDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-title-panel.utils';
import { textBlockDefaultSettings } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';
import { DEFAULT_COLLECTION_TEMPLATE_ID } from '../create-theme/utils/collection-templates.util';
import { creatorTemplateHasSections } from './theme-editor-static-pack';
import {
  COLLECTION_HEADING_BLOCK_ORDER,
  MAIN_COLLECTION_BLOCK_ORDER,
  MAIN_COLLECTION_CARD_NESTED_ORDER,
} from './collection-page-sidebar.util';

export const COLLECTION_HEADING_SECTION_ID = 'collection_heading';
export const MAIN_COLLECTION_SECTION_ID = 'main_collection';
export const ALL_PRODUCTS_TEMPLATE_ID = 'products';

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

function defaultCollectionHeadingSection(titleText = 'Collection title'): Record<string, unknown> {
  return {
    type: 'collection-heading',
    enabled: true,
    settings: {},
    blocks: {
      title: {
        type: 'collection-heading-title',
        settings: textBlockDefaultSettings(titleText),
      },
      description: {
        type: 'collection-heading-description',
        settings: textBlockDefaultSettings(''),
      },
    },
    block_order: [...COLLECTION_HEADING_BLOCK_ORDER],
  };
}

function defaultMainCollectionSection(): Record<string, unknown> {
  return {
    type: 'main-collection',
    enabled: true,
    settings: {
      columns: 4,
      mobileColumns: '2',
      productsPerPage: 16,
      horizontalGap: 12,
      verticalGap: 24,
      sectionWidth: 'page',
      paddingTop: 24,
      paddingBottom: 48,
    },
    blocks: {
      filtering_and_sorting: {
        type: 'filtering-and-sorting',
        settings: {
          enableFiltering: true,
          enableSorting: true,
        },
      },
      product_card: {
        type: 'product-card',
        settings: productCardBlockSettings(),
        block_order: [...MAIN_COLLECTION_CARD_NESTED_ORDER],
        nested_block_order: [...MAIN_COLLECTION_CARD_NESTED_ORDER],
        blocks: {},
      },
    },
    block_order: [...MAIN_COLLECTION_BLOCK_ORDER],
  };
}

function ensureCollectionTemplateBucket(
  templates: Record<string, Record<string, unknown>>,
  templateId: string,
  defaultName: string
): { tpl: Record<string, unknown>; changed: boolean } {
  let tpl = templates[templateId];
  let changed = false;
  if (!tpl || typeof tpl !== 'object') {
    tpl = {
      name: defaultName,
      sections: {},
      section_order: [],
    };
    templates[templateId] = tpl;
    changed = true;
  }
  return { tpl, changed };
}

function seedCollectionPageSections(
  tpl: Record<string, unknown>,
  headingTitle = 'Collection title'
): boolean {
  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  let changed = false;

  if (!sections[COLLECTION_HEADING_SECTION_ID]) {
    sections[COLLECTION_HEADING_SECTION_ID] = defaultCollectionHeadingSection(headingTitle);
    changed = true;
  }
  if (!sections[MAIN_COLLECTION_SECTION_ID]) {
    sections[MAIN_COLLECTION_SECTION_ID] = defaultMainCollectionSection();
    changed = true;
  }

  for (const id of [COLLECTION_HEADING_SECTION_ID, MAIN_COLLECTION_SECTION_ID]) {
    if (!order.includes(id)) {
      order.push(id);
      changed = true;
    }
  }

  tpl.sections = sections;
  tpl.section_order = order;
  return changed;
}

/** Drop legacy placeholder sections that were incorrectly seeded on the All products template. */
function stripStaleAllProductsPlaceholderSections(tpl: Record<string, unknown>): boolean {
  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  if (!sections[COLLECTION_HEADING_SECTION_ID] || !sections[MAIN_COLLECTION_SECTION_ID]) {
    return false;
  }

  let changed = false;
  for (const id of ['product_highlight', 'featured_product']) {
    if (sections[id]) {
      delete sections[id];
      changed = true;
    }
  }

  const nextOrder = order.filter((id) => sections[id]);
  if (nextOrder.length !== order.length) changed = true;

  tpl.sections = sections;
  tpl.section_order = nextOrder;
  return changed;
}

function ensureCollectionStylePageTemplate(
  config: Record<string, unknown>,
  templateId: string,
  templateName: string,
  headingTitle: string
): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let changed = false;

  const { tpl, changed: created } = ensureCollectionTemplateBucket(
    templates,
    templateId,
    templateName
  );
  if (created) changed = true;
  if (!tpl.name) {
    tpl.name = templateName;
    changed = true;
  }
  if (seedCollectionPageSections(tpl, headingTitle)) changed = true;
  if (templateId === ALL_PRODUCTS_TEMPLATE_ID && stripStaleAllProductsPlaceholderSections(tpl)) {
    changed = true;
  }

  return changed;
}

/** Ensure the Collection page template has default Collection heading + Collection sections. */
export function ensureCollectionPageTemplateBlocks(config: Record<string, unknown>): boolean {
  return ensureCollectionStylePageTemplate(
    config,
    DEFAULT_COLLECTION_TEMPLATE_ID,
    'Default collection',
    'Collection title'
  );
}

/** Ensure the All products page (`/collections/all`) template is editable in the theme editor. */
export function ensureAllProductsPageTemplateBlocks(config: Record<string, unknown>): boolean {
  return ensureCollectionStylePageTemplate(
    config,
    ALL_PRODUCTS_TEMPLATE_ID,
    'All products',
    'All products'
  );
}

/** Seed collection page template from pack when the template bucket is empty. */
export function seedCollectionPageTemplateFromPack(
  config: Record<string, unknown>,
  packDefault: Record<string, unknown>,
  templateId: string = DEFAULT_COLLECTION_TEMPLATE_ID
): boolean {
  if (creatorTemplateHasSections(config, templateId)) return false;

  const packTpl = (
    packDefault.templates as Record<string, Record<string, unknown>> | undefined
  )?.collection;
  if (packTpl && typeof packTpl === 'object') {
    if (!config.templates || typeof config.templates !== 'object') {
      config.templates = {};
    }
    const templates = config.templates as Record<string, Record<string, unknown>>;
    const seeded = JSON.parse(JSON.stringify(packTpl)) as Record<string, unknown>;
    if (templateId.startsWith('collection.')) {
      const existing = templates[templateId];
      seeded.name = existing?.name ?? templateId.replace(/^collection\./, '');
      seeded.basedOn = existing?.basedOn ?? 'collection';
      seeded.assignedCollectionCount = existing?.assignedCollectionCount ?? 0;
    }
    templates[templateId] = seeded;
    return true;
  }

  if (templateId !== DEFAULT_COLLECTION_TEMPLATE_ID) return false;
  return ensureCollectionPageTemplateBlocks(config);
}
