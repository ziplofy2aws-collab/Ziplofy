import { applyFeaturedCollectionCatalogPreset } from './featured-collection-preset.util';
import { productCardDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-panel.utils';
import { productCardMediaDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-media-panel.utils';
import { productCardPriceDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-price-panel.utils';
import { productCardTitleDefaultSettings } from '../create-theme/sidebar/theme-editor-product-card-title-panel.utils';
import { defaultNotFoundMainSection, NOT_FOUND_MAIN_BLOCK_ORDER } from '../create-theme/not-found-main/preset';
import { creatorTemplateHasSections } from './theme-editor-static-pack';

export const NOT_FOUND_TEMPLATE_ID = '404';
export const NOT_FOUND_MAIN_SECTION_ID = 'not_found_main';
export const NOT_FOUND_FEATURED_COLLECTION_SECTION_ID = 'featured_collection';

const DEFAULT_SECTION_ORDER = [
  NOT_FOUND_MAIN_SECTION_ID,
  NOT_FOUND_FEATURED_COLLECTION_SECTION_ID,
] as const;

function rewritePathsDeep(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') return value.split(from).join(to);
  if (Array.isArray(value)) return value.map((item) => rewritePathsDeep(item, from, to));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = rewritePathsDeep(child, from, to);
    }
    return out;
  }
  return value;
}

function fallbackFeaturedCollectionCarouselSection(): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'featured-collection',
    enabled: true,
    settings: {
      catalogVariant: 'featured-collection-carousel',
      emptyMessage: 'No products yet.',
      subtitle: '',
      showRating: false,
      gap: 24,
    },
    blocks: {
      collection_header: {
        type: 'collection-header',
        settings: {
          title: 'Featured products',
          viewAllLabel: 'View all',
          viewAllHref: '/collections/all',
          viewAllStyle: 'link',
          layoutAlignment: 'space-between',
          direction: 'horizontal',
          width: 'fill',
        },
        nested_block_order: ['collection_title', 'view_all_button'],
      },
      product_card: {
        type: 'product-card',
        settings: {
          ...productCardDefaultSettings(),
          ...productCardMediaDefaultSettings(),
          ...productCardTitleDefaultSettings(),
          ...productCardPriceDefaultSettings(),
          showMedia: true,
          showTitle: true,
          showPrice: true,
        },
        nested_block_order: ['media', 'product_title', 'price', 'quick_view', 'badge'],
        block_order: ['media', 'product_title', 'price', 'quick_view', 'badge'],
        blocks: {
          quick_view: {
            type: 'quick-view',
            settings: { label: 'Quick view', show: true },
          },
          badge: {
            type: 'badge',
            settings: { saleLabel: 'Sale', newLabel: 'New' },
          },
        },
      },
    },
    block_order: ['collection_header', 'product_card'],
  };
  applyFeaturedCollectionCatalogPreset(section, 'featured-collection-carousel');
  return section;
}

function featuredCollectionFromIndex(
  config: Record<string, unknown>
): Record<string, unknown> | null {
  const indexSec = (
    config.templates as
      | Record<string, { sections?: Record<string, Record<string, unknown>> }>
      | undefined
  )?.index?.sections?.featured_collection;
  if (!indexSec || typeof indexSec !== 'object') return null;

  const cloned = rewritePathsDeep(
    JSON.parse(JSON.stringify(indexSec)),
    'templates.index.sections.featured_collection',
    `templates.${NOT_FOUND_TEMPLATE_ID}.sections.featured_collection`
  ) as Record<string, unknown>;

  cloned.enabled = true;
  applyFeaturedCollectionCatalogPreset(cloned, 'featured-collection-carousel');
  const settings = (cloned.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'featured-collection-carousel';
  cloned.settings = settings;
  return cloned;
}

function defaultFeaturedCollectionSection(
  config: Record<string, unknown>
): Record<string, unknown> {
  return featuredCollectionFromIndex(config) ?? fallbackFeaturedCollectionCarouselSection();
}

function normalize404SectionOrder(order: string[]): string[] {
  const rest = order.filter(
    (id) => id !== NOT_FOUND_MAIN_SECTION_ID && id !== NOT_FOUND_FEATURED_COLLECTION_SECTION_ID
  );
  const hasMain = order.includes(NOT_FOUND_MAIN_SECTION_ID);
  const hasFeatured = order.includes(NOT_FOUND_FEATURED_COLLECTION_SECTION_ID);
  const next: string[] = [];
  if (hasMain) next.push(NOT_FOUND_MAIN_SECTION_ID);
  if (hasFeatured) next.push(NOT_FOUND_FEATURED_COLLECTION_SECTION_ID);
  return [...next, ...rest];
}

/** Catalog remote 404: flat settings only — no Create Theme heading/message/button blocks. */
function isCatalogNotFoundMainSection(section: Record<string, unknown> | undefined): boolean {
  if (!section || typeof section !== 'object') return false;
  const blocks = section.blocks;
  if (!blocks || typeof blocks !== 'object') return true;
  return Object.keys(blocks as Record<string, unknown>).length === 0;
}

/** Seed / upgrade 404 page: 404 message section + featured collection carousel. */
export function ensureNotFoundPageTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let changed = false;

  if (!creatorTemplateHasSections(config, NOT_FOUND_TEMPLATE_ID)) {
    templates[NOT_FOUND_TEMPLATE_ID] = {
      name: '404 page',
      sections: {
        [NOT_FOUND_MAIN_SECTION_ID]: defaultNotFoundMainSection(),
        [NOT_FOUND_FEATURED_COLLECTION_SECTION_ID]: defaultFeaturedCollectionSection(config),
      },
      section_order: [...DEFAULT_SECTION_ORDER],
    };
    return true;
  }

  const tpl = templates[NOT_FOUND_TEMPLATE_ID];
  if (!tpl.sections || typeof tpl.sections !== 'object') {
    tpl.sections = {};
    changed = true;
  }
  const sections = tpl.sections as Record<string, Record<string, unknown>>;

  if (!sections[NOT_FOUND_MAIN_SECTION_ID]) {
    sections[NOT_FOUND_MAIN_SECTION_ID] = defaultNotFoundMainSection();
    changed = true;
  } else if (isCatalogNotFoundMainSection(sections[NOT_FOUND_MAIN_SECTION_ID])) {
    // Keep pack/catalog 404 copy settings — do not inject Create Theme layout blocks.
    const order = Array.isArray(tpl.section_order)
      ? (tpl.section_order as unknown[]).map(String)
      : [];
    if (!order.includes(NOT_FOUND_MAIN_SECTION_ID)) {
      tpl.section_order = [NOT_FOUND_MAIN_SECTION_ID, ...order];
      changed = true;
    }
    return changed;
  } else {
    const existing = sections[NOT_FOUND_MAIN_SECTION_ID];
    const defaults = defaultNotFoundMainSection();
    const nextSettings = {
      ...((defaults.settings as Record<string, unknown>) ?? {}),
      ...((existing.settings as Record<string, unknown>) ?? {}),
    };
    if (!(existing.settings as Record<string, unknown> | undefined)?.title) {
      const headingText =
        (
          (existing.blocks as Record<string, { settings?: Record<string, unknown> }> | undefined)
            ?.heading?.settings as Record<string, unknown> | undefined
        )?.text ??
        (
          (existing.blocks as Record<string, { settings?: Record<string, unknown> }> | undefined)
            ?.heading?.settings as Record<string, unknown> | undefined
        )?.heading;
      if (typeof headingText === 'string' && headingText.trim()) {
        nextSettings.title = headingText;
      }
    }
    const defaultBlocks = (defaults.blocks ?? {}) as Record<string, Record<string, unknown>>;
    const existingBlocks = {
      ...defaultBlocks,
      ...((existing.blocks as Record<string, Record<string, unknown>>) ?? {}),
    } as Record<string, Record<string, unknown>>;
    for (const [blockId, defBlock] of Object.entries(defaultBlocks)) {
      const cur = existingBlocks[blockId] ?? defBlock;
      const defSettings = (defBlock.settings ?? {}) as Record<string, unknown>;
      const curSettings = (cur.settings ?? {}) as Record<string, unknown>;
      existingBlocks[blockId] = {
        ...defBlock,
        ...cur,
        settings: { ...defSettings, ...curSettings },
      };
    }
    const before = JSON.stringify({
      settings: existing.settings ?? {},
      blocks: existing.blocks ?? {},
      block_order: existing.block_order ?? [],
    });
    existing.settings = nextSettings;
    existing.blocks = existingBlocks;
    if (!Array.isArray(existing.block_order) || !(existing.block_order as unknown[]).length) {
      existing.block_order = [...NOT_FOUND_MAIN_BLOCK_ORDER];
    }
    const after = JSON.stringify({
      settings: existing.settings ?? {},
      blocks: existing.blocks ?? {},
      block_order: existing.block_order ?? [],
    });
    if (before !== after) changed = true;
  }

  if (!sections[NOT_FOUND_FEATURED_COLLECTION_SECTION_ID]) {
    sections[NOT_FOUND_FEATURED_COLLECTION_SECTION_ID] = defaultFeaturedCollectionSection(config);
    changed = true;
  }

  const order = Array.isArray(tpl.section_order)
    ? (tpl.section_order as unknown[]).map(String)
    : [];
  const normalized = normalize404SectionOrder(
    order.length ? order : [...DEFAULT_SECTION_ORDER]
  );
  const orderJson = JSON.stringify(normalized);
  if (orderJson !== JSON.stringify(order)) {
    tpl.section_order = normalized;
    changed = true;
  } else if (!order.length) {
    tpl.section_order = [...DEFAULT_SECTION_ORDER];
    changed = true;
  }

  return changed;
}
