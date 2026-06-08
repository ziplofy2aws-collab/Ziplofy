import {
  ANNOUNCEMENT_BAR_DEFAULT_SETTINGS,
  ANNOUNCEMENT_BLOCK_DEFAULT_SETTINGS,
} from '../config/theme-editor-announcement-schema';
import type { ThemePreviewPage } from '../components/themes/ThemeLivePreviewFrame';
import {
  FOOTER_BANNER_RESOLVE,
  FOOTER_FORMS_RESOLVE,
  FOOTER_PRODUCTS_RESOLVE,
  FOOTER_STORYTELLING_RESOLVE,
  FOOTER_TEXT_RESOLVE,
  LAYOUT_SECTION_RESOLVE,
  resolveTemplateCatalogItem,
  type SectionCatalogItem,
  type SectionInsertContext,
} from '../components/themes/theme-editor-sidebar/add-section-catalog';
import type { EditorSchemaDoc } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import {
  listKeyHeaderSections,
  listKeyFooterSections,
  listKeyTemplateSections,
} from '../components/themes/theme-editor-sidebar/theme-editor-structure-order';

export type LayoutOrder = {
  header?: string[];
  footer?: string[];
};

const CATALOG_BLUEPRINT: Record<string, { blueprintId: string; type: string; label: string }> = {
  'announcement-bar': { blueprintId: 'announcement_bar', type: 'announcement-bar', label: 'Announcement bar' },
  divider: { blueprintId: 'divider', type: 'divider', label: 'Divider' },
  hero: { blueprintId: 'hero_main', type: 'hero', label: 'Hero' },
  'featured-collection': { blueprintId: 'featured_collection', type: 'featured-collection', label: 'Featured collection' },
  'featured-collection-carousel': {
    blueprintId: 'featured_collection',
    type: 'featured-collection',
    label: 'Featured collection: Carousel',
  },
  'featured-collection-editorial': {
    blueprintId: 'featured_collection',
    type: 'featured-collection',
    label: 'Featured collection: Editorial',
  },
  'featured-collection-grid': {
    blueprintId: 'featured_collection',
    type: 'featured-collection',
    label: 'Featured collection: Grid',
  },
  footer: { blueprintId: 'footer', type: 'footer', label: 'Footer' },
  'contact-form': { blueprintId: 'contact_form', type: 'contact-form', label: 'Contact form' },
  'email-signup': { blueprintId: 'email_signup', type: 'email-signup', label: 'Email signup' },
  'custom-section': { blueprintId: 'custom_section', type: 'custom-section', label: 'Custom section' },
  'product-highlight': { blueprintId: 'product_highlight', type: 'product-highlight', label: 'Product highlight' },
  'featured-product': { blueprintId: 'product_highlight', type: 'product-highlight', label: 'Featured product' },
  'product-hotspots': { blueprintId: 'product_hotspots', type: 'product-hotspots', label: 'Product hotspots' },
  'recommended-products': {
    blueprintId: 'recommended_products',
    type: 'recommended-products',
    label: 'Recommended products',
  },
  'collection-links-spotlight': {
    blueprintId: 'collection_links_spotlight',
    type: 'collection-links-spotlight',
    label: 'Collection links: Spotlight',
  },
  'collection-links-text': {
    blueprintId: 'collection_links_text',
    type: 'collection-links-spotlight',
    label: 'Collection links: Text',
  },
  'collection-list-bento': {
    blueprintId: 'collection_list_bento',
    type: 'collection-list-bento',
    label: 'Collection list: Bento',
  },
  'collection-list-carousel': {
    blueprintId: 'collection_list_carousel',
    type: 'collection-list-carousel',
    label: 'Collection list: Carousel',
  },
  'collection-list-editorial': {
    blueprintId: 'collection_list_editorial',
    type: 'collection-list-editorial',
    label: 'Collection list: Editorial',
  },
  'collection-list-grid': {
    blueprintId: 'collection_list_grid',
    type: 'collection-list-grid',
    label: 'Collection list: Grid',
  },
  'layered-slideshow': {
    blueprintId: 'layered_slideshow',
    type: 'layered-slideshow',
    label: 'Layered slideshow',
  },
  'slideshow-full-frame': {
    blueprintId: 'slideshow_full_frame',
    type: 'slideshow-full-frame',
    label: 'Slideshow: Full frame',
  },
  'slideshow-inset': {
    blueprintId: 'slideshow_inset',
    type: 'slideshow-inset',
    label: 'Slideshow: Inset',
  },
  editorial: { blueprintId: 'editorial', type: 'editorial', label: 'Editorial' },
  'editorial-jumbo': { blueprintId: 'editorial_jumbo', type: 'editorial-jumbo', label: 'Editorial: Jumbo text' },
  'image-compare': { blueprintId: 'image_compare', type: 'image-compare', label: 'Image compare' },
  'image-with-text': { blueprintId: 'image_with_text', type: 'image-with-text', label: 'Image with text' },
  logo: { blueprintId: 'storytelling_logo', type: 'storytelling-logo', label: 'Logo' },
  video: { blueprintId: 'storytelling_video', type: 'storytelling-video', label: 'Video' },
  faq: { blueprintId: 'faq_section', type: 'faq', label: 'FAQ' },
  'icons-with-text': {
    blueprintId: 'icons_with_text',
    type: 'icons-with-text',
    label: 'Icons with text',
  },
  multicolumn: { blueprintId: 'multicolumn_section', type: 'multicolumn', label: 'Multicolumn' },
  'pull-quote': { blueprintId: 'pull_quote_section', type: 'pull-quote', label: 'Pull quote' },
  'rich-text': { blueprintId: 'rich_text_section', type: 'rich-text', label: 'Rich text' },
  'text-marquee': { blueprintId: 'text_marquee_section', type: 'text-marquee', label: 'Marquee' },
  'blog-posts-carousel': {
    blueprintId: 'blog_posts_carousel',
    type: 'blog-posts-carousel',
    label: 'Blog posts: Carousel',
  },
  'blog-posts-editorial': {
    blueprintId: 'blog_posts_editorial',
    type: 'blog-posts-editorial',
    label: 'Blog posts: Editorial',
  },
  'blog-posts-grid': {
    blueprintId: 'blog_posts_grid',
    type: 'blog-posts-grid',
    label: 'Blog posts: Grid',
  },
  'storytelling-carousel': {
    blueprintId: 'storytelling_carousel',
    type: 'storytelling-carousel',
    label: 'Carousel',
  },
  'policies-links': {
    blueprintId: 'footer_utilities',
    type: 'footer-utilities',
    label: 'Policies and links',
  },
};

import { previewPageToTemplateId, templateIdForPage } from './preview-page-template';
export { previewPageToTemplateId, templateIdForPage };

function getNested(obj: Record<string, unknown>, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function setNested(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

export function getLayoutOrder(config: Record<string, unknown> | null): LayoutOrder {
  const raw = getNested(config ?? {}, ['layout_order']) as LayoutOrder | undefined;
  return raw ?? {};
}

/** Section ids for sidebar — only sections the user placed in `layout_order`. */
export function existingLayoutSectionIds(
  config: Record<string, unknown> | null,
  group: 'header' | 'footer'
): string[] {
  const sections = (config?.sections ?? {}) as Record<string, unknown>;
  const keys = new Set(Object.keys(sections));
  const layoutOrder = getLayoutOrder(config);
  return (layoutOrder[group] ?? []).map(String).filter((id) => keys.has(id));
}

const CREATOR_LAYOUT_VERSION = 2;

/**
 * One-time cleanup: legacy sync auto-inserted the pack Footer + Utilities pair.
 * Runs once per saved config (see `creatorLayoutVersion`).
 */
export function stripLegacyPackFooterDefaults(config: Record<string, unknown>): void {
  const version = (config.creatorLayoutVersion as number) ?? 1;
  if (version >= CREATOR_LAYOUT_VERSION) return;

  const order = getLayoutOrder(config);
  const footer = order.footer ?? [];
  const isPackFooterPair =
    footer.length === 2 && footer.includes('footer') && footer.includes('footer_utilities');

  if (isPackFooterPair) {
    const sections = (config.sections ?? {}) as Record<string, unknown>;
    order.footer = [];
    delete sections.footer;
    delete sections.footer_utilities;
    setNested(config, ['layout_order'], order);
  }

  config.creatorLayoutVersion = CREATOR_LAYOUT_VERSION;
}

/**
 * Theme Creator keeps pack blueprint clones in `packDefault`, not in saved `config.sections`.
 * Drop every layout section that is not listed in `layout_order`.
 */
export function stripCreatorLayoutBlueprintClones(config: Record<string, unknown>): void {
  const sections = (config.sections ?? {}) as Record<string, unknown>;
  const order = getLayoutOrder(config);
  const placed = new Set([...(order.header ?? []), ...(order.footer ?? [])]);

  for (const id of Object.keys(sections)) {
    if (!placed.has(id)) delete sections[id];
  }

  order.header = (order.header ?? []).filter((id) => sections[id] != null);
  order.footer = (order.footer ?? []).filter((id) => sections[id] != null);
  setNested(config, ['layout_order'], order);
}

export function existingTemplateSectionIds(
  config: Record<string, unknown> | null,
  tplId: string
): string[] {
  const tpl = getNested(config ?? {}, ['templates', tplId]) as
    | { section_order?: string[]; sections?: Record<string, unknown> }
    | undefined;
  const sections = tpl?.sections ?? {};
  const keys = new Set(Object.keys(sections));
  if (Array.isArray(tpl?.section_order)) {
    return tpl.section_order.map((id) => String(id)).filter((id) => keys.has(id));
  }
  return Object.keys(sections).filter((id) => keys.has(id));
}

/**
 * Drop section_order / layout_order entries that no longer exist in `sections`
 * (fixes deleted dividers reappearing in sidebar + preview).
 */
export function sanitizeThemeConfigStructure(config: Record<string, unknown>): void {
  const layoutSections = (config.sections ?? {}) as Record<string, unknown>;
  const layoutKeys = new Set(Object.keys(layoutSections));

  const order = getLayoutOrder(config);
  let layoutChanged = false;
  if (order.header) {
    const next = order.header.filter((id) => layoutKeys.has(id));
    if (next.length !== order.header.length) {
      order.header = next;
      layoutChanged = true;
    }
  }
  if (order.footer) {
    const next = order.footer.filter((id) => layoutKeys.has(id));
    if (next.length !== order.footer.length) {
      order.footer = next;
      layoutChanged = true;
    }
  }
  if (layoutChanged) setNested(config, ['layout_order'], order);

  const headerIds = new Set(order.header ?? []);
  const footerIds = new Set(order.footer ?? []);
  const listedLayoutIds = new Set([...headerIds, ...footerIds]);
  for (const id of Object.keys(layoutSections)) {
    if (!listedLayoutIds.has(id)) {
      delete layoutSections[id];
    }
  }

  const templates = (config.templates ?? {}) as Record<
    string,
    { sections?: Record<string, unknown>; section_order?: string[] }
  >;
  for (const [tplId, tpl] of Object.entries(templates)) {
    const sections = tpl.sections ?? {};
    const keys = new Set(Object.keys(sections));
    const order = Array.isArray(tpl.section_order) ? tpl.section_order : [];
    const next = order.filter((id) => keys.has(id));
    tpl.section_order = next;
    for (const id of Object.keys(sections)) {
      if (!next.includes(id)) {
        delete sections[id];
      }
    }
  }
}

export function defaultHeaderSectionOrder(config: Record<string, unknown>): string[] {
  const sections = config.sections as Record<string, unknown> | undefined;
  if (!sections) return [];
  const keys = Object.keys(sections);
  const announcements = keys.filter((k) => k === 'announcement_bar' || k.startsWith('announcement_bar_'));
  const header = keys.includes('header') ? ['header'] : [];
  return [...announcements, ...header];
}

export function defaultFooterSectionOrder(config: Record<string, unknown>): string[] {
  const sections = config.sections as Record<string, unknown> | undefined;
  if (!sections) return [];
  const out: string[] = [];
  if (sections.footer) out.push('footer');
  if (sections.footer_utilities) out.push('footer_utilities');
  return out;
}

export function ensureLayoutOrder(config: Record<string, unknown>): LayoutOrder {
  const layoutOrderRoot = config.layout_order as LayoutOrder | undefined;
  const headerExplicit = layoutOrderRoot != null && Array.isArray(layoutOrderRoot.header);
  const footerExplicit = layoutOrderRoot != null && Array.isArray(layoutOrderRoot.footer);
  const order = getLayoutOrder(config);
  if (!headerExplicit && !order.header?.length) {
    order.header = defaultHeaderSectionOrder(config);
    setNested(config, ['layout_order'], order);
  }
  if (!footerExplicit && !order.footer?.length) {
    order.footer = defaultFooterSectionOrder(config);
    const lo = getLayoutOrder(config);
    lo.footer = order.footer;
    setNested(config, ['layout_order'], lo);
  }
  return getLayoutOrder(config);
}

/** Prune layout_order entries that no longer exist in `sections` (never auto-expand). */
export function syncLayoutOrderFromSections(config: Record<string, unknown>): void {
  ensureLayoutOrder(config);
  const order = getLayoutOrder(config);
  const keys = new Set(Object.keys((config.sections ?? {}) as Record<string, unknown>));
  order.header = (order.header ?? []).filter((id) => keys.has(id));
  order.footer = (order.footer ?? []).filter((id) => keys.has(id));
  setNested(config, ['layout_order'], order);
}

/** Map instance id (e.g. announcement_bar_2) to schema layout blueprint key. */
/** Map template instance id (e.g. featured_collection_2) to schema section blueprint id. */
export function templateBlueprintKey(sectionId: string): string {
  if (
    sectionId === 'hero_main' ||
    sectionId === 'featured_collection' ||
    sectionId === 'divider' ||
    sectionId === 'contact_form' ||
    sectionId === 'email_signup' ||
    sectionId === 'custom_section' ||
    sectionId === 'product_highlight' ||
    sectionId === 'editorial' ||
    sectionId === 'editorial_jumbo' ||
    sectionId === 'image_compare' ||
    sectionId === 'image_with_text' ||
    sectionId === 'storytelling_logo' ||
    sectionId === 'storytelling_video' ||
    sectionId === 'faq_section' ||
    sectionId === 'icons_with_text' ||
    sectionId === 'multicolumn_section' ||
    sectionId === 'pull_quote_section' ||
    sectionId === 'rich_text_section' ||
    sectionId === 'text_marquee_section' ||
    sectionId === 'blog_posts_carousel' ||
    sectionId === 'blog_posts_editorial' ||
    sectionId === 'blog_posts_grid' ||
    sectionId === 'storytelling_carousel' ||
    sectionId === 'product_hotspots' ||
    sectionId === 'recommended_products' ||
    sectionId === 'collection_links_spotlight' ||
    sectionId === 'collection_links_text' ||
    sectionId === 'collection_list_bento' ||
    sectionId === 'collection_list_carousel' ||
    sectionId === 'collection_list_editorial' ||
    sectionId === 'collection_list_grid' ||
    sectionId === 'layered_slideshow' ||
    sectionId === 'slideshow_full_frame'
  ) {
    return sectionId;
  }
  if (sectionId.startsWith('product_highlight')) return 'product_highlight';
  if (sectionId.startsWith('product_hotspots')) return 'product_hotspots';
  if (sectionId.startsWith('recommended_products')) return 'recommended_products';
  if (sectionId.startsWith('collection_links_spotlight')) return 'collection_links_spotlight';
  if (sectionId.startsWith('collection_links_text')) return 'collection_links_text';
  if (sectionId.startsWith('collection_list_bento')) return 'collection_list_bento';
  if (sectionId.startsWith('collection_list_carousel')) return 'collection_list_carousel';
  if (sectionId.startsWith('editorial_jumbo')) return 'editorial_jumbo';
  if (sectionId.startsWith('editorial')) return 'editorial';
  if (sectionId.startsWith('image_compare')) return 'image_compare';
  if (sectionId.startsWith('image_with_text')) return 'image_with_text';
  if (sectionId.startsWith('storytelling_logo')) return 'storytelling_logo';
  if (sectionId.startsWith('storytelling_video')) return 'storytelling_video';
  if (sectionId.startsWith('faq_section')) return 'faq_section';
  if (sectionId.startsWith('icons_with_text')) return 'icons_with_text';
  if (sectionId.startsWith('multicolumn_section')) return 'multicolumn_section';
  if (sectionId.startsWith('pull_quote_section')) return 'pull_quote_section';
  if (sectionId.startsWith('rich_text_section')) return 'rich_text_section';
  if (sectionId.startsWith('text_marquee_section')) return 'text_marquee_section';
  if (sectionId.startsWith('blog_posts_carousel')) return 'blog_posts_carousel';
  if (sectionId.startsWith('blog_posts_editorial')) return 'blog_posts_editorial';
  if (sectionId.startsWith('blog_posts_grid')) return 'blog_posts_grid';
  if (sectionId.startsWith('storytelling_carousel')) return 'storytelling_carousel';
  if (sectionId.startsWith('product_hotspots')) return 'product_hotspots';
  if (sectionId.startsWith('recommended_products')) return 'recommended_products';
  if (sectionId.startsWith('collection_links_spotlight')) return 'collection_links_spotlight';
  if (sectionId.startsWith('collection_links_text')) return 'collection_links_text';
  if (sectionId.startsWith('collection_list_bento')) return 'collection_list_bento';
  if (sectionId.startsWith('collection_list_carousel')) return 'collection_list_carousel';
  if (sectionId.startsWith('collection_list_editorial')) return 'collection_list_editorial';
  if (sectionId.startsWith('collection_list_grid')) return 'collection_list_grid';
  if (sectionId.startsWith('layered_slideshow')) return 'layered_slideshow';
  if (sectionId.startsWith('slideshow_full_frame')) return 'slideshow_full_frame';
  if (sectionId.startsWith('slideshow_inset')) return 'slideshow_inset';
  if (sectionId.startsWith('contact_form')) return 'contact_form';
  if (sectionId.startsWith('email_signup')) return 'email_signup';
  if (sectionId.startsWith('divider')) return 'divider';
  const m = sectionId.match(/^(.+)_\d+$/);
  return m ? m[1] : sectionId;
}

export function remapTemplateSchemaPath(path: string, tplId: string, instanceId: string): string {
  const blueprint = templateBlueprintKey(instanceId);
  if (blueprint === instanceId) return path;
  return path.replace(
    `templates.${tplId}.sections.${blueprint}.`,
    `templates.${tplId}.sections.${instanceId}.`
  );
}

export function layoutBlueprintKey(sectionId: string): string {
  if (sectionId === 'announcement_bar' || sectionId.startsWith('announcement_bar_')) {
    return 'announcement_bar';
  }
  if (sectionId === 'header' || sectionId.startsWith('header_')) {
    return 'header';
  }
  if (sectionId === 'footer_utilities' || sectionId.startsWith('footer_utilities_')) {
    return 'footer_utilities';
  }
  if (sectionId === 'footer' || sectionId.startsWith('footer_')) {
    return 'footer';
  }
  if (sectionId === 'hero_main' || sectionId.startsWith('hero_main_')) {
    return 'hero_main';
  }
  if (sectionId.startsWith('divider')) return 'divider';
  if (sectionId.startsWith('custom_section')) return 'custom_section';
  if (sectionId.startsWith('contact_form')) return 'contact_form';
  if (sectionId.startsWith('email_signup')) return 'email_signup';
  if (sectionId.startsWith('product_highlight')) return 'product_highlight';
  if (sectionId.startsWith('editorial_jumbo')) return 'editorial_jumbo';
  if (sectionId.startsWith('editorial')) return 'editorial';
  if (sectionId.startsWith('image_compare')) return 'image_compare';
  if (sectionId.startsWith('image_with_text')) return 'image_with_text';
  if (sectionId.startsWith('storytelling_logo')) return 'storytelling_logo';
  if (sectionId.startsWith('storytelling_video')) return 'storytelling_video';
  if (sectionId.startsWith('faq_section')) return 'faq_section';
  if (sectionId.startsWith('icons_with_text')) return 'icons_with_text';
  if (sectionId.startsWith('multicolumn_section')) return 'multicolumn_section';
  if (sectionId.startsWith('pull_quote_section')) return 'pull_quote_section';
  if (sectionId.startsWith('rich_text_section')) return 'rich_text_section';
  if (sectionId.startsWith('text_marquee_section')) return 'text_marquee_section';
  if (sectionId.startsWith('blog_posts_carousel')) return 'blog_posts_carousel';
  if (sectionId.startsWith('blog_posts_editorial')) return 'blog_posts_editorial';
  if (sectionId.startsWith('blog_posts_grid')) return 'blog_posts_grid';
  if (sectionId.startsWith('storytelling_carousel')) return 'storytelling_carousel';
  return sectionId;
}

const TEMPLATE_HERO_CLONE_SOURCE = ['templates', 'index', 'sections', 'hero_main'] as const;

export const TEMPLATE_HERO_SCHEMA_PREFIX = 'templates.index.sections.hero_main';

/** Map index template hero schema paths → layout footer hero (`sections.{instanceId}.*`). */
export function remapTemplateHeroSchemaPath(path: string, instanceId: string): string {
  const to = `sections.${instanceId}`;
  return path.startsWith(TEMPLATE_HERO_SCHEMA_PREFIX)
    ? `${to}${path.slice(TEMPLATE_HERO_SCHEMA_PREFIX.length)}`
    : path;
}

export function layoutHeroInstanceFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(hero_main(?:_\d+)?)(?::|$)/);
  return m?.[1] ?? null;
}

function remapTemplateHeroPathsInJson<T>(value: T, instanceId: string): T {
  return JSON.parse(
    JSON.stringify(value).split(TEMPLATE_HERO_SCHEMA_PREFIX).join(`sections.${instanceId}`)
  ) as T;
}

import { applyFooterNewsletterPreset } from './footer-newsletter-preset.util';
import { applyContactFormPreset } from './contact-form-preset.util';
import { applyEmailSignupPreset } from './email-signup-preset.util';
import { applyCustomSectionPreset } from './custom-section-preset.util';
import { applyDividerPreset } from './divider-preset.util';
import { applyFeaturedProductPreset } from './featured-product-preset.util';
import { applyProductHotspotsPreset } from './product-hotspots-preset.util';
import { applyRecommendedProductsPreset } from './recommended-products-preset.util';
import { applyCollectionLinksSpotlightPreset } from './collection-links-spotlight-preset.util';
import { applyCollectionListBentoPreset } from './collection-list-bento-preset.util';
import { applyCollectionListCarouselPreset } from './collection-list-carousel-preset.util';
import { applyCollectionListEditorialPreset } from './collection-list-editorial-preset.util';
import { applyCollectionListGridPreset } from './collection-list-grid-preset.util';
import { applyLayeredSlideshowPreset } from './layered-slideshow-preset.util';
import { applySlideshowFullFramePreset } from './slideshow-full-frame-preset.util';
import { applySlideshowInsetPreset } from './slideshow-inset-preset.util';
import { applyProductHighlightPreset } from './product-highlight-preset.util';
import { applyEditorialPreset } from './editorial-preset.util';
import { applyEditorialJumboPreset } from './editorial-jumbo-preset.util';
import { applyImageComparePreset } from './image-compare-preset.util';
import { applyImageWithTextPreset } from './image-with-text-preset.util';
import { applyStorytellingLogoPreset } from './storytelling-logo-preset.util';
import { applyStorytellingVideoPreset } from './storytelling-video-preset.util';
import { applyFaqPreset } from './faq-preset.util';
import { FAQ_SECTION_BLOCK_ORDER } from './faq-sidebar.util';
import { faqAccordionDefaultSettings } from '../create-theme/sidebar/theme-editor-faq-accordion-block-panel.utils';
import { faqAccordionRowDefaultSettings } from '../create-theme/sidebar/theme-editor-faq-accordion-row-panel.utils';
import { textBlockDefaultSettings } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';
import { applyIconsWithTextPreset } from './icons-with-text-preset.util';
import { applyMulticolumnPreset } from './multicolumn-preset.util';
import { applyPullQuotePreset } from './pull-quote-preset.util';
import { applyRichTextPreset } from './rich-text-preset.util';
import { applyTextMarqueePreset } from './text-marquee-preset.util';
import { applyFeaturedCollectionCatalogPreset } from './featured-collection-preset.util';
import { applyBlogPostsCarouselPreset } from './blog-posts-carousel-preset.util';
import { applyBlogPostsEditorialPreset } from './blog-posts-editorial-preset.util';
import { applyBlogPostsGridPreset } from './blog-posts-grid-preset.util';
import { applyStorytellingCarouselPreset } from './storytelling-carousel-preset.util';
import { applyFooterPoliciesLinksPreset } from './footer-policies-links-preset.util';
import { applyHeroBannerVariantPreset } from './hero-banner-variants.util';
import {
  applyBottomAlignedHeroSection,
  buildBottomAlignedHeroBlocks,
  seedBottomAlignedHeroValues,
} from './hero-bottom-aligned.util';

/** Shopify-style hero block tree (layout instances). */
function ensureShopifyHeroBlockTree(
  section: Record<string, unknown>,
  instanceId: string,
  catalogId?: string
): void {
  const blocksPath = `sections.${instanceId}.blocks`;

  if (catalogId === 'hero-bottom-aligned') {
    section.blocks = buildBottomAlignedHeroBlocks(blocksPath);
    section.block_order = ['content_group'];
    return;
  }

  if (catalogId && applyHeroBannerVariantPreset(section, catalogId, blocksPath)) {
    return;
  }

  section.blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  section.block_order = ['heading', 'primary_button'];
}

/** Default copy + layout flags per add-section hero catalog id. */
export function applyHeroCatalogPreset(
  section: Record<string, unknown>,
  catalogId: string,
  blocksBase?: string
): void {
  if (!section.type || section.type !== 'hero') return;

  const instanceId = String(section.id ?? 'hero_main');
  const blocksPath = blocksBase ?? `sections.${instanceId}.blocks`;

  if (catalogId === 'hero-bottom-aligned') {
    applyBottomAlignedHeroSection(section, blocksPath);
    return;
  }

  if (applyHeroBannerVariantPreset(section, catalogId, blocksPath)) {
    return;
  }

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = catalogId;
  settings.position = 'bottom';
  settings.mediaOverlay = settings.mediaOverlay ?? true;
  settings.colorScheme = settings.colorScheme ?? 'scheme-6';

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;

  if (catalogId === 'hero') {
    settings.title = 'New arrivals';
    settings.subtitle = 'Made with care and unconditionally loved by our customers.';
    settings.layoutAlignment = 'center';
    settings.eyebrow = settings.eyebrow ?? '';

    if (blocks.primary_button?.settings && typeof blocks.primary_button.settings === 'object') {
      (blocks.primary_button.settings as Record<string, unknown>).label = 'Shop now';
    }

    section.block_order = ['heading', 'primary_button'];
  }

  section.settings = settings;
  section.blocks = blocks;
}

function applyFooterHeroPreset(section: Record<string, unknown>, catalogId: string): void {
  const instanceId = String(section.id ?? 'hero_main');
  ensureShopifyHeroBlockTree(section, instanceId, catalogId);
  applyHeroCatalogPreset(section, catalogId);
}

function cloneHeroLayoutSection(
  config: Record<string, unknown>,
  instanceId: string,
  catalogId: string
): Record<string, unknown> {
  const src = getNested(config, [...TEMPLATE_HERO_CLONE_SOURCE]);
  if (!src || typeof src !== 'object') {
    return { id: instanceId, type: 'hero', enabled: true, settings: {}, blocks: {}, block_order: [] };
  }
  const clone = remapTemplateHeroPathsInJson(src, instanceId) as Record<string, unknown>;
  clone.id = instanceId;
  clone.type = 'hero';
  applyFooterHeroPreset(clone, catalogId);
  return clone;
}

export function remapLayoutSchemaPath(path: string, instanceId: string): string {
  const blueprint = layoutBlueprintKey(instanceId);
  if (blueprint === instanceId) return path;
  return path.replace(`sections.${blueprint}.`, `sections.${instanceId}.`);
}

function newInstanceId(config: Record<string, unknown>, blueprintId: string): string {
  const sections = (config.sections ?? {}) as Record<string, unknown>;
  if (!sections[blueprintId]) return blueprintId;
  let n = 2;
  while (sections[`${blueprintId}_${n}`]) n += 1;
  return `${blueprintId}_${n}`;
}

/** New template section instance id (never reuse an existing blueprint key). */
function newTemplateInstanceId(
  tplSections: Record<string, unknown>,
  blueprintId: string
): string {
  if (!tplSections[blueprintId]) return blueprintId;
  let n = 2;
  while (tplSections[`${blueprintId}_${n}`]) n += 1;
  return `${blueprintId}_${n}`;
}

/** Ensure every blueprint section from the pack default exists under `templates.{id}.sections`. */
export function mergeTemplateSectionBlueprintsFromPack(
  config: Record<string, unknown>,
  packDefault: Record<string, unknown>,
  templateId: string
): void {
  const templates = config.templates as
    | Record<string, { sections?: Record<string, unknown>; section_order?: string[] }>
    | undefined;
  const defTemplates = packDefault.templates as
    | Record<string, { sections?: Record<string, unknown>; section_order?: string[] }>
    | undefined;
  if (!templates?.[templateId] || !defTemplates?.[templateId]?.sections) return;

  const tpl = templates[templateId];
  if (!tpl.sections || typeof tpl.sections !== 'object') tpl.sections = {};

  for (const [sectionId, defSec] of Object.entries(defTemplates[templateId].sections ?? {})) {
    if (!tpl.sections[sectionId]) {
      tpl.sections[sectionId] = JSON.parse(JSON.stringify(defSec)) as Record<string, unknown>;
    }
  }
  if (!Array.isArray(tpl.section_order)) {
    tpl.section_order = defTemplates[templateId].section_order
      ? [...(defTemplates[templateId].section_order ?? [])]
      : [];
  }
}

function ensureTemplateInConfig(
  config: Record<string, unknown>,
  tplId: string,
  packDefault?: Record<string, unknown> | null
): Record<string, unknown> {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  if (!templates[tplId]) {
    const defTpl = (
      packDefault?.templates as Record<string, Record<string, unknown>> | undefined
    )?.[tplId];
    templates[tplId] = defTpl
      ? (JSON.parse(JSON.stringify(defTpl)) as Record<string, unknown>)
      : { sections: {}, section_order: [] };
  }
  const tpl = templates[tplId];
  if (!tpl.sections || typeof tpl.sections !== 'object') tpl.sections = {};
  if (!Array.isArray(tpl.section_order)) tpl.section_order = [];
  return tpl;
}

function defaultAnnouncementSection(type: string, id: string): Record<string, unknown> {
  return {
    id,
    type,
    enabled: true,
    settings: { ...ANNOUNCEMENT_BAR_DEFAULT_SETTINGS },
    blocks: {
      announcement: {
        type: 'announcement',
        settings: { ...ANNOUNCEMENT_BLOCK_DEFAULT_SETTINGS },
      },
    },
    block_order: ['announcement'],
  };
}

function defaultDividerSection(id: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id,
    type: 'divider',
    enabled: true,
    settings: {},
  };
  applyDividerPreset(section);
  return section;
}

function cloneBlueprintSection(
  config: Record<string, unknown>,
  blueprintId: string,
  instanceId: string,
  meta: { type: string },
  catalogId?: string
): Record<string, unknown> {
  const sections = (config.sections ?? {}) as Record<string, unknown>;
  const src = sections[blueprintId] ?? sections[instanceId];
  if (src && typeof src === 'object') {
    const clone = JSON.parse(JSON.stringify(src)) as Record<string, unknown>;
    clone.id = instanceId;
    if (!clone.type) clone.type = meta.type;
    return clone;
  }
  if (blueprintId === 'hero_main' && meta.type === 'hero') {
    return cloneHeroLayoutSection(config, instanceId, catalogId ?? 'hero');
  }
  if (blueprintId === 'announcement_bar') {
    return defaultAnnouncementSection(meta.type, instanceId);
  }
  if (blueprintId === 'divider') {
    return defaultDividerSection(instanceId);
  }
  if (blueprintId === 'custom_section' && meta.type === 'custom-section') {
    return defaultCustomSectionLayoutSection(instanceId);
  }
  if (blueprintId === 'product_highlight' && meta.type === 'product-highlight') {
    return defaultProductHighlightLayoutSection(instanceId);
  }
  if (blueprintId === 'editorial' && meta.type === 'editorial') {
    return defaultEditorialLayoutSection(instanceId);
  }
  if (blueprintId === 'editorial_jumbo' && meta.type === 'editorial-jumbo') {
    return defaultEditorialJumboLayoutSection(instanceId);
  }
  if (blueprintId === 'image_compare' && meta.type === 'image-compare') {
    return defaultImageCompareLayoutSection(instanceId);
  }
  if (blueprintId === 'image_with_text' && meta.type === 'image-with-text') {
    return defaultImageWithTextLayoutSection(instanceId);
  }
  if (blueprintId === 'storytelling_logo' && meta.type === 'storytelling-logo') {
    return defaultStorytellingLogoLayoutSection(instanceId);
  }
  if (blueprintId === 'storytelling_video' && meta.type === 'storytelling-video') {
    return defaultStorytellingVideoLayoutSection(instanceId);
  }
  if (blueprintId === 'faq_section' && meta.type === 'faq') {
    return defaultFaqLayoutSection(instanceId);
  }
  if (blueprintId === 'icons_with_text' && meta.type === 'icons-with-text') {
    return defaultIconsWithTextLayoutSection(instanceId);
  }
  if (blueprintId === 'multicolumn_section' && meta.type === 'multicolumn') {
    return defaultMulticolumnLayoutSection(instanceId);
  }
  if (blueprintId === 'pull_quote_section' && meta.type === 'pull-quote') {
    return defaultPullQuoteLayoutSection(instanceId);
  }
  if (blueprintId === 'rich_text_section' && meta.type === 'rich-text') {
    return defaultRichTextLayoutSection(instanceId);
  }
  if (blueprintId === 'text_marquee_section' && meta.type === 'text-marquee') {
    return defaultTextMarqueeLayoutSection(instanceId);
  }
  if (blueprintId === 'blog_posts_carousel' && meta.type === 'blog-posts-carousel') {
    return defaultBlogPostsCarouselLayoutSection(instanceId);
  }
  if (blueprintId === 'blog_posts_editorial' && meta.type === 'blog-posts-editorial') {
    return defaultBlogPostsEditorialLayoutSection(instanceId);
  }
  if (blueprintId === 'blog_posts_grid' && meta.type === 'blog-posts-grid') {
    return defaultBlogPostsGridLayoutSection(instanceId);
  }
  if (blueprintId === 'storytelling_carousel' && meta.type === 'storytelling-carousel') {
    return defaultStorytellingCarouselLayoutSection(instanceId);
  }
  if (blueprintId === 'product_hotspots' && meta.type === 'product-hotspots') {
    return defaultProductHotspotsLayoutSection(instanceId);
  }
  if (blueprintId === 'collection_links_spotlight' && meta.type === 'collection-links-spotlight') {
    return defaultCollectionLinksSpotlightLayoutSection(instanceId);
  }
  if (blueprintId === 'collection_links_text' && meta.type === 'collection-links-spotlight') {
    return defaultCollectionLinksTextLayoutSection(instanceId);
  }
  if (blueprintId === 'recommended_products' && meta.type === 'recommended-products') {
    return defaultRecommendedProductsLayoutSection(instanceId);
  }
  if (blueprintId === 'collection_list_bento' && meta.type === 'collection-list-bento') {
    return defaultCollectionListBentoLayoutSection(instanceId);
  }
  if (blueprintId === 'collection_list_carousel' && meta.type === 'collection-list-carousel') {
    return defaultCollectionListCarouselLayoutSection(instanceId);
  }
  if (blueprintId === 'collection_list_editorial' && meta.type === 'collection-list-editorial') {
    return defaultCollectionListEditorialLayoutSection(instanceId);
  }
  if (blueprintId === 'collection_list_grid' && meta.type === 'collection-list-grid') {
    return defaultCollectionListGridLayoutSection(instanceId);
  }
  if (blueprintId === 'layered_slideshow' && meta.type === 'layered-slideshow') {
    return defaultLayeredSlideshowLayoutSection(instanceId);
  }
  if (blueprintId === 'slideshow_full_frame' && meta.type === 'slideshow-full-frame') {
    return defaultSlideshowFullFrameLayoutSection(instanceId);
  }
  if (blueprintId === 'contact_form' && meta.type === 'contact-form') {
    return defaultContactFormLayoutSection(instanceId);
  }
  if (blueprintId === 'email_signup' && meta.type === 'email-signup') {
    return defaultEmailSignupLayoutSection(instanceId);
  }
  return { id: instanceId, type: meta.type, enabled: true, settings: {} };
}

function defaultDividerTemplateSection(instanceId: string): Record<string, unknown> {
  const dividerDefaults = defaultDividerSection(instanceId) as { settings?: Record<string, unknown> };
  return {
    type: 'divider',
    enabled: true,
    settings: { ...(dividerDefaults.settings ?? {}) },
  };
}

function defaultContactFormTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'contact-form',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyContactFormPreset(section);
  return section;
}

function defaultContactFormLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'contact-form',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyContactFormPreset(section);
  return section;
}

function defaultEmailSignupTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'email-signup',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyEmailSignupPreset(section);
  return section;
}

function defaultEmailSignupLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'email-signup',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyEmailSignupPreset(section);
  return section;
}

function defaultCustomSectionLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'custom-section',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCustomSectionPreset(section);
  return section;
}

function defaultCustomSectionTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'custom-section',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCustomSectionPreset(section);
  return section;
}

function defaultProductHighlightLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'product-highlight',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyProductHighlightPreset(section);
  return section;
}

function defaultProductHighlightTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'product-highlight',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyProductHighlightPreset(section);
  return section;
}

function defaultEditorialLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'editorial',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyEditorialPreset(section);
  return section;
}

function defaultEditorialTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'editorial',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyEditorialPreset(section);
  return section;
}

function defaultEditorialJumboLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'editorial-jumbo',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyEditorialJumboPreset(section);
  return section;
}

function defaultEditorialJumboTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'editorial-jumbo',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyEditorialJumboPreset(section);
  return section;
}

function defaultImageCompareLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'image-compare',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyImageComparePreset(section);
  return section;
}

function defaultImageCompareTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'image-compare',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyImageComparePreset(section);
  return section;
}

function defaultImageWithTextLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'image-with-text',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyImageWithTextPreset(section);
  return section;
}

function defaultImageWithTextTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'image-with-text',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyImageWithTextPreset(section);
  return section;
}

function defaultStorytellingLogoLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'storytelling-logo',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyStorytellingLogoPreset(section);
  return section;
}

function defaultStorytellingLogoTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'storytelling-logo',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyStorytellingLogoPreset(section);
  return section;
}

function defaultStorytellingVideoLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'storytelling-video',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyStorytellingVideoPreset(section);
  return section;
}

function defaultStorytellingVideoTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'storytelling-video',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyStorytellingVideoPreset(section);
  return section;
}

function defaultFaqLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'faq',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyFaqPreset(section);
  return section;
}

function defaultFaqTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'faq',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyFaqPreset(section);
  return section;
}

function defaultIconsWithTextLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'icons-with-text',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyIconsWithTextPreset(section);
  return section;
}

function defaultIconsWithTextTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'icons-with-text',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyIconsWithTextPreset(section);
  return section;
}

function defaultMulticolumnLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'multicolumn',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyMulticolumnPreset(section);
  return section;
}

function defaultMulticolumnTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'multicolumn',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyMulticolumnPreset(section);
  return section;
}

function defaultPullQuoteLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'pull-quote',
    enabled: true,
    settings: {},
  };
  applyPullQuotePreset(section);
  return section;
}

function defaultPullQuoteTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'pull-quote',
    enabled: true,
    settings: {},
  };
  applyPullQuotePreset(section);
  return section;
}

function defaultRichTextLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'rich-text',
    enabled: true,
    settings: {},
  };
  applyRichTextPreset(section);
  return section;
}

function defaultRichTextTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'rich-text',
    enabled: true,
    settings: {},
  };
  applyRichTextPreset(section);
  return section;
}

function defaultTextMarqueeLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'text-marquee',
    enabled: true,
    settings: {},
  };
  applyTextMarqueePreset(section);
  return section;
}

function defaultTextMarqueeTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'text-marquee',
    enabled: true,
    settings: {},
  };
  applyTextMarqueePreset(section);
  return section;
}

function defaultBlogPostsCarouselLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'blog-posts-carousel',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyBlogPostsCarouselPreset(section);
  return section;
}

function defaultBlogPostsCarouselTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'blog-posts-carousel',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyBlogPostsCarouselPreset(section);
  return section;
}

function defaultBlogPostsEditorialLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'blog-posts-editorial',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyBlogPostsEditorialPreset(section);
  return section;
}

function defaultBlogPostsEditorialTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'blog-posts-editorial',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyBlogPostsEditorialPreset(section);
  return section;
}

function defaultBlogPostsGridLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'blog-posts-grid',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyBlogPostsGridPreset(section);
  return section;
}

function defaultBlogPostsGridTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'blog-posts-grid',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyBlogPostsGridPreset(section);
  return section;
}

function defaultStorytellingCarouselLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'storytelling-carousel',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyStorytellingCarouselPreset(section);
  return section;
}

function defaultStorytellingCarouselTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'storytelling-carousel',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyStorytellingCarouselPreset(section);
  return section;
}

function defaultProductHotspotsLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'product-hotspots',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyProductHotspotsPreset(section);
  return section;
}

function defaultProductHotspotsTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'product-hotspots',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyProductHotspotsPreset(section);
  return section;
}

function defaultRecommendedProductsLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'recommended-products',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyRecommendedProductsPreset(section);
  return section;
}

function defaultRecommendedProductsTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'recommended-products',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyRecommendedProductsPreset(section);
  return section;
}

function defaultCollectionLinksSpotlightLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'collection-links-spotlight',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionLinksSpotlightPreset(section);
  return section;
}

function defaultCollectionLinksSpotlightTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'collection-links-spotlight',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionLinksSpotlightPreset(section);
  return section;
}

function defaultCollectionLinksTextLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'collection-links-spotlight',
    enabled: true,
    settings: { catalogVariant: 'collection-links-text' },
    blocks: {},
    block_order: [],
  };
  applyCollectionLinksSpotlightPreset(section);
  return section;
}

function defaultCollectionLinksTextTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'collection-links-spotlight',
    enabled: true,
    settings: { catalogVariant: 'collection-links-text' },
    blocks: {},
    block_order: [],
  };
  applyCollectionLinksSpotlightPreset(section);
  return section;
}

function defaultCollectionListBentoLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'collection-list-bento',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListBentoPreset(section);
  return section;
}

function defaultCollectionListBentoTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'collection-list-bento',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListBentoPreset(section);
  return section;
}

function defaultCollectionListCarouselLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'collection-list-carousel',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListCarouselPreset(section);
  return section;
}

function defaultCollectionListCarouselTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'collection-list-carousel',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListCarouselPreset(section);
  return section;
}

function defaultCollectionListEditorialLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'collection-list-editorial',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListEditorialPreset(section);
  return section;
}

function defaultCollectionListEditorialTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'collection-list-editorial',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListEditorialPreset(section);
  return section;
}

function defaultCollectionListGridLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'collection-list-grid',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListGridPreset(section);
  return section;
}

function defaultCollectionListGridTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'collection-list-grid',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyCollectionListGridPreset(section);
  return section;
}

function defaultLayeredSlideshowLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'layered-slideshow',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyLayeredSlideshowPreset(section);
  return section;
}

function defaultLayeredSlideshowTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'layered-slideshow',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyLayeredSlideshowPreset(section);
  return section;
}

function defaultSlideshowFullFrameLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'slideshow-full-frame',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applySlideshowFullFramePreset(section);
  return section;
}

function defaultSlideshowFullFrameTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'slideshow-full-frame',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applySlideshowFullFramePreset(section);
  return section;
}

function defaultSlideshowInsetLayoutSection(instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    id: instanceId,
    type: 'slideshow-inset',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applySlideshowInsetPreset(section);
  return section;
}

function defaultSlideshowInsetTemplateSection(_instanceId: string): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'slideshow-inset',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applySlideshowInsetPreset(section);
  return section;
}

function insertIntoOrder(order: string[], instanceId: string, ctx: SectionInsertContext): string[] {
  const next = [...order];
  const anchorAfter = ctx.afterNodeId?.startsWith('layout:')
    ? ctx.afterNodeId.slice('layout:'.length)
    : null;
  const anchorBefore = ctx.beforeNodeId?.startsWith('layout:')
    ? ctx.beforeNodeId.slice('layout:'.length)
    : null;

  if (anchorBefore && anchorBefore !== 'add-section') {
    const idx = next.indexOf(anchorBefore);
    if (idx >= 0) {
      next.splice(idx, 0, instanceId);
      return next;
    }
  }
  if (anchorAfter && anchorAfter !== 'add-section') {
    const idx = next.indexOf(anchorAfter);
    if (idx >= 0) {
      next.splice(idx + 1, 0, instanceId);
      return next;
    }
  }
  next.push(instanceId);
  return next;
}

function applyTemplateCatalogPreset(
  section: Record<string, unknown>,
  catalogId: string,
  tplId = 'index',
  instanceId?: string
): void {
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  if (!section.settings) section.settings = settings;
  settings.catalogVariant = catalogId;
  if (section.type === 'hero') {
    const secId = instanceId ?? String(section.id ?? 'hero_main');
    const blocksPath = `templates.${tplId}.sections.${secId}.blocks`;
    if (catalogId === 'hero-bottom-aligned') {
      applyBottomAlignedHeroSection(section, blocksPath);
    } else {
      applyHeroCatalogPreset(section, catalogId, blocksPath);
    }
  }
  if (section.type === 'contact-form' || catalogId === 'contact-form') {
    applyContactFormPreset(section);
  }
  if (section.type === 'email-signup' || catalogId === 'email-signup') {
    applyEmailSignupPreset(section);
  }
  if (section.type === 'custom-section' || catalogId === 'custom-section') {
    applyCustomSectionPreset(section);
  }
  if (section.type === 'divider' || catalogId === 'divider') {
    applyDividerPreset(section);
  }
  if (section.type === 'product-highlight' || catalogId === 'product-highlight') {
    applyProductHighlightPreset(section);
  }
  if (catalogId === 'featured-product') {
    applyFeaturedProductPreset(section);
  }
  if (section.type === 'editorial' || catalogId === 'editorial') {
    applyEditorialPreset(section);
  }
  if (section.type === 'editorial-jumbo' || catalogId === 'editorial-jumbo') {
    applyEditorialJumboPreset(section);
  }
  if (section.type === 'image-compare' || catalogId === 'image-compare') {
    applyImageComparePreset(section);
  }
  if (section.type === 'image-with-text' || catalogId === 'image-with-text') {
    applyImageWithTextPreset(section);
  }
  if (section.type === 'storytelling-logo' || catalogId === 'logo') {
    applyStorytellingLogoPreset(section);
  }
  if (section.type === 'storytelling-video' || catalogId === 'video') {
    applyStorytellingVideoPreset(section);
  }
  if (section.type === 'faq' || catalogId === 'faq') {
    applyFaqPreset(section);
  }
  if (section.type === 'icons-with-text' || catalogId === 'icons-with-text') {
    applyIconsWithTextPreset(section);
  }
  if (section.type === 'multicolumn' || catalogId === 'multicolumn') {
    applyMulticolumnPreset(section);
  }
  if (section.type === 'pull-quote' || catalogId === 'pull-quote') {
    applyPullQuotePreset(section);
  }
  if (section.type === 'rich-text' || catalogId === 'rich-text') {
    applyRichTextPreset(section);
  }
  if (section.type === 'text-marquee' || catalogId === 'text-marquee') {
    applyTextMarqueePreset(section);
  }
  if (section.type === 'blog-posts-carousel' || catalogId === 'blog-posts-carousel') {
    applyBlogPostsCarouselPreset(section);
  }
  if (section.type === 'blog-posts-editorial' || catalogId === 'blog-posts-editorial') {
    applyBlogPostsEditorialPreset(section);
  }
  if (section.type === 'blog-posts-grid' || catalogId === 'blog-posts-grid') {
    applyBlogPostsGridPreset(section);
  }
  if (
    section.type === 'featured-collection' ||
    catalogId === 'featured-collection' ||
    catalogId === 'featured-collection-carousel' ||
    catalogId === 'featured-collection-editorial' ||
    catalogId === 'featured-collection-grid'
  ) {
    applyFeaturedCollectionCatalogPreset(section, catalogId);
  }
  if (section.type === 'product-hotspots' || catalogId === 'product-hotspots') {
    applyProductHotspotsPreset(section);
  }
  if (section.type === 'recommended-products' || catalogId === 'recommended-products') {
    applyRecommendedProductsPreset(section);
  }
  if (
    section.type === 'collection-links-spotlight' ||
    catalogId === 'collection-links-spotlight' ||
    catalogId === 'collection-links-text'
  ) {
    const settings = (section.settings ?? {}) as Record<string, unknown>;
    settings.catalogVariant = catalogId;
    section.settings = settings;
    applyCollectionLinksSpotlightPreset(section);
  }
  if (section.type === 'collection-list-bento' || catalogId === 'collection-list-bento') {
    applyCollectionListBentoPreset(section);
  }
  if (section.type === 'collection-list-carousel' || catalogId === 'collection-list-carousel') {
    applyCollectionListCarouselPreset(section);
  }
  if (section.type === 'collection-list-editorial' || catalogId === 'collection-list-editorial') {
    applyCollectionListEditorialPreset(section);
  }
  if (section.type === 'collection-list-grid' || catalogId === 'collection-list-grid') {
    applyCollectionListGridPreset(section);
  }
  if (section.type === 'layered-slideshow' || catalogId === 'layered-slideshow') {
    applyLayeredSlideshowPreset(section);
  }
  if (section.type === 'slideshow-full-frame' || catalogId === 'slideshow-full-frame') {
    applySlideshowFullFramePreset(section);
  }
  if (section.type === 'slideshow-inset' || catalogId === 'slideshow-inset') {
    applySlideshowInsetPreset(section);
  }
}

function resolveTemplateBlueprint(
  catalogId: string,
  schema: EditorSchemaDoc,
  page: ThemePreviewPage
): { blueprintId: string; type: string; label: string } | null {
  const mapped = resolveTemplateCatalogItem(catalogId);
  if (!mapped) return null;

  const tpl = schema.templates?.find((t) => t.id === templateIdForPage(page));
  const sec =
    tpl?.sections?.find((s) => s.id === mapped.blueprintId) ??
    tpl?.sections?.find((s) => s.type === mapped.type);
  if (!sec?.id) return null;

  return {
    blueprintId: sec.id,
    type: mapped.type,
    label: sec.label ?? catalogId,
  };
}

function cloneTemplateSection(
  config: Record<string, unknown>,
  tplId: string,
  blueprintId: string,
  instanceId: string,
  meta: { type: string }
): void {
  const tpl = getNested(config, ['templates', tplId]) as Record<string, unknown> | undefined;
  if (!tpl) return;
  const sections = (tpl.sections ?? {}) as Record<string, unknown>;
  const src = sections[blueprintId];
  if (src && typeof src === 'object') {
    sections[instanceId] = JSON.parse(JSON.stringify(src));
    (sections[instanceId] as Record<string, unknown>).type = meta.type;
  } else if (meta.type === 'divider') {
    sections[instanceId] = defaultDividerTemplateSection(instanceId);
  } else if (meta.type === 'contact-form') {
    sections[instanceId] = defaultContactFormTemplateSection(instanceId);
  } else if (meta.type === 'email-signup') {
    sections[instanceId] = defaultEmailSignupTemplateSection(instanceId);
  } else if (meta.type === 'custom-section') {
    sections[instanceId] = defaultCustomSectionTemplateSection(instanceId);
  } else if (meta.type === 'product-highlight') {
    sections[instanceId] = defaultProductHighlightTemplateSection(instanceId);
  } else if (meta.type === 'editorial') {
    sections[instanceId] = defaultEditorialTemplateSection(instanceId);
  } else if (meta.type === 'editorial-jumbo') {
    sections[instanceId] = defaultEditorialJumboTemplateSection(instanceId);
  } else if (meta.type === 'image-compare') {
    sections[instanceId] = defaultImageCompareTemplateSection(instanceId);
  } else if (meta.type === 'image-with-text') {
    sections[instanceId] = defaultImageWithTextTemplateSection(instanceId);
  } else if (meta.type === 'storytelling-logo') {
    sections[instanceId] = defaultStorytellingLogoTemplateSection(instanceId);
  } else if (meta.type === 'storytelling-video') {
    sections[instanceId] = defaultStorytellingVideoTemplateSection(instanceId);
  } else if (meta.type === 'faq') {
    sections[instanceId] = defaultFaqTemplateSection(instanceId);
  } else if (meta.type === 'icons-with-text') {
    sections[instanceId] = defaultIconsWithTextTemplateSection(instanceId);
  } else if (meta.type === 'multicolumn') {
    sections[instanceId] = defaultMulticolumnTemplateSection(instanceId);
  } else if (meta.type === 'pull-quote') {
    sections[instanceId] = defaultPullQuoteTemplateSection(instanceId);
  } else if (meta.type === 'rich-text') {
    sections[instanceId] = defaultRichTextTemplateSection(instanceId);
  } else if (meta.type === 'text-marquee') {
    sections[instanceId] = defaultTextMarqueeTemplateSection(instanceId);
  } else if (meta.type === 'blog-posts-carousel') {
    sections[instanceId] = defaultBlogPostsCarouselTemplateSection(instanceId);
  } else if (meta.type === 'blog-posts-editorial') {
    sections[instanceId] = defaultBlogPostsEditorialTemplateSection(instanceId);
  } else if (meta.type === 'blog-posts-grid') {
    sections[instanceId] = defaultBlogPostsGridTemplateSection(instanceId);
  } else if (meta.type === 'storytelling-carousel') {
    sections[instanceId] = defaultStorytellingCarouselTemplateSection(instanceId);
  } else if (meta.type === 'product-hotspots') {
    sections[instanceId] = defaultProductHotspotsTemplateSection(instanceId);
  } else if (meta.type === 'recommended-products') {
    sections[instanceId] = defaultRecommendedProductsTemplateSection(instanceId);
  } else if (meta.type === 'collection-links-spotlight') {
    sections[instanceId] =
      blueprintId === 'collection_links_text'
        ? defaultCollectionLinksTextTemplateSection(instanceId)
        : defaultCollectionLinksSpotlightTemplateSection(instanceId);
  } else if (meta.type === 'collection-list-bento') {
    sections[instanceId] = defaultCollectionListBentoTemplateSection(instanceId);
  } else if (meta.type === 'collection-list-carousel') {
    sections[instanceId] = defaultCollectionListCarouselTemplateSection(instanceId);
  } else if (meta.type === 'collection-list-editorial') {
    sections[instanceId] = defaultCollectionListEditorialTemplateSection(instanceId);
  } else if (meta.type === 'collection-list-grid') {
    sections[instanceId] = defaultCollectionListGridTemplateSection(instanceId);
  } else if (meta.type === 'layered-slideshow') {
    sections[instanceId] = defaultLayeredSlideshowTemplateSection(instanceId);
  } else if (meta.type === 'slideshow-full-frame') {
    sections[instanceId] = defaultSlideshowFullFrameTemplateSection(instanceId);
  } else if (meta.type === 'slideshow-inset') {
    sections[instanceId] = defaultSlideshowInsetTemplateSection(instanceId);
  } else {
    sections[instanceId] = { type: meta.type, enabled: true, settings: {}, blocks: {}, block_order: [] };
  }
  tpl.sections = sections;
}

export type InsertSectionResult = {
  config: Record<string, unknown>;
  instanceId: string;
  nodeId: string;
  listKey: string;
};

/** Copy schema field paths from blueprint instance to a new layout instance for `values` map. */
export function extendValuesForLayoutInstance(
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc,
  blueprintId: string,
  instanceId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const blueprint = layoutBlueprintKey(blueprintId);
  const layout = schema.layout?.[blueprint];
  if (!layout) return values;

  const next = { ...values };
  const walkFields = (fields: { path: string; type: string }[] | undefined) => {
    for (const field of fields ?? []) {
      if (!field.path?.startsWith(`sections.${blueprint}.`)) continue;
      const newPath = remapLayoutSchemaPath(field.path, instanceId);
      const raw = getNested(config, newPath.split('.').filter(Boolean));
      if (raw === undefined) continue;
      next[newPath] =
        field.type === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
    }
  };

  walkFields(layout.settingsFields);
  const walkBlocks = (blocks: typeof layout.blocks) => {
    for (const block of blocks ?? []) {
      walkFields(block.settingsFields);
      walkBlocks(block.blocks);
    }
  };
  walkBlocks(layout.blocks);
  return seedBottomAlignedHeroValues(next, config);
}

/** Copy schema field paths from a template blueprint section to a new instance for `values` map. */
export function extendValuesForTemplateInstance(
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc,
  tplId: string,
  blueprintId: string,
  instanceId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const blueprint = templateBlueprintKey(blueprintId);
  const template = schema.templates?.find((t) => t.id === tplId);
  const sec = template?.sections?.find((s) => (s.id ?? '') === blueprint);
  if (!sec) return values;

  const next = { ...values };
  const prefix = `templates.${tplId}.sections.${blueprint}.`;
  const walkFields = (fields: { path: string; type: string }[] | undefined) => {
    for (const field of fields ?? []) {
      if (!field.path?.startsWith(prefix)) continue;
      const newPath = remapTemplateSchemaPath(field.path, tplId, instanceId);
      const raw = getNested(config, newPath.split('.').filter(Boolean));
      if (raw === undefined) continue;
      next[newPath] =
        field.type === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
    }
  };

  walkFields(sec.settingsFields);
  const walkBlocks = (blocks: typeof sec.blocks) => {
    for (const block of blocks ?? []) {
      walkFields(block.settingsFields);
      walkBlocks(block.blocks);
    }
  };
  walkBlocks(sec.blocks);
  return seedBottomAlignedHeroValues(next, config);
}

function metaFromTemplateCatalog(
  catalogId: string
): { blueprintId: string; type: string; label: string } | null {
  const mapped = resolveTemplateCatalogItem(catalogId);
  if (!mapped) return null;
  return { blueprintId: mapped.blueprintId, type: mapped.type, label: catalogId };
}

export function insertSectionFromCatalog(
  config: Record<string, unknown>,
  item: SectionCatalogItem,
  ctx: SectionInsertContext,
  schema: EditorSchemaDoc,
  previewPage: ThemePreviewPage,
  packDefaultConfig?: Record<string, unknown> | null
): InsertSectionResult | null {
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  ensureLayoutOrder(next);

  if (ctx.groupId === 'header' || ctx.groupId === 'footer') {
    const footerResolve =
      ctx.groupId === 'footer'
        ? FOOTER_BANNER_RESOLVE[item.id] ??
          FOOTER_FORMS_RESOLVE[item.id] ??
          FOOTER_PRODUCTS_RESOLVE[item.id] ??
          FOOTER_STORYTELLING_RESOLVE[item.id] ??
          FOOTER_TEXT_RESOLVE[item.id] ??
          null
        : null;
    const meta =
      CATALOG_BLUEPRINT[item.id] ?? footerResolve ?? LAYOUT_SECTION_RESOLVE[item.id] ?? null;
    if (!meta) return null;

    const instanceId = newInstanceId(next, meta.blueprintId);
    const sections = { ...((next.sections ?? {}) as Record<string, unknown>) };
    const section = cloneBlueprintSection(next, meta.blueprintId, instanceId, meta, item.id);
    if (item.id !== meta.blueprintId) {
      const settings = (section.settings ?? {}) as Record<string, unknown>;
      settings.catalogVariant = item.id;
      section.settings = settings;
    }
    if (meta.type === 'footer' && item.id === 'footer') {
      applyFooterNewsletterPreset(section);
    }
    if (meta.type === 'footer-utilities' && item.id === 'policies-links') {
      applyFooterPoliciesLinksPreset(section);
    }
    if (meta.type === 'custom-section' || item.id === 'custom-section') {
      applyCustomSectionPreset(section);
    }
    if (meta.type === 'divider' || item.id === 'divider') {
      applyDividerPreset(section);
    }
    if (meta.type === 'product-highlight' || item.id === 'product-highlight') {
      applyProductHighlightPreset(section);
    }
    if (meta.type === 'editorial' || item.id === 'editorial') {
      applyEditorialPreset(section);
    }
    if (meta.type === 'editorial-jumbo' || item.id === 'editorial-jumbo') {
      applyEditorialJumboPreset(section);
    }
    if (meta.type === 'image-compare' || item.id === 'image-compare') {
      applyImageComparePreset(section);
    }
    if (meta.type === 'image-with-text' || item.id === 'image-with-text') {
      applyImageWithTextPreset(section);
    }
    if (meta.type === 'storytelling-logo' || item.id === 'logo') {
      applyStorytellingLogoPreset(section);
    }
    if (meta.type === 'storytelling-video' || item.id === 'video') {
      applyStorytellingVideoPreset(section);
    }
    if (meta.type === 'faq' || item.id === 'faq') {
      applyFaqPreset(section);
    }
    if (meta.type === 'icons-with-text' || item.id === 'icons-with-text') {
      applyIconsWithTextPreset(section);
    }
    if (meta.type === 'multicolumn' || item.id === 'multicolumn') {
      applyMulticolumnPreset(section);
    }
    if (meta.type === 'pull-quote' || item.id === 'pull-quote') {
      applyPullQuotePreset(section);
    }
    if (meta.type === 'rich-text' || item.id === 'rich-text') {
      applyRichTextPreset(section);
    }
    if (meta.type === 'text-marquee' || item.id === 'text-marquee') {
      applyTextMarqueePreset(section);
    }
    if (meta.type === 'blog-posts-carousel' || item.id === 'blog-posts-carousel') {
      applyBlogPostsCarouselPreset(section);
    }
    if (meta.type === 'blog-posts-editorial' || item.id === 'blog-posts-editorial') {
      applyBlogPostsEditorialPreset(section);
    }
    if (meta.type === 'blog-posts-grid' || item.id === 'blog-posts-grid') {
      applyBlogPostsGridPreset(section);
    }
    if (meta.type === 'storytelling-carousel' || item.id === 'storytelling-carousel') {
      applyStorytellingCarouselPreset(section);
    }
    if (meta.type === 'product-hotspots' || item.id === 'product-hotspots') {
      applyProductHotspotsPreset(section);
    }
    if (meta.type === 'recommended-products' || item.id === 'recommended-products') {
      applyRecommendedProductsPreset(section);
    }
    if (
      meta.type === 'collection-links-spotlight' ||
      item.id === 'collection-links-spotlight' ||
      item.id === 'collection-links-text'
    ) {
      const settings = (section.settings ?? {}) as Record<string, unknown>;
      settings.catalogVariant = item.id;
      section.settings = settings;
      applyCollectionLinksSpotlightPreset(section);
    }
    if (meta.type === 'collection-list-bento' || item.id === 'collection-list-bento') {
      applyCollectionListBentoPreset(section);
    }
    if (meta.type === 'collection-list-carousel' || item.id === 'collection-list-carousel') {
      applyCollectionListCarouselPreset(section);
    }
    if (meta.type === 'collection-list-editorial' || item.id === 'collection-list-editorial') {
      applyCollectionListEditorialPreset(section);
    }
    if (meta.type === 'collection-list-grid' || item.id === 'collection-list-grid') {
      applyCollectionListGridPreset(section);
    }
    if (meta.type === 'layered-slideshow' || item.id === 'layered-slideshow') {
      applyLayeredSlideshowPreset(section);
    }
    if (meta.type === 'slideshow-full-frame' || item.id === 'slideshow-full-frame') {
      applySlideshowFullFramePreset(section);
    }
    if (meta.type === 'slideshow-inset' || item.id === 'slideshow-inset') {
      applySlideshowInsetPreset(section);
    }
    if (meta.type === 'contact-form' || item.id === 'contact-form') {
      applyContactFormPreset(section);
    }
    if (meta.type === 'email-signup' || item.id === 'email-signup') {
      applyEmailSignupPreset(section);
    }
    sections[instanceId] = section;
    next.sections = sections;

    const order = getLayoutOrder(next);
    const key = ctx.groupId === 'header' ? 'header' : 'footer';
    const current = [...(order[key] ?? (key === 'header' ? defaultHeaderSectionOrder(next) : defaultFooterSectionOrder(next)))];
    order[key] = insertIntoOrder(current, instanceId, ctx);
    setNested(next, ['layout_order'], order);

    return {
      config: next,
      instanceId,
      nodeId: `layout:${instanceId}`,
      listKey: key === 'header' ? listKeyHeaderSections() : listKeyFooterSections(),
    };
  }

  if (ctx.groupId === 'template') {
    const tplId = templateIdForPage(previewPage);
    const overlapMeta =
      FOOTER_FORMS_RESOLVE[item.id] ??
      FOOTER_STORYTELLING_RESOLVE[item.id] ??
      FOOTER_TEXT_RESOLVE[item.id] ??
      FOOTER_PRODUCTS_RESOLVE[item.id] ??
      (item.id === 'custom-section' || item.id === 'divider'
        ? LAYOUT_SECTION_RESOLVE[item.id]
        : null);
    let meta =
      CATALOG_BLUEPRINT[item.id] ??
      (overlapMeta
        ? {
            blueprintId: overlapMeta.blueprintId,
            type: overlapMeta.type,
            label: overlapMeta.label,
          }
        : null) ??
      metaFromTemplateCatalog(item.id) ??
      null;
    if (!meta) {
      const fromTpl = resolveTemplateBlueprint(item.id, schema, previewPage);
      if (!fromTpl) return null;
      meta = fromTpl;
    }

    const tpl = ensureTemplateInConfig(next, tplId, packDefaultConfig);
    if (packDefaultConfig) {
      mergeTemplateSectionBlueprintsFromPack(next, packDefaultConfig, tplId);
    }

    const sections = (tpl.sections ?? {}) as Record<string, unknown>;
    const instanceId = newTemplateInstanceId(sections, meta.blueprintId);
    cloneTemplateSection(next, tplId, meta.blueprintId, instanceId, meta);
    const inserted = (tpl.sections as Record<string, Record<string, unknown>>)[instanceId];
    if (inserted) applyTemplateCatalogPreset(inserted, item.id, tplId, instanceId);

    const order = Array.isArray(tpl.section_order)
      ? [...(tpl.section_order as string[])]
      : Object.keys(sections);
    const anchorAfter = ctx.afterNodeId?.match(/^template:[^:]+:([^:]+)$/)?.[1];
    const anchorBefore = ctx.beforeNodeId?.match(/^template:[^:]+:([^:]+)$/)?.[1];
    let newOrder = order.filter((id) => id !== instanceId);
    if (anchorBefore && anchorBefore !== 'add-section') {
      const idx = newOrder.indexOf(anchorBefore);
      if (idx >= 0) newOrder.splice(idx, 0, instanceId);
      else newOrder.push(instanceId);
    } else if (anchorAfter && anchorAfter !== 'add-section') {
      const idx = newOrder.indexOf(anchorAfter);
      if (idx >= 0) newOrder.splice(idx + 1, 0, instanceId);
      else newOrder.push(instanceId);
    } else {
      newOrder.push(instanceId);
    }
    tpl.section_order = newOrder;

    return {
      config: next,
      instanceId,
      nodeId: `template:${tplId}:${instanceId}`,
      listKey: listKeyTemplateSections(tplId),
    };
  }

  return null;
}

const PROTECTED_LAYOUT_SECTIONS = new Set(['header', 'footer', 'footer_utilities']);

const PROTECTED_LAYOUT_BLUEPRINTS = new Set(['header', 'footer', 'footer_utilities']);

const PROTECTED_TEMPLATE_INSTANCES: Record<string, Set<string>> = {
  index: new Set(['hero_main', 'featured_collection']),
};

export type ThemeEditorDeleteOptions = { creatorMode?: boolean };

export function canDeleteLayoutSection(
  instanceId: string,
  opts?: ThemeEditorDeleteOptions
): boolean {
  if (opts?.creatorMode) return true;
  if (PROTECTED_LAYOUT_SECTIONS.has(instanceId)) return false;
  return !PROTECTED_LAYOUT_BLUEPRINTS.has(layoutBlueprintKey(instanceId));
}

export function canDeleteTemplateSection(
  tplId: string,
  instanceId: string,
  opts?: ThemeEditorDeleteOptions
): boolean {
  if (opts?.creatorMode) return true;
  return !PROTECTED_TEMPLATE_INSTANCES[tplId]?.has(instanceId);
}

/** Remove a header/footer layout section instance and update layout_order. */
export function removeLayoutSection(
  config: Record<string, unknown>,
  instanceId: string,
  groupId: 'header' | 'footer',
  opts?: ThemeEditorDeleteOptions
): Record<string, unknown> | null {
  if (!opts?.creatorMode && PROTECTED_LAYOUT_SECTIONS.has(instanceId)) return null;

  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const sections = (next.sections ?? {}) as Record<string, unknown>;
  if (!sections[instanceId]) return null;

  delete sections[instanceId];
  next.sections = sections;

  const order = ensureLayoutOrder(next);
  const key = groupId === 'header' ? 'header' : 'footer';
  const current = [...(order[key] ?? [])];
  order[key] = current.filter((id) => id !== instanceId);
  setNested(next, ['layout_order'], order);
  sanitizeThemeConfigStructure(next);

  return next;
}

/** Remove a template section instance and update section_order. */
export function removeTemplateSection(
  config: Record<string, unknown>,
  tplId: string,
  instanceId: string,
  opts?: ThemeEditorDeleteOptions
): Record<string, unknown> | null {
  if (!canDeleteTemplateSection(tplId, instanceId, opts)) return null;

  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const templates = (next.templates ?? {}) as Record<string, Record<string, unknown>>;
  const tpl = templates[tplId];
  if (!tpl) return null;

  const sections = (tpl.sections ?? {}) as Record<string, unknown>;
  if (!sections[instanceId]) return null;

  delete sections[instanceId];
  tpl.sections = sections;

  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  tpl.section_order = order.filter((id) => id !== instanceId);
  templates[tplId] = tpl;
  next.templates = templates;
  sanitizeThemeConfigStructure(next);

  return next;
}

export type AddBlockTarget = {
  scope: 'layout' | 'template';
  sectionInstanceId: string;
  templateId?: string;
  faqTarget?: 'section' | 'accordion' | { rowId: string };
};

/** Parse sidebar add-block node id (`layout:announcement_bar:add-block`, etc.). */
export function parseAddBlockTargetNodeId(nodeId: string): AddBlockTarget | null {
  const layoutRowInner = nodeId.match(
    /^layout:([^:]+):block:accordion:nested:([^:]+):inner-add-block$/
  );
  if (layoutRowInner) {
    return {
      scope: 'layout',
      sectionInstanceId: layoutRowInner[1]!,
      faqTarget: { rowId: layoutRowInner[2]! },
    };
  }

  const tplRowInner = nodeId.match(
    /^template:([^:]+):([^:]+):block:accordion:nested:([^:]+):inner-add-block$/
  );
  if (tplRowInner) {
    return {
      scope: 'template',
      templateId: tplRowInner[1]!,
      sectionInstanceId: tplRowInner[2]!,
      faqTarget: { rowId: tplRowInner[3]! },
    };
  }

  const layoutAccordionInner = nodeId.match(/^layout:([^:]+):block:accordion:inner-add-block$/);
  if (layoutAccordionInner) {
    return {
      scope: 'layout',
      sectionInstanceId: layoutAccordionInner[1]!,
      faqTarget: 'accordion',
    };
  }

  const tplAccordionInner = nodeId.match(/^template:([^:]+):([^:]+):block:accordion:inner-add-block$/);
  if (tplAccordionInner) {
    return {
      scope: 'template',
      templateId: tplAccordionInner[1]!,
      sectionInstanceId: tplAccordionInner[2]!,
      faqTarget: 'accordion',
    };
  }

  const layout = nodeId.match(/^layout:([^:]+):add-block$/);
  if (layout) return { scope: 'layout', sectionInstanceId: layout[1]!, faqTarget: 'section' };
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):add-block$/);
  if (tpl) {
    return {
      scope: 'template',
      templateId: tpl[1]!,
      sectionInstanceId: tpl[2]!,
      faqTarget: 'section',
    };
  }
  return null;
}

function nextBlockInstanceId(baseId: string, existingIds: string[]): string {
  if (!existingIds.includes(baseId)) return baseId;
  let n = 2;
  while (existingIds.includes(`${baseId}_${n}`)) n += 1;
  return `${baseId}_${n}`;
}

export type InsertBlockResult = {
  config: Record<string, unknown>;
  blockInstanceId: string;
  nodeId: string;
  sectionInstanceId: string;
  scope: AddBlockTarget['scope'];
  templateId?: string;
};

const HERO_TEXT_DEFAULT =
  'Made with care and unconditionally loved by our customers.';
const HERO_HEADING_DEFAULT = 'Browse our latest products';
const HERO_BUTTON_DEFAULT = { label: 'Shop all', href: '/products' };
const HERO_IMAGE_DEFAULT = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80';
const FEATURED_COLLECTION_HEADER_DEFAULT = {
  type: 'collection-header',
  settings: {
    title: 'Products',
    viewAllLabel: '',
    viewAllHref: '/products',
  },
};
const FEATURED_COLLECTION_PRODUCT_CARD_DEFAULT = {
  type: 'product-card',
  settings: {
    showMedia: true,
    showTitle: true,
    showPrice: true,
  },
};

function normalizeCatalogBlockId(catalogBlockId: string): string {
  return catalogBlockId.trim().toLowerCase().replace(/_/g, '-');
}

function heroSchemaBlockIdForCatalog(catalogBlockId: string, blockInstanceId: string): string {
  if (catalogBlockId === 'heading' || blockInstanceId === 'heading') return 'heading';
  if (
    catalogBlockId === 'text' ||
    catalogBlockId === 'description' ||
    catalogBlockId === 'special-instructions' ||
    blockInstanceId.startsWith('text_')
  ) {
    return 'text_2';
  }
  if (
    catalogBlockId === 'button' ||
    catalogBlockId === 'buy-buttons' ||
    blockInstanceId.includes('button')
  ) {
    return 'primary_button';
  }
  return blockInstanceId;
}

function findHeroSchemaBlock(
  schema: EditorSchemaDoc,
  schemaBlockId: string
): { settingsFields?: { path: string; type: string }[] } | undefined {
  const tpl = schema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === 'hero_main');
  if (!sec?.blocks?.length) return undefined;
  if (schemaBlockId === 'heading') {
    return sec.blocks.find((b) => (b.id ?? '') === 'heading');
  }
  if (schemaBlockId === 'text_2') {
    return sec.blocks.find((b) => (b.id ?? '') === 'text_2' || (b.id ?? '').startsWith('text'));
  }
  if (schemaBlockId === 'primary_button') {
    return sec.blocks.find(
      (b) => (b.id ?? '') === 'primary_button' || (b.id ?? '').includes('button')
    );
  }
  return sec.blocks.find((b) => (b.id ?? '') === schemaBlockId);
}

function heroSyntheticSettingsFields(
  catalogBlockId: string,
  blockInstanceId: string,
  scope: AddBlockTarget['scope'],
  tplId: string | undefined,
  sectionInstanceId: string
): { path: string; type: string }[] {
  const blocksBase =
    scope === 'template' && tplId
      ? `templates.${tplId}.sections.${sectionInstanceId}.blocks.${blockInstanceId}.settings`
      : `sections.${sectionInstanceId}.blocks.${blockInstanceId}.settings`;
  if (catalogBlockId === 'icon') {
    return [
      { path: `${blocksBase}.icon`, type: 'text' },
      { path: `${blocksBase}.label`, type: 'text' },
    ];
  }
  if (catalogBlockId === 'image') {
    return [
      { path: `${blocksBase}.url`, type: 'text' },
      { path: `${blocksBase}.alt`, type: 'text' },
    ];
  }
  if (catalogBlockId === 'video') {
    return [
      { path: `${blocksBase}.url`, type: 'text' },
      { path: `${blocksBase}.autoplay`, type: 'boolean' },
      { path: `${blocksBase}.muted`, type: 'boolean' },
    ];
  }
  if (catalogBlockId === 'logo') {
    return [
      { path: `${blocksBase}.text`, type: 'text' },
      { path: `${blocksBase}.imageUrl`, type: 'text' },
    ];
  }
  if (catalogBlockId === 'page') {
    return [
      { path: `${blocksBase}.title`, type: 'text' },
      { path: `${blocksBase}.href`, type: 'text' },
    ];
  }
  return [];
}

function nextHeroTextBlockId(order: string[], blocks: Record<string, unknown>): string {
  const existing = new Set([...order, ...Object.keys(blocks)]);
  if (!existing.has('text_2')) return 'text_2';
  let n = 3;
  while (existing.has(`text_${n}`)) n += 1;
  return `text_${n}`;
}

function nextHeroHeadingBlockId(order: string[], blocks: Record<string, unknown>): string {
  const existing = new Set([...order, ...Object.keys(blocks)]);
  if (!existing.has('heading')) return 'heading';
  let n = 2;
  while (existing.has(`heading_${n}`)) n += 1;
  return `heading_${n}`;
}

function nextHeroButtonBlockId(order: string[], blocks: Record<string, unknown>): string | null {
  const existing = new Set([...order, ...Object.keys(blocks)]);
  if (!existing.has('primary_button')) return 'primary_button';
  if (!existing.has('secondary_button')) return 'secondary_button';
  let n = 3;
  while (existing.has(`button_${n}`)) n += 1;
  return `button_${n}`;
}

function heroCatalogBlockSupported(catalogBlockId: string): boolean {
  const normalized = normalizeCatalogBlockId(catalogBlockId);
  return (
    normalized === 'heading' ||
    normalized === 'text' ||
    normalized === 'button' ||
    normalized === 'icon' ||
    normalized === 'image' ||
    normalized === 'logo' ||
    normalized === 'page' ||
    normalized === 'video' ||
    normalized === 'buy-buttons' ||
    normalized === 'description' ||
    normalized === 'special-instructions'
  );
}

function insertHeroBlock(
  sec: Record<string, unknown>,
  catalogBlockId: string
): { blockInstanceId: string; schemaBlockId: string } | null {
  const normalizedCatalogBlockId = normalizeCatalogBlockId(catalogBlockId);
  if (!heroCatalogBlockSupported(normalizedCatalogBlockId)) return null;

  const blocks = { ...((sec.blocks ?? {}) as Record<string, Record<string, unknown>>) };
  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];

  if (normalizedCatalogBlockId === 'heading') {
    const blockInstanceId = nextHeroHeadingBlockId(order, blocks);
    blocks[blockInstanceId] = {
      type: 'heading',
      settings: {
        heading: HERO_HEADING_DEFAULT,
      },
    };
    order.push(blockInstanceId);
    sec.block_order = order;
    sec.blocks = blocks;
    return { blockInstanceId, schemaBlockId: 'heading' };
  }

  if (normalizedCatalogBlockId === 'text' || normalizedCatalogBlockId === 'description' || normalizedCatalogBlockId === 'special-instructions') {
    const blockInstanceId = nextHeroTextBlockId(order, blocks);
    blocks[blockInstanceId] = {
      type: 'text',
      settings: {
        text:
          normalizedCatalogBlockId === 'description'
            ? 'Product description'
            : normalizedCatalogBlockId === 'special-instructions'
              ? 'Add special instructions for your order.'
              : HERO_TEXT_DEFAULT,
      },
    };
    order.push(blockInstanceId);
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId, schemaBlockId: 'text_2' };
  }

  if (normalizedCatalogBlockId === 'button' || normalizedCatalogBlockId === 'buy-buttons') {
    const blockInstanceId = nextHeroButtonBlockId(order, blocks);
    if (!blockInstanceId) return null;
    const isSecondary = blockInstanceId === 'secondary_button';
    blocks[blockInstanceId] = {
      type: 'button',
      settings: {
        label: isSecondary ? 'Learn more' : HERO_BUTTON_DEFAULT.label,
        href: isSecondary ? '/#about' : HERO_BUTTON_DEFAULT.href,
        openInNewTab: false,
        buttonStyle: isSecondary ? 'secondary' : 'primary',
        desktopWidth: 'fit',
        desktopCustomWidth: 100,
        mobileWidth: 'fit',
        mobileCustomWidth: 100,
        ariaLabel: '',
      },
    };
    order.push(blockInstanceId);
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId, schemaBlockId: 'primary_button' };
  }

  if (normalizedCatalogBlockId === 'icon') {
    const blockInstanceId = nextBlockInstanceId('icon', order);
    blocks[blockInstanceId] = {
      type: 'icon',
      settings: {
        icon: 'star',
        label: 'Featured',
      },
    };
    order.push(blockInstanceId);
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId, schemaBlockId: blockInstanceId };
  }

  if (normalizedCatalogBlockId === 'image') {
    const blockInstanceId = nextBlockInstanceId('image', order);
    blocks[blockInstanceId] = {
      type: 'image',
      settings: {
        url: HERO_IMAGE_DEFAULT,
        alt: 'Hero image',
      },
    };
    order.push(blockInstanceId);
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId, schemaBlockId: blockInstanceId };
  }

  if (normalizedCatalogBlockId === 'video') {
    const blockInstanceId = nextBlockInstanceId('video', order);
    blocks[blockInstanceId] = {
      type: 'video',
      settings: {
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        autoplay: false,
        muted: true,
      },
    };
    order.push(blockInstanceId);
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId, schemaBlockId: blockInstanceId };
  }

  if (normalizedCatalogBlockId === 'logo') {
    const blockInstanceId = nextBlockInstanceId('logo', order);
    blocks[blockInstanceId] = {
      type: 'logo',
      settings: {
        text: 'Your brand',
        imageUrl: '',
      },
    };
    order.push(blockInstanceId);
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId, schemaBlockId: blockInstanceId };
  }

  if (normalizedCatalogBlockId === 'page') {
    const blockInstanceId = nextBlockInstanceId('page', order);
    blocks[blockInstanceId] = {
      type: 'page',
      settings: {
        title: 'Learn more',
        href: '/pages/about',
      },
    };
    order.push(blockInstanceId);
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId, schemaBlockId: blockInstanceId };
  }

  return null;
}

function featuredCollectionCatalogBlockSupported(catalogBlockId: string): boolean {
  const normalized = normalizeCatalogBlockId(catalogBlockId);
  return normalized === 'collection-card' || normalized === 'collection-title';
}

function insertFeaturedCollectionBlock(
  sec: Record<string, unknown>,
  catalogBlockId: string
): { blockInstanceId: string } | null {
  const normalizedCatalogBlockId = normalizeCatalogBlockId(catalogBlockId);
  if (!featuredCollectionCatalogBlockSupported(normalizedCatalogBlockId)) return null;
  const blocks = { ...((sec.blocks ?? {}) as Record<string, Record<string, unknown>>) };
  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];

  if (normalizedCatalogBlockId === 'collection-title') {
    if (!blocks.collection_header) {
      blocks.collection_header = { ...FEATURED_COLLECTION_HEADER_DEFAULT };
    } else if (typeof blocks.collection_header === 'object' && blocks.collection_header) {
      blocks.collection_header = {
        ...(blocks.collection_header as Record<string, unknown>),
        enabled: true,
      };
    }
    if (!order.includes('collection_header')) order.push('collection_header');
    sec.blocks = blocks;
    sec.block_order = order;
    return { blockInstanceId: 'collection_header' };
  }

  if (!blocks.product_card) {
    blocks.product_card = { ...FEATURED_COLLECTION_PRODUCT_CARD_DEFAULT };
  } else if (typeof blocks.product_card === 'object' && blocks.product_card) {
    blocks.product_card = {
      ...(blocks.product_card as Record<string, unknown>),
      enabled: true,
    };
  }
  if (!order.includes('product_card')) order.push('product_card');
  sec.blocks = blocks;
  sec.block_order = order;
  return { blockInstanceId: 'product_card' };
}

function insertAnnouncementLayoutBlock(
  sec: Record<string, unknown>
): { blockInstanceId: string } | null {
  const blocks = { ...((sec.blocks ?? {}) as Record<string, Record<string, unknown>>) };
  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];
  const blockInstanceId = nextBlockInstanceId('announcement', order);
  blocks[blockInstanceId] = {
    type: 'announcement',
    settings: {
      ...ANNOUNCEMENT_BLOCK_DEFAULT_SETTINGS,
      text: 'New announcement',
    },
  };
  order.push(blockInstanceId);
  sec.blocks = blocks;
  sec.block_order = order;
  return { blockInstanceId };
}

function footerUtilitiesCatalogBlockSupported(catalogBlockId: string): boolean {
  const normalized = normalizeCatalogBlockId(catalogBlockId);
  return normalized === 'copyright' || normalized === 'policy-links' || normalized === 'social' || normalized === 'social-media-links';
}

function footerUtilitiesSchemaBlockIdForCatalog(catalogBlockId: string): string | null {
  const normalized = normalizeCatalogBlockId(catalogBlockId);
  if (normalized === 'copyright') return 'copyright';
  if (normalized === 'policy-links') return 'policy_links';
  if (normalized === 'social' || normalized === 'social-media-links') return 'social';
  return null;
}

function insertFooterUtilitiesBlock(
  sec: Record<string, unknown>,
  catalogBlockId: string
): { blockInstanceId: string } | null {
  if (!footerUtilitiesCatalogBlockSupported(catalogBlockId)) return null;
  const schemaBlockId = footerUtilitiesSchemaBlockIdForCatalog(catalogBlockId);
  if (!schemaBlockId) return null;
  const blocks = { ...((sec.blocks ?? {}) as Record<string, Record<string, unknown>>) };
  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];
  const existing = blocks[schemaBlockId];
  if (!existing) return null;
  blocks[schemaBlockId] = {
    ...(existing as Record<string, unknown>),
    enabled: true,
  };
  if (!order.includes(schemaBlockId)) order.push(schemaBlockId);
  sec.blocks = blocks;
  sec.block_order = order;
  return { blockInstanceId: schemaBlockId };
}

function sectionIsHero(sec: Record<string, unknown>, sectionInstanceId: string, scope: AddBlockTarget['scope']): boolean {
  if (sec.type === 'hero') return true;
  const blueprint =
    scope === 'layout'
      ? layoutBlueprintKey(sectionInstanceId)
      : templateBlueprintKey(sectionInstanceId);
  return blueprint === 'hero_main';
}

function sectionIsFooterUtilities(
  sec: Record<string, unknown>,
  sectionInstanceId: string,
  scope: AddBlockTarget['scope']
): boolean {
  if (sec.type === 'footer_utilities') return true;
  const blueprint =
    scope === 'layout'
      ? layoutBlueprintKey(sectionInstanceId)
      : templateBlueprintKey(sectionInstanceId);
  return blueprint === 'footer_utilities';
}

function sectionIsFeaturedCollection(
  sec: Record<string, unknown>,
  sectionInstanceId: string,
  scope: AddBlockTarget['scope']
): boolean {
  if (sec.type === 'featured-collection') return true;
  const blueprint =
    scope === 'layout'
      ? layoutBlueprintKey(sectionInstanceId)
      : templateBlueprintKey(sectionInstanceId);
  return blueprint === 'featured_collection';
}

function sectionIsFaq(
  sec: Record<string, unknown>,
  sectionInstanceId: string,
  scope: AddBlockTarget['scope']
): boolean {
  if (sec.type === 'faq') return true;
  const blueprint =
    scope === 'layout'
      ? layoutBlueprintKey(sectionInstanceId)
      : templateBlueprintKey(sectionInstanceId);
  return blueprint === 'faq_section';
}

function sectionIsIconsWithText(
  sec: Record<string, unknown>,
  sectionInstanceId: string,
  scope: AddBlockTarget['scope']
): boolean {
  if (sec.type === 'icons-with-text') return true;
  const blueprint =
    scope === 'layout'
      ? layoutBlueprintKey(sectionInstanceId)
      : templateBlueprintKey(sectionInstanceId);
  return blueprint === 'icons_with_text';
}

function nextIconsWithTextBlockId(order: string[], blocks: Record<string, unknown>): string {
  const existing = new Set([...order, ...Object.keys(blocks)]);
  let n = 1;
  while (existing.has(`icon_${n}`)) n += 1;
  return `icon_${n}`;
}

function insertIconsWithTextBlock(
  sec: Record<string, unknown>,
  catalogBlockId: string
): { blockInstanceId: string } | null {
  if (normalizeCatalogBlockId(catalogBlockId) !== 'icon-with-text-item') return null;
  const blocks = { ...((sec.blocks ?? {}) as Record<string, Record<string, unknown>>) };
  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];
  const blockId = nextIconsWithTextBlockId(order, blocks);
  blocks[blockId] = {
    type: 'icon-with-text-item',
    settings: {
      icon: 'eye',
      heading: 'Heading',
      text: '',
    },
  };
  order.push(blockId);
  sec.blocks = blocks;
  sec.block_order = order;
  return { blockInstanceId: blockId };
}

function nextFaqRowId(order: string[], blocks: Record<string, unknown>): string {
  const existing = new Set([...order, ...Object.keys(blocks)]);
  let n = 1;
  while (existing.has(`row_${n}`)) n += 1;
  return `row_${n}`;
}

function nextFaqRowTextId(order: string[], blocks: Record<string, unknown>): string {
  const existing = new Set([...order, ...Object.keys(blocks)]);
  if (!existing.has('text')) return 'text';
  let n = 2;
  while (existing.has(`text_${n}`)) n += 1;
  return `text_${n}`;
}

function faqNodeId(
  scope: AddBlockTarget['scope'],
  tplId: string | undefined,
  sectionInstanceId: string,
  suffix: string
): string {
  return scope === 'template' && tplId
    ? `template:${tplId}:${sectionInstanceId}:${suffix}`
    : `layout:${sectionInstanceId}:${suffix}`;
}

function insertFaqBlock(
  sec: Record<string, unknown>,
  catalogBlockId: string,
  target: AddBlockTarget
): { blockInstanceId: string; nodeId: string } | null {
  const normalized = normalizeCatalogBlockId(catalogBlockId);
  const faqTarget = target.faqTarget ?? 'section';

  if (faqTarget === 'accordion') {
    if (normalized !== 'accordion-row') return null;
    const blocks = (sec.blocks ?? {}) as Record<string, Record<string, unknown>>;
    const accordion = (blocks.accordion ?? { type: 'group', settings: faqAccordionDefaultSettings() }) as Record<
      string,
      unknown
    >;
    const rowBlocks = { ...((accordion.blocks ?? {}) as Record<string, Record<string, unknown>>) };
    const rowOrder = Array.isArray(accordion.block_order) ? [...(accordion.block_order as string[])] : [];
    const rowId = nextFaqRowId(rowOrder, rowBlocks);
    rowBlocks[rowId] = {
      type: 'accordion-row',
      settings: faqAccordionRowDefaultSettings(),
      block_order: ['text'],
      blocks: {
        text: {
          type: 'text',
          settings: textBlockDefaultSettings(),
        },
      },
    };
    rowOrder.push(rowId);
    accordion.type = 'group';
    accordion.blocks = rowBlocks;
    accordion.block_order = rowOrder;
    if (!accordion.settings) accordion.settings = faqAccordionDefaultSettings();
    blocks.accordion = accordion;
    sec.blocks = blocks;
    if (!Array.isArray(sec.block_order) || !(sec.block_order as string[]).includes('accordion')) {
      const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [...FAQ_SECTION_BLOCK_ORDER];
      if (!order.includes('accordion')) order.push('accordion');
      sec.block_order = order;
    }
    return {
      blockInstanceId: rowId,
      nodeId: faqNodeId(target.scope, target.templateId, target.sectionInstanceId, `block:accordion:nested:${rowId}`),
    };
  }

  if (typeof faqTarget === 'object') {
    if (normalized !== 'text') return null;
    const blocks = (sec.blocks ?? {}) as Record<string, Record<string, unknown>>;
    const accordion = blocks.accordion as Record<string, unknown> | undefined;
    if (!accordion) return null;
    const rowBlocks = (accordion.blocks ?? {}) as Record<string, Record<string, unknown>>;
    const row = rowBlocks[faqTarget.rowId];
    if (!row || row.type !== 'accordion-row') return null;
    const nestedBlocks = { ...((row.blocks ?? {}) as Record<string, Record<string, unknown>>) };
    const nestedOrder = Array.isArray(row.block_order) ? [...(row.block_order as string[])] : [];
    const textId = nextFaqRowTextId(nestedOrder, nestedBlocks);
    nestedBlocks[textId] = { type: 'text', settings: textBlockDefaultSettings() };
    nestedOrder.push(textId);
    row.blocks = nestedBlocks;
    row.block_order = nestedOrder;
    rowBlocks[faqTarget.rowId] = row;
    accordion.blocks = rowBlocks;
    blocks.accordion = accordion;
    sec.blocks = blocks;
    return {
      blockInstanceId: textId,
      nodeId: faqNodeId(
        target.scope,
        target.templateId,
        target.sectionInstanceId,
        `block:accordion:nested:${faqTarget.rowId}:nested:${textId}`
      ),
    };
  }

  const blocks = { ...((sec.blocks ?? {}) as Record<string, Record<string, unknown>>) };
  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];

  if (normalized === 'heading') {
    if (blocks.heading) return null;
    blocks.heading = { type: 'heading', settings: { heading: 'Frequently asked questions' } };
    if (!order.includes('heading')) order.push('heading');
    sec.blocks = blocks;
    sec.block_order = order;
    return {
      blockInstanceId: 'heading',
      nodeId: faqNodeId(target.scope, target.templateId, target.sectionInstanceId, 'block:heading'),
    };
  }

  if (normalized === 'accordion') {
    if (blocks.accordion) return null;
    blocks.accordion = {
      type: 'group',
      settings: faqAccordionDefaultSettings(),
      block_order: [],
      blocks: {},
    };
    if (!order.includes('accordion')) order.push('accordion');
    sec.blocks = blocks;
    sec.block_order = order;
    return {
      blockInstanceId: 'accordion',
      nodeId: faqNodeId(target.scope, target.templateId, target.sectionInstanceId, 'block:accordion'),
    };
  }

  return null;
}

/** Append an allowlisted block to a layout or template section from the add-block picker. */
export function insertBlockFromCatalog(
  config: Record<string, unknown>,
  addBlockNodeId: string,
  catalogBlockId: string,
  schema: EditorSchemaDoc
): InsertBlockResult | null {
  const target = parseAddBlockTargetNodeId(addBlockNodeId);
  if (!target) return null;
  if (catalogBlockId === 'generate') return null;

  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;

  if (target.scope === 'layout') {
    const sections = (next.sections ?? {}) as Record<string, Record<string, unknown>>;
    const sec = sections[target.sectionInstanceId];
    if (!sec || typeof sec !== 'object') return null;

    const blueprint = layoutBlueprintKey(target.sectionInstanceId);
    if (blueprint === 'announcement_bar' && catalogBlockId === 'announcement') {
      const inserted = insertAnnouncementLayoutBlock(sec);
      if (!inserted) return null;
      sections[target.sectionInstanceId] = sec;
      next.sections = sections;
      const { blockInstanceId } = inserted;
      return {
        config: next,
        blockInstanceId,
        sectionInstanceId: target.sectionInstanceId,
        scope: 'layout',
        nodeId: `layout:${target.sectionInstanceId}:block:${blockInstanceId}`,
      };
    }

    if (sectionIsHero(sec, target.sectionInstanceId, 'layout')) {
      const inserted = insertHeroBlock(sec, catalogBlockId);
      if (!inserted) return null;
      sections[target.sectionInstanceId] = sec;
      next.sections = sections;
      return {
        config: next,
        blockInstanceId: inserted.blockInstanceId,
        sectionInstanceId: target.sectionInstanceId,
        scope: 'layout',
        nodeId: `layout:${target.sectionInstanceId}:block:${inserted.blockInstanceId}`,
      };
    }
    if (sectionIsFooterUtilities(sec, target.sectionInstanceId, 'layout')) {
      const inserted = insertFooterUtilitiesBlock(sec, catalogBlockId);
      if (!inserted) return null;
      sections[target.sectionInstanceId] = sec;
      next.sections = sections;
      return {
        config: next,
        blockInstanceId: inserted.blockInstanceId,
        sectionInstanceId: target.sectionInstanceId,
        scope: 'layout',
        nodeId: `layout:${target.sectionInstanceId}:block:${inserted.blockInstanceId}`,
      };
    }
    if (sectionIsFeaturedCollection(sec, target.sectionInstanceId, 'layout')) {
      const inserted = insertFeaturedCollectionBlock(sec, catalogBlockId);
      if (!inserted) return null;
      sections[target.sectionInstanceId] = sec;
      next.sections = sections;
      return {
        config: next,
        blockInstanceId: inserted.blockInstanceId,
        sectionInstanceId: target.sectionInstanceId,
        scope: 'layout',
        nodeId: `layout:${target.sectionInstanceId}:block:${inserted.blockInstanceId}`,
      };
    }
    if (sectionIsFaq(sec, target.sectionInstanceId, 'layout')) {
      const inserted = insertFaqBlock(sec, catalogBlockId, target);
      if (!inserted) return null;
      sections[target.sectionInstanceId] = sec;
      next.sections = sections;
      return {
        config: next,
        blockInstanceId: inserted.blockInstanceId,
        sectionInstanceId: target.sectionInstanceId,
        scope: 'layout',
        nodeId: inserted.nodeId,
      };
    }
    if (sectionIsIconsWithText(sec, target.sectionInstanceId, 'layout')) {
      const inserted = insertIconsWithTextBlock(sec, catalogBlockId);
      if (!inserted) return null;
      sections[target.sectionInstanceId] = sec;
      next.sections = sections;
      return {
        config: next,
        blockInstanceId: inserted.blockInstanceId,
        sectionInstanceId: target.sectionInstanceId,
        scope: 'layout',
        nodeId: `layout:${target.sectionInstanceId}:block:${inserted.blockInstanceId}`,
      };
    }
    return null;
  }

  const tplId = target.templateId ?? 'index';
  const templates = (next.templates ?? {}) as Record<string, Record<string, unknown>>;
  const tpl = templates[tplId];
  if (!tpl || typeof tpl !== 'object') return null;
  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const sec = sections[target.sectionInstanceId];
  if (!sec || typeof sec !== 'object') return null;

  if (sectionIsHero(sec, target.sectionInstanceId, 'template')) {
    const inserted = insertHeroBlock(sec, catalogBlockId);
    if (!inserted) return null;
    sections[target.sectionInstanceId] = sec;
    tpl.sections = sections;
    templates[tplId] = tpl;
    next.templates = templates;
    void schema;
    return {
      config: next,
      blockInstanceId: inserted.blockInstanceId,
      sectionInstanceId: target.sectionInstanceId,
      scope: 'template',
      templateId: tplId,
      nodeId: `template:${tplId}:${target.sectionInstanceId}:block:${inserted.blockInstanceId}`,
    };
  }
  if (sectionIsFeaturedCollection(sec, target.sectionInstanceId, 'template')) {
    const inserted = insertFeaturedCollectionBlock(sec, catalogBlockId);
    if (!inserted) return null;
    sections[target.sectionInstanceId] = sec;
    tpl.sections = sections;
    templates[tplId] = tpl;
    next.templates = templates;
    return {
      config: next,
      blockInstanceId: inserted.blockInstanceId,
      sectionInstanceId: target.sectionInstanceId,
      scope: 'template',
      templateId: tplId,
      nodeId: `template:${tplId}:${target.sectionInstanceId}:block:${inserted.blockInstanceId}`,
    };
  }
  if (sectionIsFaq(sec, target.sectionInstanceId, 'template')) {
    const inserted = insertFaqBlock(sec, catalogBlockId, { ...target, templateId: tplId });
    if (!inserted) return null;
    sections[target.sectionInstanceId] = sec;
    tpl.sections = sections;
    templates[tplId] = tpl;
    next.templates = templates;
    return {
      config: next,
      blockInstanceId: inserted.blockInstanceId,
      sectionInstanceId: target.sectionInstanceId,
      scope: 'template',
      templateId: tplId,
      nodeId: inserted.nodeId,
    };
  }
  if (sectionIsIconsWithText(sec, target.sectionInstanceId, 'template')) {
    const inserted = insertIconsWithTextBlock(sec, catalogBlockId);
    if (!inserted) return null;
    sections[target.sectionInstanceId] = sec;
    tpl.sections = sections;
    templates[tplId] = tpl;
    next.templates = templates;
    return {
      config: next,
      blockInstanceId: inserted.blockInstanceId,
      sectionInstanceId: target.sectionInstanceId,
      scope: 'template',
      templateId: tplId,
      nodeId: `template:${tplId}:${target.sectionInstanceId}:block:${inserted.blockInstanceId}`,
    };
  }

  return null;
}

/** Seed form values for nested FAQ accordion rows / row text blocks. */
export function extendValuesForFaqNestedBlock(
  values: Record<string, string | boolean>,
  scope: AddBlockTarget['scope'],
  tplId: string | undefined,
  sectionInstanceId: string,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const next = { ...values };
  const blocksBase =
    scope === 'template' && tplId
      ? `templates.${tplId}.sections.${sectionInstanceId}.blocks.accordion`
      : `sections.${sectionInstanceId}.blocks.accordion`;

  const rowMatch = nodeId.match(/:block:accordion:nested:([^:]+)$/);
  const textMatch = nodeId.match(/:block:accordion:nested:([^:]+):nested:([^:]+)$/);

  if (textMatch) {
    const [, rowId, textId] = textMatch;
    const prefix = `${blocksBase}.blocks.${rowId}.blocks.${textId}.settings`;
    const defaults = textBlockDefaultSettings();
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const path = `${prefix}.${key}`;
      const raw = getNested(config, path.split('.'));
      if (raw !== undefined) {
        next[path] =
          typeof defaultValue === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
      } else {
        next[path] = typeof defaultValue === 'boolean' ? defaultValue : String(defaultValue);
      }
    }
    return next;
  }

  if (rowMatch) {
    const [, rowId] = rowMatch;
    const prefix = `${blocksBase}.blocks.${rowId}.settings`;
    for (const key of ['heading', 'openByDefault', 'rowIcon', 'rowImageIconUrl', 'rowIconWidth']) {
      const path = `${prefix}.${key}`;
      const raw = getNested(config, path.split('.'));
      if (raw === undefined) continue;
      next[path] =
        key === 'openByDefault' ? Boolean(raw) : raw == null ? '' : String(raw);
    }
    const row = getNested(config, `${blocksBase}.blocks.${rowId}`.split('.')) as
      | { block_order?: string[]; blocks?: Record<string, unknown> }
      | undefined;
    const textOrder = Array.isArray(row?.block_order)
      ? row.block_order
      : Object.keys(row?.blocks ?? {});
    const textId = textOrder[0] ?? 'text';
    const textDefaults = textBlockDefaultSettings();
    for (const [key, defaultValue] of Object.entries(textDefaults)) {
      const path = `${blocksBase}.blocks.${rowId}.blocks.${textId}.settings.${key}`;
      const raw = getNested(config, path.split('.'));
      if (raw !== undefined) {
        next[path] =
          typeof defaultValue === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
      } else {
        next[path] = typeof defaultValue === 'boolean' ? defaultValue : String(defaultValue);
      }
    }
  }

  return next;
}

/** Seed form `values` for a newly added layout block instance. */
export function extendValuesForLayoutBlock(
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc,
  sectionInstanceId: string,
  blockInstanceId: string,
  blockTypeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const blueprint = layoutBlueprintKey(sectionInstanceId);
  const blockDef =
    schema.layout?.[blueprint]?.blocks?.find((b) => (b.id ?? '') === blockTypeId) ??
    schema.layout?.[blueprint]?.blocks?.find((b) => (b.id ?? '') === blockInstanceId);
  if (!blockDef?.settingsFields?.length) return values;

  const next = { ...values };
  for (const field of blockDef.settingsFields) {
    if (!field.path?.includes('.blocks.')) continue;
    const newPath = remapLayoutSchemaPath(field.path, sectionInstanceId).replace(
      /\.blocks\.[^.]+\./,
      `.blocks.${blockInstanceId}.`
    );
    const raw = getNested(config, newPath.split('.').filter(Boolean));
    if (raw === undefined) continue;
    next[newPath] =
      field.type === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
  }
  return next;
}

/** Seed form `values` for a newly added template block instance (non-hero sections). */
export function extendValuesForTemplateBlock(
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc,
  tplId: string,
  sectionInstanceId: string,
  blockInstanceId: string,
  blockTypeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const blueprint = templateBlueprintKey(sectionInstanceId);
  const tpl = schema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const blockDef =
    sec?.blocks?.find((b) => (b.id ?? '') === blockTypeId) ??
    sec?.blocks?.find((b) => (b.id ?? '') === blockInstanceId);
  if (!blockDef?.settingsFields?.length) return values;

  const next = { ...values };
  for (const field of blockDef.settingsFields) {
    if (!field.path?.includes('.blocks.')) continue;
    const remapped = remapTemplateSchemaPath(field.path, tplId, sectionInstanceId).replace(
      /\.blocks\.[^.]+\./,
      `.blocks.${blockInstanceId}.`
    );
    const raw = getNested(config, remapped.split('.').filter(Boolean));
    if (raw === undefined) continue;
    next[remapped] = field.type === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
  }
  return next;
}

/** Seed form `values` for a newly added hero block (template or layout footer hero). */
export function extendValuesForHeroBlock(
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc,
  scope: AddBlockTarget['scope'],
  tplId: string | undefined,
  sectionInstanceId: string,
  blockInstanceId: string,
  catalogBlockId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const schemaBlockId = heroSchemaBlockIdForCatalog(catalogBlockId, blockInstanceId);
  const blockDef = findHeroSchemaBlock(schema, schemaBlockId);
  const fallbackFields = heroSyntheticSettingsFields(
    catalogBlockId,
    blockInstanceId,
    scope,
    tplId,
    sectionInstanceId
  );
  const fields = blockDef?.settingsFields?.length ? blockDef.settingsFields : fallbackFields;
  if (!fields.length) return values;

  const next = { ...values };
  for (const field of fields) {
    if (!field.path) continue;
    let newPath =
      scope === 'template' && tplId
        ? remapTemplateSchemaPath(field.path, tplId, sectionInstanceId)
        : remapTemplateHeroSchemaPath(field.path, sectionInstanceId);
    if (blockInstanceId !== 'heading' && schemaBlockId !== blockInstanceId) {
      newPath = newPath.replace(
        new RegExp(`\\.blocks\\.${schemaBlockId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.`),
        `.blocks.${blockInstanceId}.`
      );
    }
    const raw = getNested(config, newPath.split('.').filter(Boolean));
    if (raw === undefined) continue;
    next[newPath] =
      field.type === 'boolean' ? Boolean(raw) : raw == null ? '' : String(raw);
  }
  return next;
}

/** Remove a block from a layout section (e.g. announcement under announcement_bar). */
export function removeLayoutBlock(
  config: Record<string, unknown>,
  sectionInstanceId: string,
  blockId: string
): Record<string, unknown> | null {
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const sections = (next.sections ?? {}) as Record<string, Record<string, unknown>>;
  const sec = sections[sectionInstanceId];
  if (!sec || typeof sec !== 'object') return null;

  const blocks = (sec.blocks ?? {}) as Record<string, unknown>;
  if (!blocks[blockId]) return null;

  delete blocks[blockId];
  sec.blocks = blocks;

  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];
  if (order.length <= 1 && order.includes(blockId)) return null;
  sec.block_order = order.filter((id) => id !== blockId);

  return next;
}

/** Drop value paths for a removed layout block. */
export function pruneValuesForLayoutBlock(
  values: Record<string, string | boolean>,
  sectionInstanceId: string,
  blockId: string
): Record<string, string | boolean> {
  const prefix = `sections.${sectionInstanceId}.blocks.${blockId}.`;
  const next: Record<string, string | boolean> = {};
  for (const [path, val] of Object.entries(values)) {
    if (!path.startsWith(prefix)) next[path] = val;
  }
  return next;
}

/** Remove a block from a template section instance. */
export function removeTemplateBlock(
  config: Record<string, unknown>,
  tplId: string,
  sectionInstanceId: string,
  blockId: string
): Record<string, unknown> | null {
  const next = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
  const templates = (next.templates ?? {}) as Record<string, Record<string, unknown>>;
  const tpl = templates[tplId];
  if (!tpl || typeof tpl !== 'object') return null;

  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const sec = sections[sectionInstanceId];
  if (!sec || typeof sec !== 'object') return null;

  const blocks = (sec.blocks ?? {}) as Record<string, unknown>;
  if (!blocks[blockId]) return null;

  delete blocks[blockId];
  sec.blocks = blocks;

  const order = Array.isArray(sec.block_order) ? [...(sec.block_order as string[])] : [];
  if (order.length <= 1 && order.includes(blockId)) return null;
  sec.block_order = order.filter((id) => id !== blockId);

  return next;
}

/** Drop value paths for a removed template block. */
export function pruneValuesForTemplateBlock(
  values: Record<string, string | boolean>,
  tplId: string,
  sectionInstanceId: string,
  blockId: string
): Record<string, string | boolean> {
  const prefix = `templates.${tplId}.sections.${sectionInstanceId}.blocks.${blockId}.`;
  const next: Record<string, string | boolean> = {};
  for (const [path, val] of Object.entries(values)) {
    if (!path.startsWith(prefix)) next[path] = val;
  }
  return next;
}

/** Drop value paths for a removed layout section instance. */
export function pruneValuesForLayoutInstance(
  values: Record<string, string | boolean>,
  instanceId: string
): Record<string, string | boolean> {
  const prefix = `sections.${instanceId}.`;
  const next: Record<string, string | boolean> = {};
  for (const [path, val] of Object.entries(values)) {
    if (!path.startsWith(prefix)) next[path] = val;
  }
  return next;
}

/** Drop value paths for a removed template section instance. */
export function pruneValuesForTemplateInstance(
  values: Record<string, string | boolean>,
  tplId: string,
  instanceId: string
): Record<string, string | boolean> {
  const prefix = `templates.${tplId}.sections.${instanceId}.`;
  const next: Record<string, string | boolean> = {};
  for (const [path, val] of Object.entries(values)) {
    if (!path.startsWith(prefix)) next[path] = val;
  }
  return next;
}
