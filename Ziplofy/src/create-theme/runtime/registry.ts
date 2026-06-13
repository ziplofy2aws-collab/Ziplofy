import type { SectionRuntimeComponent } from './types';
import { AnnouncementBar } from '../announcement-bar/runtime/AnnouncementBar';
import { Divider } from '../divider/runtime/Divider';
import { Footer } from '../footer/runtime/Footer';
import { Header } from '../header/runtime/Header';
import { Hero } from '../hero/runtime/Hero';
import { CollectionLinksSpotlight } from '../collection-links-spotlight/runtime/CollectionLinksSpotlight';
import { Faq } from '../faq/runtime/Faq';
import { IconsWithText } from '../icons-with-text/runtime/IconsWithText';
import { TextMarquee } from '../text-marquee/runtime/TextMarquee';
import { Multicolumn } from '../multicolumn/runtime/Multicolumn';
import { PullQuote } from '../pull-quote/runtime/PullQuote';
import { RichText } from '../rich-text/runtime/RichText';
import { StorytellingVideo } from '../video/runtime/StorytellingVideo';
import { ImageWithText } from '../image-with-text/runtime/ImageWithText';
import { ImageCompare } from '../image-compare/runtime/ImageCompare';
import { EditorialJumbo } from '../editorial-jumbo/runtime/EditorialJumbo';
import { Editorial } from '../editorial/runtime/Editorial';
import { StorytellingCarousel } from '../storytelling-carousel/runtime/StorytellingCarousel';
import { BlogPostsGrid } from '../blog-posts-grid/runtime/BlogPostsGrid';
import { BlogPostsEditorial } from '../blog-posts-editorial/runtime/BlogPostsEditorial';
import { BlogPostsCarousel } from '../blog-posts-carousel/runtime/BlogPostsCarousel';
import { ContactForm } from '../contact-form/runtime/ContactForm';
import { EmailSignup } from '../email-signup/runtime/EmailSignup';
import { ProductMain } from '../product-main/runtime/ProductMain';
import { ProductHighlight } from '../product-highlight/runtime/ProductHighlight';
import { CollectionListBento } from '../collection-list-bento/runtime/CollectionListBento';
/** Live UI components keyed by schema `section.type`. */
export const SECTION_RUNTIME_BY_TYPE: Record<string, SectionRuntimeComponent> = {
  header: Header,
  'announcement-bar': AnnouncementBar,
  hero: Hero,
  footer: Footer,
  divider: Divider,
  'collection-links-spotlight': CollectionLinksSpotlight,
  'collection-list-bento': CollectionListBento,
  'collection-list-grid': CollectionListBento,
  'collection-list-carousel': CollectionListBento,
  'collection-list-editorial': CollectionListBento,
  'product-highlight': ProductHighlight,
  'product-main': ProductMain,
  faq: Faq,
  'icons-with-text': IconsWithText,
  'text-marquee': TextMarquee,
  multicolumn: Multicolumn,
  'pull-quote': PullQuote,
  'rich-text': RichText,
  'storytelling-video': StorytellingVideo,
  'image-with-text': ImageWithText,
  'image-compare': ImageCompare,
  'editorial-jumbo': EditorialJumbo,
  editorial: Editorial,
  'storytelling-carousel': StorytellingCarousel,
  'blog-posts-grid': BlogPostsGrid,
  'blog-posts-editorial': BlogPostsEditorial,
  'blog-posts-carousel': BlogPostsCarousel,
  'contact-form': ContactForm,
  'email-signup': EmailSignup,
};

export function resolveRuntimeForSectionType(sectionType: string): SectionRuntimeComponent | null {
  return SECTION_RUNTIME_BY_TYPE[sectionType] ?? null;
}

export function blueprintIdFromInstanceId(instanceId: string): string {
  const known = [
    'announcement_bar',
    'header',
    'footer',
    'footer_utilities',
    'divider',
    'hero_main',
    'featured_collection',
    'collection_links_spotlight',
    'collection_links_text',
    'collection_list_bento',
    'product_highlight',
    'product_main',
    'storytelling_video',
    'image_with_text',
    'image_compare',
    'editorial_jumbo',
    'editorial',
    'storytelling_carousel',
    'blog_posts_grid',
    'blog_posts_editorial',
    'blog_posts_carousel',
    'contact_form',
    'email_signup',
  ];
  for (const base of known) {
    if (instanceId === base || instanceId.startsWith(`${base}_`)) return base;
  }
  const idx = instanceId.indexOf('_');
  return idx > 0 ? instanceId.slice(0, idx) : instanceId;
}
