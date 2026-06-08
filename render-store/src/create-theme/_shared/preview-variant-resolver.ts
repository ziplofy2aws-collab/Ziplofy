import type { SectionPreviewVariant } from './SectionPreviewVisual';

/** Mirrors `add-section-catalog.ts` previewVariant rules for create-theme. */
export function resolveCreateThemePreviewVariant(
  elementId: string,
  icon?: string
): SectionPreviewVariant {
  if (elementId === 'announcement-bar') return 'announcement-bar';
  if (elementId === 'divider') return 'divider';
  if (elementId === 'footer') return 'footer-section';
  if (elementId === 'policies-links') return 'policies-links';
  if (elementId === 'custom-liquid') return 'text-block';
  if (elementId === 'custom-section') return 'custom-section';
  if (elementId === 'contact-form') return 'contact-form';
  if (elementId === 'email-signup') return 'newsletter';

  if (elementId === 'layered-slideshow') return 'layered-slideshow';
  if (elementId === 'slideshow-full-frame') return 'slideshow-full-frame';
  if (elementId === 'slideshow-inset') return 'slideshow-inset';
  if (elementId === 'split-showcase') return 'split-showcase';
  if (icon === 'slideshow') return 'before-after';
  if (elementId === 'hero-bottom-aligned') return 'hero-bottom-aligned';
  if (elementId === 'hero-marquee') return 'hero-marquee';
  if (elementId === 'large-logo') return 'large-logo';
  if (elementId === 'hero') return 'hero';

  if (elementId === 'collection-links-spotlight') return 'collection-links-spotlight';
  if (elementId === 'collection-links-text') return 'collection-links-text';
  if (elementId === 'collection-list-bento') return 'collection-list-bento';
  if (elementId === 'collection-list-carousel') return 'collection-list-carousel';
  if (elementId === 'collection-list-editorial') return 'collection-list-editorial';
  if (elementId === 'collection-list-grid') return 'collection-list-grid';

  if (elementId === 'featured-collection-carousel') return 'featured-collection-carousel';
  if (elementId === 'featured-collection-editorial') return 'featured-collection-editorial';
  if (elementId === 'featured-collection-grid') return 'featured-collection-grid';
  if (elementId === 'featured-product') return 'featured-product';
  if (elementId === 'product-highlight') return 'product-highlight';
  if (elementId === 'product-hotspots') return 'product-hotspots';
  if (elementId === 'recommended-products') return 'recommended-products';

  if (elementId === 'blog-posts-carousel') return 'blog-posts-carousel';
  if (elementId === 'blog-posts-editorial') return 'blog-posts-editorial';
  if (elementId === 'blog-posts-grid') return 'blog-posts-grid';
  if (elementId === 'storytelling-carousel') return 'storytelling-carousel';
  if (elementId === 'editorial') return 'storytelling-editorial';
  if (elementId === 'editorial-jumbo') return 'storytelling-editorial-jumbo';
  if (elementId === 'image-compare') return 'image-compare';
  if (elementId === 'image-with-text') return 'image-with-text';
  if (elementId === 'logo') return 'storytelling-logo';
  if (elementId === 'video') return 'storytelling-video';

  if (elementId === 'faq') return 'faq';
  if (elementId === 'icons-with-text') return 'icons-with-text';
  if (elementId === 'text-marquee') return 'text-marquee';
  if (elementId === 'multicolumn') return 'multicolumn';
  if (elementId === 'pull-quote') return 'pull-quote';
  if (elementId === 'rich-text') return 'rich-text';

  return 'text-block';
}
