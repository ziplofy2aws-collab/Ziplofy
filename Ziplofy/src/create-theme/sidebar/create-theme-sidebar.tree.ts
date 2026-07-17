import type { EditorFieldDef, EditorSchemaDoc, SidebarIcon, SidebarNode } from './create-theme-sidebar.types';
import { isSectionSettingsFieldPath } from './create-theme-field.utils';
import { THEME_SETTINGS_CATALOG } from './theme-settings-catalog';
import type { ThemePreviewPage } from '../chrome/CreateThemeLivePreview';
import {
  canDeleteLayoutSection,
  canDeleteTemplateSection,
  defaultFooterSectionOrder,
  defaultHeaderSectionOrder,
  ensureLayoutOrder,
  existingLayoutSectionIds,
  existingTemplateSectionIds,
  getLayoutOrder,
  layoutBlueprintKey,
  layoutHeroInstanceFromNodeId,
  remapLayoutSchemaPath,
  remapTemplateHeroSchemaPath,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from '../../utils/theme-editor-insert-section';
import {
  defaultHeroBlockOrder,
  heroSectionSidebarLabel,
  readCatalogVariant,
} from '../../utils/hero-banner-variants.util';
import {
  heroBottomAlignedPaths,
  isHeroBottomAlignedSectionConfig,
} from '../../utils/hero-bottom-aligned.util';
import {
  listKeyBlockChildren,
  listKeyFooterSections,
  listKeyHeaderSections,
  listKeyLayoutBlocks,
  listKeyLayoutSectionChildren,
  listKeySectionChildren,
  listKeyTemplateSections,
  reorderSidebarChildren,
} from './create-theme-structure-order';
import {
  announcementBlockFieldDefsFromSchema,
  announcementBlockFieldsFromNode,
  blockInstanceIdFromAnnouncementBlockNodeId,
  blockInstanceIdFromAnnouncementFieldNodeId,
  findAnnouncementBlockInTree,
  instanceIdFromAnnouncementBlockNodeId,
  instanceIdFromAnnouncementFieldNodeId,
  isAnnouncementBlockNodeId,
  isAnnouncementBlockPanelFields,
  prepareAnnouncementBlockSettingsNode,
} from './theme-editor-announcement-block-panel.utils';
import {
  collectAnnouncementPanelFieldDefs,
  findAnnouncementSectionInTree,
  isAnnouncementLayoutNodeId,
  prepareAnnouncementSettingsNode,
  resolveAnnouncementSectionPanelFields,
} from './theme-editor-announcement-panel.utils';
import {
  collectHeaderPanelFieldDefs,
  findHeaderSectionInTree,
  isHeaderLayoutNodeId,
  isHeaderLogoBlockNodeId,
  prepareHeaderSettingsNode,
} from './theme-editor-header-panel.utils';
import {
  headerLogoBlockFieldDefsFromSchema,
  headerLogoBlockFieldsFromNode,
  instanceIdFromHeaderLogoBlockNodeId,
  isHeaderLogoBlockPanelField,
  prepareHeaderLogoBlockSettingsNode,
} from './theme-editor-header-logo-block-panel.utils';
import {
  headerMenuBlockFieldDefsFromSchema,
  headerMenuBlockFieldsFromNode,
  instanceIdFromHeaderMenuBlockNodeId,
  isHeaderMenuBlockPanelField,
  prepareHeaderMenuBlockSettingsNode,
} from './theme-editor-header-menu-block-panel.utils';
import { isHeaderMenuBlockNodeId } from './theme-editor-header-panel.utils';
import {
  collectFooterPanelFieldDefs,
  findFooterSectionInTree,
  isFooterLayoutNodeId,
  prepareFooterSettingsNode,
} from './theme-editor-footer-panel.utils';
import {
  collectFooterUtilitiesPanelFieldDefs,
  findFooterUtilitiesSectionInTree,
  isFooterUtilitiesLayoutNodeId,
  footerUtilitiesSidebarLabel,
  prepareFooterUtilitiesSettingsNode,
} from './theme-editor-footer-utilities-panel.utils';
import {
  isContactFormSectionType,
  isContactFormSettingsPanelFields,
  prepareContactFormSettingsNode,
} from './theme-editor-contact-form-panel.utils';
import {
  contactFormBlockFieldDefsFromNodeId,
  isContactFormBlockNodeId,
  prepareContactFormBlockSettingsNode,
  contactFormFormGroupFieldDefsFromNodeId,
  isContactFormFormGroupNodeId,
  prepareContactFormFormGroupSettingsNode,
} from './theme-editor-contact-form-block-panel.utils';
import {
  emailSignupBlockFieldDefsFromNodeId,
  isEmailSignupSectionBlockNodeId,
  prepareEmailSignupSectionBlockSettingsNode,
} from './theme-editor-email-signup-block-panel.utils';
import {
  imageCompareBlockFieldDefsFromNodeId,
  isImageCompareButtonsGroupNodeId,
  isImageCompareContentGroupNodeId,
  isImageCompareSectionBlockNodeId,
  isImageCompareTextGroupNodeId,
  prepareImageCompareSectionBlockSettingsNode,
} from './theme-editor-image-compare-block-panel.utils';
import {
  imageCompareContentGroupFieldDefsFromNodeId,
  prepareImageCompareContentGroupSettingsNode,
} from './theme-editor-image-compare-content-group-panel.utils';
import {
  imageCompareButtonsGroupFieldDefsFromNodeId,
  prepareImageCompareButtonsGroupSettingsNode,
} from './theme-editor-image-compare-buttons-group-panel.utils';
import {
  imageCompareTextGroupFieldDefsFromNodeId,
  prepareImageCompareTextGroupSettingsNode,
} from './theme-editor-image-compare-text-group-panel.utils';
import {
  isCustomSectionSettingsPanelFields,
  isCustomSectionType,
  prepareCustomSectionSettingsNode,
} from './theme-editor-custom-section-panel.utils';
import {
  isEmailSignupSectionType,
  isEmailSignupSettingsPanelFields,
  prepareEmailSignupSettingsNode,
} from './theme-editor-email-signup-panel.utils';
import {
  isProductHighlightSectionType,
  isProductHighlightSettingsPanelFields,
  prepareProductHighlightSettingsNode,
  productHighlightSettingsBaseFromNodeId,
  productHighlightSidebarLabel,
  readProductHighlightSettingValue,
  resolveProductHighlightVariant,
} from './theme-editor-product-highlight-panel.utils';
import {
  isFeaturedProductSectionType,
  isFeaturedProductSettingsPanelFields,
  prepareFeaturedProductSettingsNode,
} from './theme-editor-featured-product-panel.utils';
import {
  featuredProductMediaFieldDefsFromNodeId,
  featuredProductMediaFieldDefsFromSchema,
  isFeaturedProductMediaBlockNodeId,
  isFeaturedProductMediaPanelFields,
  prepareFeaturedProductMediaSettingsNode,
} from './theme-editor-featured-product-media-block-panel.utils';
import {
  featuredProductDetailsFieldDefsFromNodeId,
  featuredProductDetailsFieldDefsFromSchema,
  isFeaturedProductDetailsBlockNodeId,
  isFeaturedProductDetailsPanelFields,
  prepareFeaturedProductDetailsSettingsNode,
} from './theme-editor-featured-product-details-block-panel.utils';
import {
  featuredProductHeaderFieldDefsFromNodeId,
  featuredProductHeaderFieldDefsFromSchema,
  isFeaturedProductHeaderBlockNodeId,
  prepareFeaturedProductHeaderSettingsNode,
} from './theme-editor-featured-product-header-block-panel.utils';
import {
  isFeaturedProductAcceleratedCheckoutNestedNodeId,
  prepareFeaturedProductAcceleratedCheckoutSettingsNode,
} from './theme-editor-featured-product-accelerated-checkout-panel.utils';
import {
  featuredProductQuantityFieldDefsFromNodeId,
  featuredProductQuantityFieldDefsFromSchema,
  isFeaturedProductQuantityNestedNodeId,
  prepareFeaturedProductQuantitySettingsNode,
} from './theme-editor-featured-product-quantity-panel.utils';
import {
  featuredProductAddToCartFieldDefsFromNodeId,
  featuredProductAddToCartFieldDefsFromSchema,
  isFeaturedProductAddToCartNestedNodeId,
  prepareFeaturedProductAddToCartSettingsNode,
} from './theme-editor-featured-product-add-to-cart-panel.utils';
import {
  featuredProductBuyButtonsFieldDefsFromNodeId,
  featuredProductBuyButtonsFieldDefsFromSchema,
  isFeaturedProductBuyButtonsBlockNodeId,
  prepareFeaturedProductBuyButtonsSettingsNode,
} from './theme-editor-featured-product-buy-buttons-block-panel.utils';
import {
  featuredProductReviewStarsFieldDefsFromNodeId,
  featuredProductReviewStarsFieldDefsFromSchema,
  isFeaturedProductReviewStarsBlockNodeId,
  prepareFeaturedProductReviewStarsSettingsNode,
} from './theme-editor-featured-product-review-stars-block-panel.utils';
import {
  featuredProductVariantPickerFieldDefsFromNodeId,
  featuredProductVariantPickerFieldDefsFromSchema,
  isFeaturedProductVariantPickerBlockNodeId,
  prepareFeaturedProductVariantPickerSettingsNode,
} from './theme-editor-featured-product-variant-picker-block-panel.utils';
import {
  featuredProductHeaderPriceFieldDefsFromNodeId,
  featuredProductHeaderPriceFieldDefsFromSchema,
  isFeaturedProductHeaderPriceNestedNodeId,
  prepareFeaturedProductHeaderPriceSettingsNode,
} from './theme-editor-featured-product-header-price-panel.utils';
import {
  featuredProductHeaderTitleFieldDefsFromNodeId,
  featuredProductHeaderTitleFieldDefsFromSchema,
  isFeaturedProductHeaderTitleNestedNodeId,
  prepareFeaturedProductHeaderTitleSettingsNode,
} from './theme-editor-featured-product-header-title-panel.utils';
import {
  isProductHighlightProductImageNestedNodeId,
  isProductHighlightProductPriceNestedNodeId,
  isProductHighlightProductSwatchesNestedNodeId,
  isProductHighlightProductTitleNestedNodeId,
  prepareProductHighlightProductImageSettingsNode,
  prepareProductHighlightProductPriceSettingsNode,
  prepareProductHighlightProductSwatchesSettingsNode,
  prepareProductHighlightProductTitleSettingsNode,
  productHighlightProductBlockFieldDefsFromNodeId,
  productHighlightProductBlockFieldDefsFromSchema,
} from './theme-editor-product-highlight-product-block-panel.utils';
import {
  isProductHighlightMediaPanelFields,
  prepareProductHighlightMediaSettingsNode,
  prepareProductHighlightProductSettingsNode,
  productHighlightMediaFieldDefsFromNodeId,
  productHighlightMediaFieldDefsFromSchema,
  isProductHighlightProductBlockNodeId,
} from './theme-editor-product-highlight-media-block-panel.utils';
import {
  isEditorialSectionType,
  isEditorialSettingsPanelFields,
  prepareEditorialSettingsNode,
} from './theme-editor-editorial-panel.utils';
import {
  isEditorialJumboSectionType,
  isEditorialJumboSettingsPanelFields,
  prepareEditorialJumboSettingsNode,
} from './theme-editor-editorial-jumbo-panel.utils';
import {
  isImageCompareSectionType,
  isImageCompareSettingsPanelFields,
  prepareImageCompareSettingsNode,
} from './theme-editor-image-compare-panel.utils';
import {
  isImageWithTextSectionType,
  isImageWithTextSettingsPanelFields,
  prepareImageWithTextSettingsNode,
} from './theme-editor-image-with-text-panel.utils';
import {
  isImageWithTextBlockNodeId,
  isImageWithTextGroupNodeId,
  prepareImageWithTextBlockSettingsNode,
  prepareImageWithTextGroupSettingsNode,
  imageWithTextBlockFieldDefsFromNodeId,
} from './theme-editor-image-with-text-block-panel.utils';
import {
  isStorytellingLogoSectionType,
  isStorytellingLogoSettingsPanelFields,
  prepareStorytellingLogoSettingsNode,
} from './theme-editor-storytelling-logo-panel.utils';
import {
  isStorytellingVideoSectionType,
  isStorytellingVideoSettingsPanelFields,
  prepareStorytellingVideoSettingsNode,
} from './theme-editor-storytelling-video-panel.utils';
import {
  isStorytellingVideoBlockNodeId,
  isStorytellingVideoCaptionGroupNodeId,
  prepareStorytellingVideoBlockSettingsNode,
  storytellingVideoBlockFieldDefsFromNodeId,
} from './theme-editor-storytelling-video-block-panel.utils';
import { prepareStorytellingVideoCaptionGroupSettingsNode } from './theme-editor-storytelling-video-caption-panel.utils';
import {
  isFaqSectionType,
  isFaqSectionNodeId,
  isFaqSettingsPanelFields,
  isFaqBlockField,
  prepareFaqSettingsNode,
} from './theme-editor-faq-panel.utils';
import {
  faqAccordionFieldDefsFromNodeId,
  faqAccordionFieldDefsFromSchema,
  isFaqAccordionBlockNodeId,
  prepareFaqAccordionSettingsNode,
} from './theme-editor-faq-accordion-block-panel.utils';
import {
  faqAccordionRowFieldDefsFromNodeId,
  faqAccordionRowFieldDefsFromSchema,
  isFaqAccordionRowNestedNodeId,
  isFaqAccordionRowField,
  prepareFaqAccordionRowSettingsNode,
} from './theme-editor-faq-accordion-row-panel.utils';
import {
  faqAccordionRowTextFieldDefsFromNodeId,
  faqAccordionRowTextFieldDefsFromSchema,
  isFaqAccordionRowTextNestedNodeId,
  isFaqAccordionRowTextField,
  prepareFaqAccordionRowTextSettingsNode,
} from './theme-editor-faq-accordion-row-text-panel.utils';
import {
  isIconsWithTextSectionType,
  isIconsWithTextSettingsPanelFields,
  isIconsWithTextBlockField,
  isIconsWithTextBlockNodeId,
  iconWithTextBlockFieldDefsFromNodeId,
  prepareIconsWithTextSettingsNode,
  prepareIconsWithTextBlockSettingsNode,
} from './theme-editor-icons-with-text-panel.utils';
import {
  isMulticolumnSectionType,
  isMulticolumnSettingsPanelFields,
  isMulticolumnBlockField,
  isMulticolumnBlockFieldsOnly,
  isMulticolumnBlockNodeId,
  isMulticolumnColumnNodeId,
  isMulticolumnNestedHeadingNodeId,
  isMulticolumnNestedDescriptionNodeId,
  multicolumnBlockFieldDefsFromNodeId,
  multicolumnColumnBlockFieldDefsFromNodeId,
  multicolumnHeadingBlockFieldDefsFromNodeId,
  multicolumnDescriptionBlockFieldDefsFromNodeId,
  prepareMulticolumnSettingsNode,
  prepareMulticolumnBlockSettingsNode,
  prepareMulticolumnColumnBlockSettingsNode,
  prepareMulticolumnDescriptionBlockSettingsNode,
} from './theme-editor-multicolumn-panel.utils';
import { mapMulticolumnBlockNodes } from '../../utils/multicolumn-sidebar.util';
import { mapRichTextBlockNodes } from '../../utils/rich-text-sidebar.util';
import {
  mapPullQuoteBlockNodes,
  isPullQuoteTextBlockNodeId,
  isPullQuoteButtonBlockNodeId,
  preparePullQuoteTextBlockSettingsNode,
  preparePullQuoteButtonBlockSettingsNode,
} from '../../utils/pull-quote-sidebar.util';
import {
  mapTextMarqueeBlockNodes,
  isTextMarqueeTextBlockNodeId,
  prepareTextMarqueeTextBlockSettingsNode,
} from '../../utils/text-marquee-sidebar.util';
import {
  isPullQuoteSectionType,
  isPullQuoteSectionNodeId,
  isPullQuoteSettingsPanelFields,
  preparePullQuoteSettingsNode,
} from './theme-editor-pull-quote-panel.utils';
import {
  isRichTextBlockNodeId,
  isRichTextSectionType,
  isRichTextSettingsPanelFields,
  prepareRichTextBlockSettingsNode,
  prepareRichTextSettingsNode,
  richTextBlockFieldDefsFromNodeId,
} from './theme-editor-rich-text-panel.utils';
import {
  isTextMarqueeSectionType,
  isTextMarqueeSettingsPanelFields,
  prepareTextMarqueeSettingsNode,
} from './theme-editor-text-marquee-panel.utils';
import {
  isBlogPostsCarouselSectionType,
  isBlogPostsCarouselSettingsPanelFields,
  isBlogPostsCarouselSectionNodeId,
  prepareBlogPostsCarouselSettingsNode,
} from './theme-editor-blog-posts-carousel-panel.utils';
import {
  isBlogPostsEditorialSectionType,
  isBlogPostsEditorialSectionNodeId,
  isBlogPostsEditorialSettingsPanelFields,
  prepareBlogPostsEditorialSettingsNode,
} from './theme-editor-blog-posts-editorial-panel.utils';
import {
  isBlogPostsGridSectionNodeId,
  isBlogPostsGridSectionType,
  isBlogPostsGridSettingsPanelFields,
  prepareBlogPostsGridSettingsNode,
} from './theme-editor-blog-posts-grid-panel.utils';
import {
  isProductHotspotsSectionType,
  isProductHotspotsSettingsPanelFields,
  prepareProductHotspotsSettingsNode,
} from './theme-editor-product-hotspots-panel.utils';
import {
  isProductHotspotsHeadingFieldNodeId,
  productHotspotsHeadingFieldDefsFromNodeId,
  prepareProductHotspotsHeadingSettingsNode,
} from './theme-editor-product-hotspots-heading-panel.utils';
import {
  isProductHotspotsHotspotBlockNodeId,
  productHotspotsHotspotFieldDefsFromNodeId,
  prepareProductHotspotsHotspotSettingsNode,
} from './theme-editor-product-hotspots-block-panel.utils';
import {
  isRecommendedProductsSectionType,
  isRecommendedProductsSettingsPanelFields,
  prepareRecommendedProductsSettingsNode,
} from './theme-editor-recommended-products-panel.utils';
import { isCollectionHeadingSectionType } from './theme-editor-collection-heading-panel.utils';
import { isMainCollectionSectionType } from './theme-editor-main-collection-panel.utils';
import {
  isBlogPostMainSectionType,
  isMainBlogSectionType,
} from './theme-editor-blog-post-main-panel.utils';
import {
  isRecommendedProductsHeaderNodeId,
  recommendedProductsHeaderFieldDefsFromNodeId,
  prepareRecommendedProductsHeaderSettingsNode,
} from './theme-editor-recommended-products-header-panel.utils';
import {
  isCollectionLinksSpotlightSectionType,
  isCollectionLinksSpotlightSettingsPanelFields,
  prepareCollectionLinksSpotlightSettingsNode,
} from './theme-editor-collection-links-spotlight-panel.utils';
import {
  isCollectionListBentoSectionType,
  isCollectionListBentoSettingsPanelFields,
  prepareCollectionListBentoSettingsNode,
} from './theme-editor-collection-list-bento-panel.utils';
import {
  isCollectionListCarouselSectionType,
  isCollectionListCarouselSettingsPanelFields,
  prepareCollectionListCarouselSettingsNode,
} from './theme-editor-collection-list-carousel-panel.utils';
import {
  isCollectionListEditorialSectionType,
  isCollectionListEditorialSettingsPanelFields,
  prepareCollectionListEditorialSettingsNode,
} from './theme-editor-collection-list-editorial-panel.utils';
import {
  isCollectionListGridSectionType,
  isCollectionListGridSettingsPanelFields,
  prepareCollectionListGridSettingsNode,
} from './theme-editor-collection-list-grid-panel.utils';
import { isCollectionListUnifiedSettingsPanelFields, prepareCollectionListSettingsNode } from './theme-editor-collection-list-panel.utils';
import {
  isLayeredSlideshowSectionType,
  isLayeredSlideshowSettingsPanelFields,
  prepareLayeredSlideshowSettingsNode,
} from './theme-editor-layered-slideshow-panel.utils';
import {
  isSlideshowFullFrameSectionType,
  isSlideshowFullFrameSettingsPanelFields,
  prepareSlideshowFullFrameSettingsNode,
} from './theme-editor-slideshow-full-frame-panel.utils';
import {
  isSlideshowInsetSectionType,
  isSlideshowInsetSettingsPanelFields,
  prepareSlideshowInsetSettingsNode,
} from './theme-editor-slideshow-inset-panel.utils';
import {
  isSlideshowSlideBlockFieldsOnly,
  prepareSlideshowSlideBlockSettingsNode,
} from './theme-editor-slideshow-slide-block-panel.utils';
import {
  collectionLinkBlockFieldDefsFromSchema,
  isCollectionLinkBlockField,
  isCollectionLinkBlockFieldsOnly,
  isCollectionLinkBlockNodeId,
  prepareCollectionLinkBlockSettingsNode,
} from './theme-editor-collection-link-block-panel.utils';
import {
  collectionLinkTitleFieldDefsFromSchema,
  isCollectionLinkTitleFieldNodeId,
  prepareCollectionLinkTitleSettingsNode,
} from './theme-editor-collection-link-title-panel.utils';
import {
  collectionLinkImageFieldDefsFromSchema,
  isCollectionLinkImageFieldNodeId,
  isCollectionLinkImagePanelField,
  prepareCollectionLinkImageSettingsNode,
} from './theme-editor-collection-link-image-panel.utils';
import { mapCollectionLinksSpotlightBlockNodes } from '../../utils/collection-links-spotlight-sidebar.util';
import { mapCollectionListBlockNodes } from '../utils/collection-list-sidebar.util';
import { mapFeaturedCollectionBlockNodes } from '../utils/featured-collection-sidebar.util';
import { mapContactFormBlockNodes } from '../utils/contact-form-sidebar.util';
import { mapEmailSignupBlockNodes } from '../utils/email-signup-sidebar.util';
import { mapImageCompareBlockNodes } from '../utils/image-compare-sidebar.util';
import { mapEditorialJumboBlockNodes } from '../utils/editorial-jumbo-sidebar.util';
import { mapEditorialBlockNodes } from '../utils/editorial-sidebar.util';
import { mapStorytellingCarouselBlockNodes } from '../utils/storytelling-carousel-sidebar.util';
import { mapBlogPostsGridBlockNodes } from '../utils/blog-posts-grid-sidebar.util';
import { mapBlogPostsEditorialBlockNodes } from '../utils/blog-posts-editorial-sidebar.util';
import { mapBlogPostsCarouselBlockNodes } from '../utils/blog-posts-carousel-sidebar.util';
import {
  blogPostsGridBlockFieldDefsFromNodeId,
  isBlogPostsGridCardDetailsBlockNodeId,
  isBlogPostsGridCardExcerptBlockNodeId,
  isBlogPostsGridCardImageBlockNodeId,
  isBlogPostsGridCardTitleBlockNodeId,
  isBlogPostsGridTitleBlockNodeId,
} from './theme-editor-blog-posts-grid-block-panel.utils';
import {
  blogPostsGridCardFieldDefsFromNodeId,
  isBlogPostsGridCardGroupBlockNodeId,
  isBlogPostsGridCardPanelFields,
  prepareBlogPostsGridCardSettingsNode,
} from './theme-editor-blog-posts-grid-card-panel.utils';
import { mapImageWithTextBlockNodes } from '../utils/image-with-text-sidebar.util';
import { mapStorytellingVideoBlockNodes } from '../utils/storytelling-video-sidebar.util';
import { mapFeaturedProductBlockNodes } from '../../utils/featured-product-sidebar.util';
import {
  isProductMainSectionType,
  mapProductPageBlockNodes,
} from '../../utils/product-page-sidebar.util';
import { mapProductHighlightBlockNodes } from '../../utils/product-highlight-sidebar.util';
import { mapProductHotspotsBlockNodes } from '../../utils/product-hotspots-sidebar.util';
import { mapRecommendedProductsBlockNodes } from '../../utils/recommended-products-sidebar.util';
import {
  mapCollectionHeadingBlockNodes,
  mapMainCollectionBlockNodes,
} from '../../utils/collection-page-sidebar.util';
import {
  isSearchResultsSectionType,
  isSearchSectionType,
  mapSearchBlockNodes,
  mapSearchResultsBlockNodes,
} from '../../utils/search-page-sidebar.util';
import {
  mapBlogPostMainBlockNodes,
  mapMainBlogBlockNodes,
} from '../../utils/blog-post-main-sidebar.util';
import { mapFaqBlockNodes } from '../../utils/faq-sidebar.util';
import { mapIconsWithTextBlockNodes } from '../../utils/icons-with-text-sidebar.util';
import {
  isCollectionTileBlockFieldsOnly,
  prepareCollectionTileBlockSettingsNode,
} from './theme-editor-collection-tile-block-panel.utils';
import {
  isCollectionListCardImagePanelFields,
  isCollectionListCardPanelFields,
  isCollectionListCardTitlePanelFields,
  isCollectionListHeaderTextPanelFields,
  prepareCollectionListCardImageSettingsNode,
  prepareCollectionListCardSettingsNode,
  prepareCollectionListCardTitleSettingsNode,
  prepareCollectionListHeaderTextSettingsNode,
} from './theme-editor-collection-list-block-panel.utils';
import { collectionListHeaderTextFieldDefsFromNodeId } from './theme-editor-collection-list-header-text-panel.utils';
import { collectionListCardFieldDefsFromNodeId } from './theme-editor-collection-list-card-panel.utils';
import { collectionListCardImageFieldDefsFromNodeId } from './theme-editor-collection-list-card-image-panel.utils';
import { collectionListCardTitleFieldDefsFromNodeId } from './theme-editor-collection-list-card-title-panel.utils';
import {
  isCollectionListCardBlockNodeId,
  isCollectionListCardImageNodeId,
  isCollectionListCardTitleNodeId,
  isCollectionListHeaderTextNodeId,
} from '../utils/collection-list-sidebar.util';
import {
  isCollectionListSectionHeaderBlockNodeId,
  isCollectionListSectionHeaderPanelFields,
  prepareCollectionListSectionHeaderSettingsNode,
} from './theme-editor-collection-list-header-panel.utils';
import {
  isStorytellingCarouselSectionType,
  isStorytellingCarouselSettingsPanelFields,
  prepareStorytellingCarouselSettingsNode,
} from './theme-editor-storytelling-carousel-panel.utils';
import {
  isStorytellingCarouselCardBlockNodeId,
  isStorytellingCarouselHeaderBlockNodeId,
  storytellingCarouselBlockFieldDefsFromNodeId,
} from './theme-editor-storytelling-carousel-block-panel.utils';
import {
  isStorytellingCarouselCardPanelFields,
  prepareStorytellingCarouselCardSettingsNode,
  storytellingCarouselCardFieldDefsFromNodeId,
} from './theme-editor-storytelling-carousel-card-panel.utils';
import {
  isStorytellingCarouselContentGroupBlockNodeId,
  isStorytellingCarouselContentGroupPanelFields,
  prepareStorytellingCarouselContentGroupSettingsNode,
  storytellingCarouselContentGroupFieldDefsFromNodeId,
} from './theme-editor-storytelling-carousel-content-group-panel.utils';
import {
  isStorytellingCarouselHeaderGroupBlockNodeId,
  isStorytellingCarouselHeaderGroupPanelFields,
  prepareStorytellingCarouselHeaderGroupSettingsNode,
  storytellingCarouselHeaderFieldDefsFromNodeId,
} from './theme-editor-storytelling-carousel-header-panel.utils';
import {
  isDividerSectionType,
  isDividerSettingsPanelFields,
  isDividerSectionNodeId,
  prepareDividerSettingsNode,
  resolveDividerSectionPanelFields,
  findDividerSectionInTree,
} from './theme-editor-divider-panel.utils';
import {
  copyrightBlockFieldDefsFromSchema,
  findCopyrightBlockInTree,
  instanceIdFromCopyrightNodeId,
  isCopyrightBlockNodeId,
  prepareCopyrightBlockSettingsNode,
} from './theme-editor-copyright-block-panel.utils';
import {
  findPolicyLinksBlockInTree,
  instanceIdFromPolicyLinksNodeId,
  isPolicyLinksBlockNodeId,
  policyLinksBlockFieldDefsFromSchema,
  preparePolicyLinksBlockSettingsNode,
} from './theme-editor-policy-links-block-panel.utils';
import {
  findSocialLinksBlockInTree,
  instanceIdFromSocialLinksNodeId,
  isSocialLinksBlockNodeId,
  prepareSocialLinksBlockSettingsNode,
  socialLinksBlockFieldDefsFromSchema,
} from './theme-editor-social-links-block-panel.utils';
import {
  featuredCollectionSidebarLabel,
  findFeaturedCollectionSectionInTree,
  isFeaturedCollectionCarouselSettingsPanelFields,
  isFeaturedCollectionEditorialSettingsPanelFields,
  isFeaturedCollectionGridSettingsPanelFields,
  isFeaturedCollectionGroupedPanelSectionType,
  isFeaturedCollectionSectionNodeId,
  prepareFeaturedCollectionSettingsNode,
  readFeaturedCollectionCatalogVariant,
  readFeaturedCollectionLayoutType,
} from './theme-editor-featured-collection-panel.utils';
import {
  findHeroSectionInTree,
  heroSectionFieldDefsFromSchema,
  isHeroSectionNodeId,
  isHeroSectionSettingsNode,
  prepareHeroSettingsNode,
  prepareHeroBottomAlignedSettingsNode,
  prepareHeroMarqueeSettingsNode,
  prepareHeroLargeLogoSettingsNode,
  prepareHeroSplitShowcaseSettingsNode,
  prepareHeroSectionSettingsForNode,
  isHeroBottomAlignedSidebarSection,
  isHeroMarqueeSidebarSection,
  isHeroLargeLogoSidebarSection,
  isHeroSplitShowcaseSidebarSection,
} from './theme-editor-hero-panel.utils';
import {
  largeLogoBlockFieldDefs,
  largeLogoBlockFieldDefsFromNodeId,
  prepareLargeLogoBlockSettingsNode,
} from './theme-editor-large-logo-block-panel.utils';
import {
  heroTextBlockFieldDefsFromNode,
  isHeroTextBlockNodeId,
  prepareHeroTextBlockSettingsNode,
} from './theme-editor-hero-text-block-panel.utils';
import {
  isNotFoundMainMessageBlockNodeId,
  isNotFoundMainSectionNodeId,
  notFoundMainContainerFieldDefsFromNodeId,
  notFoundMainMessageFieldDefsFromNodeId,
  prepareNotFoundMainMessageSettingsNode,
  prepareNotFoundMainSettingsNode,
} from './theme-editor-not-found-main-panel.utils';
import { textBlockFieldDefs } from './theme-editor-text-block-panel.utils';
import {
  headingBlockCanonicalFieldDefsForNodeId,
  headingBlockFieldDefsFromSchema,
  isHeadingBlockNodeId,
  isHeadingPanelField,
  prepareHeadingBlockSettingsNode,
} from './theme-editor-heading-block-panel.utils';
import {
  isFaqHeadingCollectionTitlePanelNode,
  isFaqSectionHeadingBlockNodeId,
  mergeFaqHeadingBlockFieldDefs,
} from './theme-editor-faq-heading-panel.utils';
import {
  heroButtonFieldDefsFromSchema,
  isHeroButtonBlockNodeId,
  isHeroButtonPanelField,
  prepareHeroButtonSettingsNode,
} from './theme-editor-hero-button-panel.utils';
import {
  isFeaturedCollectionHeaderBlockNodeId,
  isFeaturedCollectionHeaderPanelField,
  prepareFeaturedCollectionHeaderSettingsNode,
  fcHeaderFieldDefs,
  fcHeaderFieldDefsFromSchema,
  fcHeaderSettingsBaseFromNodeId,
} from './theme-editor-fc-header-panel.utils';
import {
  collectionTitleFieldDefs,
  collectionTitleFieldDefsFromSchema,
  collectionTitleSettingsBaseFromNodeId,
  isCollectionTitleNestedNodeId,
  isCollectionTitlePanelField,
  prepareCollectionTitleSettingsNode,
} from './theme-editor-fc-collection-title-panel.utils';
import {
  isViewAllButtonNestedNodeId,
  prepareViewAllButtonSettingsNode,
  resolveViewAllButtonPanelFields,
} from './theme-editor-fc-view-all-button-panel.utils';
import {
  isProductCardBlockNodeId,
  prepareProductCardSettingsNode,
  productCardFieldDefs,
  productCardFieldDefsFromSchema,
  productCardSettingsBaseFromNodeId,
} from './theme-editor-product-card-panel.utils';
import {
  isProductCardPriceNestedNodeId,
  prepareProductCardPriceSettingsNode,
  productCardPriceFieldDefs,
  productCardPriceFieldDefsFromSchema,
  productCardPriceSettingsBaseFromNodeId,
} from './theme-editor-product-card-price-panel.utils';
import {
  isProductCardMediaNestedNodeId,
  prepareProductCardMediaSettingsNode,
  productCardMediaFieldDefs,
  productCardMediaFieldDefsFromSchema,
  productCardMediaSettingsBaseFromNodeId,
} from './theme-editor-product-card-media-panel.utils';
import {
  isProductCardTitleNestedNodeId,
  prepareProductCardTitleSettingsNode,
  productCardTitleFieldDefs,
  productCardTitleFieldDefsFromSchema,
  productCardTitleSettingsBaseFromNodeId,
} from './theme-editor-product-card-title-panel.utils';
import { resolveEditingPanelForNode } from '../../theme-editor/section-editing-support.util';
import {
  catalogSidebarBlocksForSectionType,
  settingsNodeFromCatalog,
} from '../../theme-editor/catalog-sidebar.util';
import { previewPageToTemplateId, isPasswordPreviewPage } from '../../utils/preview-page-template';
import { schemaTemplateIdForConfigKey } from '../utils/product-templates.util';

type LayoutSectionDef = NonNullable<EditorSchemaDoc['layout']>[string];
type BlockDef = NonNullable<LayoutSectionDef['blocks']>[number];

function iconForFieldLabel(label: string, path: string, type: string): SidebarIcon {
  const key = `${label} ${path} ${type}`.toLowerCase();
  if (key.includes('media') || key.includes('image') || key.includes('showmedia')) return 'image';
  if (key.includes('price') || key.includes('showprice')) return 'price';
  if (key.includes('button') || key.includes('viewall')) return 'button';
  if (key.includes('product card') || key.includes('product-card')) return 'product-card';
  if (key.includes('title') || key.includes('heading') || key.includes('eyebrow') || key.includes('collection')) return 'text';
  if (key.includes('menu') || key.includes('logo') || key.includes('tagline')) return 'text';
  return 'default';
}

function iconForBlockLabel(label: string): SidebarIcon {
  const l = label.toLowerCase();
  if (l === 'group') return 'group';
  if (l === 'menu' || l === 'collection') return 'link';
  if (l === 'logo') return 'section';
  if (l.includes('product card') || l.includes('product')) return 'product-card';
  if (l.includes('button')) return 'button';
  if (l === 'text' || l.includes('heading')) return 'text';
  if (l.includes('header')) return 'text';
  if (l.includes('media') || l.includes('image')) return 'image';
  if (l.includes('price')) return 'price';
  return 'section';
}

function headerBlockIcon(blockId: string, label: string): SidebarIcon {
  if (blockId === 'menu' || label.toLowerCase() === 'menu') return 'link';
  if (blockId === 'logo' || label.toLowerCase() === 'logo') return 'section';
  return iconForBlockLabel(label);
}

function headerMenuBlockPreview(
  block: BlockDef,
  values: Record<string, string | boolean>,
  layoutInstance: string
): string | undefined {
  const menuField = block.settingsFields?.find((f) => f.path.endsWith('.settings.menu'));
  if (!menuField?.path) return undefined;
  const path = remapLayoutSchemaPath(menuField.path, layoutInstance);
  const raw = values[path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  const value = String(raw);
  const menuNamePath = remapLayoutSchemaPath(
    menuField.path.replace(/\.menu$/, '.menuName'),
    layoutInstance
  );
  const menuName = values[menuNamePath];
  if (menuName != null && String(menuName).trim()) return String(menuName);
  const opt = menuField.options?.find((o) => o.value === value);
  if (opt?.label) return opt.label;
  if (/^[0-9a-fA-F]{24}$/.test(value)) return 'Store menu';
  return value;
}

/** Shopify Hero: Bottom aligned — Group → Group → Text / Heading + Text. */
function mapBottomAlignedHeroSidebarNodes(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const paths = heroBottomAlignedPaths(blocksBase);
  const contentPrefix = `${prefix}:block:content_group`;
  const headingGroupPrefix = `${contentPrefix}:nested:heading_group`;
  const contentGroupSettingsBase = `${blocksBase}.content_group.settings`;
  const headingGroupSettingsBase = `${blocksBase}.content_group.blocks.heading_group.settings`;
  const textIntroBase = `${blocksBase}.content_group.blocks.heading_group.blocks.text_intro`;
  const headingMainBase = `${blocksBase}.content_group.blocks.heading_group.blocks.heading_main`;
  const textBodyBase = `${blocksBase}.content_group.blocks.text_body`;

  const textField = (path: string, label: string): EditorFieldDef => ({
    path,
    type: 'textarea',
    label,
  });

  /** Shopify-style "Group" block editor fields (Layout → Size → Appearance → Borders → Block link → Padding). */
  const groupBlockFields = (settingsBase: string): EditorFieldDef[] => {
    const s = (key: string) => `${settingsBase}.${key}`;
    const fitFillCustom = [
      { value: 'fit', label: 'Fit' },
      { value: 'fill', label: 'Fill' },
      { value: 'custom', label: 'Custom' },
    ];
    const pctSlider = (key: string, label: string): EditorFieldDef => ({
      path: s(key),
      type: 'number',
      label,
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    });
    const padSlider = (key: string, label: string): EditorFieldDef => ({
      path: s(key),
      type: 'number',
      label,
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    });
    return [
      {
        path: s('direction'),
        type: 'select',
        label: 'Direction',
        group: 'Layout',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ],
      },
      {
        path: s('verticalOnMobile'),
        type: 'boolean',
        label: 'Vertical on mobile',
        group: 'Layout',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: s('layoutAlignment'),
        type: 'select',
        label: 'Alignment',
        group: 'Layout',
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      {
        path: s('position'),
        type: 'select',
        label: 'Position',
        group: 'Layout',
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'space-between', label: 'Space between' },
          { value: 'space-around', label: 'Space around' },
        ],
      },
      {
        path: s('alignTextBaseline'),
        type: 'boolean',
        label: 'Align text baseline',
        group: 'Layout',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: s('layoutGap'),
        type: 'number',
        label: 'Gap',
        group: 'Layout',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('width'),
        type: 'select',
        label: 'Width',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: fitFillCustom,
      },
      pctSlider('customWidth', 'Custom width'),
      {
        path: s('mobileWidth'),
        type: 'select',
        label: 'Mobile width',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: fitFillCustom,
      },
      pctSlider('mobileCustomWidth', 'Custom width'),
      {
        path: s('height'),
        type: 'select',
        label: 'Height',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: fitFillCustom,
      },
      pctSlider('customHeight', 'Custom height'),
      {
        path: s('backgroundMedia'),
        type: 'select',
        label: 'Background media',
        group: 'Appearance',
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'image', label: 'Image' },
        ],
      },
      {
        path: s('backgroundImageUrl'),
        type: 'text',
        label: 'Background image',
        group: 'Appearance',
        widget: 'image',
        sidebar: true,
        placeholder: 'Paste image URL or upload',
      },
      {
        path: s('backgroundColor'),
        type: 'color',
        label: 'Background color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: s('backgroundOverlay'),
        type: 'boolean',
        label: 'Background overlay',
        group: 'Appearance',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: s('borderStyle'),
        type: 'select',
        label: 'Style',
        group: 'Borders',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'solid', label: 'Solid' },
        ],
      },
      {
        path: s('cornerRadius'),
        type: 'number',
        label: 'Corner radius',
        group: 'Borders',
        widget: 'slider',
        min: 0,
        max: 40,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('link'),
        type: 'text',
        label: 'Link',
        group: 'Block link',
        widget: 'link',
        sidebar: true,
        placeholder: 'Paste a link or search',
      },
      {
        path: s('linkOpenInNewTab'),
        type: 'boolean',
        label: 'Open link in new tab',
        group: 'Block link',
        widget: 'toggle',
        sidebar: true,
      },
      padSlider('paddingTop', 'Top'),
      padSlider('paddingBottom', 'Bottom'),
      padSlider('paddingLeft', 'Left'),
      padSlider('paddingRight', 'Right'),
    ];
  };

  const headingGroupNode: SidebarNode = {
    id: headingGroupPrefix,
    label: 'Group',
    kind: 'block',
    icon: 'group',
    childrenListKey: listKeyBlockChildren(headingGroupPrefix),
    fields: groupBlockFields(headingGroupSettingsBase),
    children: reorderSidebarChildren(
      [
        { id: `${headingGroupPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
        {
          id: `${headingGroupPrefix}:nested:text_intro`,
          label: 'Text',
          kind: 'block',
          icon: 'text',
          preview: fieldPreview(textField(paths.textIntro, 'Text'), values),
          fields: textBlockFieldDefs(textIntroBase),
        },
        {
          id: `${headingGroupPrefix}:nested:heading_main`,
          label: 'Heading',
          kind: 'block',
          icon: 'text',
          preview: fieldPreview(textField(paths.headingMain, 'Text'), values),
          fields: textBlockFieldDefs(headingMainBase),
        },
      ],
      listKeyBlockChildren(headingGroupPrefix),
      itemOrder
    ),
  };

  const contentGroupNode: SidebarNode = {
    id: contentPrefix,
    label: 'Group',
    kind: 'block',
    icon: 'group',
    childrenListKey: listKeyBlockChildren(contentPrefix),
    fields: groupBlockFields(contentGroupSettingsBase),
    children: reorderSidebarChildren(
      [
        { id: `${contentPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
        headingGroupNode,
        {
          id: `${contentPrefix}:nested:text_body`,
          label: 'Text',
          kind: 'block',
          icon: 'text',
          preview: fieldPreview(textField(paths.textBody, 'Text'), values),
          fields: textBlockFieldDefs(textBodyBase),
        },
      ],
      listKeyBlockChildren(contentPrefix),
      itemOrder
    ),
  };

  return reorderSidebarChildren(
    [{ id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' }, contentGroupNode],
    sectionChildrenListKey,
    itemOrder
  );
}

function heroBlockSidebarLabel(blockId: string, blockLabel: string): string {
  // Shopify's Hero lists both the title and body as generic "Text" blocks.
  if (blockId === 'heading' || blockId.startsWith('heading_')) return 'Text';
  if (blockId === 'logo') return 'Logo';
  if (blockId.startsWith('text')) return 'Text';
  if (blockId === 'primary_button' || blockId === 'secondary_button' || blockLabel.toLowerCase().includes('button')) {
    return 'Button';
  }
  return blockLabel;
}

function heroBlockPreview(
  blockId: string,
  block: BlockDef,
  prefix: string,
  values: Record<string, string | boolean>
): string | undefined {
  if (blockId === 'heading') {
    const titlePath = block.settingsFields?.find((f) => f.path.endsWith('.settings.title'))?.path;
    if (titlePath) return fieldPreview({ path: titlePath, type: 'text', label: 'Text' }, values);
    const layoutId = prefix.startsWith('layout:') ? prefix.slice('layout:'.length) : null;
    const tplMatch = prefix.match(/^template:([^:]+):([^:]+)$/);
    const fallbackPath = layoutId
      ? `sections.${layoutId}.settings.title`
      : tplMatch
        ? `templates.${tplMatch[1]}.sections.${tplMatch[2]}.settings.title`
        : '';
    return fallbackPath ? fieldPreview({ path: fallbackPath, type: 'text', label: 'Text' }, values) : undefined;
  }
  const textPath = block.settingsFields?.find(
    (f) => f.path.includes(`.blocks.${blockId}.settings.text`) || f.path.endsWith('.settings.text')
  )?.path;
  if (textPath) return fieldPreview({ path: textPath, type: 'textarea', label: 'Text' }, values);
  return undefined;
}

const SHOPIFY_HERO_BLOCK_ORDER = ['heading', 'primary_button'];

function readConfigBlockOrder(
  config: Record<string, unknown> | null,
  pathParts: string[]
): string[] | undefined {
  if (!config) return undefined;
  let cur: unknown = config;
  for (const part of pathParts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (!Array.isArray(cur)) return undefined;
  return cur.filter((id): id is string => typeof id === 'string' && id.length > 0);
}

function readConfigAtPath(config: Record<string, unknown> | null, pathParts: string[]): unknown {
  if (!config) return undefined;
  let cur: unknown = config;
  for (const part of pathParts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function heroSyntheticBlockDef(blockInstanceId: string, blockType: string, blocksBase: string): BlockDef {
  const id = blockInstanceId;
  if (blockType === 'heading') {
    return {
      id,
      label: 'Heading',
      settingsFields: [
        { path: `${blocksBase}.${id}.settings.heading`, type: 'text', label: 'Text' },
      ],
    };
  }
  if (blockType === 'text') {
    return {
      id,
      label: 'Text',
      settingsFields: [
        { path: `${blocksBase}.${id}.settings.text`, type: 'textarea', label: 'Text' },
      ],
    };
  }
  if (blockType === 'button') {
    return {
      id,
      label: 'Button',
      settingsFields: [
        { path: `${blocksBase}.${id}.settings.label`, type: 'text', label: 'Label' },
        { path: `${blocksBase}.${id}.settings.href`, type: 'text', label: 'Link' },
      ],
    };
  }
  if (blockType === 'image' || blockType === 'video') {
    return {
      id,
      label: blockType === 'video' ? 'Video' : 'Image',
      settingsFields: [
        { path: `${blocksBase}.${id}.settings.url`, type: 'text', label: 'URL' },
      ],
    };
  }
  if (blockType === 'logo') {
    return {
      id,
      label: 'Logo',
      settingsFields: [
        { path: `${blocksBase}.${id}.settings.text`, type: 'text', label: 'Text' },
        { path: `${blocksBase}.${id}.settings.imageUrl`, type: 'text', label: 'Image URL' },
      ],
    };
  }
  if (blockType === 'icon') {
    return {
      id,
      label: 'Icon',
      settingsFields: [
        { path: `${blocksBase}.${id}.settings.icon`, type: 'text', label: 'Icon' },
        { path: `${blocksBase}.${id}.settings.label`, type: 'text', label: 'Label' },
      ],
    };
  }
  if (blockType === 'page') {
    return {
      id,
      label: 'Page',
      settingsFields: [
        { path: `${blocksBase}.${id}.settings.title`, type: 'text', label: 'Title' },
        { path: `${blocksBase}.${id}.settings.href`, type: 'text', label: 'Link' },
      ],
    };
  }
  return {
    id,
    label: blockType ? blockType[0]!.toUpperCase() + blockType.slice(1) : blockInstanceId,
    settingsFields: [],
  };
}

function resolveHeroBlockDef(blocks: BlockDef[], blockInstanceId: string): BlockDef | undefined {
  const byId = new Map(blocks.map((b) => [b.id ?? b.label ?? '', b]));
  const direct = byId.get(blockInstanceId);
  if (direct) return direct;
  if (blockInstanceId === 'heading' || blockInstanceId.startsWith('heading_')) {
    return byId.get('heading');
  }
  if (blockInstanceId.startsWith('text_')) {
    return byId.get('text_2') ?? byId.get('text');
  }
  if (blockInstanceId === 'logo') {
    return byId.get('logo');
  }
  if (blockInstanceId.includes('button')) {
    return byId.get('primary_button') ?? byId.get('secondary_button');
  }
  return undefined;
}

/** Only blocks listed in config `block_order` (Shopify shows one Button by default). */
function filterHeroBlocksForSidebar(
  blocks: BlockDef[],
  config: Record<string, unknown> | null,
  blockOrderPath: string[],
  catalogVariant = ''
): BlockDef[] {
  const order =
    readConfigBlockOrder(config, blockOrderPath) ??
    defaultHeroBlockOrder(catalogVariant || 'hero');
  const blocksPath = [...blockOrderPath.slice(0, -1), 'blocks'];
  const blocksObject = readConfigAtPath(config, blocksPath);
  const blocksRecord =
    blocksObject && typeof blocksObject === 'object' && !Array.isArray(blocksObject)
      ? (blocksObject as Record<string, unknown>)
      : {};
  const blocksBase = blocksPath.join('.');

  const ordered = order
    .map((id) => {
      const base = resolveHeroBlockDef(blocks, id);
      if (!base) {
        const runtimeBlock = blocksRecord[id];
        const blockType =
          runtimeBlock && typeof runtimeBlock === 'object'
            ? String((runtimeBlock as Record<string, unknown>).type ?? '')
            : '';
        if (!blockType) return undefined;
        return heroSyntheticBlockDef(id, blockType, blocksBase);
      }
      if (id === (base.id ?? base.label)) return base;
      const settingsFields = (base.settingsFields ?? []).map((f) => ({
        ...f,
        path: f.path.replace(/\.blocks\.[^.]+\./, `.blocks.${id}.`),
      }));
      return { ...base, id, settingsFields };
    })
    .filter((b): b is BlockDef => Boolean(b));
  if (ordered.length) return ordered;
  return blocks.filter((b) => b.id !== 'secondary_button');
}

/** Split showcase uses a second title block not defined on the base hero schema. */
function withSplitShowcaseBlock(
  blocks: BlockDef[] | undefined,
  catalogVariant: string,
  blocksBase: string
): BlockDef[] {
  const list = [...(blocks ?? [])];
  if (catalogVariant !== 'split-showcase' || list.some((b) => b.id === 'text_right')) {
    return list;
  }
  list.push({
    id: 'text_right',
    label: 'Text',
    settingsFields: [
      {
        path: `${blocksBase}.text_right.settings.text`,
        type: 'textarea',
        label: 'Text',
      },
    ],
  });
  return list;
}

/** Large logo uses a dedicated Logo block for the centered store name / image. */
function withLargeLogoBlock(
  blocks: BlockDef[] | undefined,
  catalogVariant: string,
  blocksBase: string
): BlockDef[] {
  const list = [...(blocks ?? [])];
  if (catalogVariant !== 'large-logo' || list.some((b) => b.id === 'logo')) {
    return list;
  }
  list.push({
    id: 'logo',
    label: 'Logo',
    settingsFields: largeLogoBlockFieldDefs(blocksBase),
  });
  return list;
}

function enrichLargeLogoTextBlocks(
  blocks: BlockDef[],
  catalogVariant: string,
  blocksBase: string
): BlockDef[] {
  if (catalogVariant !== 'large-logo') return blocks;
  return blocks.map((block) => {
    const blockId = block.id ?? '';
    if (blockId === 'text_2' || blockId.startsWith('text_')) {
      return {
        ...block,
        settingsFields: textBlockFieldDefs(`${blocksBase}.${blockId}`),
      };
    }
    return block;
  });
}

function withHeroCatalogBlocks(
  blocks: BlockDef[] | undefined,
  catalogVariant: string,
  blocksBase: string
): BlockDef[] {
  const list = withLargeLogoBlock(
    withSplitShowcaseBlock(blocks, catalogVariant, blocksBase),
    catalogVariant,
    blocksBase
  );
  return enrichLargeLogoTextBlocks(list, catalogVariant, blocksBase);
}

function announcementBlockPreview(
  block: BlockDef,
  values: Record<string, string | boolean>
): string | undefined {
  const textPath = block.settingsFields?.find((f) => f.path.endsWith('.settings.text'))?.path;
  if (textPath) return fieldPreview({ path: textPath, type: 'textarea', label: 'Text' }, values);
  return undefined;
}

/** Announcement bar: Add block → Announcement rows (text preview). */
function mapAnnouncementBlockNodes(
  blocks: BlockDef[],
  prefix: string,
  sectionAddBlockId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  childrenListKey: string,
  config: Record<string, unknown> | null,
  instanceId: string
): SidebarNode[] {
  const order =
    readConfigBlockOrder(config, ['sections', instanceId, 'block_order']) ?? ['announcement'];
  const template = blocks.find((b) => b.id === 'announcement') ?? blocks[0];
  if (!template) return [];

  const visibleBlocks = order
    .map((blockInstanceId) => {
      const settingsFields = (template.settingsFields ?? []).map((f) => ({
        ...f,
        path: f.path.replace(/\.blocks\.[^.]+\./, `.blocks.${blockInstanceId}.`),
      }));
      return { ...template, id: blockInstanceId, settingsFields };
    })
    .filter((b): b is BlockDef => Boolean(b));

  const blockNodes: SidebarNode[] = visibleBlocks.map((block) => {
    const blockId = block.id ?? block.label ?? 'block';
    const layoutInstance = prefix.startsWith('layout:') ? prefix.slice('layout:'.length) : '';
    const blockSettingsFields = layoutInstance
      ? remapFields(block.settingsFields, layoutInstance)
      : (block.settingsFields ?? []);

    return {
      id: `${prefix}:block:${blockId}`,
      label: 'Announcement',
      kind: 'block' as const,
      icon: iconForBlockLabel('Announcement'),
      fields: blockSettingsFields.length ? blockSettingsFields : undefined,
      preview: announcementBlockPreview(block, values),
      showVisibilityToggle: true,
      showDeleteButton: true,
      children: undefined,
      childrenListKey: listKeyBlockChildren(`${prefix}:block:${blockId}`),
    };
  });

  const addBlock: SidebarNode = { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], childrenListKey, itemOrder);
}

/** Header: Logo → Menu — atomic rows only (no nested children, no Add block). */
function mapHeaderBlockNodes(
  blocks: BlockDef[],
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  childrenListKey: string,
  config: Record<string, unknown> | null,
  instanceId: string
): SidebarNode[] {
  const order = readConfigBlockOrder(config, ['sections', instanceId, 'block_order']) ?? ['logo', 'menu'];
  const byId = new Map(blocks.map((b) => [b.id ?? b.label ?? '', b]));

  const blockNodes: SidebarNode[] = order
    .map((blockInstanceId) => {
      const base = byId.get(blockInstanceId);
      if (!base) return null;
      const blockId = blockInstanceId;
      const label = base.label ?? blockId;
      const remapped = remapFields(base.settingsFields, instanceId);
      const isLogo = blockId === 'logo' || (base.id ?? '') === 'logo';
      const isMenu = blockId === 'menu' || (base.id ?? '') === 'menu';
      const blockSettingsFields = isLogo
        ? remapped.filter(isHeaderLogoBlockPanelField)
        : isMenu
          ? remapped.filter(isHeaderMenuBlockPanelField)
          : remapped;

      return {
        id: `${prefix}:block:${blockId}`,
        label,
        kind: 'block' as const,
        icon: headerBlockIcon(blockId, label),
        fields: blockSettingsFields.length ? blockSettingsFields : undefined,
        preview: isMenu ? headerMenuBlockPreview(base, values, instanceId) : undefined,
        showVisibilityToggle: true,
        showDeleteButton: true,
        children: undefined,
      };
    })
    .filter((n): n is SidebarNode => Boolean(n));

  return reorderSidebarChildren(blockNodes, childrenListKey, itemOrder);
}

/** Shopify hero sidebar: Add block → Text → Text → Button (with inline previews). */
function mapHeroBlockNodes(
  blocks: BlockDef[],
  prefix: string,
  sectionAddBlockId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  blocksListKey: string
): SidebarNode[] {
  const blockNodes: SidebarNode[] = blocks.map((block) => {
    const blockId = block.id ?? block.label ?? 'block';
    const layoutInstance = prefix.startsWith('layout:') ? prefix.slice('layout:'.length) : '';
    const blockSettingsFields = layoutInstance
      ? remapFields(block.settingsFields, layoutInstance)
      : (block.settingsFields ?? []);

    const isHeadingBlock = blockId === 'heading' || blockId.startsWith('heading_');
    const isLogoBlock = blockId === 'logo';
    const isButtonBlock =
      blockId === 'primary_button' ||
      blockId === 'secondary_button' ||
      blockId.startsWith('button_');
    return {
      id: `${prefix}:block:${blockId}`,
      label: heroBlockSidebarLabel(blockId, block.label ?? blockId),
      kind: 'block' as const,
      icon: iconForBlockLabel(heroBlockSidebarLabel(blockId, block.label ?? blockId)),
      fields:
        !isHeadingBlock && !isButtonBlock && !isLogoBlock && blockSettingsFields.length
          ? blockSettingsFields
          : undefined,
      preview: heroBlockPreview(blockId, block, prefix, values),
      showVisibilityToggle: true,
      showDeleteButton: true,
      children: undefined,
    };
  });

  const addBlock: SidebarNode = { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], blocksListKey, itemOrder);
}

/**
 * Atomic section blocks (404 Text / Button, etc.) — leaf rows only.
 * No nested field children under each block; settings open in the panel on select.
 */
function mapAtomicSectionBlockNodes(
  blocks: BlockDef[],
  prefix: string,
  sectionAddBlockId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  blocksListKey: string
): SidebarNode[] {
  const blockNodes: SidebarNode[] = blocks.map((block) => {
    const blockId = block.id ?? block.label ?? 'block';
    const layoutInstance = prefix.startsWith('layout:') ? prefix.slice('layout:'.length) : '';
    const blockSettingsFields = layoutInstance
      ? remapFields(block.settingsFields, layoutInstance)
      : (block.settingsFields ?? []);

    const isHeadingBlock = blockId === 'heading' || blockId.startsWith('heading_');

    const previewField = blockSettingsFields.find(
      (f) =>
        f.path.endsWith('.settings.text') ||
        f.path.endsWith('.settings.message') ||
        f.path.endsWith('.settings.label') ||
        f.path.endsWith('.settings.heading')
    );

    let preview = previewField ? fieldPreview(previewField, values) : undefined;
    if (!preview && isHeadingBlock) {
      const tpl = prefix.match(/^template:([^:]+):(.+)$/);
      const titlePath = tpl
        ? `templates.${tpl[1]}.sections.${tpl[2]}.settings.title`
        : layoutInstance
          ? `sections.${layoutInstance}.settings.title`
          : '';
      if (titlePath) {
        preview = fieldPreview({ path: titlePath, type: 'text', label: 'Text' }, values);
      }
    }

    return {
      id: `${prefix}:block:${blockId}`,
      label: block.label ?? blockId,
      kind: 'block' as const,
      icon: iconForBlockLabel(block.label ?? blockId),
      // Heading panel is prepared from canonical defs on select; keep button/message fields.
      fields:
        isHeadingBlock
          ? undefined
          : blockSettingsFields.length
            ? blockSettingsFields
            : undefined,
      preview,
      showVisibilityToggle: true,
      showDeleteButton: true,
      children: undefined,
    };
  });

  const addBlock: SidebarNode = { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], blocksListKey, itemOrder);
}

function splitShowcaseSettingsBaseFromPrefix(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}.settings`;
  const tpl = prefix.match(/^template:([^:]+):(.+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}.settings`;
  return `${prefix}.settings`;
}

/**
 * Split showcase → Add block + two "Group" folders (left/right tile), each holding
 * an inner Add block, a Spacer, a Text block and a Button block.
 */
function mapSplitShowcaseGroupNodes(
  blocks: BlockDef[],
  prefix: string,
  sectionAddBlockId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  blocksListKey: string
): SidebarNode[] {
  const flat = mapHeroBlockNodes(blocks, prefix, sectionAddBlockId, values, itemOrder, blocksListKey);
  const sectionAddBlock =
    flat.find((n) => n.kind === 'add-block') ??
    ({ id: sectionAddBlockId, label: 'Add block', kind: 'add-block' } as SidebarNode);
  const byId = new Map(flat.filter((n) => n.kind === 'block').map((n) => [n.id, n]));
  const settingsBase = splitShowcaseSettingsBaseFromPrefix(prefix);

  const asButton = (node: SidebarNode | undefined): SidebarNode | undefined =>
    node ? { ...node, label: 'Button', icon: 'button' as SidebarIcon } : undefined;

  /** Dedicated rich-text "Text" block backed by a per-tile settings namespace. */
  const textNode = (groupKey: string): SidebarNode => {
    const nodeId = `${prefix}:group:${groupKey}:text`;
    const base = `${settingsBase}.${groupKey}Text`;
    const fields = textBlockFieldDefs(base).filter((f) => !f.path.endsWith('.alignment'));
    return {
      id: nodeId,
      label: 'Text',
      kind: 'block',
      icon: 'text',
      childrenListKey: listKeyBlockChildren(nodeId),
      fields,
    };
  };

  const spacerNode = (groupKey: string): SidebarNode => {
    const nodeId = `${prefix}:group:${groupKey}:spacer`;
    return {
      id: nodeId,
      label: 'Spacer',
      kind: 'block',
      icon: 'default',
      childrenListKey: listKeyBlockChildren(nodeId),
      fields: [
        {
          path: `${settingsBase}.${groupKey}SpacerUnit`,
          type: 'string',
          label: 'Unit',
          group: 'Spacer',
          widget: 'segmented',
          options: [
            { value: 'pixel', label: 'Pixel' },
            { value: 'percent', label: 'Percent' },
          ],
          sidebar: true,
        },
        {
          path: `${settingsBase}.${groupKey}SpacerHeight`,
          type: 'number',
          label: 'Size',
          group: 'Spacer',
          widget: 'slider',
          min: 0,
          max: 200,
          step: 1,
          unit: 'px',
          sidebar: true,
        },
        {
          path: `${settingsBase}.${groupKey}SpacerCustomMobile`,
          type: 'boolean',
          label: 'Custom mobile size',
          group: 'Spacer',
          widget: 'toggle',
          sidebar: true,
        },
        {
          path: `${settingsBase}.${groupKey}SpacerMobileHeight`,
          type: 'number',
          label: 'Mobile size',
          group: 'Spacer',
          widget: 'slider',
          min: 0,
          max: 200,
          step: 1,
          unit: 'px',
          sidebar: true,
        },
      ],
    };
  };

  const groupBlockFields = (groupKey: string): EditorFieldDef[] => {
    const fitFillCustom = [
      { value: 'fit', label: 'Fit' },
      { value: 'fill', label: 'Fill' },
      { value: 'custom', label: 'Custom' },
    ];
    const s = (key: string) => `${settingsBase}.${groupKey}Group.${key}`;
    return [
      {
        path: s('direction'),
        type: 'select',
        label: 'Direction',
        group: 'Layout',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ],
      },
      {
        path: s('layoutAlignment'),
        type: 'select',
        label: 'Alignment',
        group: 'Layout',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      {
        path: s('position'),
        type: 'select',
        label: 'Position',
        group: 'Layout',
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'space-between', label: 'Space between' },
          { value: 'space-around', label: 'Space around' },
        ],
      },
      {
        path: s('layoutGap'),
        type: 'number',
        label: 'Gap',
        group: 'Layout',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('width'),
        type: 'select',
        label: 'Width',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: fitFillCustom,
      },
      {
        path: s('customWidth'),
        type: 'number',
        label: 'Custom width',
        group: 'Size',
        widget: 'slider',
        min: 1,
        max: 100,
        step: 1,
        unit: '%',
        sidebar: true,
      },
      {
        path: s('mobileWidth'),
        type: 'select',
        label: 'Mobile width',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: fitFillCustom,
      },
      {
        path: s('mobileCustomWidth'),
        type: 'number',
        label: 'Custom width',
        group: 'Size',
        widget: 'slider',
        min: 1,
        max: 100,
        step: 1,
        unit: '%',
        sidebar: true,
      },
      {
        path: s('height'),
        type: 'select',
        label: 'Height',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: fitFillCustom,
      },
      {
        path: s('customHeight'),
        type: 'number',
        label: 'Custom height',
        group: 'Size',
        widget: 'slider',
        min: 1,
        max: 100,
        step: 1,
        unit: '%',
        sidebar: true,
      },
      {
        path: s('backgroundMedia'),
        type: 'select',
        label: 'Background media',
        group: 'Appearance',
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'image', label: 'Image' },
        ],
      },
      {
        path: s('backgroundImageUrl'),
        type: 'text',
        label: 'Image',
        group: 'Appearance',
        widget: 'image',
        sidebar: true,
        placeholder: 'Paste image URL or upload',
      },
      {
        path: s('backgroundImagePosition'),
        type: 'select',
        label: 'Image position',
        group: 'Appearance',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'cover', label: 'Cover' },
          { value: 'fit', label: 'Fit' },
        ],
      },
      {
        path: s('backgroundOverlay'),
        type: 'boolean',
        label: 'Background overlay',
        group: 'Appearance',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: s('borderStyle'),
        type: 'select',
        label: 'Style',
        group: 'Borders',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'solid', label: 'Solid' },
        ],
      },
      {
        path: s('cornerRadius'),
        type: 'number',
        label: 'Corner radius',
        group: 'Borders',
        widget: 'slider',
        min: 0,
        max: 40,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('link'),
        type: 'text',
        label: 'Link',
        group: 'Block link',
        widget: 'link',
        sidebar: true,
        placeholder: 'Paste a link or search',
      },
      {
        path: s('linkOpenInNewTab'),
        type: 'boolean',
        label: 'Open link in new tab',
        group: 'Block link',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: s('paddingTop'),
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('paddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('paddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: s('paddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
  };

  const buildGroup = (
    groupKey: string,
    buttonNode: SidebarNode | undefined
  ): SidebarNode => {
    const groupId = `${prefix}:group:${groupKey}`;
    const childrenListKey = listKeyBlockChildren(groupId);
    const innerAddBlock: SidebarNode = {
      id: `${groupId}:inner-add-block`,
      label: 'Add block',
      kind: 'add-block',
    };
    const children = reorderSidebarChildren(
      [innerAddBlock, spacerNode(groupKey), textNode(groupKey), buttonNode].filter(
        (n): n is SidebarNode => Boolean(n)
      ),
      childrenListKey,
      itemOrder
    );
    return {
      id: groupId,
      label: 'Group',
      kind: 'block',
      icon: 'group',
      children,
      childrenListKey,
      fields: groupBlockFields(groupKey),
    };
  };

  const group1 = buildGroup('group1', asButton(byId.get(`${prefix}:block:primary_button`)));
  const group2 = buildGroup('group2', asButton(byId.get(`${prefix}:block:secondary_button`)));

  return reorderSidebarChildren([sectionAddBlock, group1, group2], blocksListKey, itemOrder);
}

function readConfigStringAtPath(
  config: Record<string, unknown> | null | undefined,
  path: string
): string {
  let cur: unknown = config;
  for (const part of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : '';
}

/**
 * Hero: Marquee → Add block + Spacer + "Marquee" folder (Add block + Text) + Button.
 * Spacer/Text are settings-backed virtual blocks; Button reuses the real primary_button.
 */
function mapHeroMarqueeGroupNodes(
  blocks: BlockDef[],
  prefix: string,
  sectionAddBlockId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  blocksListKey: string,
  config: Record<string, unknown> | null
): SidebarNode[] {
  const flat = mapHeroBlockNodes(blocks, prefix, sectionAddBlockId, values, itemOrder, blocksListKey);
  const sectionAddBlock =
    flat.find((n) => n.kind === 'add-block') ??
    ({ id: sectionAddBlockId, label: 'Add block', kind: 'add-block' } as SidebarNode);
  const byId = new Map(flat.filter((n) => n.kind === 'block').map((n) => [n.id, n]));
  const settingsBase = splitShowcaseSettingsBaseFromPrefix(prefix);

  const spacerId = `${prefix}:group:spacer:spacer`;
  const spacerNode: SidebarNode = {
    id: spacerId,
    label: 'Spacer',
    kind: 'block',
    icon: 'default',
    childrenListKey: listKeyBlockChildren(spacerId),
    showVisibilityToggle: false,
    showDeleteButton: false,
    fields: [
      {
        path: `${settingsBase}.marqueeSpacerUnit`,
        type: 'select',
        label: 'Unit',
        group: 'Spacer',
        widget: 'segmented',
        options: [
          { value: 'pixel', label: 'Pixel' },
          { value: 'percent', label: 'Percent' },
        ],
        sidebar: true,
      },
      {
        path: `${settingsBase}.marqueeSpacerHeight`,
        type: 'number',
        label: 'Size',
        group: 'Spacer',
        widget: 'slider',
        min: 0,
        max: 200,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.marqueeSpacerCustomMobile`,
        type: 'boolean',
        label: 'Custom mobile size',
        group: 'Spacer',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: `${settingsBase}.marqueeSpacerMobileHeight`,
        type: 'number',
        label: 'Mobile size',
        group: 'Spacer',
        widget: 'slider',
        min: 0,
        max: 200,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ],
  };

  const textId = `${prefix}:group:marquee:text`;
  const textBase = `${settingsBase}.marqueeTextBlock`;
  const textPreview =
    readConfigStringAtPath(config, `${textBase}.settings.text`) ||
    readConfigStringAtPath(config, `${settingsBase}.marqueeText`) ||
    readConfigStringAtPath(config, `${settingsBase}.subtitle`);
  const textNode: SidebarNode = {
    id: textId,
    label: 'Text',
    kind: 'block',
    icon: 'text',
    childrenListKey: listKeyBlockChildren(textId),
    showVisibilityToggle: false,
    showDeleteButton: false,
    fields: textBlockFieldDefs(textBase).filter((f) => !f.path.endsWith('.alignment')),
    preview: textPreview
      ? (() => {
          const plain = textPreview.replace(/<[^>]*>/g, '').trim();
          return plain.length > 28 ? `${plain.slice(0, 28)}…` : plain;
        })()
      : undefined,
  };

  const marqueeId = `${prefix}:marquee`;
  const marqueeChildrenListKey = listKeyBlockChildren(marqueeId);
  const innerAddBlock: SidebarNode = {
    id: `${marqueeId}:inner-add-block`,
    label: 'Add block',
    kind: 'add-block',
  };
  const marqueeFolder: SidebarNode = {
    id: marqueeId,
    label: 'Marquee',
    kind: 'block',
    icon: 'default',
    childrenListKey: marqueeChildrenListKey,
    showVisibilityToggle: false,
    showDeleteButton: false,
    children: reorderSidebarChildren([innerAddBlock, textNode], marqueeChildrenListKey, itemOrder),
    fields: [
      {
        path: `${settingsBase}.marqueeMotionDirection`,
        type: 'select',
        label: 'Motion direction',
        group: 'Layout',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'forward', label: 'Forward' },
          { value: 'reverse', label: 'Reverse' },
        ],
      },
      {
        path: `${settingsBase}.marqueeBackgroundColor`,
        type: 'color',
        label: 'Background color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: `${settingsBase}.marqueeTransparentBg`,
        type: 'boolean',
        label: 'Transparent background',
        group: 'Appearance',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: `${settingsBase}.marqueePaddingTop`,
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.marqueePaddingBottom`,
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.marqueeGap`,
        type: 'number',
        label: 'Gap',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ],
  };

  const buttonRaw = byId.get(`${prefix}:block:primary_button`);
  const buttonNode = buttonRaw
    ? { ...buttonRaw, label: 'Button', icon: 'button' as SidebarIcon }
    : undefined;

  return reorderSidebarChildren(
    [sectionAddBlock, spacerNode, marqueeFolder, buttonNode].filter(
      (n): n is SidebarNode => Boolean(n)
    ),
    blocksListKey,
    itemOrder
  );
}

function fieldPreview(field: EditorFieldDef, values: Record<string, string | boolean>): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (field.type === 'boolean') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function remapFields(
  fields: EditorFieldDef[] | undefined,
  instanceId: string
): EditorFieldDef[] {
  if (!fields?.length) return [];
  const blueprint = layoutBlueprintKey(instanceId);
  if (blueprint === instanceId) return fields;
  return fields.map((field) => ({
    ...field,
    path: remapLayoutSchemaPath(field.path, instanceId),
  }));
}

function remapTemplateFields(
  fields: EditorFieldDef[] | undefined,
  tplId: string,
  instanceId: string
): EditorFieldDef[] {
  if (!fields?.length) return [];
  const blueprint = templateBlueprintKey(instanceId);
  if (blueprint === instanceId) return fields;
  return fields.map((field) => ({
    ...field,
    path: remapTemplateSchemaPath(field.path, tplId, instanceId),
  }));
}

/** Load section settings field defs from the editor schema when the sidebar node has none. */
export function sectionSettingsFieldsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) {
    const instanceId = layout[1];
    const blueprint = layoutBlueprintKey(instanceId);
    const sec = editorSchema.layout?.[blueprint];
    if (!sec?.settingsFields?.length) return [];
    return remapFields(sec.settingsFields, instanceId);
  }

  const tpl = nodeId.match(/^template:([^:]+):(.+)$/);
  if (tpl) {
    const [, tplId, instanceId] = tpl;
    const blueprint = templateBlueprintKey(instanceId);
    const template = editorSchema.templates?.find((t) => t.id === tplId);
    const sec = template?.sections?.find((s) => (s.id ?? '') === blueprint);
    if (!sec?.settingsFields?.length) return [];
    return remapTemplateFields(sec.settingsFields, tplId, instanceId);
  }

  return [];
}

/** Map index template hero schema paths → layout footer hero instance (`sections.{id}.*`). */
function remapTemplateHeroToLayoutFields(
  fields: EditorFieldDef[] | undefined,
  instanceId: string
): EditorFieldDef[] {
  if (!fields?.length) return [];
  const from = 'templates.index.sections.hero_main';
  const to = `sections.${instanceId}`;
  return fields.map((field) => ({
    ...field,
    path: field.path.startsWith(from) ? `${to}${field.path.slice(from.length)}` : field.path,
  }));
}

function remapTemplateHeroBlockToLayout(block: BlockDef, instanceId: string): BlockDef {
  const settingsFields = remapTemplateHeroToLayoutFields(block.settingsFields, instanceId);
  return {
    ...block,
    settingsFields: settingsFields.length ? settingsFields : undefined,
    blocks: block.blocks?.map((child) => remapTemplateHeroBlockToLayout(child, instanceId)),
  };
}

function remapTemplateBlockDef(block: BlockDef, tplId: string, instanceId: string): BlockDef {
  const settingsFields = remapTemplateFields(block.settingsFields, tplId, instanceId);
  return {
    ...block,
    settingsFields: settingsFields.length ? settingsFields : undefined,
    blocks: block.blocks?.map((child) => remapTemplateBlockDef(child, tplId, instanceId)),
  };
}

function remapBlockDef(block: BlockDef, instanceId: string): BlockDef {
  const settingsFields = remapFields(block.settingsFields, instanceId);
  return {
    ...block,
    settingsFields: settingsFields.length ? settingsFields : undefined,
    blocks: block.blocks?.map((child) => remapBlockDef(child, instanceId)),
  };
}

/** Leaf field rows under a section or block (Shopify-style). */
function mapFieldNodes(
  fields: EditorFieldDef[] | undefined,
  values: Record<string, string | boolean>
): SidebarNode[] {
  const visible = (fields ?? []).filter((f) => f.sidebar !== false);
  if (!visible.length) return [];
  return visible.map((field) => ({
    id: `field:${field.path}`,
    label: field.label,
    kind: 'field' as const,
    icon: iconForFieldLabel(field.label, field.path, field.type),
    fields: [field],
    preview: fieldPreview(field, values),
  }));
}

function blockChildren(
  block: BlockDef,
  prefix: string,
  blockId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  options?: { showInnerAddBlock?: boolean; innerAddBlockPlacement?: 'both' | 'top' | 'bottom' }
): { children: SidebarNode[]; childrenListKey: string } {
  const showInnerAddBlock = options?.showInnerAddBlock !== false;
  const addBlockPlacement = options?.innerAddBlockPlacement ?? 'both';
  const blockPrefix = `${prefix}:block:${blockId}`;
  const childrenListKey = listKeyBlockChildren(blockPrefix);
  const innerAddBlockId = `${blockPrefix}:inner-add-block`;

  const hasPanelFieldsOnBlock =
    prefix.startsWith('template:') && Boolean(block.blocks?.length) && (block.settingsFields?.length ?? 0) > 0;
  const fieldNodes = hasPanelFieldsOnBlock ? [] : mapFieldNodes(block.settingsFields, values);
  const nestedListKey = listKeyBlockChildren(`${blockPrefix}:nested`);
  const nestedBlocks: SidebarNode[] = (block.blocks ?? []).map((child) => {
    const nestedId = child.id ?? child.label ?? 'nested';
    const nestedPrefix = `${blockPrefix}:nested:${nestedId}`;
    const nestedPanelFields = child.settingsFields?.length ? child.settingsFields : undefined;
    const nestedFieldRows = nestedPanelFields ? [] : mapFieldNodes(child.settingsFields, values);
    return {
      id: nestedPrefix,
      label: child.label ?? nestedId,
      kind: 'block' as const,
      icon: iconForBlockLabel(child.label ?? nestedId),
      fields: nestedPanelFields,
      children: nestedFieldRows.length ? nestedFieldRows : undefined,
      childrenListKey: listKeyBlockChildren(nestedPrefix),
    };
  });
  const orderedNested = reorderSidebarChildren(nestedBlocks, nestedListKey, itemOrder);

  const addBlockRow: SidebarNode = { id: innerAddBlockId, label: 'Add block', kind: 'add-block' };
  const addBlockRows =
    !showInnerAddBlock
      ? []
      : addBlockPlacement === 'top'
        ? [addBlockRow]
        : addBlockPlacement === 'bottom'
          ? [addBlockRow]
          : [addBlockRow, addBlockRow];
  const merged = reorderSidebarChildren(
    addBlockPlacement === 'bottom'
      ? [...fieldNodes, ...orderedNested, ...addBlockRows]
      : [...addBlockRows, ...fieldNodes, ...orderedNested],
    childrenListKey,
    itemOrder
  );

  return { children: merged, childrenListKey };
}

/** Section blocks with expandable field children under each block. */
function mapBlockNodes(
  blocks: BlockDef[],
  prefix: string,
  sectionAddBlockId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  blocksListKey: string,
  options?: { innerAddBlockPlacement?: 'both' | 'top' | 'bottom' }
): SidebarNode[] {
  const blockNodes: SidebarNode[] = blocks.map((block) => {
    const blockId = block.id ?? block.label ?? 'block';
    const { children, childrenListKey } = blockChildren(block, prefix, blockId, values, itemOrder, {
      innerAddBlockPlacement: options?.innerAddBlockPlacement,
    });
    const layoutInstance = prefix.startsWith('layout:') ? prefix.slice('layout:'.length) : '';
    const blockSettingsFields = layoutInstance
      ? remapFields(block.settingsFields, layoutInstance)
      : (block.settingsFields ?? []);

    return {
      id: `${prefix}:block:${blockId}`,
      label: block.label ?? blockId,
      kind: 'block' as const,
      icon: iconForBlockLabel(block.label ?? blockId),
      fields: blockSettingsFields.length ? blockSettingsFields : undefined,
      showVisibilityToggle: true,
      showDeleteButton: true,
      children: children.length ? children : undefined,
      childrenListKey,
    };
  });

  const addBlock: SidebarNode = { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([...blockNodes, addBlock], blocksListKey, itemOrder);
}

/**
 * Slideshow: Inset — Add block → Slide (folder) → Add block / Heading / Text / Button.
 * Config-driven so every slide instance (slide_1, slide_2, …) becomes its own folder,
 * with the heading/body/button surfaced as nested blocks (Shopify-style).
 */
function mapSlideshowInsetBlockNodes(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  blockOrderPath: string[],
  layoutGroupLabel: string = 'Layout'
): SidebarNode[] {
  const sectionAddBlock: SidebarNode = {
    id: `${prefix}:add-block`,
    label: 'Add block',
    kind: 'add-block',
  };

  const order = readConfigBlockOrder(config, blockOrderPath) ?? [];
  const blocksObject = readConfigAtPath(config, [...blockOrderPath.slice(0, -1), 'blocks']);
  const blocksRecord =
    blocksObject && typeof blocksObject === 'object' && !Array.isArray(blocksObject)
      ? (blocksObject as Record<string, unknown>)
      : {};
  const ids = (order.length ? order : Object.keys(blocksRecord)).filter((id) => {
    const block = blocksRecord[id] as { type?: string } | undefined;
    return !block?.type || block.type === 'slideshow-slide';
  });

  const slideNodes: SidebarNode[] = ids.map((slideId) => {
    const slideNodeId = `${prefix}:block:${slideId}`;
    const settingsBase = `${blocksBase}.${slideId}.settings`;
    const childrenListKey = listKeyBlockChildren(slideNodeId);

    const titleField: EditorFieldDef = {
      path: `${settingsBase}.title`,
      type: 'text',
      label: 'Heading',
      sidebar: true,
    };
    const bodyField: EditorFieldDef = {
      path: `${settingsBase}.body`,
      type: 'textarea',
      label: 'Text',
      sidebar: true,
    };
    const buttonLabelField: EditorFieldDef = {
      path: `${settingsBase}.buttonLabel`,
      type: 'text',
      label: 'Label',
      sidebar: true,
    };
    const buttonHrefField: EditorFieldDef = {
      path: `${settingsBase}.buttonHref`,
      type: 'text',
      label: 'Link',
      sidebar: true,
    };

    const slideOwnFields: EditorFieldDef[] = [
      {
        path: `${settingsBase}.mediaType`,
        type: 'select',
        label: 'Type',
        group: 'Media',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
        ],
      },
      {
        path: `${settingsBase}.imageUrl`,
        type: 'text',
        label: 'Image',
        group: 'Media',
        widget: 'image',
        sidebar: true,
      },
      {
        path: `${settingsBase}.videoUrl`,
        type: 'text',
        label: 'Video URL',
        group: 'Media',
        sidebar: true,
      },
      {
        path: `${settingsBase}.direction`,
        type: 'select',
        label: 'Direction',
        group: layoutGroupLabel,
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
        ],
      },
      {
        path: `${settingsBase}.alignment`,
        type: 'select',
        label: 'Alignment',
        group: layoutGroupLabel,
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      {
        path: `${settingsBase}.position`,
        type: 'select',
        label: 'Position',
        group: layoutGroupLabel,
        widget: 'select-inline',
        sidebar: true,
        options: [
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'bottom', label: 'Bottom' },
        ],
      },
      {
        path: `${settingsBase}.gap`,
        type: 'number',
        label: 'Gap',
        group: layoutGroupLabel,
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.backgroundColor`,
        type: 'color',
        label: 'Background color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: `${settingsBase}.mediaOverlay`,
        type: 'boolean',
        label: 'Media overlay',
        group: 'Appearance',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: `${settingsBase}.paddingTop`,
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.paddingBottom`,
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.paddingLeft`,
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.paddingRight`,
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];

    const innerAddBlock: SidebarNode = {
      id: `${slideNodeId}:inner-add-block`,
      label: 'Add block',
      kind: 'add-block',
    };
    const headingFields: EditorFieldDef[] = [
      {
        path: `${settingsBase}.title`,
        type: 'textarea',
        label: 'Text',
        group: 'Text',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingWidth`,
        type: 'select',
        label: 'Width',
        group: 'Layout',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
        ],
      },
      {
        path: `${settingsBase}.headingMaxWidth`,
        type: 'select',
        label: 'Max width',
        group: 'Layout',
        widget: 'select',
        sidebar: true,
        options: [
          { value: 'narrow', label: 'Narrow' },
          { value: 'normal', label: 'Normal' },
          { value: 'none', label: 'None' },
        ],
      },
      {
        path: `${settingsBase}.headingAlignment`,
        type: 'select',
        label: 'Alignment',
        group: 'Layout',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      {
        path: `${settingsBase}.headingTypographyPreset`,
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select',
        description: 'Edit presets in theme settings',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingColor`,
        type: 'select',
        label: 'Text color',
        group: 'Appearance',
        widget: 'select',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingBackgroundEnabled`,
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingBackgroundColor`,
        type: 'color',
        label: 'Background color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingCornerRadius`,
        type: 'number',
        label: 'Corner radius',
        group: 'Appearance',
        widget: 'slider',
        min: 0,
        max: 40,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingPaddingTop`,
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingPaddingBottom`,
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingPaddingLeft`,
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.headingPaddingRight`,
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
    const headingNode: SidebarNode = {
      id: `${slideNodeId}:nested:slide_heading`,
      label: 'Heading',
      kind: 'block',
      icon: 'text',
      preview: fieldPreview(titleField, values),
      fields: headingFields,
    };
    const textFields: EditorFieldDef[] = [
      {
        path: `${settingsBase}.body`,
        type: 'textarea',
        label: 'Text',
        group: 'Text',
        widget: 'richtext',
        sidebar: true,
      },
      {
        path: `${settingsBase}.bodyWidth`,
        type: 'select',
        label: 'Width',
        group: 'Layout',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
        ],
      },
      {
        path: `${settingsBase}.bodyMaxWidth`,
        type: 'select',
        label: 'Max width',
        group: 'Layout',
        widget: 'select',
        sidebar: true,
        options: [
          { value: 'narrow', label: 'Narrow' },
          { value: 'normal', label: 'Normal' },
          { value: 'none', label: 'None' },
        ],
      },
      {
        path: `${settingsBase}.bodyTypographyPreset`,
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select',
        description: 'Edit presets in theme settings',
        sidebar: true,
        options: [
          { value: 'default', label: 'Default' },
          { value: 'paragraph', label: 'Paragraph' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        path: `${settingsBase}.bodyColor`,
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
        sidebar: true,
      },
      {
        path: `${settingsBase}.bodyBackgroundEnabled`,
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: `${settingsBase}.bodyPaddingTop`,
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.bodyPaddingBottom`,
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.bodyPaddingLeft`,
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
      {
        path: `${settingsBase}.bodyPaddingRight`,
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 80,
        step: 1,
        unit: 'px',
        sidebar: true,
      },
    ];
    const textNode: SidebarNode = {
      id: `${slideNodeId}:nested:slide_text`,
      label: 'Text',
      kind: 'block',
      icon: 'text',
      preview: fieldPreview(bodyField, values),
      fields: textFields,
    };
    const buttonFields: EditorFieldDef[] = [
      buttonLabelField,
      { ...buttonHrefField, widget: 'link' },
      {
        path: `${settingsBase}.buttonOpenInNewTab`,
        type: 'boolean',
        label: 'Open link in new tab',
        widget: 'toggle',
        sidebar: true,
      },
      {
        path: `${settingsBase}.buttonStyle`,
        type: 'select',
        label: 'Style',
        widget: 'select',
        sidebar: true,
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'link', label: 'Link' },
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        path: `${settingsBase}.buttonLinkTextColor`,
        type: 'color',
        label: 'Link text color',
        widget: 'color',
        sidebar: true,
      },
      {
        path: `${settingsBase}.buttonCustomBackground`,
        type: 'color',
        label: 'Background',
        widget: 'color',
        sidebar: true,
      },
      {
        path: `${settingsBase}.buttonCustomText`,
        type: 'color',
        label: 'Text',
        widget: 'color',
        sidebar: true,
      },
      {
        path: `${settingsBase}.buttonDesktopWidth`,
        type: 'select',
        label: 'Desktop width',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        path: `${settingsBase}.buttonDesktopCustomWidth`,
        type: 'number',
        label: 'Width',
        group: 'Size',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: '%',
        sidebar: true,
      },
      {
        path: `${settingsBase}.buttonMobileWidth`,
        type: 'select',
        label: 'Mobile width',
        group: 'Size',
        widget: 'segmented',
        sidebar: true,
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        path: `${settingsBase}.buttonMobileCustomWidth`,
        type: 'number',
        label: 'Width',
        group: 'Size',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: '%',
        sidebar: true,
      },
    ];
    const buttonNode: SidebarNode = {
      id: `${slideNodeId}:nested:slide_button`,
      label: 'Button',
      kind: 'block',
      icon: 'button',
      fields: buttonFields,
    };
    const children = reorderSidebarChildren(
      [innerAddBlock, headingNode, textNode, buttonNode],
      childrenListKey,
      itemOrder
    );

    return {
      id: slideNodeId,
      label: 'Slide',
      kind: 'block' as const,
      icon: 'image' as const,
      fields: slideOwnFields,
      children,
      childrenListKey,
      showVisibilityToggle: true,
      showDeleteButton: true,
    };
  });

  return reorderSidebarChildren([sectionAddBlock, ...slideNodes], sectionChildrenListKey, itemOrder);
}

function layoutCatalogVariantFromValues(
  values: Record<string, string | boolean>,
  instanceId: string
): string {
  const raw = values[`sections.${instanceId}.settings.catalogVariant`];
  return typeof raw === 'string' ? raw : '';
}

function layoutSectionNode(
  instanceId: string,
  sec: LayoutSectionDef,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  config: Record<string, unknown> | null = null
): SidebarNode {
  const id = `layout:${instanceId}`;
  const remappedFields = remapFields(sec.settingsFields, instanceId);
  const remappedBlocks = sec.blocks?.map((b) => remapBlockDef(b, instanceId));
  const previewField = remappedFields.find((f) => f.type === 'text' || f.type === 'textarea');
  const isAnnouncement = layoutBlueprintKey(instanceId) === 'announcement_bar';
  const isHeader = layoutBlueprintKey(instanceId) === 'header';
  const isDivider = layoutBlueprintKey(instanceId) === 'divider';
  const isFeaturedCollectionLayout = sec.type === 'featured-collection';
  const isCustomSectionLayout = layoutBlueprintKey(instanceId) === 'custom_section';
  const isProductHighlightLayout = layoutBlueprintKey(instanceId) === 'product_highlight';
  const isEditorialLayout = layoutBlueprintKey(instanceId) === 'editorial';
  const isStorytellingCarouselLayout = layoutBlueprintKey(instanceId) === 'storytelling_carousel';
  const isBlogPostsGridLayout = layoutBlueprintKey(instanceId) === 'blog_posts_grid';
  const isBlogPostsEditorialLayout = layoutBlueprintKey(instanceId) === 'blog_posts_editorial';
  const isBlogPostsCarouselLayout = layoutBlueprintKey(instanceId) === 'blog_posts_carousel';
  const isEditorialJumboLayout = layoutBlueprintKey(instanceId) === 'editorial_jumbo';
  const isImageCompareLayout = layoutBlueprintKey(instanceId) === 'image_compare';
  const isImageWithTextLayout = layoutBlueprintKey(instanceId) === 'image_with_text';
  const isStorytellingLogoLayout = layoutBlueprintKey(instanceId) === 'storytelling_logo';
  const isStorytellingVideoLayout = layoutBlueprintKey(instanceId) === 'storytelling_video';
  const isFaqLayout = layoutBlueprintKey(instanceId) === 'faq_section';
  const isIconsWithTextLayout = layoutBlueprintKey(instanceId) === 'icons_with_text';
  const isMulticolumnLayout = layoutBlueprintKey(instanceId) === 'multicolumn_section';
  const isPullQuoteLayout = layoutBlueprintKey(instanceId) === 'pull_quote_section';
  const isRichTextLayout = layoutBlueprintKey(instanceId) === 'rich_text_section';
  const isTextMarqueeLayout = layoutBlueprintKey(instanceId) === 'text_marquee_section';
  const isContactFormLayout = layoutBlueprintKey(instanceId) === 'contact_form';
  const isEmailSignupLayout = layoutBlueprintKey(instanceId) === 'email_signup';
  const layoutCatalogVariant = layoutCatalogVariantFromValues(values, instanceId);
  const isProductHotspotsLayout = isProductHotspotsSectionType(sec.type, layoutCatalogVariant);
  const isRecommendedProductsLayout = isRecommendedProductsSectionType(sec.type, layoutCatalogVariant);
  const isCollectionListBentoLayout = isCollectionListBentoSectionType(sec.type, layoutCatalogVariant);
  const isCollectionListCarouselLayout = isCollectionListCarouselSectionType(sec.type, layoutCatalogVariant);
  const isCollectionListEditorialLayout = isCollectionListEditorialSectionType(sec.type, layoutCatalogVariant);
  const isCollectionListGridLayout = isCollectionListGridSectionType(sec.type, layoutCatalogVariant);
  const isFooter = layoutBlueprintKey(instanceId) === 'footer';
  const isFooterUtilities = layoutBlueprintKey(instanceId) === 'footer_utilities';
  const utilitiesVariant = isFooterUtilities ? layoutCatalogVariantFromValues(values, instanceId) : '';
  const productHighlightCatalogVariant = isProductHighlightLayout
    ? layoutCatalogVariantFromValues(values, instanceId)
    : '';
  const utilitiesBlocks =
    isFooterUtilities && utilitiesVariant === 'policies-links'
      ? remappedBlocks?.filter(
          (b) => b.id === 'copyright' || b.id === 'policy_links' || b.id === 'social'
        )
      : remappedBlocks;

  const sectionFields =
    isAnnouncement ||
    isHeader ||
    isDivider ||
    isCustomSectionLayout ||
    isProductHighlightLayout ||
    isEditorialLayout ||
    isStorytellingCarouselLayout ||
    isBlogPostsGridLayout ||
    isBlogPostsEditorialLayout ||
    isBlogPostsCarouselLayout ||
    isEditorialJumboLayout ||
    isImageCompareLayout ||
    isImageWithTextLayout ||
    isStorytellingLogoLayout ||
    isStorytellingVideoLayout ||
    isFaqLayout ||
    isIconsWithTextLayout ||
    isMulticolumnLayout ||
    isPullQuoteLayout ||
    isRichTextLayout ||
    isTextMarqueeLayout ||
    isContactFormLayout ||
    isEmailSignupLayout ||
    isProductHotspotsLayout ||
    isRecommendedProductsLayout ||
    isCollectionListBentoLayout ||
    isCollectionListCarouselLayout ||
    isCollectionListEditorialLayout ||
    isCollectionListGridLayout ||
    isFooter ||
    isFooterUtilities
      ? []
      : mapFieldNodes(remappedFields, values);
  const layoutChildrenKey = listKeyLayoutSectionChildren(instanceId);
  let blockNodes = utilitiesBlocks?.length
    ? mapBlockNodes(
        utilitiesBlocks,
        id,
        `${id}:add-block`,
        values,
        itemOrder,
        listKeyLayoutBlocks(instanceId),
        isFeaturedCollectionLayout ? { innerAddBlockPlacement: 'top' } : undefined
      )
    : [];
  if (isFaqLayout) {
    const blocksBase = `sections.${instanceId}.blocks`;
    const addBlock: SidebarNode = { id: `${id}:add-block`, label: 'Add block', kind: 'add-block' };
    blockNodes = reorderSidebarChildren(
      [
        addBlock,
        ...mapFaqBlockNodes(
          id,
          blocksBase,
          values,
          itemOrder,
          layoutChildrenKey,
          config,
          null,
          instanceId
        ),
      ],
      layoutChildrenKey,
      itemOrder
    );
  } else if (
    isProductHighlightLayout &&
    !isFeaturedProductSectionType(sec.type, productHighlightCatalogVariant) &&
    isProductHighlightSectionType(sec.type, productHighlightCatalogVariant)
  ) {
    blockNodes = mapProductHighlightBlockNodes(
      id,
      `sections.${instanceId}.blocks`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      null,
      instanceId
    );
  } else if (isIconsWithTextLayout) {
    blockNodes = mapIconsWithTextBlockNodes(
      id,
      `sections.${instanceId}.blocks`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      null,
      instanceId
    );
  } else if (isMulticolumnLayout) {
    blockNodes = mapMulticolumnBlockNodes(
      id,
      `sections.${instanceId}`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      null,
      instanceId
    );
  } else if (isRichTextLayout) {
    blockNodes = mapRichTextBlockNodes(
      id,
      `sections.${instanceId}`,
      values,
      itemOrder,
      layoutChildrenKey,
      config
    );
  } else if (isTextMarqueeLayout) {
    blockNodes = mapTextMarqueeBlockNodes(
      id,
      `sections.${instanceId}`,
      values,
      itemOrder,
      layoutChildrenKey
    );
  } else if (isPullQuoteLayout) {
    blockNodes = mapPullQuoteBlockNodes(
      id,
      `sections.${instanceId}`,
      values,
      itemOrder,
      layoutChildrenKey
    );
  } else if (isStorytellingVideoLayout) {
    blockNodes = mapStorytellingVideoBlockNodes(id, values, itemOrder, layoutChildrenKey);
  } else if (isContactFormLayout) {
    blockNodes = mapContactFormBlockNodes(id, values, itemOrder, layoutChildrenKey);
  } else if (isEmailSignupLayout) {
    blockNodes = mapEmailSignupBlockNodes(id, values, itemOrder, layoutChildrenKey);
  } else if (isImageCompareLayout) {
    blockNodes = mapImageCompareBlockNodes(id, values, itemOrder, layoutChildrenKey);
  } else if (isEditorialJumboLayout) {
    blockNodes = mapEditorialJumboBlockNodes(id, values, itemOrder, layoutChildrenKey);
  } else if (isEditorialLayout) {
    blockNodes = mapEditorialBlockNodes(id, values, itemOrder, layoutChildrenKey);
  } else if (isStorytellingCarouselLayout) {
    blockNodes = mapStorytellingCarouselBlockNodes(
      id,
      `sections.${instanceId}.blocks`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      ['sections', instanceId, 'block_order']
    );
  } else if (isBlogPostsGridLayout) {
    blockNodes = mapBlogPostsGridBlockNodes(
      id,
      `sections.${instanceId}.blocks`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      ['sections', instanceId, 'block_order']
    );
  } else if (isBlogPostsEditorialLayout) {
    blockNodes = mapBlogPostsEditorialBlockNodes(
      id,
      `sections.${instanceId}.blocks`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      ['sections', instanceId, 'block_order']
    );
  } else if (isBlogPostsCarouselLayout) {
    blockNodes = mapBlogPostsCarouselBlockNodes(
      id,
      `sections.${instanceId}.blocks`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      ['sections', instanceId, 'block_order']
    );
  } else if (isImageWithTextLayout) {
    blockNodes = mapImageWithTextBlockNodes(id, values, itemOrder, layoutChildrenKey);
  } else if (isProductHotspotsLayout) {
    blockNodes = mapProductHotspotsBlockNodes(
      id,
      `sections.${instanceId}.settings`,
      `sections.${instanceId}.blocks`,
      values,
      config,
      ['sections', instanceId, 'block_order']
    );
  } else if (isRecommendedProductsLayout) {
    blockNodes = mapRecommendedProductsBlockNodes(
      id,
      `sections.${instanceId}.settings`,
      values,
      itemOrder,
      layoutChildrenKey
    );
  } else if (
    isCollectionListBentoLayout ||
    isCollectionListCarouselLayout ||
    isCollectionListEditorialLayout ||
    isCollectionListGridLayout
  ) {
    blockNodes = mapCollectionListBlockNodes(
      id,
      `sections.${instanceId}.settings`,
      `sections.${instanceId}.blocks`,
      values,
      itemOrder,
      layoutChildrenKey
    );
  }
  if (isAnnouncement && remappedBlocks?.length) {
    blockNodes = mapAnnouncementBlockNodes(
      remappedBlocks,
      id,
      `${id}:add-block`,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      instanceId
    );
  }
  if (isHeader && remappedBlocks?.length) {
    blockNodes = mapHeaderBlockNodes(
      remappedBlocks,
      id,
      values,
      itemOrder,
      layoutChildrenKey,
      config,
      instanceId
    );
  }
  if (isFooterUtilities) {
    const addBlockId = `${id}:add-block`;
    const addBlockNode = blockNodes.find((n) => n.id === addBlockId);
    const activeUtilityIds = new Set(
      (readConfigBlockOrder(config, ['sections', instanceId, 'block_order']) ?? []).filter((b) =>
        ['copyright', 'policy_links', 'social'].includes(b)
      )
    );
    const utilityTotal = 3;
    const utilityCount = activeUtilityIds.size;
    if (addBlockNode) {
      blockNodes = [
        {
          ...addBlockNode,
          label: `Add block (${utilityCount}/${utilityTotal})`,
          disabled: utilityCount >= utilityTotal,
        },
        ...blockNodes.filter((n) => n.id !== addBlockId),
      ];
    }
  }
  const children = reorderSidebarChildren(
    isAnnouncement ||
      isHeader ||
      isFaqLayout ||
      (isProductHighlightLayout &&
        !isFeaturedProductSectionType(sec.type, productHighlightCatalogVariant) &&
        isProductHighlightSectionType(sec.type, productHighlightCatalogVariant)) ||
      isIconsWithTextLayout ||
      isMulticolumnLayout ||
      isRichTextLayout ||
      isTextMarqueeLayout ||
      isPullQuoteLayout ||
      isStorytellingVideoLayout ||
      isContactFormLayout ||
      isEmailSignupLayout ||
      isProductHotspotsLayout ||
      isRecommendedProductsLayout ||
      isImageCompareLayout ||
      isEditorialJumboLayout ||
      isEditorialLayout ||
      isStorytellingCarouselLayout ||
    isBlogPostsGridLayout ||
    isBlogPostsEditorialLayout ||
    isBlogPostsCarouselLayout ||
      isImageWithTextLayout ||
      isCollectionListBentoLayout ||
      isCollectionListCarouselLayout ||
      isCollectionListEditorialLayout ||
      isCollectionListGridLayout
      ? blockNodes
      : [...sectionFields, ...blockNodes],
    layoutChildrenKey,
    itemOrder
  );

  return {
    id,
    label: isFooterUtilities
      ? footerUtilitiesSidebarLabel(utilitiesVariant, sec.label ?? 'Utilities')
      : isCustomSectionLayout
        ? 'Custom section'
        : isDivider
          ? 'Divider'
          : isHeader
            ? 'Header'
            : isRecommendedProductsSectionType(sec.type, layoutCatalogVariant)
              ? 'Recommended products'
              : isProductHotspotsSectionType(sec.type, layoutCatalogVariant)
                ? 'Product hotspots'
                : isFeaturedProductSectionType(sec.type, productHighlightCatalogVariant)
                  ? 'Featured product'
              : isProductHighlightLayout ||
                  isProductHighlightSectionType(sec.type, productHighlightCatalogVariant)
                ? productHighlightSidebarLabel(
                    productHighlightCatalogVariant,
                    'Product highlight'
                  )
                  : isEditorialLayout
                    ? 'Editorial'
                    : isStorytellingCarouselLayout
                      ? 'Carousel'
                      : isBlogPostsGridLayout
                        ? 'Blog posts: Grid'
                      : isBlogPostsEditorialLayout
                        ? 'Blog posts: Editorial'
                      : isBlogPostsCarouselLayout
                        ? 'Blog posts: Carousel'
                      : isEditorialJumboLayout
                        ? 'Editorial: Jumbo text'
                        : isImageCompareLayout
                  ? 'Image compare'
                  : isImageWithTextLayout
                    ? 'Image with text'
                    : isStorytellingLogoLayout
                      ? 'Logo'
                      : isStorytellingVideoLayout
                        ? 'Video'
                        : isFaqLayout
                          ? 'FAQ'
                          : isIconsWithTextLayout
                            ? 'Icons with text'
                            : isMulticolumnLayout
                              ? 'Multicolumn'
                              : isPullQuoteLayout
                                ? 'Pull quote'
                                : isRichTextLayout
                                  ? 'Rich text'
                                  : isTextMarqueeLayout
                                    ? 'Marquee'
                                    : isContactFormLayout
                                      ? 'Contact form'
                                    : isEmailSignupLayout
                                      ? 'Email signup'
                                    : isProductHotspotsLayout
                                      ? 'Product hotspots'
                                    : isCollectionListBentoLayout
                                      ? 'Collection list: Bento'
                                    : isCollectionListCarouselLayout
                                      ? 'Collection list: Carousel'
                                    : isCollectionListEditorialLayout
                                      ? 'Collection list: Editorial'
                                    : isCollectionListGridLayout
                                      ? 'Collection list: Grid'
                                      : sec.label ?? instanceId,
    kind: 'section',
    icon: 'section',
    fields: isHeader
      ? collectHeaderPanelFieldDefs(sec, instanceId, remapFields)
      : isAnnouncement
        ? collectAnnouncementPanelFieldDefs(sec, instanceId)
      : isFooter
        ? collectFooterPanelFieldDefs(sec, instanceId, remapFields)
        : isFooterUtilities
          ? collectFooterUtilitiesPanelFieldDefs(sec, instanceId, remapFields)
          : isFaqLayout
            ? undefined
            : remappedFields.length
              ? remappedFields
              : undefined,
    preview: previewField ? fieldPreview(previewField, values) : undefined,
    children: children.length ? children : undefined,
    childrenListKey: layoutChildrenKey,
    showVisibilityToggle: true,
    showDeleteButton: canDeleteLayoutSection(instanceId),
  };
}

function layoutHeroSectionNode(
  instanceId: string,
  sec: NonNullable<NonNullable<EditorSchemaDoc['templates']>[0]['sections']>[0],
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  config: Record<string, unknown> | null
): SidebarNode {
  const prefix = `layout:${instanceId}`;
  const settingsBase = `sections.${instanceId}.settings`;
  const blocksBase = `sections.${instanceId}.blocks`;
  const childrenListKey = listKeyLayoutSectionChildren(instanceId);

  if (isHeroBottomAlignedSectionConfig(config, settingsBase, blocksBase)) {
    const children = mapBottomAlignedHeroSidebarNodes(
      prefix,
      blocksBase,
      values,
      itemOrder,
      childrenListKey
    );
    return {
      id: prefix,
      label: 'Hero: Bottom aligned',
      kind: 'section',
      icon: 'section',
      children: children.length ? children : undefined,
      childrenListKey,
      showVisibilityToggle: true,
      showDeleteButton: canDeleteLayoutSection(instanceId),
    };
  }

  const remappedSectionFields = remapTemplateHeroToLayoutFields(sec.settingsFields, instanceId);
  const remappedBlocks = withHeroCatalogBlocks(
    sec.blocks?.map((b) => remapTemplateHeroBlockToLayout(b, instanceId)),
    readCatalogVariant(config, settingsBase),
    blocksBase
  );
  const catalogVariant = readCatalogVariant(config, settingsBase);
  const visibleBlocks = remappedBlocks.length
    ? filterHeroBlocksForSidebar(
        remappedBlocks,
        config,
        ['sections', instanceId, 'block_order'],
        catalogVariant
      )
    : [];

  const blockNodes = visibleBlocks.length
    ? catalogVariant === 'split-showcase'
      ? mapSplitShowcaseGroupNodes(visibleBlocks, prefix, `${prefix}:add-block`, values, itemOrder, childrenListKey)
      : catalogVariant === 'hero-marquee'
        ? mapHeroMarqueeGroupNodes(
            visibleBlocks,
            prefix,
            `${prefix}:add-block`,
            values,
            itemOrder,
            childrenListKey,
            config
          )
        : mapHeroBlockNodes(visibleBlocks, prefix, `${prefix}:add-block`, values, itemOrder, childrenListKey)
    : [];

  const children = reorderSidebarChildren(blockNodes, childrenListKey, itemOrder);

  return {
    id: prefix,
    label: heroSectionSidebarLabel(catalogVariant, sec.label ?? 'Hero'),
    kind: 'section',
    icon: 'section',
    fields: undefined,
    children: children.length ? children : undefined,
    childrenListKey,
    showVisibilityToggle: true,
    showDeleteButton: canDeleteLayoutSection(instanceId),
  };
}

function sectionToNode(
  sec: NonNullable<NonNullable<EditorSchemaDoc['templates']>[0]['sections']>[0],
  tplId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  instanceId?: string,
  config: Record<string, unknown> | null = null,
  editorSchema?: EditorSchemaDoc | null
): SidebarNode {
  const blueprintId = sec.id ?? 'section';
  const secId = instanceId ?? blueprintId;
  const prefix = `template:${tplId}:${secId}`;
  const childrenListKey = listKeySectionChildren(tplId, secId);
  const settingsBase = `templates.${tplId}.sections.${secId}.settings`;
  const blocksBase = `templates.${tplId}.sections.${secId}.blocks`;
  const catalogVariantEarly = readCatalogVariant(config, settingsBase);
  const isFeaturedCollection = sec.type === 'featured-collection';
  const featuredCollectionLayoutType = isFeaturedCollection
    ? readFeaturedCollectionLayoutType(config, settingsBase)
    : '';
  const featuredCollectionCatalogVariant = isFeaturedCollection
    ? readFeaturedCollectionCatalogVariant(config, settingsBase)
    : '';
  const isFeaturedCollectionGrouped = isFeaturedCollectionGroupedPanelSectionType(
    sec.type,
    catalogVariantEarly
  );
  const isHero = sec.type === 'hero' || sec.id === 'hero_main';
  const isNotFoundMain = sec.type === 'not-found-main' || sec.id === 'not_found_main';
  const isDivider = sec.type === 'divider';
  const isContactForm = isContactFormSectionType(sec.type, catalogVariantEarly);
  const isEmailSignup = isEmailSignupSectionType(sec.type, catalogVariantEarly);
  const isCustomSection = isCustomSectionType(sec.type, catalogVariantEarly);
  const isFeaturedProduct = isFeaturedProductSectionType(sec.type, catalogVariantEarly);
  const isProductMain = isProductMainSectionType(sec.type);
  const isProductHighlight =
    !isFeaturedProduct && isProductHighlightSectionType(sec.type, catalogVariantEarly);
  const isEditorial = isEditorialSectionType(sec.type, catalogVariantEarly);
  const isEditorialJumbo = isEditorialJumboSectionType(sec.type, catalogVariantEarly);
  const isImageCompare = isImageCompareSectionType(sec.type, catalogVariantEarly);
  const isImageWithText = isImageWithTextSectionType(sec.type, catalogVariantEarly);
  const isStorytellingLogo = isStorytellingLogoSectionType(sec.type, catalogVariantEarly);
  const isStorytellingVideo = isStorytellingVideoSectionType(sec.type, catalogVariantEarly);
  const isFaq = isFaqSectionType(sec.type, catalogVariantEarly);
  const isIconsWithText = isIconsWithTextSectionType(sec.type, catalogVariantEarly);
  const isMulticolumn = isMulticolumnSectionType(sec.type, catalogVariantEarly);
  const isPullQuote = isPullQuoteSectionType(sec.type, catalogVariantEarly);
  const isRichText = isRichTextSectionType(sec.type, catalogVariantEarly);
  const isTextMarquee = isTextMarqueeSectionType(sec.type, catalogVariantEarly);
  const isBlogPostsCarousel = isBlogPostsCarouselSectionType(sec.type, catalogVariantEarly);
  const isBlogPostsEditorial = isBlogPostsEditorialSectionType(sec.type, catalogVariantEarly);
  const isBlogPostsGrid = isBlogPostsGridSectionType(sec.type, catalogVariantEarly);
  const isProductHotspots = isProductHotspotsSectionType(sec.type, catalogVariantEarly);
  const isRecommendedProducts = isRecommendedProductsSectionType(sec.type, catalogVariantEarly);
  const isCollectionHeading = isCollectionHeadingSectionType(sec.type);
  const isMainCollection = isMainCollectionSectionType(sec.type);
  const isSearch = isSearchSectionType(sec.type);
  const isSearchResults = isSearchResultsSectionType(sec.type);
  const isBlogPostMain = isBlogPostMainSectionType(sec.type);
  const isMainBlog = isMainBlogSectionType(sec.type);
  const isCollectionLinksSpotlight = isCollectionLinksSpotlightSectionType(
    sec.type,
    catalogVariantEarly
  );
  const isCollectionListBento = isCollectionListBentoSectionType(sec.type, catalogVariantEarly);
  const isCollectionListCarousel = isCollectionListCarouselSectionType(sec.type, catalogVariantEarly);
  const isCollectionListEditorial = isCollectionListEditorialSectionType(sec.type, catalogVariantEarly);
  const isCollectionListGrid = isCollectionListGridSectionType(sec.type, catalogVariantEarly);
  const isLayeredSlideshow = isLayeredSlideshowSectionType(sec.type, catalogVariantEarly);
  const isSlideshowFullFrame = isSlideshowFullFrameSectionType(sec.type, catalogVariantEarly);
  const isSlideshowInset = isSlideshowInsetSectionType(sec.type, catalogVariantEarly);
  const isStorytellingCarousel = isStorytellingCarouselSectionType(sec.type, catalogVariantEarly);
  const isDividerSection = isDivider || isDividerSectionType(sec.type, catalogVariantEarly);

  if (isHero && isHeroBottomAlignedSectionConfig(config, settingsBase, blocksBase)) {
    const children = mapBottomAlignedHeroSidebarNodes(
      prefix,
      blocksBase,
      values,
      itemOrder,
      childrenListKey
    );
    return {
      id: prefix,
      label: 'Hero: Bottom aligned',
      kind: 'section',
      icon: 'section',
      children: children.length ? children : undefined,
      childrenListKey,
      showVisibilityToggle: true,
      showDeleteButton: canDeleteTemplateSection(tplId, secId),
    };
  }

  const remappedSectionFields = remapTemplateFields(sec.settingsFields, tplId, secId);
  const catalogVariant =
    isHero ||
    isContactForm ||
    isEmailSignup ||
    isCustomSection ||
    isFeaturedProduct ||
    isProductMain ||
    isProductHighlight ||
    isEditorial ||
    isEditorialJumbo ||
    isImageCompare ||
    isImageWithText ||
    isStorytellingLogo ||
    isStorytellingVideo ||
    isFaq ||
    isIconsWithText ||
    isMulticolumn ||
    isPullQuote ||
    isRichText ||
    isTextMarquee ||
    isBlogPostsCarousel ||
    isBlogPostsEditorial ||
    isBlogPostsGrid ||
    isProductHotspots ||
    isRecommendedProducts ||
    isCollectionHeading ||
    isMainCollection ||
    isSearch ||
    isSearchResults ||
    isBlogPostMain ||
    isMainBlog ||
    isCollectionLinksSpotlight ||
    isCollectionListBento ||
    isCollectionListCarousel ||
    isCollectionListEditorial ||
    isCollectionListGrid ||
    isLayeredSlideshow ||
    isSlideshowFullFrame ||
    isSlideshowInset ||
    isStorytellingCarousel ||
    isDividerSection
      ? catalogVariantEarly
      : '';
  const remappedBlocks = isHero
    ? withHeroCatalogBlocks(
        sec.blocks?.map((b) => remapTemplateBlockDef(b, tplId, secId)),
        catalogVariant,
        blocksBase
      )
    : sec.blocks?.map((b) => remapTemplateBlockDef(b, tplId, secId)) ?? [];
  const catalogBlocks =
    isFeaturedCollection && editorSchema
      ? []
      : isFeaturedCollection
        ? catalogSidebarBlocksForSectionType('featured-collection')
        : [];
  const sectionBlocks = catalogBlocks.length ? catalogBlocks : remappedBlocks;
  const heroVisibleBlocks =
    isHero && sectionBlocks.length
      ? filterHeroBlocksForSidebar(
          sectionBlocks,
          config,
          ['templates', tplId, 'sections', secId, 'block_order'],
          catalogVariant
        )
      : sectionBlocks;

  const sectionFields =
    isFeaturedCollection ||
    isFeaturedCollectionGrouped ||
    isHero ||
    isNotFoundMain ||
    isDividerSection ||
    isContactForm ||
    isEmailSignup ||
    isCustomSection ||
    isFeaturedProduct ||
    isProductMain ||
    isProductHighlight ||
    isEditorial ||
    isEditorialJumbo ||
    isImageCompare ||
    isImageWithText ||
    isStorytellingLogo ||
    isStorytellingVideo ||
    isFaq ||
    isIconsWithText ||
    isMulticolumn ||
    isPullQuote ||
    isRichText ||
    isBlogPostsCarousel ||
    isBlogPostsEditorial ||
    isBlogPostsGrid ||
    isProductHotspots ||
    isRecommendedProducts ||
    isCollectionHeading ||
    isMainCollection ||
    isSearch ||
    isSearchResults ||
    isBlogPostMain ||
    isMainBlog ||
    isCollectionLinksSpotlight ||
    isCollectionListBento ||
    isCollectionListCarousel ||
    isCollectionListEditorial ||
    isCollectionListGrid ||
    isLayeredSlideshow ||
    isSlideshowFullFrame ||
    isSlideshowInset ||
    isStorytellingCarousel
      ? []
      : mapFieldNodes(remappedSectionFields, values);
  const blockNodes = isCollectionLinksSpotlight
    ? mapCollectionLinksSpotlightBlockNodes(
        prefix,
        blocksBase,
        values,
        itemOrder,
        childrenListKey,
        config,
        tplId,
        secId,
        catalogVariant
      )
    : isProductHighlight
      ? mapProductHighlightBlockNodes(
          prefix,
          blocksBase,
          values,
          itemOrder,
          childrenListKey,
          config,
          tplId,
          secId
        )
    : isFeaturedProduct
      ? mapFeaturedProductBlockNodes(
          prefix,
          blocksBase,
          values,
          itemOrder,
          childrenListKey,
          config,
          tplId,
          secId
        )
    : isProductMain
      ? mapProductPageBlockNodes(
          prefix,
          blocksBase,
          values,
          itemOrder,
          childrenListKey,
          config,
          tplId,
          secId
        )
      : isIconsWithText
        ? mapIconsWithTextBlockNodes(
            prefix,
            blocksBase,
            values,
            itemOrder,
            childrenListKey,
            config,
            tplId,
            secId
          )
      : isFaq
        ? (() => {
            const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
            const nodes = mapFaqBlockNodes(
              prefix,
              blocksBase,
              values,
              itemOrder,
              childrenListKey,
              config,
              tplId,
              secId
            );
            return reorderSidebarChildren([addBlock, ...nodes], childrenListKey, itemOrder);
          })()
      : isMulticolumn
        ? mapMulticolumnBlockNodes(
            prefix,
            blocksBase,
            values,
            itemOrder,
            childrenListKey,
            config,
            tplId,
            secId
          )
      : isRichText
        ? mapRichTextBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}`,
            values,
            itemOrder,
            childrenListKey,
            config
          )
      : isTextMarquee
        ? mapTextMarqueeBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}`,
            values,
            itemOrder,
            childrenListKey
          )
      : isPullQuote
        ? mapPullQuoteBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}`,
            values,
            itemOrder,
            childrenListKey
          )
      : isStorytellingVideo
        ? mapStorytellingVideoBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isContactForm
        ? mapContactFormBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isEmailSignup
        ? mapEmailSignupBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isImageCompare
        ? mapImageCompareBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isEditorialJumbo
        ? mapEditorialJumboBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isEditorial
        ? mapEditorialBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isStorytellingCarousel
        ? mapStorytellingCarouselBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.blocks`,
            values,
            itemOrder,
            childrenListKey,
            config,
            ['templates', tplId, 'sections', secId, 'block_order']
          )
      : isBlogPostsGrid
        ? mapBlogPostsGridBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.blocks`,
            values,
            itemOrder,
            childrenListKey,
            config,
            ['templates', tplId, 'sections', secId, 'block_order']
          )
      : isBlogPostsEditorial
        ? mapBlogPostsEditorialBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.blocks`,
            values,
            itemOrder,
            childrenListKey,
            config,
            ['templates', tplId, 'sections', secId, 'block_order']
          )
      : isBlogPostsCarousel
        ? mapBlogPostsCarouselBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.blocks`,
            values,
            itemOrder,
            childrenListKey,
            config,
            ['templates', tplId, 'sections', secId, 'block_order']
          )
      : isImageWithText
        ? mapImageWithTextBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isProductHotspots
        ? mapProductHotspotsBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.settings`,
            `templates.${tplId}.sections.${secId}.blocks`,
            values,
            config,
            ['templates', tplId, 'sections', secId, 'block_order']
          )
      : isRecommendedProducts
        ? mapRecommendedProductsBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.settings`,
            values,
            itemOrder,
            childrenListKey
          )
      : isCollectionHeading
        ? mapCollectionHeadingBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isMainCollection
        ? mapMainCollectionBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.settings`,
            values,
            itemOrder,
            childrenListKey
          )
      : isSearch
        ? mapSearchBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isSearchResults
        ? mapSearchResultsBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.settings`,
            values,
            itemOrder,
            childrenListKey
          )
      : isBlogPostMain
        ? mapBlogPostMainBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isMainBlog
        ? mapMainBlogBlockNodes(prefix, values, itemOrder, childrenListKey)
      : isCollectionListBento ||
          isCollectionListCarousel ||
          isCollectionListEditorial ||
          isCollectionListGrid
        ? mapCollectionListBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.settings`,
            `templates.${tplId}.sections.${secId}.blocks`,
            values,
            itemOrder,
            childrenListKey
          )
      : isFeaturedCollection && editorSchema
        ? mapFeaturedCollectionBlockNodes(
            prefix,
            editorSchema,
            values,
            itemOrder,
            childrenListKey
          )
      : isSlideshowInset || isSlideshowFullFrame || isLayeredSlideshow
        ? mapSlideshowInsetBlockNodes(
            prefix,
            `templates.${tplId}.sections.${secId}.blocks`,
            values,
            itemOrder,
            childrenListKey,
            config,
            ['templates', tplId, 'sections', secId, 'block_order'],
            isLayeredSlideshow ? 'Content layout' : 'Layout'
          )
      : heroVisibleBlocks.length
      ? isHero
        ? catalogVariant === 'split-showcase'
          ? mapSplitShowcaseGroupNodes(heroVisibleBlocks, prefix, `${prefix}:add-block`, values, itemOrder, childrenListKey)
          : catalogVariant === 'hero-marquee'
            ? mapHeroMarqueeGroupNodes(heroVisibleBlocks, prefix, `${prefix}:add-block`, values, itemOrder, childrenListKey, config)
            : mapHeroBlockNodes(heroVisibleBlocks, prefix, `${prefix}:add-block`, values, itemOrder, childrenListKey)
        : isNotFoundMain
          ? mapAtomicSectionBlockNodes(
              heroVisibleBlocks,
              prefix,
              `${prefix}:add-block`,
              values,
              itemOrder,
              childrenListKey
            )
        : mapBlockNodes(
            heroVisibleBlocks,
            prefix,
            `${prefix}:add-block`,
            values,
            itemOrder,
            childrenListKey,
            isFeaturedCollection ? { innerAddBlockPlacement: 'top' } : undefined
          )
      : [];

  const children = reorderSidebarChildren(
    isHero ||
      isNotFoundMain ||
      isFaq ||
      isIconsWithText ||
      isMulticolumn ||
      isRichText ||
      isTextMarquee ||
      isPullQuote ||
      isStorytellingVideo ||
      isContactForm ||
      isEmailSignup ||
      isImageCompare ||
      isImageWithText ||
      isStorytellingCarousel ||
      isBlogPostsGrid ||
      isBlogPostsEditorial ||
      isBlogPostsCarousel ||
      isProductHotspots ||
      isRecommendedProducts ||
      isCollectionHeading ||
      isMainCollection ||
      isSearch ||
      isSearchResults ||
      isBlogPostMain ||
      isMainBlog ||
      isCollectionLinksSpotlight ||
      isCollectionListBento ||
      isCollectionListCarousel ||
      isCollectionListEditorial ||
      isCollectionListGrid ||
      isFeaturedCollection ||
      isFeaturedProduct ||
      isProductHighlight
      ? blockNodes
      : [...sectionFields, ...blockNodes],
    childrenListKey,
    itemOrder
  );

  const previewField = remappedSectionFields.find((f) => f.type === 'text' || f.type === 'textarea');

  return {
    id: prefix,
    label: isHero
      ? heroSectionSidebarLabel(catalogVariant, sec.label ?? blueprintId)
      : isContactFormSectionType(sec.type, catalogVariant)
        ? 'Contact form'
        : isEmailSignupSectionType(sec.type, catalogVariant)
          ? 'Email signup'
          : isCustomSectionType(sec.type, catalogVariant)
            ? 'Custom section'
            : isDividerSectionType(sec.type, catalogVariant)
              ? 'Divider'
              : isRecommendedProductsSectionType(sec.type, catalogVariant)
                ? 'Recommended products'
                : isCollectionHeadingSectionType(sec.type)
                  ? 'Collection heading'
                  : isMainCollectionSectionType(sec.type)
                    ? 'Collection'
                    : isSearchSectionType(sec.type)
                      ? 'Search'
                      : isSearchResultsSectionType(sec.type)
                        ? 'Search results'
                    : isBlogPostMainSectionType(sec.type)
                      ? 'Blog posts'
                      : isMainBlogSectionType(sec.type)
                        ? 'Blog'
                    : isProductHotspotsSectionType(sec.type, catalogVariant)
                  ? 'Product hotspots'
                  : isFeaturedProductSectionType(sec.type, catalogVariant)
                    ? 'Featured product'
                    : isProductMainSectionType(sec.type)
                      ? 'Product information'
                    : isProductHighlightSectionType(sec.type, catalogVariant)
                  ? productHighlightSidebarLabel(catalogVariant, 'Product highlight')
                  : isEditorialSectionType(sec.type, catalogVariant)
                    ? 'Editorial'
                    : isStorytellingCarouselSectionType(sec.type, catalogVariant)
                      ? 'Carousel'
                      : isEditorialJumboSectionType(sec.type, catalogVariant)
                        ? 'Editorial: Jumbo text'
                        : isImageCompareSectionType(sec.type, catalogVariant)
                      ? 'Image compare'
                      : isImageWithTextSectionType(sec.type, catalogVariant)
                        ? 'Image with text'
                        : isStorytellingLogoSectionType(sec.type, catalogVariant)
                          ? 'Logo'
                          : isStorytellingVideoSectionType(sec.type, catalogVariant)
                            ? 'Video'
                            : isFaqSectionType(sec.type, catalogVariant)
                              ? 'FAQ'
                              : isIconsWithTextSectionType(sec.type, catalogVariant)
                                ? 'Icons with text'
                                : isMulticolumnSectionType(sec.type, catalogVariant)
                                  ? 'Multicolumn'
                                  : isPullQuoteSectionType(sec.type, catalogVariant)
                                    ? 'Pull quote'
                                    : isRichTextSectionType(sec.type, catalogVariant)
                                      ? 'Rich text'
                                      : isTextMarqueeSectionType(sec.type, catalogVariant)
                                        ? 'Marquee'
                                        : isBlogPostsCarouselSectionType(sec.type, catalogVariant)
                                          ? 'Blog posts: Carousel'
                                          : isBlogPostsEditorialSectionType(sec.type, catalogVariant)
                                            ? 'Blog posts: Editorial'
                                            : isBlogPostsGridSectionType(sec.type, catalogVariant)
                                              ? 'Blog posts: Grid'
                                              : isCollectionLinksSpotlightSectionType(
                                                        sec.type,
                                                        catalogVariant
                                                      )
                                                    ? catalogVariant === 'collection-links-text'
                                                      ? 'Collection links: Text'
                                                      : 'Collection links: Spotlight'
                                                    : isCollectionListBentoSectionType(
                                                          sec.type,
                                                          catalogVariant
                                                        )
                                                      ? 'Collection list: Bento'
                                                    : isCollectionListCarouselSectionType(
                                                          sec.type,
                                                          catalogVariant
                                                        )
                                                      ? 'Collection list: Carousel'
                                                    : isCollectionListEditorialSectionType(
                                                          sec.type,
                                                          catalogVariant
                                                        )
                                                      ? 'Collection list: Editorial'
                                                    : isCollectionListGridSectionType(
                                                          sec.type,
                                                          catalogVariant
                                                        )
                                                      ? 'Collection list: Grid'
                                                    : isLayeredSlideshowSectionType(
                                                          sec.type,
                                                          catalogVariant
                                                        )
                                                      ? 'Layered slideshow'
                                                    : isSlideshowFullFrameSectionType(
                                                          sec.type,
                                                          catalogVariant
                                                        )
                                                      ? 'Slideshow: Full frame'
                                                    : isSlideshowInsetSectionType(
                                                          sec.type,
                                                          catalogVariant
                                                        )
                                                      ? 'Slideshow: Inset'
                                                    : isFeaturedCollection
                                                ? featuredCollectionSidebarLabel(
                                                    featuredCollectionCatalogVariant ||
                                                      catalogVariantEarly,
                                                    sec.label ?? 'Featured collection',
                                                    featuredCollectionLayoutType
                                                  )
                                                : sec.label ?? blueprintId,
    kind: 'section',
    icon: isSearchResults ? 'search' : isCollectionLinksSpotlight ? 'link' : 'section',
    fields:
      isHero || isCollectionLinksSpotlight || isFaq
        ? undefined
        : remappedSectionFields.length
          ? remappedSectionFields
          : undefined,
    preview: previewField ? fieldPreview(previewField, values) : undefined,
    children: children.length ? children : undefined,
    childrenListKey,
    showVisibilityToggle: true,
    showDeleteButton:
      (isFeaturedCollection ||
        isHero ||
        isNotFoundMain ||
        isDividerSection ||
        isContactForm ||
        isEmailSignup ||
        isCustomSection ||
        isFeaturedProduct ||
        isProductHighlight ||
        isEditorial ||
        isEditorialJumbo ||
        isImageCompare ||
        isImageWithText ||
        isStorytellingLogo ||
        isStorytellingVideo ||
        isFaq ||
        isIconsWithText ||
        isMulticolumn ||
        isPullQuote ||
        isRichText ||
        isTextMarquee ||
        isBlogPostsCarousel ||
        isBlogPostsEditorial ||
        isBlogPostsGrid ||
        isProductHotspots ||
        isRecommendedProducts ||
        isCollectionHeading ||
        isMainCollection ||
        isSearch ||
        isSearchResults ||
        isBlogPostMain ||
        isMainBlog ||
        isCollectionLinksSpotlight ||
        isCollectionListBento ||
        isCollectionListCarousel ||
        isCollectionListEditorial ||
        isCollectionListGrid ||
        isLayeredSlideshow ||
        isSlideshowFullFrame ||
        isSlideshowInset ||
        isStorytellingCarousel) &&
      canDeleteTemplateSection(tplId, secId),
  };
}

/** Empty creator / new-theme sidebar: Header, Template, and Footer with only Add section rows. */
export function buildEmptyShopifySidebarTree(
  previewPage: ThemePreviewPage = 'index'
): SidebarNode[] {
  const templateId = previewPageToTemplateId(previewPage);
  const hideLayoutChrome = isPasswordPreviewPage(previewPage);

  const templateGroup: SidebarNode = {
    id: 'group:template',
    label: 'Template',
    kind: 'group-label',
    children: [
      { id: `template:${templateId}:add-section`, label: 'Add section', kind: 'add-section' },
    ],
    childrenListKey: listKeyTemplateSections(templateId),
  };

  if (hideLayoutChrome) {
    return [templateGroup];
  }

  return [
    {
      id: 'group:header',
      label: 'Header',
      kind: 'group-label',
      children: [{ id: 'layout:add-section', label: 'Add section', kind: 'add-section' }],
      childrenListKey: listKeyHeaderSections(),
    },
    templateGroup,
    {
      id: 'group:footer',
      label: 'Footer',
      kind: 'group-label',
      children: [
        { id: 'layout:footer-group:add-section', label: 'Add section', kind: 'add-section' },
      ],
      childrenListKey: listKeyFooterSections(),
    },
  ];
}

/** Shopify-style sidebar: Header / Template / Footer groups; collapsed by default. */
export function buildShopifySidebarTree(
  schema: EditorSchemaDoc,
  values: Record<string, string | boolean>,
  previewPage: ThemePreviewPage,
  itemOrder: Record<string, string[]> = {},
  config: Record<string, unknown> | null = null
): SidebarNode[] {
  const tree: SidebarNode[] = [];
  const templateId = previewPageToTemplateId(previewPage);
  const hideLayoutChrome = isPasswordPreviewPage(previewPage);
  const layout = schema.layout ?? {};
  const cfg = config ?? {};

  const schemaTemplateId = schemaTemplateIdForConfigKey(templateId);

  if (config) {
    const cfgClone = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
    ensureLayoutOrder(cfgClone);
  }

  if (!hideLayoutChrome) {
    const headerOrder = config
      ? existingLayoutSectionIds(cfg as Record<string, unknown>, 'header')
      : ['announcement_bar', 'header'];

    const headerNodes: SidebarNode[] = [];
    for (const instanceId of headerOrder) {
      const blueprint = layoutBlueprintKey(instanceId);
      const sec = layout[blueprint];
      if (sec) headerNodes.push(layoutSectionNode(instanceId, sec, values, itemOrder, config));
    }
    const headerChildren = reorderSidebarChildren(
      [...headerNodes, { id: 'layout:add-section', label: 'Add section', kind: 'add-section' }],
      listKeyHeaderSections(),
      itemOrder
    );

    tree.push({
      id: 'group:header',
      label: 'Header',
      kind: 'group-label',
      children: headerChildren,
      childrenListKey: listKeyHeaderSections(),
    });
  }

  const tpl = schema.templates?.find((t) => t.id === schemaTemplateId) ?? schema.templates?.[0];
  const tplSectionsListKey = listKeyTemplateSections(templateId);
  const tplConfig = config
    ? ((cfg.templates as Record<string, Record<string, unknown>> | undefined)?.[templateId] as
        | { section_order?: string[]; sections?: Record<string, unknown> }
        | undefined)
    : undefined;
  const templateSectionOrder = config
    ? existingTemplateSectionIds(cfg as Record<string, unknown>, templateId)
    : [];

  const templateSectionNodes: SidebarNode[] = [];
  if (tpl?.sections?.length || templateSectionOrder.length) {
    const tplSections = (tplConfig?.sections ?? {}) as Record<
      string,
      { type?: string; label?: string } | undefined
    >;
    const schemaSections = tpl?.sections ?? [];
    for (const instanceId of templateSectionOrder) {
      if (!tplSections[instanceId]) continue;
      const blueprintId = templateBlueprintKey(instanceId);
      const fromSchema = schemaSections.find((s) => (s.id ?? '') === blueprintId);
      const cfgSec = tplSections[instanceId];
      const sec =
        fromSchema ??
        ({
          id: blueprintId,
          type: typeof cfgSec?.type === 'string' ? cfgSec.type : blueprintId.replace(/_/g, '-'),
          label:
            typeof cfgSec?.label === 'string'
              ? cfgSec.label
              : blueprintId === 'main_blog'
                ? 'Blog'
                : blueprintId === 'blog_post_main'
                  ? 'Blog posts'
                  : blueprintId.replace(/_/g, ' '),
          hasBlocks: true,
          settingsFields: [],
          blocks: [],
        } as NonNullable<NonNullable<EditorSchemaDoc['templates']>[0]['sections']>[0]);
      templateSectionNodes.push(
        sectionToNode(sec, templateId, values, itemOrder, instanceId, config, schema)
      );
    }
    tree.push({
      id: 'group:template',
      label: 'Template',
      kind: 'group-label',
      children: [
        ...reorderSidebarChildren(templateSectionNodes, tplSectionsListKey, itemOrder),
        { id: `template:${templateId}:add-section`, label: 'Add section', kind: 'add-section' },
      ],
      childrenListKey: tplSectionsListKey,
    });
  }

  if (!hideLayoutChrome) {
    const footerOrder = config
      ? existingLayoutSectionIds(cfg as Record<string, unknown>, 'footer')
      : [];

    const footerNodes: SidebarNode[] = [];
    const indexTpl = schema.templates?.find((t) => t.id === 'index');
    const heroBlueprint = indexTpl?.sections?.find((s) => s.id === 'hero_main');
    const layoutSectionsCfg = (cfg.sections ?? {}) as Record<string, { type?: string } | undefined>;
    for (const instanceId of footerOrder) {
      const blueprint = layoutBlueprintKey(instanceId);
      const layoutSecType = layoutSectionsCfg[instanceId]?.type;
      if ((blueprint === 'hero_main' || layoutSecType === 'hero') && heroBlueprint) {
        footerNodes.push(layoutHeroSectionNode(instanceId, heroBlueprint, values, itemOrder, config));
        continue;
      }
      const sec = layout[blueprint];
      if (sec) footerNodes.push(layoutSectionNode(instanceId, sec, values, itemOrder, config));
    }
    const footerChildren = reorderSidebarChildren(
      [
        { id: 'layout:footer-group:add-section', label: 'Add section', kind: 'add-section' },
        ...footerNodes,
      ],
      listKeyFooterSections(),
      itemOrder
    );

    tree.push({
      id: 'group:footer',
      label: 'Footer',
      kind: 'group-label',
      children: footerChildren,
      childrenListKey: listKeyFooterSections(),
    });
  }

  return tree;
}

/** Theme Creator: show delete (trash) on every section and block row in the sidebar. */
export function withCreatorSidebarDeleteFlags(nodes: SidebarNode[]): SidebarNode[] {
  const walk = (node: SidebarNode): SidebarNode => {
    const children = node.children?.map(walk);
    const deletable = node.kind === 'section' || node.kind === 'block';
    return {
      ...node,
      showDeleteButton: deletable ? true : node.showDeleteButton,
      children,
    };
  };
  return nodes.map(walk);
}

export function buildThemeSettingsSidebarTree(schema: EditorSchemaDoc): SidebarNode[] {
  const schemaGroups = schema.globalSettings?.groups ?? [];
  const schemaById = new Map(schemaGroups.map((g) => [g.id ?? g.label, g]));

  return THEME_SETTINGS_CATALOG.map((item) => {
    const fromSchema = schemaById.get(item.id);
    return {
      id: `global:${item.id}`,
      label: item.label,
      kind: 'section' as const,
      icon: 'default' as const,
      fields: fromSchema?.fields ?? [],
    };
  });
}

export function findSidebarNode(nodes: SidebarNode[], id: string): SidebarNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findSidebarNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Root-to-target ids for expanding the sidebar tree to reveal a selection. */
export function findSidebarNodePath(
  nodes: SidebarNode[],
  targetId: string,
  trail: string[] = []
): string[] | null {
  for (const n of nodes) {
    const next = [...trail, n.id];
    if (n.id === targetId) return next;
    if (n.children?.length) {
      const found = findSidebarNodePath(n.children, targetId, next);
      if (found) return found;
    }
  }
  return null;
}

/** Expand every ancestor (and branch targets) so a deep preview click reveals the matching row. */
export function expandedIdsFromSidebarTree(
  nodeId: string,
  tree: SidebarNode[]
): Record<string, boolean> {
  const path = findSidebarNodePath(tree, nodeId);
  if (!path?.length) return {};

  const out: Record<string, boolean> = {};
  const target = findSidebarNode(tree, nodeId);

  for (let i = 0; i < path.length - 1; i++) {
    out[path[i]!] = true;
  }

  if (target?.children?.length) {
    out[nodeId] = true;
  }

  return out;
}

function isImageCompareGroupNode(node: SidebarNode): boolean {
  if (!/:image_compare/.test(node.id)) return false;
  return (
    (node.label === 'Content' || node.label === 'Text' || node.label === 'Buttons') &&
    node.kind === 'block' &&
    Boolean(node.children?.length)
  );
}

function isBlogPostsGridGroupNode(node: SidebarNode): boolean {
  if (!/blog_posts_grid/.test(node.id)) return false;
  return node.label === 'Blog card' && node.kind === 'block' && Boolean(node.children?.length);
}

function isBlogPostsEditorialGroupNode(node: SidebarNode): boolean {
  if (!/blog_posts_editorial/.test(node.id)) return false;
  return node.label === 'Blog card' && node.kind === 'block' && Boolean(node.children?.length);
}

function isBlogPostsCarouselGroupNode(node: SidebarNode): boolean {
  if (!/blog_posts_carousel/.test(node.id)) return false;
  return node.label === 'Blog card' && node.kind === 'block' && Boolean(node.children?.length);
}

function isStorytellingCarouselGroupNode(node: SidebarNode): boolean {
  if (!/storytelling_carousel/.test(node.id)) return false;
  return (
    (node.label === 'Header' || node.label === 'Carousel content' || node.label === 'Card') &&
    node.kind === 'block' &&
    Boolean(node.children?.length)
  );
}

function isEditorialJumboGroupNode(node: SidebarNode): boolean {
  if (!/:editorial_jumbo/.test(node.id)) return false;
  return node.label === 'Content' && node.kind === 'block' && Boolean(node.children?.length);
}

function isEditorialGroupNode(node: SidebarNode): boolean {
  if (/editorial_jumbo/.test(node.id)) return false;
  if (/blog_posts_editorial|blog_posts_carousel|collection_list_editorial/.test(node.id)) return false;
  if (!/:block:content/.test(node.id) && !/:nested:group$/.test(node.id)) return false;
  if (!/editorial/.test(node.id)) return false;
  return (
    (node.label === 'Content' || node.label === 'Group') &&
    node.kind === 'block' &&
    Boolean(node.children?.length)
  );
}

/** Collapsed by default — FAQ opens with its accordion group visible (Shopify-style). */
export function defaultExpandedSidebar(nodes: SidebarNode[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  const walk = (list: SidebarNode[], parent?: SidebarNode) => {
    for (const node of list) {
      if (node.kind === 'section' && node.label === 'FAQ') {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Image compare') {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Editorial: Jumbo text') {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Editorial') {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Carousel') {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Blog posts: Grid') {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Blog posts: Editorial') {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Blog posts: Carousel') {
        out[node.id] = true;
      }
      if (isStorytellingCarouselGroupNode(node)) {
        out[node.id] = true;
      }
      if (isBlogPostsGridGroupNode(node)) {
        out[node.id] = true;
      }
      if (isBlogPostsEditorialGroupNode(node)) {
        out[node.id] = true;
      }
      if (isBlogPostsCarouselGroupNode(node)) {
        out[node.id] = true;
      }
      if (isImageCompareGroupNode(node)) {
        out[node.id] = true;
      }
      if (isEditorialJumboGroupNode(node)) {
        out[node.id] = true;
      }
      if (isEditorialGroupNode(node)) {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label?.startsWith('Collection list:')) {
        out[node.id] = true;
      }
      if (node.kind === 'section' && node.label === 'Product highlight') {
        out[node.id] = true;
      }
      if (node.kind === 'block' && node.label === 'Product' && parent?.label === 'Product highlight') {
        out[node.id] = true;
      }
      if (node.kind === 'block' && node.label === 'Accordion') {
        out[node.id] = true;
      }
      if (
        parent?.label === 'Blog posts: Grid' &&
        node.kind === 'block' &&
        node.label === 'Blog card'
      ) {
        out[node.id] = true;
      }
      if (
        parent?.label === 'Blog posts: Editorial' &&
        node.kind === 'block' &&
        node.label === 'Blog card'
      ) {
        out[node.id] = true;
      }
      if (
        parent?.label === 'Blog posts: Carousel' &&
        node.kind === 'block' &&
        node.label === 'Blog card'
      ) {
        out[node.id] = true;
      }
      if (
        parent?.label?.startsWith('Collection list:') &&
        node.kind === 'block' &&
        (node.label === 'Header' || node.label === 'Collection card')
      ) {
        out[node.id] = true;
      }
      if (node.children?.length) walk(node.children, node);
    }
  };
  walk(nodes);
  return out;
}

export function resolveAddBlockSectionLabel(nodeId: string, tree: SidebarNode[]): string {
  const parentId = nodeId.replace(/:inner-add-block$/, '').replace(/:add-block$/, '');
  const parent = findSidebarNode(tree, parentId);
  if (parent && parent.kind !== 'add-block' && parent.kind !== 'add-section') {
    return parent.label;
  }
  const section = findSidebarNode(tree, parentId.split(':block:')[0] ?? parentId);
  return section?.label ?? 'Section';
}

export function firstSelectableSidebarNode(nodes: SidebarNode[]): SidebarNode | null {
  for (const n of nodes) {
    if (n.fields?.length) return n;
    if (n.children) {
      const found = firstSelectableSidebarNode(n.children);
      if (found) return found;
    }
  }
  return null;
}

/** When a block has field children but no direct fields, aggregate for the settings panel. */
const SECTION_PANEL_BY_LABEL: Record<string, (node: SidebarNode) => SidebarNode> = {
  'Product highlight': prepareProductHighlightSettingsNode,
  Editorial: prepareEditorialSettingsNode,
  'Editorial: Jumbo text': prepareEditorialJumboSettingsNode,
  Carousel: prepareStorytellingCarouselSettingsNode,
  'Image compare': prepareImageCompareSettingsNode,
  'Image with text': prepareImageWithTextSettingsNode,
  Logo: prepareStorytellingLogoSettingsNode,
  Video: prepareStorytellingVideoSettingsNode,
  FAQ: prepareFaqSettingsNode,
  'Icons with text': prepareIconsWithTextSettingsNode,
  Multicolumn: prepareMulticolumnSettingsNode,
  'Pull quote': preparePullQuoteSettingsNode,
  'Rich text': prepareRichTextSettingsNode,
  '404': prepareNotFoundMainSettingsNode,
  Marquee: prepareTextMarqueeSettingsNode,
  'Featured collection': prepareFeaturedCollectionSettingsNode,
  'Featured collection: Carousel': prepareFeaturedCollectionSettingsNode,
  'Featured collection: Editorial': prepareFeaturedCollectionSettingsNode,
  'Featured collection: Grid': prepareFeaturedCollectionSettingsNode,
  'Blog posts: Carousel': prepareBlogPostsCarouselSettingsNode,
  'Blog posts: Editorial': prepareBlogPostsEditorialSettingsNode,
  'Blog posts: Grid': prepareBlogPostsGridSettingsNode,
  'Product hotspots': prepareProductHotspotsSettingsNode,
  'Recommended products': prepareRecommendedProductsSettingsNode,
  'Collection links: Spotlight': prepareCollectionLinksSpotlightSettingsNode,
  'Collection links: Text': prepareCollectionLinksSpotlightSettingsNode,
  'Collection list: Bento': prepareCollectionListBentoSettingsNode,
  'Collection list: Carousel': prepareCollectionListCarouselSettingsNode,
  'Collection list: Editorial': prepareCollectionListEditorialSettingsNode,
  'Collection list: Grid': prepareCollectionListGridSettingsNode,
  'Layered slideshow': prepareLayeredSlideshowSettingsNode,
  'Slideshow: Full frame': prepareSlideshowFullFrameSettingsNode,
  'Slideshow: Inset': prepareSlideshowInsetSettingsNode,
  Divider: prepareDividerSettingsNode,
  'Announcement bar': prepareAnnouncementSettingsNode,
  'Contact form': prepareContactFormSettingsNode,
  'Email signup': prepareEmailSignupSettingsNode,
  'Custom section': prepareCustomSectionSettingsNode,
  'Featured product': prepareFeaturedProductSettingsNode,
  Hero: prepareHeroSettingsNode,
  'Hero: Bottom aligned': prepareHeroBottomAlignedSettingsNode,
  'Hero: Marquee': prepareHeroMarqueeSettingsNode,
};

function prepareSectionPanelNode(
  node: SidebarNode,
  values?: Record<string, unknown>,
  config?: Record<string, unknown> | null
): SidebarNode | null {
  if (isFeaturedCollectionSectionNodeId(node.id)) {
    return prepareFeaturedCollectionSettingsNode(node, values, config);
  }
  const productHighlightSettingsBase = productHighlightSettingsBaseFromNodeId(node.id);
  if (productHighlightSettingsBase) {
    const catalogVariant = readProductHighlightSettingValue(
      values,
      config,
      productHighlightSettingsBase,
      'catalogVariant'
    );
    const variant = resolveProductHighlightVariant({
      label: node.label,
      catalogVariant,
      fields: node.fields,
    });
    if (variant === 'product-highlight') {
      return prepareProductHighlightSettingsNode(node, values, config);
    }
    if (variant === 'featured-product') {
      return prepareFeaturedProductSettingsNode(node, values, config);
    }
  }
  const prepareByLabel = SECTION_PANEL_BY_LABEL[node.label ?? ''];
  if (!prepareByLabel) return null;
  // Hero: Marquee's nested "Marquee" folder shares the Text Marquee section label —
  // never route it through the standalone text-marquee section panel.
  if (
    prepareByLabel === prepareTextMarqueeSettingsNode &&
    /:hero_main(?:_\d+)?:/.test(node.id)
  ) {
    return null;
  }
  if (prepareByLabel === prepareFeaturedCollectionSettingsNode) {
    return prepareFeaturedCollectionSettingsNode(node, values, config);
  }
  if (prepareByLabel === prepareProductHighlightSettingsNode) {
    return prepareProductHighlightSettingsNode(node, values, config);
  }
  if (prepareByLabel === prepareFeaturedProductSettingsNode) {
    return prepareFeaturedProductSettingsNode(node, values, config);
  }
  return prepareByLabel(node);
}

function heroSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):([^:]+)/);
  if (templateMatch) {
    return `templates.${templateMatch[1]}.sections.${templateMatch[2]}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+)/);
  if (layoutMatch) {
    return `sections.${layoutMatch[1]}.settings`;
  }
  return null;
}

function fallbackHeroSectionFieldDefs(nodeId: string): EditorFieldDef[] {
  const base = heroSettingsBaseFromNodeId(nodeId);
  if (!base) return [];
  const mk = (
    key: string,
    label: string,
    group: string,
    type: EditorFieldDef['type'],
    extra: Partial<EditorFieldDef> = {}
  ): EditorFieldDef => ({
    path: `${base}.${key}`,
    label,
    group,
    type,
    ...extra,
  });
  return [
    mk('media1Type', 'Type', 'Media 1', 'select', {
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
      ],
      widget: 'segmented',
    }),
    mk('media1ImageUrl', 'Image', 'Media 1', 'text', { widget: 'image' }),
    mk('media2Type', 'Type', 'Media 2', 'select', {
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
      ],
      widget: 'segmented',
    }),
    mk('media2ImageUrl', 'Image', 'Media 2', 'text', { widget: 'image' }),
    mk('mobileMedia1Type', 'Type', 'Mobile media', 'select', {
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
      ],
      widget: 'segmented',
    }),
    mk('mobileMedia1ImageUrl', 'Image', 'Mobile media', 'text', { widget: 'image' }),
    mk('sectionLink', 'Section link', 'Section link', 'text'),
    mk('sectionLinkNewTab', 'Open in new tab', 'Section link', 'boolean', { widget: 'toggle' }),
    mk('layoutAlignment', 'Alignment', 'Layout', 'select', { widget: 'segmented' }),
    mk('height', 'Height', 'Layout', 'select', { widget: 'select-inline' }),
    mk('colorScheme', 'Background color', 'Appearance', 'color', { widget: 'color' }),
    mk('paddingTop', 'Top', 'Padding', 'range'),
    mk('paddingBottom', 'Bottom', 'Padding', 'range'),
    mk('customCss', 'Custom CSS', 'Custom CSS', 'text', { widget: 'accordion' }),
  ];
}

export function settingsNodeForSelection(
  selectedNode: SidebarNode | null,
  tree: SidebarNode[] = [],
  editorSchema?: EditorSchemaDoc | null,
  values?: Record<string, unknown>,
  config?: Record<string, unknown> | null
): SidebarNode | null {
  if (!selectedNode) return null;
  if (selectedNode.kind === 'add-block' || selectedNode.kind === 'add-section') return null;

  let node = selectedNode;
  if (node.kind === 'section' && editorSchema && !node.fields?.length) {
    const schemaFields = sectionSettingsFieldsFromSchema(editorSchema, node.id);
    if (schemaFields.length) {
      node = { ...node, fields: schemaFields };
    }
  }

  const announcementBlock = findAnnouncementBlockInTree(node.id, tree);
  if (announcementBlock) {
    const blockNode = isAnnouncementBlockNodeId(node.id) ? node : announcementBlock;
    const instanceId =
      instanceIdFromAnnouncementBlockNodeId(blockNode.id) ??
      instanceIdFromAnnouncementFieldNodeId(node.id);
    const blockInstanceId =
      blockInstanceIdFromAnnouncementBlockNodeId(blockNode.id) ??
      blockInstanceIdFromAnnouncementFieldNodeId(node.id) ??
      'announcement';
    let fields =
      editorSchema && instanceId
        ? announcementBlockFieldDefsFromSchema(editorSchema, instanceId, blockInstanceId)
        : [];
    if (!fields.length) {
      fields = announcementBlockFieldsFromNode(blockNode);
    }
    if (!fields.length) {
      const catalogBlock = resolveEditingPanelForNode(blockNode.id);
      if (catalogBlock?.fields.length) fields = catalogBlock.fields;
    }
    return prepareAnnouncementBlockSettingsNode({ ...blockNode, fields });
  }

  const announcementSection =
    node.kind === 'section' && isAnnouncementLayoutNodeId(node.id)
      ? node
      : findAnnouncementSectionInTree(node.id, tree);
  if (announcementSection && (node.kind === 'section' || isAnnouncementLayoutNodeId(node.id))) {
    const sectionFields = resolveAnnouncementSectionPanelFields(
      announcementSection.id,
      editorSchema,
      announcementSection.fields
    );
    return prepareAnnouncementSettingsNode({ ...announcementSection, fields: sectionFields });
  }

  if (isHeaderLogoBlockNodeId(node.id)) {
    const blockNode = findSidebarNode(tree, node.id) ?? node;
    let fields = headerLogoBlockFieldsFromNode(blockNode);
    if (!fields.length && editorSchema) {
      const instanceId = instanceIdFromHeaderLogoBlockNodeId(blockNode.id);
      if (instanceId) {
        fields = headerLogoBlockFieldDefsFromSchema(editorSchema, instanceId);
      }
    }
    if (!fields.length) {
      const catalogBlock = resolveEditingPanelForNode(blockNode.id);
      if (catalogBlock?.fields.length) fields = catalogBlock.fields;
    }
    return prepareHeaderLogoBlockSettingsNode({ ...blockNode, fields });
  }

  if (isHeaderMenuBlockNodeId(node.id)) {
    const blockNode = findSidebarNode(tree, node.id) ?? node;
    const instanceId = instanceIdFromHeaderMenuBlockNodeId(blockNode.id);
    let fields: EditorFieldDef[] = [];
    if (editorSchema && instanceId) {
      fields = headerMenuBlockFieldDefsFromSchema(editorSchema, instanceId);
    }
    if (!fields.length) {
      fields = headerMenuBlockFieldsFromNode(blockNode);
    }
    if (!fields.length) {
      const catalogBlock = resolveEditingPanelForNode(blockNode.id);
      if (catalogBlock?.fields.length) fields = catalogBlock.fields;
    }
    return prepareHeaderMenuBlockSettingsNode({ ...blockNode, fields });
  }

  const headerSection =
    node.kind === 'section' && isHeaderLayoutNodeId(node.id)
      ? node
      : findHeaderSectionInTree(node.id, tree);
  if (headerSection?.fields?.length) {
    return prepareHeaderSettingsNode(headerSection);
  }

  if (isRichTextBlockNodeId(node.id)) {
    const fields = richTextBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareRichTextBlockSettingsNode({ ...node, fields });
    }
  }

  if (isImageWithTextGroupNodeId(node.id)) {
    return prepareImageWithTextGroupSettingsNode(node);
  }

  if (isImageWithTextBlockNodeId(node.id)) {
    const fields = imageWithTextBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageWithTextBlockSettingsNode({ ...node, fields });
    }
  }

  if (isStorytellingVideoCaptionGroupNodeId(node.id)) {
    return prepareStorytellingVideoCaptionGroupSettingsNode(node);
  }

  if (isStorytellingVideoBlockNodeId(node.id)) {
    const fields = storytellingVideoBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareStorytellingVideoBlockSettingsNode({ ...node, fields });
    }
  }

  if (isContactFormFormGroupNodeId(node.id)) {
    const fields = contactFormFormGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareContactFormFormGroupSettingsNode({ ...node, fields });
    }
  }

  if (isContactFormBlockNodeId(node.id)) {
    const fields = contactFormBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareContactFormBlockSettingsNode({ ...node, fields });
    }
  }

  if (isEmailSignupSectionBlockNodeId(node.id)) {
    const fields = emailSignupBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareEmailSignupSectionBlockSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareSectionBlockNodeId(node.id)) {
    const fields = imageCompareBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareSectionBlockSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareContentGroupNodeId(node.id)) {
    const fields = imageCompareContentGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareContentGroupSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareTextGroupNodeId(node.id)) {
    const fields = imageCompareTextGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareTextGroupSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareButtonsGroupNodeId(node.id)) {
    const fields = imageCompareButtonsGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareButtonsGroupSettingsNode({ ...node, fields });
    }
  }

  if (isHeadingBlockNodeId(node.id)) {
    const treeNode = findSidebarNode(tree, node.id);
    if (treeNode) node = { ...treeNode, ...node, fields: node.fields ?? treeNode.fields };
    let fields = editorSchema ? headingBlockFieldDefsFromSchema(editorSchema, node.id) : [];
    const isNotFoundHeading = /:not_found_main(?:_\d+)?:block:heading/.test(node.id);
    // 404 heading: always use full canonical panel so Appearance Text color is never omitted.
    if (isNotFoundHeading || !fields.length) {
      fields = headingBlockCanonicalFieldDefsForNodeId(node.id);
    } else if (
      node.headingPanel === 'collection-title' ||
      isFaqSectionHeadingBlockNodeId(node.id)
    ) {
      fields = mergeFaqHeadingBlockFieldDefs(editorSchema, node.id, fields);
    }
    if (!fields.length) {
      fields = (node.fields ?? []).filter(isHeadingPanelField);
    }
    const headingPanel =
      node.headingPanel ??
      (isFaqSectionHeadingBlockNodeId(node.id) ? ('collection-title' as const) : undefined);
    return prepareHeadingBlockSettingsNode({ ...node, headingPanel, fields });
  }

  if (isNotFoundMainMessageBlockNodeId(node.id)) {
    const treeNode = findSidebarNode(tree, node.id) ?? node;
    const fields = notFoundMainMessageFieldDefsFromNodeId(node.id);
    return prepareNotFoundMainMessageSettingsNode({
      ...treeNode,
      fields: fields.length ? fields : treeNode.fields,
    });
  }

  if (isNotFoundMainSectionNodeId(node.id)) {
    const treeNode = findSidebarNode(tree, node.id) ?? node;
    const fields = notFoundMainContainerFieldDefsFromNodeId(node.id);
    return prepareNotFoundMainSettingsNode({
      ...treeNode,
      fields: fields.length ? fields : treeNode.fields,
    });
  }

  if (isCollectionTitleNestedNodeId(node.id)) {
    const catalogBlock = resolveEditingPanelForNode(node.id);
    let fields = catalogBlock?.fields.length ? catalogBlock.fields : [];
    const settingsBase = collectionTitleSettingsBaseFromNodeId(node.id);
    if (!fields.length && settingsBase) fields = collectionTitleFieldDefs(settingsBase);
    if (!fields.length && editorSchema) fields = collectionTitleFieldDefsFromSchema(editorSchema, node.id);
    if (!fields.length) {
      fields = (node.fields ?? []).filter(isCollectionTitlePanelField);
    }
    if (fields.length) {
      return prepareCollectionTitleSettingsNode({ ...node, fields });
    }
  }

  if (isViewAllButtonNestedNodeId(node.id)) {
    const catalogBlock = resolveEditingPanelForNode(node.id);
    const fields = resolveViewAllButtonPanelFields(
      node.id,
      editorSchema,
      // Prefer tree fields (built-ins) over incomplete catalog stubs.
      (node.fields?.length ? node.fields : catalogBlock?.fields) ?? []
    );
    return prepareViewAllButtonSettingsNode({ ...node, fields });
  }

  if (isFeaturedCollectionHeaderBlockNodeId(node.id)) {
    const catalogBlock = resolveEditingPanelForNode(node.id);
    let fields = catalogBlock?.fields.length ? catalogBlock.fields : [];
    const settingsBase = fcHeaderSettingsBaseFromNodeId(node.id);
    if (!fields.length && settingsBase) fields = fcHeaderFieldDefs(settingsBase);
    if (!fields.length && editorSchema) fields = fcHeaderFieldDefsFromSchema(editorSchema, node.id);
    if (!fields.length) {
      fields = (node.fields ?? []).filter(isFeaturedCollectionHeaderPanelField);
    }
    if (fields.length) {
      return prepareFeaturedCollectionHeaderSettingsNode({ ...node, fields });
    }
  }

  if (isProductCardMediaNestedNodeId(node.id)) {
    const catalogBlock = resolveEditingPanelForNode(node.id);
    let fields = catalogBlock?.fields.length ? catalogBlock.fields : [];
    const settingsBase = productCardMediaSettingsBaseFromNodeId(node.id);
    if (!fields.length && settingsBase) fields = productCardMediaFieldDefs(settingsBase);
    if (!fields.length && editorSchema) fields = productCardMediaFieldDefsFromSchema(editorSchema, node.id);
    if (!fields.length) fields = node.fields ?? [];
    if (fields.length) {
      return prepareProductCardMediaSettingsNode({ ...node, fields });
    }
  }

  if (isProductCardTitleNestedNodeId(node.id)) {
    const catalogBlock = resolveEditingPanelForNode(node.id);
    let fields = catalogBlock?.fields.length ? catalogBlock.fields : [];
    const settingsBase = productCardTitleSettingsBaseFromNodeId(node.id);
    if (!fields.length && settingsBase) fields = productCardTitleFieldDefs(settingsBase);
    if (!fields.length && editorSchema) fields = productCardTitleFieldDefsFromSchema(editorSchema, node.id);
    if (!fields.length) fields = node.fields ?? [];
    if (fields.length) {
      return prepareProductCardTitleSettingsNode({ ...node, fields });
    }
  }

  if (isProductCardPriceNestedNodeId(node.id)) {
    const catalogBlock = resolveEditingPanelForNode(node.id);
    let fields = catalogBlock?.fields.length ? catalogBlock.fields : [];
    const settingsBase = productCardPriceSettingsBaseFromNodeId(node.id);
    if (!fields.length && settingsBase) fields = productCardPriceFieldDefs(settingsBase);
    if (!fields.length && editorSchema) fields = productCardPriceFieldDefsFromSchema(editorSchema, node.id);
    if (!fields.length) fields = node.fields ?? [];
    if (fields.length) {
      return prepareProductCardPriceSettingsNode({ ...node, fields });
    }
  }

  if (isProductCardBlockNodeId(node.id)) {
    const catalogBlock = resolveEditingPanelForNode(node.id);
    let fields = catalogBlock?.fields.length ? catalogBlock.fields : [];
    const settingsBase = productCardSettingsBaseFromNodeId(node.id);
    if (!fields.length && settingsBase) fields = productCardFieldDefs(settingsBase);
    if (!fields.length && editorSchema) fields = productCardFieldDefsFromSchema(editorSchema, node.id);
    if (!fields.length) fields = node.fields ?? [];
    if (fields.length) {
      return prepareProductCardSettingsNode({ ...node, fields });
    }
  }

  if (isHeroButtonBlockNodeId(node.id)) {
    let fields = editorSchema ? heroButtonFieldDefsFromSchema(editorSchema, node.id) : [];
    if (!fields.length) {
      fields = (node.fields ?? []).filter(isHeroButtonPanelField);
    }
    return prepareHeroButtonSettingsNode({ ...node, fields });
  }

  /** Hero: Marquee virtual blocks (Marquee folder / Spacer / Text) — keep tree fields as-is. */
  if (
    /:hero_main(?:_\d+)?:(?:group:(?:marquee:text|spacer:spacer)|marquee)$/.test(node.id)
  ) {
    const blockNode = findSidebarNode(tree, node.id) ?? node;
    if (blockNode.fields?.length) {
      return { ...blockNode, kind: 'block' };
    }
    return { ...blockNode, kind: 'block', fields: node.fields ?? [] };
  }

  if (isHeroTextBlockNodeId(node.id)) {
    const blockNode = findSidebarNode(tree, node.id) ?? node;
    const heroTextMatch = node.id.match(
      /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/
    );
    if (heroTextMatch) {
      const fields = heroTextBlockFieldDefsFromNode(
        node.id,
        heroTextMatch[1]!,
        heroTextMatch[2]!
      );
      if (fields.length) {
        return prepareHeroTextBlockSettingsNode({ ...blockNode, fields });
      }
    }
  }

  const heroLogoBlock = node.id.match(
    /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):block:logo$/
  );
  if (heroLogoBlock) {
    const blockNode = findSidebarNode(tree, node.id) ?? node;
    const fields = largeLogoBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareLargeLogoBlockSettingsNode({ ...blockNode, fields });
    }
  }

  const heroSectionForPanel =
    node.kind === 'section' && isHeroSectionNodeId(node.id)
      ? node
      : node.kind === 'section'
        ? findHeroSectionInTree(node.id, tree)
        : null;
  if (node.kind === 'section' && heroSectionForPanel && editorSchema) {
    const heroFields = heroSectionFieldDefsFromSchema(editorSchema, heroSectionForPanel.id);
    if (heroFields.length) {
      return prepareHeroSectionSettingsForNode(heroSectionForPanel, heroFields);
    }
  }

  if (isFeaturedCollectionSectionNodeId(node.id)) {
    return prepareFeaturedCollectionSettingsNode(node, values, config);
  }

  if (isPullQuoteTextBlockNodeId(node.id)) {
    const blockNode = findSidebarNode(tree, node.id) ?? node;
    return preparePullQuoteTextBlockSettingsNode(blockNode);
  }

  if (isPullQuoteButtonBlockNodeId(node.id)) {
    const blockNode = findSidebarNode(tree, node.id) ?? node;
    return preparePullQuoteButtonBlockSettingsNode(blockNode);
  }

  if (
    node.label === 'Pull quote' ||
    isPullQuoteSectionNodeId(node.id) ||
    (node.fields?.length && isPullQuoteSettingsPanelFields(node.fields))
  ) {
    return preparePullQuoteSettingsNode(node);
  }

  if (
    (node.label === 'FAQ' || (node.kind === 'section' && isFaqSectionNodeId(node.id))) &&
    !isPullQuoteSectionNodeId(node.id)
  ) {
    return prepareFaqSettingsNode(node);
  }

  const dividerSection =
    node.kind === 'section' && isDividerSectionNodeId(node.id)
      ? node
      : findDividerSectionInTree(node.id, tree);
  if (
    dividerSection &&
    (node.kind === 'section' || isDividerSectionNodeId(node.id) || node.label === 'Divider')
  ) {
    const sectionFields = resolveDividerSectionPanelFields(
      dividerSection.id,
      editorSchema,
      dividerSection.fields ?? node.fields
    );
    return prepareDividerSettingsNode({ ...dividerSection, fields: sectionFields });
  }

  const catalogNode = settingsNodeFromCatalog(node);
  if (catalogNode) {
    if (isCollectionLinksSpotlightSettingsPanelFields(catalogNode.fields ?? [])) {
      return prepareCollectionLinksSpotlightSettingsNode(catalogNode);
    }
    if (catalogNode.label === 'Divider' || isDividerSettingsPanelFields(catalogNode.fields ?? [])) {
      return prepareDividerSettingsNode(catalogNode);
    }
    return catalogNode;
  }

  const footerSection =
    node.kind === 'section' && isFooterLayoutNodeId(node.id)
      ? node
      : findFooterSectionInTree(node.id, tree);
  if (footerSection?.fields?.length) {
    return prepareFooterSettingsNode(footerSection);
  }

  const copyrightBlock = findCopyrightBlockInTree(node.id, tree);
  if (copyrightBlock) {
    const blockNode = isCopyrightBlockNodeId(node.id) ? node : copyrightBlock;
    let fields = blockNode.fields ?? [];
    if (!fields.length && editorSchema) {
      const instanceId =
        instanceIdFromCopyrightNodeId(blockNode.id) ?? instanceIdFromCopyrightNodeId(node.id);
      if (instanceId) {
        fields = copyrightBlockFieldDefsFromSchema(editorSchema, instanceId);
      }
    }
    if (fields.length) {
      return prepareCopyrightBlockSettingsNode({ ...blockNode, fields });
    }
  }

  const policyLinksBlock = findPolicyLinksBlockInTree(node.id, tree);
  if (policyLinksBlock) {
    const blockNode = isPolicyLinksBlockNodeId(node.id) ? node : policyLinksBlock;
    let fields = blockNode.fields ?? [];
    if (!fields.length && editorSchema) {
      const instanceId =
        instanceIdFromPolicyLinksNodeId(blockNode.id) ?? instanceIdFromPolicyLinksNodeId(node.id);
      if (instanceId) {
        fields = policyLinksBlockFieldDefsFromSchema(editorSchema, instanceId);
      }
    }
    if (fields.length) {
      return preparePolicyLinksBlockSettingsNode({ ...blockNode, fields });
    }
  }

  const socialLinksBlock = findSocialLinksBlockInTree(node.id, tree);
  if (socialLinksBlock) {
    const blockNode = isSocialLinksBlockNodeId(node.id) ? node : socialLinksBlock;
    let fields = blockNode.fields ?? [];
    if (!fields.length && editorSchema) {
      const instanceId =
        instanceIdFromSocialLinksNodeId(blockNode.id) ?? instanceIdFromSocialLinksNodeId(node.id);
      if (instanceId) {
        fields = socialLinksBlockFieldDefsFromSchema(editorSchema, instanceId);
      }
    }
    if (fields.length) {
      return prepareSocialLinksBlockSettingsNode({ ...blockNode, fields });
    }
  }

  if (/^layout:footer_utilities(?:_\d+)?:block:/.test(node.id) && node.fields?.length) {
    return node;
  }

  const footerUtilitiesSection =
    node.kind === 'section' && isFooterUtilitiesLayoutNodeId(node.id)
      ? node
      : findFooterUtilitiesSectionInTree(node.id, tree);
  if (footerUtilitiesSection?.fields?.length) {
    return prepareFooterUtilitiesSettingsNode(footerUtilitiesSection);
  }

  // Rich text / pull quote / contact form / email signup share generic Layout–Size
  // fields that FAQ detection keys on, so they must resolve before the FAQ fallback.
  if (isNotFoundMainSectionNodeId(node.id) || node.label === '404') {
    return prepareNotFoundMainSettingsNode(node);
  }

  if (
    node.label === 'Pull quote' ||
    isPullQuoteSectionNodeId(node.id) ||
    (node.fields?.length && isPullQuoteSettingsPanelFields(node.fields))
  ) {
    return preparePullQuoteSettingsNode(node);
  }

  if (
    node.label === 'Rich text' ||
    (node.fields?.length && isRichTextSettingsPanelFields(node.fields))
  ) {
    return prepareRichTextSettingsNode(node);
  }

  if (
    !isHeroSectionSettingsNode(node) &&
    (node.label === 'Contact form' ||
      (node.fields?.length && isContactFormSettingsPanelFields(node.fields)))
  ) {
    return prepareContactFormSettingsNode(node);
  }

  if (
    !isHeroSectionSettingsNode(node) &&
    node.fields?.length &&
    isEmailSignupSettingsPanelFields(node.fields)
  ) {
    return prepareEmailSignupSettingsNode(node);
  }

  if (
    (node.label === 'FAQ' || isFaqSectionNodeId(node.id) || (node.fields?.length && isFaqSettingsPanelFields(node.fields))) &&
    !isPullQuoteSectionNodeId(node.id)
  ) {
    return prepareFaqSettingsNode(node);
  }

  if (node.fields?.length && isImageCompareSettingsPanelFields(node.fields)) {
    return prepareImageCompareSettingsNode(node);
  }

  if (
    !isHeroSectionSettingsNode(node) &&
    node.fields?.length &&
    isCustomSectionSettingsPanelFields(node.fields)
  ) {
    return prepareCustomSectionSettingsNode(node);
  }

  if (node.fields?.length && isDividerSettingsPanelFields(node.fields)) {
    const prepared = prepareDividerSettingsNode(node);
    if (prepared.fields?.length) return prepared;
  }

  if (isFeaturedProductMediaBlockNodeId(node.id)) {
    const productHighlightSettingsBase = productHighlightSettingsBaseFromNodeId(node.id);
    if (productHighlightSettingsBase) {
      const catalogVariant = readProductHighlightSettingValue(
        values,
        config,
        productHighlightSettingsBase,
        'catalogVariant'
      );
      if (catalogVariant === 'product-highlight') {
        const fields =
          node.fields?.length && isProductHighlightMediaPanelFields(node.fields)
            ? node.fields
            : editorSchema
              ? productHighlightMediaFieldDefsFromSchema(editorSchema, node.id)
              : productHighlightMediaFieldDefsFromNodeId(node.id);
        if (fields.length) {
          return prepareProductHighlightMediaSettingsNode({ ...node, fields });
        }
      }
    }
    const fields =
      node.fields?.length && isFeaturedProductMediaPanelFields(node.fields)
        ? node.fields
        : editorSchema
          ? featuredProductMediaFieldDefsFromSchema(editorSchema, node.id)
          : featuredProductMediaFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductMediaSettingsNode({ ...node, fields });
    }
  }

  if (isProductHighlightProductBlockNodeId(node.id)) {
    return prepareProductHighlightProductSettingsNode(node);
  }

  if (isFeaturedProductHeaderBlockNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductHeaderFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductHeaderFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductHeaderSettingsNode({ ...node, fields });
    }
  }

  if (
    isCollectionListSectionHeaderBlockNodeId(node.id) ||
    (node.fields?.length && isCollectionListSectionHeaderPanelFields(node.fields))
  ) {
    return prepareCollectionListSectionHeaderSettingsNode(node);
  }
  if (isCollectionListHeaderTextNodeId(node.id)) {
    const fields = collectionListHeaderTextFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareCollectionListHeaderTextSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isCollectionListHeaderTextPanelFields(node.fields)) {
    return prepareCollectionListHeaderTextSettingsNode(node);
  }
  if (isCollectionListCardBlockNodeId(node.id)) {
    const fields = collectionListCardFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareCollectionListCardSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isCollectionListCardPanelFields(node.fields)) {
    return prepareCollectionListCardSettingsNode(node);
  }
  if (isCollectionListCardImageNodeId(node.id)) {
    const fields = collectionListCardImageFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareCollectionListCardImageSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isCollectionListCardImagePanelFields(node.fields)) {
    return prepareCollectionListCardImageSettingsNode(node);
  }
  if (isCollectionListCardTitleNodeId(node.id)) {
    const fields = collectionListCardTitleFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareCollectionListCardTitleSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isCollectionListCardTitlePanelFields(node.fields)) {
    return prepareCollectionListCardTitleSettingsNode(node);
  }

  if (isFeaturedProductHeaderTitleNestedNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductHeaderTitleFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductHeaderTitleFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductHeaderTitleSettingsNode({ ...node, fields });
    }
  }

  if (isFeaturedProductHeaderPriceNestedNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductHeaderPriceFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductHeaderPriceFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductHeaderPriceSettingsNode({ ...node, fields });
    }
  }

  if (isFeaturedProductReviewStarsBlockNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductReviewStarsFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductReviewStarsFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductReviewStarsSettingsNode({ ...node, fields });
    }
  }

  if (isFeaturedProductVariantPickerBlockNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductVariantPickerFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductVariantPickerFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductVariantPickerSettingsNode({ ...node, fields });
    }
  }

  if (isFeaturedProductAddToCartNestedNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductAddToCartFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductAddToCartFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductAddToCartSettingsNode({ ...node, fields });
    }
  }

  if (isFeaturedProductQuantityNestedNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductQuantityFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductQuantityFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductQuantitySettingsNode({ ...node, fields });
    }
  }

  if (isFeaturedProductAcceleratedCheckoutNestedNodeId(node.id)) {
    return prepareFeaturedProductAcceleratedCheckoutSettingsNode(node);
  }

  if (isFeaturedProductBuyButtonsBlockNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductBuyButtonsFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductBuyButtonsFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductBuyButtonsSettingsNode({ ...node, fields });
    }
  }

  if (isProductHighlightProductTitleNestedNodeId(node.id)) {
    const fields = editorSchema
      ? productHighlightProductBlockFieldDefsFromSchema(editorSchema, node.id)
      : productHighlightProductBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareProductHighlightProductTitleSettingsNode({ ...node, fields });
    }
  }

  if (isProductHighlightProductPriceNestedNodeId(node.id)) {
    const fields = editorSchema
      ? productHighlightProductBlockFieldDefsFromSchema(editorSchema, node.id)
      : productHighlightProductBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareProductHighlightProductPriceSettingsNode({ ...node, fields });
    }
  }

  if (isProductHighlightProductImageNestedNodeId(node.id)) {
    const fields = editorSchema
      ? productHighlightProductBlockFieldDefsFromSchema(editorSchema, node.id)
      : productHighlightProductBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareProductHighlightProductImageSettingsNode({ ...node, fields });
    }
  }

  if (isProductHighlightProductSwatchesNestedNodeId(node.id)) {
    const fields = editorSchema
      ? productHighlightProductBlockFieldDefsFromSchema(editorSchema, node.id)
      : productHighlightProductBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareProductHighlightProductSwatchesSettingsNode({ ...node, fields });
    }
  }

  if (isFeaturedProductDetailsBlockNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductDetailsFieldDefsFromSchema(editorSchema, node.id)
      : node.fields?.length && isFeaturedProductDetailsPanelFields(node.fields)
        ? node.fields
        : featuredProductDetailsFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductDetailsSettingsNode({ ...node, fields });
    }
  }

  if (node.fields?.length) {
    const productHighlightSettingsBase = productHighlightSettingsBaseFromNodeId(node.id);
    if (productHighlightSettingsBase) {
      const catalogVariant = readProductHighlightSettingValue(
        values,
        config,
        productHighlightSettingsBase,
        'catalogVariant'
      );
      const variant = resolveProductHighlightVariant({
        label: node.label,
        catalogVariant,
        fields: node.fields,
      });
      if (variant === 'product-highlight') {
        return prepareProductHighlightSettingsNode(node, values, config);
      }
      if (variant === 'featured-product') {
        return prepareFeaturedProductSettingsNode(node, values, config);
      }
    }
  }

  if (node.fields?.length && isProductHotspotsSettingsPanelFields(node.fields)) {
    return prepareProductHotspotsSettingsNode(node);
  }
  if (node.kind === 'field' && isProductHotspotsHeadingFieldNodeId(node.id)) {
    const fields = productHotspotsHeadingFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareProductHotspotsHeadingSettingsNode({ ...node, fields });
    }
  }
  if (node.kind === 'block' && isProductHotspotsHotspotBlockNodeId(node.id)) {
    const fields = productHotspotsHotspotFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareProductHotspotsHotspotSettingsNode({ ...node, fields });
    }
  }
  if (node.kind === 'block' && isRecommendedProductsHeaderNodeId(node.id)) {
    const fields = recommendedProductsHeaderFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareRecommendedProductsHeaderSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isRecommendedProductsSettingsPanelFields(node.fields)) {
    return prepareRecommendedProductsSettingsNode(node);
  }

  if (
    node.fields?.length &&
    !isRecommendedProductsSettingsPanelFields(node.fields) &&
    !isProductHotspotsSettingsPanelFields(node.fields) &&
    isFeaturedProductSettingsPanelFields(node.fields)
  ) {
    return prepareFeaturedProductSettingsNode(node, values, config);
  }

  if (node.fields?.length && isProductHighlightSettingsPanelFields(node.fields)) {
    return prepareProductHighlightSettingsNode(node, values, config);
  }

  if (node.fields?.length && isEditorialSettingsPanelFields(node.fields)) {
    return prepareEditorialSettingsNode(node);
  }

  if (node.fields?.length && isEditorialJumboSettingsPanelFields(node.fields)) {
    return prepareEditorialJumboSettingsNode(node);
  }

  if (node.fields?.length && isCollectionLinksSpotlightSettingsPanelFields(node.fields)) {
    return prepareCollectionLinksSpotlightSettingsNode(node);
  }
  if (node.fields?.length && isImageWithTextSettingsPanelFields(node.fields)) {
    return prepareImageWithTextSettingsNode(node);
  }
  if (node.fields?.length && isStorytellingLogoSettingsPanelFields(node.fields)) {
    return prepareStorytellingLogoSettingsNode(node);
  }
  if (node.fields?.length && isStorytellingVideoSettingsPanelFields(node.fields)) {
    return prepareStorytellingVideoSettingsNode(node);
  }
  if (isFaqAccordionBlockNodeId(node.id)) {
    const fields = editorSchema
      ? faqAccordionFieldDefsFromSchema(editorSchema, node.id)
      : faqAccordionFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFaqAccordionSettingsNode({ ...node, fields });
    }
  }

  if (isFaqAccordionRowNestedNodeId(node.id)) {
    const fields = editorSchema
      ? faqAccordionRowFieldDefsFromSchema(editorSchema, node.id)
      : faqAccordionRowFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFaqAccordionRowSettingsNode({ ...node, fields });
    }
  }

  if (isFaqAccordionRowTextNestedNodeId(node.id)) {
    const fields = editorSchema
      ? faqAccordionRowTextFieldDefsFromSchema(editorSchema, node.id)
      : faqAccordionRowTextFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFaqAccordionRowTextSettingsNode({ ...node, fields });
    }
  }

  if (isIconsWithTextBlockNodeId(node.id)) {
    const fields = node.fields?.length
      ? node.fields
      : iconWithTextBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareIconsWithTextBlockSettingsNode({ ...node, fields });
    }
  }

  if (isTextMarqueeTextBlockNodeId(node.id) && node.fields?.length) {
    return prepareTextMarqueeTextBlockSettingsNode(node);
  }

  if (isMulticolumnNestedHeadingNodeId(node.id)) {
    const fields = multicolumnHeadingBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareHeadingBlockSettingsNode({ ...node, fields });
    }
  }

  if (isMulticolumnNestedDescriptionNodeId(node.id)) {
    const fields = multicolumnDescriptionBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareMulticolumnDescriptionBlockSettingsNode({ ...node, fields });
    }
  }

  if (isMulticolumnColumnNodeId(node.id)) {
    const fields = multicolumnColumnBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareMulticolumnColumnBlockSettingsNode({ ...node, fields });
    }
  }

  if (isMulticolumnBlockNodeId(node.id)) {
    const fields = multicolumnBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareMulticolumnBlockSettingsNode({ ...node, fields });
    }
  }

  if (isRichTextBlockNodeId(node.id)) {
    const fields = richTextBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareRichTextBlockSettingsNode({ ...node, fields });
    }
  }

  if (isImageWithTextGroupNodeId(node.id)) {
    return prepareImageWithTextGroupSettingsNode(node);
  }

  if (isImageWithTextBlockNodeId(node.id)) {
    const fields = imageWithTextBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageWithTextBlockSettingsNode({ ...node, fields });
    }
  }

  if (isStorytellingVideoCaptionGroupNodeId(node.id)) {
    return prepareStorytellingVideoCaptionGroupSettingsNode(node);
  }

  if (isStorytellingVideoBlockNodeId(node.id)) {
    const fields = storytellingVideoBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareStorytellingVideoBlockSettingsNode({ ...node, fields });
    }
  }

  if (isContactFormFormGroupNodeId(node.id)) {
    const fields = contactFormFormGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareContactFormFormGroupSettingsNode({ ...node, fields });
    }
  }

  if (isContactFormBlockNodeId(node.id)) {
    const fields = contactFormBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareContactFormBlockSettingsNode({ ...node, fields });
    }
  }

  if (isEmailSignupSectionBlockNodeId(node.id)) {
    const fields = emailSignupBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareEmailSignupSectionBlockSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareSectionBlockNodeId(node.id)) {
    const fields = imageCompareBlockFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareSectionBlockSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareContentGroupNodeId(node.id)) {
    const fields = imageCompareContentGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareContentGroupSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareTextGroupNodeId(node.id)) {
    const fields = imageCompareTextGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareTextGroupSettingsNode({ ...node, fields });
    }
  }

  if (isImageCompareButtonsGroupNodeId(node.id)) {
    const fields = imageCompareButtonsGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareImageCompareButtonsGroupSettingsNode({ ...node, fields });
    }
  }

  if (node.fields?.length && isIconsWithTextSettingsPanelFields(node.fields)) {
    return prepareIconsWithTextSettingsNode(node);
  }
  if (node.fields?.length && node.fields.every(isFaqAccordionRowTextField)) {
    return prepareFaqAccordionRowTextSettingsNode(node);
  }
  if (node.fields?.length && node.fields.every((f) => isFaqBlockField(f) || isFaqAccordionRowField(f))) {
    return prepareFaqAccordionRowSettingsNode(node);
  }
  if (node.fields?.length && isAnnouncementBlockPanelFields(node.fields)) {
    return prepareAnnouncementBlockSettingsNode(node);
  }
  if (node.fields?.length && isMulticolumnBlockFieldsOnly(node.fields)) {
    return prepareMulticolumnBlockSettingsNode(node);
  }
  if (node.fields?.length && node.fields.some((f) => f.path.endsWith('.icon'))) {
    return prepareIconsWithTextBlockSettingsNode(node);
  }
  if (node.fields?.length && node.fields.every(isIconsWithTextBlockField)) {
    return prepareIconsWithTextBlockSettingsNode(node);
  }
  if (node.fields?.length && isMulticolumnSettingsPanelFields(node.fields)) {
    return prepareMulticolumnSettingsNode(node);
  }
  if (node.fields?.length && isPullQuoteSettingsPanelFields(node.fields)) {
    return preparePullQuoteSettingsNode(node);
  }
  if (node.fields?.length && isRichTextSettingsPanelFields(node.fields)) {
    return prepareRichTextSettingsNode(node);
  }
  if (node.fields?.length && isTextMarqueeSettingsPanelFields(node.fields)) {
    if (!/:hero_main(?:_\d+)?:/.test(node.id)) {
      return prepareTextMarqueeSettingsNode(node);
    }
  }
  if (isBlogPostsCarouselSectionNodeId(node.id)) {
    return prepareBlogPostsCarouselSettingsNode(node);
  }
  if (isBlogPostsEditorialSectionNodeId(node.id)) {
    return prepareBlogPostsEditorialSettingsNode(node);
  }
  if (isBlogPostsGridSectionNodeId(node.id)) {
    return prepareBlogPostsGridSettingsNode(node);
  }
  if (node.fields?.length && isFeaturedCollectionCarouselSettingsPanelFields(node.fields)) {
    return prepareFeaturedCollectionSettingsNode(node, values, config);
  }
  if (node.fields?.length && isFeaturedCollectionGridSettingsPanelFields(node.fields)) {
    return prepareFeaturedCollectionSettingsNode(node, values, config);
  }
  if (node.fields?.length && isFeaturedCollectionEditorialSettingsPanelFields(node.fields)) {
    return prepareFeaturedCollectionSettingsNode(node, values, config);
  }
  if (node.fields?.length && isBlogPostsCarouselSettingsPanelFields(node.fields)) {
    return prepareBlogPostsCarouselSettingsNode(node);
  }
  if (node.fields?.length && isBlogPostsEditorialSettingsPanelFields(node.fields)) {
    return prepareBlogPostsEditorialSettingsNode(node);
  }
  if (node.fields?.length && isCollectionListBentoSettingsPanelFields(node.fields)) {
    return prepareCollectionListBentoSettingsNode(node);
  }
  if (node.fields?.length && isCollectionListCarouselSettingsPanelFields(node.fields)) {
    return prepareCollectionListCarouselSettingsNode(node);
  }
  if (node.fields?.length && isCollectionListEditorialSettingsPanelFields(node.fields)) {
    return prepareCollectionListEditorialSettingsNode(node);
  }
  if (node.fields?.length && isCollectionListGridSettingsPanelFields(node.fields)) {
    return prepareCollectionListGridSettingsNode(node);
  }
  if (node.fields?.length && isCollectionListUnifiedSettingsPanelFields(node.fields)) {
    return prepareCollectionListSettingsNode(node);
  }
  if (node.fields?.length && isBlogPostsGridSettingsPanelFields(node.fields)) {
    return prepareBlogPostsGridSettingsNode(node);
  }
  if (node.kind === 'field' && isCollectionLinkTitleFieldNodeId(node.id)) {
    let fields = editorSchema ? collectionLinkTitleFieldDefsFromSchema(editorSchema, node.id) : [];
    if (!fields.length) {
      fields = collectionLinkTitleFieldDefsFromSchema(
        { templates: [], layout: {} } as EditorSchemaDoc,
        node.id
      );
    }
    return prepareCollectionLinkTitleSettingsNode({ ...node, fields });
  }
  if (node.kind === 'field' && isCollectionLinkImageFieldNodeId(node.id)) {
    let fields = editorSchema ? collectionLinkImageFieldDefsFromSchema(editorSchema, node.id) : [];
    if (!fields.length) {
      fields = (node.fields ?? []).filter(isCollectionLinkImagePanelField);
    }
    return prepareCollectionLinkImageSettingsNode({ ...node, fields });
  }

  if (node.kind === 'block' && isCollectionLinkBlockNodeId(node.id)) {
    const fields = editorSchema
      ? collectionLinkBlockFieldDefsFromSchema(editorSchema, node.id)
      : (node.fields ?? []).filter(isCollectionLinkBlockField);
    return prepareCollectionLinkBlockSettingsNode({ ...node, fields });
  }

  if (node.fields?.length && isCollectionLinkBlockFieldsOnly(node.fields)) {
    return prepareCollectionLinkBlockSettingsNode(node);
  }
  if (node.fields?.length && isLayeredSlideshowSettingsPanelFields(node.fields)) {
    return prepareLayeredSlideshowSettingsNode(node);
  }
  if (node.fields?.length && isSlideshowFullFrameSettingsPanelFields(node.fields)) {
    return prepareSlideshowFullFrameSettingsNode(node);
  }
  if (node.fields?.length && isSlideshowInsetSettingsPanelFields(node.fields)) {
    return prepareSlideshowInsetSettingsNode(node);
  }
  if (
    node.kind === 'block' &&
    node.fields?.length &&
    /:block:[^:]+:nested:slide_(heading|text|button)$/.test(node.id)
  ) {
    return node;
  }
  if (node.fields?.length && isSlideshowSlideBlockFieldsOnly(node.fields)) {
    return prepareSlideshowSlideBlockSettingsNode(node);
  }
  if (node.fields?.length && isCollectionTileBlockFieldsOnly(node.fields)) {
    return prepareCollectionTileBlockSettingsNode(node);
  }
  if (isBlogPostsGridTitleBlockNodeId(node.id)) {
    const fields = blogPostsGridBlockFieldDefsFromNodeId(node.id);
    if (fields.length) return { ...node, fields };
  }
  if (isBlogPostsGridCardGroupBlockNodeId(node.id)) {
    const fields = blogPostsGridCardFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareBlogPostsGridCardSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isBlogPostsGridCardPanelFields(node.fields)) {
    return prepareBlogPostsGridCardSettingsNode(node);
  }
  if (
    isBlogPostsGridCardImageBlockNodeId(node.id) ||
    isBlogPostsGridCardTitleBlockNodeId(node.id) ||
    isBlogPostsGridCardDetailsBlockNodeId(node.id) ||
    isBlogPostsGridCardExcerptBlockNodeId(node.id)
  ) {
    const fields = blogPostsGridBlockFieldDefsFromNodeId(node.id);
    if (fields.length) return { ...node, fields };
  }
  if (isStorytellingCarouselCardBlockNodeId(node.id)) {
    const fields = storytellingCarouselCardFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareStorytellingCarouselCardSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isStorytellingCarouselCardPanelFields(node.fields)) {
    return prepareStorytellingCarouselCardSettingsNode(node);
  }
  if (isStorytellingCarouselContentGroupBlockNodeId(node.id)) {
    const fields = storytellingCarouselContentGroupFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareStorytellingCarouselContentGroupSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isStorytellingCarouselContentGroupPanelFields(node.fields)) {
    return prepareStorytellingCarouselContentGroupSettingsNode(node);
  }
  if (isStorytellingCarouselHeaderGroupBlockNodeId(node.id)) {
    const fields = storytellingCarouselHeaderFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareStorytellingCarouselHeaderGroupSettingsNode({ ...node, fields });
    }
  }
  if (node.fields?.length && isStorytellingCarouselHeaderGroupPanelFields(node.fields)) {
    return prepareStorytellingCarouselHeaderGroupSettingsNode(node);
  }
  if (isStorytellingCarouselHeaderBlockNodeId(node.id)) {
    const fields = storytellingCarouselBlockFieldDefsFromNodeId(node.id);
    if (fields.length) return { ...node, fields };
  }
  if (node.fields?.length && isStorytellingCarouselSettingsPanelFields(node.fields)) {
    return prepareStorytellingCarouselSettingsNode(node);
  }

  const heroSection =
    node.kind === 'section' && isHeroSectionNodeId(node.id)
      ? node
      : findHeroSectionInTree(node.id, tree);

  if (node.kind === 'section' && heroSection) {
    const heroFieldsFromSchema =
      editorSchema ? heroSectionFieldDefsFromSchema(editorSchema, heroSection.id) : [];
    const heroFields =
      heroFieldsFromSchema.length > 0
        ? heroFieldsFromSchema
        : (heroSection.fields?.length ? heroSection.fields : node.fields) ?? [];
    const fallbackFields = heroFields.length ? heroFields : fallbackHeroSectionFieldDefs(heroSection.id);
    if (fallbackFields.length) {
      return prepareHeroSectionSettingsForNode({ ...heroSection, fields: fallbackFields }, fallbackFields);
    }
  }

  if (node.kind === 'section' && node.fields?.length) {
    const prepared = prepareSectionPanelNode(node, values, config);
    if (prepared?.fields?.length) return prepared;
    return node;
  }
  if (node.fields?.length) return node;
  if (node.kind === 'block' && node.children?.length) {
    const fieldRows = node.children.filter((c) => c.kind === 'field' && c.fields?.length);
    if (fieldRows.length === 1) return fieldRows[0];
    if (fieldRows.length > 1) {
      return {
        ...node,
        fields: fieldRows.flatMap((c) => c.fields ?? []),
      };
    }
  }

  if (node.kind === 'section' && editorSchema) {
    let fields = node.fields ?? [];
    if (!fields.length) {
      fields = sectionSettingsFieldsFromSchema(editorSchema, node.id);
      if (fields.length) node = { ...node, fields };
    }
    const prepared = prepareSectionPanelNode(node, values, config);
    if (prepared?.fields?.length) return prepared;
    const visible = fields.filter(
      (f) => f.sidebar !== false && isSectionSettingsFieldPath(f.path ?? '')
    );
    if (visible.length) return { ...node, fields: visible };
  }

  return null;
}
