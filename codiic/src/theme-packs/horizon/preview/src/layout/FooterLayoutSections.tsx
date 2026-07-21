import { HeroSection } from '../sections/HeroSection';
import { ContactFormSection } from '../sections/ContactFormSection';
import { EmailSignupSection } from '../sections/EmailSignupSection';
import { CustomSection } from './CustomSection';
import { ProductHighlightLayoutSection } from './ProductHighlightLayoutSection';
import { EditorialLayoutSection } from './EditorialLayoutSection';
import { EditorialJumboLayoutSection } from './EditorialJumboLayoutSection';
import { ImageCompareLayoutSection } from './ImageCompareLayoutSection';
import { ImageWithTextLayoutSection } from './ImageWithTextLayoutSection';
import { Divider } from './Divider';
import { FaqSection } from '../sections/FaqSection';
import { IconsWithTextSection } from '../sections/IconsWithTextSection';
import { MulticolumnSection } from '../sections/MulticolumnSection';
import { PullQuoteSection } from '../sections/PullQuoteSection';
import { RichTextSection } from '../sections/RichTextSection';
import { TextMarqueeSection } from '../sections/TextMarqueeSection';
import { StorytellingLogoSection } from '../sections/StorytellingLogoSection';
import { StorytellingVideoSection } from '../sections/StorytellingVideoSection';
import { Footer } from './Footer';
import { FooterUtilities } from './FooterUtilities';

type Props = { sectionId: string };

function isFooterUtilitiesSectionId(sectionId: string): boolean {
  return sectionId === 'footer_utilities' || /^footer_utilities_\d+$/.test(sectionId);
}

function isFooterSectionId(sectionId: string): boolean {
  if (isFooterUtilitiesSectionId(sectionId)) return false;
  return sectionId === 'footer' || /^footer_\d+$/.test(sectionId);
}

export function FooterLayoutSections({ sectionId }: Props) {
  if (isFooterUtilitiesSectionId(sectionId)) {
    return <FooterUtilities sectionId={sectionId} />;
  }
  if (isFooterSectionId(sectionId)) {
    return <Footer sectionId={sectionId} />;
  }
  if (sectionId === 'divider' || sectionId.startsWith('divider_')) {
    return <Divider sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'custom_section' || sectionId.startsWith('custom_section_')) {
    return <CustomSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'hero_main' || sectionId.startsWith('hero_main_')) {
    return <HeroSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'product_highlight' || sectionId.startsWith('product_highlight_')) {
    return <ProductHighlightLayoutSection sectionId={sectionId} />;
  }
  if (sectionId === 'image_compare' || sectionId.startsWith('image_compare_')) {
    return <ImageCompareLayoutSection sectionId={sectionId} />;
  }
  if (sectionId === 'image_with_text' || sectionId.startsWith('image_with_text_')) {
    return <ImageWithTextLayoutSection sectionId={sectionId} />;
  }
  if (sectionId === 'editorial_jumbo' || sectionId.startsWith('editorial_jumbo_')) {
    return <EditorialJumboLayoutSection sectionId={sectionId} />;
  }
  if (sectionId === 'editorial' || sectionId.startsWith('editorial_')) {
    return <EditorialLayoutSection sectionId={sectionId} />;
  }
  if (sectionId === 'faq_section' || sectionId.startsWith('faq_section_')) {
    return <FaqSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'icons_with_text' || sectionId.startsWith('icons_with_text_')) {
    return <IconsWithTextSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'multicolumn_section' || sectionId.startsWith('multicolumn_section_')) {
    return <MulticolumnSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'pull_quote_section' || sectionId.startsWith('pull_quote_section_')) {
    return <PullQuoteSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'rich_text_section' || sectionId.startsWith('rich_text_section_')) {
    return <RichTextSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'text_marquee_section' || sectionId.startsWith('text_marquee_section')) {
    return <TextMarqueeSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'contact_form' || sectionId.startsWith('contact_form')) {
    return <ContactFormSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'email_signup' || sectionId.startsWith('email_signup')) {
    return <EmailSignupSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'storytelling_logo' || sectionId.startsWith('storytelling_logo')) {
    return <StorytellingLogoSection sectionId={sectionId} placement="layout" />;
  }
  if (sectionId === 'storytelling_video' || sectionId.startsWith('storytelling_video')) {
    return <StorytellingVideoSection sectionId={sectionId} placement="layout" />;
  }
  return null;
}
