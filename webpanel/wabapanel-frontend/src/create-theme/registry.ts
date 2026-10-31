import { announcementBarElement } from './announcement-bar';
import { headerElement } from './header';
import { dividerElement } from './divider';
import { footerElement } from './footer';
import { policiesLinksElement } from './policies-links';
import { notFoundMainElement } from './not-found-main';
import {
  GENERATED_CREATE_THEME_ELEMENTS,
  GENERATED_SECTION_TYPE_TO_ELEMENT_ID,
} from './registry.generated';
import { CREATE_THEME_CATALOG_GROUPS } from './catalog-groups';
import type {
  CreateThemeCatalogGroup,
  CreateThemeCatalogListItem,
  CreateThemeElement,
} from './types';

/** Hand-tuned elements override generated stubs. */
const HANDCRAFTED_OVERRIDES: Record<string, CreateThemeElement> = {
  'announcement-bar': announcementBarElement,
  header: headerElement,
  divider: dividerElement,
  footer: footerElement,
  'policies-links': policiesLinksElement,
  'not-found-main': notFoundMainElement,
};

export const CREATE_THEME_ELEMENTS: Record<string, CreateThemeElement> = {
  ...GENERATED_CREATE_THEME_ELEMENTS,
  ...HANDCRAFTED_OVERRIDES,
};

export const SECTION_TYPE_TO_ELEMENT_ID: Record<string, string> = {
  ...GENERATED_SECTION_TYPE_TO_ELEMENT_ID,
  'footer-utilities': 'policies-links',
};

export { CREATE_THEME_CATALOG_GROUPS };

/**
 * Industry-flavored builder labels — applied only when the store's industry
 * is tour_travel so every other workspace keeps the commerce naming.
 */
const TRAVEL_CATEGORY_LABELS: Record<string, string> = {
  products: 'Packages & tours',
  collections: 'Destinations',
  forms: 'Enquiry & signup',
};

/** Full catalog — every picker option gets a tour-and-travel voice. */
const TRAVEL_ELEMENT_LABELS: Record<string, { label: string; caption?: string }> = {
  // Banners
  hero: { label: 'Hero', caption: 'A bold destination banner with a call to action' },
  'hero-bottom-aligned': { label: 'Hero: Bottom aligned', caption: 'Destination banner with copy anchored at the bottom' },
  'hero-marquee': { label: 'Hero: Marquee', caption: 'Scrolling travel headline strip' },
  'large-logo': { label: 'Large logo' },
  'layered-slideshow': { label: 'Layered slideshow', caption: 'Layered destination slideshow' },
  'slideshow-full-frame': { label: 'Slideshow: Full frame', caption: 'Full-bleed destination photo slides' },
  'slideshow-inset': { label: 'Slideshow: Inset', caption: 'Framed photo slides for trips' },
  'split-showcase': { label: 'Split showcase', caption: 'Split media + story showcase' },
  // Destinations (collections)
  'collection-links-spotlight': { label: 'Destination links: Spotlight', caption: 'Highlight featured destinations' },
  'collection-links-text': { label: 'Destination links: Text links' },
  'collection-list-bento': { label: 'Destination list: Bento', caption: 'Bento grid of destinations' },
  'collection-list-carousel': { label: 'Destination list: Carousel', caption: 'Carousel of destinations' },
  'collection-list-editorial': { label: 'Destination list: Editorial' },
  'collection-list-grid': { label: 'Destination list: Grid', caption: 'Grid of travel destinations' },
  // Packages (products)
  'featured-collection-carousel': { label: 'Featured packages: Carousel', caption: 'Carousel of tour packages' },
  'featured-collection-editorial': { label: 'Featured packages: Editorial' },
  'featured-collection-grid': { label: 'Featured packages: Grid', caption: 'Grid of tour packages' },
  'featured-product': { label: 'Featured package', caption: 'Spotlight one tour package' },
  'product-highlight': { label: 'Package spotlight', caption: 'Feature a signature trip' },
  'product-hotspots': { label: 'Package hotspots', caption: 'Annotated package photo with hotspots' },
  'recommended-products': { label: 'Recommended packages', caption: 'Packages travellers also book' },
  // Forms
  'contact-form': { label: 'Enquiry form', caption: 'Let travellers send a booking enquiry' },
  'email-signup': { label: 'Newsletter signup', caption: 'Collect emails for offers & departures' },
  'custom-liquid': { label: 'Custom liquid' },
  'custom-section': { label: 'Custom section' },
  'not-found-main': { label: 'Page not found' },
  // Storytelling
  'blog-posts-carousel': { label: 'Travel stories: Carousel', caption: 'Carousel of travel stories' },
  'blog-posts-editorial': { label: 'Travel stories: Editorial' },
  'blog-posts-grid': { label: 'Travel stories: Grid', caption: 'Grid of travel stories' },
  'storytelling-carousel': { label: 'Story carousel' },
  logo: { label: 'Logo' },
  editorial: { label: 'Editorial', caption: 'Long-form trip editorial' },
  'editorial-jumbo': { label: 'Editorial: Jumbo text' },
  'image-compare': { label: 'Before & after', caption: 'Compare two trip images' },
  'image-with-text': { label: 'Image with text' },
  video: { label: 'Video', caption: 'Embed a trip video' },
  // Text
  faq: { label: 'FAQ', caption: 'Answers travellers ask most' },
  'icons-with-text': { label: 'Trip perks', caption: 'Icon list of what is included' },
  'text-marquee': { label: 'Marquee', caption: 'Scrolling destinations strip' },
  multicolumn: { label: 'Multi-column' },
  'pull-quote': { label: 'Traveller quote', caption: 'Pull-quote from a happy traveller' },
  'rich-text': { label: 'Rich text' },
  // Layout / chrome
  'announcement-bar': { label: 'Announcement bar', caption: 'Announce a seasonal offer or departure' },
  header: { label: 'Header' },
  divider: { label: 'Divider' },
  footer: { label: 'Footer' },
  'policies-links': { label: 'Policies links' },
};

/** Categories a travel store cares about first. */
export const TRAVEL_CATEGORY_ORDER = [
  'products',
  'collections',
  'banners',
  'forms',
  'storytelling',
  'text',
  'layout',
];

export function travelCategoryLabel(categoryId: string, industry?: string | null): string | null {
  return industry === 'tour_travel' ? TRAVEL_CATEGORY_LABELS[categoryId] ?? null : null;
}

function elementForIndustry(element: CreateThemeElement, industry?: string | null): CreateThemeElement {
  if (industry !== 'tour_travel') return element;
  const travel = TRAVEL_ELEMENT_LABELS[element.id];
  if (!travel) return element;
  return {
    ...element,
    label: travel.label,
    previewCaption: travel.caption ?? element.previewCaption,
    keywords: [...(element.keywords ?? []), 'travel', 'tour', 'trip', 'package', 'destination'],
    editing: { ...element.editing, sectionLabel: travel.label },
  };
}

/**
 * Sidebar labels for already-inserted sections are derived from section type,
 * not stored — so the same travel voice is applied after derivation.
 */
export function travelSidebarLabel(label: string, industry?: string | null): string {
  if (industry !== 'tour_travel') return label;
  return label
    .replace(/^Featured collection/, 'Featured packages')
    .replace(/^Featured product$/, 'Featured package')
    .replace(/^Product highlight/, 'Package spotlight')
    .replace(/^Product hotspots$/, 'Package hotspots')
    .replace(/^Product information$/, 'Package details')
    .replace(/^Recommended products$/, 'Recommended packages')
    .replace(/^Collection links:/, 'Destination links:')
    .replace(/^Collection list:/, 'Destination list:')
    .replace(/^Collection heading$/, 'Destination heading')
    .replace(/^Collection$/, 'Destinations')
    .replace(/^Blog posts(: .*)?$/, 'Travel stories$1')
    .replace(/^Blog posts$/, 'Travel stories')
    .replace(/^Blog$/, 'Travel journal')
    .replace(/^Contact form$/, 'Enquiry form')
    .replace(/^Email signup$/, 'Newsletter signup')
    .replace(/^Search results$/, 'Package results')
    .replace(/^Search$/, 'Search packages')
    .replace(/^Pull quote$/, 'Traveller quote')
    .replace(/^Icons with text$/, 'Trip perks')
    .replace(/^Image compare$/, 'Before & after')
    .replace(/^Text marquee$|^Marquee$/, 'Marquee');
}

/**
 * Inverse of travelSidebarLabel — used where internal lookups key off the
 * derived (commerce) label, e.g. SECTION_PANEL_BY_LABEL. Section-specific
 * settings panels keep working regardless of the display name.
 */
export function commerceLabelFromTravel(label: string): string {
  return label
    .replace(/^Featured packages/, 'Featured collection')
    .replace(/^Featured package$/, 'Featured product')
    .replace(/^Package spotlight/, 'Product highlight')
    .replace(/^Package hotspots$/, 'Product hotspots')
    .replace(/^Package details$/, 'Product information')
    .replace(/^Recommended packages$/, 'Recommended products')
    .replace(/^Destination links:/, 'Collection links:')
    .replace(/^Destination list:/, 'Collection list:')
    .replace(/^Destination heading$/, 'Collection heading')
    .replace(/^Destinations$/, 'Collection')
    .replace(/^Travel stories(: .*)?$/, 'Blog posts$1')
    .replace(/^Travel stories$/, 'Blog posts')
    .replace(/^Travel journal$/, 'Blog')
    .replace(/^Enquiry form$/, 'Contact form')
    .replace(/^Newsletter signup$/, 'Email signup')
    .replace(/^Package results$/, 'Search results')
    .replace(/^Search packages$/, 'Search')
    .replace(/^Traveller quote$/, 'Pull quote')
    .replace(/^Trip perks$/, 'Icons with text')
    .replace(/^Before & after$/, 'Image compare');
}

export function getCreateThemeElement(id: string): CreateThemeElement | undefined {
  return CREATE_THEME_ELEMENTS[id];
}

export function getElementForSectionType(sectionType: string): CreateThemeElement | undefined {
  const id = SECTION_TYPE_TO_ELEMENT_ID[sectionType];
  return id ? CREATE_THEME_ELEMENTS[id] : undefined;
}

export function listCreateThemeCatalogItems(
  group: CreateThemeCatalogGroup,
  previewPage?: string,
  industry?: string | null
): CreateThemeCatalogListItem[] {
  const groupDef = CREATE_THEME_CATALOG_GROUPS[group];
  if (!groupDef) return [];

  const out: CreateThemeCatalogListItem[] = [];

  const push = (
    elementId: string,
    categoryId: string | null,
    categoryLabel: string | null,
    standalone: boolean
  ) => {
    const rawElement = getCreateThemeElement(elementId);
    if (!rawElement) {
      console.warn(`[create-theme] missing element folder: ${elementId}`);
      return;
    }
    if (rawElement.allowedPreviewPages?.length) {
      if (!previewPage || !rawElement.allowedPreviewPages.includes(previewPage)) {
        return;
      }
    }
    const element = elementForIndustry(rawElement, industry);
    const label = categoryId ? travelCategoryLabel(categoryId, industry) ?? categoryLabel : categoryLabel;
    out.push({ element, categoryId, categoryLabel: label, standalone });
  };

  for (const elementId of groupDef.standalone ?? []) {
    push(elementId, null, null, true);
  }

  for (const categoryId of groupDef.categoryOrder) {
    const category = groupDef.categories[categoryId];
    if (!category) continue;
    for (const elementId of category.itemIds) {
      push(elementId, categoryId, category.label, false);
    }
  }

  return out;
}

export function filterCreateThemeCatalogItems(
  items: CreateThemeCatalogListItem[],
  query: string
): CreateThemeCatalogListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(({ element }) => {
    const hay = [element.label, element.previewCaption ?? '', ...(element.keywords ?? [])]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

export function createThemeGroupLabel(group: CreateThemeCatalogGroup): string {
  if (group === 'header') return 'Header';
  if (group === 'footer') return 'Footer';
  return 'Template';
}
