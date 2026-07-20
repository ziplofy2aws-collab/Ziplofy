import type { SidebarIcon } from './theme-editor-sidebar.types';

export type BlockCatalogCategory =
  | 'basic'
  | 'collection'
  | 'custom'
  | 'decorative'
  | 'footer'
  | 'forms'
  | 'layout'
  | 'links'
  | 'product';

export type BlockCatalogIcon =
  | SidebarIcon
  | 'logo'
  | 'jumbo'
  | 'marquee'
  | 'group'
  | 'spacer'
  | 'link'
  | 'placeholder'
  | 'title'
  | 'variant-picker';

export type BlockCatalogItem = {
  id: string;
  label: string;
  category: BlockCatalogCategory;
  icon: BlockCatalogIcon;
  keywords?: string[];
  /** Only listed after user clicks "Show all". */
  extendedOnly?: boolean;
};

export type BlockPreviewSlide = {
  id: string;
  headline: string;
  headlineAccent: string;
  caption: string;
  variant:
    | 'before-after'
    | 'product-card'
    | 'featured-collection-carousel'
    | 'featured-collection-editorial'
    | 'featured-collection-grid'
    | 'featured-product'
    | 'product-highlight'
    | 'product-hotspots'
    | 'recommended-products'
    | 'blog-posts-carousel'
    | 'blog-posts-editorial'
    | 'blog-posts-grid'
    | 'storytelling-carousel'
    | 'storytelling-editorial'
    | 'storytelling-editorial-jumbo'
    | 'image-compare'
    | 'image-with-text'
    | 'storytelling-video'
    | 'storytelling-logo'
    | 'faq'
    | 'icons-with-text'
    | 'icon-only'
    | 'heading-only'
    | 'image-only'
    | 'logo-only'
    | 'button-only'
    | 'page-only'
    | 'text-only'
    | 'video-only'
    | 'collection-card-only'
    | 'collection-title-only'
    | 'comparison-slider-only'
    | 'jumbo-text-only'
    | 'copyright-only'
    | 'policy-links-only'
    | 'accordion-only'
    | 'menu-only'
    | 'buy-buttons-only'
    | 'price-only'
    | 'inventory-only'
    | 'recommended-only'
    | 'review-stars-only'
    | 'special-instructions-only'
    | 'title-only'
    | 'text-marquee'
    | 'multicolumn'
    | 'pull-quote'
    | 'rich-text'
    | 'footer-section'
    | 'policies-links'
    | 'text-block'
    | 'newsletter'
    | 'contact-form'
    | 'custom-section'
    | 'announcement-bar'
    | 'divider'
    | 'hero'
    | 'hero-bottom-aligned'
    | 'hero-marquee'
    | 'large-logo'
    | 'layered-slideshow'
    | 'slideshow-full-frame'
    | 'slideshow-inset'
    | 'split-showcase'
    | 'collection-links-spotlight'
    | 'collection-links-text'
    | 'collection-list-bento'
    | 'collection-list-carousel'
    | 'collection-list-editorial'
    | 'collection-list-grid';
};

export type CatalogSection =
  | { type: 'category'; id: BlockCatalogCategory; label: string }
  | { type: 'standalone'; item: BlockCatalogItem };

export const BLOCK_CATALOG_CATEGORIES_COMPACT: { id: BlockCatalogCategory; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'decorative', label: 'Decorative' },
  { id: 'layout', label: 'Layout' },
];

export const BLOCK_CATALOG_CATEGORIES_EXTENDED: { id: BlockCatalogCategory; label: string }[] = [
  { id: 'collection', label: 'Collection' },
  { id: 'footer', label: 'Footer' },
  { id: 'forms', label: 'Forms' },
  { id: 'links', label: 'Links' },
  { id: 'product', label: 'Product' },
];

/** Shopify add-block picker category order (hero and custom section). */
export const BLOCK_CATALOG_CATEGORIES_SHOPIFY: { id: BlockCatalogCategory; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'collection', label: 'Collection' },
  { id: 'decorative', label: 'Decorative' },
  { id: 'footer', label: 'Footer' },
  { id: 'forms', label: 'Forms' },
  { id: 'layout', label: 'Layout' },
  { id: 'links', label: 'Links' },
  { id: 'product', label: 'Product' },
];

export const GENERATE_BLOCK_ITEM: BlockCatalogItem = {
  id: 'generate',
  label: 'Generate',
  category: 'basic',
  icon: 'placeholder',
  keywords: ['ai', 'magic', 'create'],
};

export const BLOCK_CATALOG: BlockCatalogItem[] = [
  { id: 'button', label: 'Button', category: 'basic', icon: 'button', keywords: ['cta', 'link'] },
  { id: 'heading', label: 'Heading', category: 'basic', icon: 'text', keywords: ['title', 'h1'] },
  { id: 'icon', label: 'Icon', category: 'basic', icon: 'placeholder', keywords: ['symbol'] },
  { id: 'image', label: 'Image', category: 'basic', icon: 'image', keywords: ['photo', 'media'] },
  { id: 'logo', label: 'Logo', category: 'basic', icon: 'logo', keywords: ['brand', 'image'] },
  { id: 'page', label: 'Page', category: 'basic', icon: 'placeholder', keywords: ['content'] },
  { id: 'text', label: 'Text', category: 'basic', icon: 'text', keywords: ['paragraph', 'body'] },
  { id: 'video', label: 'Video', category: 'basic', icon: 'placeholder', keywords: ['media', 'youtube'] },
  {
    id: 'collection-card',
    label: 'Collection card',
    category: 'collection',
    icon: 'product-card',
    keywords: ['collection', 'card'],
  },
  {
    id: 'collection-title',
    label: 'Collection title',
    category: 'collection',
    icon: 'title',
    keywords: ['collection', 'heading'],
  },
  {
    id: 'image-compare',
    label: 'Comparison slider',
    category: 'decorative',
    icon: 'placeholder',
    keywords: ['before', 'after', 'compare'],
  },
  {
    id: 'jumbo-text',
    label: 'Jumbo text',
    category: 'decorative',
    icon: 'jumbo',
    keywords: ['large', 'display'],
  },
  { id: 'marquee', label: 'Marquee', category: 'decorative', icon: 'marquee', keywords: ['scroll', 'ticker'] },
  {
    id: 'copyright',
    label: 'Copyright',
    category: 'footer',
    icon: 'placeholder',
    keywords: ['footer', 'legal'],
  },
  {
    id: 'follow-on-shop',
    label: 'Follow on Shop',
    category: 'footer',
    icon: 'placeholder',
    keywords: ['shop', 'social'],
  },
  {
    id: 'payment-icons',
    label: 'Payment icons',
    category: 'footer',
    icon: 'price',
    keywords: ['payment', 'cards'],
  },
  {
    id: 'policy-links',
    label: 'Policy links',
    category: 'footer',
    icon: 'link',
    keywords: ['privacy', 'terms'],
  },
  {
    id: 'social',
    label: 'Social media links',
    category: 'footer',
    icon: 'link',
    keywords: ['social', 'instagram'],
  },
  {
    id: 'contact-form',
    label: 'Contact form',
    category: 'forms',
    icon: 'form',
    keywords: ['email', 'message'],
  },
  {
    id: 'email-signup',
    label: 'Email signup',
    category: 'forms',
    icon: 'form',
    keywords: ['newsletter', 'subscribe'],
  },
  {
    id: 'accordion',
    label: 'Accordion',
    category: 'layout',
    icon: 'group',
    keywords: ['collapse', 'faq'],
  },
  { id: 'group', label: 'Group', category: 'layout', icon: 'group', keywords: ['container', 'wrapper'] },
  { id: 'spacer', label: 'Spacer', category: 'layout', icon: 'spacer', keywords: ['gap', 'space'] },
  { id: 'menu', label: 'Menu', category: 'links', icon: 'link', keywords: ['navigation'], extendedOnly: true },
  {
    id: 'popup-link',
    label: 'Popup link',
    category: 'links',
    icon: 'link',
    keywords: ['modal', 'dialog'],
    extendedOnly: true,
  },
  {
    id: 'buy-buttons',
    label: 'Buy buttons',
    category: 'product',
    icon: 'button',
    keywords: ['add to cart', 'checkout'],
    extendedOnly: true,
  },
  {
    id: 'description',
    label: 'Description',
    category: 'product',
    icon: 'text',
    keywords: ['body', 'details'],
    extendedOnly: true,
  },
  {
    id: 'price',
    label: 'Price',
    category: 'product',
    icon: 'price',
    keywords: ['money', 'cost'],
    extendedOnly: true,
  },
  {
    id: 'product-card',
    label: 'Product card',
    category: 'product',
    icon: 'product-card',
    keywords: ['card', 'tile'],
    extendedOnly: true,
  },
  {
    id: 'product-inventory',
    label: 'Product inventory',
    category: 'product',
    icon: 'placeholder',
    keywords: ['stock'],
    extendedOnly: true,
  },
  {
    id: 'recommended-products',
    label: 'Recommended products',
    category: 'product',
    icon: 'placeholder',
    keywords: ['related', 'upsell'],
    extendedOnly: true,
  },
  {
    id: 'review-stars',
    label: 'Review stars',
    category: 'product',
    icon: 'placeholder',
    keywords: ['rating', 'reviews'],
    extendedOnly: true,
  },
  {
    id: 'sku',
    label: 'SKU',
    category: 'product',
    icon: 'placeholder',
    keywords: ['stock keeping unit'],
    extendedOnly: true,
  },
  {
    id: 'special-instructions',
    label: 'Special instructions',
    category: 'product',
    icon: 'placeholder',
    keywords: ['note', 'gift message'],
    extendedOnly: true,
  },
  {
    id: 'swatches',
    label: 'Swatches',
    category: 'product',
    icon: 'placeholder',
    keywords: ['color', 'variant'],
    extendedOnly: true,
  },
  {
    id: 'title',
    label: 'Title',
    category: 'product',
    icon: 'title',
    keywords: ['product name', 'heading'],
    extendedOnly: true,
  },
  {
    id: 'variant-picker',
    label: 'Variant picker',
    category: 'product',
    icon: 'variant-picker',
    keywords: ['options', 'size'],
    extendedOnly: true,
  },
];

export const BLOCK_PREVIEW_SLIDES: BlockPreviewSlide[] = [
  {
    id: 'before-after',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'A before/after image slider',
    variant: 'before-after',
  },
  {
    id: 'product-card',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'A holographic product card',
    variant: 'product-card',
  },
  {
    id: 'text-block',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Rich text and headings for any section',
    variant: 'text-block',
  },
  {
    id: 'newsletter',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Collect emails with a signup form',
    variant: 'newsletter',
  },
  {
    id: 'contact-form',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Let customers send you a message',
    variant: 'contact-form',
  },
  {
    id: 'custom-section',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Build a section with blocks and settings',
    variant: 'custom-section',
  },
  {
    id: 'featured-collection-carousel',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Featured collection: Carousel',
    variant: 'featured-collection-carousel',
  },
  {
    id: 'featured-collection-editorial',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Featured collection: Editorial',
    variant: 'featured-collection-editorial',
  },
  {
    id: 'featured-collection-grid',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Featured collection: Grid',
    variant: 'featured-collection-grid',
  },
  {
    id: 'featured-product',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Featured product',
    variant: 'featured-product',
  },
  {
    id: 'product-highlight',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Product highlight',
    variant: 'product-highlight',
  },
  {
    id: 'product-hotspots',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Product hotspots',
    variant: 'product-hotspots',
  },
  {
    id: 'recommended-products',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Recommended products',
    variant: 'recommended-products',
  },
  {
    id: 'blog-posts-carousel',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Blog posts: Carousel',
    variant: 'blog-posts-carousel',
  },
  {
    id: 'blog-posts-editorial',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Blog posts: Editorial',
    variant: 'blog-posts-editorial',
  },
  {
    id: 'blog-posts-grid',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Blog posts: Grid',
    variant: 'blog-posts-grid',
  },
  {
    id: 'storytelling-carousel',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Carousel',
    variant: 'storytelling-carousel',
  },
  {
    id: 'storytelling-editorial',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Editorial',
    variant: 'storytelling-editorial',
  },
  {
    id: 'storytelling-editorial-jumbo',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Editorial: Jumbo text',
    variant: 'storytelling-editorial-jumbo',
  },
  {
    id: 'image-compare',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Image compare',
    variant: 'image-compare',
  },
  {
    id: 'image-with-text',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Image with text',
    variant: 'image-with-text',
  },
  {
    id: 'storytelling-video',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Video',
    variant: 'storytelling-video',
  },
  {
    id: 'storytelling-logo',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Logo',
    variant: 'storytelling-logo',
  },
  {
    id: 'faq',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'FAQ',
    variant: 'faq',
  },
  {
    id: 'icons-with-text',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Icons with text',
    variant: 'icons-with-text',
  },
  {
    id: 'text-marquee',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Marquee',
    variant: 'text-marquee',
  },
  {
    id: 'multicolumn',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Multicolumn',
    variant: 'multicolumn',
  },
  {
    id: 'pull-quote',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Pull quote',
    variant: 'pull-quote',
  },
  {
    id: 'rich-text',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Rich text',
    variant: 'rich-text',
  },
  {
    id: 'footer-section',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Join our email list, email signup, and store links',
    variant: 'footer-section',
  },
  {
    id: 'policies-links',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Policies and links',
    variant: 'policies-links',
  },
  {
    id: 'announcement-bar',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Share promotions and store news at the top of every page',
    variant: 'announcement-bar',
  },
  {
    id: 'divider',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'A horizontal line to separate content',
    variant: 'divider',
  },
  {
    id: 'hero',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Large heading area with buttons and imagery',
    variant: 'hero',
  },
  {
    id: 'hero-bottom-aligned',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Hero: Bottom aligned',
    variant: 'hero-bottom-aligned',
  },
  {
    id: 'hero-marquee',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Hero: Marquee',
    variant: 'hero-marquee',
  },
  {
    id: 'large-logo',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Large logo',
    variant: 'large-logo',
  },
  {
    id: 'layered-slideshow',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Layered slideshow',
    variant: 'layered-slideshow',
  },
  {
    id: 'slideshow-full-frame',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Slideshow: Full frame',
    variant: 'slideshow-full-frame',
  },
  {
    id: 'slideshow-inset',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Slideshow: Inset',
    variant: 'slideshow-inset',
  },
  {
    id: 'split-showcase',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Split showcase',
    variant: 'split-showcase',
  },
  {
    id: 'collection-links-spotlight',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Collection links: Spotlight',
    variant: 'collection-links-spotlight',
  },
  {
    id: 'collection-links-text',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Collection links: Text',
    variant: 'collection-links-text',
  },
  {
    id: 'collection-list-bento',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Collection list: Bento',
    variant: 'collection-list-bento',
  },
  {
    id: 'collection-list-carousel',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Collection list: Carousel',
    variant: 'collection-list-carousel',
  },
  {
    id: 'collection-list-editorial',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Collection list: Editorial',
    variant: 'collection-list-editorial',
  },
  {
    id: 'collection-list-grid',
    headline: 'Have an idea?',
    headlineAccent: "Let's bring it to life",
    caption: 'Collection list: Grid',
    variant: 'collection-list-grid',
  },
];

const SPACER_ITEM = BLOCK_CATALOG.find((b) => b.id === 'spacer')!;

export function getCatalogSections(
  showAll: boolean,
  searchQuery: string,
  options?: { shopifyFull?: boolean }
): CatalogSection[] {
  const q = searchQuery.trim().toLowerCase();
  const searching = q.length > 0;
  const shopifyFull = options?.shopifyFull ?? false;
  const categoryOrder = shopifyFull
    ? BLOCK_CATALOG_CATEGORIES_SHOPIFY
    : [...BLOCK_CATALOG_CATEGORIES_COMPACT, ...BLOCK_CATALOG_CATEGORIES_EXTENDED];

  if (searching) {
    const matched = filterBlockCatalog(searchQuery, true);
    const categories = new Set(matched.map((b) => b.category));
    const sections: CatalogSection[] = [];
    for (const cat of categoryOrder) {
      if (categories.has(cat.id)) sections.push({ type: 'category', id: cat.id, label: cat.label });
    }
    return sections;
  }

  const sections: CatalogSection[] = [];

  const visibleCategories = shopifyFull
    ? categoryOrder
    : showAll
      ? categoryOrder
      : BLOCK_CATALOG_CATEGORIES_COMPACT;

  for (const cat of visibleCategories) {
    sections.push({ type: 'category', id: cat.id, label: cat.label });
  }

  if (!shopifyFull && showAll) {
    sections.push({ type: 'standalone', item: SPACER_ITEM });
  }

  return sections;
}

export function filterBlockCatalog(
  query: string,
  showAll: boolean,
  options?: { includeGenerate?: boolean }
): BlockCatalogItem[] {
  const q = query.trim().toLowerCase();
  let pool = BLOCK_CATALOG;
  if (!showAll && !q) {
    pool = BLOCK_CATALOG.filter((b) => !b.extendedOnly);
  }
  if (options?.includeGenerate && !q) {
    pool = [GENERATE_BLOCK_ITEM, ...pool];
  }
  if (!q) return pool;
  return pool.filter(
    (b) =>
      b.label.toLowerCase().includes(q) ||
      b.category.includes(q) ||
      b.keywords?.some((k) => k.includes(q))
  );
}

export function blocksForSection(
  section: CatalogSection,
  items: BlockCatalogItem[]
): BlockCatalogItem[] {
  if (section.type === 'standalone') {
    return items.some((b) => b.id === section.item.id) ? [section.item] : [];
  }
  return items.filter((b) => b.category === section.id);
}

export function blocksByCategory(
  items: BlockCatalogItem[]
): Record<BlockCatalogCategory, BlockCatalogItem[]> {
  const out: Record<BlockCatalogCategory, BlockCatalogItem[]> = {
    basic: [],
    collection: [],
    custom: [],
    decorative: [],
    footer: [],
    forms: [],
    layout: [],
    links: [],
    product: [],
  };
  for (const item of items) out[item.category].push(item);
  return out;
}

/** @deprecated Use getCatalogSections — kept for compatibility */
export const BLOCK_CATALOG_CATEGORIES = BLOCK_CATALOG_CATEGORIES_COMPACT;
