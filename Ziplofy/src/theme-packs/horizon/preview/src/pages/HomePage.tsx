import type { ComponentType } from 'react';
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

const INDEX_SECTION_FALLBACK = ['hero_main', 'featured_collection'];

export function HomePage() {
  const config = useThemeConfig();
  const order = templateSectionOrder(config, 'index', INDEX_SECTION_FALLBACK);

  return (
    <PageShell>
      {order.map((sectionId) => {
        if (!isTemplateSectionEnabled(config, 'index', sectionId)) return null;
        let blueprint = sectionId;
        if (sectionId.startsWith('divider')) blueprint = 'divider';
        else if (sectionId.startsWith('contact_form')) blueprint = 'contact_form';
        else if (sectionId.startsWith('email_signup')) blueprint = 'email_signup';
        else if (sectionId.startsWith('custom_section')) blueprint = 'custom_section';
        else if (sectionId.startsWith('product_highlight')) blueprint = 'product_highlight';
        else if (sectionId.startsWith('storytelling_video')) blueprint = 'storytelling_video';
        else if (sectionId.startsWith('faq_section')) blueprint = 'faq_section';
        else if (sectionId.startsWith('icons_with_text')) blueprint = 'icons_with_text';
        else if (sectionId.startsWith('multicolumn_section')) blueprint = 'multicolumn_section';
        else if (sectionId.startsWith('pull_quote_section')) blueprint = 'pull_quote_section';
        else if (sectionId.startsWith('rich_text_section')) blueprint = 'rich_text_section';
        else if (sectionId.startsWith('text_marquee_section')) blueprint = 'text_marquee_section';
        else if (sectionId.startsWith('blog_posts_carousel')) blueprint = 'blog_posts_carousel';
        else if (sectionId.startsWith('blog_posts_editorial')) blueprint = 'blog_posts_editorial';
        else if (sectionId.startsWith('blog_posts_grid')) blueprint = 'blog_posts_grid';
        else if (sectionId.startsWith('storytelling_carousel')) blueprint = 'storytelling_carousel';
        else if (sectionId.startsWith('product_hotspots')) blueprint = 'product_hotspots';
        else if (sectionId.startsWith('recommended_products')) blueprint = 'recommended_products';
        else if (sectionId.startsWith('collection_links_spotlight')) blueprint = 'collection_links_spotlight';
        else if (sectionId.startsWith('collection_links_text')) blueprint = 'collection_links_text';
        else if (sectionId.startsWith('collection_list_bento')) blueprint = 'collection_list_bento';
        else if (sectionId.startsWith('collection_list_carousel')) blueprint = 'collection_list_carousel';
        else if (sectionId.startsWith('collection_list_editorial')) blueprint = 'collection_list_editorial';
        else if (sectionId.startsWith('collection_list_grid')) blueprint = 'collection_list_grid';
        else if (sectionId.startsWith('layered_slideshow')) blueprint = 'layered_slideshow';
        else if (sectionId.startsWith('slideshow_full_frame')) blueprint = 'slideshow_full_frame';
        else if (sectionId.startsWith('slideshow_inset')) blueprint = 'slideshow_inset';
        else if (sectionId.startsWith('storytelling_logo')) blueprint = 'storytelling_logo';
        else if (sectionId.startsWith('image_with_text')) blueprint = 'image_with_text';
        else if (sectionId.startsWith('image_compare')) blueprint = 'image_compare';
        else if (sectionId.startsWith('editorial_jumbo')) blueprint = 'editorial_jumbo';
        else if (sectionId.startsWith('editorial')) blueprint = 'editorial';
        else if (sectionId.startsWith('featured_collection')) blueprint = 'featured_collection';
        const Section = INDEX_SECTION_COMPONENTS[blueprint];
        if (!Section) return null;
        return <Section key={sectionId} sectionId={sectionId} templateId="index" />;
      })}
    </PageShell>
  );
}
