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
  ];
  for (const base of known) {
    if (instanceId === base || instanceId.startsWith(`${base}_`)) return base;
  }
  const idx = instanceId.indexOf('_');
  return idx > 0 ? instanceId.slice(0, idx) : instanceId;
}
