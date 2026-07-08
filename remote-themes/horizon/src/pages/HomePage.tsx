import type { ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { isTemplateSectionEnabled } from '../lib/sectionEnabled';
import { templateSectionOrder } from '../lib/structureOrder';
import { PageShell } from '../shell/PageShell';
import { ContactFormSection } from '../sections/ContactFormSection';
import { EmailSignupSection } from '../sections/EmailSignupSection';
import { CustomSectionSection } from '../sections/CustomSectionSection';
import { ProductHighlightSection } from '../sections/ProductHighlightSection';
import { EditorialSection } from '../sections/EditorialSection';
import { EditorialJumboSection } from '../sections/EditorialJumboSection';
import { ImageCompareSection } from '../sections/ImageCompareSection';
import { ImageWithTextSection } from '../sections/ImageWithTextSection';
import { StorytellingLogoSection } from '../sections/StorytellingLogoSection';
import { StorytellingVideoSection } from '../sections/StorytellingVideoSection';
import { FaqSection } from '../sections/FaqSection';
import { IconsWithTextSection } from '../sections/IconsWithTextSection';
import { MulticolumnSection } from '../sections/MulticolumnSection';
import { PullQuoteSection } from '../sections/PullQuoteSection';
import { RichTextSection } from '../sections/RichTextSection';
import { TextMarqueeSection } from '../sections/TextMarqueeSection';
import { BlogPostsCarouselSection } from '../sections/BlogPostsCarouselSection';
import { BlogPostsEditorialSection } from '../sections/BlogPostsEditorialSection';
import { BlogPostsGridSection } from '../sections/BlogPostsGridSection';
import { StorytellingCarouselSection } from '../sections/StorytellingCarouselSection';
import { ProductHotspotsSection } from '../sections/ProductHotspotsSection';
import { RecommendedProductsSection } from '../sections/RecommendedProductsSection';
import { CollectionLinksSpotlightSection } from '../sections/CollectionLinksSpotlightSection';
import { CollectionListBentoSection } from '../sections/CollectionListBentoSection';
import { CollectionListCarouselSection } from '../sections/CollectionListCarouselSection';
import { CollectionListEditorialSection } from '../sections/CollectionListEditorialSection';
import { CollectionListGridSection } from '../sections/CollectionListGridSection';
import { LayeredSlideshowSection } from '../sections/LayeredSlideshowSection';
import { SlideshowFullFrameSection } from '../sections/SlideshowFullFrameSection';
import { SlideshowInsetSection } from '../sections/SlideshowInsetSection';
import { DividerSection } from '../sections/DividerSection';
import { FeaturedCollectionSection } from '../sections/FeaturedCollectionSection';
import { HeroSection } from '../sections/HeroSection';
import { AllCollectionsSection } from '../sections/AllCollectionsSection';
import { CollectionHeadingSection } from '../sections/CollectionHeadingSection';
import { MainCollectionSection } from '../sections/MainCollectionSection';

const INDEX_SECTION_COMPONENTS: Record<string, ComponentType<{ sectionId?: string; templateId?: string }>> = {
  hero_main: HeroSection,
  featured_collection: FeaturedCollectionSection,
  divider: DividerSection,
  contact_form: ContactFormSection,
  email_signup: EmailSignupSection,
  custom_section: CustomSectionSection,
  product_highlight: ProductHighlightSection,
  editorial: EditorialSection,
  editorial_jumbo: EditorialJumboSection,
  image_compare: ImageCompareSection,
  image_with_text: ImageWithTextSection,
  storytelling_logo: StorytellingLogoSection,
  storytelling_video: StorytellingVideoSection,
  faq_section: FaqSection,
  icons_with_text: IconsWithTextSection,
  multicolumn_section: MulticolumnSection,
  pull_quote_section: PullQuoteSection,
  rich_text_section: RichTextSection,
  text_marquee_section: TextMarqueeSection,
  blog_posts_carousel: BlogPostsCarouselSection,
  blog_posts_editorial: BlogPostsEditorialSection,
  blog_posts_grid: BlogPostsGridSection,
  storytelling_carousel: StorytellingCarouselSection,
  product_hotspots: ProductHotspotsSection,
  recommended_products: RecommendedProductsSection,
  collection_links_spotlight: CollectionLinksSpotlightSection,
  collection_links_text: CollectionLinksSpotlightSection,
  collection_list_bento: CollectionListBentoSection,
  collection_list_carousel: CollectionListCarouselSection,
  collection_list_editorial: CollectionListEditorialSection,
  collection_list_grid: CollectionListGridSection,
  layered_slideshow: LayeredSlideshowSection,
  slideshow_full_frame: SlideshowFullFrameSection,
  slideshow_inset: SlideshowInsetSection,
};

const COLLECTION_SECTION_COMPONENTS: Record<string, ComponentType<{ sectionId?: string; templateId?: string }>> = {
  collection_heading: CollectionHeadingSection,
  main_collection: MainCollectionSection,
};

const INDEX_SECTION_FALLBACK = ['hero_main', 'featured_collection'];
const COLLECTION_SECTION_FALLBACK = ['collection_heading', 'main_collection'];

function resolveBlueprint(sectionId: string, templateId: string): string | null {
  if (templateId === 'collection') {
    if (sectionId.startsWith('collection_heading')) return 'collection_heading';
    if (sectionId.startsWith('main_collection')) return 'main_collection';
    return COLLECTION_SECTION_COMPONENTS[sectionId] ? sectionId : null;
  }

  if (sectionId.startsWith('divider')) return 'divider';
  if (sectionId.startsWith('contact_form')) return 'contact_form';
  if (sectionId.startsWith('email_signup')) return 'email_signup';
  if (sectionId.startsWith('custom_section')) return 'custom_section';
  if (sectionId.startsWith('product_highlight')) return 'product_highlight';
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
  if (sectionId.startsWith('storytelling_logo')) return 'storytelling_logo';
  if (sectionId.startsWith('image_with_text')) return 'image_with_text';
  if (sectionId.startsWith('image_compare')) return 'image_compare';
  if (sectionId.startsWith('editorial_jumbo')) return 'editorial_jumbo';
  if (sectionId.startsWith('editorial')) return 'editorial';
  if (sectionId.startsWith('featured_collection')) return 'featured_collection';
  if (sectionId.startsWith('hero_main')) return 'hero_main';
  return INDEX_SECTION_COMPONENTS[sectionId] ? sectionId : null;
}

function TemplatePage({ templateId }: { templateId: string }) {
  const config = useThemeConfig();
  const fallback =
    templateId === 'collection' ? COLLECTION_SECTION_FALLBACK : INDEX_SECTION_FALLBACK;
  const registry =
    templateId === 'collection' ? COLLECTION_SECTION_COMPONENTS : INDEX_SECTION_COMPONENTS;
  const order = templateSectionOrder(config, templateId, fallback);

  return (
    <>
      {order.map((sectionId) => {
        if (!isTemplateSectionEnabled(config, templateId, sectionId)) return null;
        const blueprint = resolveBlueprint(sectionId, templateId);
        if (!blueprint) return null;
        const Section = registry[blueprint];
        if (!Section) return null;
        return <Section key={sectionId} sectionId={sectionId} templateId={templateId} />;
      })}
    </>
  );
}

export function HomePage() {
  const { pathname } = useLocation();

  if (pathname === '/collections') {
    return (
      <PageShell>
        <AllCollectionsSection />
      </PageShell>
    );
  }

  const templateId =
    pathname === '/collections/all' ||
    pathname.startsWith('/collection/') ||
    (pathname.startsWith('/collections/') && pathname !== '/collections')
      ? 'collection'
      : 'index';

  return (
    <PageShell>
      <TemplatePage templateId={templateId} />
    </PageShell>
  );
}
