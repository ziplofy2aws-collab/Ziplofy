import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDownIcon,
  CircleStackIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  LinkIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  fieldInputId,
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import { ThemePaletteColorField } from '../settings/ThemePaletteColorField';
import { ThemeDefaultColorField } from '../settings/ThemeDefaultColorField';
import { ThemeHexColorField } from '../settings/ThemeHexColorField';
import { readThemeColorPalette } from '../settings/theme-color-palette.settings';
import { useBlogs } from '../../contexts/blog.context';
import { useCollections } from '../../contexts/collection.context';
import { useStore } from '../../contexts/store.context';
import toast from 'react-hot-toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { ThemeEditorRichTextField } from '../../components/theme-editor/ThemeEditorRichTextField';
import { ThemeEditorLinkField } from '../../components/theme-editor/ThemeEditorLinkField';
import { ThemeEditorImagePickerModal } from './ThemeEditorImagePickerModal';
import { ThemeEditorCreateCollectionSheet } from './ThemeEditorCreateCollectionSheet';
import {
  CheckoutThemeColorField,
} from '../checkout/settings/CheckoutThemeSettingsFields';
import type { CheckoutColorSetting } from '../checkout/settings/checkout-settings.types';
import {
  groupHeroPanelFields,
  HERO_PANEL_GROUP_ORDER,
  isHeroSectionNodeId,
  isHeroSectionSettingsNode,
  isHeroSettingsPanelFields,
  pickHeroMobileMediaSlotFields,
} from './theme-editor-hero-panel.utils';
import {
  groupHeadingPanelFields,
  HEADING_CUSTOM_TYPOGRAPHY_KEYS,
  HEADING_PANEL_GROUP_ORDER,
  filterHeadingPanelFieldsForTypographyPreset,
  inferHeadingPanelGroup,
  isHeadingBlockPanelFields,
  isHeadingBlockNodeId,
  isHeadingTypographyCustomPreset,
  prepareHeadingBlockSettingsNode,
  resolveHeadingTypographyField,
} from './theme-editor-heading-block-panel.utils';
import {
  COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEYS,
  COLLECTION_TITLE_PANEL_GROUP_ORDER,
  filterCollectionTitlePanelFieldsForTypographyPreset,
  groupCollectionTitlePanelFields,
  groupCollectionTitleStylePanelFields,
  isCollectionTitleNestedNodeId,
  isCollectionTitlePanelFields,
  isCollectionTitleTypographyCustomPreset,
  prepareCollectionTitleSettingsNode,
  prepareCollectionTitleStyleSettingsNode,
  resolveCollectionTitleTypographyField,
} from './theme-editor-fc-collection-title-panel.utils';
import {
  isFaqHeadingCollectionTitlePanelNode,
  mapCollectionTitlePathToFaqHeadingPath,
  mapFaqHeadingFieldsToCollectionTitleFields,
  mapFaqHeadingValuesToCollectionTitleValues,
} from './theme-editor-faq-heading-panel.utils';
import {
  isViewAllButtonNestedNodeId,
  isViewAllButtonPanelFields,
} from './theme-editor-fc-view-all-button-panel.utils';
import { ViewAllButtonSettingsPanel } from './theme-editor-fc-view-all-button-settings-panel';
import {
  FC_HEADER_PANEL_GROUP_ORDER,
  groupFeaturedCollectionHeaderPanelFields,
  isFeaturedCollectionHeaderBlockNodeId,
  isFeaturedCollectionHeaderPanelFields,
  pickFeaturedCollectionHeaderField,
  resolveFeaturedCollectionHeaderColorField,
  resolveFeaturedCollectionHeaderBorderSliderField,
  resolveFeaturedCollectionHeaderImageField,
  resolveFeaturedCollectionHeaderImagePositionField,
  resolveFeaturedCollectionHeaderCustomHeightField,
  resolveFeaturedCollectionHeaderCustomWidthField,
  featuredCollectionHeaderPercentValue,
  featuredCollectionHeaderSettingsBase,
  clampFeaturedCollectionHeaderPercent,
  FC_HEADER_PERCENT_SLIDER_BOUNDS,
} from './theme-editor-fc-header-panel.utils';
import {
  isHeroButtonBlockNodeId,
  isHeroButtonPanelFields,
} from './theme-editor-hero-button-panel.utils';
import {
  HeroButtonSettingsPanel,
  HeroButtonLabelFieldRow,
  HeroButtonToggleFieldRow,
  HeroButtonCustomWidthFieldRow,
} from './theme-editor-hero-button-settings-panel';
import {
  groupLargeLogoPanelFields,
  LARGE_LOGO_PANEL_GROUP_ORDER,
  isLargeLogoSettingsPanelFields,
} from './theme-editor-large-logo-panel.utils';
import {
  groupSplitShowcasePanelFields,
  SPLIT_SHOWCASE_PANEL_GROUP_ORDER,
  isSplitShowcaseSettingsPanelFields,
} from './theme-editor-split-showcase-panel.utils';
import {
  FOOTER_PANEL_GROUP_ORDER,
  groupFooterPanelFields,
  isFooterSettingsPanelFields,
} from './theme-editor-footer-panel.utils';
import {
  FOOTER_UTILITIES_PANEL_GROUP_ORDER,
  groupFooterUtilitiesPanelFields,
  isFooterUtilitiesSettingsPanelFields,
} from './theme-editor-footer-utilities-panel.utils';
import {
  CONTACT_FORM_PANEL_GROUP_ORDER,
  groupContactFormPanelFields,
  isContactFormSettingsPanelFields,
} from './theme-editor-contact-form-panel.utils';
import {
  isContactFormBlockFieldsOnly,
  isContactFormBlockNodeId,
  isContactFormTextBlockNodeId,
  isContactFormTextBlockFieldsOnly,
  CONTACT_FORM_TEXT_PANEL_GROUP_ORDER,
  groupContactFormTextPanelFields,
  filterContactFormTextFieldsForPreset,
  isContactFormFormGroupNodeId,
  isContactFormFormGroupFieldsOnly,
  CONTACT_FORM_FORM_GROUP_PANEL_GROUP_ORDER,
  groupContactFormFormGroupPanelFields,
  isContactFormSubmitButtonNodeId,
  CONTACT_FORM_SUBMIT_PANEL_GROUP_ORDER,
  groupContactFormSubmitPanelFields,
} from './theme-editor-contact-form-block-panel.utils';
import {
  isEmailSignupSectionBlockFieldsOnly,
  isEmailSignupSectionBlockNodeId,
  isEmailSignupHeadingBlockNodeId,
  isEmailSignupHeadingBlockFieldsOnly,
  EMAIL_SIGNUP_HEADING_PANEL_GROUP_ORDER,
  groupEmailSignupHeadingPanelFields,
  filterEmailSignupHeadingFieldsForPreset,
  isEmailSignupTextBlockNodeId,
  isEmailSignupTextBlockFieldsOnly,
  EMAIL_SIGNUP_TEXT_PANEL_GROUP_ORDER,
  groupEmailSignupTextPanelFields,
  filterEmailSignupTextFieldsForPreset,
  isEmailSignupFormBlockNodeId,
  isEmailSignupFormBlockFieldsOnly,
  EMAIL_SIGNUP_FORM_PANEL_GROUP_ORDER,
  groupEmailSignupFormPanelFields,
} from './theme-editor-email-signup-block-panel.utils';
import {
  EMAIL_SIGNUP_PANEL_GROUP_ORDER,
  groupEmailSignupPanelFields,
  isEmailSignupSettingsPanelFields,
} from './theme-editor-email-signup-panel.utils';
import {
  CUSTOM_SECTION_PANEL_GROUP_ORDER,
  groupCustomSectionPanelFields,
  isCustomSectionSettingsPanelFields,
} from './theme-editor-custom-section-panel.utils';
import {
  DIVIDER_PANEL_GROUP_ORDER,
  groupDividerPanelFields,
  isDividerSettingsPanelFields,
} from './theme-editor-divider-panel.utils';
import {
  PRODUCT_HIGHLIGHT_PANEL_GROUP_ORDER,
  groupProductHighlightPanelFields,
  isProductHighlightSettingsPanelFields,
  productHighlightSettingsBaseFromNodeId,
  productHighlightVariantLabel,
  readProductHighlightSettingValue,
  resolveProductHighlightVariant,
} from './theme-editor-product-highlight-panel.utils';
import {
  PRODUCT_HIGHLIGHT_IMAGE_PANEL_GROUP_ORDER,
  PRODUCT_HIGHLIGHT_PRICE_PANEL_GROUP_ORDER,
  PRODUCT_HIGHLIGHT_SWATCHES_PANEL_GROUP_ORDER,
  PRODUCT_HIGHLIGHT_TITLE_PANEL_GROUP_ORDER,
  groupProductHighlightProductImagePanelFields,
  groupProductHighlightProductPricePanelFields,
  groupProductHighlightProductSwatchesPanelFields,
  groupProductHighlightProductTitlePanelFields,
  isProductHighlightProductImageNestedNodeId,
  isProductHighlightProductImagePanelFields,
  isProductHighlightProductPriceNestedNodeId,
  isProductHighlightProductPricePanelFields,
  isProductHighlightProductSwatchesNestedNodeId,
  isProductHighlightProductSwatchesPanelFields,
  isProductHighlightProductTitleNestedNodeId,
  isProductHighlightProductTitlePanelFields,
} from './theme-editor-product-highlight-product-block-panel.utils';
import {
  isProductHighlightMediaBlockNodeId,
  isProductHighlightMediaPanelFields,
  isProductHighlightProductBlockNodeId,
} from './theme-editor-product-highlight-media-block-panel.utils';
import {
  FEATURED_PRODUCT_LAYOUT_FIELD_ORDER,
  FEATURED_PRODUCT_PANEL_GROUP_ORDER,
  groupFeaturedProductPanelFields,
  isFeaturedProductSettingsPanelFields,
} from './theme-editor-featured-product-panel.utils';
import {
  FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER,
  groupFeaturedProductMediaPanelFields,
  isFeaturedProductMediaBlockNodeId,
  isFeaturedProductMediaPanelFields,
  prepareFeaturedProductMediaSettingsNode,
} from './theme-editor-featured-product-media-block-panel.utils';
import {
  FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER,
  groupFeaturedProductDetailsPanelFields,
  isFeaturedProductDetailsBlockNodeId,
  isFeaturedProductDetailsPanelFields,
  pickFeaturedProductDetailsField,
  prepareFeaturedProductDetailsSettingsNode,
  resolveFeaturedProductDetailsCustomWidthField,
} from './theme-editor-featured-product-details-block-panel.utils';
import {
  FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER,
  groupFeaturedProductHeaderPanelFields,
  isFeaturedProductHeaderBlockNodeId,
  isFeaturedProductHeaderPanelFields,
  pickFeaturedProductHeaderField,
  resolveFeaturedProductHeaderCustomHeightField,
  resolveFeaturedProductHeaderCustomWidthField,
} from './theme-editor-featured-product-header-block-panel.utils';
import {
  COLLECTION_LIST_HEADER_PANEL_GROUP_ORDER,
  groupCollectionListHeaderPanelFields,
  isCollectionListSectionHeaderBlockNodeId,
  isCollectionListSectionHeaderPanelFields,
  pickCollectionListHeaderField,
  resolveCollectionListHeaderCustomHeightField,
  resolveCollectionListHeaderCustomWidthField,
} from './theme-editor-collection-list-header-panel.utils';
import {
  isFeaturedProductAcceleratedCheckoutNestedNodeId,
} from './theme-editor-featured-product-accelerated-checkout-panel.utils';
import {
  groupFeaturedProductQuantityPanelFields,
  isFeaturedProductQuantityNestedNodeId,
  isFeaturedProductQuantityPanelFields,
} from './theme-editor-featured-product-quantity-panel.utils';
import {
  groupFeaturedProductAddToCartPanelFields,
  isFeaturedProductAddToCartNestedNodeId,
  isFeaturedProductAddToCartPanelFields,
} from './theme-editor-featured-product-add-to-cart-panel.utils';
import {
  FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER,
  groupFeaturedProductBuyButtonsPanelFields,
  isFeaturedProductBuyButtonsBlockNodeId,
  isFeaturedProductBuyButtonsPanelFields,
} from './theme-editor-featured-product-buy-buttons-block-panel.utils';
import {
  FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER,
  groupFeaturedProductReviewStarsPanelFields,
  isFeaturedProductReviewStarsBlockNodeId,
  isFeaturedProductReviewStarsPanelFields,
} from './theme-editor-featured-product-review-stars-block-panel.utils';
import {
  FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER,
  groupFeaturedProductVariantPickerPanelFields,
  isFeaturedProductVariantPickerBlockNodeId,
  isFeaturedProductVariantPickerPanelFields,
} from './theme-editor-featured-product-variant-picker-block-panel.utils';
import {
  FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER,
  groupFeaturedProductHeaderPricePanelFields,
  isFeaturedProductHeaderPriceNestedNodeId,
  isFeaturedProductHeaderPricePanelFields,
} from './theme-editor-featured-product-header-price-panel.utils';
import {
  PRODUCT_CARD_PRICE_PANEL_GROUP_ORDER,
  groupProductCardPricePanelFields,
  isProductCardPriceNestedNodeId,
  isProductCardPricePanelFields,
} from './theme-editor-product-card-price-panel.utils';
import {
  PRODUCT_CARD_TITLE_PANEL_GROUP_ORDER,
  groupProductCardTitlePanelFields,
  isProductCardTitleNestedNodeId,
  isProductCardTitlePanelFields,
} from './theme-editor-product-card-title-panel.utils';
import {
  PRODUCT_CARD_MEDIA_PANEL_GROUP_ORDER,
  groupProductCardMediaPanelFields,
  isProductCardMediaNestedNodeId,
  isProductCardMediaPanelFields,
} from './theme-editor-product-card-media-panel.utils';
import {
  PRODUCT_CARD_PANEL_GROUP_ORDER,
  groupProductCardPanelFields,
  isProductCardBlockNodeId,
  isProductCardPanelFields,
} from './theme-editor-product-card-panel.utils';
import {
  FEATURED_PRODUCT_HEADER_TITLE_PANEL_GROUP_ORDER,
  groupFeaturedProductHeaderTitlePanelFields,
  isFeaturedProductHeaderTitleNestedNodeId,
  isFeaturedProductHeaderTitlePanelFields,
} from './theme-editor-featured-product-header-title-panel.utils';
import { ProductPickerFieldRow } from './ProductPickerFieldRow';
import {
  EDITORIAL_PANEL_GROUP_ORDER,
  groupEditorialPanelFields,
  isEditorialSettingsPanelFields,
} from './theme-editor-editorial-panel.utils';
import {
  isEditorialContentGroupPanelFields,
  isEditorialContentGroupBlockNodeId,
  pickEditorialContentGroupField,
} from './theme-editor-editorial-content-group-panel.utils';
import {
  EDITORIAL_GROUP_PANEL_GROUP_ORDER,
  groupEditorialTextGroupPanelFields,
  isEditorialTextGroupPanelFields,
  isEditorialNestedGroupBlockNodeId,
  pickEditorialTextGroupField,
  resolveEditorialTextGroupCustomWidthField,
  resolveEditorialTextGroupCustomHeightField,
} from './theme-editor-editorial-group-panel.utils';
import {
  isEditorialMediaBlockNodeId,
  isEditorialMediaPanelFields,
  isEditorialCaptionBlockNodeId,
  isEditorialCaptionPanelFields,
  isEditorialHeadingBlockNodeId,
  isEditorialHeadingPanelFields,
  isEditorialTextBlockNodeId,
  isEditorialTextPanelFields,
  isEditorialButtonBlockNodeId,
  isEditorialButtonPanelFields,
  pickEditorialBlockField,
} from './theme-editor-editorial-block-panel.utils';
import {
  EDITORIAL_JUMBO_PANEL_GROUP_ORDER,
  groupEditorialJumboPanelFields,
  isEditorialJumboSettingsPanelFields,
} from './theme-editor-editorial-jumbo-panel.utils';
import {
  isEditorialJumboContentGroupPanelFields,
  isEditorialJumboContentGroupBlockNodeId,
  pickEditorialJumboContentGroupField,
} from './theme-editor-editorial-jumbo-content-group-panel.utils';
import {
  isEditorialJumboMediaBlockNodeId,
  isEditorialJumboMediaPanelFields,
  isEditorialJumboJumboTextBlockNodeId,
  isEditorialJumboJumboTextPanelFields,
  pickEditorialJumboBlockField,
} from './theme-editor-editorial-jumbo-block-panel.utils';
import {
  groupImageCompareContentGroupPanelFields,
  IMAGE_COMPARE_CONTENT_GROUP_PANEL_GROUP_ORDER,
  isImageCompareContentGroupFieldsOnly,
  pickImageCompareContentGroupField,
  prepareImageCompareContentGroupSettingsNode,
  resolveImageCompareContentGroupCustomHeightField,
  resolveImageCompareContentGroupCustomWidthField,
} from './theme-editor-image-compare-content-group-panel.utils';
import {
  groupImageCompareButtonsGroupPanelFields,
  IMAGE_COMPARE_BUTTONS_GROUP_PANEL_GROUP_ORDER,
  isImageCompareButtonsGroupPanelFields,
  pickImageCompareButtonsGroupField,
  prepareImageCompareButtonsGroupSettingsNode,
  resolveImageCompareButtonsGroupCustomHeightField,
  resolveImageCompareButtonsGroupCustomWidthField,
} from './theme-editor-image-compare-buttons-group-panel.utils';
import {
  groupImageCompareTextGroupPanelFields,
  IMAGE_COMPARE_TEXT_GROUP_PANEL_GROUP_ORDER,
  isImageCompareTextGroupPanelFields,
  pickImageCompareTextGroupField,
  prepareImageCompareTextGroupSettingsNode,
  resolveImageCompareTextGroupCustomHeightField,
  resolveImageCompareTextGroupCustomWidthField,
} from './theme-editor-image-compare-text-group-panel.utils';
import {
  imageCompareButtonPanelKeysForNodeId,
  isImageCompareButtonBlockFieldsOnly,
  isImageCompareButtonBlockNodeId,
  isImageCompareButtonsGroupNodeId,
  isImageCompareContentGroupNodeId,
  isImageCompareHeadingBlockNodeId,
  isImageCompareHeadingPanelFields,
  isImageCompareSubheadingBlockNodeId,
  isImageCompareSubheadingPanelFields,
  isImageCompareTextGroupNodeId,
} from './theme-editor-image-compare-block-panel.utils';
import {
  isImageCompareSliderBlockFieldsOnly,
  isImageCompareSliderBlockNodeId,
  pickComparisonSliderField,
  prepareComparisonSliderBlockSettingsNode,
} from './theme-editor-image-compare-slider-block-panel.utils';
import {
  groupImageComparePanelFields,
  IMAGE_COMPARE_LAYOUT_FIELD_ORDER,
  IMAGE_COMPARE_PANEL_GROUP_ORDER,
  isImageCompareSettingsPanelFields,
} from './theme-editor-image-compare-panel.utils';
import {
  groupImageWithTextPanelFields,
  IMAGE_WITH_TEXT_PANEL_GROUP_ORDER,
  isImageWithTextSettingsPanelFields,
} from './theme-editor-image-with-text-panel.utils';
import {
  isImageWithTextButtonBlockNodeId,
  isImageWithTextButtonPanelFields,
  isImageWithTextHeadingBlockNodeId,
  isImageWithTextHeadingPanelFields,
  isImageWithTextImageBlockNodeId,
  isImageWithTextTextBlockNodeId,
  isImageWithTextTextPanelFields,
} from './theme-editor-image-with-text-block-panel.utils';
import {
  isImageWithTextImagePanelFields,
  pickImageWithTextImageField,
} from './theme-editor-image-with-text-image-panel.utils';
import {
  IMAGE_WITH_TEXT_GROUP_PANEL_GROUP_ORDER,
  groupImageWithTextContentGroupPanelFields,
  isImageWithTextGroupBlockNodeId,
  isImageWithTextContentGroupPanelFields,
  pickImageWithTextContentGroupField,
  resolveImageWithTextContentGroupCustomHeightField,
  resolveImageWithTextContentGroupCustomWidthField,
} from './theme-editor-image-with-text-group-panel.utils';
import {
  groupStorytellingLogoPanelFields,
  STORYTELLING_LOGO_PANEL_GROUP_ORDER,
  isStorytellingLogoSettingsPanelFields,
} from './theme-editor-storytelling-logo-panel.utils';
import {
  groupStorytellingVideoPanelFields,
  STORYTELLING_VIDEO_PANEL_GROUP_ORDER,
  isStorytellingVideoSettingsPanelFields,
} from './theme-editor-storytelling-video-panel.utils';
import {
  isStorytellingVideoBlockFieldsOnly,
  isStorytellingVideoBlockNodeId,
  isStorytellingVideoCaptionButtonBlockNodeId,
  isStorytellingVideoCaptionButtonPanelFields,
  isStorytellingVideoCaptionTextBlockNodeId,
  isStorytellingVideoCaptionTextPanelFields,
  isStorytellingVideoMediaBlockNodeId,
} from './theme-editor-storytelling-video-block-panel.utils';
import {
  STORYTELLING_VIDEO_CAPTION_PANEL_GROUP_ORDER,
  groupStorytellingVideoCaptionPanelFields,
  isStorytellingVideoCaptionGroupBlockNodeId,
  isStorytellingVideoCaptionGroupPanelFields,
  pickStorytellingVideoCaptionField,
  resolveStorytellingVideoCaptionCustomHeightField,
  resolveStorytellingVideoCaptionCustomWidthField,
} from './theme-editor-storytelling-video-caption-panel.utils';
import {
  STORYTELLING_VIDEO_MEDIA_PANEL_GROUP_ORDER,
  groupStorytellingVideoMediaPanelFields,
  isStorytellingVideoMediaPanelFields,
} from './theme-editor-storytelling-video-media-panel.utils';
import {
  groupFaqPanelFields,
  FAQ_PANEL_GROUP_ORDER,
  FAQ_LAYOUT_FIELD_ORDER,
  FAQ_PADDING_FIELD_ORDER,
  sortFaqGroupFields,
  isFaqLayoutPanelFields,
  isFaqSectionNodeId,
  isFaqSettingsPanelFields,
  faqBackgroundColorForPicker,
} from './theme-editor-faq-panel.utils';
import {
  FAQ_ACCORDION_APPEARANCE_FIELD_ORDER,
  FAQ_ACCORDION_GENERAL_FIELD_ORDER,
  FAQ_ACCORDION_HEADING_PRESET_OPTIONS,
  FAQ_ACCORDION_PADDING_FIELD_ORDER,
  FAQ_ACCORDION_PANEL_GROUP_ORDER,
  groupFaqAccordionPanelFields,
  isFaqAccordionBlockNodeId,
  isFaqAccordionPanelFields,
} from './theme-editor-faq-accordion-block-panel.utils';
import {
  FAQ_ACCORDION_ROW_CONTENT_FIELD_ORDER,
  FAQ_ACCORDION_ROW_ICON_FIELD_ORDER,
  isFaqAccordionRowNestedNodeId,
  isFaqAccordionRowPanelFields,
} from './theme-editor-faq-accordion-row-panel.utils';
import { FAQ_ACCORDION_ROW_ICON_OPTIONS } from '../faq/runtime/faqAccordionRowIcons';
import {
  groupTextBlockPanelFields,
  isFaqAccordionRowTextNestedNodeId,
  isTextBlockPanelFields,
  isTextBlockTypographyCustomPreset,
  filterTextBlockPanelFieldsForTypographyPreset,
  resolveTextBlockTypographyField,
  TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS,
  TEXT_BLOCK_PANEL_GROUP_ORDER,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
} from './theme-editor-faq-accordion-row-text-panel.utils';
import { inferTextBlockPanelGroup } from './theme-editor-text-block-panel.utils';
import {
  groupIconsWithTextPanelFields,
  ICONS_WITH_TEXT_PANEL_GROUP_ORDER,
  isIconsWithTextBlockField,
  isIconsWithTextBlockNodeId,
  isIconsWithTextSettingsPanelFields,
} from './theme-editor-icons-with-text-panel.utils';
import {
  groupMulticolumnPanelFields,
  MULTICOLUMN_PANEL_GROUP_ORDER,
  isMulticolumnBlockField,
  isMulticolumnBlockNodeId,
  isMulticolumnColumnNodeId,
  isMulticolumnNestedDescriptionNodeId,
  isMulticolumnSettingsPanelFields,
  groupMulticolumnColumnPanelFields,
  MULTICOLUMN_COLUMN_PANEL_GROUP_ORDER,
  pickMulticolumnColumnField,
  groupMulticolumnDescriptionPanelFields,
  MULTICOLUMN_DESCRIPTION_PANEL_GROUP_ORDER,
  filterMulticolumnDescriptionFieldsForPreset,
} from './theme-editor-multicolumn-panel.utils';
import {
  groupMarqueeTextPanelFields,
  MARQUEE_TEXT_PANEL_GROUP_ORDER,
  filterMarqueeTextFieldsForPreset,
} from './theme-editor-text-marquee-panel.utils';
import { isTextMarqueeTextBlockNodeId } from '../../utils/text-marquee-sidebar.util';
import {
  groupPullQuotePanelFields,
  PULL_QUOTE_PANEL_GROUP_ORDER,
  isPullQuoteSettingsPanelFields,
} from './theme-editor-pull-quote-panel.utils';
import {
  isPullQuoteButtonPanelFields,
  isPullQuoteTextPanelFields,
} from '../../utils/pull-quote-sidebar.util';
import {
  groupRichTextPanelFields,
  RICH_TEXT_PANEL_GROUP_ORDER,
  isRichTextBlockField,
  isRichTextBlockNodeId,
  isRichTextButtonPanelFields,
  isRichTextTextPanelFields,
  isRichTextHeadingPanelFields,
  isRichTextSettingsPanelFields,
} from './theme-editor-rich-text-panel.utils';
import {
  groupTextMarqueePanelFields,
  TEXT_MARQUEE_PANEL_GROUP_ORDER,
  isTextMarqueeSettingsPanelFields,
} from './theme-editor-text-marquee-panel.utils';
import {
  groupBlogPostsCarouselPanelFields,
  BLOG_POSTS_CAROUSEL_PANEL_GROUP_ORDER,
  isBlogPostsCarouselSettingsPanelFields,
  pickBlogPostsCarouselSectionField,
} from './theme-editor-blog-posts-carousel-panel.utils';
import {
  groupBlogPostsEditorialPanelFields,
  BLOG_POSTS_EDITORIAL_PANEL_GROUP_ORDER,
  isBlogPostsEditorialSettingsPanelFields,
} from './theme-editor-blog-posts-editorial-panel.utils';
import {
  groupBlogPostsGridPanelFields,
  BLOG_POSTS_GRID_PANEL_GROUP_ORDER,
  isBlogPostsGridSettingsPanelFields,
  pickBlogPostsGridSectionField,
} from './theme-editor-blog-posts-grid-panel.utils';
import {
  BLOG_POSTS_GRID_CARD_PANEL_GROUP_ORDER,
  groupBlogPostsGridCardPanelFields,
  isBlogPostsGridCardGroupBlockNodeId,
  isBlogPostsGridCardPanelFields,
  pickBlogPostsGridCardField,
} from './theme-editor-blog-posts-grid-card-panel.utils';
import {
  isBlogPostsGridTitleBlockNodeId,
  isBlogPostsGridCardImageBlockNodeId,
  isBlogPostsGridCardImagePanelFields,
  isBlogPostsGridCardTitleBlockNodeId,
  isBlogPostsGridCardTitlePanelFields,
  isBlogPostsGridCardDetailsBlockNodeId,
  isBlogPostsGridCardDetailsPanelFields,
  isBlogPostsGridCardExcerptBlockNodeId,
  isBlogPostsGridCardExcerptPanelFields,
  isBlogPostsGridSectionTitlePanelFields,
  pickBlogPostsGridBlockField,
} from './theme-editor-blog-posts-grid-block-panel.utils';
import {
  groupStorytellingCarouselPanelFields,
  STORYTELLING_CAROUSEL_PANEL_GROUP_ORDER,
  isStorytellingCarouselSettingsPanelFields,
  pickStorytellingCarouselSectionField,
} from './theme-editor-storytelling-carousel-panel.utils';
import {
  isStorytellingCarouselCardImageBlockNodeId,
  isStorytellingCarouselCardImagePanelFields,
  isStorytellingCarouselCardBlockNodeId,
  isStorytellingCarouselHeaderBlockNodeId,
  isStorytellingCarouselHeaderPanelFields,
  isStorytellingCarouselCardHeadingBlockNodeId,
  isStorytellingCarouselCardHeadingPanelFields,
  isStorytellingCarouselCardTextBlockNodeId,
  pickStorytellingCarouselBlockField,
  isStorytellingCarouselCardTextPanelFields,
} from './theme-editor-storytelling-carousel-block-panel.utils';
import {
  STORYTELLING_CAROUSEL_CARD_PANEL_GROUP_ORDER,
  groupStorytellingCarouselCardPanelFields,
  isStorytellingCarouselCardPanelFields,
  pickStorytellingCarouselCardField,
} from './theme-editor-storytelling-carousel-card-panel.utils';
import {
  STORYTELLING_CAROUSEL_CONTENT_GROUP_PANEL_GROUP_ORDER,
  groupStorytellingCarouselContentGroupPanelFields,
  isStorytellingCarouselContentGroupBlockNodeId,
  isStorytellingCarouselContentGroupPanelFields,
  pickStorytellingCarouselContentGroupField,
} from './theme-editor-storytelling-carousel-content-group-panel.utils';
import {
  STORYTELLING_CAROUSEL_HEADER_PANEL_GROUP_ORDER,
  groupStorytellingCarouselHeaderPanelFields,
  isStorytellingCarouselHeaderGroupBlockNodeId,
  isStorytellingCarouselHeaderGroupPanelFields,
  pickStorytellingCarouselHeaderField,
  resolveStorytellingCarouselHeaderCustomHeightField,
  resolveStorytellingCarouselHeaderCustomWidthField,
} from './theme-editor-storytelling-carousel-header-panel.utils';
import {
  augmentProductHotspotsPanelFields,
  groupProductHotspotsPanelFields,
  PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER,
  isProductHotspotsSettingsPanelFields,
} from './theme-editor-product-hotspots-panel.utils';
import {
  PRODUCT_HOTSPOTS_HEADING_PANEL_GROUP_ORDER,
  filterProductHotspotsHeadingFieldsForPreset,
  groupProductHotspotsHeadingPanelFields,
  isProductHotspotsHeadingFieldNodeId,
  isProductHotspotsHeadingPanelFields,
} from './theme-editor-product-hotspots-heading-panel.utils';
import {
  isProductHotspotsHotspotBlockNodeId,
  isProductHotspotsHotspotBlockFields,
} from './theme-editor-product-hotspots-block-panel.utils';
import {
  augmentRecommendedProductsPanelFields,
  groupRecommendedProductsPanelFields,
  RECOMMENDED_PRODUCTS_PANEL_GROUP_ORDER,
  isRecommendedProductsSettingsPanelFields,
} from './theme-editor-recommended-products-panel.utils';
import {
  filterRecommendedProductsHeaderFieldsForPreset,
  groupRecommendedProductsHeaderPanelFields,
  isRecommendedProductsHeaderNodeId,
  isRecommendedProductsHeaderPanelFields,
  RECOMMENDED_PRODUCTS_HEADER_PANEL_GROUP_ORDER,
} from './theme-editor-recommended-products-header-panel.utils';
import {
  groupCollectionLinksSpotlightPanelFields,
  COLLECTION_LINKS_SPOTLIGHT_PANEL_GROUP_ORDER,
  isCollectionLinksSpotlightSettingsPanelFields,
  isCollectionLinksTextSectionFromFields,
} from './theme-editor-collection-links-spotlight-panel.utils';
import { CollectionsPickerFieldRow } from './CollectionsPickerFieldRow';
import type { Collection } from '../../contexts/collection.context';
import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { isCollectionListBentoSettingsPanelFields } from './theme-editor-collection-list-bento-panel.utils';
import { isCollectionListCarouselSettingsPanelFields } from './theme-editor-collection-list-carousel-panel.utils';
import { isCollectionListEditorialSettingsPanelFields } from './theme-editor-collection-list-editorial-panel.utils';
import { isCollectionListGridSettingsPanelFields } from './theme-editor-collection-list-grid-panel.utils';
import {
  augmentCollectionListPanelFields,
  collectionListCardsLayoutTypeFromValues,
  COLLECTION_LIST_PANEL_GROUP_ORDER,
  filterCollectionListPanelFieldsForLayout,
  groupCollectionListPanelFields,
  isCollectionListUnifiedSettingsPanelFields,
} from './theme-editor-collection-list-panel.utils';
import {
  groupLayeredSlideshowPanelFields,
  LAYERED_SLIDESHOW_PANEL_GROUP_ORDER,
  isLayeredSlideshowSettingsPanelFields,
} from './theme-editor-layered-slideshow-panel.utils';
import {
  groupSlideshowFullFramePanelFields,
  SLIDESHOW_FULL_FRAME_PANEL_GROUP_ORDER,
  isSlideshowFullFrameSettingsPanelFields,
} from './theme-editor-slideshow-full-frame-panel.utils';
import {
  groupSlideshowInsetPanelFields,
  SLIDESHOW_INSET_PANEL_GROUP_ORDER,
  isSlideshowInsetSettingsPanelFields,
} from './theme-editor-slideshow-inset-panel.utils';
import {
  isSlideshowSlideBlockFieldsOnly,
  prepareSlideshowSlideBlockSettingsNode,
} from './theme-editor-slideshow-slide-block-panel.utils';
import {
  isCollectionLinkBlockFieldsOnly,
  isCollectionLinkBlockNodeId,
  prepareCollectionLinkBlockSettingsNode,
} from './theme-editor-collection-link-block-panel.utils';
import {
  isCollectionLinkTitleFieldNodeId,
  isCollectionLinkTitlePanelFields,
  prepareCollectionLinkTitleSettingsNode,
} from './theme-editor-collection-link-title-panel.utils';
import {
  isCollectionLinkImageFieldNodeId,
  isCollectionLinkImagePanelFields,
  prepareCollectionLinkImageSettingsNode,
} from './theme-editor-collection-link-image-panel.utils';
import {
  isCollectionTileBlockFieldsOnly,
  prepareCollectionTileBlockSettingsNode,
} from './theme-editor-collection-tile-block-panel.utils';
import {
  isCollectionListCardImagePanelNode,
  isCollectionListCardPanelNode,
  isCollectionListCardTitlePanelNode,
  isCollectionListHeaderTextPanelNode,
} from './theme-editor-collection-list-block-panel.utils';
import {
  COLLECTION_LIST_CARD_PANEL_GROUP_ORDER,
  groupCollectionListCardPanelFields,
} from './theme-editor-collection-list-card-panel.utils';
import {
  COLLECTION_LIST_CARD_IMAGE_PANEL_GROUP_ORDER,
  groupCollectionListCardImagePanelFields,
} from './theme-editor-collection-list-card-image-panel.utils';
import {
  COLLECTION_LIST_CARD_TITLE_PANEL_GROUP_ORDER,
  groupCollectionListCardTitlePanelFields,
} from './theme-editor-collection-list-card-title-panel.utils';
import {
  FEATURED_COLLECTION_PANEL_GROUP_ORDER,
  featuredCollectionSettingsBaseFromNodeId,
  groupFeaturedCollectionPanelFields,
  isFeaturedCollectionCarouselSettingsPanelFields,
  isFeaturedCollectionEditorialSettingsPanelFields,
  isFeaturedCollectionGridSettingsPanelFields,
  isFeaturedCollectionPanelField,
  isFeaturedCollectionSectionNodeId,
  filterFeaturedCollectionPanelFieldsForVariant,
  readFeaturedCollectionSettingValue,
  resolveFeaturedCollectionLabel,
  resolveFeaturedCollectionVariant,
} from './theme-editor-featured-collection-panel.utils';
import {
  ANNOUNCEMENT_PANEL_GROUP_ORDER,
  groupAnnouncementPanelFields,
  isAnnouncementLayoutNodeId,
  isAnnouncementSettingsPanelFields,
} from './theme-editor-announcement-panel.utils';
import {
  isAnnouncementBlockNodeId,
  isAnnouncementBlockPanelFields,
} from './theme-editor-announcement-block-panel.utils';
import { AnnouncementBlockSettingsPanel } from './theme-editor-announcement-block-settings-panel';
import { HeaderLogoBlockSettingsPanel } from './theme-editor-header-logo-block-settings-panel';
import { HeaderMenuBlockSettingsPanel } from './theme-editor-header-menu-block-settings-panel';
import {
  isHeaderLayoutNodeId,
  isHeaderLogoBlockNodeId,
  isHeaderMenuBlockNodeId,
} from './theme-editor-header-panel.utils';
import { HeaderSettingsPanel } from './theme-editor-header-settings-panel';
import { isHeaderLogoBlockPanelFields } from './theme-editor-header-logo-block-panel.utils';
import {
  groupLargeLogoBlockPanelFields,
  isLargeLogoBlockPanelFields,
  LARGE_LOGO_BLOCK_PANEL_GROUP_ORDER,
} from './theme-editor-large-logo-block-panel.utils';
import { isHeroTextBlockNodeId } from './theme-editor-hero-text-block-panel.utils';
import { isHeaderMenuBlockPanelFields } from './theme-editor-header-menu-block-panel.utils';

function SectionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 2" />
    </svg>
  );
}

const SCHEME_SWATCHES: Record<string, { bg: string; fg: string; accent: string }> = {
  transparent: { bg: 'transparent', fg: '#111827', accent: '#9ca3af' },
  'scheme-1': { bg: '#111827', fg: '#f9fafb', accent: '#60a5fa' },
  'scheme-2': { bg: '#1e3a5f', fg: '#eff6ff', accent: '#93c5fd' },
  'scheme-3': { bg: '#431407', fg: '#fff7ed', accent: '#fb923c' },
  'scheme-4': { bg: '#4c1d95', fg: '#f5f3ff', accent: '#c4b5fd' },
  'scheme-5': { bg: '#ecfdf5', fg: '#064e3b', accent: '#047857' },
  'scheme-6': { bg: '#1f2937', fg: '#f9fafb', accent: '#9ca3af' },
};

function numValue(values: Record<string, string | boolean>, field: EditorFieldDef, fallback: number): number {
  const raw = values[field.path];
  const n = Number(raw);
  if (Number.isFinite(n)) return n;
  if (field.min != null && Number.isFinite(field.min)) return field.min;
  return fallback;
}

function SliderFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const current = numValue(values, field, min);
  const id = fieldInputId(field.path);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {field.label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
          className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
        />
        <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
            className="w-10 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
            aria-label={field.label}
          />
          {field.unit ? (
            <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">{field.unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitchFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);
  const checked = Boolean(values[field.path]);

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {field.label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onFieldChange(field.path, 'boolean', !checked)}
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#303030]' : 'bg-[#c9cccf]'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function ImagePickerFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const url = fieldValueAsString(values, field);
  const hasImage = Boolean(url.trim());

  return (
    <>
      <div className="space-y-2 py-1">
        <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
        <div className="rounded-lg border border-dashed border-[#c9cccf] bg-[#fafbfb] p-3">
          {hasImage ? (
            <div className="mb-2 overflow-hidden rounded-md border border-[#e1e1e1] bg-white">
              <img src={url} alt="" className="max-h-28 w-full object-cover" />
            </div>
          ) : (
            <div className="mb-2 flex h-20 items-center justify-center rounded-md border border-[#e1e1e1] bg-white text-gray-400">
              <PhotoIcon className="h-8 w-8" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              {hasImage ? 'Change' : 'Select'}
            </button>
            <button
              type="button"
              title="Browse library"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              onClick={() => setPickerOpen(true)}
            >
              <CircleStackIcon className="h-4 w-4" />
            </button>
          </div>
          {hasImage ? (
            <button
              type="button"
              className="mt-2 text-[12px] font-medium text-[#005bd3] hover:underline"
              onClick={() => onFieldChange(field.path, 'text', '')}
            >
              Remove image
            </button>
          ) : (
            <button
              type="button"
              className="mt-2 text-[12px] text-[#005bd3] hover:underline"
              onClick={() => setPickerOpen(true)}
            >
              Explore free images
            </button>
          )}
        </div>
      </div>
      <ThemeEditorImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialUrl={url}
        onSelect={(nextUrl) => onFieldChange(field.path, 'text', nextUrl)}
      />
    </>
  );
}

function HeroMediaSettingsGroup({
  groupLabel,
  fields,
  values,
  onFieldChange,
}: {
  groupLabel: string;
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const typeField = fields.find((f) => f.path.endsWith('Type'));
  const imageField = fields.find((f) => f.path.endsWith('ImageUrl'));
  const mediaType = typeField ? fieldValueAsString(values, typeField) || 'image' : 'image';

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{groupLabel}</h3>
      <div className="space-y-2">
        {typeField ? <SegmentedFieldRow field={typeField} values={values} onFieldChange={onFieldChange} /> : null}
        {mediaType === 'image' && imageField ? (
          <ImagePickerFieldRow field={imageField} values={values} onFieldChange={onFieldChange} />
        ) : imageField ? (
          <DefaultFieldRow
            field={{ ...imageField, label: 'Video URL', placeholder: 'Paste video URL' }}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
    </div>
  );
}

function HeroMobileMediaGroup({
  fields,
  allFields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  allFields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const stackField = fields.find((f) => f.path.endsWith('mobileStackMedia'));
  const differentField = fields.find((f) => f.path.endsWith('mobileDifferentMedia'));
  const showMobileMedia = differentField ? Boolean(values[differentField.path]) : false;
  const settingsBase =
    differentField?.path.replace(/\.mobileDifferentMedia$/, '') ??
    stackField?.path.replace(/\.mobileStackMedia$/, '') ??
    '';

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Mobile media</h3>
      <div className="space-y-0.5">
        {stackField ? (
          <ToggleSwitchFieldRow field={stackField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {differentField ? (
          <ToggleSwitchFieldRow field={differentField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {showMobileMedia && settingsBase ? (
          <div className="space-y-3 border-t border-[#e1e1e1] pt-3">
            <HeroMediaSettingsGroup
              groupLabel="Mobile media 1"
              fields={pickHeroMobileMediaSlotFields(allFields, settingsBase, 1)}
              values={values}
              onFieldChange={onFieldChange}
            />
            <HeroMediaSettingsGroup
              groupLabel="Mobile media 2"
              fields={pickHeroMobileMediaSlotFields(allFields, settingsBase, 2)}
              values={values}
              onFieldChange={onFieldChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SegmentedFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || 'page';
  const changeType = fieldTypeFromSchema(field.type);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="inline-flex rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
        {(field.options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFieldChange(field.path, changeType, opt.value)}
            className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
              current === opt.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorSchemeFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || 'scheme-4';
  const swatch = SCHEME_SWATCHES[current] ?? SCHEME_SWATCHES['scheme-4'];
  const isTransparent = current === 'transparent';

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="relative min-w-[140px]">
        <div
          className="pointer-events-none absolute left-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-[#e1e1e1] bg-white px-1 py-0.5"
          aria-hidden
        >
          {isTransparent ? (
            <span
              className="h-3 w-3 rounded-sm border border-[#c9cccf]"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                backgroundSize: '6px 6px',
                backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0',
              }}
            />
          ) : (
            <>
              <span className="text-[10px] font-semibold" style={{ color: swatch.fg }}>
                Aa
              </span>
              <span className="h-3 w-3 rounded-sm" style={{ background: swatch.bg }} />
              <span className="h-3 w-3 rounded-sm" style={{ background: swatch.accent }} />
            </>
          )}
        </div>
        <select
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-[72px] pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}

function RichTextFieldRow({
  field,
  values,
  onFieldChange,
  showDynamicSource = false,
  hideLabel = false,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  showDynamicSource?: boolean;
  hideLabel?: boolean;
}) {
  const id = fieldInputId(field.path);
  const value = fieldValueAsString(values, field);

  return (
    <ThemeEditorRichTextField
      id={id}
      label={hideLabel ? '' : field.label}
      value={value}
      placeholder={field.placeholder}
      showDynamicSource={showDynamicSource}
      onChange={(html) => onFieldChange(field.path, 'textarea', html)}
    />
  );
}

function ColorPickerFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <ThemeHexColorField
      label={field.label}
      path={field.path}
      values={values}
      defaultColor="#00000026"
      onFieldChange={onFieldChange}
    />
  );
}

function LinkFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <ThemeEditorLinkField
      id={fieldInputId(field.path)}
      label={field.label}
      value={fieldValueAsString(values, field)}
      placeholder={field.placeholder ?? 'Paste a link or search'}
      onChange={(next) => onFieldChange(field.path, 'text', next)}
      showDynamicSource
    />
  );
}

function HeroSectionLinkGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const linkField = fields.find((f) => f.path.endsWith('sectionLink'));
  const newTabField = fields.find((f) => f.path.endsWith('sectionLinkNewTab'));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Section link</h3>
      <div className="space-y-0.5">
        {linkField ? <LinkFieldRow field={linkField} values={values} onFieldChange={onFieldChange} /> : null}
        {newTabField ? (
          <ToggleSwitchFieldRow field={newTabField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

function heroLayoutField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function HeroLayoutFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const key = field.path.split('.').pop() ?? '';
  if (field.widget === 'segmented') {
    return (
      <SegmentedFieldRow field={field} values={values} onFieldChange={onFieldChange} />
    );
  }
  if (field.widget === 'toggle' || key === 'alignTextBaseline' || key === 'verticalOnMobile') {
    return (
      <ToggleSwitchFieldRow field={field} values={values} onFieldChange={onFieldChange} />
    );
  }
  if (field.widget === 'slider') {
    return (
      <SliderFieldRow field={field} values={values} onFieldChange={onFieldChange} />
    );
  }
  return (
    <InlineSelectFieldRow field={field} values={values} onFieldChange={onFieldChange} />
  );
}

function HeroLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const directionField = heroLayoutField(fields, 'direction');
  const direction = directionField
    ? fieldValueAsString(values, directionField) || 'vertical'
    : 'vertical';
  const isVertical = direction !== 'horizontal';

  const layoutAlignmentField = heroLayoutField(fields, 'layoutAlignment');
  const positionField = heroLayoutField(fields, 'position');

  const verticalAlignmentField = layoutAlignmentField
    ? {
        ...layoutAlignmentField,
        widget: 'segmented' as const,
        options: (layoutAlignmentField.options ?? []).filter(
          (option) => option.value !== 'space-between'
        ),
      }
    : undefined;

  const verticalPositionField = positionField
    ? { ...positionField, widget: 'select-inline' as const }
    : undefined;

  const horizontalPositionField = positionField
    ? {
        ...positionField,
        widget: 'segmented' as const,
        options: (positionField.options ?? []).filter(
          (option) => option.value !== 'space-between'
        ),
      }
    : undefined;

  const heightField = heroLayoutField(fields, 'height');
  const customHeightField = heroLayoutField(fields, 'customHeight');
  const heightMode = heightField ? fieldValueAsString(values, heightField) || 'medium' : 'medium';
  const showCustomHeight = heightMode === 'custom';

  const horizontalAlignmentField = layoutAlignmentField
    ? { ...layoutAlignmentField, widget: 'select-inline' as const }
    : undefined;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {directionField ? (
          <HeroLayoutFieldRow
            field={directionField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {isVertical ? (
          <>
            {heroLayoutField(fields, 'alignTextBaseline') ? (
              <HeroLayoutFieldRow
                field={{ ...heroLayoutField(fields, 'alignTextBaseline')!, widget: 'toggle' }}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {verticalAlignmentField ? (
              <HeroLayoutFieldRow
                field={verticalAlignmentField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {verticalPositionField ? (
              <HeroLayoutFieldRow
                field={verticalPositionField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {heroLayoutField(fields, 'layoutGap') ? (
              <HeroLayoutFieldRow
                field={heroLayoutField(fields, 'layoutGap')!}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {heroLayoutField(fields, 'sectionWidth') ? (
              <HeroLayoutFieldRow
                field={heroLayoutField(fields, 'sectionWidth')!}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {heightField ? (
              <HeroLayoutFieldRow
                field={{ ...heightField, widget: 'select-inline' }}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {showCustomHeight && customHeightField ? (
              <HeroLayoutFieldRow
                field={customHeightField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </>
        ) : (
          <>
            {heroLayoutField(fields, 'verticalOnMobile') ? (
              <HeroLayoutFieldRow
                field={{ ...heroLayoutField(fields, 'verticalOnMobile')!, widget: 'toggle' }}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {horizontalAlignmentField ? (
              <HeroLayoutFieldRow
                field={horizontalAlignmentField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {horizontalPositionField ? (
              <HeroLayoutFieldRow
                field={horizontalPositionField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {heroLayoutField(fields, 'alignTextBaseline') ? (
              <HeroLayoutFieldRow
                field={{ ...heroLayoutField(fields, 'alignTextBaseline')!, widget: 'toggle' }}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {heroLayoutField(fields, 'layoutGap') ? (
              <HeroLayoutFieldRow
                field={heroLayoutField(fields, 'layoutGap')!}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {heroLayoutField(fields, 'sectionWidth') ? (
              <HeroLayoutFieldRow
                field={heroLayoutField(fields, 'sectionWidth')!}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {heightField ? (
              <HeroLayoutFieldRow
                field={{ ...heightField, widget: 'select-inline' }}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {showCustomHeight && customHeightField ? (
              <HeroLayoutFieldRow
                field={customHeightField}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function HeroAppearanceSettingsGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const overlayOn = fields.some(
    (f) => f.path.endsWith('mediaOverlay') && Boolean(values[f.path])
  );
  const reflectionOn = fields.some(
    (f) => f.path.endsWith('blurredReflection') && Boolean(values[f.path])
  );
  const overlayStyleField = fields.find((f) => f.path.endsWith('overlayStyle'));
  const isGradient =
    overlayStyleField &&
    (fieldValueAsString(values, overlayStyleField) || 'solid') === 'gradient';

  // Prefer the palette "Background color" (shows "Default" when unset). When it
  // is present, hide the legacy color-scheme field so only one control shows.
  const hasBackgroundColor = fields.some((f) => f.path.endsWith('.backgroundColor'));

  const visible = fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    if (key === 'colorScheme' && hasBackgroundColor) return false;
    if (key === 'overlayColor' || key === 'overlayStyle') return overlayOn;
    if (key === 'overlayGradientDirection') return overlayOn && isGradient;
    if (key === 'reflectionOpacity') return reflectionOn;
    return true;
  });

  const ordered = [...visible].sort((a, b) => {
    const rank: Record<string, number> = {
      backgroundColor: -1,
      colorScheme: 0,
      mediaOverlay: 1,
      overlayColor: 2,
      overlayStyle: 3,
      overlayGradientDirection: 4,
      blurredReflection: 5,
      reflectionOpacity: 6,
    };
    const ka = a.path.split('.').pop() ?? '';
    const kb = b.path.split('.').pop() ?? '';
    return (rank[ka] ?? 9) - (rank[kb] ?? 9);
  });

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'overlayGradientDirection' && !isGradient) return null;
          if (key === 'reflectionOpacity' && !reflectionOn) return null;
          if (key === 'backgroundColor') {
            return (
              <ThemeDefaultColorField
                key={field.path}
                label={field.label || 'Background color'}
                path={field.path}
                values={values}
                colorPalette={colorPalette}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (key === 'mediaOverlay' || key === 'blurredReflection') {
            return (
              <div key={field.path}>
                <ToggleSwitchFieldRow field={field} values={values} onFieldChange={onFieldChange} />
                {key === 'blurredReflection' && field.description ? (
                  <p className="pb-1 text-[12px] text-gray-500">{field.description}</p>
                ) : null}
              </div>
            );
          }
          if (key === 'colorScheme') {
            const raw = fieldValueAsString(values, field);
            const isHex = /^#[0-9a-fA-F]{3,8}$/.test(raw);
            const legacy = SCHEME_SWATCHES[raw]?.bg;
            const hex = isHex ? raw : legacy && legacy !== 'transparent' ? legacy : '#1f2937';
            return (
              <ColorPickerFieldRow
                key={field.path}
                field={field}
                values={{ ...values, [field.path]: hex }}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'color-scheme') {
            return (
              <ColorSchemeFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'color') {
            return (
              <ColorPickerFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          return (
            <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        })}
      </div>
    </div>
  );
}

function HeroPaddingSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const top = fields.find((f) => f.path.endsWith('paddingTop'));
  const bottom = fields.find((f) => f.path.endsWith('paddingBottom'));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
      <div className="space-y-1">
        {top ? <SliderFieldRow field={top} values={values} onFieldChange={onFieldChange} /> : null}
        {bottom ? (
          <SliderFieldRow field={bottom} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

const HEADING_LAYOUT_FIELD_ORDER = ['headingWidth', 'headingMaxWidth', 'headingAlignment'] as const;

function ShopifySettingsSection({
  title,
  collapsible = false,
  defaultOpen = false,
  headerAction,
  children,
}: {
  title: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (collapsible) {
    return (
      <section className="border-t border-[#e1e3e5] first:border-t-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between px-4 pb-2 pt-4 text-left"
        >
          <h3 className="text-[13px] font-semibold leading-none text-[#303030]">{title}</h3>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-[#616161] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && children ? <div className="space-y-0 px-4 pb-4">{children}</div> : null}
      </section>
    );
  }

  return (
    <section className="border-t border-[#e1e3e5] first:border-t-0">
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <h3 className="text-[13px] font-semibold leading-none text-[#303030]">{title}</h3>
        {headerAction}
      </div>
      {children ? <div className="space-y-0 px-4 pb-4">{children}</div> : null}
    </section>
  );
}

/** Shopify heading width options. */
const HEADING_WIDTH_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

function HeadingTextSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const textField =
    fields.find((f) => {
      const key = f.path.split('.').pop() ?? '';
      return key === 'title' || key === 'heading' || key === 'text';
    }) ?? fields[0];
  if (!textField) return null;

  const useRichText =
    textField.widget === 'richtext' ||
    textField.path.endsWith('.title') ||
    textField.path.endsWith('.heading') ||
    textField.path.endsWith('.text');

  return (
    <ShopifySettingsSection
      title="Text"
      headerAction={
        <button
          type="button"
          title="Connect dynamic source"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      }
    >
      {useRichText ? (
        <RichTextFieldRow
          field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
          values={values}
          onFieldChange={onFieldChange}
          hideLabel
        />
      ) : (
        <SettingsFieldRow field={textField} values={values} onFieldChange={onFieldChange} />
      )}
    </ShopifySettingsSection>
  );
}

/** Shopify heading max width options (Fit and Fill). */
const HEADING_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'none', label: 'None' },
] as const;

function HeadingAlignIcon({ align }: { align: 'left' | 'center' | 'right' }) {
  const widths = [12, 9, 11, 7];
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-current" aria-hidden>
      {widths.map((w, i) => {
        const y = 2 + i * 3.5;
        const x =
          align === 'right' ? 16 - w : align === 'center' ? (16 - w) / 2 : 0;
        return <rect key={i} x={x} y={y} width={w} height={1.5} rx={0.5} fill="currentColor" />;
      })}
    </svg>
  );
}

function HeadingAlignmentFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || 'left';
  const options: Array<{ value: 'left' | 'center' | 'right'; align: 'left' | 'center' | 'right' }> =
    [
      { value: 'left', align: 'left' },
      { value: 'center', align: 'center' },
      { value: 'right', align: 'right' },
    ];

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="inline-flex rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
            onClick={() => onFieldChange(field.path, 'text', opt.value)}
            className={`flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
              current === opt.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <HeadingAlignIcon align={opt.align} />
          </button>
        ))}
      </div>
    </div>
  );
}

function HeadingLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const widthField = fields.find((f) => f.path.endsWith('headingWidth'));
  const maxWidthField = fields.find((f) => f.path.endsWith('headingMaxWidth'));
  const alignmentField = fields.find((f) => f.path.endsWith('headingAlignment'));
  const widthMode = widthField
    ? fieldValueAsString(values, widthField) || 'fit'
    : 'fit';
  const isFill = widthMode === 'fill';

  // Schema heading fields carry only a `type`, so inject the Fit/Fill segmented options.
  const layoutWidthField = widthField
    ? { ...widthField, widget: 'segmented' as const, options: [...HEADING_WIDTH_OPTIONS] }
    : null;

  const handleLayoutFieldChange = (
    path: string,
    type: ThemeEditorFieldType,
    value: string | boolean
  ) => {
    onFieldChange(path, type, value);
    if (widthField && path === widthField.path && maxWidthField) {
      const cur = fieldValueAsString(values, maxWidthField);
      if (cur === 'wide' || !HEADING_MAX_WIDTH_OPTIONS.some((o) => o.value === cur)) {
        onFieldChange(maxWidthField.path, 'text', 'normal');
      }
    }
  };

  const layoutMaxWidthField = maxWidthField
    ? {
        ...maxWidthField,
        options: [...HEADING_MAX_WIDTH_OPTIONS],
      }
    : null;
  const maxWidthValues =
    layoutMaxWidthField && maxWidthField
      ? (() => {
          const cur = fieldValueAsString(values, maxWidthField);
          if (cur === 'wide' || !HEADING_MAX_WIDTH_OPTIONS.some((o) => o.value === cur)) {
            return { ...values, [maxWidthField.path]: 'normal' };
          }
          return values;
        })()
      : values;

  return (
    <ShopifySettingsSection title="Layout">
      {layoutWidthField ? (
        <SegmentedFieldRow
          field={layoutWidthField}
          values={values}
          onFieldChange={handleLayoutFieldChange}
        />
      ) : null}
      {layoutMaxWidthField ? (
        <InlineSelectFieldRow
          field={layoutMaxWidthField}
          values={maxWidthValues}
          onFieldChange={onFieldChange}
        />
      ) : null}
      {isFill && alignmentField ? (
        <HeadingAlignmentFieldRow
          field={alignmentField}
          values={values}
          onFieldChange={handleLayoutFieldChange}
        />
      ) : null}
    </ShopifySettingsSection>
  );
}

const HEADING_PADDING_ORDER = [
  'headingPaddingTop',
  'headingPaddingBottom',
  'headingPaddingLeft',
  'headingPaddingRight',
] as const;

function HeadingPaddingSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const settingsBase =
    fields.find((f) => f.path.endsWith('headingPaddingTop'))?.path.replace(/\.headingPaddingTop$/, '') ??
    fields.find((f) => f.path.endsWith('titlePaddingTop'))?.path.replace(/\.titlePaddingTop$/, '') ??
    fields.find((f) => f.path.endsWith('headingWidth'))?.path.replace(/\.headingWidth$/, '') ??
    fields.find((f) => f.path.endsWith('titleWidth'))?.path.replace(/\.titleWidth$/, '') ??
    fields.find((f) => f.path.endsWith('headingColor'))?.path.replace(/\.headingColor$/, '') ??
    fields.find((f) => f.path.endsWith('titleColor'))?.path.replace(/\.titleColor$/, '') ??
    '';

  const paddingFallback = (key: string, label: string): EditorFieldDef => ({
    path: `${settingsBase}.${key}`,
    type: 'number',
    label,
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 80,
    step: 1,
    unit: 'px',
  });

  const ordered = HEADING_PADDING_ORDER.map((key) => {
    const titleKey = key.replace(/^heading/, 'title');
    const found =
      fields.find((f) => f.path.endsWith(key)) ??
      fields.find((f) => f.path.endsWith(titleKey));
    if (found) return found;
    if (!settingsBase) return null;
    const labels: Record<string, string> = {
      headingPaddingTop: 'Top',
      headingPaddingBottom: 'Bottom',
      headingPaddingLeft: 'Left',
      headingPaddingRight: 'Right',
    };
    return paddingFallback(key, labels[key] ?? key);
  }).filter((f): f is EditorFieldDef => Boolean(f));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
      <div className="space-y-1">
        {ordered.map((field) => (
          <SliderFieldRow
            key={field.path}
            field={{
              ...field,
              min: field.min ?? 0,
              max: field.max ?? 80,
              step: field.step ?? 1,
              unit: field.unit ?? 'px',
            }}
            values={values}
            onFieldChange={onFieldChange}
          />
        ))}
      </div>
    </div>
  );
}

function headingColorEditorValue(raw: string): string {
  if (raw === 'palette' || /^palette:\d+$/.test(raw) || raw.startsWith('#')) return raw;
  if (raw === 'link' || raw === 'accent') return 'palette:2';
  return 'palette:1';
}

function HeadingAppearanceSettingsGroup({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const textColor = fields.find((f) => f.path.endsWith('headingColor'));
  const settingsBase =
    textColor?.path.replace(/\.headingColor$/, '') ??
    fields.find((f) => f.path.endsWith('headingWidth'))?.path.replace(/\.headingWidth$/, '') ??
    '';
  const background =
    fields.find((f) => f.path.endsWith('headingBackgroundEnabled')) ??
    (settingsBase
      ? {
          path: `${settingsBase}.headingBackgroundEnabled`,
          type: 'boolean' as const,
          label: 'Background',
          group: 'Appearance',
          widget: 'toggle' as const,
        }
      : null);
  const backgroundColor =
    fields.find((f) => f.path.endsWith('headingBackgroundColor')) ??
    (settingsBase
      ? {
          path: `${settingsBase}.headingBackgroundColor`,
          type: 'text' as const,
          label: 'Background color',
          group: 'Appearance',
          widget: 'color' as const,
        }
      : null);
  const cornerRadius =
    fields.find((f) => f.path.endsWith('headingCornerRadius')) ??
    (settingsBase
      ? {
          path: `${settingsBase}.headingCornerRadius`,
          type: 'number' as const,
          label: 'Corner radius',
          group: 'Appearance',
          widget: 'slider' as const,
          min: 0,
          max: 50,
          step: 1,
          unit: 'px',
        }
      : null);
  if (!textColor && !background) return null;

  const backgroundOn =
    background &&
    (values[background.path] === true || values[background.path] === 'true');

  const textColorValues = textColor
    ? {
        ...values,
        [textColor.path]: headingColorEditorValue(fieldValueAsString(values, textColor)),
      }
    : values;

  return (
    <ShopifySettingsSection title="Appearance">
      {textColor ? (
        <ThemePaletteColorField
          label="Text color"
          path={textColor.path}
          values={textColorValues}
          colorPalette={colorPalette}
          defaultPaletteIndex={1}
          fallbackColor="#111827"
          onFieldChange={onFieldChange}
        />
      ) : null}
      {background ? (
        <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
      ) : null}
      {backgroundOn && backgroundColor ? (
        <ThemeHexColorField
          label={backgroundColor.label}
          path={backgroundColor.path}
          values={values}
          defaultColor="#00000026"
          onFieldChange={onFieldChange}
        />
      ) : null}
      {backgroundOn && cornerRadius ? (
        <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
      ) : null}
    </ShopifySettingsSection>
  );
}

const HEADING_TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'custom', label: 'Custom' },
] as const;

function normalizeHeadingTypographyPresetValue(
  values: Record<string, string | boolean>,
  path: string
): Record<string, string | boolean> {
  const raw = values[path];
  if (raw === 'body') return { ...values, [path]: 'paragraph' };
  return values;
}

function HeadingTypographySettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const preset = fields.find((f) => f.path.endsWith('headingTypographyPreset'));
  const presetField = preset
    ? {
        ...preset,
        options: [...HEADING_TYPOGRAPHY_PRESET_OPTIONS],
        description: preset.description ?? 'Edit presets in theme settings',
      }
    : null;
  const presetValues = presetField
    ? normalizeHeadingTypographyPresetValue(values, presetField.path)
    : values;
  const isCustom = presetField
    ? isHeadingTypographyCustomPreset(presetValues, presetField.path)
    : false;
  const settingsBase =
    presetField?.path.replace(/\.headingTypographyPreset$/, '') ?? '';

  return (
    <ShopifySettingsSection title="Typography">
      {presetField ? (
        <div>
          <InlineSelectFieldRow
            field={presetField}
            values={presetValues}
            onFieldChange={onFieldChange}
          />
          {presetField.description ? (
            <p className="mt-1 text-[12px] leading-4 text-[#616161]">
              Edit presets in{' '}
              <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                theme settings
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      {isCustom && settingsBase
        ? HEADING_CUSTOM_TYPOGRAPHY_KEYS.map((key) => {
            const field = resolveHeadingTypographyField(key, settingsBase, fields);
            if (field.widget === 'segmented') {
              return (
                <SegmentedFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              );
            }
            return (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          })
        : null}
    </ShopifySettingsSection>
  );
}

/** Shopify-order heading block panel (Text → Layout → Typography → Appearance → Padding). */
function HeadingBlockSettingsPanel({
  nodeId,
  nodeLabel,
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  nodeId: string;
  nodeLabel: string;
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const prepared = useMemo(() => {
    const filtered = filterHeadingPanelFieldsForTypographyPreset(fields, values);
    return prepareHeadingBlockSettingsNode({ id: '', label: 'Heading', kind: 'block', fields: filtered });
  }, [fields, values]);
  const grouped = useMemo(() => groupHeadingPanelFields(prepared.fields ?? []), [prepared.fields]);

  if (isFaqHeadingCollectionTitlePanelNode({ id: nodeId, label: nodeLabel, kind: 'block', fields })) {
    return (
      <FaqHeadingCollectionTitleSettingsPanel
        fields={fields}
        values={values}
        onFieldChange={onFieldChange}
        colorPalette={colorPalette}
      />
    );
  }

  return (
    <div>
      {HEADING_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (label === 'Padding') {
          const paddingFields = groupFields?.length
            ? groupFields
            : [
                ...(grouped.get('Layout') ?? []),
                ...(grouped.get('Appearance') ?? []),
              ];
          if (!paddingFields.length) return null;
          return (
            <HeadingPaddingSettingsGroup
              key={label}
              fields={paddingFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          return (
            <HeadingTextSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Layout') {
          return (
            <HeadingLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Typography') {
          return (
            <HeadingTypographySettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Appearance') {
          return (
            <HeadingAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
              colorPalette={colorPalette}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

const COLLECTION_TITLE_WIDTH_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

const COLLECTION_TITLE_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

function normalizeCollectionTitleTypographyPresetValue(
  values: Record<string, string | boolean>,
  path: string
): Record<string, string | boolean> {
  const raw = values[path];
  if (raw === 'body') return { ...values, [path]: 'paragraph' };
  return values;
}

function collectionTitleColorEditorValue(raw: string): string {
  if (raw === 'default' || raw === '' || raw === 'text') return 'default';
  if (raw === 'palette' || /^palette:\d+$/.test(raw) || raw.startsWith('#')) return raw;
  if (raw === 'accent') return 'palette:2';
  if (raw === 'heading') return 'palette:0';
  return 'palette:1';
}

function CollectionTitleTextSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const textField = fields.find((f) => f.path.endsWith('.title')) ?? fields[0];
  if (!textField) return null;

  return (
    <div className="px-1 py-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-gray-900">Text</h3>
        <button
          type="button"
          title="Connect dynamic source"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      <RichTextFieldRow
        field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
        values={values}
        onFieldChange={onFieldChange}
        hideLabel
      />
    </div>
  );
}

function CollectionTitleLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const widthField = fields.find((f) => f.path.endsWith('titleWidth'));
  const maxWidthField = fields.find((f) => f.path.endsWith('titleMaxWidth'));
  const alignmentField =
    fields.find((f) => f.path.endsWith('titleAlignment')) ??
    (widthField
      ? {
          path: `${widthField.path.replace(/\.titleWidth$/, '')}.titleAlignment`,
          type: 'select' as const,
          label: 'Alignment',
          group: 'Layout',
          widget: 'segmented' as const,
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
        }
      : null);
  const widthMode = widthField ? fieldValueAsString(values, widthField) || 'fit' : 'fit';
  const isFill = widthMode === 'fill';
  const layoutWidthField = widthField
    ? { ...widthField, widget: 'segmented' as const, options: [...COLLECTION_TITLE_WIDTH_OPTIONS] }
    : null;
  const layoutMaxWidthField = maxWidthField
    ? { ...maxWidthField, options: [...COLLECTION_TITLE_MAX_WIDTH_OPTIONS] }
    : null;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {layoutWidthField ? (
          <SegmentedFieldRow field={layoutWidthField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {layoutMaxWidthField ? (
          <InlineSelectFieldRow field={layoutMaxWidthField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {isFill && alignmentField ? (
          <HeadingAlignmentFieldRow
            field={alignmentField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
    </div>
  );
}

function CollectionTitleTypographySettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const preset = fields.find((f) => f.path.endsWith('titleTypographyPreset'));
  const presetField = preset
    ? {
        ...preset,
        options: [...HEADING_TYPOGRAPHY_PRESET_OPTIONS],
        description: preset.description ?? 'Edit presets in theme settings',
      }
    : null;
  const presetValues = presetField
    ? normalizeCollectionTitleTypographyPresetValue(values, presetField.path)
    : values;
  const isCustom = presetField
    ? isCollectionTitleTypographyCustomPreset(presetValues, presetField.path)
    : false;
  const settingsBase =
    presetField?.path.replace(/\.titleTypographyPreset$/, '') ?? '';

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
      <div className="space-y-1">
        {presetField ? (
          <div>
            <InlineSelectFieldRow field={presetField} values={presetValues} onFieldChange={onFieldChange} />
            <p className="pb-1 text-[12px] text-gray-500">
              Edit presets in{' '}
              <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                theme settings
              </a>
            </p>
          </div>
        ) : null}
        {isCustom && settingsBase
          ? COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEYS.map((key) => {
              const field = resolveCollectionTitleTypographyField(key, settingsBase, fields);
              if (field.widget === 'segmented') {
                return (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                );
              }
              return (
                <InlineSelectFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              );
            })
          : null}
      </div>
    </div>
  );
}

function CollectionTitleAppearanceSettingsGroup({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const textColor = fields.find((f) => f.path.endsWith('titleColor'));
  const settingsBase =
    textColor?.path.replace(/\.titleColor$/, '') ??
    fields.find((f) => f.path.endsWith('titleWidth'))?.path.replace(/\.titleWidth$/, '') ??
    '';
  const background =
    fields.find((f) => f.path.endsWith('titleBackgroundEnabled')) ??
    (settingsBase
      ? {
          path: `${settingsBase}.titleBackgroundEnabled`,
          type: 'boolean' as const,
          label: 'Background',
          group: 'Appearance',
          widget: 'toggle' as const,
        }
      : null);
  const backgroundColor =
    fields.find((f) => f.path.endsWith('titleBackgroundColor')) ??
    (settingsBase
      ? {
          path: `${settingsBase}.titleBackgroundColor`,
          type: 'text' as const,
          label: 'Background color',
          group: 'Appearance',
          widget: 'color' as const,
        }
      : null);
  const cornerRadius =
    fields.find((f) => f.path.endsWith('titleCornerRadius')) ??
    (settingsBase
      ? {
          path: `${settingsBase}.titleCornerRadius`,
          type: 'number' as const,
          label: 'Corner radius',
          group: 'Appearance',
          widget: 'slider' as const,
          min: 0,
          max: 50,
          step: 1,
          unit: 'px',
        }
      : null);
  if (!textColor && !background) return null;

  const backgroundOn =
    background &&
    (values[background.path] === true || values[background.path] === 'true');

  const textColorValues = textColor
    ? {
        ...values,
        [textColor.path]: collectionTitleColorEditorValue(fieldValueAsString(values, textColor)),
      }
    : values;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {textColor ? (
          fieldValueAsString(values, textColor) === 'default' ||
          fieldValueAsString(values, textColor) === '' ||
          fieldValueAsString(values, textColor) === 'text' ? (
            <ThemeDefaultColorField
              label="Text color"
              path={textColor.path}
              values={values}
              colorPalette={colorPalette}
              defaultPaletteIndex={1}
              onFieldChange={onFieldChange}
            />
          ) : (
            <ThemePaletteColorField
              label="Text color"
              path={textColor.path}
              values={textColorValues}
              colorPalette={colorPalette}
              defaultPaletteIndex={1}
              fallbackColor="#111827"
              onFieldChange={onFieldChange}
            />
          )
        ) : null}
        {background ? (
          <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {backgroundOn && backgroundColor ? (
          <ThemeHexColorField
            label={backgroundColor.label}
            path={backgroundColor.path}
            values={values}
            defaultColor="#00000026"
            onFieldChange={onFieldChange}
          />
        ) : null}
        {backgroundOn && cornerRadius ? (
          <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

function CollectionTitlePaddingSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const settingsBase =
    fields.find((f) => f.path.endsWith('titlePaddingTop'))?.path.replace(/\.titlePaddingTop$/, '') ??
    fields.find((f) => f.path.endsWith('titleWidth'))?.path.replace(/\.titleWidth$/, '') ??
    fields.find((f) => f.path.endsWith('titleColor'))?.path.replace(/\.titleColor$/, '') ??
    '';

  const paddingFallback = (key: string, label: string): EditorFieldDef => ({
    path: `${settingsBase}.${key}`,
    type: 'number',
    label,
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
  });

  const ordered = ['titlePaddingTop', 'titlePaddingBottom', 'titlePaddingLeft', 'titlePaddingRight']
    .map((key) => {
      const headingKey = key.replace(/^title/, 'heading');
      const found =
        fields.find((f) => f.path.endsWith(key)) ??
        fields.find((f) => f.path.endsWith(headingKey));
      if (found) return found;
      if (!settingsBase) return null;
      const labels: Record<string, string> = {
        titlePaddingTop: 'Top',
        titlePaddingBottom: 'Bottom',
        titlePaddingLeft: 'Left',
        titlePaddingRight: 'Right',
      };
      return paddingFallback(key, labels[key] ?? key);
    })
    .filter((f): f is EditorFieldDef => Boolean(f));

  if (!ordered.length) return null;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
      <div className="space-y-1">
        {ordered.map((field) => (
          <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    </div>
  );
}

/** Featured collection — Header → Collection title (Shopify order). */
function CollectionTitleBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
  styleFields = false,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
  styleFields?: boolean;
}) {
  const prepared = useMemo(() => {
    const filtered = filterCollectionTitlePanelFieldsForTypographyPreset(fields, values);
    return styleFields
      ? prepareCollectionTitleStyleSettingsNode({
          id: '',
          label: 'Collection title',
          kind: 'block',
          fields: filtered,
        })
      : prepareCollectionTitleSettingsNode({
          id: '',
          label: 'Collection title',
          kind: 'block',
          fields: filtered,
        });
  }, [fields, styleFields, values]);
  const grouped = useMemo(
    () =>
      styleFields
        ? groupCollectionTitleStylePanelFields(prepared.fields ?? [])
        : groupCollectionTitlePanelFields(prepared.fields ?? []),
    [prepared.fields, styleFields]
  );
  const typographyFields = grouped.get('Typography') ?? [];
  const appearanceFields = [
    ...(grouped.get('Appearance') ?? []),
    ...typographyFields.filter((f) => f.path.endsWith('titleColor')),
  ];
  const typographyOnlyFields = typographyFields.filter((f) => !f.path.endsWith('titleColor'));

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {COLLECTION_TITLE_PANEL_GROUP_ORDER.map((label) => {
        if (label === 'Padding') {
          let groupFields =
            grouped.get('Padding') ??
            (styleFields ? (prepared.fields ?? []).filter((f) => f.group === 'Padding') : []);
          if (!groupFields.length && styleFields) {
            groupFields = [
              ...(grouped.get('Text') ?? []),
              ...(grouped.get('Layout') ?? []),
              ...(grouped.get('Appearance') ?? []),
            ];
          }
          if (!groupFields.length) return null;
          return (
            <CollectionTitlePaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Text') {
          const groupFields = grouped.get('Text');
          if (!groupFields?.length) return null;
          return (
            <CollectionTitleTextSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Layout') {
          const groupFields = grouped.get('Layout');
          if (!groupFields?.length) return null;
          return (
            <CollectionTitleLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Typography') {
          if (!typographyOnlyFields.length) return null;
          return (
            <CollectionTitleTypographySettingsGroup
              key={label}
              fields={typographyOnlyFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Appearance') {
          if (!appearanceFields.length) return null;
          return (
            <CollectionTitleAppearanceSettingsGroup
              key={label}
              fields={appearanceFields}
              values={values}
              onFieldChange={onFieldChange}
              colorPalette={colorPalette}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

/** FAQ heading block — same panel as featured collection collection title. */
function FaqHeadingCollectionTitleSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const mappedFields = useMemo(() => mapFaqHeadingFieldsToCollectionTitleFields(fields), [fields]);
  const mappedValues = useMemo(
    () => mapFaqHeadingValuesToCollectionTitleValues(values, fields),
    [fields, values]
  );
  const handleFieldChange = (
    path: string,
    type: ThemeEditorFieldType,
    value: string | boolean
  ) => {
    onFieldChange(mapCollectionTitlePathToFaqHeadingPath(path), type, value);
  };

  return (
    <CollectionTitleBlockSettingsPanel
      fields={mappedFields}
      values={mappedValues}
      onFieldChange={handleFieldChange}
      colorPalette={colorPalette}
      styleFields
    />
  );
}

/** Shopify-order hero section settings (Media 1 → Custom CSS). */
function HeroGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupHeroPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {HERO_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (label === 'Theme Settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={[]}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (!groupFields?.length) return null;

        if (label === 'Media 1' || label === 'Media 2') {
          return (
            <HeroMediaSettingsGroup
              key={label}
              groupLabel={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Mobile media') {
          return (
            <HeroMobileMediaGroup
              key={label}
              fields={groupFields}
              allFields={fields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Section link') {
          return (
            <HeroSectionLinkGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Layout') {
          return (
            <HeroLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Appearance') {
          return (
            <HeroAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

const LARGE_LOGO_LAYOUT_FIELD_ORDER = [
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

function LargeLogoLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const layoutRank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = LARGE_LOGO_LAYOUT_FIELD_ORDER.indexOf(
      key as (typeof LARGE_LOGO_LAYOUT_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => layoutRank(a.path) - layoutRank(b.path));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          return (
            <InlineSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function LargeLogoSizeSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const width = fields.find((f) => f.path.endsWith('sectionWidth'));
  const height = fields.find((f) => f.path.endsWith('height'));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
      <div className="space-y-1">
        {width ? (
          <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {height ? (
          <InlineSelectFieldRow field={height} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

function LargeLogoAppearanceSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const bgMediaField = fields.find((f) => f.path.endsWith('backgroundMedia'));
  const bgImageField = fields.find((f) => f.path.endsWith('backgroundImageUrl'));
  const bgMedia = bgMediaField
    ? fieldValueAsString(values, bgMediaField) || 'none'
    : 'none';

  const ordered = [...fields].filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    if (key === 'backgroundImageUrl') return false;
    return true;
  });

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'mediaOverlay') {
            return (
              <ToggleSwitchFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'color-scheme' || key === 'colorScheme') {
            return (
              <ColorSchemeFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          if (field.widget === 'select-inline') {
            return (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          return (
            <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        })}
        {bgMedia === 'image' && bgImageField ? (
          <ImagePickerFieldRow field={bgImageField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

const SPLIT_SHOWCASE_LAYOUT_FIELD_ORDER = [
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

function SplitShowcaseLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const layoutRank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = SPLIT_SHOWCASE_LAYOUT_FIELD_ORDER.indexOf(
      key as (typeof SPLIT_SHOWCASE_LAYOUT_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => layoutRank(a.path) - layoutRank(b.path));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'toggle' || key === 'verticalOnMobile') {
            return (
              <ToggleSwitchFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          return (
            <InlineSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function SplitShowcaseGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupSplitShowcasePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {SPLIT_SHOWCASE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <SplitShowcaseLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Appearance') {
          return (
            <ContactFormAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Borders') {
          const borderStyle = groupFields.find((f) => f.path.endsWith('borderStyle'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('cornerRadius'));
          return (
            <ShopifySettingsSection key={label} title="Borders">
              {borderStyle ? (
                <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }
        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

/** Spacer block: Unit (Pixel/Percent) → Size slider → Custom mobile size toggle (+ Mobile size). */
function SpacerBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const unitField = fields.find((f) => f.path.endsWith('SpacerUnit'));
  const sizeField = fields.find((f) => f.path.endsWith('SpacerHeight'));
  const customMobileField = fields.find((f) => f.path.endsWith('SpacerCustomMobile'));
  const mobileSizeField = fields.find((f) => f.path.endsWith('SpacerMobileHeight'));

  const isPercent = unitField
    ? (fieldValueAsString(values, unitField) || 'pixel') === 'percent'
    : false;
  const customMobile = customMobileField
    ? values[customMobileField.path] === true || values[customMobileField.path] === 'true'
    : false;

  const withUnit = (field: EditorFieldDef): EditorFieldDef =>
    isPercent ? { ...field, unit: '%', max: 100 } : { ...field, unit: 'px', max: 200 };

  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {unitField ? (
          <SegmentedFieldRow field={unitField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {sizeField ? (
          <SliderFieldRow field={withUnit(sizeField)} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {customMobileField ? (
          <ToggleSwitchFieldRow
            field={customMobileField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {customMobile && mobileSizeField ? (
          <SliderFieldRow
            field={withUnit(mobileSizeField)}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
    </div>
  );
}

const CONTACT_FORM_LAYOUT_FIELD_ORDER = [
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

function ContactFormLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const layoutRank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = CONTACT_FORM_LAYOUT_FIELD_ORDER.indexOf(
      key as (typeof CONTACT_FORM_LAYOUT_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => layoutRank(a.path) - layoutRank(b.path));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          return (
            <InlineSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function ContactFormAppearanceSettingsGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const bgMediaField = fields.find((f) => f.path.endsWith('backgroundMedia'));
  const bgImageField = fields.find((f) => f.path.endsWith('backgroundImageUrl'));
  const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';

  const ordered = [...fields].filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return key !== 'backgroundImageUrl' && key !== 'colorScheme';
  });

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'backgroundColor' || field.widget === 'color' || field.type === 'color') {
            return (
              <ThemeDefaultColorField
                key={field.path}
                label={field.label}
                path={field.path}
                values={values}
                colorPalette={colorPalette}
                defaultPaletteIndex={0}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (key === 'backgroundOverlay' || key === 'mediaOverlay') {
            return (
              <ToggleSwitchFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'color-scheme') {
            return (
              <ColorSchemeFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          if (field.widget === 'select-inline') {
            return (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          return (
            <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        })}
        {bgMedia === 'image' && bgImageField ? (
          <ImagePickerFieldRow field={bgImageField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

/** Comparison slider block: Image 1/2 → Direction → Size → Appearance → Padding. */
function ComparisonSliderBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = useMemo(
    () => prepareComparisonSliderBlockSettingsNode({ id: '', label: 'Comparison slider', kind: 'block', fields }),
    [fields]
  );
  const panelFields = prepared.fields ?? [];
  const image1 = pickComparisonSliderField(panelFields, 'imageBeforeUrl');
  const image2 = pickComparisonSliderField(panelFields, 'imageAfterUrl');
  const direction = pickComparisonSliderField(panelFields, 'sliderDirection');
  const textOnImages = pickComparisonSliderField(panelFields, 'sliderTextOnImages');
  const aspectRatio = pickComparisonSliderField(panelFields, 'sliderAspectRatio');
  const desktopWidth = pickComparisonSliderField(panelFields, 'sliderDesktopWidth');
  const desktopCustom = pickComparisonSliderField(panelFields, 'sliderDesktopCustomWidth');
  const mobileWidth = pickComparisonSliderField(panelFields, 'sliderMobileWidth');
  const mobileCustom = pickComparisonSliderField(panelFields, 'sliderMobileCustomWidth');
  const sliderColor = pickComparisonSliderField(panelFields, 'sliderColor');
  const sliderInnerColor = pickComparisonSliderField(panelFields, 'sliderInnerColor');
  const border = pickComparisonSliderField(panelFields, 'sliderBorderStyle');
  const cornerRadius = pickComparisonSliderField(panelFields, 'sliderCornerRadius');
  const paddingTop = pickComparisonSliderField(panelFields, 'sliderPaddingTop');
  const paddingBottom = pickComparisonSliderField(panelFields, 'sliderPaddingBottom');
  const paddingLeft = pickComparisonSliderField(panelFields, 'sliderPaddingLeft');
  const paddingRight = pickComparisonSliderField(panelFields, 'sliderPaddingRight');

  const desktopMode = desktopWidth ? fieldValueAsString(values, desktopWidth) || 'fit' : 'fit';
  const mobileMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';

  const renderCustomWidth = (field: EditorFieldDef) => {
    const min = field.min ?? 20;
    const max = field.max ?? 100;
    const step = field.step ?? 1;
    const current = numValue(values, field, min);
    const id = fieldInputId(field.path);
    return (
      <div key={field.path} className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
        <label htmlFor={id} className="text-[13px] text-gray-800">
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
            className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
          />
          <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={current}
              onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
              className="w-10 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
              aria-label={field.label}
            />
            <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {image1 ? <ImagePickerFieldRow field={image1} values={values} onFieldChange={onFieldChange} /> : null}
        {image2 ? <ImagePickerFieldRow field={image2} values={values} onFieldChange={onFieldChange} /> : null}
        {direction ? (
          <SegmentedFieldRow field={direction} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {textOnImages ? (
          <ToggleSwitchFieldRow field={textOnImages} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
        <div className="space-y-1">
          {aspectRatio ? (
            <InlineSelectFieldRow field={aspectRatio} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {desktopWidth ? (
            <SegmentedFieldRow field={desktopWidth} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {desktopMode === 'custom' && desktopCustom ? renderCustomWidth(desktopCustom) : null}
          {mobileWidth ? (
            <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {mobileMode === 'custom' && mobileCustom ? renderCustomWidth(mobileCustom) : null}
        </div>
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
        <div className="space-y-1">
          {sliderColor ? (
            <ThemeDefaultColorField
              label={sliderColor.label}
              path={sliderColor.path}
              values={values}
              colorPalette={colorPalette}
              defaultPaletteIndex={0}
              onFieldChange={onFieldChange}
            />
          ) : null}
          {sliderInnerColor ? (
            <ThemeDefaultColorField
              label={sliderInnerColor.label}
              path={sliderInnerColor.path}
              values={values}
              colorPalette={colorPalette}
              defaultPaletteIndex={0}
              onFieldChange={onFieldChange}
            />
          ) : null}
          {border ? <SegmentedFieldRow field={border} values={values} onFieldChange={onFieldChange} /> : null}
          {cornerRadius ? (
            <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
        <div className="space-y-1">
          {paddingTop ? <SliderFieldRow field={paddingTop} values={values} onFieldChange={onFieldChange} /> : null}
          {paddingBottom ? (
            <SliderFieldRow field={paddingBottom} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {paddingLeft ? <SliderFieldRow field={paddingLeft} values={values} onFieldChange={onFieldChange} /> : null}
          {paddingRight ? (
            <SliderFieldRow field={paddingRight} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Image compare — Content group: Layout → Size → Appearance → Borders → Block link → Padding. */
function ImageCompareContentGroupSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = useMemo(
    () => prepareImageCompareContentGroupSettingsNode({ id: '', label: 'Content', kind: 'block', fields }),
    [fields]
  );
  const panelFields = prepared.fields ?? [];

  return (
    <BlockGroupLayoutSettingsPanel
      fields={panelFields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={IMAGE_COMPARE_CONTENT_GROUP_PANEL_GROUP_ORDER}
      groupPanelFields={groupImageCompareContentGroupPanelFields}
      pickField={pickImageCompareContentGroupField}
      resolveCustomWidth={resolveImageCompareContentGroupCustomWidthField}
      resolveCustomHeight={resolveImageCompareContentGroupCustomHeightField}
    />
  );
}

/** Image compare — Buttons group: Layout → Size → Appearance → Borders → Block link → Padding. */
function ImageCompareButtonsGroupGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = useMemo(
    () => prepareImageCompareButtonsGroupSettingsNode({ id: '', label: 'Buttons', kind: 'block', fields }),
    [fields]
  );
  const panelFields = prepared.fields ?? [];

  return (
    <BlockGroupLayoutSettingsPanel
      fields={panelFields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={IMAGE_COMPARE_BUTTONS_GROUP_PANEL_GROUP_ORDER}
      groupPanelFields={groupImageCompareButtonsGroupPanelFields}
      pickField={pickImageCompareButtonsGroupField}
      resolveCustomWidth={resolveImageCompareButtonsGroupCustomWidthField}
      resolveCustomHeight={resolveImageCompareButtonsGroupCustomHeightField}
    />
  );
}

/** Image compare — Text group: Layout → Size → Appearance → Borders → Block link → Padding. */
function ImageCompareTextGroupGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = useMemo(
    () => prepareImageCompareTextGroupSettingsNode({ id: '', label: 'Text', kind: 'block', fields }),
    [fields]
  );
  const panelFields = prepared.fields ?? [];

  return (
    <BlockGroupLayoutSettingsPanel
      fields={panelFields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={IMAGE_COMPARE_TEXT_GROUP_PANEL_GROUP_ORDER}
      groupPanelFields={groupImageCompareTextGroupPanelFields}
      pickField={pickImageCompareTextGroupField}
      resolveCustomWidth={resolveImageCompareTextGroupCustomWidthField}
      resolveCustomHeight={resolveImageCompareTextGroupCustomHeightField}
    />
  );
}

/** Heading / text blocks (section settings-backed). */
function ImageCompareSectionBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {fields.map((field) => (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    </div>
  );
}

/** Heading / text / email field blocks (section settings-backed). */
function EmailSignupSectionBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {fields.map((field) => (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    </div>
  );
}

/** Text / submit button blocks (section settings-backed). */
function ContactFormBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {fields.map((field) => (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    </div>
  );
}

/** Contact form → Text block: Text → Layout → Typography → Appearance → Padding. */
function ContactFormTextBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(
    () => groupContactFormTextPanelFields(filterContactFormTextFieldsForPreset(fields, values)),
    [fields, values]
  );

  return (
    <div>
      {CONTACT_FORM_TEXT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const textField = groupFields.find((f) => f.path.endsWith('.title')) ?? groupFields[0];
          return (
            <ShopifySettingsSection
              key={label}
              title="Text"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              <RichTextFieldRow
                field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                values={values}
                onFieldChange={onFieldChange}
                hideLabel
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('headingWidth'));
          const maxWidthField = groupFields.find((f) => f.path.endsWith('headingMaxWidth'));
          const alignmentField = groupFields.find((f) => f.path.endsWith('headingAlignment'));
          return (
            <ShopifySettingsSection key={label} title="Layout">
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {maxWidthField ? (
                <InlineSelectFieldRow field={maxWidthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {alignmentField ? (
                <HeadingAlignmentFieldRow
                  field={alignmentField}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Typography') {
          const presetField = groupFields.find((f) => f.path.endsWith('headingTypographyPreset'));
          const rest = groupFields.filter((f) => !f.path.endsWith('headingTypographyPreset'));
          return (
            <ShopifySettingsSection key={label} title="Typography">
              {presetField ? (
                <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {rest.map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('headingColor'));
          const background = groupFields.find((f) => f.path.endsWith('headingBackgroundEnabled'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('headingBackgroundColor'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('headingCornerRadius'));
          const backgroundOn =
            background && (values[background.path] === true || values[background.path] === 'true');
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {background ? (
                <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {backgroundOn && backgroundColor ? (
                <ThemeHexColorField
                  label={backgroundColor.label}
                  path={backgroundColor.path}
                  values={values}
                  defaultColor="#00000026"
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {backgroundOn && cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = [
            'headingPaddingTop',
            'headingPaddingBottom',
            'headingPaddingLeft',
            'headingPaddingRight',
          ];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Contact form → nested Contact form group: Size → Appearance → Input → Padding. */
function ContactFormFormGroupSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupContactFormFormGroupPanelFields(fields), [fields]);

  return (
    <div>
      {CONTACT_FORM_FORM_GROUP_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Size') {
          const desktopWidth = groupFields.find((f) => f.path.endsWith('formDesktopWidth'));
          const desktopCustom = groupFields.find((f) => f.path.endsWith('formDesktopCustomWidth'));
          const mobileWidth = groupFields.find((f) => f.path.endsWith('formMobileWidth'));
          const mobileCustom = groupFields.find((f) => f.path.endsWith('formMobileCustomWidth'));
          const desktopMode = desktopWidth
            ? fieldValueAsString(values, desktopWidth) || 'fit'
            : 'fit';
          const mobileMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';
          return (
            <ShopifySettingsSection key={label} title="Size">
              {desktopWidth ? (
                <SegmentedFieldRow field={desktopWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {desktopMode === 'custom' && desktopCustom ? (
                <SliderFieldRow field={desktopCustom} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mobileWidth ? (
                <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mobileMode === 'custom' && mobileCustom ? (
                <SliderFieldRow field={mobileCustom} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const backgroundColor = groupFields.find((f) => f.path.endsWith('formBackgroundColor'));
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {backgroundColor ? (
                <ThemeDefaultColorField
                  label="Background color"
                  path={backgroundColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={0}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Input') {
          const style = groupFields.find((f) => f.path.endsWith('formInputStyle'));
          return (
            <ShopifySettingsSection key={label} title="Input">
              {style ? (
                <>
                  <SegmentedFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                  <p className="px-1 pt-0.5 text-[12px] text-[#8a8a8a]">
                    Edit input field in{' '}
                    <span className="underline">theme settings</span>
                  </p>
                </>
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = [
            'formPaddingTop',
            'formPaddingBottom',
            'formPaddingLeft',
            'formPaddingRight',
          ];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Email signup → Email signup (form) block: Width → Heading → Input → Submit button → Padding. */
function EmailSignupFormBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupEmailSignupFormPanelFields(fields), [fields]);

  return (
    <div>
      <p className="px-4 pb-1 pt-3 text-[12px] text-[#8a8a8a]">
        Signups add <span className="underline">customer profiles</span>
      </p>
      {EMAIL_SIGNUP_FORM_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Width') {
          const widthField = groupFields.find((f) => f.path.endsWith('signupWidth'));
          const customField = groupFields.find((f) => f.path.endsWith('signupCustomWidth'));
          const mode = widthField ? fieldValueAsString(values, widthField) || 'fill' : 'fill';
          return (
            <ShopifySettingsSection key={label} title="Width" >
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mode === 'custom' && customField ? (
                <SliderFieldRow field={customField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Heading') {
          const textField = groupFields.find((f) => f.path.endsWith('signupHeadingText'));
          const colorField = groupFields.find((f) => f.path.endsWith('signupHeadingColor'));
          const presetField = groupFields.find((f) => f.path.endsWith('signupHeadingPreset'));
          return (
            <ShopifySettingsSection
              key={label}
              title="Heading"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              {textField ? (
                <RichTextFieldRow
                  field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                  values={values}
                  onFieldChange={onFieldChange}
                  hideLabel
                />
              ) : null}
              {colorField ? (
                <ThemePaletteColorField
                  label="Color"
                  path={colorField.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  fallbackColor="#111827"
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {presetField ? (
                <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Input') {
          const borderField = groupFields.find((f) => f.path.endsWith('signupInputBorder'));
          const styleField = groupFields.find((f) => f.path.endsWith('signupInputStyle'));
          return (
            <ShopifySettingsSection key={label} title="Input">
              {borderField ? (
                <InlineSelectFieldRow field={borderField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {styleField ? (
                <>
                  <SegmentedFieldRow field={styleField} values={values} onFieldChange={onFieldChange} />
                  <p className="px-1 pt-0.5 text-[12px] text-[#8a8a8a]">
                    Edit input field in <span className="underline">theme settings</span>
                  </p>
                </>
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Submit button') {
          const styleField = groupFields.find((f) => f.path.endsWith('signupSubmitStyle'));
          const linkColor = groupFields.find((f) => f.path.endsWith('signupSubmitLinkColor'));
          const displayField = groupFields.find((f) => f.path.endsWith('signupSubmitDisplay'));
          const integrated = groupFields.find((f) => f.path.endsWith('signupIntegratedButton'));
          const styleValue = styleField ? fieldValueAsString(values, styleField) || 'link' : 'link';
          return (
            <ShopifySettingsSection key={label} title="Submit button">
              {styleField ? (
                <>
                  <InlineSelectFieldRow field={styleField} values={values} onFieldChange={onFieldChange} />
                  <p className="px-1 pt-0.5 text-[12px] text-[#8a8a8a]">
                    Edit primary and secondary button styles in{' '}
                    <span className="underline">theme settings</span>
                  </p>
                </>
              ) : null}
              {styleValue === 'link' && linkColor ? (
                <ThemeDefaultColorField
                  label="Link text color"
                  path={linkColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {displayField ? (
                <SegmentedFieldRow field={displayField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {integrated ? (
                <ToggleSwitchFieldRow field={integrated} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = [
            'signupPaddingTop',
            'signupPaddingBottom',
            'signupPaddingLeft',
            'signupPaddingRight',
          ];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Email signup → Heading block: Text → Layout → Typography → Appearance → Padding. */
function EmailSignupHeadingBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(
    () => groupEmailSignupHeadingPanelFields(filterEmailSignupHeadingFieldsForPreset(fields, values)),
    [fields, values]
  );

  return (
    <div>
      {EMAIL_SIGNUP_HEADING_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const textField = groupFields.find((f) => f.path.endsWith('.title')) ?? groupFields[0];
          return (
            <ShopifySettingsSection
              key={label}
              title="Text"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              <RichTextFieldRow
                field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                values={values}
                onFieldChange={onFieldChange}
                hideLabel
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('headingWidth'));
          const maxWidthField = groupFields.find((f) => f.path.endsWith('headingMaxWidth'));
          const alignmentField = groupFields.find((f) => f.path.endsWith('headingAlignment'));
          return (
            <ShopifySettingsSection key={label} title="Layout">
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {maxWidthField ? (
                <InlineSelectFieldRow field={maxWidthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {alignmentField ? (
                <HeadingAlignmentFieldRow
                  field={alignmentField}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Typography') {
          const presetField = groupFields.find((f) => f.path.endsWith('headingTypographyPreset'));
          const rest = groupFields.filter((f) => !f.path.endsWith('headingTypographyPreset'));
          return (
            <ShopifySettingsSection key={label} title="Typography">
              {presetField ? (
                <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {rest.map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('headingColor'));
          const background = groupFields.find((f) => f.path.endsWith('headingBackgroundEnabled'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('headingBackgroundColor'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('headingCornerRadius'));
          const backgroundOn =
            background && (values[background.path] === true || values[background.path] === 'true');
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {background ? (
                <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {backgroundOn && backgroundColor ? (
                <ThemeHexColorField
                  label={backgroundColor.label}
                  path={backgroundColor.path}
                  values={values}
                  defaultColor="#00000026"
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {backgroundOn && cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = [
            'headingPaddingTop',
            'headingPaddingBottom',
            'headingPaddingLeft',
            'headingPaddingRight',
          ];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Email signup → Text block: Text → Layout → Typography → Appearance → Padding. */
function EmailSignupTextBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(
    () => groupEmailSignupTextPanelFields(filterEmailSignupTextFieldsForPreset(fields, values)),
    [fields, values]
  );

  return (
    <div>
      {EMAIL_SIGNUP_TEXT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const textField = groupFields.find((f) => f.path.endsWith('.subtitle')) ?? groupFields[0];
          return (
            <ShopifySettingsSection
              key={label}
              title="Text"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              <RichTextFieldRow
                field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                values={values}
                onFieldChange={onFieldChange}
                hideLabel
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('textWidth'));
          const maxWidthField = groupFields.find((f) => f.path.endsWith('textMaxWidth'));
          const alignmentField = groupFields.find((f) => f.path.endsWith('textAlignment'));
          return (
            <ShopifySettingsSection key={label} title="Layout">
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {maxWidthField ? (
                <InlineSelectFieldRow field={maxWidthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {alignmentField ? (
                <HeadingAlignmentFieldRow
                  field={alignmentField}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Typography') {
          const presetField = groupFields.find((f) => f.path.endsWith('textTypographyPreset'));
          const rest = groupFields.filter((f) => !f.path.endsWith('textTypographyPreset'));
          return (
            <ShopifySettingsSection key={label} title="Typography">
              {presetField ? (
                <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {rest.map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('textColor'));
          const background = groupFields.find((f) => f.path.endsWith('textBackgroundEnabled'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('textBackgroundColor'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('textCornerRadius'));
          const backgroundOn =
            background && (values[background.path] === true || values[background.path] === 'true');
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {background ? (
                <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {backgroundOn && backgroundColor ? (
                <ThemeHexColorField
                  label={backgroundColor.label}
                  path={backgroundColor.path}
                  values={values}
                  defaultColor="#00000026"
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {backgroundOn && cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = [
            'textPaddingTop',
            'textPaddingBottom',
            'textPaddingLeft',
            'textPaddingRight',
          ];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Contact form → Submit button: Label + Style → Size. */
function ContactFormSubmitButtonSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupContactFormSubmitPanelFields(fields), [fields]);

  return (
    <div>
      {CONTACT_FORM_SUBMIT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Content') {
          const labelField = groupFields.find((f) => f.path.endsWith('submitLabel'));
          const styleField = groupFields.find((f) => f.path.endsWith('submitStyle'));
          return (
            <div key={label} className="px-1 py-3 space-y-1">
              {labelField ? (
                <AccordionRowHeadingFieldRow
                  field={{ ...labelField, label: 'Label' }}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {styleField ? (
                <>
                  <InlineSelectFieldRow
                    field={styleField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                  <p className="pt-0.5 text-[12px] text-[#8a8a8a]">
                    Edit primary and secondary button styles in{' '}
                    <span className="underline">theme settings</span>
                  </p>
                </>
              ) : null}
            </div>
          );
        }

        if (label === 'Size') {
          const desktopWidth = groupFields.find((f) => f.path.endsWith('submitDesktopWidth'));
          const desktopCustom = groupFields.find((f) => f.path.endsWith('submitDesktopCustomWidth'));
          const mobileWidth = groupFields.find((f) => f.path.endsWith('submitMobileWidth'));
          const mobileCustom = groupFields.find((f) => f.path.endsWith('submitMobileCustomWidth'));
          const desktopMode = desktopWidth
            ? fieldValueAsString(values, desktopWidth) || 'fit'
            : 'fit';
          const mobileMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';
          return (
            <ShopifySettingsSection key={label} title="Size">
              {desktopWidth ? (
                <SegmentedFieldRow field={desktopWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {desktopMode === 'custom' && desktopCustom ? (
                <SliderFieldRow field={desktopCustom} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mobileWidth ? (
                <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mobileMode === 'custom' && mobileCustom ? (
                <SliderFieldRow field={mobileCustom} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Contact form: Layout → Size → Appearance → Padding → Custom CSS. */
function ContactFormGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupContactFormPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {CONTACT_FORM_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <ContactFormLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <ContactFormAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          const borderStyle = groupFields.find((f) => f.path.endsWith('borderStyle'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('cornerRadius'));
          return (
            <ShopifySettingsSection key={label} title="Borders">
              {borderStyle ? (
                <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

const DIVIDER_STYLING_FIELD_ORDER = [
  'backgroundColor',
  'color',
  'sectionWidth',
  'thickness',
  'length',
] as const;

/** Divider styling rows (no section heading — matches Shopify). */
function DividerStylingSettingsGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const rank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = DIVIDER_STYLING_FIELD_ORDER.indexOf(key as (typeof DIVIDER_STYLING_FIELD_ORDER)[number]);
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => rank(a.path) - rank(b.path));

  return (
    <div className="space-y-1 px-1 py-3">
      {ordered.map((field) => {
        const key = field.path.split('.').pop() ?? '';
        if (field.widget === 'color-scheme' || key === 'colorScheme') {
          return null;
        }
        if (field.widget === 'color' || field.type === 'color' || key === 'backgroundColor' || key === 'color') {
          return (
            <ThemeDefaultColorField
              key={field.path}
              label={field.label}
              path={field.path}
              values={values}
              colorPalette={colorPalette}
              defaultPaletteIndex={key === 'backgroundColor' ? 0 : 1}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (field.widget === 'segmented' || key === 'sectionWidth') {
          return (
            <SegmentedFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (field.widget === 'slider' || key === 'thickness' || key === 'length') {
          return (
            <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        }
        return (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        );
      })}
    </div>
  );
}

const ANNOUNCEMENT_APPEARANCE_FIELD_ORDER = [
  'sectionWidth',
  'backgroundColor',
  'dividerThickness',
  'dividerColor',
] as const;

function AnnouncementAppearanceSettingsGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const rank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = ANNOUNCEMENT_APPEARANCE_FIELD_ORDER.indexOf(
      key as (typeof ANNOUNCEMENT_APPEARANCE_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => rank(a.path) - rank(b.path));

  return (
    <div className="space-y-0.5">
      {ordered.map((field) => {
        const key = field.path.split('.').pop() ?? '';
        if (field.widget === 'color-scheme' || key === 'colorScheme') {
          return (
            <ColorSchemeFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (field.widget === 'segmented' || key === 'sectionWidth') {
          return (
            <SegmentedFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (field.widget === 'color' || field.type === 'color') {
          return (
            <ThemePaletteColorField
              key={field.path}
              label={field.label}
              path={field.path}
              values={values}
              colorPalette={colorPalette}
              defaultPaletteIndex={key === 'dividerColor' ? 1 : 0}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (field.widget === 'slider' || key === 'dividerThickness') {
          return (
            <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        }
        return (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        );
      })}
    </div>
  );
}

/** Announcement bar: time → Appearance → Padding → Custom CSS (Shopify order). */
function AnnouncementBarGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupAnnouncementPanelFields(fields), [fields]);
  const hasVisible = ANNOUNCEMENT_PANEL_GROUP_ORDER.some((label) => (grouped.get(label)?.length ?? 0) > 0);

  if (!hasVisible) {
    // Last-resort: show raw fields so the sheet is never an empty white panel.
    if (!fields.length) {
      return (
        <p className="px-1 py-3 text-[13px] text-gray-500">No settings for this item.</p>
      );
    }
    return (
      <div className="space-y-1 px-1 py-3">
        {fields.map((field) => (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {ANNOUNCEMENT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {groupFields.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        if (label === 'Appearance') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <AnnouncementAppearanceSettingsGroup
                fields={groupFields}
                values={values}
                colorPalette={colorPalette}
                onFieldChange={onFieldChange}
              />
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme Settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function DividerGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupDividerPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {DIVIDER_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <DividerStylingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Custom section: Layout → Size → Appearance → Padding → Custom CSS. */
function CustomSectionGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupCustomSectionPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {CUSTOM_SECTION_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <ContactFormLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <ContactFormAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product — Details block: size, layout, appearance, borders, and padding. */
function FeaturedProductDetailsGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductDetailsPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FEATURED_PRODUCT_DETAILS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Size') {
          const width = pickFeaturedProductDetailsField(fields, 'width');
          const mobileWidth = pickFeaturedProductDetailsField(fields, 'mobileWidth');
          const height = pickFeaturedProductDetailsField(fields, 'height');
          const widthCustom = resolveFeaturedProductDetailsCustomWidthField(fields, width, 'customWidth');
          const mobileWidthCustom = resolveFeaturedProductDetailsCustomWidthField(
            fields,
            mobileWidth,
            'mobileCustomWidth'
          );
          const widthMode = width ? fieldValueAsString(values, width) || 'fit' : 'fit';
          const mobileWidthMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {width ? (
                  <>
                    <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                    {widthMode === 'custom' && widthCustom ? (
                      <SliderFieldRow field={widthCustom} values={values} onFieldChange={onFieldChange} />
                    ) : null}
                  </>
                ) : null}
                {mobileWidth ? (
                  <>
                    <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
                    {mobileWidthMode === 'custom' && mobileWidthCustom ? (
                      <SliderFieldRow
                        field={mobileWidthCustom}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : null}
                {height ? (
                  <SegmentedFieldRow field={height} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Layout') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));
          const layoutGap = byKey('layoutGap');
          const stickyOnDesktop = byKey('stickyOnDesktop');

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {layoutGap ? (
                  <SliderFieldRow field={layoutGap} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {stickyOnDesktop ? (
                  <ToggleSwitchFieldRow
                    field={stickyOnDesktop}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));
          const bgMediaField = byKey('backgroundMedia');
          const bgColorField = byKey('backgroundColor');
          const bgImageField = byKey('backgroundImageUrl');
          const bgImagePosition = byKey('backgroundImagePosition');
          const bgMedia = bgMediaField
            ? fieldValueAsString(values, bgMediaField) || 'none'
            : 'none';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {bgMediaField ? (
                  <InlineSelectFieldRow
                    field={bgMediaField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImageField ? (
                  <ImagePickerFieldRow
                    field={bgImageField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImagePosition ? (
                  <SegmentedFieldRow
                    field={bgImagePosition}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia !== 'image' && bgColorField ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={bgColorField.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const borderStyleField = groupFields.find((f) => f.path.endsWith('.borderStyle'));
          const borderThickness = groupFields.find((f) => f.path.endsWith('.borderThickness'));
          const borderOpacity = groupFields.find((f) => f.path.endsWith('.borderOpacity'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('.cornerRadius'));
          const borderStyle = borderStyleField
            ? fieldValueAsString(values, borderStyleField) || 'none'
            : 'none';
          const solidBorders = borderStyle === 'solid';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {borderStyleField ? (
                  <SegmentedFieldRow
                    field={borderStyleField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && borderThickness ? (
                  <SliderFieldRow
                    field={borderThickness}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && borderOpacity ? (
                  <SliderFieldRow field={borderOpacity} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product — Review stars block: style, review count, text color, and typography. */
function FeaturedProductReviewStarsGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductReviewStarsPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="px-1 py-3">
        <p className="text-[13px] text-gray-600">
          Displays reviews from parent product. An app is required for product ratings.{' '}
          <a href="#" className="text-[#005bd3] underline" onClick={(e) => e.preventDefault()}>
            Learn more
          </a>
        </p>
      </div>
      {FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const style = groupFields.find((f) => f.path.endsWith('.style'));
          const reviewCount = groupFields.find((f) => f.path.endsWith('.reviewCount'));
          const textColor = groupFields.find((f) => f.path.endsWith('.textColor'));
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {style ? (
                  <InlineSelectFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {reviewCount ? (
                  <ToggleSwitchFieldRow field={reviewCount} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {textColor ? (
                  <ThemeDefaultColorField
                    label="Text color"
                    path={textColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('.typographyPreset'));
          const width = groupFields.find((f) => f.path.endsWith('.width'));
          const alignment = groupFields.find((f) => f.path.endsWith('.alignment'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {preset ? (
                  <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {width ? (
                  <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {alignment ? (
                  <HeadingAlignmentFieldRow
                    field={alignment}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product — Variant picker block: type, appearance, and padding. */
function FeaturedProductVariantPickerGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductVariantPickerPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Type') {
          const style = groupFields.find((f) => f.path.endsWith('.style'));
          const swatches = groupFields.find((f) => f.path.endsWith('.swatches'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {style ? (
                  <InlineSelectFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {swatches ? (
                  <ToggleSwitchFieldRow field={swatches} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('.textColor'));
          const variantStyle = groupFields.find((f) => f.path.endsWith('.variantStyle'));
          const selectedVariantStyle = groupFields.find((f) => f.path.endsWith('.selectedVariantStyle'));
          const alignment = groupFields.find((f) => f.path.endsWith('.alignment'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {textColor ? (
                  <ThemeDefaultColorField
                    label="Text color"
                    path={textColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {variantStyle ? (
                  <>
                    <SegmentedFieldRow
                      field={variantStyle}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                    <p className="px-1 pt-0.5 text-[12px] text-[#8a8a8a]">
                      Edit variant styling in{' '}
                      <a href="/settings/theme" className="underline">
                        theme settings
                      </a>
                    </p>
                  </>
                ) : null}
                {selectedVariantStyle ? (
                  <SegmentedFieldRow
                    field={selectedVariantStyle}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {alignment ? (
                  <HeadingAlignmentFieldRow
                    field={alignment}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function FeaturedProductConditionalVisibilityNote() {
  return (
    <div className="flex items-center gap-2 border-b border-[#e1e1e1] px-1 py-3 text-[13px] text-gray-600">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-gray-400">
        <EyeIcon className="h-3.5 w-3.5 text-gray-500" />
      </span>
      Visible if certain conditions are met
    </div>
  );
}

/** Featured product — Add to cart nested block: button style. */
function FeaturedProductAddToCartGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductAddToCartPanelFields(fields), [fields]);
  const styleField = grouped.get('Appearance')?.find((f) => f.path.endsWith('.style'));

  return (
    <div>
      <FeaturedProductConditionalVisibilityNote />
      {styleField ? (
        <div className="px-1 py-3">
          <RichTextButtonStyleRow field={styleField} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : null}
    </div>
  );
}

/** Featured product — Quantity nested block: input style. */
function FeaturedProductQuantityGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductQuantityPanelFields(fields), [fields]);
  const styleField = grouped.get('Input')?.find((f) => f.path.endsWith('.inputStyle'));

  return (
    <div>
      <FeaturedProductConditionalVisibilityNote />
      {styleField ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Input</h3>
          <SegmentedFieldRow field={styleField} values={values} onFieldChange={onFieldChange} />
          <p className="px-1 pt-0.5 text-[12px] text-[#8a8a8a]">
            Edit input field in{' '}
            <a href="/settings/theme" className="underline">
              theme settings
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Featured product — nested blocks with no customizable settings (quantity, accelerated checkout). */
function FeaturedProductNoCustomSettingsPanel() {
  return (
    <div>
      <FeaturedProductConditionalVisibilityNote />
      <p className="px-1 py-3 text-[13px] text-gray-600">No customizable settings available.</p>
    </div>
  );
}

/** Featured product — Buy buttons block: stacking, pickup, gift card, and padding. */
function FeaturedProductBuyButtonsGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductBuyButtonsPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const alwaysStack = groupFields.find((f) => f.path.endsWith('.alwaysStackButtons'));
          const textColor = groupFields.find((f) => f.path.endsWith('.textColor'));
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {alwaysStack ? (
                  <ToggleSwitchFieldRow
                    field={alwaysStack}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {textColor ? (
                  <ThemeDefaultColorField
                    label="Text color"
                    path={textColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Local pickup') {
          const showPickup = groupFields.find((f) => f.path.endsWith('.showPickupAvailability'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              {showPickup ? (
                <>
                  <ToggleSwitchFieldRow
                    field={{ ...showPickup, description: undefined }}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                  {showPickup.description ? (
                    <p className="pb-1 text-[12px] text-gray-500">
                      {showPickup.description}{' '}
                      <a href="#" className="text-[#005bd3] underline" onClick={(e) => e.preventDefault()}>
                        Learn more
                      </a>
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        }

        if (label === 'Gift card products') {
          const giftCardForm = groupFields.find((f) => f.path.endsWith('.giftCardForm'));
          const buttonStyle = groupFields.find((f) => f.path.endsWith('.giftCardButtonStyle'));
          const selectedButtonStyle = groupFields.find((f) =>
            f.path.endsWith('.giftCardSelectedButtonStyle')
          );
          const inputStyle = groupFields.find((f) => f.path.endsWith('.giftCardInputStyle'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {giftCardForm ? (
                  <>
                    <ToggleSwitchFieldRow
                      field={{ ...giftCardForm, description: undefined }}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                    {giftCardForm.description ? (
                      <p className="pb-1 text-[12px] text-gray-500">
                        {giftCardForm.description}{' '}
                        <a href="#" className="text-[#005bd3] underline" onClick={(e) => e.preventDefault()}>
                          Learn more
                        </a>
                      </p>
                    ) : null}
                  </>
                ) : null}
                {buttonStyle ? (
                  <SegmentedFieldRow field={buttonStyle} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {selectedButtonStyle ? (
                  <SegmentedFieldRow
                    field={selectedButtonStyle}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {inputStyle ? (
                  <>
                    <SegmentedFieldRow field={inputStyle} values={values} onFieldChange={onFieldChange} />
                    <p className="px-1 pt-0.5 text-[12px] text-[#8a8a8a]">
                      Edit input field in{' '}
                      <a href="/settings/theme" className="underline">
                        theme settings
                      </a>
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product — Header block: layout, size, appearance, block link, and padding. */
function FeaturedProductHeaderGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductHeaderPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FEATURED_PRODUCT_HEADER_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));
          const direction = byKey('direction');
          const alignment = byKey('alignment');
          const position = byKey('position');
          const layoutGap = byKey('layoutGap');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {direction ? (
                  <SegmentedFieldRow field={direction} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {alignment ? (
                  <HeadingAlignmentFieldRow
                    field={alignment}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {position ? (
                  <InlineSelectFieldRow field={position} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {layoutGap ? (
                  <SliderFieldRow field={layoutGap} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Size') {
          const width = pickFeaturedProductHeaderField(fields, 'width');
          const mobileWidth = pickFeaturedProductHeaderField(fields, 'mobileWidth');
          const height = pickFeaturedProductHeaderField(fields, 'height');
          const widthCustom = resolveFeaturedProductHeaderCustomWidthField(fields, width, 'customWidth');
          const mobileWidthCustom = resolveFeaturedProductHeaderCustomWidthField(
            fields,
            mobileWidth,
            'mobileCustomWidth'
          );
          const heightCustom = resolveFeaturedProductHeaderCustomHeightField(fields, height);
          const widthMode = width ? fieldValueAsString(values, width) || 'fit' : 'fit';
          const mobileWidthMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';
          const heightMode = height ? fieldValueAsString(values, height) || 'fit' : 'fit';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {width ? (
                  <>
                    <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                    {widthMode === 'custom' && widthCustom ? (
                      <SliderFieldRow field={widthCustom} values={values} onFieldChange={onFieldChange} />
                    ) : null}
                  </>
                ) : null}
                {mobileWidth ? (
                  <>
                    <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
                    {mobileWidthMode === 'custom' && mobileWidthCustom ? (
                      <SliderFieldRow
                        field={mobileWidthCustom}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : null}
                {height ? (
                  <>
                    <SegmentedFieldRow field={height} values={values} onFieldChange={onFieldChange} />
                    {heightMode === 'custom' && heightCustom ? (
                      <SliderFieldRow field={heightCustom} values={values} onFieldChange={onFieldChange} />
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));
          const bgMediaField = byKey('backgroundMedia');
          const bgColorField = byKey('backgroundColor');
          const bgImageField = byKey('backgroundImageUrl');
          const bgImagePosition = byKey('backgroundImagePosition');
          const backgroundOverlay = byKey('backgroundOverlay');
          const bgMedia = bgMediaField
            ? fieldValueAsString(values, bgMediaField) || 'none'
            : 'none';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {bgMediaField ? (
                  <InlineSelectFieldRow
                    field={bgMediaField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImageField ? (
                  <ImagePickerFieldRow
                    field={bgImageField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImagePosition ? (
                  <SegmentedFieldRow
                    field={bgImagePosition}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia !== 'image' && bgColorField ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={bgColorField.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {backgroundOverlay ? (
                  <ToggleSwitchFieldRow
                    field={backgroundOverlay}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const borderStyleField = groupFields.find((f) => f.path.endsWith('.borderStyle'));
          const borderThickness = groupFields.find((f) => f.path.endsWith('.borderThickness'));
          const borderOpacity = groupFields.find((f) => f.path.endsWith('.borderOpacity'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('.cornerRadius'));
          const borderStyle = borderStyleField
            ? fieldValueAsString(values, borderStyleField) || 'none'
            : 'none';
          const solidBorders = borderStyle === 'solid';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {borderStyleField ? (
                  <SegmentedFieldRow
                    field={borderStyleField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && borderThickness ? (
                  <SliderFieldRow
                    field={borderThickness}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && borderOpacity ? (
                  <SliderFieldRow field={borderOpacity} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Block link') {
          const linkUrl = groupFields.find((f) => f.path.endsWith('.linkUrl'));
          const openLinkInNewTab = groupFields.find((f) => f.path.endsWith('.openLinkInNewTab'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {linkUrl ? (
                  <LinkFieldRow field={linkUrl} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {openLinkInNewTab ? (
                  <ToggleSwitchFieldRow
                    field={openLinkInNewTab}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection list Header / Video Caption — layout, size, appearance, borders, block link, padding. */
function BlockGroupLayoutSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
  groupOrder,
  groupPanelFields,
  pickField,
  resolveCustomWidth,
  resolveCustomHeight,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  groupOrder: readonly string[];
  groupPanelFields: (fields: EditorFieldDef[]) => Map<string, EditorFieldDef[]>;
  pickField: (fields: EditorFieldDef[], key: string) => EditorFieldDef | undefined;
  resolveCustomWidth: (
    fields: EditorFieldDef[],
    anchor: EditorFieldDef | undefined,
    key: 'customWidth' | 'mobileCustomWidth'
  ) => EditorFieldDef | null;
  resolveCustomHeight: (
    fields: EditorFieldDef[],
    anchor: EditorFieldDef | undefined
  ) => EditorFieldDef | null;
}) {
  const grouped = useMemo(() => groupPanelFields(fields), [fields, groupPanelFields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {groupOrder.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));
          const direction = byKey('direction');
          const verticalOnMobile = byKey('verticalOnMobile');
          const layoutAlignment = byKey('layoutAlignment');
          const position = byKey('position');
          const alignTextBaseline = byKey('alignTextBaseline');
          const layoutGap = byKey('layoutGap');
          const layoutAlignmentField =
            layoutAlignment && layoutAlignment.widget !== 'segmented'
              ? { ...layoutAlignment, widget: 'select-inline' as const }
              : layoutAlignment;

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {direction ? (
                  <SegmentedFieldRow field={direction} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {verticalOnMobile ? (
                  <ToggleSwitchFieldRow
                    field={verticalOnMobile}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {layoutAlignmentField?.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    field={layoutAlignmentField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : layoutAlignmentField ? (
                  <InlineSelectFieldRow
                    field={layoutAlignmentField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {position ? (
                  <InlineSelectFieldRow field={position} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {alignTextBaseline ? (
                  <ToggleSwitchFieldRow
                    field={alignTextBaseline}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {layoutGap ? (
                  <SliderFieldRow field={layoutGap} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Size') {
          const width = pickField(fields, 'width');
          const mobileWidth = pickField(fields, 'mobileWidth');
          const height = pickField(fields, 'height');
          const widthCustom = resolveCustomWidth(fields, width, 'customWidth');
          const mobileWidthCustom = resolveCustomWidth(fields, mobileWidth, 'mobileCustomWidth');
          const heightCustom = resolveCustomHeight(fields, height);
          const widthMode = width ? fieldValueAsString(values, width) || 'fit' : 'fit';
          const mobileWidthMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';
          const heightMode = height ? fieldValueAsString(values, height) || 'fit' : 'fit';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {width ? (
                  <>
                    <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                    {widthMode === 'custom' && widthCustom ? (
                      <SliderFieldRow field={widthCustom} values={values} onFieldChange={onFieldChange} />
                    ) : null}
                  </>
                ) : null}
                {mobileWidth ? (
                  <>
                    <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
                    {mobileWidthMode === 'custom' && mobileWidthCustom ? (
                      <SliderFieldRow
                        field={mobileWidthCustom}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : null}
                {height ? (
                  <>
                    <SegmentedFieldRow field={height} values={values} onFieldChange={onFieldChange} />
                    {heightMode === 'custom' && heightCustom ? (
                      <SliderFieldRow field={heightCustom} values={values} onFieldChange={onFieldChange} />
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));
          const bgMediaField = byKey('backgroundMedia');
          const bgImageField = byKey('backgroundImageUrl');
          const bgImagePosition = byKey('backgroundImagePosition');
          const bgColorField = byKey('backgroundColor');
          const backgroundOverlay = byKey('backgroundOverlay');
          const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {bgMediaField ? (
                  <InlineSelectFieldRow
                    field={bgMediaField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImageField ? (
                  <ImagePickerFieldRow
                    field={bgImageField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImagePosition ? (
                  <SegmentedFieldRow
                    field={bgImagePosition}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgColorField ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={bgColorField.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    fallbackColor="#ffffff"
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {backgroundOverlay ? (
                  <ToggleSwitchFieldRow
                    field={backgroundOverlay}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const borderStyleField = groupFields.find((f) => f.path.endsWith('borderStyle'));
          const borderStyle = borderStyleField
            ? fieldValueAsString(values, borderStyleField) || 'none'
            : 'none';
          const solidBorders = borderStyle === 'solid';
          const borderThickness = groupFields.find((f) => f.path.endsWith('borderThickness'));
          const borderOpacity = groupFields.find((f) => f.path.endsWith('borderOpacity'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('cornerRadius'));

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {borderStyleField ? (
                  <SegmentedFieldRow
                    field={borderStyleField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && borderThickness ? (
                  <SliderFieldRow
                    field={borderThickness}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && borderOpacity ? (
                  <SliderFieldRow field={borderOpacity} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Block link') {
          const linkUrl = groupFields.find((f) => f.path.endsWith('.linkUrl'));
          const openLinkInNewTab = groupFields.find((f) => f.path.endsWith('.openLinkInNewTab'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {linkUrl ? (
                  <LinkFieldRow field={linkUrl} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {openLinkInNewTab ? (
                  <ToggleSwitchFieldRow
                    field={openLinkInNewTab}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection list — Header block: layout, size, appearance, borders, block link, and padding. */
function CollectionListHeaderGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  return (
    <BlockGroupLayoutSettingsPanel
      fields={fields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={COLLECTION_LIST_HEADER_PANEL_GROUP_ORDER}
      groupPanelFields={groupCollectionListHeaderPanelFields}
      pickField={pickCollectionListHeaderField}
      resolveCustomWidth={resolveCollectionListHeaderCustomWidthField}
      resolveCustomHeight={resolveCollectionListHeaderCustomHeightField}
    />
  );
}

/** Storytelling Video — Caption group block. */
function StorytellingVideoCaptionGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  return (
    <BlockGroupLayoutSettingsPanel
      fields={fields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={STORYTELLING_VIDEO_CAPTION_PANEL_GROUP_ORDER}
      groupPanelFields={groupStorytellingVideoCaptionPanelFields}
      pickField={pickStorytellingVideoCaptionField}
      resolveCustomWidth={resolveStorytellingVideoCaptionCustomWidthField}
      resolveCustomHeight={resolveStorytellingVideoCaptionCustomHeightField}
    />
  );
}

/** Image with text — Group block. */
function ImageWithTextGroupGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  return (
    <BlockGroupLayoutSettingsPanel
      fields={fields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={IMAGE_WITH_TEXT_GROUP_PANEL_GROUP_ORDER}
      groupPanelFields={groupImageWithTextContentGroupPanelFields}
      pickField={pickImageWithTextContentGroupField}
      resolveCustomWidth={resolveImageWithTextContentGroupCustomWidthField}
      resolveCustomHeight={resolveImageWithTextContentGroupCustomHeightField}
    />
  );
}

/** Storytelling carousel — Carousel content group block. */
function StorytellingCarouselContentGroupGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const grouped = useMemo(() => groupStorytellingCarouselContentGroupPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {STORYTELLING_CAROUSEL_CONTENT_GROUP_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Appearance') {
          const backgroundColor = pickStorytellingCarouselContentGroupField(fields, 'backgroundColor');
          const cardHeight = pickStorytellingCarouselContentGroupField(fields, 'cardHeight');
          const position = pickStorytellingCarouselContentGroupField(fields, 'position');
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {backgroundColor ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={backgroundColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    fallbackColor="#ffffff"
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {cardHeight ? (
                  <SegmentedFieldRow field={cardHeight} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {position ? (
                  <InlineSelectFieldRow field={position} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const borderStyle = pickStorytellingCarouselContentGroupField(fields, 'borderStyle');
          const cornerRadius = pickStorytellingCarouselContentGroupField(fields, 'cornerRadius');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {borderStyle ? (
                  <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Storytelling carousel — Header group block: layout, size, appearance, borders, block link, padding. */
function StorytellingCarouselHeaderGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  return (
    <BlockGroupLayoutSettingsPanel
      fields={fields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={STORYTELLING_CAROUSEL_HEADER_PANEL_GROUP_ORDER}
      groupPanelFields={groupStorytellingCarouselHeaderPanelFields}
      pickField={pickStorytellingCarouselHeaderField}
      resolveCustomWidth={resolveStorytellingCarouselHeaderCustomWidthField}
      resolveCustomHeight={resolveStorytellingCarouselHeaderCustomHeightField}
    />
  );
}

/** Storytelling carousel — Card block: layout, appearance, block link, and padding. */
function StorytellingCarouselCardGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  return (
    <BlockGroupLayoutSettingsPanel
      fields={fields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={STORYTELLING_CAROUSEL_CARD_PANEL_GROUP_ORDER}
      groupPanelFields={groupStorytellingCarouselCardPanelFields}
      pickField={pickStorytellingCarouselCardField}
      resolveCustomWidth={() => null}
      resolveCustomHeight={() => null}
    />
  );
}

/** Editorial — nested Group block. */
function EditorialGroupGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  return (
    <BlockGroupLayoutSettingsPanel
      fields={fields}
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
      groupOrder={EDITORIAL_GROUP_PANEL_GROUP_ORDER}
      groupPanelFields={groupEditorialTextGroupPanelFields}
      pickField={pickEditorialTextGroupField}
      resolveCustomWidth={resolveEditorialTextGroupCustomWidthField}
      resolveCustomHeight={resolveEditorialTextGroupCustomHeightField}
    />
  );
}

/** Featured collection — Header block: layout, size, appearance, borders, and padding. */
function FeaturedCollectionHeaderPercentSliderRow({
  field,
  values,
  settingsBase,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  settingsBase: string;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const { min, max, step } = FC_HEADER_PERCENT_SLIDER_BOUNDS;
  const current = featuredCollectionHeaderPercentValue(values, field, settingsBase);
  const id = fieldInputId(field.path);

  const commit = (raw: string) => {
    onFieldChange(field.path, 'number', String(clampFeaturedCollectionHeaderPercent(raw)));
  };

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <label htmlFor={id} className="text-[13px] text-gray-800">
        {field.label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => commit(e.target.value)}
          onInput={(e) => commit((e.target as HTMLInputElement).value)}
          className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
        />
        <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => commit(e.target.value)}
            className="w-[3.25rem] border-0 bg-transparent px-1.5 py-1.5 text-center text-[13px] tabular-nums text-gray-900 focus:outline-none"
            aria-label={field.label}
          />
          <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">%</span>
        </div>
      </div>
    </div>
  );
}

function FeaturedCollectionHeaderGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const grouped = useMemo(() => groupFeaturedCollectionHeaderPanelFields(fields), [fields]);
  const styleField = pickFeaturedCollectionHeaderField(fields, 'width');
  const settingsBase =
    styleField?.path.replace(/\.width$/, '') || featuredCollectionHeaderSettingsBase(fields);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FC_HEADER_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Size' && label !== 'Appearance') return null;

        if (label === 'Layout') {
          const byKey = (key: string) => groupFields?.find((f) => f.path.endsWith(key));
          const direction = byKey('direction');
          const verticalOnMobile = byKey('verticalOnMobile');
          const layoutAlignment = byKey('layoutAlignment');
          const position = byKey('position');
          const alignTextBaseline = byKey('alignTextBaseline');
          const layoutGap = byKey('layoutGap');
          const directionMode = direction ? fieldValueAsString(values, direction) || 'horizontal' : 'horizontal';
          const isVertical = directionMode === 'vertical';

          const handleDirectionChange = (
            path: string,
            type: ThemeEditorFieldType,
            value: string | boolean
          ) => {
            onFieldChange(path, type, value);
            if (!layoutAlignment || typeof value !== 'string') return;
            if (value === 'vertical') {
              const cur = fieldValueAsString(values, layoutAlignment) || '';
              if (!['left', 'center', 'right'].includes(cur)) {
                onFieldChange(layoutAlignment.path, 'text', 'left');
              }
            } else if (value === 'horizontal') {
              const cur = fieldValueAsString(values, layoutAlignment) || '';
              if (['left', 'center', 'right'].includes(cur)) {
                onFieldChange(
                  layoutAlignment.path,
                  'text',
                  cur === 'left' ? 'space-between' : cur === 'right' ? 'flex-end' : 'center'
                );
              }
            }
          };

          const horizontalPositionField = position ? position : undefined;
          const horizontalAlignmentField = layoutAlignment
            ? { ...layoutAlignment, widget: 'select-inline' as const }
            : undefined;

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {direction ? (
                  <SegmentedFieldRow
                    field={direction}
                    values={values}
                    onFieldChange={handleDirectionChange}
                  />
                ) : null}
                {isVertical ? (
                  <>
                    {alignTextBaseline ? (
                      <ToggleSwitchFieldRow
                        field={alignTextBaseline}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                    {layoutAlignment ? (
                      <HeadingAlignmentFieldRow
                        field={layoutAlignment}
                        values={{
                          ...values,
                          [layoutAlignment.path]: (() => {
                            const raw = fieldValueAsString(values, layoutAlignment) || 'left';
                            if (raw === 'flex-start') return 'left';
                            if (raw === 'flex-end') return 'right';
                            if (['left', 'center', 'right'].includes(raw)) return raw;
                            return 'left';
                          })(),
                        }}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                    {position ? (
                      <InlineSelectFieldRow
                        field={position}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : (
                  <>
                    {verticalOnMobile ? (
                      <ToggleSwitchFieldRow
                        field={verticalOnMobile}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                    {horizontalAlignmentField ? (
                      <InlineSelectFieldRow
                        field={horizontalAlignmentField}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                    {horizontalPositionField ? (
                      <InlineSelectFieldRow
                        field={horizontalPositionField}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                    {alignTextBaseline ? (
                      <ToggleSwitchFieldRow
                        field={alignTextBaseline}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                )}
                {layoutGap ? (
                  <SliderFieldRow field={layoutGap} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Size') {
          const width = pickFeaturedCollectionHeaderField(fields, 'width');
          const mobileWidth = pickFeaturedCollectionHeaderField(fields, 'mobileWidth');
          const height = pickFeaturedCollectionHeaderField(fields, 'height');
          const widthCustom = resolveFeaturedCollectionHeaderCustomWidthField(fields, width, 'customWidth');
          const mobileWidthCustom = resolveFeaturedCollectionHeaderCustomWidthField(
            fields,
            mobileWidth,
            'mobileCustomWidth'
          );
          const heightCustom = resolveFeaturedCollectionHeaderCustomHeightField(fields, height);
          const widthMode = width ? fieldValueAsString(values, width) || 'fit' : 'fit';
          const mobileWidthMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';
          const heightMode = height ? fieldValueAsString(values, height) || 'fit' : 'fit';
          if (!width && !mobileWidth && !height) return null;

          const seedCustomPercent = (customField: EditorFieldDef | null) => {
            if (!customField) return;
            const raw = values[customField.path];
            if (raw === undefined || raw === '') {
              onFieldChange(customField.path, 'number', '100');
            }
          };

          const handleWidthModeChange = (
            path: string,
            type: ThemeEditorFieldType,
            value: string | boolean
          ) => {
            onFieldChange(path, type, value);
            if (value === 'custom') seedCustomPercent(widthCustom);
          };

          const handleMobileWidthModeChange = (
            path: string,
            type: ThemeEditorFieldType,
            value: string | boolean
          ) => {
            onFieldChange(path, type, value);
            if (value === 'custom') seedCustomPercent(mobileWidthCustom);
          };

          const handleHeightModeChange = (
            path: string,
            type: ThemeEditorFieldType,
            value: string | boolean
          ) => {
            onFieldChange(path, type, value);
            if (value === 'custom') seedCustomPercent(heightCustom);
          };

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {width ? (
                  <>
                    <SegmentedFieldRow
                      field={width}
                      values={values}
                      onFieldChange={handleWidthModeChange}
                    />
                    {widthMode === 'custom' && widthCustom ? (
                      <FeaturedCollectionHeaderPercentSliderRow
                        field={widthCustom}
                        values={values}
                        settingsBase={settingsBase}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : null}
                {mobileWidth ? (
                  <>
                    <SegmentedFieldRow
                      field={mobileWidth}
                      values={values}
                      onFieldChange={handleMobileWidthModeChange}
                    />
                    {mobileWidthMode === 'custom' && mobileWidthCustom ? (
                      <FeaturedCollectionHeaderPercentSliderRow
                        field={mobileWidthCustom}
                        values={values}
                        settingsBase={settingsBase}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : null}
                {height ? (
                  <>
                    <SegmentedFieldRow
                      field={height}
                      values={values}
                      onFieldChange={handleHeightModeChange}
                    />
                    {heightMode === 'custom' && heightCustom ? (
                      <FeaturedCollectionHeaderPercentSliderRow
                        field={heightCustom}
                        values={values}
                        settingsBase={settingsBase}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const bgMediaField = pickFeaturedCollectionHeaderField(fields, 'backgroundMedia');
          const bgImageField = settingsBase
            ? resolveFeaturedCollectionHeaderImageField(fields, settingsBase)
            : pickFeaturedCollectionHeaderField(fields, 'backgroundImageUrl');
          const bgImagePositionField = settingsBase
            ? resolveFeaturedCollectionHeaderImagePositionField(fields, settingsBase)
            : pickFeaturedCollectionHeaderField(fields, 'backgroundImagePosition');
          const bgColorField = settingsBase
            ? resolveFeaturedCollectionHeaderColorField(fields, settingsBase, 'backgroundColor', 'Background color')
            : pickFeaturedCollectionHeaderField(fields, 'backgroundColor');
          const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';
          if (!bgMediaField && !bgColorField) return null;

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {bgMediaField ? (
                  <InlineSelectFieldRow
                    field={bgMediaField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImageField ? (
                  <ImagePickerFieldRow
                    field={bgImageField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia === 'image' && bgImagePositionField ? (
                  <SegmentedFieldRow
                    field={bgImagePositionField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {bgMedia !== 'image' && bgColorField ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={bgColorField.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const borderStyle = groupFields?.find((f) => f.path.endsWith('borderStyle'));
          const borderStyleMode = borderStyle ? fieldValueAsString(values, borderStyle) || 'none' : 'none';
          const solidBorders = borderStyleMode === 'solid';
          const borderThickness = settingsBase
            ? resolveFeaturedCollectionHeaderBorderSliderField(
                fields,
                settingsBase,
                'borderThickness',
                'Thickness',
                'px',
                0,
                10
              )
            : pickFeaturedCollectionHeaderField(fields, 'borderThickness');
          const borderOpacity = settingsBase
            ? resolveFeaturedCollectionHeaderBorderSliderField(
                fields,
                settingsBase,
                'borderOpacity',
                'Opacity',
                '%',
                0,
                100
              )
            : pickFeaturedCollectionHeaderField(fields, 'borderOpacity');
          const borderColorField = settingsBase
            ? resolveFeaturedCollectionHeaderColorField(fields, settingsBase, 'borderColor', 'Color')
            : pickFeaturedCollectionHeaderField(fields, 'borderColor');
          const cornerRadius = groupFields?.find((f) => f.path.endsWith('cornerRadius'));
          if (!borderStyle && !cornerRadius) return null;

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {borderStyle ? (
                  <SegmentedFieldRow
                    field={{ ...borderStyle, label: 'Style' }}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && borderThickness ? (
                  <SliderFieldRow field={borderThickness} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {solidBorders && borderOpacity ? (
                  <SliderFieldRow field={borderOpacity} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {solidBorders && borderColorField ? (
                  <ThemeDefaultColorField
                    label="Color"
                    path={borderColorField.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={1}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          if (!groupFields?.length) return null;
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product — Header → Title: layout, typography, appearance, and padding. */
function FeaturedProductHeaderTitleGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductHeaderTitlePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays title from parent product.</p>
      {FEATURED_PRODUCT_HEADER_TITLE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          const width = groupFields.find((f) => f.path.endsWith('.width'));
          const maxWidth = groupFields.find((f) => f.path.endsWith('.maxWidth'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {width ? (
                  <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {maxWidth ? (
                  <InlineSelectFieldRow field={maxWidth} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('.typographyPreset'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {preset ? (
                  <div>
                    <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
                    <p className="pb-1 text-[12px] text-gray-500">
                      Edit presets in{' '}
                      <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                        theme settings
                      </a>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('.textColor'));
          const background = groupFields.find((f) => f.path.endsWith('.backgroundEnabled'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {textColor ? (
                  <ThemeDefaultColorField
                    label="Text color"
                    path={textColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {background ? (
                  <ToggleSwitchFieldRow
                    field={background}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product — Header → Price: general, typography, appearance, and padding. */
function FeaturedProductHeaderPriceGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductHeaderPricePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays price from parent product.</p>
      {FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              <p className="mb-2 text-[12px] text-gray-500">
                Edit price formatting in{' '}
                <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                  theme settings
                </a>
              </p>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <ToggleSwitchFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('.typographyPreset'));
          const width = groupFields.find((f) => f.path.endsWith('.width'));
          const alignment = groupFields.find((f) => f.path.endsWith('.alignment'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {preset ? (
                  <div>
                    <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
                    <p className="pb-1 text-[12px] text-gray-500">
                      Edit presets in{' '}
                      <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                        theme settings
                      </a>
                    </p>
                  </div>
                ) : null}
                {width ? (
                  <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {alignment ? (
                  <HeadingAlignmentFieldRow
                    field={alignment}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('.textColor'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={0}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product card block — vertical gap, background, borders, and padding. */
function ProductCardGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductCardPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <FeaturedProductConditionalVisibilityNote />
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays product from parent section.</p>
      {PRODUCT_CARD_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const background = groupFields.find((f) => f.path.endsWith('backgroundColor'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {background ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={background.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const style = groupFields.find((f) => f.path.endsWith('borderStyle'));
          const radius = groupFields.find((f) => f.path.endsWith('cornerRadius'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {style ? (
                  <SegmentedFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {radius ? (
                  <SliderFieldRow field={radius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product card — Media block: aspect ratio, borders, and padding controls. */
function ProductCardMediaGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductCardMediaPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays media from parent product.</p>
      {PRODUCT_CARD_MEDIA_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const aspect = groupFields.find((f) => f.path.endsWith('mediaAspectRatio'));
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {aspect ? (
                  <div>
                    <InlineSelectFieldRow field={aspect} values={values} onFieldChange={onFieldChange} />
                    {aspect.description ? (
                      <p className="pb-1 text-[12px] text-gray-500">{aspect.description}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const style = groupFields.find((f) => f.path.endsWith('mediaBorderStyle'));
          const radius = groupFields.find((f) => f.path.endsWith('mediaCornerRadius'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {style ? (
                  <SegmentedFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {radius ? (
                  <SliderFieldRow field={radius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product card — Product title block: layout, typography, color, background, padding. */
function ProductCardTitleGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductCardTitlePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays title from parent product.</p>
      {PRODUCT_CARD_TITLE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          const width = groupFields.find((f) => f.path.endsWith('productTitleWidth'));
          const maxWidth = groupFields.find((f) => f.path.endsWith('productTitleMaxWidth'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {width ? (
                  <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {maxWidth ? (
                  <InlineSelectFieldRow field={maxWidth} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('productTitleTypographyPreset'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {preset ? (
                  <div>
                    <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
                    <p className="pb-1 text-[12px] text-gray-500">
                      Edit presets in{' '}
                      <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                        theme settings
                      </a>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const color = groupFields.find((f) => f.path.endsWith('productTitleColor'));
          const background = groupFields.find((f) => f.path.endsWith('productTitleBackgroundEnabled'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {color ? (
                  <ThemeDefaultColorField
                    label="Text color"
                    path={color.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    fallbackColor="#111827"
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {background ? (
                  <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product card — Price block: sale/installments/tax toggles, typography, color, padding. */
function ProductCardPriceGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductCardPricePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {PRODUCT_CARD_PRICE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              <p className="mb-2 text-[13px] text-gray-600">Displays price from parent product.</p>
              <p className="mb-2 text-[12px] text-gray-500">
                Edit price formatting in{' '}
                <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                  theme settings
                </a>
              </p>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <ToggleSwitchFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('priceTypographyPreset'));
          const width = groupFields.find((f) => f.path.endsWith('priceWidth'));
          const alignment = groupFields.find((f) => f.path.endsWith('priceAlignment'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {preset ? (
                  <div>
                    <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
                    <p className="pb-1 text-[12px] text-gray-500">
                      Edit presets in{' '}
                      <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                        theme settings
                      </a>
                    </p>
                  </div>
                ) : null}
                {width ? (
                  <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {alignment ? (
                  <HeadingAlignmentFieldRow
                    field={alignment}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const color = groupFields.find((f) => f.path.endsWith('priceColor'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {color ? (
                  <ThemeDefaultColorField
                    label="Text color"
                    path={color.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    fallbackColor="#111827"
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product — Product media block: media, carousel, and padding controls. */
function FeaturedProductMediaGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductMediaPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FEATURED_PRODUCT_MEDIA_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {groupFields.map((field) => {
                if (field.widget === 'segmented') {
                  return (
                    <SegmentedFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'slider') {
                  return (
                    <SliderFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.type === 'boolean') {
                  return (
                    <ToggleSwitchFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                return (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                );
              })}
            </div>
          );
        }

        if (label === 'Carousel') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Featured product: Product → Layout → Padding → Theme Settings → Custom CSS. */
function FeaturedProductGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductPanelFields(fields), [fields]);

  const renderLayoutField = (field: EditorFieldDef) => {
    const key = field.path.split('.').pop() ?? '';
    if (field.widget === 'segmented') {
      return (
        <SegmentedFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
      );
    }
    if (field.widget === 'slider') {
      return (
        <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
      );
    }
    if (field.type === 'boolean') {
      return (
        <ToggleSwitchFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
      );
    }
    if (key === 'backgroundColor' || field.widget === 'color') {
      return (
        <ThemeDefaultColorField
          key={field.path}
          label="Background color"
          path={field.path}
          values={values}
          colorPalette={colorPalette}
          defaultPaletteIndex={0}
          onFieldChange={onFieldChange}
        />
      );
    }
    return (
      <InlineSelectFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
    );
  };

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FEATURED_PRODUCT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Theme Settings') return null;

        if (label === 'Product') {
          const productField = (groupFields ?? []).find((f) => f.path.endsWith('.productId'));
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {productField ? (
                <ProductPickerFieldRow field={productField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </div>
          );
        }

        if (label === 'Layout') {
          const layoutFields = groupFields ?? [];
          const byKey = (key: string) => layoutFields.find((f) => f.path.endsWith(key));
          const ordered = FEATURED_PRODUCT_LAYOUT_FIELD_ORDER.map((key) => byKey(key)).filter(
            (field): field is EditorFieldDef => Boolean(field)
          );
          const extras = layoutFields.filter(
            (f) => !FEATURED_PRODUCT_LAYOUT_FIELD_ORDER.includes(
              (f.path.split('.').pop() ?? '') as (typeof FEATURED_PRODUCT_LAYOUT_FIELD_ORDER)[number]
            )
          );

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {[...ordered, ...extras].map((field) => renderLayoutField(field))}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme Settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {(groupFields ?? []).map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product hotspots: General → Section layout → Colors → Popover → Padding → Theme Settings → Custom CSS. */
function ProductHotspotsGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const panelFields = useMemo(() => augmentProductHotspotsPanelFields(fields), [fields]);
  const grouped = useMemo(() => groupProductHotspotsPanelFields(panelFields), [panelFields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Theme Settings') return null;

        if (label === 'General') {
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {groupFields.map((field) =>
                field.widget === 'image' ? (
                  <ImagePickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <ToggleSwitchFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Section layout') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) =>
                  field.widget === 'segmented' ? (
                    <SegmentedFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  ) : (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  )
                )}
              </div>
            </div>
          );
        }

        if (label === 'Colors') {
          const hotspotColor = groupFields.find((f) => f.path.endsWith('.hotspotColor'));
          const innerColor = groupFields.find((f) => f.path.endsWith('.innerColor'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('.backgroundColor'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {hotspotColor ? (
                  <ColorPickerFieldRow
                    field={hotspotColor}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {innerColor ? (
                  <ColorPickerFieldRow
                    field={innerColor}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {backgroundColor ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={backgroundColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Popover') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  const key = field.path.split('.').pop() ?? '';
                  if (key === 'titleTypography' || key === 'priceTypography') {
                    return (
                      <div key={field.path} className="space-y-1">
                        <InlineSelectFieldRow
                          field={field}
                          values={values}
                          onFieldChange={onFieldChange}
                        />
                        {field.description ? (
                          <p className="text-[12px] text-gray-500">
                            Edit presets in{' '}
                            <button type="button" className="text-[#005bd3] underline">
                              theme settings
                            </button>
                          </p>
                        ) : null}
                      </div>
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme Settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product hotspots → Heading field: Text → Layout → Typography → Appearance → Padding. */
function ProductHotspotsHeadingSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(
    () =>
      groupProductHotspotsHeadingPanelFields(
        filterProductHotspotsHeadingFieldsForPreset(fields, values)
      ),
    [fields, values]
  );

  return (
    <div>
      {PRODUCT_HOTSPOTS_HEADING_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const textField =
            groupFields.find((f) => f.path.endsWith('.heading')) ?? groupFields[0];
          return (
            <ShopifySettingsSection
              key={label}
              title="Text"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              <RichTextFieldRow
                field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                values={values}
                onFieldChange={onFieldChange}
                hideLabel
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('headingWidth'));
          const maxWidthField = groupFields.find((f) => f.path.endsWith('headingMaxWidth'));
          return (
            <ShopifySettingsSection key={label} title="Layout">
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {maxWidthField ? (
                <InlineSelectFieldRow field={maxWidthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Typography') {
          const presetField = groupFields.find((f) => f.path.endsWith('headingTypographyPreset'));
          const rest = groupFields.filter((f) => !f.path.endsWith('headingTypographyPreset'));
          return (
            <ShopifySettingsSection key={label} title="Typography">
              {presetField ? (
                <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {rest.map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('headingColor'));
          const background = groupFields.find((f) => f.path.endsWith('headingBackgroundEnabled'));
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {background ? (
                <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = [
            'headingPaddingTop',
            'headingPaddingBottom',
            'headingPaddingLeft',
            'headingPaddingRight',
          ];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Recommended products → Header block: Text → Layout → Typography → Appearance → Padding. */
function RecommendedProductsHeaderSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(
    () =>
      groupRecommendedProductsHeaderPanelFields(
        filterRecommendedProductsHeaderFieldsForPreset(fields, values)
      ),
    [fields, values]
  );

  return (
    <div>
      {RECOMMENDED_PRODUCTS_HEADER_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const textField =
            groupFields.find((f) => f.path.endsWith('.heading')) ?? groupFields[0];
          return (
            <ShopifySettingsSection
              key={label}
              title="Text"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              <RichTextFieldRow
                field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                values={values}
                onFieldChange={onFieldChange}
                hideLabel
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('headingWidth'));
          const maxWidthField = groupFields.find((f) => f.path.endsWith('headingMaxWidth'));
          return (
            <ShopifySettingsSection key={label} title="Layout">
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {maxWidthField ? (
                <InlineSelectFieldRow field={maxWidthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Typography') {
          const presetField = groupFields.find((f) => f.path.endsWith('headingTypographyPreset'));
          const rest = groupFields.filter((f) => !f.path.endsWith('headingTypographyPreset'));
          return (
            <ShopifySettingsSection key={label} title="Typography">
              {presetField ? (
                <div>
                  <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
                  <p className="pb-1 text-[12px] text-gray-500">
                    Edit presets in{' '}
                    <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                      theme settings
                    </a>
                  </p>
                </div>
              ) : null}
              {rest.map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('headingColor'));
          const background = groupFields.find((f) => f.path.endsWith('headingBackgroundEnabled'));
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {background ? (
                <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = [
            'headingPaddingTop',
            'headingPaddingBottom',
            'headingPaddingLeft',
            'headingPaddingRight',
          ];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product hotspots → Hotspot block: Product → Horizontal/Vertical position. */
function ProductHotspotsHotspotBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const productField = fields.find((f) => f.path.endsWith('.productId'));
  const positionX = fields.find((f) => f.path.endsWith('.positionX'));
  const positionY = fields.find((f) => f.path.endsWith('.positionY'));

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {productField ? (
        <div className="px-1 py-3">
          <ProductPickerFieldRow field={productField} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : null}
      {positionX ? (
        <div className="px-1 py-3">
          <SliderFieldRow field={positionX} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : null}
      {positionY ? (
        <div className="px-1 py-3">
          <SliderFieldRow field={positionY} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : null}
    </div>
  );
}

/** Collection link Title field: typography only (title text comes from the collection). */
function CollectionLinkTitleSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = prepareCollectionLinkTitleSettingsNode({
    id: '',
    label: 'Title',
    kind: 'field',
    fields,
  });

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays title from parent collection</p>
      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
        <div className="space-y-1">
          {(prepared.fields ?? []).map((field) =>
            field.widget === 'segmented' || field.path.endsWith('.titleCase') ? (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

/** Collection link Image field: layout only (image comes from the collection). */
function CollectionLinkImageSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = prepareCollectionLinkImageSettingsNode({
    id: '',
    label: 'Image',
    kind: 'field',
    fields,
  });

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays image from parent collection</p>
      <div className="space-y-1 px-1 py-3">
        {(prepared.fields ?? []).map((field) =>
          field.widget === 'slider' ? (
            <SliderFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          ) : (
            <InlineSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          )
        )}
      </div>
    </div>
  );
}

/** Collection link block: show count toggle (collection comes from parent section). */
function CollectionLinkBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = prepareCollectionLinkBlockSettingsNode({ id: '', label: 'Collection', kind: 'block', fields });

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <FeaturedProductConditionalVisibilityNote />
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays collection from parent section</p>
      <div className="space-y-1 px-1 py-3">
        {(prepared.fields ?? []).map((field) =>
          field.widget === 'toggle' || field.type === 'boolean' ? (
            <ToggleSwitchFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          ) : (
            <DefaultFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          )
        )}
      </div>
    </div>
  );
}

/** Collection list — Collection card → Image block (aspect ratio, overlay, borders). */
function CollectionListCardImageSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupCollectionListCardImagePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays image from parent collection</p>
      {COLLECTION_LIST_CARD_IMAGE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const aspect = groupFields.find((f) => f.path.endsWith('.imageRatio'));
          const overlay = groupFields.find((f) => f.path.endsWith('.mediaOverlay'));
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {aspect ? (
                  <div>
                    <InlineSelectFieldRow
                      field={aspect}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                    {aspect.description ? (
                      <p className="pb-1 text-[12px] text-gray-500">{aspect.description}</p>
                    ) : null}
                  </div>
                ) : null}
                {overlay ? (
                  <ToggleSwitchFieldRow
                    field={overlay}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const style = groupFields.find((f) => f.path.endsWith('.borderStyle'));
          const radius = groupFields.find((f) => f.path.endsWith('.cornerRadius'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {style ? (
                  <SegmentedFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {radius ? (
                  <SliderFieldRow field={radius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection list — Collection card block (text placement + appearance). */
function CollectionListCardGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const grouped = useMemo(() => groupCollectionListCardPanelFields(fields), [fields]);
  const placementField = fields.find((f) => f.path.endsWith('.placement'));
  const placement = placementField
    ? fieldValueAsString(values, placementField) || 'on_image'
    : 'on_image';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays collection from parent section</p>
      {COLLECTION_LIST_CARD_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.path.endsWith('.verticalAlignment') && placement !== 'on_image') {
                    return null;
                  }
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const backgroundColor = groupFields.find((f) => f.path.endsWith('.backgroundColor'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {backgroundColor ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={backgroundColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Borders') {
          const style = groupFields.find((f) => f.path.endsWith('.borderStyle'));
          const radius = groupFields.find((f) => f.path.endsWith('.cornerRadius'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {style ? (
                  <SegmentedFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {radius ? (
                  <SliderFieldRow field={radius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection list — Collection card → Collection title block. */
function CollectionListCardTitleSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const grouped = useMemo(() => groupCollectionListCardTitlePanelFields(fields), [fields]);
  const appearanceFields = grouped.get('Appearance') ?? [];
  const background = appearanceFields.find((f) => f.path.endsWith('.backgroundEnabled'));
  const backgroundColor = appearanceFields.find((f) => f.path.endsWith('.backgroundColor'));
  const textColor = appearanceFields.find((f) => f.path.endsWith('.textColor'));
  const cornerRadius = appearanceFields.find((f) => f.path.endsWith('.cornerRadius'));
  const textColorValues = textColor
    ? {
        ...values,
        [textColor.path]: collectionTitleColorEditorValue(fieldValueAsString(values, textColor)),
      }
    : values;

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays title from parent collection</p>
      {COLLECTION_LIST_CARD_TITLE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <TextBlockLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('.typographyPreset'));
          const presetField = preset
            ? { ...preset, options: [...TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS] }
            : null;
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              {presetField ? (
                <div>
                  <InlineSelectFieldRow
                    field={presetField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                  <p className="pb-1 text-[12px] text-gray-500">
                    Edit presets in{' '}
                    <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                      theme settings
                    </a>
                  </p>
                </div>
              ) : null}
            </div>
          );
        }

        if (label === 'Appearance') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {background ? (
                  <ToggleSwitchFieldRow
                    field={background}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {backgroundColor ? (
                  <ThemeHexColorField
                    label={backgroundColor.label}
                    path={backgroundColor.path}
                    values={values}
                    defaultColor="#FFFFFF"
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {textColor ? (
                  <ThemePaletteColorField
                    label="Text color"
                    path={textColor.path}
                    values={textColorValues}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={1}
                    fallbackColor="#111827"
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow
                    field={cornerRadius}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <TextBlockPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection tile block: title, collection, width. */
function CollectionTileBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = prepareCollectionTileBlockSettingsNode({ id: '', label: 'Collection', kind: 'block', fields });

  return (
    <div className="space-y-2 px-1 py-3">
      {(prepared.fields ?? []).map((field) => {
        if (field.path.endsWith('.collectionHandle') || field.widget === 'collection') {
          return (
            <CollectionSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (field.widget === 'segmented') {
          return (
            <SegmentedFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        return (
          <DefaultFieldRow
            key={field.path}
            field={field}
            values={values}
            onFieldChange={onFieldChange}
          />
        );
      })}
    </div>
  );
}

/** Collection list: Type drives which cards-layout fields are shown (Bento / Grid / Carousel / Editorial). */
function CollectionListGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  onCollectionLinksApply,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
  colorPalette: string[];
}) {
  const panelFields = useMemo(() => augmentCollectionListPanelFields(fields), [fields]);
  const cardsLayoutType = collectionListCardsLayoutTypeFromValues(panelFields, values);
  const visibleFields = useMemo(
    () => filterCollectionListPanelFieldsForLayout(panelFields, cardsLayoutType),
    [panelFields, cardsLayoutType]
  );
  const grouped = useMemo(() => groupCollectionListPanelFields(visibleFields), [visibleFields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {COLLECTION_LIST_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Theme settings') return null;
        if (label === 'Carousel navigation' && cardsLayoutType !== 'carousel') return null;

        if (label === 'Collections') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.widget === 'collections' ? (
                  <CollectionsPickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onCollectionsApply={onCollectionLinksApply}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Cards layout' || label === 'Carousel navigation') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.type === 'boolean') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Section layout') {
          return (
            <FeaturedCollectionSectionLayoutGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
              colorPalette={colorPalette}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection list carousel: Collections → Cards layout → Carousel navigation → Section layout → Padding → Custom CSS. */
function CollectionListCarouselGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  onCollectionLinksApply,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
}) {
  const grouped = useMemo(() => groupCollectionListCarouselPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {COLLECTION_LIST_CAROUSEL_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Collections') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.widget === 'collections' ? (
                  <CollectionsPickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onCollectionsApply={onCollectionLinksApply}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Cards layout' || label === 'Carousel navigation') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Section layout') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color-scheme') {
                    return (
                      <ColorSchemeFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection list editorial: Collections → Cards layout → Section layout → Padding → Custom CSS. */
function CollectionListEditorialGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  onCollectionLinksApply,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
}) {
  const grouped = useMemo(() => groupCollectionListEditorialPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {COLLECTION_LIST_EDITORIAL_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Collections') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.widget === 'collections' ? (
                  <CollectionsPickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onCollectionsApply={onCollectionLinksApply}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Cards layout' || label === 'Section layout') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.type === 'boolean') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color-scheme') {
                    return (
                      <ColorSchemeFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Collection list grid: Collections → Cards layout → Section layout → Padding → Custom CSS. */
function CollectionListGridGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  onCollectionLinksApply,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
}) {
  const grouped = useMemo(() => groupCollectionListGridPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {COLLECTION_LIST_GRID_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Collections') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.widget === 'collections' ? (
                  <CollectionsPickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onCollectionsApply={onCollectionLinksApply}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Cards layout' || label === 'Section layout') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.type === 'boolean') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color-scheme') {
                    return (
                      <ColorSchemeFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Layered slideshow: General → Padding → Custom CSS. */
function LayeredSlideshowGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupLayeredSlideshowPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {LAYERED_SLIDESHOW_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {groupFields.map((field) => {
                if (field.widget === 'segmented') {
                  return (
                    <SegmentedFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'select-inline') {
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'slider') {
                  return (
                    <SliderFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'toggle') {
                  return (
                    <ToggleSwitchFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'color') {
                  return (
                    <ThemeDefaultColorField
                      key={field.path}
                      label={field.label}
                      path={field.path}
                      values={values}
                      colorPalette={colorPalette}
                      defaultPaletteIndex={0}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'color-scheme') {
                  return (
                    <ColorSchemeFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                return (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                );
              })}
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Slideshow inset: General → Navigation → Padding → Custom CSS. */
function SlideshowInsetGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupSlideshowInsetPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {SLIDESHOW_INSET_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General' || label === 'Navigation') {
          return (
            <div key={label} className="px-1 py-3">
              {label === 'Navigation' ? (
                <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              ) : null}
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'select-inline') {
                    return (
                      <InlineSelectFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'toggle') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color') {
                    return (
                      <ThemeDefaultColorField
                        key={field.path}
                        label={field.label}
                        path={field.path}
                        values={values}
                        colorPalette={colorPalette}
                        defaultPaletteIndex={0}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color-scheme') {
                    return (
                      <ColorSchemeFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <DefaultFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Slideshow full frame: General → Navigation → Padding → Custom CSS. */
function SlideshowFullFrameGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupSlideshowFullFramePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {SLIDESHOW_FULL_FRAME_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General' || label === 'Navigation') {
          return (
            <div key={label} className="px-1 py-3">
              {label === 'Navigation' ? (
                <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              ) : null}
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'select-inline') {
                    return (
                      <InlineSelectFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'toggle') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color') {
                    return (
                      <ThemeDefaultColorField
                        key={field.path}
                        label={field.label}
                        path={field.path}
                        values={values}
                        colorPalette={colorPalette}
                        defaultPaletteIndex={0}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color-scheme') {
                    return (
                      <ColorSchemeFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <DefaultFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Slideshow slide block: heading, text, button, image. */
function SlideshowSlideBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = prepareSlideshowSlideBlockSettingsNode({ id: '', label: 'Slide', kind: 'block', fields });

  return (
    <div className="space-y-2 px-1 py-3">
      {(prepared.fields ?? []).map((field) => {
        if (field.widget === 'image') {
          return (
            <ImagePickerFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        return (
          <DefaultFieldRow
            key={field.path}
            field={field}
            values={values}
            onFieldChange={onFieldChange}
          />
        );
      })}
    </div>
  );
}

/** Slideshow: Inset — Slide block: Media → Layout → Appearance → Padding. */
function SlideshowInsetSlideBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const pick = (key: string) => fields.find((f) => (f.path.split('.').pop() ?? '') === key);
  const mediaType = pick('mediaType');
  const imageUrl = pick('imageUrl');
  const videoUrl = pick('videoUrl');
  const direction = pick('direction');
  const alignment = pick('alignment');
  const position = pick('position');
  const gap = pick('gap');
  const backgroundColor = pick('backgroundColor');
  const mediaOverlay = pick('mediaOverlay');
  const paddingTop = pick('paddingTop');
  const paddingBottom = pick('paddingBottom');
  const paddingLeft = pick('paddingLeft');
  const paddingRight = pick('paddingRight');
  const paddingFields = [paddingTop, paddingBottom, paddingLeft, paddingRight].filter(
    (f): f is EditorFieldDef => Boolean(f)
  );
  const mediaMode = mediaType ? fieldValueAsString(values, mediaType) || 'image' : 'image';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {mediaType ? (
          <SegmentedFieldRow field={mediaType} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {mediaMode === 'video'
          ? videoUrl
            ? <SettingsFieldRow field={videoUrl} values={values} onFieldChange={onFieldChange} />
            : null
          : imageUrl
            ? <ImagePickerFieldRow field={imageUrl} values={values} onFieldChange={onFieldChange} />
            : null}
      </div>

      {direction || alignment || position || gap ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">
            {direction?.group || alignment?.group || position?.group || gap?.group || 'Layout'}
          </h3>
          <div className="space-y-1">
            {direction ? (
              <SegmentedFieldRow field={direction} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {alignment ? (
              <SegmentedFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {position ? (
              <InlineSelectFieldRow field={position} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {gap ? (
              <SliderFieldRow field={gap} values={values} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        </div>
      ) : null}

      {backgroundColor || mediaOverlay ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
          <div className="space-y-1">
            {backgroundColor ? (
              <ThemeDefaultColorField
                label={backgroundColor.label}
                path={backgroundColor.path}
                values={values}
                colorPalette={colorPalette}
                defaultPaletteIndex={0}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {mediaOverlay ? (
              <ToggleSwitchFieldRow field={mediaOverlay} values={values} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        </div>
      ) : null}

      {paddingFields.length ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
          <div className="space-y-1">
            {paddingFields.map((field) => (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Collection links (Spotlight + Text): Collections → Layout → Padding → Custom CSS. */
function CollectionLinksSpotlightGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  onCollectionLinksApply,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
}) {
  const grouped = useMemo(() => groupCollectionLinksSpotlightPanelFields(fields), [fields]);
  const layoutModeField = fields.find((f) => f.path.endsWith('.layoutMode'));
  const isTextCatalogSection = isCollectionLinksTextSectionFromFields(fields);
  const layoutMode = layoutModeField
    ? fieldValueAsString(values, layoutModeField) || (isTextCatalogSection ? 'text' : 'spotlight')
    : isTextCatalogSection
      ? 'text'
      : 'spotlight';
  const isTextLayout = layoutMode === 'text';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {COLLECTION_LINKS_SPOTLIGHT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Collections') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.widget === 'collections' ? (
                  <CollectionsPickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onCollectionsApply={onCollectionLinksApply}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Layout') {
          const visibleFields = isTextLayout
            ? groupFields.filter((f) => !f.path.endsWith('imagePosition'))
            : groupFields;
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {visibleFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'color-scheme') {
                    const schemeValue = fieldValueAsString(values, field) || 'scheme-1';
                    const isDefaultScheme = schemeValue === 'scheme-1' || schemeValue === 'default';
                    return (
                      <ColorSchemeFieldRow
                        key={field.path}
                        field={field}
                        values={
                          isDefaultScheme
                            ? { ...values, [field.path]: 'transparent' }
                            : values
                        }
                        onFieldChange={(path, type, value) => {
                          const next =
                            value === 'transparent' || value === 'default' ? 'scheme-1' : value;
                          onFieldChange(path, type, next);
                        }}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Recommended products: Product → Cards layout → Section layout → Padding → Theme Settings → Custom CSS. */
function RecommendedProductsGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const panelFields = useMemo(() => augmentRecommendedProductsPanelFields(fields), [fields]);
  const grouped = useMemo(() => groupRecommendedProductsPanelFields(panelFields), [panelFields]);
  const typeField = panelFields.find((f) => f.path.endsWith('.recommendationType'));
  const recommendationType = typeField ? fieldValueAsString(values, typeField) : 'related';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {RECOMMENDED_PRODUCTS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Theme Settings') return null;

        if (label === 'Product') {
          return (
            <div key={label} className="space-y-2 px-1 py-3">
              {groupFields.map((field) =>
                field.path.endsWith('.productId') ? (
                  <ProductPickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                    variant="closest-source"
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
              {recommendationType === 'complementary' ? (
                <p className="text-[12px] leading-snug text-gray-500">
                  Complementary products must be set up using the Search &amp; Discovery app.{' '}
                  <a href="#" className="text-[#005bd3] underline" onClick={(e) => e.preventDefault()}>
                    Learn more
                  </a>
                </p>
              ) : null}
            </div>
          );
        }

        if (label === 'Cards layout') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.type === 'boolean') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Section layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('.sectionWidth'));
          const gapField = groupFields.find((f) => f.path.endsWith('.layoutGap'));
          const backgroundField = groupFields.find((f) => f.path.endsWith('.backgroundColor'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {widthField ? (
                  <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {gapField ? (
                  <SliderFieldRow field={gapField} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {backgroundField ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={backgroundField.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Theme Settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product highlight — Product media: type, image, link, and image position. */
function ProductHighlightMediaGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const pick = (key: string) => fields.find((f) => f.path.endsWith(`.${key}`));
  const mediaType = pick('mediaType');
  const imageUrl = pick('imageUrl');
  const videoUrl = pick('videoUrl');
  const link = pick('link');
  const imagePosition = pick('imagePosition');
  const mediaMode = mediaType ? fieldValueAsString(values, mediaType) || 'image' : 'image';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {mediaType ? (
          <SegmentedFieldRow field={mediaType} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {mediaMode === 'video'
          ? videoUrl
            ? <DefaultFieldRow field={videoUrl} values={values} onFieldChange={onFieldChange} />
            : null
          : imageUrl
            ? <ImagePickerFieldRow field={imageUrl} values={values} onFieldChange={onFieldChange} />
            : null}
        {link ? <LinkFieldRow field={link} values={values} onFieldChange={onFieldChange} /> : null}
        {imagePosition ? (
          <SegmentedFieldRow field={imagePosition} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

/** Product highlight — Product group: informational panel only. */
function ProductHighlightProductGroupedSettingsPanel() {
  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays product from parent section.</p>
    </div>
  );
}

/** Product highlight — Product → Title: layout, typography, appearance, and padding. */
function ProductHighlightProductTitleGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductHighlightProductTitlePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays title from parent product.</p>
      {PRODUCT_HIGHLIGHT_TITLE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          const width = groupFields.find((f) => f.path.endsWith('.width'));
          const maxWidth = groupFields.find((f) => f.path.endsWith('.maxWidth'));
          const alignment = groupFields.find((f) => f.path.endsWith('.alignment'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {width ? (
                  <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {maxWidth ? (
                  <InlineSelectFieldRow field={maxWidth} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {alignment ? (
                  <HeadingAlignmentFieldRow
                    field={alignment}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('.typographyPreset'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {preset ? (
                  <div>
                    <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
                    <p className="pb-1 text-[12px] text-gray-500">
                      Edit presets in{' '}
                      <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                        theme settings
                      </a>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('.textColor'));
          const background = groupFields.find((f) => f.path.endsWith('.backgroundEnabled'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {textColor ? (
                  <ThemeDefaultColorField
                    label="Text color"
                    path={textColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {background ? (
                  <ToggleSwitchFieldRow
                    field={background}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product highlight — Product → Price: general and typography. */
function ProductHighlightProductPriceGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductHighlightProductPricePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays price from parent product.</p>
      {PRODUCT_HIGHLIGHT_PRICE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              <p className="mb-2 text-[12px] text-gray-500">
                Edit price formatting in{' '}
                <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                  theme settings
                </a>
              </p>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <ToggleSwitchFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (label === 'Typography') {
          const preset = groupFields.find((f) => f.path.endsWith('.typographyPreset'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {preset ? (
                  <div>
                    <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
                    <p className="pb-1 text-[12px] text-gray-500">
                      Edit presets in{' '}
                      <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                        theme settings
                      </a>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Product highlight — Product → Image: aspect ratio and constrain height. */
function ProductHighlightProductImageGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductHighlightProductImagePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays media from parent product.</p>
      {PRODUCT_HIGHLIGHT_IMAGE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        return (
          <div key={label} className="space-y-1 px-1 py-3">
            {groupFields.map((field) => (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** Product highlight — Product → Swatches: alignment controls. */
function ProductHighlightProductSwatchesGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductHighlightProductSwatchesPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <FeaturedProductConditionalVisibilityNote />
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays swatches from parent product.</p>
      {PRODUCT_HIGHLIGHT_SWATCHES_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        return (
          <div key={label} className="space-y-1 px-1 py-3">
            {groupFields.map((field) =>
              field.widget === 'segmented' ? (
                <SegmentedFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : (
                <InlineSelectFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Product highlight: Product → Media position → Background color → Padding → Theme Settings → Custom CSS. */
function ProductHighlightGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductHighlightPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {PRODUCT_HIGHLIGHT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Theme Settings') return null;

        if (label === 'General') {
          const productField = groupFields?.find((f) => f.path.endsWith('.productId'));
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {productField ? (
                <ProductPickerFieldRow field={productField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </div>
          );
        }

        if (label === 'Layout') {
          const mediaPosition = groupFields?.find((f) => f.path.endsWith('.mediaPosition'));
          const backgroundColor = groupFields?.find((f) => f.path.endsWith('.backgroundColor'));
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {mediaPosition ? (
                <SegmentedFieldRow
                  field={mediaPosition}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {backgroundColor ? (
                <ThemeDefaultColorField
                  label="Background color"
                  path={backgroundColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={0}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme Settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {(groupFields ?? []).map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Editorial: Media position → width → height → section width → background → padding → custom CSS. */
function EditorialGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupEditorialPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {EDITORIAL_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const mediaPosition = groupFields.find((f) => f.path.endsWith('.mediaPosition'));
          const mediaWidth = groupFields.find((f) => f.path.endsWith('.mediaWidth'));
          const mediaHeight = groupFields.find((f) => f.path.endsWith('.mediaHeight'));
          const sectionWidth = groupFields.find((f) => f.path.endsWith('.sectionWidth'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('.backgroundColor'));
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {mediaPosition ? (
                <SegmentedFieldRow field={mediaPosition} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mediaWidth ? (
                <InlineSelectFieldRow field={mediaWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mediaHeight ? (
                <InlineSelectFieldRow field={mediaHeight} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {sectionWidth ? (
                <SegmentedFieldRow field={sectionWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {backgroundColor ? (
                <ThemeDefaultColorField
                  label={backgroundColor.label}
                  path={backgroundColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={0}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Editorial — Media block. */
function EditorialMediaBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const mediaType = pickEditorialBlockField(fields, 'mediaType');
  const imageUrl = pickEditorialBlockField(fields, 'imageUrl');
  const mediaLinkUrl = pickEditorialBlockField(fields, 'mediaLinkUrl');
  const imagePosition = pickEditorialBlockField(fields, 'imagePosition');
  const mediaMode = mediaType ? fieldValueAsString(values, mediaType) || 'image' : 'image';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {mediaType ? (
          <SegmentedFieldRow field={mediaType} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {mediaMode === 'image' && imageUrl ? (
          <ImagePickerFieldRow field={imageUrl} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {mediaLinkUrl ? (
          <LinkFieldRow field={mediaLinkUrl} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {imagePosition ? (
          <SegmentedFieldRow field={imagePosition} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

/** Editorial — Content group block. */
function EditorialContentGroupGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const alignment = pickEditorialContentGroupField(fields, 'layoutAlignment');
  const position = pickEditorialContentGroupField(fields, 'position');
  const gap = pickEditorialContentGroupField(fields, 'layoutGap');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
        <div className="space-y-1">
          {alignment ? (
            <SegmentedFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {position ? (
            <InlineSelectFieldRow field={position} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {gap ? <SliderFieldRow field={gap} values={values} onFieldChange={onFieldChange} /> : null}
        </div>
      </div>
    </div>
  );
}

function StorytellingLogoSizeSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const unitField = fields.find((f) => f.path.endsWith('sizeUnit'));
  const pixelHeight = fields.find((f) => f.path.endsWith('pixelHeight'));
  const percentWidth = fields.find((f) => f.path.endsWith('percentWidth'));
  const customMobile = fields.find((f) => f.path.endsWith('customMobileSize'));
  const mobileUnit = fields.find((f) => f.path.endsWith('mobileSizeUnit'));
  const mobilePixelHeight = fields.find((f) => f.path.endsWith('mobilePixelHeight'));
  const mobilePercentWidth = fields.find((f) => f.path.endsWith('mobilePercentWidth'));

  const unit = unitField ? fieldValueAsString(values, unitField) || 'pixel' : 'pixel';
  const mobileOn = customMobile ? Boolean(values[customMobile.path]) : false;
  const mobileUnitVal = mobileUnit ? fieldValueAsString(values, mobileUnit) || 'percent' : 'percent';

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
      <div className="space-y-1">
        {unitField ? (
          <SegmentedFieldRow field={unitField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {unit === 'pixel' && pixelHeight ? (
          <SliderFieldRow field={pixelHeight} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {unit === 'percent' && percentWidth ? (
          <SliderFieldRow field={percentWidth} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {customMobile ? (
          <ToggleSwitchFieldRow field={customMobile} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {mobileOn ? (
          <div className="space-y-1 border-t border-[#e1e1e1] pt-2">
            <p className="text-[12px] font-medium text-gray-700">Mobile size</p>
            {mobileUnit ? (
              <SegmentedFieldRow field={mobileUnit} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {mobileUnitVal === 'pixel' && mobilePixelHeight ? (
              <SliderFieldRow field={mobilePixelHeight} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {mobileUnitVal === 'percent' && mobilePercentWidth ? (
              <SliderFieldRow field={mobilePercentWidth} values={values} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StorytellingLogoLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const width = fields.find((f) => f.path.endsWith('sectionWidth'));
  const alignment = fields.find((f) => f.path.endsWith('layoutAlignment'));
  const scheme = fields.find((f) => f.path.endsWith('colorScheme'));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {width ? (
          <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {alignment ? (
          <SegmentedFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {scheme ? (
          <ColorSchemeFieldRow field={scheme} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

/** Storytelling Logo: Font → Size → Layout → Padding → Theme settings → Custom CSS. */
function StorytellingLogoGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupStorytellingLogoPanelFields(fields), [fields]);
  const typographyFields = grouped.get('Typography') ?? [];
  const fontField = typographyFields.find((f) => f.path.endsWith('logoFont'));

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {fontField ? (
        <div className="space-y-2 px-1 py-3">
          <SelectFieldRow field={fontField} values={values} onFieldChange={onFieldChange} />
          <p className="text-[12px] text-gray-500">
            Edit logo in{' '}
            <button
              type="button"
              className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
              onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
            >
              theme settings
            </button>
          </p>
        </div>
      ) : null}

      {STORYTELLING_LOGO_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length || label === 'Typography') return null;

        if (label === 'Size') {
          return (
            <StorytellingLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Layout') {
          return (
            <StorytellingLogoLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme Settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme settings"
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Large logo Logo block: Font → Size → Padding (matches Shopify Horizon). */
function LargeLogoBlockGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupLargeLogoBlockPanelFields(fields), [fields]);
  const typographyFields = grouped.get('Typography') ?? [];
  const fontField = typographyFields.find((f) => f.path.endsWith('logoFont'));
  const colorField = typographyFields.find((f) => f.path.endsWith('logoColor'));

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {fontField || colorField ? (
        <div className="space-y-2 px-1 py-3">
          {fontField ? (
            <SelectFieldRow field={fontField} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {colorField ? (
            <ThemeDefaultColorField
              label={colorField.label}
              path={colorField.path}
              values={values}
              colorPalette={colorPalette}
              emptyLabel="Select"
              onFieldChange={onFieldChange}
            />
          ) : null}
          <p className="text-[12px] text-gray-500">
            Edit logo in{' '}
            <button
              type="button"
              className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
              onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
            >
              theme settings
            </button>
          </p>
        </div>
      ) : null}

      {LARGE_LOGO_BLOCK_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length || label === 'Typography') return null;

        if (label === 'Size') {
          return (
            <StorytellingLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <TextBlockPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

/** Video block: Source → Video → Autoplay → Loop → Size → Borders → Padding. */
function StorytellingVideoMediaBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupStorytellingVideoMediaPanelFields(fields), [fields]);
  const generalFields = grouped.get('General') ?? [];
  const sourceField = generalFields.find((f) => f.path.endsWith('videoSource'));
  const uploadedField = generalFields.find((f) => f.path.endsWith('uploadedVideoUrl'));
  const urlField = generalFields.find((f) => f.path.endsWith('videoUrl'));
  const coverField = generalFields.find((f) => f.path.endsWith('coverImageUrl'));
  const autoplayField = generalFields.find((f) => f.path.endsWith('videoAutoplay'));
  const loopField = generalFields.find((f) => f.path.endsWith('videoLoop'));
  const source = sourceField ? fieldValueAsString(values, sourceField) || 'uploaded' : 'uploaded';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {STORYTELLING_VIDEO_MEDIA_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="space-y-0.5 px-1 py-3">
              {sourceField ? (
                <InlineSelectFieldRow field={sourceField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {source === 'uploaded' && uploadedField ? (
                <ImagePickerFieldRow field={uploadedField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {source === 'url' && urlField ? (
                <ThemeEditorLinkField
                  id={fieldInputId(urlField.path)}
                  label={urlField.label}
                  value={fieldValueAsString(values, urlField)}
                  placeholder={urlField.placeholder ?? 'YouTube or Vimeo URL'}
                  onChange={(next) => onFieldChange(urlField.path, 'text', next)}
                  showOpenLink
                />
              ) : null}
              {source === 'url' && coverField ? (
                <ImagePickerFieldRow field={coverField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {autoplayField ? (
                <div>
                  <ToggleSwitchFieldRow
                    field={autoplayField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                  {autoplayField.description ? (
                    <p className="pb-1 text-[12px] text-gray-500">{autoplayField.description}</p>
                  ) : null}
                </div>
              ) : null}
              {loopField ? (
                <ToggleSwitchFieldRow field={loopField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </div>
          );
        }

        if (label === 'Borders') {
          const borderStyleField = groupFields.find((f) => f.path.endsWith('videoBorderStyle'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('videoCornerRadius'));
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {borderStyleField ? (
                  <SegmentedFieldRow
                    field={borderStyleField}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Size' || label === 'Padding') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Caption text / button blocks (section settings-backed). */
function StorytellingVideoContentBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {fields.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'caption') {
            return (
              <DefaultFieldRow
                key={field.path}
                field={{ ...field, type: 'textarea' }}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (key === 'linkUrl') {
            return (
              <ThemeEditorLinkField
                key={field.path}
                id={fieldInputId(field.path)}
                label={field.label}
                value={fieldValueAsString(values, field)}
                placeholder={field.placeholder ?? 'Paste a link or search'}
                onChange={(next) => onFieldChange(field.path, 'text', next)}
                showOpenLink
                showDynamicSource
              />
            );
          }
          return (
            <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        })}
      </div>
    </div>
  );
}

/** Storytelling Video: Layout → Size → Appearance → Borders → Padding → Custom CSS. */
function StorytellingVideoGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupStorytellingVideoPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {STORYTELLING_VIDEO_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <SplitShowcaseLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <RichTextAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <RichTextBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Column block: Heading → Description. */
function MulticolumnBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const ordered = ['heading', 'text']
    .map((key) => fields.find((f) => f.path.endsWith(`.${key}`)))
    .filter((f): f is EditorFieldDef => Boolean(f));

  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {ordered.map((field) => (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    </div>
  );
}

/** Column block: Layout → Size → Appearance → Borders → Block link → Padding. */
function MulticolumnColumnBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupMulticolumnColumnPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {MULTICOLUMN_COLUMN_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <PullQuoteLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          const width = pickMulticolumnColumnField(groupFields, 'width');
          const widthCustom = pickMulticolumnColumnField(groupFields, 'customWidth');
          const mobileWidth = pickMulticolumnColumnField(groupFields, 'mobileWidth');
          const mobileWidthCustom = pickMulticolumnColumnField(groupFields, 'mobileCustomWidth');
          const height = pickMulticolumnColumnField(groupFields, 'height');
          const heightCustom = pickMulticolumnColumnField(groupFields, 'customHeight');
          const widthMode = width ? fieldValueAsString(values, width) || 'fit' : 'fit';
          const mobileWidthMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';
          const heightMode = height ? fieldValueAsString(values, height) || 'fit' : 'fit';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
              <div className="space-y-1">
                {width ? (
                  <>
                    <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
                    {widthMode === 'custom' && widthCustom ? (
                      <SliderFieldRow field={widthCustom} values={values} onFieldChange={onFieldChange} />
                    ) : null}
                  </>
                ) : null}
                {mobileWidth ? (
                  <>
                    <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
                    {mobileWidthMode === 'custom' && mobileWidthCustom ? (
                      <SliderFieldRow
                        field={mobileWidthCustom}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    ) : null}
                  </>
                ) : null}
                {height ? (
                  <>
                    <SegmentedFieldRow field={height} values={values} onFieldChange={onFieldChange} />
                    {heightMode === 'custom' && heightCustom ? (
                      <SliderFieldRow field={heightCustom} values={values} onFieldChange={onFieldChange} />
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          return (
            <RichTextAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <RichTextBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Block link') {
          const linkUrl = pickMulticolumnColumnField(groupFields, 'link');
          const openInNewTab = pickMulticolumnColumnField(groupFields, 'linkOpenInNewTab');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Block link</h3>
              <div className="space-y-1">
                {linkUrl ? (
                  <LinkFieldRow field={linkUrl} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {openInNewTab ? (
                  <ToggleSwitchFieldRow field={openInNewTab} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          const order = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
              <div className="space-y-1">
                {ordered.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Column → Description block: Text → Layout → Typography → Appearance → Padding. */
function MulticolumnDescriptionBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(
    () => groupMulticolumnDescriptionPanelFields(filterMulticolumnDescriptionFieldsForPreset(fields, values)),
    [fields, values]
  );

  return (
    <div>
      {MULTICOLUMN_DESCRIPTION_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const textField = groupFields.find((f) => f.path.endsWith('.text')) ?? groupFields[0];
          return (
            <ShopifySettingsSection
              key={label}
              title="Text"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              <RichTextFieldRow
                field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                values={values}
                onFieldChange={onFieldChange}
                hideLabel
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('descWidth'));
          const maxWidthField = groupFields.find((f) => f.path.endsWith('descMaxWidth'));
          const alignmentField = groupFields.find((f) => f.path.endsWith('descAlignment'));
          return (
            <ShopifySettingsSection key={label} title="Layout">
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {maxWidthField ? (
                <InlineSelectFieldRow field={maxWidthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {alignmentField ? (
                <HeadingAlignmentFieldRow
                  field={alignmentField}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Typography') {
          const presetField = groupFields.find((f) => f.path.endsWith('descTypographyPreset'));
          const rest = groupFields.filter((f) => !f.path.endsWith('descTypographyPreset'));
          return (
            <ShopifySettingsSection key={label} title="Typography">
              {presetField ? (
                <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {rest.map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('descColor'));
          const background = groupFields.find((f) => f.path.endsWith('descBackgroundEnabled'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('descBackgroundColor'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('descCornerRadius'));
          const backgroundOn =
            background && (values[background.path] === true || values[background.path] === 'true');
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {background ? (
                <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {backgroundOn && backgroundColor ? (
                <ThemeHexColorField
                  label={backgroundColor.label}
                  path={backgroundColor.path}
                  values={values}
                  defaultColor="#00000026"
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {backgroundOn && cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = ['descPaddingTop', 'descPaddingBottom', 'descPaddingLeft', 'descPaddingRight'];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Marquee → Text block: Text → Layout → Typography → Appearance → Padding. */
function MarqueeTextBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(
    () => groupMarqueeTextPanelFields(filterMarqueeTextFieldsForPreset(fields, values)),
    [fields, values]
  );

  return (
    <div>
      {MARQUEE_TEXT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const textField = groupFields.find((f) => f.path.endsWith('.text')) ?? groupFields[0];
          return (
            <ShopifySettingsSection
              key={label}
              title="Text"
              headerAction={
                <button
                  type="button"
                  title="Connect dynamic source"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <CircleStackIcon className="h-4 w-4" />
                </button>
              }
            >
              <RichTextFieldRow
                field={{ ...textField, widget: 'richtext', type: 'textarea', label: 'Text' }}
                values={values}
                onFieldChange={onFieldChange}
                hideLabel
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Layout') {
          const widthField = groupFields.find((f) => f.path.endsWith('mqWidth'));
          const maxWidthField = groupFields.find((f) => f.path.endsWith('mqMaxWidth'));
          return (
            <ShopifySettingsSection key={label} title="Layout">
              {widthField ? (
                <SegmentedFieldRow field={widthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {maxWidthField ? (
                <InlineSelectFieldRow field={maxWidthField} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Typography') {
          const presetField = groupFields.find((f) => f.path.endsWith('mqTypographyPreset'));
          const rest = groupFields.filter((f) => !f.path.endsWith('mqTypographyPreset'));
          return (
            <ShopifySettingsSection key={label} title="Typography">
              {presetField ? (
                <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {rest.map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Appearance') {
          const textColor = groupFields.find((f) => f.path.endsWith('mqColor'));
          const background = groupFields.find((f) => f.path.endsWith('mqBackgroundEnabled'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('mqBackgroundColor'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('mqCornerRadius'));
          const backgroundOn =
            background && (values[background.path] === true || values[background.path] === 'true');
          return (
            <ShopifySettingsSection key={label} title="Appearance">
              {textColor ? (
                <ThemeDefaultColorField
                  label="Text color"
                  path={textColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={1}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {background ? (
                <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {backgroundOn && backgroundColor ? (
                <ThemeHexColorField
                  label={backgroundColor.label}
                  path={backgroundColor.path}
                  values={values}
                  defaultColor="#00000026"
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {backgroundOn && cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          const order = ['mqPaddingTop', 'mqPaddingBottom', 'mqPaddingLeft', 'mqPaddingRight'];
          const ordered = [...groupFields].sort(
            (a, b) =>
              order.indexOf(a.path.split('.').pop() ?? '') -
              order.indexOf(b.path.split('.').pop() ?? '')
          );
          return (
            <ShopifySettingsSection key={label} title="Padding">
              {ordered.map((field) => (
                <SliderFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Rich text block: Heading, Text, or Button (section settings-backed). */
/** Style select (Primary / Secondary) with the "edit in theme settings" hint. */
function RichTextButtonStyleRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || 'primary';
  return (
    <div className="py-1">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-[13px] text-gray-800">{field.label}</span>
        <select
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="min-w-[140px] appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-[12px] text-gray-500">
        Edit primary and secondary button styles in{' '}
        <a href="/settings/theme" className="text-[#005bd3] hover:underline">
          theme settings
        </a>
      </p>
    </div>
  );
}

/** Segmented Fit / Custom width with a percentage slider revealed when Custom. */
function RichTextButtonWidthRow({
  field,
  customField,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  customField?: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || 'fit';
  const handleChange = (value: string) => {
    onFieldChange(field.path, 'text', value);
    if (value === 'custom' && customField) {
      const cur = values[customField.path];
      if (cur === undefined || cur === '' || cur === null) {
        onFieldChange(customField.path, 'number', '100');
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
        <span className="text-[13px] text-gray-800">{field.label}</span>
        <div className="inline-flex rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
          {(field.options ?? []).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange(opt.value)}
              className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                current === opt.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {current === 'custom' && customField ? (
        <HeroButtonCustomWidthFieldRow
          field={customField}
          values={values}
          onFieldChange={onFieldChange}
        />
      ) : null}
    </>
  );
}

/**
 * Rich text / Pull quote — Button block: Label → Link → New tab → Style → Size (Shopify order).
 * Label/link keys are configurable so sections with `linkLabel`/`linkUrl` can reuse this panel.
 */
function RichTextButtonSettingsPanel({
  fields,
  values,
  onFieldChange,
  colorPalette = [],
  labelKey = 'buttonLabel',
  linkKey = 'buttonUrl',
  openTabKey = 'buttonOpenInNewTab',
  linkTextColorKey = 'buttonLinkTextColor',
  styleKey = 'buttonStyle',
  customBackgroundKey = 'buttonCustomBackground',
  customTextKey = 'buttonCustomText',
  desktopWidthKey = 'buttonDesktopWidth',
  desktopCustomWidthKey = 'buttonDesktopCustomWidth',
  mobileWidthKey = 'buttonMobileWidth',
  mobileCustomWidthKey = 'buttonMobileCustomWidth',
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette?: string[];
  labelKey?: string;
  linkKey?: string;
  openTabKey?: string;
  linkTextColorKey?: string;
  styleKey?: string;
  customBackgroundKey?: string;
  customTextKey?: string;
  desktopWidthKey?: string;
  desktopCustomWidthKey?: string;
  mobileWidthKey?: string;
  mobileCustomWidthKey?: string;
}) {
  const find = (key: string) => fields.find((f) => f.path.split('.').pop() === key);
  const label = find(labelKey);
  const link = find(linkKey);
  const openTab = find(openTabKey);
  const style = find(styleKey);
  const linkTextColor = find(linkTextColorKey);
  const customBackground = find(customBackgroundKey);
  const customText = find(customTextKey);
  const desktopWidth = find(desktopWidthKey);
  const desktopCustom = find(desktopCustomWidthKey);
  const mobileWidth = find(mobileWidthKey);
  const mobileCustom = find(mobileCustomWidthKey);
  const styleValue = style ? fieldValueAsString(values, style) || 'primary' : 'primary';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-0.5 px-1 py-3">
        {label ? (
          <HeroButtonLabelFieldRow field={label} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {link ? (
          <ThemeEditorLinkField
            id={fieldInputId(link.path)}
            label={link.label}
            value={fieldValueAsString(values, link)}
            placeholder={link.placeholder ?? 'Paste a link or search'}
            onChange={(next) => onFieldChange(link.path, 'text', next)}
            showOpenLink
            showDynamicSource
          />
        ) : null}
        {openTab ? (
          <HeroButtonToggleFieldRow field={openTab} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
      {style ? (
        <div className="px-1 py-3">
          <RichTextButtonStyleRow field={style} values={values} onFieldChange={onFieldChange} />
          {styleValue === 'link' && linkTextColor ? (
            <div className="mt-1 space-y-1">
              <ThemeDefaultColorField
                label={linkTextColor.label}
                path={linkTextColor.path}
                values={values}
                colorPalette={colorPalette}
                defaultPaletteIndex={1}
                onFieldChange={onFieldChange}
              />
            </div>
          ) : null}
          {styleValue === 'custom' ? (
            <div className="mt-1 space-y-1">
              {customBackground ? (
                <ThemeHexColorField
                  label={customBackground.label}
                  path={customBackground.path}
                  values={values}
                  defaultColor="#111827"
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {customText ? (
                <ThemeHexColorField
                  label={customText.label}
                  path={customText.path}
                  values={values}
                  defaultColor="#ffffff"
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {desktopWidth || mobileWidth ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
          <div className="space-y-1">
            {desktopWidth ? (
              <RichTextButtonWidthRow
                field={desktopWidth}
                customField={desktopCustom}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {mobileWidth ? (
              <RichTextButtonWidthRow
                field={mobileWidth}
                customField={mobileCustom}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Rich text — Heading/Text block: Content → Layout → Typography → Appearance → Padding.
 * `contentKey` is the rich-text content field ('heading' or 'text'); the remaining
 * fields are keyed by that same prefix (e.g. `${prefix}Width`).
 */
function RichTextTypographyBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  contentKey,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  contentKey: 'heading' | 'text' | 'quote' | 'body' | 'caption' | 'description' | 'subheading' | 'title';
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const find = (key: string) => fields.find((f) => f.path.split('.').pop() === key);
  const text = find(contentKey);
  const width = find(`${contentKey}Width`);
  const maxWidth = find(`${contentKey}MaxWidth`);
  const alignment = find(`${contentKey}Alignment`);
  const preset = find(`${contentKey}TypographyPreset`);
  const color = find(`${contentKey}Color`);
  const background = find(`${contentKey}BackgroundEnabled`);
  const paddingTop = find(`${contentKey}PaddingTop`);
  const paddingBottom = find(`${contentKey}PaddingBottom`);
  const paddingLeft = find(`${contentKey}PaddingLeft`);
  const paddingRight = find(`${contentKey}PaddingRight`);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {text ? (
        <div className="space-y-1 px-1 py-3">
          <RichTextFieldRow
            field={{ ...text, widget: 'richtext', type: 'textarea' }}
            values={values}
            onFieldChange={onFieldChange}
            showDynamicSource
          />
        </div>
      ) : null}
      {width || maxWidth || alignment ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
          <div className="space-y-1">
            {width ? (
              <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {maxWidth ? (
              <InlineSelectFieldRow field={maxWidth} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {alignment ? (
              <SegmentedFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        </div>
      ) : null}
      {preset ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
          <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
          {preset.description ? (
            <p className="mt-1 text-right text-[12px] text-gray-500">
              Edit presets in{' '}
              <button
                type="button"
                className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
                onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
              >
                theme settings
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
      {color || background ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
          <div className="space-y-1">
            {color ? (
              <ThemeDefaultColorField
                label={color.label}
                path={color.path}
                values={values}
                colorPalette={colorPalette}
                defaultPaletteIndex={1}
                onFieldChange={onFieldChange}
              />
            ) : null}
            {background ? (
              <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        </div>
      ) : null}
      {paddingTop || paddingBottom || paddingLeft || paddingRight ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
          <div className="space-y-1">
            {paddingTop ? (
              <SliderFieldRow field={paddingTop} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {paddingBottom ? (
              <SliderFieldRow field={paddingBottom} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {paddingLeft ? (
              <SliderFieldRow field={paddingLeft} values={values} onFieldChange={onFieldChange} />
            ) : null}
            {paddingRight ? (
              <SliderFieldRow field={paddingRight} values={values} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RichTextBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {fields.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (field.widget === 'richtext' || key === 'heading' || key === 'text') {
            return (
              <RichTextFieldRow
                key={field.path}
                field={{ ...field, widget: 'richtext', type: 'textarea' }}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (key === 'buttonUrl') {
            return (
              <ThemeEditorLinkField
                key={field.path}
                id={fieldInputId(field.path)}
                label={field.label}
                value={fieldValueAsString(values, field)}
                placeholder={field.placeholder ?? 'Paste a link or search'}
                onChange={(next) => onFieldChange(field.path, 'text', next)}
                showOpenLink
                showDynamicSource
              />
            );
          }
          return (
            <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        })}
      </div>
    </div>
  );
}

/** Multicolumn: Layout → Size → Appearance → Borders → Padding → Custom CSS. */
function MulticolumnGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupMulticolumnPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {MULTICOLUMN_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <SplitShowcaseLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <RichTextAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <RichTextBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

const PULL_QUOTE_LAYOUT_FIELD_ORDER = [
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'alignTextBaseline',
  'layoutGap',
] as const;

/** Pull quote layout: Direction → Alignment → Position (dropdown) → Gap (+ optional mobile/baseline toggles). */
function PullQuoteLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const rank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = PULL_QUOTE_LAYOUT_FIELD_ORDER.indexOf(
      key as (typeof PULL_QUOTE_LAYOUT_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => rank(a.path) - rank(b.path));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (field.widget === 'toggle' || key === 'verticalOnMobile' || key === 'alignTextBaseline') {
            return (
              <ToggleSwitchFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'select-inline') {
            return (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'segmented' || key === 'direction' || key === 'layoutAlignment') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider' || key === 'layoutGap') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          return (
            <InlineSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Pull quote appearance: Color scheme → Background media → Borders → Corner radius → Overlay. */
/** Pull quote: Layout → Size → Appearance → Borders → Padding → Custom CSS. */
function PullQuoteGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupPullQuotePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {PULL_QUOTE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <PullQuoteLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <RichTextAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <RichTextBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function TextMarqueePaddingSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const top = fields.find((f) => f.path.endsWith('paddingTop'));
  const bottom = fields.find((f) => f.path.endsWith('paddingBottom'));
  const gap = fields.find((f) => f.path.endsWith('layoutGap'));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
      <div className="space-y-1">
        {top ? <SliderFieldRow field={top} values={values} onFieldChange={onFieldChange} /> : null}
        {bottom ? (
          <SliderFieldRow field={bottom} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {gap ? <SliderFieldRow field={gap} values={values} onFieldChange={onFieldChange} /> : null}
      </div>
    </div>
  );
}

function BlogSelectFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId, loading } = useBlogs();
  const current = fieldValueAsString(values, field);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogsByStoreId]);

  useEffect(() => {
    if (current || loading || blogs.length === 0) return;
    const firstHandle = blogs[0]?.urlHandle?.trim();
    if (!firstHandle) return;
    onFieldChange(field.path, 'text', firstHandle);
  }, [blogs, current, field.path, loading, onFieldChange]);

  const options = useMemo(
    () => [
      { value: '', label: 'Select' },
      ...blogs.map((blog) => ({
        value: blog.urlHandle,
        label: blog.title,
      })),
    ],
    [blogs]
  );

  const label = options.find((o) => o.value === current)?.label ?? (current ? current : 'Select');

  return (
    <div className="space-y-2 py-1">
      <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
      <div className="flex items-center gap-2">
        <select
          id={fieldInputId(field.path)}
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          disabled={loading && blogs.length === 0}
          className="min-h-9 flex-1 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        >
          {options.map((opt) => (
            <option key={opt.value || '__empty'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          title="Connect blog source"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          aria-label="Connect blog source"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      {current ? (
        <p className="truncate text-[12px] text-gray-600">{label}</p>
      ) : loading ? (
        <p className="text-[12px] text-gray-500">Loading blogs…</p>
      ) : blogs.length === 0 ? (
        <p className="text-[12px] text-gray-500">Create a blog in Content → Blogs.</p>
      ) : null}
    </div>
  );
}

function BlogPostsCarouselSectionLayoutGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const sectionWidth = pickBlogPostsCarouselSectionField(fields, 'sectionWidth');
  const layoutGap = pickBlogPostsCarouselSectionField(fields, 'layoutGap');
  const backgroundColor = pickBlogPostsCarouselSectionField(fields, 'backgroundColor');

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Section layout</h3>
      <div className="space-y-1">
        {sectionWidth ? (
          <SegmentedFieldRow field={sectionWidth} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {layoutGap ? (
          <SliderFieldRow field={layoutGap} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {backgroundColor ? (
          <ThemeDefaultColorField
            label="Background color"
            path={backgroundColor.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={0}
            fallbackColor="#ffffff"
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
    </div>
  );
}

/** Blog posts editorial: General → Cards layout → Section layout → Padding → Custom CSS. */
function BlogPostsEditorialGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupBlogPostsEditorialPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {BLOG_POSTS_EDITORIAL_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.path.endsWith('blogHandle') ? (
                  <BlogSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Cards layout') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'toggle' || field.type === 'boolean') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Section layout') {
          return (
            <BlogPostsGridSectionLayoutGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Storytelling carousel: Layout → Navigation → Padding → Custom CSS. */
function StorytellingCarouselGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupStorytellingCarouselPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {STORYTELLING_CAROUSEL_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          const columns = pickStorytellingCarouselSectionField(fields, 'columns');
          const mobileColumns = pickStorytellingCarouselSectionField(fields, 'mobileColumns');
          const sectionWidth = pickStorytellingCarouselSectionField(fields, 'sectionWidth');
          const horizontalGap = pickStorytellingCarouselSectionField(fields, 'horizontalGap');
          const colorScheme = pickStorytellingCarouselSectionField(fields, 'colorScheme');

          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {columns ? (
                  <SliderFieldRow field={columns} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {mobileColumns ? (
                  <SegmentedFieldRow
                    field={mobileColumns}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {sectionWidth ? (
                  <SegmentedFieldRow
                    field={sectionWidth}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {horizontalGap ? (
                  <SliderFieldRow
                    field={horizontalGap}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {colorScheme ? (
                  <ColorSchemeFieldRow
                    field={{ ...colorScheme, label: 'Background color' }}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Navigation') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Blog posts grid: General → Cards layout → Section layout → Padding → Custom CSS. */
function BlogPostsGridSectionLayoutGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const sectionWidth = pickBlogPostsGridSectionField(fields, 'sectionWidth');
  const layoutGap = pickBlogPostsGridSectionField(fields, 'layoutGap');
  const backgroundColor = pickBlogPostsGridSectionField(fields, 'backgroundColor');

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Section layout</h3>
      <div className="space-y-1">
        {sectionWidth ? (
          <SegmentedFieldRow field={sectionWidth} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {layoutGap ? (
          <SliderFieldRow field={layoutGap} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {backgroundColor ? (
          <ThemeDefaultColorField
            label="Background color"
            path={backgroundColor.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={0}
            fallbackColor="#ffffff"
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
    </div>
  );
}

/** Blog posts grid: General → Cards layout → Section layout → Padding → Custom CSS. */
function BlogPostsGridGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupBlogPostsGridPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {BLOG_POSTS_GRID_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.path.endsWith('blogHandle') ? (
                  <BlogSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Cards layout') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'toggle' || field.type === 'boolean') {
                    return (
                      <ToggleSwitchFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Section layout') {
          return (
            <BlogPostsGridSectionLayoutGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Blog posts grid — Blog card group. */
function BlogPostsGridCardGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupBlogPostsGridCardPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {BLOG_POSTS_GRID_CARD_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          const alignment = pickBlogPostsGridCardField(fields, 'layoutAlignment');
          const layoutGap = pickBlogPostsGridCardField(fields, 'layoutGap');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {alignment ? (
                  <SegmentedFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {layoutGap ? (
                  <SliderFieldRow field={layoutGap} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          const backgroundColor = pickBlogPostsGridCardField(fields, 'backgroundColor');
          const borderStyle = pickBlogPostsGridCardField(fields, 'borderStyle');
          const cornerRadius = pickBlogPostsGridCardField(fields, 'cornerRadius');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {backgroundColor ? (
                  <ThemeDefaultColorField
                    label="Background color"
                    path={backgroundColor.path}
                    values={values}
                    colorPalette={colorPalette}
                    defaultPaletteIndex={0}
                    fallbackColor="#ffffff"
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {borderStyle ? (
                  <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

/** Blog posts grid — card Image block. */
function BlogPostsGridImageBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const aspectRatio = pickBlogPostsGridBlockField(fields, 'imageAspectRatio');
  const borderStyle = pickBlogPostsGridBlockField(fields, 'imageBorderStyle');
  const cornerRadius = pickBlogPostsGridBlockField(fields, 'imageCornerRadius');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {aspectRatio ? (
          <>
            <InlineSelectFieldRow field={aspectRatio} values={values} onFieldChange={onFieldChange} />
            <p className="text-[12px] text-gray-500">Adjusted in some layouts</p>
          </>
        ) : null}
      </div>
      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Borders</h3>
        <div className="space-y-1">
          {borderStyle ? (
            <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {cornerRadius ? (
            <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Blog posts grid — card Title block. */
function BlogPostsGridCardTitleSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const preset = pickBlogPostsGridBlockField(fields, 'titleTypographyPreset');
  const text = pickBlogPostsGridBlockField(fields, 'title');
  const color = pickBlogPostsGridBlockField(fields, 'titleColor');
  const paddingFields = fields.filter((f) => f.group === 'Padding');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {preset ? (
        <div className="px-1 py-3">
          <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
          {preset.description ? (
            <p className="mt-1 text-right text-[12px] text-gray-500">
              Edit presets in{' '}
              <button
                type="button"
                className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
                onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
              >
                theme settings
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
      {text ? (
        <div className="space-y-1 px-1 py-3">
          <RichTextFieldRow
            field={{ ...text, widget: 'richtext', type: 'textarea' }}
            values={values}
            onFieldChange={onFieldChange}
            showDynamicSource
          />
        </div>
      ) : null}
      {color ? (
        <div className="px-1 py-3">
          <ThemeDefaultColorField
            label="Text color"
            path={color.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={0}
            fallbackColor="#111827"
            onFieldChange={onFieldChange}
          />
        </div>
      ) : null}
      {paddingFields.length ? (
        <HeroPaddingSettingsGroup
          fields={paddingFields}
          values={values}
          onFieldChange={onFieldChange}
        />
      ) : null}
    </div>
  );
}

/** Blog posts grid — card Details block. */
function BlogPostsGridDetailsBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const dateEnabled = pickBlogPostsGridBlockField(fields, 'detailsDateEnabled');
  const authorEnabled = pickBlogPostsGridBlockField(fields, 'detailsAuthorEnabled');
  const preset = pickBlogPostsGridBlockField(fields, 'detailsTypographyPreset');
  const color = pickBlogPostsGridBlockField(fields, 'detailsColor');
  const paddingFields = fields.filter((f) => f.group === 'Padding');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {dateEnabled ? (
          <ToggleSwitchFieldRow field={dateEnabled} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {authorEnabled ? (
          <ToggleSwitchFieldRow field={authorEnabled} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
      {preset ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
          <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
          {preset.description ? (
            <p className="mt-1 text-right text-[12px] text-gray-500">
              Edit presets in{' '}
              <button
                type="button"
                className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
                onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
              >
                theme settings
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
      {color ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
          <ThemeDefaultColorField
            label="Text color"
            path={color.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={0}
            fallbackColor="#111827"
            onFieldChange={onFieldChange}
          />
        </div>
      ) : null}
      {paddingFields.length ? (
        <HeroPaddingSettingsGroup
          fields={paddingFields}
          values={values}
          onFieldChange={onFieldChange}
        />
      ) : null}
    </div>
  );
}

/** Blog posts grid — card Excerpt block. */
function BlogPostsGridExcerptBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const preset = pickBlogPostsGridBlockField(fields, 'excerptTypographyPreset');
  const color = pickBlogPostsGridBlockField(fields, 'excerptColor');
  const paddingFields = fields.filter((f) => f.group === 'Padding');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {preset ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
          <InlineSelectFieldRow field={preset} values={values} onFieldChange={onFieldChange} />
          {preset.description ? (
            <p className="mt-1 text-right text-[12px] text-gray-500">
              Edit presets in{' '}
              <button
                type="button"
                className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
                onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
              >
                theme settings
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
      {color ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
          <ThemeDefaultColorField
            label="Text color"
            path={color.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={0}
            fallbackColor="#111827"
            onFieldChange={onFieldChange}
          />
        </div>
      ) : null}
      {paddingFields.length ? (
        <HeroPaddingSettingsGroup
          fields={paddingFields}
          values={values}
          onFieldChange={onFieldChange}
        />
      ) : null}
    </div>
  );
}

const CREATE_COLLECTION_OPTION_VALUE = '__create_collection__';

function CollectionSelectFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const CREATE_COLLECTION_VALUE = CREATE_COLLECTION_OPTION_VALUE;
  const { activeStoreId } = useStore();
  const { collections, fetchCollectionsByStoreId, loading } = useCollections();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const current = fieldValueAsString(values, field);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchCollectionsByStoreId(activeStoreId);
  }, [activeStoreId, fetchCollectionsByStoreId]);

  const options = useMemo(() => {
    const fromStore = collections.map((collection) => ({
      value: collection.urlHandle,
      label: collection.title,
    }));
    const hasCurrent = Boolean(current) && fromStore.some((opt) => opt.value === current);
    const legacy =
      current && !hasCurrent ? [{ value: current, label: current }] : [];
    return [
      { value: '', label: 'Select' },
      ...legacy,
      ...fromStore,
      { value: CREATE_COLLECTION_VALUE, label: 'Create collection' },
    ];
  }, [collections, current]);

  const label =
    options.find((opt) => opt.value === current)?.label ?? (current ? current : 'Select');

  const openCreateSheet = () => {
    if (!activeStoreId) {
      toast.error('Select a store before creating a collection');
      return;
    }
    setCreateSheetOpen(true);
  };

  return (
    <div className="space-y-2 py-1">
      <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
      <div className="flex items-center gap-2">
        <select
          id={fieldInputId(field.path)}
          value={current}
          onChange={(e) => {
            const next = e.target.value;
            if (next === CREATE_COLLECTION_VALUE) {
              openCreateSheet();
              return;
            }
            onFieldChange(field.path, 'text', next);
          }}
          disabled={loading && collections.length === 0}
          className="min-h-9 flex-1 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        >
          {options.map((opt) => (
            <option
              key={opt.value || '__empty'}
              value={opt.value}
              className={opt.value === CREATE_COLLECTION_VALUE ? 'font-medium text-[#2c6ecb]' : undefined}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          title="Create collection"
          onClick={openCreateSheet}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          aria-label="Create collection"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      {current ? (
        <p className="truncate text-[12px] text-gray-600">{label}</p>
      ) : loading ? (
        <p className="text-[12px] text-gray-500">Loading collections…</p>
      ) : null}
      <button
        type="button"
        onClick={openCreateSheet}
        className="text-[13px] font-medium text-[#2c6ecb] hover:underline"
      >
        Create collection
      </button>
      <ThemeEditorCreateCollectionSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        onCreated={(collection) => {
          if (activeStoreId) {
            void fetchCollectionsByStoreId(activeStoreId);
          }
          onFieldChange(field.path, 'text', collection.urlHandle);
          setCreateSheetOpen(false);
        }}
      />
    </div>
  );
}

/** Featured collection: Collection → (Carousel navigation) → Section layout → Padding → Theme settings → Custom CSS. */
function FeaturedCollectionSectionLayoutGroup({
  fields,
  values,
  onFieldChange,
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette: string[];
}) {
  const backgroundColorField = fields.find((f) => f.path.endsWith('.backgroundColor'));
  const layoutFields = fields.filter((f) => !f.path.endsWith('.backgroundColor'));
  const bgColorRaw = backgroundColorField
    ? fieldValueAsString(values, backgroundColorField) || 'default'
    : 'default';
  const bgColorIsDefault = bgColorRaw === 'default' || !bgColorRaw.trim();

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Section layout</h3>
      <div className="space-y-1">
        {layoutFields.map((field) => {
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'color-scheme') {
            return (
              <ColorSchemeFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          return (
            <DefaultFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
        {backgroundColorField ? (
          bgColorIsDefault ? (
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
              <span className="text-[13px] text-gray-800">Background color</span>
              <button
                type="button"
                onClick={() => onFieldChange(backgroundColorField.path, 'text', 'palette:0')}
                className="flex min-w-[148px] max-w-[180px] items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-2.5 py-2 text-left text-[13px] text-gray-900 shadow-sm hover:border-[#aeb4b9]"
              >
                <span
                  className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md border border-[#e1e3e5] bg-white"
                  aria-hidden
                >
                  <span className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_46%,#e11d48_46%,#e11d48_54%,transparent_54%)]" />
                </span>
                <span className="truncate">Default</span>
              </button>
            </div>
          ) : (
            <ThemePaletteColorField
              label="Background color"
              path={backgroundColorField.path}
              values={{
                ...values,
                [backgroundColorField.path]:
                  bgColorRaw === 'palette' ||
                  /^palette:\d+$/.test(bgColorRaw) ||
                  bgColorRaw.startsWith('#')
                    ? bgColorRaw
                    : 'palette:0',
              }}
              colorPalette={colorPalette}
              defaultPaletteIndex={0}
              fallbackColor="#ffffff"
              onFieldChange={onFieldChange}
            />
          )
        ) : null}
      </div>
    </div>
  );
}

function FeaturedCollectionGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  variant = 'default',
  colorPalette,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  variant?: 'carousel' | 'editorial' | 'grid' | 'default';
  colorPalette: string[];
}) {
  const panelFields = useMemo(
    () => filterFeaturedCollectionPanelFieldsForVariant(fields, variant),
    [fields, variant]
  );
  const grouped = useMemo(() => groupFeaturedCollectionPanelFields(panelFields), [panelFields]);
  const layoutField = panelFields.find((f) => f.path.endsWith('.layoutType'));
  const layoutType = layoutField ? fieldValueAsString(values, layoutField) : variant === 'editorial' ? 'editorial' : 'carousel';
  const isEditorial = variant === 'editorial' || layoutType === 'editorial';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FEATURED_COLLECTION_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;
        if (label === 'Carousel navigation' && variant !== 'carousel' && (isEditorial || layoutType !== 'carousel')) return null;

        if (label === 'Collection') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) => {
                if (field.path.endsWith('collectionHandle') || field.widget === 'collection') {
                  return (
                    <CollectionSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.path.endsWith('layoutType')) {
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'segmented') {
                  return (
                    <SegmentedFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'slider') {
                  return (
                    <SliderFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.type === 'boolean') {
                  return (
                    <ToggleSwitchFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                return (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                );
              })}
            </div>
          );
        }

        if (label === 'Carousel navigation') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <InlineSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          );
        }

        if (label === 'Section layout') {
          return (
            <FeaturedCollectionSectionLayoutGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
              colorPalette={colorPalette}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme Settings"
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Blog posts carousel: General → Cards layout → Carousel navigation → Section layout → Padding → Custom CSS. */
function BlogPostsCarouselGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupBlogPostsCarouselPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {BLOG_POSTS_CAROUSEL_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) =>
                field.path.endsWith('blogHandle') ? (
                  <BlogSelectFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <DefaultFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </div>
          );
        }

        if (label === 'Cards layout' || label === 'Carousel navigation') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) => {
                  if (field.widget === 'segmented') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (field.widget === 'slider') {
                    return (
                      <SliderFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <InlineSelectFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Section layout') {
          return (
            <BlogPostsCarouselSectionLayoutGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Marquee: Motion + Background color → Padding → Custom CSS (matches Shopify). */
function TextMarqueeGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupTextMarqueePanelFields(fields), [fields]);
  const layoutFields = grouped.get('Layout') ?? [];
  const appearanceFields = grouped.get('Appearance') ?? [];
  const paddingFields = grouped.get('Padding') ?? [];
  const customCssFields = grouped.get('Custom CSS') ?? [];
  const backgroundColorField = appearanceFields.find((f) => f.path.endsWith('backgroundColor'));

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {layoutFields.length || backgroundColorField ? (
        <div className="px-1 py-3">
          <div className="space-y-1">
            {layoutFields.map((field) =>
              field.widget === 'segmented' ? (
                <SegmentedFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null
            )}
            {backgroundColorField ? (
              <ThemeDefaultColorField
                label={backgroundColorField.label}
                path={backgroundColorField.path}
                values={values}
                colorPalette={colorPalette}
                defaultPaletteIndex={0}
                onFieldChange={onFieldChange}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {paddingFields.length ? (
        <TextMarqueePaddingSettingsGroup
          fields={paddingFields}
          values={values}
          onFieldChange={onFieldChange}
        />
      ) : null}

      {customCssFields.length ? (
        <div className="px-1 py-1">
          {customCssFields.map((field) => (
            <AccordionFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Hero: Marquee "Marquee" folder: Motion direction → Background color → Transparent background → Padding (Top/Bottom/Gap). */
function HeroMarqueeFolderSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const motionField = fields.find((f) => f.path.endsWith('marqueeMotionDirection'));
  const bgColorField = fields.find((f) => f.path.endsWith('marqueeBackgroundColor'));
  const transparentField = fields.find((f) => f.path.endsWith('marqueeTransparentBg'));
  const padTop = fields.find((f) => f.path.endsWith('marqueePaddingTop'));
  const padBottom = fields.find((f) => f.path.endsWith('marqueePaddingBottom'));
  const gapField = fields.find((f) => f.path.endsWith('marqueeGap'));
  const paddingFields = [padTop, padBottom, gapField].filter(
    (f): f is EditorFieldDef => Boolean(f)
  );

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-2 px-1 py-3">
        {motionField ? (
          <SegmentedFieldRow field={motionField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {bgColorField ? (
          <ThemeDefaultColorField
            label={bgColorField.label}
            path={bgColorField.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={0}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {transparentField ? (
          <ToggleSwitchFieldRow
            field={transparentField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
      {paddingFields.length ? (
        <ShopifySettingsSection title="Padding">
          {paddingFields.map((field) => (
            <SliderFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          ))}
        </ShopifySettingsSection>
      ) : null}
    </div>
  );
}

/** Rich text: Layout → Size → Appearance → Padding → Custom CSS. */
/** Rich text — Appearance group: Background media → Background color → Background overlay. */
function RichTextAppearanceSettingsGroup({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const bgMediaField = fields.find((f) => f.path.endsWith('backgroundMedia'));
  const bgImageField = fields.find((f) => f.path.endsWith('backgroundImageUrl'));
  const bgImagePositionField = fields.find((f) => f.path.endsWith('backgroundImagePosition'));
  const bgColorField = fields.find((f) => f.path.endsWith('backgroundColor'));
  const overlayField = fields.find((f) => f.path.endsWith('backgroundOverlay'));
  const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {bgMediaField ? (
          <InlineSelectFieldRow field={bgMediaField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {bgMedia === 'image' && bgImageField ? (
          <ImagePickerFieldRow field={bgImageField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {bgMedia === 'image' && bgImagePositionField ? (
          <SegmentedFieldRow
            field={bgImagePositionField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {bgColorField ? (
          <ThemeDefaultColorField
            label={bgColorField.label}
            path={bgColorField.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={0}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {overlayField ? (
          <ToggleSwitchFieldRow field={overlayField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

/** Rich text — Borders group: Style → Corner radius. */
function RichTextBordersSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const styleField = fields.find((f) => f.path.endsWith('borderStyle'));
  const radiusField = fields.find((f) => f.path.endsWith('cornerRadius'));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Borders</h3>
      <div className="space-y-1">
        {styleField ? (
          <SegmentedFieldRow field={styleField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {radiusField ? (
          <SliderFieldRow field={radiusField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

function RichTextGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupRichTextPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {RICH_TEXT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <PullQuoteLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <RichTextAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <RichTextBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Icon with text block: Icon → Heading → Description. */
function IconsWithTextBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const ordered = ['icon', 'heading', 'text']
    .map((key) => fields.find((f) => f.path.endsWith(`.${key}`)))
    .filter((f): f is EditorFieldDef => Boolean(f));

  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {ordered.map((field) => {
          if (field.widget === 'select') {
            return (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          return (
            <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          );
        })}
      </div>
    </div>
  );
}

/** Icons with text: Layout → Size → Appearance → Padding → Custom CSS. */
function IconsWithTextGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupIconsWithTextPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {ICONS_WITH_TEXT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <SplitShowcaseLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <ContactFormAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function faqLayoutField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function FaqLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const directionField = faqLayoutField(fields, 'direction');
  const direction = directionField
    ? fieldValueAsString(values, directionField) || 'vertical'
    : 'vertical';
  const isHorizontal = direction === 'horizontal';

  const ordered = sortFaqGroupFields(
    fields.filter((field) => {
      const key = field.path.split('.').pop() ?? '';
      return key !== 'verticalOnMobile' || isHorizontal;
    }),
    FAQ_LAYOUT_FIELD_ORDER
  );

  return (
    <ShopifySettingsSection title="Layout">
      <div className="space-y-0">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'layoutAlignment' || field.widget === 'select-inline') {
            return (
              <InlineSelectFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'toggle' || key === 'verticalOnMobile') {
            return (
              <ToggleSwitchFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          return (
            <InlineSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </ShopifySettingsSection>
  );
}

function FaqBorderColorFieldRow({
  field,
  values,
  onFieldChange,
  defaultHex = '#e5e7eb',
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  defaultHex?: string;
}) {
  const raw = fieldValueAsString(values, field);
  const colorValue: CheckoutColorSetting =
    !raw || raw === 'default' ? 'default' : raw;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="min-w-[148px] max-w-[196px]">
        <CheckoutThemeColorField
          value={colorValue}
          defaultHex={defaultHex}
          onChange={(next) => onFieldChange(field.path, 'text', next)}
        />
      </div>
    </div>
  );
}

function FaqBordersSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const byKey = (key: string) => fields.find((f) => f.path.endsWith(key));
  const borderStyleField = byKey('borderStyle');
  const borderThickness = byKey('borderThickness');
  const borderOpacity = byKey('borderOpacity');
  const borderColor = byKey('borderColor');
  const cornerRadius = byKey('cornerRadius');
  const borderStyle = borderStyleField
    ? fieldValueAsString(values, borderStyleField) || 'none'
    : 'none';
  const solidBorders = borderStyle === 'solid';

  return (
    <ShopifySettingsSection title="Borders">
      <div className="space-y-0">
        {borderStyleField ? (
          <SegmentedFieldRow
            field={borderStyleField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {solidBorders && borderThickness ? (
          <SliderFieldRow field={borderThickness} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {solidBorders && borderOpacity ? (
          <SliderFieldRow field={borderOpacity} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {solidBorders && borderColor ? (
          <FaqBorderColorFieldRow
            field={borderColor}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {cornerRadius ? (
          <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </ShopifySettingsSection>
  );
}

function FaqImagePickerRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const url = fieldValueAsString(values, field);
  const hasImage = Boolean(url.trim());
  let fileName = '';
  try {
    const path = url.split('?')[0].split('#')[0];
    fileName = decodeURIComponent(path.split('/').pop() ?? '');
  } catch {
    fileName = url.split('/').pop() ?? '';
  }

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] items-start gap-3 py-1">
        <span className="pt-1 text-[13px] text-gray-800">{field.label}</span>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="relative h-[72px] w-[210px] overflow-hidden rounded-lg border border-[#e1e1e1] bg-[#f6f6f7] text-gray-400 transition-colors hover:border-[#c9cccf]"
          >
            {hasImage ? (
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <PhotoIcon className="h-7 w-7" />
              </span>
            )}
            {hasImage && fileName ? (
              <span className="absolute bottom-0 left-0 max-w-full truncate bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
                {fileName}
              </span>
            ) : null}
          </button>
          {hasImage ? (
            <button
              type="button"
              className="text-[12px] font-medium text-[#005bd3] hover:underline"
              onClick={() => onFieldChange(field.path, 'text', '')}
            >
              Remove image
            </button>
          ) : null}
        </div>
      </div>
      <ThemeEditorImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialUrl={url}
        onSelect={(nextUrl) => onFieldChange(field.path, 'text', nextUrl)}
      />
    </>
  );
}

function FaqAppearanceSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const bgMediaField = fields.find((f) => f.path.endsWith('backgroundMedia'));
  const bgImageField = fields.find((f) => f.path.endsWith('backgroundImageUrl'));
  const bgImagePositionField = fields.find((f) => f.path.endsWith('backgroundImagePosition'));
  const colorSchemeField = fields.find((f) => f.path.endsWith('colorScheme'));
  const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';
  const overlayField = fields.find((f) => f.path.endsWith('backgroundOverlay'));
  const overlayColorField = fields.find((f) => f.path.endsWith('overlayColor'));
  const overlayStyleField = fields.find((f) => f.path.endsWith('overlayStyle'));
  const overlayGradientDirectionField = fields.find((f) => f.path.endsWith('overlayGradientDirection'));
  const overlayOn = overlayField ? Boolean(values[overlayField.path]) : false;
  const isGradientOverlay =
    overlayStyleField && (fieldValueAsString(values, overlayStyleField) || 'solid') === 'gradient';

  return (
    <ShopifySettingsSection title="Appearance">
      <div className="space-y-0">
        {bgMediaField ? (
          <InlineSelectFieldRow
            field={bgMediaField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {bgMedia === 'image' && bgImageField ? (
          <FaqImagePickerRow field={bgImageField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {bgMedia === 'image' && bgImagePositionField ? (
          <SegmentedFieldRow
            field={bgImagePositionField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {colorSchemeField ? (
          <ColorPickerFieldRow
            field={{ ...colorSchemeField, label: 'Background color' }}
            values={{
              ...values,
              [colorSchemeField.path]: faqBackgroundColorForPicker(
                fieldValueAsString(values, colorSchemeField)
              ),
            }}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {overlayField ? (
          <ToggleSwitchFieldRow
            field={overlayField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {overlayOn && overlayColorField ? (
          <ColorPickerFieldRow
            field={overlayColorField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {overlayOn && overlayStyleField ? (
          <SegmentedFieldRow
            field={overlayStyleField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {overlayOn && isGradientOverlay && overlayGradientDirectionField ? (
          <SegmentedFieldRow
            field={overlayGradientDirectionField}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
    </ShopifySettingsSection>
  );
}

function FaqSizeSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const width = fields.find((f) => f.path.endsWith('sectionWidth'));
  const height = fields.find((f) => f.path.endsWith('height'));
  const customHeight = fields.find((f) => f.path.endsWith('customHeight'));
  const heightMode = height ? fieldValueAsString(values, height) || 'auto' : 'auto';
  const showCustomHeight = heightMode === 'custom';

  return (
    <ShopifySettingsSection title="Size">
      <div className="space-y-0">
        {width ? (
          <SegmentedFieldRow field={width} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {height ? (
          <InlineSelectFieldRow field={height} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {showCustomHeight && customHeight ? (
          <SliderFieldRow field={customHeight} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </ShopifySettingsSection>
  );
}

function FaqPaddingSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const ordered = sortFaqGroupFields(fields, FAQ_PADDING_FIELD_ORDER);

  return (
    <ShopifySettingsSection title="Padding">
      <div className="space-y-0">
        {ordered.map((field) => (
          <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    </ShopifySettingsSection>
  );
}

function FaqCustomCssSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const field = fields[0];
  if (!field) return null;
  const id = fieldInputId(field.path);
  const hasValue = Boolean(fieldValueAsString(values, field).trim());

  return (
    <ShopifySettingsSection title="Custom CSS" collapsible defaultOpen={hasValue}>
      <textarea
        id={id}
        rows={4}
        value={fieldValueAsString(values, field)}
        onChange={(e) => onFieldChange(field.path, 'textarea', e.target.value)}
        placeholder="/* Custom CSS */"
        className="w-full resize-y rounded-lg border border-[#c9cccf] bg-white px-3 py-2 font-mono text-xs text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      />
    </ShopifySettingsSection>
  );
}

/** FAQ: Layout → Size → Appearance → Borders → Padding → Custom CSS. */
function FaqGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFaqPanelFields(fields), [fields]);

  return (
    <div>
      {FAQ_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <FaqLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <FaqSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <FaqAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <FaqBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <FaqPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <FaqCustomCssSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

/** FAQ Accordion block: Icon → Dividers → Divider color → Heading preset → Appearance → Borders → Padding. */
function FaqAccordionAppearanceSettingsGroup({
  fields,
  values,
  onFieldChange,
  schemeBackgroundHex = '#ffffff',
  schemeTextHex = '#111827',
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  schemeBackgroundHex?: string;
  schemeTextHex?: string;
}) {
  const byKey = (key: string) => fields.find((f) => f.path.endsWith(key));

  return (
    <ShopifySettingsSection title="Appearance">
      <div className="space-y-0">
        {FAQ_ACCORDION_APPEARANCE_FIELD_ORDER.map((key) => {
          const field = byKey(key);
          if (!field) return null;
          const defaultHex =
            key === 'backgroundColor' ? schemeBackgroundHex : schemeTextHex;
          return (
            <FaqBorderColorFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
              defaultHex={defaultHex}
            />
          );
        })}
      </div>
    </ShopifySettingsSection>
  );
}

function FaqAccordionSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFaqAccordionPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FAQ_ACCORDION_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));

          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {FAQ_ACCORDION_GENERAL_FIELD_ORDER.map((key) => {
                  if (key === 'dividerColor') {
                    const field = byKey('dividerColor');
                    if (!field) return null;
                    return (
                      <FaqBorderColorFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  if (key === 'headingTypographyPreset') {
                    const preset = byKey('headingTypographyPreset');
                    if (!preset) return null;
                    const presetField = {
                      ...preset,
                      options: [...FAQ_ACCORDION_HEADING_PRESET_OPTIONS],
                      description: preset.description ?? 'Edit presets in theme settings',
                    };
                    return (
                      <div key={key}>
                        <InlineSelectFieldRow
                          field={presetField}
                          values={values}
                          onFieldChange={onFieldChange}
                        />
                        {presetField.description ? (
                          <p className="pb-1 text-[12px] text-gray-500">
                            Edit presets in{' '}
                            <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                              theme settings
                            </a>
                          </p>
                        ) : null}
                      </div>
                    );
                  }
                  const field = byKey(key);
                  if (!field) return null;
                  if (field.widget === 'segmented' || key === 'icon') {
                    return (
                      <SegmentedFieldRow
                        key={field.path}
                        field={field}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    );
                  }
                  return (
                    <ToggleSwitchFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                })}
              </div>
            </div>
          );
        }

        if (label === 'Appearance') {
          return (
            <FaqAccordionAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <FaqBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          const ordered = FAQ_ACCORDION_PADDING_FIELD_ORDER.map((key) =>
            groupFields.find((f) => f.path.endsWith(key))
          ).filter((f): f is EditorFieldDef => Boolean(f));
          return (
            <ShopifySettingsSection key={label} title="Padding">
              <div className="space-y-0">
                {ordered.map((field) => (
                  <SliderFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ))}
              </div>
            </ShopifySettingsSection>
          );
        }

        return null;
      })}
    </div>
  );
}

/** FAQ Accordion row: Heading → Open row by default → Icon group. */
const ACCORDION_ROW_HEADING_DEBOUNCE_MS = 350;

function AccordionRowHeadingFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);
  const external = fieldValueAsString(values, field);
  const [draft, setDraft] = useState(external);
  const debouncedDraft = useDebouncedValue(draft, ACCORDION_ROW_HEADING_DEBOUNCE_MS);
  const focusedRef = useRef(false);

  useEffect(() => {
    setDraft(external);
    focusedRef.current = false;
  }, [field.path]);

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(external);
    }
  }, [external]);

  useEffect(() => {
    if (debouncedDraft === external) return;
    onFieldChange(field.path, 'text', debouncedDraft);
  }, [debouncedDraft, external, field.path, onFieldChange]);

  const flushDraft = () => {
    if (draft !== external) {
      onFieldChange(field.path, 'text', draft);
    }
  };

  return (
    <div className="py-1">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] text-gray-800">
          {field.label}
        </label>
        <button
          type="button"
          title="Connect dynamic source"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#616161] hover:bg-[#f1f1f1]"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      <input
        id={id}
        type="text"
        value={draft}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          flushDraft();
        }}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            flushDraft();
          }
        }}
        className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      />
    </div>
  );
}

function accordionRowImageFileName(url: string): string {
  if (!url.trim()) return '';
  try {
    const path = url.split('?')[0].split('#')[0];
    return decodeURIComponent(path.split('/').pop() ?? '');
  } catch {
    return url.split('/').pop() ?? '';
  }
}

/** Shopify-style image icon picker for FAQ accordion rows. */
function AccordionRowImageIconFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const url = fieldValueAsString(values, field);
  const hasImage = Boolean(url.trim());
  const fileName = accordionRowImageFileName(url);

  return (
    <>
      <div className="space-y-2 py-1">
        <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
        <div className="rounded-lg border border-dashed border-[#c9cccf] bg-[#fafbfb] p-3">
          <div className="relative mb-2 overflow-hidden rounded-md border border-[#e1e1e1] bg-white">
            {hasImage ? (
              <img src={url} alt="" className="mx-auto max-h-32 w-full object-contain p-2" />
            ) : (
              <div className="flex h-24 items-center justify-center text-gray-400">
                <PhotoIcon className="h-8 w-8" />
              </div>
            )}
            {hasImage && fileName ? (
              <span className="block truncate border-t border-[#e1e1e1] bg-[#f6f6f7] px-2 py-1 text-center text-[11px] text-gray-600">
                {fileName}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              {hasImage ? 'Change' : 'Select'}
            </button>
            <button
              type="button"
              title="Browse library"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              onClick={() => setPickerOpen(true)}
            >
              <CircleStackIcon className="h-4 w-4" />
            </button>
          </div>
          {hasImage ? (
            <button
              type="button"
              className="mt-2 text-[12px] font-medium text-[#005bd3] hover:underline"
              onClick={() => onFieldChange(field.path, 'text', '')}
            >
              Remove image
            </button>
          ) : (
            <button
              type="button"
              className="mt-2 text-[12px] text-[#005bd3] hover:underline"
              onClick={() => setPickerOpen(true)}
            >
              Explore free images
            </button>
          )}
        </div>
      </div>
      <ThemeEditorImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialUrl={url}
        onSelect={(nextUrl) => onFieldChange(field.path, 'text', nextUrl)}
      />
    </>
  );
}

function FaqAccordionRowSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const byKey = (key: string) => fields.find((f) => f.path.endsWith(key));

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-0 px-1 py-3">
        {FAQ_ACCORDION_ROW_CONTENT_FIELD_ORDER.map((key) => {
          const field = byKey(key);
          if (!field) return null;
          if (key === 'heading') {
            return (
              <AccordionRowHeadingFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          return (
            <ToggleSwitchFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
      <ShopifySettingsSection title="Icon">
        <div className="space-y-0">
          {FAQ_ACCORDION_ROW_ICON_FIELD_ORDER.map((key) => {
            const field = byKey(key);
            if (!field) return null;
            if (key === 'rowImageIconUrl') {
              return (
                <AccordionRowImageIconFieldRow
                  key={field.path}
                  field={{ ...field, widget: 'image' }}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              );
            }
            if (key === 'rowIcon') {
              const iconField = {
                ...field,
                options: [...FAQ_ACCORDION_ROW_ICON_OPTIONS],
              };
              return (
                <SelectFieldRow
                  key={field.path}
                  field={iconField}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              );
            }
            return (
              <SliderFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          })}
        </div>
      </ShopifySettingsSection>
    </div>
  );
}

const TEXT_BLOCK_LAYOUT_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'none', label: 'None' },
] as const;

const TEXT_BLOCK_PADDING_ORDER = [
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
] as const;

function TextBlockLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const widthField = fields.find((f) => f.path.endsWith('.width'));
  const maxWidthField = fields.find((f) => f.path.endsWith('.maxWidth'));
  const alignmentField = fields.find((f) => f.path.endsWith('.alignment'));
  const widthMode = widthField ? fieldValueAsString(values, widthField) || 'fit' : 'fit';
  const isFill = widthMode === 'fill';

  const handleLayoutFieldChange = (
    path: string,
    type: ThemeEditorFieldType,
    value: string | boolean
  ) => {
    onFieldChange(path, type, value);
    if (widthField && path === widthField.path && maxWidthField) {
      const cur = fieldValueAsString(values, maxWidthField);
      if (cur === 'wide' || !TEXT_BLOCK_LAYOUT_MAX_WIDTH_OPTIONS.some((o) => o.value === cur)) {
        onFieldChange(maxWidthField.path, 'text', 'normal');
      }
    }
  };

  const layoutMaxWidthField = maxWidthField
    ? { ...maxWidthField, options: [...TEXT_BLOCK_LAYOUT_MAX_WIDTH_OPTIONS] }
    : null;
  const maxWidthValues =
    layoutMaxWidthField && maxWidthField
      ? (() => {
          const cur = fieldValueAsString(values, maxWidthField);
          if (cur === 'wide' || !TEXT_BLOCK_LAYOUT_MAX_WIDTH_OPTIONS.some((o) => o.value === cur)) {
            return { ...values, [maxWidthField.path]: 'normal' };
          }
          return values;
        })()
      : values;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {widthField ? (
          <SegmentedFieldRow
            field={widthField}
            values={values}
            onFieldChange={handleLayoutFieldChange}
          />
        ) : null}
        {layoutMaxWidthField ? (
          <InlineSelectFieldRow
            field={layoutMaxWidthField}
            values={maxWidthValues}
            onFieldChange={onFieldChange}
          />
        ) : null}
        {alignmentField ? (
          <HeadingAlignmentFieldRow
            field={alignmentField}
            values={values}
            onFieldChange={handleLayoutFieldChange}
          />
        ) : null}
      </div>
    </div>
  );
}

function TextBlockPaddingSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const ordered = [...fields].sort((a, b) => {
    const ka = a.path.split('.').pop() ?? '';
    const kb = b.path.split('.').pop() ?? '';
    const ia = TEXT_BLOCK_PADDING_ORDER.indexOf(ka as (typeof TEXT_BLOCK_PADDING_ORDER)[number]);
    const ib = TEXT_BLOCK_PADDING_ORDER.indexOf(kb as (typeof TEXT_BLOCK_PADDING_ORDER)[number]);
    return (ia >= 0 ? ia : 99) - (ib >= 0 ? ib : 99);
  });

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
      <div className="space-y-1">
        {ordered.map((field) => (
          <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </div>
    </div>
  );
}

function TextBlockTypographySettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const preset = fields.find((f) => f.path.endsWith('.typographyPreset'));
  const presetField = preset
    ? {
        ...preset,
        options: [...TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS],
        description: preset.description ?? 'Edit presets in theme settings',
      }
    : null;
  const isCustom = presetField
    ? isTextBlockTypographyCustomPreset(values, presetField.path)
    : false;
  const settingsBase = presetField?.path.replace(/\.typographyPreset$/, '') ?? '';

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
      <div className="space-y-1">
        {presetField ? (
          <div>
            <InlineSelectFieldRow field={presetField} values={values} onFieldChange={onFieldChange} />
            <p className="pb-1 text-[12px] text-gray-500">
              Edit presets in{' '}
              <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                theme settings
              </a>
            </p>
          </div>
        ) : null}
        {isCustom && settingsBase
          ? TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS.map((key) => {
              const field = resolveTextBlockTypographyField(key, settingsBase, fields);
              if (field.widget === 'segmented') {
                return (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                );
              }
              return (
                <InlineSelectFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              );
            })
          : null}
      </div>
    </div>
  );
}

function TextBlockAppearanceSettingsGroup({
  fields,
  values,
  onFieldChange,
  defaultTextHex = '#111827',
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  defaultTextHex?: string;
}) {
  const byKey = (key: string) => fields.find((f) => f.path.endsWith(key));
  const textColor = byKey('textColor');
  const background = byKey('backgroundEnabled');
  const backgroundColor = byKey('backgroundColor');
  const cornerRadius = byKey('cornerRadius');
  const backgroundOn =
    background &&
    (values[background.path] === true || values[background.path] === 'true');

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {textColor ? (
          <FaqBorderColorFieldRow
            field={textColor}
            values={values}
            onFieldChange={onFieldChange}
            defaultHex={defaultTextHex}
          />
        ) : null}
        {background ? (
          <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {backgroundOn && backgroundColor ? (
          <ThemeHexColorField
            label={backgroundColor.label}
            path={backgroundColor.path}
            values={values}
            defaultColor="#00000026"
            onFieldChange={onFieldChange}
          />
        ) : null}
        {backgroundOn && cornerRadius ? (
          <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

/** Shopify-order text block panel (Text → Layout → Typography → Appearance → Padding). */
function TextBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const preparedFields = useMemo(
    () => filterTextBlockPanelFieldsForTypographyPreset(fields, values),
    [fields, values]
  );
  const grouped = useMemo(() => groupTextBlockPanelFields(preparedFields), [preparedFields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {TEXT_BLOCK_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) => (
                <RichTextFieldRow
                  key={field.path}
                  field={{ ...field, widget: 'richtext', type: 'textarea' }}
                  values={values}
                  onFieldChange={onFieldChange}
                  showDynamicSource
                />
              ))}
            </div>
          );
        }

        if (label === 'Layout') {
          return (
            <TextBlockLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Typography') {
          return (
            <TextBlockTypographySettingsGroup
              key={label}
              fields={fields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <TextBlockAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <TextBlockPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

/** Image block: image → link → Size → Borders → Padding. */
function ImageWithTextImageBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const imageField = pickImageWithTextImageField(fields, 'imageUrl');
  const linkField = pickImageWithTextImageField(fields, 'imageLinkUrl');
  const aspectRatio = pickImageWithTextImageField(fields, 'imageAspectRatio');
  const desktopWidth = pickImageWithTextImageField(fields, 'imageDesktopWidth');
  const desktopCustom = pickImageWithTextImageField(fields, 'imageDesktopCustomWidth');
  const mobileWidth = pickImageWithTextImageField(fields, 'imageMobileWidth');
  const mobileCustom = pickImageWithTextImageField(fields, 'imageMobileCustomWidth');
  const borderStyle = pickImageWithTextImageField(fields, 'imageBorderStyle');
  const cornerRadius = pickImageWithTextImageField(fields, 'imageCornerRadius');
  const paddingTop = pickImageWithTextImageField(fields, 'imagePaddingTop');
  const paddingBottom = pickImageWithTextImageField(fields, 'imagePaddingBottom');
  const paddingLeft = pickImageWithTextImageField(fields, 'imagePaddingLeft');
  const paddingRight = pickImageWithTextImageField(fields, 'imagePaddingRight');

  const desktopMode = desktopWidth ? fieldValueAsString(values, desktopWidth) || 'fit' : 'fit';
  const mobileMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';

  const renderCustomWidth = (field: EditorFieldDef) => {
    const min = field.min ?? 20;
    const max = field.max ?? 100;
    const step = field.step ?? 1;
    const current = numValue(values, field, min);
    const id = fieldInputId(field.path);
    return (
      <div key={field.path} className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
        <label htmlFor={id} className="text-[13px] text-gray-800">
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
            className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
          />
          <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={current}
              onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
              className="w-10 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
              aria-label={field.label}
            />
            <span className="pr-2 text-[13px] text-gray-500">{field.unit ?? '%'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {imageField ? (
          <ImagePickerFieldRow field={imageField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {linkField ? (
          <ThemeEditorLinkField
            id={fieldInputId(linkField.path)}
            label={linkField.label}
            value={fieldValueAsString(values, linkField)}
            placeholder={linkField.placeholder ?? 'Paste a link or search'}
            onChange={(next) => onFieldChange(linkField.path, 'text', next)}
            showOpenLink
            showDynamicSource
          />
        ) : null}
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
        <div className="space-y-1">
          {aspectRatio ? (
            <InlineSelectFieldRow field={aspectRatio} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {desktopWidth ? (
            <SegmentedFieldRow field={desktopWidth} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {desktopMode === 'custom' && desktopCustom ? renderCustomWidth(desktopCustom) : null}
          {mobileWidth ? (
            <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {mobileMode === 'custom' && mobileCustom ? renderCustomWidth(mobileCustom) : null}
        </div>
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Borders</h3>
        <div className="space-y-1">
          {borderStyle ? (
            <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {cornerRadius ? (
            <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
        <div className="space-y-1">
          {paddingTop ? <SliderFieldRow field={paddingTop} values={values} onFieldChange={onFieldChange} /> : null}
          {paddingBottom ? (
            <SliderFieldRow field={paddingBottom} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {paddingLeft ? <SliderFieldRow field={paddingLeft} values={values} onFieldChange={onFieldChange} /> : null}
          {paddingRight ? (
            <SliderFieldRow field={paddingRight} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StorytellingCarouselImageBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const imageField = pickStorytellingCarouselBlockField(fields, 'imageUrl');
  const linkField = pickStorytellingCarouselBlockField(fields, 'imageLinkUrl');
  const aspectRatio = pickStorytellingCarouselBlockField(fields, 'imageAspectRatio');
  const desktopWidth = pickStorytellingCarouselBlockField(fields, 'imageDesktopWidth');
  const desktopCustom = pickStorytellingCarouselBlockField(fields, 'imageDesktopCustomWidth');
  const mobileWidth = pickStorytellingCarouselBlockField(fields, 'imageMobileWidth');
  const mobileCustom = pickStorytellingCarouselBlockField(fields, 'imageMobileCustomWidth');
  const height = pickStorytellingCarouselBlockField(fields, 'imageHeight');
  const borderStyle = pickStorytellingCarouselBlockField(fields, 'imageBorderStyle');
  const cornerRadius = pickStorytellingCarouselBlockField(fields, 'imageCornerRadius');
  const paddingTop = pickStorytellingCarouselBlockField(fields, 'imagePaddingTop');
  const paddingBottom = pickStorytellingCarouselBlockField(fields, 'imagePaddingBottom');
  const paddingLeft = pickStorytellingCarouselBlockField(fields, 'imagePaddingLeft');
  const paddingRight = pickStorytellingCarouselBlockField(fields, 'imagePaddingRight');

  const desktopMode = desktopWidth ? fieldValueAsString(values, desktopWidth) || 'fit' : 'fit';
  const mobileMode = mobileWidth ? fieldValueAsString(values, mobileWidth) || 'fit' : 'fit';

  const renderCustomWidth = (field: EditorFieldDef) => {
    const min = field.min ?? 20;
    const max = field.max ?? 100;
    const step = field.step ?? 1;
    const current = numValue(values, field, min);
    const id = fieldInputId(field.path);
    return (
      <div key={field.path} className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
        <label htmlFor={id} className="text-[13px] text-gray-800">
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
            className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
          />
          <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={current}
              onChange={(e) => onFieldChange(field.path, 'number', e.target.value)}
              className="w-10 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
              aria-label={field.label}
            />
            <span className="pr-2 text-[13px] text-gray-500">{field.unit ?? '%'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {imageField ? (
          <ImagePickerFieldRow field={imageField} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {linkField ? (
          <ThemeEditorLinkField
            id={fieldInputId(linkField.path)}
            label={linkField.label}
            value={fieldValueAsString(values, linkField)}
            placeholder={linkField.placeholder ?? 'Paste a link or search'}
            onChange={(next) => onFieldChange(linkField.path, 'text', next)}
            showOpenLink
            showDynamicSource
          />
        ) : null}
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Size</h3>
        <div className="space-y-1">
          {aspectRatio ? (
            <InlineSelectFieldRow field={aspectRatio} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {desktopWidth ? (
            <SegmentedFieldRow field={desktopWidth} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {desktopMode === 'custom' && desktopCustom ? renderCustomWidth(desktopCustom) : null}
          {mobileWidth ? (
            <SegmentedFieldRow field={mobileWidth} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {mobileMode === 'custom' && mobileCustom ? renderCustomWidth(mobileCustom) : null}
          {height ? <SegmentedFieldRow field={height} values={values} onFieldChange={onFieldChange} /> : null}
        </div>
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Borders</h3>
        <div className="space-y-1">
          {borderStyle ? (
            <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {cornerRadius ? (
            <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>

      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Padding</h3>
        <div className="space-y-1">
          {paddingTop ? <SliderFieldRow field={paddingTop} values={values} onFieldChange={onFieldChange} /> : null}
          {paddingBottom ? (
            <SliderFieldRow field={paddingBottom} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {paddingLeft ? <SliderFieldRow field={paddingLeft} values={values} onFieldChange={onFieldChange} /> : null}
          {paddingRight ? (
            <SliderFieldRow field={paddingRight} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Image with text: Layout → Size → Appearance → Borders → Padding → Custom CSS. */
function ImageWithTextGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupImageWithTextPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {IMAGE_WITH_TEXT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <SplitShowcaseLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <RichTextAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          return (
            <RichTextBordersSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function ImageCompareLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const layoutRank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = IMAGE_COMPARE_LAYOUT_FIELD_ORDER.indexOf(
      key as (typeof IMAGE_COMPARE_LAYOUT_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => layoutRank(a.path) - layoutRank(b.path));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (field.widget === 'segmented') {
            return (
              <SegmentedFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'toggle' || key === 'verticalOnMobile') {
            return (
              <ToggleSwitchFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            );
          }
          if (field.widget === 'slider') {
            return (
              <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            );
          }
          return (
            <InlineSelectFieldRow
              key={field.path}
              field={field}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Image compare: Layout → Size → Appearance → Borders → Padding → Theme Settings → Custom CSS. */
function ImageCompareGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupImageComparePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {IMAGE_COMPARE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Theme Settings') return null;

        if (label === 'Layout') {
          return (
            <ImageCompareLayoutSettingsGroup
              key={label}
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <ContactFormAppearanceSettingsGroup
              key={label}
              fields={groupFields ?? []}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          const borderStyle = groupFields?.find((f) => f.path.endsWith('borderStyle'));
          const cornerRadius = groupFields?.find((f) => f.path.endsWith('cornerRadius'));
          if (!borderStyle && !cornerRadius) return null;
          return (
            <ShopifySettingsSection key={label} title="Borders">
              {borderStyle ? (
                <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields ?? []}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme Settings') {
          const colorScheme = groupFields?.find(
            (f) => f.path.endsWith('colorScheme') || f.widget === 'color-scheme'
          );
          if (!colorScheme) return null;
          return (
            <ShopifySettingsSection key={label} title="Theme Settings" collapsible>
              <ColorSchemeFieldRow
                field={colorScheme}
                values={values}
                onFieldChange={onFieldChange}
              />
            </ShopifySettingsSection>
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {(groupFields ?? []).map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Editorial jumbo section: media position → width → height → section width → background → padding → CSS. */
function EditorialJumboGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupEditorialJumboPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {EDITORIAL_JUMBO_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const mediaPosition = groupFields.find((f) => f.path.endsWith('.mediaPosition'));
          const mediaWidth = groupFields.find((f) => f.path.endsWith('.mediaWidth'));
          const mediaHeight = groupFields.find((f) => f.path.endsWith('.mediaHeight'));
          const sectionWidth = groupFields.find((f) => f.path.endsWith('.sectionWidth'));
          const backgroundColor = groupFields.find((f) => f.path.endsWith('.backgroundColor'));
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {mediaPosition ? (
                <SegmentedFieldRow field={mediaPosition} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mediaWidth ? (
                <InlineSelectFieldRow field={mediaWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {mediaHeight ? (
                <InlineSelectFieldRow field={mediaHeight} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {sectionWidth ? (
                <SegmentedFieldRow field={sectionWidth} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {backgroundColor ? (
                <ThemeDefaultColorField
                  label={backgroundColor.label}
                  path={backgroundColor.path}
                  values={values}
                  colorPalette={colorPalette}
                  defaultPaletteIndex={0}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Editorial jumbo — Media block: type, image, link, image position. */
function EditorialJumboMediaBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const mediaType = pickEditorialJumboBlockField(fields, 'mediaType');
  const imageUrl = pickEditorialJumboBlockField(fields, 'imageUrl');
  const mediaLinkUrl = pickEditorialJumboBlockField(fields, 'mediaLinkUrl');
  const imagePosition = pickEditorialJumboBlockField(fields, 'imagePosition');
  const mediaMode = mediaType ? fieldValueAsString(values, mediaType) || 'image' : 'image';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {mediaType ? (
          <SegmentedFieldRow field={mediaType} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {mediaMode === 'image' && imageUrl ? (
          <ImagePickerFieldRow field={imageUrl} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {mediaLinkUrl ? (
          <LinkFieldRow field={mediaLinkUrl} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {imagePosition ? (
          <SegmentedFieldRow field={imagePosition} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
    </div>
  );
}

/** Editorial jumbo — Content group: alignment, position, gap. */
function EditorialJumboContentGroupGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const alignment = pickEditorialJumboContentGroupField(fields, 'layoutAlignment');
  const position = pickEditorialJumboContentGroupField(fields, 'position');
  const gap = pickEditorialJumboContentGroupField(fields, 'layoutGap');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Layout</h3>
        <div className="space-y-1">
          {alignment ? (
            <SegmentedFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {position ? (
            <InlineSelectFieldRow field={position} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {gap ? <SliderFieldRow field={gap} values={values} onFieldChange={onFieldChange} /> : null}
        </div>
      </div>
    </div>
  );
}

/** Editorial jumbo — Jumbo text block. */
function EditorialJumboJumboTextBlockSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const text = pickEditorialJumboBlockField(fields, 'headline');
  const font = pickEditorialJumboBlockField(fields, 'headlineFont');
  const alignment = pickEditorialJumboBlockField(fields, 'headlineAlignment');
  const lineHeight = pickEditorialJumboBlockField(fields, 'headlineLineHeight');
  const letterSpacing = pickEditorialJumboBlockField(fields, 'headlineLetterSpacing');
  const textCase = pickEditorialJumboBlockField(fields, 'headlineCase');
  const animation = pickEditorialJumboBlockField(fields, 'headlineAnimation');
  const textColor = pickEditorialJumboBlockField(fields, 'headlineColor');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {text ? (
          <RichTextFieldRow
            field={{ ...text, widget: 'richtext', type: 'textarea' }}
            values={values}
            onFieldChange={onFieldChange}
            showDynamicSource
          />
        ) : null}
        {font ? <InlineSelectFieldRow field={font} values={values} onFieldChange={onFieldChange} /> : null}
        {alignment ? (
          <SegmentedFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {lineHeight ? (
          <InlineSelectFieldRow field={lineHeight} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {letterSpacing ? (
          <InlineSelectFieldRow field={letterSpacing} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {textCase ? (
          <SegmentedFieldRow field={textCase} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {animation ? (
          <InlineSelectFieldRow field={animation} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
      {textColor ? (
        <div className="px-1 py-3">
          <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
          <ThemeDefaultColorField
            label="Text color"
            path={textColor.path}
            values={values}
            colorPalette={colorPalette}
            defaultPaletteIndex={1}
            onFieldChange={onFieldChange}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Email signup: Layout → Size → Appearance → Padding → Custom CSS. */
function EmailSignupGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupEmailSignupPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {EMAIL_SIGNUP_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <ContactFormLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Appearance') {
          return (
            <ContactFormAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Borders') {
          const borderStyle = groupFields.find((f) => f.path.endsWith('borderStyle'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('cornerRadius'));
          return (
            <ShopifySettingsSection key={label} title="Borders">
              {borderStyle ? (
                <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme Settings') {
          const colorScheme = groupFields.find(
            (f) => f.path.endsWith('colorScheme') || f.widget === 'color-scheme'
          );
          return (
            <ShopifySettingsSection key={label} title="Theme Settings" collapsible>
              {colorScheme ? (
                <ColorSchemeFieldRow
                  field={colorScheme}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
            </ShopifySettingsSection>
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Footer email-signup block: input-only component controls. */
function EmailSignupBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const pick = (suffix: string) => fields.find((f) => f.path.endsWith(suffix));
  const topInfo = pick('signupsCustomerProfiles');
  const contentFields = ['placeholder']
    .map((key) => pick(key))
    .filter((f): f is EditorFieldDef => Boolean(f));

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {topInfo ? (
        <div className="px-1 pb-2 pt-1">
          <InfoLinkFieldRow field={topInfo} values={values} onFieldChange={onFieldChange} />
        </div>
      ) : null}

      {contentFields.length ? (
        <div className="px-1 py-3">
          <div className="space-y-1">
            {contentFields.map((field) => (
              <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Footer utilities / Policies and links: Width → Gap → Divider → Color → Padding → Theme settings → Custom CSS. */
function FooterUtilitiesGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFooterUtilitiesPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FOOTER_UTILITIES_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {groupFields.map((field) => {
                if (field.widget === 'segmented') {
                  return (
                    <SegmentedFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'slider') {
                  return (
                    <SliderFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'color-scheme') {
                  return (
                    <ColorSchemeFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                return (
                  <SettingsFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                );
              })}
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Theme settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme settings"
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Footer section: Width → Gap → Color scheme → Padding → Custom CSS (Shopify order). */
function FooterGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFooterPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {FOOTER_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {groupFields.map((field) => {
                if (field.widget === 'segmented') {
                  return (
                    <SegmentedFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'slider') {
                  return (
                    <SliderFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                if (field.widget === 'color-scheme') {
                  return (
                    <ColorSchemeFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  );
                }
                return (
                  <SettingsFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                );
              })}
            </div>
          );
        }

        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function LargeLogoGroupedSettingsPanel({
  fields,
  values,
  colorPalette,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupLargeLogoPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {LARGE_LOGO_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <LargeLogoLayoutSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Size') {
          return (
            <LargeLogoSizeSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Appearance') {
          return (
            <ContactFormAppearanceSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              colorPalette={colorPalette}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Borders') {
          const borderStyle = groupFields.find((f) => f.path.endsWith('borderStyle'));
          const cornerRadius = groupFields.find((f) => f.path.endsWith('cornerRadius'));
          return (
            <ShopifySettingsSection key={label} title="Borders">
              {borderStyle ? (
                <SegmentedFieldRow field={borderStyle} values={values} onFieldChange={onFieldChange} />
              ) : null}
              {cornerRadius ? (
                <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
              ) : null}
            </ShopifySettingsSection>
          );
        }
        if (label === 'Padding') {
          return (
            <HeroPaddingSettingsGroup
              key={label}
              fields={groupFields}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }
        if (label === 'Theme Settings') {
          const colorScheme = groupFields.find(
            (f) => f.path.endsWith('colorScheme') || f.widget === 'color-scheme'
          );
          const otherFields = groupFields.filter((f) => f !== colorScheme);
          return (
            <ShopifySettingsSection key={label} title="Theme Settings" collapsible>
              {colorScheme ? (
                <ColorSchemeFieldRow
                  field={colorScheme}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null}
              {otherFields.map((field) =>
                field.widget === 'image' ? (
                  <ImagePickerFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : (
                  <SettingsFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                )
              )}
            </ShopifySettingsSection>
          );
        }
        if (label === 'Custom CSS') {
          return (
            <div key={label} className="px-1 py-1">
              {groupFields.map((field) => (
                <AccordionFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function InfoLinkFieldRow({
  label,
  href = '/settings/general',
  description,
}: {
  label: string;
  href?: string;
  description?: string;
}) {
  return (
    <div className="py-1">
      <button
        type="button"
        className="text-[13px] text-gray-800 underline decoration-gray-400 underline-offset-2 hover:text-gray-900"
        onClick={() => {
          window.open(href, '_blank', 'noopener,noreferrer');
        }}
      >
        {label}
      </button>
      {description ? <p className="mt-1 text-[12px] text-gray-500">{description}</p> : null}
    </div>
  );
}

function InlineSelectFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || '';

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="relative min-w-[140px]">
        <select
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
}

function SelectFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field) || field.options?.[0]?.value || '';

  return (
    <div className="space-y-1">
      <label className="block text-[12px] text-gray-600">{field.label}</label>
      <div className="relative">
        <select
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
      {field.description ? (
        <p className="text-[12px] text-gray-500">
          {field.description.includes('theme settings') ? (
            <>
              Edit presets in{' '}
              <button
                type="button"
                className="text-[#005bd3] underline underline-offset-2 hover:text-[#004299]"
                onClick={() => window.open('/settings/theme', '_blank', 'noopener,noreferrer')}
              >
                theme settings
              </button>
            </>
          ) : (
            field.description
          )}
        </p>
      ) : null}
    </div>
  );
}

function CollapsibleSettingsGroup({
  label,
  fields,
  values,
  onFieldChange,
  initialOpen = false,
}: {
  label: string;
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <section className="border-t border-[#e1e1e1]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <h3 className="text-[13px] font-semibold leading-5 text-[#303030]">{label}</h3>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[#616161] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="space-y-1 px-4 pb-4">
          {fields.map((field) =>
            field.widget === 'image' ? (
              <ImagePickerFieldRow
                key={field.path}
                field={field}
                values={values}
                onFieldChange={onFieldChange}
              />
            ) : (
              <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            )
          )}
        </div>
      ) : null}
    </section>
  );
}

function AccordionFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = fieldInputId(field.path);

  return (
    <div className="border-t border-[#e1e1e1] pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2 text-left text-[13px] font-medium text-gray-800"
      >
        {field.label}
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <textarea
          id={id}
          rows={4}
          value={fieldValueAsString(values, field)}
          onChange={(e) => onFieldChange(field.path, 'textarea', e.target.value)}
          placeholder="/* Custom CSS */"
          className="mb-2 w-full resize-y rounded-lg border border-[#c9cccf] bg-white px-3 py-2 font-mono text-xs text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        />
      ) : null}
    </div>
  );
}

function DefaultFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const type = fieldTypeFromSchema(field.type);
  const id = fieldInputId(field.path);
  const val = values[field.path];

  if (type === 'boolean') {
    return (
      <div className="py-1">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent hover:border-gray-100"
        >
          <span className="text-[13px] font-medium text-gray-800">{field.label}</span>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(val)}
            onChange={(e) => onFieldChange(field.path, type, e.target.checked)}
            className="h-[18px] w-[18px] shrink-0 rounded border-gray-300 text-[#005bd3] focus:ring-[#005bd3]"
          />
        </label>
        {field.description ? (
          <p className="mt-1 text-[12px] text-gray-500">{field.description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 py-1">
      <label htmlFor={id} className="block text-[13px] font-medium text-gray-800">
        {field.label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={3}
          value={fieldValueAsString(values, field)}
          onChange={(e) => onFieldChange(field.path, type, e.target.value)}
          className="w-full resize-y rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        />
      ) : (
        <input
          id={id}
          type={type === 'number' ? 'number' : 'text'}
          value={fieldValueAsString(values, field)}
          onChange={(e) => onFieldChange(field.path, type, e.target.value)}
          className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        />
      )}
    </div>
  );
}

function SettingsFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  switch (field.widget) {
    case 'slider':
      return <SliderFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'segmented':
      return <SegmentedFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'color-scheme':
      return <ColorSchemeFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'accordion':
      return <AccordionFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'richtext':
      return <RichTextFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'link':
      return <LinkFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'info-link':
      return (
        <InfoLinkFieldRow
          label={field.label}
          href={field.placeholder || '/settings/general'}
          description={field.description}
        />
      );
    case 'select':
      return <SelectFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'select-inline':
      return <InlineSelectFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'image':
      return <ImagePickerFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'product':
      return <ProductPickerFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'toggle':
      return <ToggleSwitchFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    case 'color':
      return <ColorPickerFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
    default:
      if (field.type === 'color') {
        return <ColorPickerFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
      }
      if (field.type === 'select' && field.options?.length) {
        return <SelectFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
      }
      return <DefaultFieldRow field={field} values={values} onFieldChange={onFieldChange} />;
  }
}

function inferEditorFieldGroup(field: EditorFieldDef): string {
  const key = field.path.split('.').pop() ?? '';
  const headingGroup = inferHeadingPanelGroup(key);
  if (headingGroup) return headingGroup;
  const textGroup = inferTextBlockPanelGroup(key);
  if (textGroup) return textGroup;
  if (field.group === 'Content' || field.group === 'General') {
    if (key === 'heading' || key === 'title' || key === 'text' || key === 'question') return 'Text';
  }
  if (field.group) return field.group;
  return 'Settings';
}

function isHeadingLayoutFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) =>
    /heading(?:Width|MaxWidth|Alignment)$/.test(f.path.split('.').pop() ?? '')
  );
}

function isHeadingTypographyFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => f.path.endsWith('headingTypographyPreset'));
}

function isHeadingAppearanceFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => {
    const key = f.path.split('.').pop() ?? '';
    return (
      key === 'headingColor' ||
      key === 'headingBackgroundEnabled' ||
      key === 'headingBackgroundColor' ||
      key === 'headingCornerRadius'
    );
  });
}

function isHeadingPaddingFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => (f.path.split('.').pop() ?? '').startsWith('headingPadding'));
}

function GroupedSettingsFields({
  nodeId,
  nodeLabel,
  fields,
  values,
  onFieldChange,
  colorPalette = [],
}: {
  nodeId: string;
  nodeLabel: string;
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  colorPalette?: string[];
}) {
  const groups = useMemo(() => {
    const map = new Map<string, EditorFieldDef[]>();
    const infoLinks: EditorFieldDef[] = [];

    for (const field of fields) {
      if (field.widget === 'info-link' && !inferHeadingPanelGroup(field.path.split('.').pop() ?? '')) {
        infoLinks.push(field);
        continue;
      }
      const group = inferEditorFieldGroup(field);
      const list = map.get(group) ?? [];
      list.push({ ...field, group });
      map.set(group, list);
    }

    const order = [
      'Collection',
      'Media 1',
      'Media 2',
      'Mobile media',
      'Section link',
      'Text',
      'Content',
      'Logo',
      'Menu',
      'Customer account',
      'Search',
      'Localization',
      'Typography',
      'General',
      'Heading',
      'Input',
      'Submit button',
      'Borders',
      'Appearance',
      'Size',
      'Section layout',
      'Layout',
      'Utilities',
      'Colors',
      'Page backgrounds',
      'Theme settings',
      'Padding',
      'Custom CSS',
      'Settings',
    ];
    const sorted: Array<{ label: string; fields: EditorFieldDef[] }> = [];
    if (infoLinks.length) sorted.push({ label: '__info__', fields: infoLinks });
    for (const label of order) {
      const list = map.get(label);
      if (list?.length) sorted.push({ label, fields: list });
      map.delete(label);
    }
    for (const [label, list] of map) sorted.push({ label, fields: list });
    return sorted;
  }, [fields]);

  if (isFaqHeadingCollectionTitlePanelNode({ id: nodeId, label: nodeLabel, kind: 'block', fields })) {
    return (
      <FaqHeadingCollectionTitleSettingsPanel
        fields={fields}
        values={values}
        onFieldChange={onFieldChange}
        colorPalette={colorPalette}
      />
    );
  }

  const flatOnly = groups.length === 1 && groups[0]?.label === 'Settings';

  if (flatOnly) {
    return (
      <ShopifySettingsSection title="General">
        {groups[0].fields.map((field) => (
          <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
        ))}
      </ShopifySettingsSection>
    );
  }

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {groups.map((group) =>
        group.label === '__info__' ? (
          <div key={group.label} className="px-4 pb-2 pt-3">
            {group.fields.map((field) => (
              <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            ))}
          </div>
        ) : group.label === 'Custom CSS' ? (
          <div key={group.label} className="px-4 py-2">
            {group.fields.map((field) => (
              <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            ))}
          </div>
        ) : group.label === 'Theme settings' ? (
          <CollapsibleSettingsGroup
            key={group.label}
            label="Theme settings"
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Text' &&
          group.fields.some((f) => {
            const key = f.path.split('.').pop() ?? '';
            return key === 'title' || key === 'heading';
          }) ? (
          <HeadingTextSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Typography' && isHeadingTypographyFields(group.fields) ? (
          <HeadingTypographySettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Typography' ? (
          <ShopifySettingsSection key={group.label} title={group.label}>
            {group.fields
              .filter((f) => f.widget !== 'segmented')
              .map((field) => (
                <SelectFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
            {group.fields
              .filter((f) => f.widget === 'segmented')
              .map((field) => (
                <SegmentedFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ))}
          </ShopifySettingsSection>
        ) : group.label === 'Media 1' || group.label === 'Media 2' ? (
          <HeroMediaSettingsGroup
            key={group.label}
            groupLabel={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Mobile media' ? (
          <HeroMobileMediaGroup
            key={group.label}
            fields={group.fields}
            allFields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Section link' ? (
          <HeroSectionLinkGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Layout' && isFaqLayoutPanelFields(group.fields) ? (
          <FaqLayoutSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Layout' && isHeadingLayoutFields(group.fields) ? (
          <HeadingLayoutSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Layout' ? (
          <HeroLayoutSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Appearance' && isHeadingAppearanceFields(group.fields) ? (
          <HeadingAppearanceSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : group.label === 'Appearance' ? (
          <HeroAppearanceSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Padding' && isHeadingPaddingFields(group.fields) ? (
          <HeadingPaddingSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Padding' ? (
          <HeroPaddingSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : (
          <ShopifySettingsSection
            key={group.label}
            title={group.label === 'Settings' ? 'General' : group.label}
          >
            {group.fields.map((field) => (
              <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            ))}
          </ShopifySettingsSection>
        )
      )}
    </div>
  );
}

type ThemeSectionSettingsPanelProps = {
  node: SidebarNode;
  values: Record<string, string | boolean>;
  themeConfig?: Record<string, unknown> | null;
  colorPalette?: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
  onStoreMenuSelect?: (
    menuFieldPath: string,
    menu: StoreMenu,
    items: StoreMenuItem[]
  ) => void;
  onClose: () => void;
  onRemoveSection?: () => void;
  onRemoveBlock?: () => void;
};

const ThemeSectionSettingsPanelInner: React.FC<ThemeSectionSettingsPanelProps> = ({
  node,
  values,
  themeConfig = null,
  colorPalette: colorPaletteProp,
  onFieldChange,
  onCollectionLinksApply,
  onStoreMenuSelect,
  onClose,
  onRemoveSection,
  onRemoveBlock,
}) => {
  const fields = node.fields ?? [];
  const colorPalette = useMemo(
    () => colorPaletteProp ?? readThemeColorPalette(themeConfig),
    [colorPaletteProp, themeConfig]
  );
  const canRemoveSection = node.kind === 'section' && Boolean(onRemoveSection);
  const canRemoveBlock = node.kind === 'block' && Boolean(onRemoveBlock);
  const isLargeLogoPanel =
    node.label === 'Large logo' || isLargeLogoSettingsPanelFields(fields);
  const isSplitShowcasePanel =
    node.kind !== 'block' &&
    (node.label === 'Split showcase' || isSplitShowcaseSettingsPanelFields(fields));
  const isSpacerBlockPanel =
    node.kind === 'block' &&
    /:group:[^:]+:spacer$/.test(node.id) &&
    !/:hero_main(?:_\d+)?:group:spacer:spacer$/.test(node.id);
  const isHeroMarqueeSpacerPanel =
    node.kind === 'block' && /:hero_main(?:_\d+)?:group:spacer:spacer$/.test(node.id);
  const isHeroMarqueeTextPanel =
    node.kind === 'block' && /:hero_main(?:_\d+)?:group:marquee:text$/.test(node.id);
  const isSplitShowcaseTextBlockPanel =
    node.kind === 'block' &&
    /:group:[^:]+:text$/.test(node.id) &&
    !isHeroMarqueeTextPanel;
  const isSplitShowcaseGroupPanel =
    node.kind === 'block' && /:group:[^:]+$/.test(node.id);
  const isHeroBottomGroupPanel =
    node.kind === 'block' &&
    /:block:content_group(?::nested:heading_group)?$/.test(node.id);
  const isHeroBottomTextBlockPanel =
    node.kind === 'block' &&
    /:block:content_group(?::nested:heading_group)?:nested:(?:text_intro|heading_main|text_body)$/.test(
      node.id
    );
  const isFooterUtilitiesPanel =
    node.label === 'Policies and links' ||
    node.label === 'Utilities' ||
    isFooterUtilitiesSettingsPanelFields(fields);
  const isFaqPanel =
    node.label === 'FAQ' || isFaqSectionNodeId(node.id) || isFaqSettingsPanelFields(fields);
  const isContactFormTextBlockPanel =
    node.kind === 'block' &&
    (isContactFormTextBlockNodeId(node.id) ||
      (fields.length > 0 && isContactFormTextBlockFieldsOnly(fields)));
  const isContactFormFormGroupPanel =
    !isContactFormTextBlockPanel &&
    node.kind === 'block' &&
    (isContactFormFormGroupNodeId(node.id) ||
      (fields.length > 0 && isContactFormFormGroupFieldsOnly(fields)));
  const isContactFormSubmitButtonPanel =
    node.kind === 'block' && isContactFormSubmitButtonNodeId(node.id);
  const isContactFormBlockPanel =
    !isContactFormTextBlockPanel &&
    !isContactFormFormGroupPanel &&
    !isContactFormSubmitButtonPanel &&
    node.kind === 'block' &&
    (isContactFormBlockNodeId(node.id) ||
      (fields.length > 0 && isContactFormBlockFieldsOnly(fields)));
  const isContactFormPanel =
    !isHeroSectionSettingsNode(node) &&
    !isFaqPanel &&
    !isContactFormBlockPanel &&
    !isContactFormTextBlockPanel &&
    !isContactFormFormGroupPanel &&
    node.kind !== 'block' &&
    (node.label === 'Contact form' || isContactFormSettingsPanelFields(fields));
  const isEmailSignupHeadingBlockPanel =
    node.kind === 'block' &&
    (isEmailSignupHeadingBlockNodeId(node.id) ||
      (fields.length > 0 && isEmailSignupHeadingBlockFieldsOnly(fields)));
  const isEmailSignupTextBlockPanel =
    !isEmailSignupHeadingBlockPanel &&
    node.kind === 'block' &&
    (isEmailSignupTextBlockNodeId(node.id) ||
      (fields.length > 0 && isEmailSignupTextBlockFieldsOnly(fields)));
  const isEmailSignupFormBlockPanel =
    !isEmailSignupHeadingBlockPanel &&
    !isEmailSignupTextBlockPanel &&
    node.kind === 'block' &&
    (isEmailSignupFormBlockNodeId(node.id) ||
      (fields.length > 0 && isEmailSignupFormBlockFieldsOnly(fields)));
  const isEmailSignupSectionBlockPanel =
    !isEmailSignupHeadingBlockPanel &&
    !isEmailSignupTextBlockPanel &&
    !isEmailSignupFormBlockPanel &&
    node.kind === 'block' &&
    (isEmailSignupSectionBlockNodeId(node.id) ||
      (fields.length > 0 && isEmailSignupSectionBlockFieldsOnly(fields)));
  const isImageCompareSliderBlockPanel =
    node.kind === 'block' &&
    (isImageCompareSliderBlockNodeId(node.id) ||
      (fields.length > 0 && isImageCompareSliderBlockFieldsOnly(fields)));
  const isImageCompareButtonsGroupPanel =
    isImageCompareButtonsGroupNodeId(node.id) ||
    (fields.length > 0 && isImageCompareButtonsGroupPanelFields(fields));
  const isImageCompareTextGroupPanel =
    isImageCompareTextGroupNodeId(node.id) ||
    (fields.length > 0 && isImageCompareTextGroupPanelFields(fields));
  const isImageCompareButtonBlockPanel =
    node.kind === 'block' &&
    !isImageCompareSliderBlockPanel &&
    !isImageCompareButtonsGroupPanel &&
    !isImageCompareTextGroupPanel &&
    (isImageCompareButtonBlockNodeId(node.id) ||
      (fields.length > 0 && isImageCompareButtonBlockFieldsOnly(fields)));
  const isImageCompareHeadingBlockPanel =
    node.kind === 'block' &&
    (isImageCompareHeadingBlockNodeId(node.id) || isImageCompareHeadingPanelFields(fields));
  const isImageCompareSubheadingBlockPanel =
    node.kind === 'block' &&
    (isImageCompareSubheadingBlockNodeId(node.id) || isImageCompareSubheadingPanelFields(fields));
  const isImageCompareContentGroupPanel =
    isImageCompareContentGroupNodeId(node.id) ||
    (fields.length > 0 && isImageCompareContentGroupFieldsOnly(fields));
  const isEmailSignupPanel =
    !isHeroSectionSettingsNode(node) &&
    !isEmailSignupSectionBlockPanel &&
    !isImageCompareSliderBlockPanel &&
    !isImageCompareButtonsGroupPanel &&
    !isImageCompareTextGroupPanel &&
    !isImageCompareButtonBlockPanel &&
    !isImageCompareHeadingBlockPanel &&
    !isImageCompareSubheadingBlockPanel &&
    !isImageCompareContentGroupPanel &&
    node.kind !== 'block' &&
    (node.label === 'Email signup' || isEmailSignupSettingsPanelFields(fields));
  const isCustomSectionPanel =
    !isHeroSectionSettingsNode(node) &&
    !isImageCompareSettingsPanelFields(fields) &&
    node.kind !== 'block' &&
    (node.label === 'Custom section' || isCustomSectionSettingsPanelFields(fields));
  const productHighlightSettingsBase = productHighlightSettingsBaseFromNodeId(node.id);
  const productHighlightCatalogVariant = productHighlightSettingsBase
    ? readProductHighlightSettingValue(
        values,
        themeConfig,
        productHighlightSettingsBase,
        'catalogVariant'
      )
    : '';
  const productHighlightVariant = productHighlightSettingsBase
    ? resolveProductHighlightVariant({
        label: node.label,
        catalogVariant: productHighlightCatalogVariant,
        fields,
      })
    : null;
  const productHighlightHeaderLabel =
    productHighlightVariant != null
      ? productHighlightVariantLabel(productHighlightVariant)
      : null;
  const isFeaturedProductPanel =
    productHighlightVariant === 'featured-product' ||
    (productHighlightVariant == null &&
      node.label !== 'Recommended products' &&
      node.label !== 'Product hotspots' &&
      !isRecommendedProductsSettingsPanelFields(fields) &&
      (node.label === 'Featured product' || isFeaturedProductSettingsPanelFields(fields)));
  const isProductHighlightMediaBlockPanel =
    productHighlightVariant === 'product-highlight' &&
    (node.label === 'Product media' ||
      isProductHighlightMediaBlockNodeId(node.id) ||
      isProductHighlightMediaPanelFields(fields));
  const isProductHighlightProductBlockPanel =
    node.label === 'Product' && isProductHighlightProductBlockNodeId(node.id);
  const isFeaturedProductMediaBlockPanel =
    !isProductHighlightMediaBlockPanel &&
    (node.label === 'Product media' ||
      isFeaturedProductMediaBlockNodeId(node.id) ||
      isFeaturedProductMediaPanelFields(fields));
  const isFeaturedProductDetailsBlockPanel =
    node.label === 'Details' ||
    isFeaturedProductDetailsBlockNodeId(node.id) ||
    isFeaturedProductDetailsPanelFields(fields);
  const isCollectionListSectionHeaderPanel =
    isCollectionListSectionHeaderBlockNodeId(node.id) ||
    isCollectionListSectionHeaderPanelFields(fields);
  const isFeaturedProductHeaderBlockPanel =
    isFeaturedProductHeaderBlockNodeId(node.id) || isFeaturedProductHeaderPanelFields(fields);
  const isProductCardBlockPanel =
    isProductCardBlockNodeId(node.id) || isProductCardPanelFields(fields);
  const isProductCardMediaPanel =
    isProductCardMediaNestedNodeId(node.id) || isProductCardMediaPanelFields(fields);
  const isProductCardTitlePanel =
    isProductCardTitleNestedNodeId(node.id) || isProductCardTitlePanelFields(fields);
  const isProductCardPricePanel =
    isProductCardPriceNestedNodeId(node.id) || isProductCardPricePanelFields(fields);
  const isProductHighlightProductTitleBlockPanel =
    !isProductCardTitlePanel &&
    (isProductHighlightProductTitleNestedNodeId(node.id) ||
      isProductHighlightProductTitlePanelFields(fields));
  const isProductHighlightProductPriceBlockPanel =
    !isProductCardPricePanel &&
    (isProductHighlightProductPriceNestedNodeId(node.id) ||
      isProductHighlightProductPricePanelFields(fields));
  const isProductHighlightProductImageBlockPanel =
    isProductHighlightProductImageNestedNodeId(node.id) ||
    isProductHighlightProductImagePanelFields(fields);
  const isProductHighlightProductSwatchesBlockPanel =
    isProductHighlightProductSwatchesNestedNodeId(node.id) ||
    isProductHighlightProductSwatchesPanelFields(fields);
  const isFeaturedProductHeaderTitleBlockPanel =
    !isProductCardTitlePanel &&
    !isProductHighlightProductTitleBlockPanel &&
    !isBlogPostsGridTitleBlockNodeId(node.id) &&
    !isBlogPostsGridCardTitleBlockNodeId(node.id) &&
    (node.label === 'Title' ||
      isFeaturedProductHeaderTitleNestedNodeId(node.id) ||
      isFeaturedProductHeaderTitlePanelFields(fields));
  const isFeaturedProductHeaderPriceBlockPanel =
    !isProductCardPricePanel &&
    !isProductHighlightProductPriceBlockPanel &&
    (node.label === 'Price' ||
      isFeaturedProductHeaderPriceNestedNodeId(node.id) ||
      isFeaturedProductHeaderPricePanelFields(fields));
  const isFeaturedProductReviewStarsBlockPanel =
    node.label === 'Review stars' ||
    isFeaturedProductReviewStarsBlockNodeId(node.id) ||
    isFeaturedProductReviewStarsPanelFields(fields);
  const isFeaturedProductVariantPickerBlockPanel =
    node.label === 'Variant picker' ||
    isFeaturedProductVariantPickerBlockNodeId(node.id) ||
    isFeaturedProductVariantPickerPanelFields(fields);
  const isFeaturedProductBuyButtonsBlockPanel =
    node.label === 'Buy buttons' ||
    isFeaturedProductBuyButtonsBlockNodeId(node.id) ||
    isFeaturedProductBuyButtonsPanelFields(fields);
  const isFeaturedProductAddToCartBlockPanel =
    node.label === 'Add to cart' ||
    isFeaturedProductAddToCartNestedNodeId(node.id) ||
    isFeaturedProductAddToCartPanelFields(fields);
  const isFeaturedProductQuantityBlockPanel =
    isFeaturedProductQuantityNestedNodeId(node.id) || isFeaturedProductQuantityPanelFields(fields);
  const isFeaturedProductAcceleratedCheckoutBlockPanel =
    node.label === 'Accelerated checkout' ||
    isFeaturedProductAcceleratedCheckoutNestedNodeId(node.id);
  const isProductHighlightPanel =
    productHighlightVariant === 'product-highlight' ||
    (!isFeaturedProductPanel &&
      !isFeaturedProductMediaBlockPanel &&
      !isFeaturedProductDetailsBlockPanel &&
      !isFeaturedProductHeaderBlockPanel &&
      !isFeaturedProductHeaderTitleBlockPanel &&
      !isFeaturedProductHeaderPriceBlockPanel &&
      !isFeaturedProductReviewStarsBlockPanel &&
      !isFeaturedProductVariantPickerBlockPanel &&
      !isFeaturedProductBuyButtonsBlockPanel &&
      !isFeaturedProductAddToCartBlockPanel &&
      !isFeaturedProductQuantityBlockPanel &&
      !isFeaturedProductAcceleratedCheckoutBlockPanel &&
      !isProductHighlightMediaBlockPanel &&
      !isProductHighlightProductBlockPanel &&
      !isProductHighlightProductTitleBlockPanel &&
      !isProductHighlightProductPriceBlockPanel &&
      !isProductHighlightProductImageBlockPanel &&
      !isProductHighlightProductSwatchesBlockPanel &&
      (node.label === 'Product highlight' || isProductHighlightSettingsPanelFields(fields)));
  const isEditorialPanel = node.label === 'Editorial' || isEditorialSettingsPanelFields(fields);
  const isEditorialMediaBlockPanel =
    node.kind === 'block' &&
    (isEditorialMediaBlockNodeId(node.id) || isEditorialMediaPanelFields(fields));
  const isEditorialContentGroupPanel =
    node.kind === 'block' &&
    (isEditorialContentGroupBlockNodeId(node.id) || isEditorialContentGroupPanelFields(fields));
  const isEditorialNestedGroupPanel =
    node.kind === 'block' &&
    (isEditorialNestedGroupBlockNodeId(node.id) || isEditorialTextGroupPanelFields(fields));
  const isEditorialCaptionBlockPanel =
    node.kind === 'block' &&
    (isEditorialCaptionBlockNodeId(node.id) || isEditorialCaptionPanelFields(fields));
  const isEditorialHeadingBlockPanel =
    node.kind === 'block' &&
    (isEditorialHeadingBlockNodeId(node.id) || isEditorialHeadingPanelFields(fields));
  const isEditorialTextBlockPanel =
    node.kind === 'block' &&
    (isEditorialTextBlockNodeId(node.id) || isEditorialTextPanelFields(fields));
  const isEditorialButtonBlockPanel =
    node.kind === 'block' &&
    (isEditorialButtonBlockNodeId(node.id) || isEditorialButtonPanelFields(fields));
  const isEditorialSectionPanel =
    !isEditorialMediaBlockPanel &&
    !isEditorialContentGroupPanel &&
    !isEditorialNestedGroupPanel &&
    !isEditorialCaptionBlockPanel &&
    !isEditorialHeadingBlockPanel &&
    !isEditorialTextBlockPanel &&
    !isEditorialButtonBlockPanel &&
    isEditorialPanel;
  const isEditorialJumboMediaBlockPanel =
    node.kind === 'block' &&
    (isEditorialJumboMediaBlockNodeId(node.id) || isEditorialJumboMediaPanelFields(fields));
  const isEditorialJumboContentGroupPanel =
    node.kind === 'block' &&
    (isEditorialJumboContentGroupBlockNodeId(node.id) ||
      isEditorialJumboContentGroupPanelFields(fields));
  const isEditorialJumboJumboTextBlockPanel =
    node.kind === 'block' &&
    (isEditorialJumboJumboTextBlockNodeId(node.id) || isEditorialJumboJumboTextPanelFields(fields));
  const isEditorialJumboPanel =
    !isEditorialJumboMediaBlockPanel &&
    !isEditorialJumboContentGroupPanel &&
    !isEditorialJumboJumboTextBlockPanel &&
    (node.label === 'Editorial: Jumbo text' || isEditorialJumboSettingsPanelFields(fields));
  const isImageComparePanel =
    !isImageCompareSliderBlockPanel &&
    !isImageCompareButtonsGroupPanel &&
    !isImageCompareTextGroupPanel &&
    !isImageCompareButtonBlockPanel &&
    !isImageCompareHeadingBlockPanel &&
    !isImageCompareSubheadingBlockPanel &&
    !isImageCompareContentGroupPanel &&
    node.kind !== 'block' &&
    (node.label === 'Image compare' || isImageCompareSettingsPanelFields(fields));
  const isCollectionLinksSpotlightPanel =
    node.label === 'Collection links: Spotlight' ||
    node.label === 'Collection links: Text' ||
    isCollectionLinksSpotlightSettingsPanelFields(fields);
  const isImageWithTextImageBlockPanel =
    node.kind === 'block' &&
    (isImageWithTextImageBlockNodeId(node.id) || isImageWithTextImagePanelFields(fields));
  const isImageWithTextHeadingBlockPanel =
    node.kind === 'block' &&
    (isImageWithTextHeadingBlockNodeId(node.id) || isImageWithTextHeadingPanelFields(fields));
  const isImageWithTextTextBlockPanel =
    node.kind === 'block' &&
    (isImageWithTextTextBlockNodeId(node.id) || isImageWithTextTextPanelFields(fields));
  const isImageWithTextButtonBlockPanel =
    node.kind === 'block' &&
    (isImageWithTextButtonBlockNodeId(node.id) || isImageWithTextButtonPanelFields(fields));
  const isImageWithTextGroupPanel =
    node.kind === 'block' &&
    (isImageWithTextGroupBlockNodeId(node.id) || isImageWithTextContentGroupPanelFields(fields));
  const isImageWithTextPanel =
    !isImageWithTextImageBlockPanel &&
    !isImageWithTextHeadingBlockPanel &&
    !isImageWithTextTextBlockPanel &&
    !isImageWithTextButtonBlockPanel &&
    !isImageWithTextGroupPanel &&
    !isCollectionLinksSpotlightPanel &&
    !isCollectionListSectionHeaderPanel &&
    !isFeaturedProductHeaderBlockPanel &&
    (node.label === 'Image with text' || isImageWithTextSettingsPanelFields(fields));
  const isHeaderLogoBlockPanel =
    isHeaderLogoBlockNodeId(node.id) ||
    (fields.length > 0 && isHeaderLogoBlockPanelFields(fields));
  const isHeaderMenuBlockPanel =
    isHeaderMenuBlockNodeId(node.id) ||
    (fields.length > 0 && isHeaderMenuBlockPanelFields(fields));
  const isHeaderSectionPanel =
    isHeaderLayoutNodeId(node.id) ||
    (node.label === 'Header' &&
      node.kind === 'section' &&
      fields.some((f) => f.group === 'Logo' || f.group === 'Search'));
  const isCopyrightBlockPanel =
    node.kind === 'block' &&
    (node.label === 'Copyright' ||
      fields.some((f) => f.path.endsWith('showPoweredBy') || f.path.endsWith('manageStoreName')));
  const isSocialLinksBlockPanel =
    node.kind === 'block' &&
    (node.label === 'Social media links' ||
      fields.some(
        (f) =>
          f.path.endsWith('facebookUrl') ||
          f.path.endsWith('instagramUrl') ||
          f.path.endsWith('youtubeUrl') ||
          f.path.endsWith('tiktokUrl') ||
          f.path.endsWith('twitterUrl') ||
          f.path.endsWith('threadsUrl') ||
          f.path.endsWith('linkedinUrl') ||
          f.path.endsWith('blueskyUrl') ||
          f.path.endsWith('snapchatUrl') ||
          f.path.endsWith('pinterestUrl') ||
          f.path.endsWith('tumblrUrl') ||
          f.path.endsWith('vimeoUrl') ||
          f.path.endsWith('customUrl')
      ));
  const isEmailSignupFooterBlockPanel =
    node.kind === 'block' &&
    !isEmailSignupSectionBlockPanel &&
    (fields.some((f) => f.path.endsWith('signupsCustomerProfiles')) ||
      fields.some((f) => f.path.endsWith('placeholder') && f.path.includes('.blocks.')));
  const isLargeLogoBlockPanel =
    node.kind === 'block' && fields.length > 0 && isLargeLogoBlockPanelFields(fields);
  const isStorytellingLogoPanel =
    !isHeaderLogoBlockPanel &&
    !isHeaderMenuBlockPanel &&
    !isLargeLogoBlockPanel &&
    !isCopyrightBlockPanel &&
    !isSocialLinksBlockPanel &&
    !isEmailSignupFooterBlockPanel &&
    ((node.kind === 'section' && node.label === 'Logo') ||
      isStorytellingLogoSettingsPanelFields(fields));
  const isStorytellingVideoPanel =
    node.label === 'Video' || isStorytellingVideoSettingsPanelFields(fields);
  const isStorytellingVideoCaptionGroupPanel =
    node.kind === 'block' &&
    (isStorytellingVideoCaptionGroupBlockNodeId(node.id) ||
      isStorytellingVideoCaptionGroupPanelFields(fields));
  const isStorytellingVideoCaptionTextPanel =
    node.kind === 'block' &&
    (isStorytellingVideoCaptionTextBlockNodeId(node.id) ||
      isStorytellingVideoCaptionTextPanelFields(fields));
  const isStorytellingVideoCaptionButtonPanel =
    node.kind === 'block' &&
    (isStorytellingVideoCaptionButtonBlockNodeId(node.id) ||
      isStorytellingVideoCaptionButtonPanelFields(fields));
  const isStorytellingVideoMediaBlockPanel =
    isStorytellingVideoMediaBlockNodeId(node.id) || isStorytellingVideoMediaPanelFields(fields);
  const isStorytellingVideoBlockPanel =
    !isStorytellingVideoMediaBlockPanel &&
    !isStorytellingVideoCaptionTextPanel &&
    !isStorytellingVideoCaptionButtonPanel &&
    node.kind === 'block' &&
    (isStorytellingVideoBlockNodeId(node.id) ||
      (fields.length > 0 && isStorytellingVideoBlockFieldsOnly(fields)));
  const isIconsWithTextPanel =
    node.label === 'Icons with text' || isIconsWithTextSettingsPanelFields(fields);
  const isIconsWithTextBlockPanel =
    node.kind === 'block' &&
    (isIconsWithTextBlockNodeId(node.id) ||
      (fields.length > 0 && fields.every(isIconsWithTextBlockField)));
  const isMulticolumnPanel =
    node.label === 'Multicolumn' || isMulticolumnSettingsPanelFields(fields);
  const isMulticolumnColumnBlockPanel =
    node.kind === 'block' && isMulticolumnColumnNodeId(node.id);
  const isMulticolumnDescriptionBlockPanel =
    node.kind === 'block' && isMulticolumnNestedDescriptionNodeId(node.id);
  const isMarqueeTextBlockPanel =
    node.kind === 'block' && isTextMarqueeTextBlockNodeId(node.id);
  const isMulticolumnBlockPanel =
    !isMulticolumnColumnBlockPanel &&
    !isMulticolumnDescriptionBlockPanel &&
    node.kind === 'block' &&
    (isMulticolumnBlockNodeId(node.id) ||
      (fields.length > 0 && fields.every(isMulticolumnBlockField)));
  const isPullQuotePanel =
    node.label === 'Pull quote' || isPullQuoteSettingsPanelFields(fields);
  const isPullQuoteButtonPanel =
    node.kind === 'block' && isPullQuoteButtonPanelFields(fields);
  const isPullQuoteTextPanel =
    node.kind === 'block' && isPullQuoteTextPanelFields(fields);
  const isRichTextPanel =
    node.label === 'Rich text' || isRichTextSettingsPanelFields(fields);
  const isRichTextBlockPanel =
    node.kind === 'block' &&
    (isRichTextBlockNodeId(node.id) ||
      (fields.length > 0 && fields.every(isRichTextBlockField)));
  const isRichTextButtonPanel =
    isRichTextBlockPanel && isRichTextButtonPanelFields(fields);
  const isRichTextTextPanel =
    isRichTextBlockPanel && isRichTextTextPanelFields(fields);
  const isRichTextHeadingPanel =
    isRichTextBlockPanel && isRichTextHeadingPanelFields(fields);
  const isHeroMarqueeFolderPanel = /:hero_main(?:_\d+)?:marquee$/.test(node.id);
  const isTextMarqueePanel =
    !isHeroMarqueeFolderPanel &&
    !/:hero_main(?:_\d+)?(?::|$)/.test(node.id) &&
    (node.label === 'Marquee' || isTextMarqueeSettingsPanelFields(fields));
  const isFeaturedCollectionSectionPanel =
    isFeaturedCollectionSectionNodeId(node.id) ||
    fields.some(isFeaturedCollectionPanelField) ||
    (node.label?.startsWith('Featured collection') ?? false);
  const featuredCollectionSettingsBase = featuredCollectionSettingsBaseFromNodeId(node.id);
  const featuredCollectionLayoutType = featuredCollectionSettingsBase
    ? readFeaturedCollectionSettingValue(
        values,
        themeConfig,
        featuredCollectionSettingsBase,
        'layoutType'
      )
    : '';
  const featuredCollectionCatalogVariant = featuredCollectionSettingsBase
    ? readFeaturedCollectionSettingValue(
        values,
        themeConfig,
        featuredCollectionSettingsBase,
        'catalogVariant'
      )
    : '';
  const featuredCollectionVariant = isFeaturedCollectionSectionPanel
    ? resolveFeaturedCollectionVariant({
        label: node.label,
        layoutType: featuredCollectionLayoutType,
        catalogVariant: featuredCollectionCatalogVariant,
        fields,
      })
    : 'default';
  const featuredCollectionHeaderLabel = isFeaturedCollectionSectionPanel
    ? resolveFeaturedCollectionLabel({
        label: node.label,
        layoutType: featuredCollectionLayoutType,
        catalogVariant: featuredCollectionCatalogVariant,
        fields,
      })
    : null;
  const isFeaturedCollectionGridPanel =
    isFeaturedCollectionSectionPanel && featuredCollectionVariant === 'grid';
  const isFeaturedCollectionEditorialPanel =
    isFeaturedCollectionSectionPanel && featuredCollectionVariant === 'editorial';
  const isFeaturedCollectionCarouselPanel =
    isFeaturedCollectionSectionPanel && featuredCollectionVariant === 'carousel';
  const isProductHotspotsPanel =
    node.label === 'Product hotspots' || isProductHotspotsSettingsPanelFields(fields);
  const isProductHotspotsHeadingPanel =
    node.label === 'Heading' &&
    (isProductHotspotsHeadingFieldNodeId(node.id) || isProductHotspotsHeadingPanelFields(fields));
  const isProductHotspotsHotspotBlockPanel =
    node.label === 'Hotspot' &&
    (isProductHotspotsHotspotBlockNodeId(node.id) || isProductHotspotsHotspotBlockFields(fields));
  const isRecommendedProductsPanel =
    node.label === 'Recommended products' || isRecommendedProductsSettingsPanelFields(fields);
  const isRecommendedProductsHeaderPanel =
    node.label === 'Header' &&
    (isRecommendedProductsHeaderNodeId(node.id) || isRecommendedProductsHeaderPanelFields(fields));
  const isCollectionListUnifiedPanel =
    (node.label?.startsWith('Collection list:') ?? false) ||
    isCollectionListUnifiedSettingsPanelFields(fields) ||
    isCollectionListBentoSettingsPanelFields(fields) ||
    isCollectionListCarouselSettingsPanelFields(fields) ||
    isCollectionListEditorialSettingsPanelFields(fields) ||
    isCollectionListGridSettingsPanelFields(fields);
  const isLayeredSlideshowPanel =
    node.label === 'Layered slideshow' || isLayeredSlideshowSettingsPanelFields(fields);
  const isSlideshowFullFramePanel =
    node.label === 'Slideshow: Full frame' || isSlideshowFullFrameSettingsPanelFields(fields);
  const isSlideshowInsetPanel =
    node.label === 'Slideshow: Inset' || isSlideshowInsetSettingsPanelFields(fields);
  const isSlideshowSlideBlockPanel =
    node.label === 'Slide' || isSlideshowSlideBlockFieldsOnly(fields);
  const isSlideshowInsetNestedBlockPanel =
    node.kind === 'block' &&
    /:block:[^:]+:nested:slide_(heading|text|button)$/.test(node.id);
  const isSlideshowInsetNestedTextPanel =
    node.kind === 'block' && /:block:[^:]+:nested:slide_text$/.test(node.id);
  const isSlideshowInsetNestedButtonPanel =
    node.kind === 'block' && /:block:[^:]+:nested:slide_button$/.test(node.id);
  const isSlideshowInsetSlideBlockPanel =
    node.kind === 'block' &&
    /(slideshow_(inset|full_frame)|layered_slideshow)[^:]*:block:[^:]+$/.test(node.id);
  const isCollectionLinkTitlePanel =
    node.label === 'Title' &&
    !isBlogPostsGridTitleBlockNodeId(node.id) &&
    !isBlogPostsGridCardTitleBlockNodeId(node.id) &&
    (isCollectionLinkTitleFieldNodeId(node.id) || isCollectionLinkTitlePanelFields(fields));
  const isCollectionLinkImagePanel =
    node.label === 'Image' &&
    !isBlogPostsGridCardImageBlockNodeId(node.id) &&
    (isCollectionLinkImageFieldNodeId(node.id) || isCollectionLinkImagePanelFields(fields));
  const isCollectionListHeaderTextPanel = isCollectionListHeaderTextPanelNode(node, fields);
  const isCollectionListCardPanel = isCollectionListCardPanelNode(node, fields);
  const isCollectionListCardImagePanel = isCollectionListCardImagePanelNode(node, fields);
  const isCollectionListCardTitlePanel = isCollectionListCardTitlePanelNode(node, fields);
  const isCollectionTileBlockPanel = isCollectionTileBlockFieldsOnly(fields);
  const isCollectionLinkBlockPanel =
    !isCollectionLinkTitlePanel &&
    !isCollectionLinkImagePanel &&
    !isCollectionListHeaderTextPanel &&
    !isCollectionListCardPanel &&
    !isCollectionListCardImagePanel &&
    !isCollectionListCardTitlePanel &&
    !isCollectionTileBlockPanel &&
    (node.label === 'Collection' ||
      node.label === 'Collection link' ||
      isCollectionLinkBlockNodeId(node.id) ||
      isCollectionLinkBlockFieldsOnly(fields));
  const isStorytellingCarouselCardTextBlockPanel =
    node.kind === 'block' &&
    (isStorytellingCarouselCardTextBlockNodeId(node.id) ||
      isStorytellingCarouselCardTextPanelFields(fields));
  const isStorytellingCarouselHeaderGroupPanel =
    node.kind === 'block' &&
    (isStorytellingCarouselHeaderGroupBlockNodeId(node.id) ||
      isStorytellingCarouselHeaderGroupPanelFields(fields));
  const isStorytellingCarouselHeaderBlockPanel =
    node.kind === 'block' &&
    !isStorytellingCarouselHeaderGroupPanel &&
    (isStorytellingCarouselHeaderBlockNodeId(node.id) ||
      isStorytellingCarouselHeaderPanelFields(fields));
  const isStorytellingCarouselContentGroupPanel =
    node.kind === 'block' &&
    (isStorytellingCarouselContentGroupBlockNodeId(node.id) ||
      isStorytellingCarouselContentGroupPanelFields(fields));
  const isStorytellingCarouselCardBlockPanel =
    node.kind === 'block' &&
    (isStorytellingCarouselCardBlockNodeId(node.id) ||
      isStorytellingCarouselCardPanelFields(fields));
  const isStorytellingCarouselCardImageBlockPanel =
    node.kind === 'block' &&
    (isStorytellingCarouselCardImageBlockNodeId(node.id) ||
      isStorytellingCarouselCardImagePanelFields(fields));
  const isStorytellingCarouselCardHeadingBlockPanel =
    node.kind === 'block' &&
    (isStorytellingCarouselCardHeadingBlockNodeId(node.id) ||
      isStorytellingCarouselCardHeadingPanelFields(fields));
  const isStorytellingCarouselPanel =
    !isStorytellingCarouselContentGroupPanel &&
    !isStorytellingCarouselHeaderGroupPanel &&
    !isStorytellingCarouselHeaderBlockPanel &&
    !isStorytellingCarouselCardBlockPanel &&
    !isStorytellingCarouselCardImageBlockPanel &&
    !isStorytellingCarouselCardTextBlockPanel &&
    !isStorytellingCarouselCardHeadingBlockPanel &&
    (node.label === 'Carousel' || isStorytellingCarouselSettingsPanelFields(fields));
  const isDividerPanel =
    node.label === 'Divider' || isDividerSettingsPanelFields(fields);
  const isBlogPostsGridSectionTitleBlockPanel =
    node.kind === 'block' &&
    (isBlogPostsGridTitleBlockNodeId(node.id) ||
      isBlogPostsGridSectionTitlePanelFields(fields));
  const isBlogPostsGridCardGroupPanel =
    node.kind === 'block' &&
    (isBlogPostsGridCardGroupBlockNodeId(node.id) ||
      isBlogPostsGridCardPanelFields(fields));
  const isBlogPostsGridCardImageBlockPanel =
    node.kind === 'block' &&
    (isBlogPostsGridCardImageBlockNodeId(node.id) ||
      isBlogPostsGridCardImagePanelFields(fields));
  const isBlogPostsGridCardTitleBlockPanel =
    node.kind === 'block' &&
    (isBlogPostsGridCardTitleBlockNodeId(node.id) ||
      isBlogPostsGridCardTitlePanelFields(fields));
  const isBlogPostsGridCardDetailsBlockPanel =
    node.kind === 'block' &&
    (isBlogPostsGridCardDetailsBlockNodeId(node.id) ||
      isBlogPostsGridCardDetailsPanelFields(fields));
  const isBlogPostsGridCardExcerptBlockPanel =
    node.kind === 'block' &&
    (isBlogPostsGridCardExcerptBlockNodeId(node.id) ||
      isBlogPostsGridCardExcerptPanelFields(fields));
  const isBlogPostsCarouselPanel =
    !isBlogPostsGridSectionTitleBlockPanel &&
    !isBlogPostsGridCardGroupPanel &&
    !isBlogPostsGridCardImageBlockPanel &&
    !isBlogPostsGridCardTitleBlockPanel &&
    !isBlogPostsGridCardDetailsBlockPanel &&
    !isBlogPostsGridCardExcerptBlockPanel &&
    (node.label === 'Blog posts: Carousel' || isBlogPostsCarouselSettingsPanelFields(fields));
  const isBlogPostsGridPanel =
    !isBlogPostsGridSectionTitleBlockPanel &&
    !isBlogPostsGridCardGroupPanel &&
    !isBlogPostsGridCardImageBlockPanel &&
    !isBlogPostsGridCardTitleBlockPanel &&
    !isBlogPostsGridCardDetailsBlockPanel &&
    !isBlogPostsGridCardExcerptBlockPanel &&
    !(node.label?.startsWith('Collection list:') ?? false) &&
    !isCollectionListGridSettingsPanelFields(fields) &&
    !isCollectionListUnifiedSettingsPanelFields(fields) &&
    (node.label === 'Blog posts: Grid' || isBlogPostsGridSettingsPanelFields(fields));
  const isBlogPostsEditorialPanel =
    !isBlogPostsGridSectionTitleBlockPanel &&
    !isBlogPostsGridCardGroupPanel &&
    !isBlogPostsGridCardImageBlockPanel &&
    !isBlogPostsGridCardTitleBlockPanel &&
    !isBlogPostsGridCardDetailsBlockPanel &&
    !isBlogPostsGridCardExcerptBlockPanel &&
    (node.label === 'Blog posts: Editorial' || isBlogPostsEditorialSettingsPanelFields(fields));
  const faqHeadingBlockPanel = isFaqHeadingCollectionTitlePanelNode(node);
  const isHeadingBlockPanel =
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isStorytellingCarouselCardHeadingBlockPanel &&
    !faqHeadingBlockPanel &&
    node.kind === 'block' &&
    (node.label === 'Heading' ||
      isHeadingBlockNodeId(node.id) ||
      isHeadingBlockPanelFields(fields));
  const isFaqHeadingCollectionTitlePanel = node.kind === 'block' && faqHeadingBlockPanel;
  const isCollectionTitleBlockPanel =
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isHeadingBlockPanel &&
    node.kind === 'block' &&
    (node.label === 'Collection title' ||
      isCollectionTitleNestedNodeId(node.id) ||
      isCollectionTitlePanelFields(fields));
  const isViewAllButtonBlockPanel =
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isHeadingBlockPanel &&
    !isCollectionTitleBlockPanel &&
    node.kind === 'block' &&
    (node.label === 'View all button' ||
      isViewAllButtonNestedNodeId(node.id) ||
      isViewAllButtonPanelFields(fields));
  const isFeaturedCollectionHeaderBlockPanel =
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isHeadingBlockPanel &&
    !isCollectionTitleBlockPanel &&
    !isViewAllButtonBlockPanel &&
    node.kind === 'block' &&
    (isFeaturedCollectionHeaderBlockNodeId(node.id) ||
      (node.label === 'Header' && isFeaturedCollectionHeaderPanelFields(fields)));
  const isFaqAccordionBlockPanel =
    node.kind === 'block' &&
    (node.label === 'Accordion' ||
      isFaqAccordionBlockNodeId(node.id) ||
      isFaqAccordionPanelFields(fields));
  const isFaqAccordionRowBlockPanel =
    node.kind === 'block' &&
    (node.label === 'Accordion row' ||
      isFaqAccordionRowNestedNodeId(node.id) ||
      isFaqAccordionRowPanelFields(fields));
  const isFaqAccordionRowTextBlockPanel =
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    node.kind === 'block' &&
    isFaqAccordionRowTextNestedNodeId(node.id) &&
    (node.label === 'Text' || isTextBlockPanelFields(fields));
  const isHeroTextBlockPanel =
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isFaqAccordionRowTextBlockPanel &&
    node.kind === 'block' &&
    isHeroTextBlockNodeId(node.id) &&
    (node.label === 'Text' || isTextBlockPanelFields(fields));
  const isHeroButtonBlockPanel =
    !isSlideshowInsetNestedBlockPanel &&
    node.kind === 'block' &&
    (node.label === 'Button' ||
      isHeroButtonBlockNodeId(node.id) ||
      isHeroButtonPanelFields(fields));
  const isAnnouncementBlockPanel =
    !isHeaderLogoBlockPanel &&
    !isHeaderMenuBlockPanel &&
    !isHeadingBlockPanel &&
    !isCollectionTitleBlockPanel &&
    !isViewAllButtonBlockPanel &&
    !isFaqAccordionBlockPanel &&
    !isFaqAccordionRowBlockPanel &&
    !isFaqAccordionRowTextBlockPanel &&
    !isHeroTextBlockPanel &&
    !isIconsWithTextBlockPanel &&
    !isMulticolumnBlockPanel &&
    !isMulticolumnColumnBlockPanel &&
    !isMulticolumnDescriptionBlockPanel &&
    !isMarqueeTextBlockPanel &&
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isHeroButtonBlockPanel &&
    (isAnnouncementBlockNodeId(node.id) ||
      node.label === 'Announcement' ||
      (fields.length > 0 && isAnnouncementBlockPanelFields(fields)));
  const isAnnouncementBarPanel =
    isAnnouncementLayoutNodeId(node.id) ||
    node.label === 'Announcement bar' ||
    isAnnouncementSettingsPanelFields(fields);
  const isFooterPanel =
    !isFooterUtilitiesPanel &&
    !isContactFormPanel &&
    !isEmailSignupPanel &&
    !isCustomSectionPanel &&
    !isFeaturedProductPanel &&
    !isProductHighlightPanel &&
    !isEditorialSectionPanel &&
    !isEditorialMediaBlockPanel &&
    !isEditorialContentGroupPanel &&
    !isEditorialNestedGroupPanel &&
    !isEditorialCaptionBlockPanel &&
    !isEditorialHeadingBlockPanel &&
    !isEditorialTextBlockPanel &&
    !isEditorialButtonBlockPanel &&
    !isEditorialJumboPanel &&
    !isImageComparePanel &&
    !isImageWithTextPanel &&
    !isStorytellingLogoPanel &&
    !isStorytellingVideoPanel &&
    !isFaqPanel &&
    !isIconsWithTextPanel &&
    !isMulticolumnPanel &&
    !isPullQuotePanel &&
    !isRichTextPanel &&
    !isTextMarqueePanel &&
    !isFeaturedCollectionCarouselPanel &&
    !isFeaturedCollectionEditorialPanel &&
    !isBlogPostsCarouselPanel &&
    !isBlogPostsEditorialPanel &&
    !isBlogPostsGridPanel &&
    !isBlogPostsGridSectionTitleBlockPanel &&
    !isBlogPostsGridCardGroupPanel &&
    !isBlogPostsGridCardImageBlockPanel &&
    !isBlogPostsGridCardTitleBlockPanel &&
    !isBlogPostsGridCardDetailsBlockPanel &&
    !isBlogPostsGridCardExcerptBlockPanel &&
    !isProductHotspotsPanel &&
    !isProductHotspotsHeadingPanel &&
    !isProductHotspotsHotspotBlockPanel &&
    !isRecommendedProductsHeaderPanel &&
    !isRecommendedProductsPanel &&
    !isCollectionLinksSpotlightPanel &&
    !isCollectionListUnifiedPanel &&
    !isLayeredSlideshowPanel &&
    !isSlideshowFullFramePanel &&
    !isSlideshowInsetPanel &&
    !isStorytellingCarouselPanel &&
    !isDividerPanel &&
    !isAnnouncementBarPanel &&
    (node.label === 'Footer' || isFooterSettingsPanelFields(fields));
  const isHeroPanel =
    !isLargeLogoPanel &&
    !isSplitShowcasePanel &&
    (isHeroSectionSettingsNode(node) || isHeroSettingsPanelFields(fields));
  const useGrouped =
    !isHeaderSectionPanel &&
    !isLargeLogoPanel &&
    !isSplitShowcasePanel &&
    !faqHeadingBlockPanel &&
    !isFaqHeadingCollectionTitlePanel &&
    !isHeadingBlockPanel &&
    !isCollectionTitleBlockPanel &&
    !isViewAllButtonBlockPanel &&
    !isFaqAccordionBlockPanel &&
    !isFaqAccordionRowBlockPanel &&
    !isFaqAccordionRowTextBlockPanel &&
    !isHeroTextBlockPanel &&
    !isHeroMarqueeFolderPanel &&
    !isHeroMarqueeTextPanel &&
    !isHeroMarqueeSpacerPanel &&
    !isIconsWithTextBlockPanel &&
    !isMulticolumnBlockPanel &&
    !isMulticolumnColumnBlockPanel &&
    !isMulticolumnDescriptionBlockPanel &&
    !isMarqueeTextBlockPanel &&
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isAnnouncementBlockPanel &&
    !isAnnouncementBarPanel &&
    !isFooterPanel &&
    !isFooterUtilitiesPanel &&
    !isContactFormPanel &&
    !isEmailSignupPanel &&
    !isCustomSectionPanel &&
    !isFeaturedProductPanel &&
    !isProductHighlightPanel &&
    !isEditorialSectionPanel &&
    !isEditorialMediaBlockPanel &&
    !isEditorialContentGroupPanel &&
    !isEditorialNestedGroupPanel &&
    !isEditorialCaptionBlockPanel &&
    !isEditorialHeadingBlockPanel &&
    !isEditorialTextBlockPanel &&
    !isEditorialButtonBlockPanel &&
    !isEditorialJumboPanel &&
    !isImageComparePanel &&
    !isImageWithTextPanel &&
    !isStorytellingLogoPanel &&
    !isStorytellingVideoPanel &&
    !isFaqPanel &&
    !isIconsWithTextPanel &&
    !isMulticolumnPanel &&
    !isPullQuotePanel &&
    !isRichTextPanel &&
    !isTextMarqueePanel &&
    !isFeaturedCollectionCarouselPanel &&
    !isFeaturedCollectionEditorialPanel &&
    !isBlogPostsCarouselPanel &&
    !isBlogPostsEditorialPanel &&
    !isBlogPostsGridPanel &&
    !isBlogPostsGridSectionTitleBlockPanel &&
    !isBlogPostsGridCardGroupPanel &&
    !isBlogPostsGridCardImageBlockPanel &&
    !isBlogPostsGridCardTitleBlockPanel &&
    !isBlogPostsGridCardDetailsBlockPanel &&
    !isBlogPostsGridCardExcerptBlockPanel &&
    !isProductHotspotsPanel &&
    !isProductHotspotsHeadingPanel &&
    !isProductHotspotsHotspotBlockPanel &&
    !isRecommendedProductsHeaderPanel &&
    !isRecommendedProductsPanel &&
    !isCollectionLinksSpotlightPanel &&
    !isCollectionListUnifiedPanel &&
    !isLayeredSlideshowPanel &&
    !isSlideshowFullFramePanel &&
    !isSlideshowInsetPanel &&
    !isStorytellingCarouselPanel &&
    !isDividerPanel &&
    !isHeroPanel &&
    fields.some((f) => Boolean(f.group));

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#e1e1e1] bg-[#f6f6f7] px-2 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#005bd3] px-2 py-1.5 text-white">
          {isCollectionLinkTitlePanel ? (
            <svg className="h-4 w-4 shrink-0 opacity-90" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <text x="8" y="12" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
                T
              </text>
            </svg>
          ) : isCollectionLinkImagePanel || isFeaturedProductMediaBlockPanel ? (
            <PhotoIcon className="h-4 w-4 shrink-0 opacity-90" />
          ) : (
            <SectionIcon className="h-4 w-4 shrink-0 opacity-90" />
          )}
          <span className="truncate text-[13px] font-semibold">
            {productHighlightHeaderLabel ?? featuredCollectionHeaderLabel ?? node.label}
          </span>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-[#ededed]"
          title="More actions"
          aria-label="More actions"
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-[#ededed]"
          title="Close settings"
          aria-label="Close settings"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isHeroMarqueeFolderPanel ? (
          <HeroMarqueeFolderSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isHeroMarqueeSpacerPanel || isSpacerBlockPanel ? (
          <SpacerBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isHeroMarqueeTextPanel || isSplitShowcaseTextBlockPanel || isHeroBottomTextBlockPanel ? (
          <TextBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isSplitShowcaseGroupPanel || isHeroBottomGroupPanel ? (
          <MulticolumnColumnBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFaqAccordionBlockPanel ? (
          <FaqAccordionSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isFaqAccordionRowBlockPanel ? (
          <FaqAccordionRowSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isFaqHeadingCollectionTitlePanel ? (
          <FaqHeadingCollectionTitleSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isHeaderLogoBlockPanel ? (
          <HeaderLogoBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isHeaderMenuBlockPanel ? (
          <HeaderMenuBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
            onStoreMenuSelect={onStoreMenuSelect}
          />
        ) : isFeaturedProductAcceleratedCheckoutBlockPanel ? (
          <FeaturedProductNoCustomSettingsPanel />
        ) : isFeaturedProductQuantityBlockPanel ? (
          <FeaturedProductQuantityGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductAddToCartBlockPanel ? (
          <FeaturedProductAddToCartGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : fields.length === 0 ? (
          <p className="text-[13px] text-gray-500">No settings for this item.</p>
        ) : isAnnouncementBlockPanel ? (
          <AnnouncementBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isAnnouncementBarPanel ? (
          <AnnouncementBarGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isHeaderSectionPanel ? (
          <HeaderSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isCopyrightBlockPanel ? (
          <div className="divide-y divide-[#e1e1e1]">
            {(() => {
              const showPoweredBy = fields.find((f) => f.path.endsWith('showPoweredBy'));
              const manageStoreName = fields.find((f) => f.path.endsWith('manageStoreName'));
              const fontSize = fields.find((f) => f.path.endsWith('fontSize'));
              const textCase = fields.find((f) => f.path.endsWith('textCase'));
              return (
                <>
                  {showPoweredBy ? (
                    <div className="px-1 py-3">
                      <ToggleSwitchFieldRow
                        field={showPoweredBy}
                        values={values}
                        onFieldChange={onFieldChange}
                      />
                    </div>
                  ) : null}
                  {manageStoreName ? (
                    <div className="px-1 py-2">
                      <InfoLinkFieldRow
                        label={manageStoreName.label}
                        href={manageStoreName.placeholder || '/settings/general'}
                        description={manageStoreName.description}
                      />
                    </div>
                  ) : null}
                  {fontSize ? (
                    <div className="px-1 py-3">
                      <SelectFieldRow field={fontSize} values={values} onFieldChange={onFieldChange} />
                    </div>
                  ) : null}
                  {textCase ? (
                    <div className="px-1 py-3">
                      <SegmentedFieldRow field={textCase} values={values} onFieldChange={onFieldChange} />
                    </div>
                  ) : null}
                </>
              );
            })()}
          </div>
        ) : isSocialLinksBlockPanel ? (
          <div className="divide-y divide-[#e1e1e1]">
            <div className="px-1 py-2">
              <div className="space-y-1">
                {[
                  'facebookUrl',
                  'instagramUrl',
                  'youtubeUrl',
                  'tiktokUrl',
                  'twitterUrl',
                  'threadsUrl',
                  'linkedinUrl',
                  'blueskyUrl',
                  'snapchatUrl',
                  'pinterestUrl',
                  'tumblrUrl',
                  'vimeoUrl',
                  'customUrl',
                ]
                  .map((key) => fields.find((f) => f.path.endsWith(key)))
                  .filter((f): f is EditorFieldDef => Boolean(f))
                  .map((field) => (
                    <LinkFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  ))}
              </div>
            </div>
          </div>
        ) : isEmailSignupHeadingBlockPanel ? (
          <EmailSignupHeadingBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isEmailSignupTextBlockPanel ? (
          <EmailSignupTextBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isEmailSignupFormBlockPanel ? (
          <EmailSignupFormBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isEmailSignupSectionBlockPanel ? (
          <EmailSignupSectionBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareContentGroupPanel ? (
          <ImageCompareContentGroupSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareTextGroupPanel ? (
          <ImageCompareTextGroupGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareButtonsGroupPanel ? (
          <ImageCompareButtonsGroupGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareSliderBlockPanel ? (
          <ComparisonSliderBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareButtonBlockPanel ? (
          <RichTextButtonSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            labelKey={imageCompareButtonPanelKeysForNodeId(node.id)?.labelKey ?? 'button1Label'}
            linkKey={imageCompareButtonPanelKeysForNodeId(node.id)?.linkKey ?? 'button1Url'}
            openTabKey={imageCompareButtonPanelKeysForNodeId(node.id)?.openTabKey ?? 'button1OpenInNewTab'}
            styleKey={imageCompareButtonPanelKeysForNodeId(node.id)?.styleKey ?? 'button1Style'}
            desktopWidthKey={
              imageCompareButtonPanelKeysForNodeId(node.id)?.desktopWidthKey ?? 'button1DesktopWidth'
            }
            desktopCustomWidthKey={
              imageCompareButtonPanelKeysForNodeId(node.id)?.desktopCustomWidthKey ??
              'button1DesktopCustomWidth'
            }
            mobileWidthKey={
              imageCompareButtonPanelKeysForNodeId(node.id)?.mobileWidthKey ?? 'button1MobileWidth'
            }
            mobileCustomWidthKey={
              imageCompareButtonPanelKeysForNodeId(node.id)?.mobileCustomWidthKey ??
              'button1MobileCustomWidth'
            }
          />
        ) : isImageCompareHeadingBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="heading"
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareSubheadingBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="subheading"
            onFieldChange={onFieldChange}
          />
        ) : isEmailSignupFooterBlockPanel ? (
          <EmailSignupBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isHeadingBlockPanel ? (
          <HeadingBlockSettingsPanel
            nodeId={node.id}
            nodeLabel={node.label}
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isRichTextButtonPanel ? (
          <RichTextButtonSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isRichTextTextPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="text"
            onFieldChange={onFieldChange}
          />
        ) : isRichTextHeadingPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="heading"
            onFieldChange={onFieldChange}
          />
        ) : isRichTextBlockPanel ? (
          <RichTextBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isFeaturedCollectionHeaderBlockPanel ? (
          <FeaturedCollectionHeaderGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isCollectionTitleBlockPanel ? (
          <CollectionTitleBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isViewAllButtonBlockPanel ? (
          <ViewAllButtonSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isFaqAccordionRowTextBlockPanel ||
          isHeroTextBlockPanel ||
          isCollectionListHeaderTextPanel ? (
          <TextBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isIconsWithTextBlockPanel ? (
          <IconsWithTextBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isMarqueeTextBlockPanel ? (
          <MarqueeTextBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isMulticolumnDescriptionBlockPanel ? (
          <MulticolumnDescriptionBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isMulticolumnColumnBlockPanel ? (
          <MulticolumnColumnBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isMulticolumnBlockPanel ? (
          <MulticolumnBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isHeroButtonBlockPanel ? (
          <HeroButtonSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFaqPanel ? (
          <FaqGroupedSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isHeroPanel ? (
          <HeroGroupedSettingsPanel fields={fields} values={values} colorPalette={colorPalette} onFieldChange={onFieldChange} />
        ) : isLargeLogoPanel ? (
          <LargeLogoGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isSplitShowcasePanel ? (
          <SplitShowcaseGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isContactFormTextBlockPanel ? (
          <ContactFormTextBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isContactFormFormGroupPanel ? (
          <ContactFormFormGroupSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isContactFormSubmitButtonPanel ? (
          <ContactFormSubmitButtonSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isContactFormBlockPanel ? (
          <ContactFormBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isContactFormPanel ? (
          <ContactFormGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isEmailSignupPanel ? (
          <EmailSignupGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageComparePanel ? (
          <ImageCompareGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isCustomSectionPanel ? (
          <CustomSectionGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductMediaBlockPanel ? (
          <FeaturedProductMediaGroupedSettingsPanel
            fields={
              prepareFeaturedProductMediaSettingsNode({ id: node.id, label: node.label, kind: 'block', fields })
                .fields ?? fields
            }
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightMediaBlockPanel ? (
          <ProductHighlightMediaGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightProductBlockPanel ? (
          <ProductHighlightProductGroupedSettingsPanel />
        ) : isFeaturedProductDetailsBlockPanel ? (
          <FeaturedProductDetailsGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionListSectionHeaderPanel ? (
          <CollectionListHeaderGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductHeaderBlockPanel ? (
          <FeaturedProductHeaderGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridSectionTitleBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="heading"
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductHeaderTitleBlockPanel ? (
          <FeaturedProductHeaderTitleGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isProductCardBlockPanel ? (
          <ProductCardGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isProductCardMediaPanel ? (
          <ProductCardMediaGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductCardTitlePanel ? (
          <ProductCardTitleGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isProductCardPricePanel ? (
          <ProductCardPriceGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductHeaderPriceBlockPanel ? (
          <FeaturedProductHeaderPriceGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductReviewStarsBlockPanel ? (
          <FeaturedProductReviewStarsGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductVariantPickerBlockPanel ? (
          <FeaturedProductVariantPickerGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductBuyButtonsBlockPanel ? (
          <FeaturedProductBuyButtonsGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductPanel ? (
          <FeaturedProductGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightProductTitleBlockPanel ? (
          <ProductHighlightProductTitleGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightProductPriceBlockPanel ? (
          <ProductHighlightProductPriceGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightProductImageBlockPanel ? (
          <ProductHighlightProductImageGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightProductSwatchesBlockPanel ? (
          <ProductHighlightProductSwatchesGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightPanel ? (
          <ProductHighlightGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isRecommendedProductsHeaderPanel ? (
          <RecommendedProductsHeaderSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isProductHotspotsHeadingPanel ? (
          <ProductHotspotsHeadingSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isProductHotspotsHotspotBlockPanel ? (
          <ProductHotspotsHotspotBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHotspotsPanel ? (
          <ProductHotspotsGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isRecommendedProductsPanel ? (
          <RecommendedProductsGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionLinksSpotlightPanel ? (
          <CollectionLinksSpotlightGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            onCollectionLinksApply={onCollectionLinksApply}
          />
        ) : isCollectionListUnifiedPanel ? (
          <CollectionListGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
            onCollectionLinksApply={onCollectionLinksApply}
          />
        ) : isLayeredSlideshowPanel ? (
          <LayeredSlideshowGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowFullFramePanel ? (
          <SlideshowFullFrameGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowInsetPanel ? (
          <SlideshowInsetGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowInsetNestedTextPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="body"
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowInsetNestedButtonPanel ? (
          <RichTextButtonSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            linkKey="buttonHref"
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowInsetSlideBlockPanel ? (
          <SlideshowInsetSlideBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowSlideBlockPanel ? (
          <SlideshowSlideBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionLinkTitlePanel ? (
          <CollectionLinkTitleSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionListCardPanel ? (
          <CollectionListCardGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isCollectionListCardImagePanel ? (
          <CollectionListCardImageSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionListCardTitlePanel ? (
          <CollectionListCardTitleSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isCollectionLinkImagePanel ? (
          <CollectionLinkImageSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionTileBlockPanel ? (
          <CollectionTileBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionLinkBlockPanel ? (
          <CollectionLinkBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialMediaBlockPanel ? (
          <EditorialMediaBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialContentGroupPanel ? (
          <EditorialContentGroupGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialNestedGroupPanel ? (
          <EditorialGroupGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialCaptionBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="subheading"
            onFieldChange={onFieldChange}
          />
        ) : isEditorialHeadingBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="heading"
            onFieldChange={onFieldChange}
          />
        ) : isEditorialTextBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="description"
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselCardTextBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="description"
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselCardHeadingBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="title"
            onFieldChange={onFieldChange}
          />
        ) : isEditorialButtonBlockPanel ? (
          <RichTextButtonSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            labelKey="linkLabel"
            linkKey="linkUrl"
            openTabKey="linkOpenInNewTab"
            linkTextColorKey="linkTextColor"
            styleKey="linkStyle"
            customBackgroundKey="linkCustomBackground"
            customTextKey="linkCustomText"
            desktopWidthKey="linkDesktopWidth"
            desktopCustomWidthKey="linkDesktopCustomWidth"
            mobileWidthKey="linkMobileWidth"
            mobileCustomWidthKey="linkMobileCustomWidth"
            onFieldChange={onFieldChange}
          />
        ) : isEditorialSectionPanel ? (
          <EditorialGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialJumboMediaBlockPanel ? (
          <EditorialJumboMediaBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialJumboContentGroupPanel ? (
          <EditorialJumboContentGroupGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialJumboJumboTextBlockPanel ? (
          <EditorialJumboJumboTextBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialJumboPanel ? (
          <EditorialJumboGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageWithTextImageBlockPanel ? (
          <ImageWithTextImageBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselHeaderGroupPanel ? (
          <StorytellingCarouselHeaderGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselHeaderBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="heading"
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselContentGroupPanel ? (
          <StorytellingCarouselContentGroupGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselCardBlockPanel ? (
          <StorytellingCarouselCardGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselCardImageBlockPanel ? (
          <StorytellingCarouselImageBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridCardGroupPanel ? (
          <BlogPostsGridCardGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridCardImageBlockPanel ? (
          <BlogPostsGridImageBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridCardTitleBlockPanel ? (
          <BlogPostsGridCardTitleSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridCardDetailsBlockPanel ? (
          <BlogPostsGridDetailsBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridCardExcerptBlockPanel ? (
          <BlogPostsGridExcerptBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageWithTextHeadingBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="heading"
            onFieldChange={onFieldChange}
          />
        ) : isImageWithTextTextBlockPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="description"
            onFieldChange={onFieldChange}
          />
        ) : isImageWithTextButtonBlockPanel ? (
          <RichTextButtonSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            labelKey="buttonLabel"
            linkKey="buttonUrl"
            openTabKey="buttonOpenInNewTab"
            onFieldChange={onFieldChange}
          />
        ) : isImageWithTextGroupPanel ? (
          <ImageWithTextGroupGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isImageWithTextPanel ? (
          <ImageWithTextGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isLargeLogoBlockPanel ? (
          <LargeLogoBlockGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingLogoPanel ? (
          <StorytellingLogoGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingVideoCaptionGroupPanel ? (
          <StorytellingVideoCaptionGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingVideoMediaBlockPanel ? (
          <StorytellingVideoMediaBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingVideoCaptionTextPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="caption"
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingVideoCaptionButtonPanel ? (
          <RichTextButtonSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            labelKey="linkLabel"
            linkKey="linkUrl"
            openTabKey="linkOpenInNewTab"
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingVideoBlockPanel ? (
          <StorytellingVideoContentBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingVideoPanel ? (
          <StorytellingVideoGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isIconsWithTextPanel ? (
          <IconsWithTextGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isMulticolumnPanel ? (
          <MulticolumnGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isPullQuotePanel ? (
          <PullQuoteGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isRichTextPanel ? (
          <RichTextGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isHeroMarqueeFolderPanel ? (
          <HeroMarqueeFolderSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isTextMarqueePanel ? (
          <TextMarqueeGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedCollectionGridPanel ? (
          <FeaturedCollectionGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            variant="grid"
            colorPalette={colorPalette}
          />
        ) : isFeaturedCollectionEditorialPanel ? (
          <FeaturedCollectionGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            variant="editorial"
            colorPalette={colorPalette}
          />
        ) : isFeaturedCollectionCarouselPanel ? (
          <FeaturedCollectionGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            variant="carousel"
            colorPalette={colorPalette}
          />
        ) : isBlogPostsCarouselPanel ? (
          <BlogPostsCarouselGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsEditorialPanel ? (
          <BlogPostsEditorialGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridPanel ? (
          <BlogPostsGridGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselPanel ? (
          <StorytellingCarouselGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isDividerPanel ? (
          <DividerGroupedSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            onFieldChange={onFieldChange}
          />
        ) : isFooterUtilitiesPanel ? (
          <FooterUtilitiesGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFooterPanel ? (
          <FooterGroupedSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isPullQuoteButtonPanel ? (
          <RichTextButtonSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            labelKey="linkLabel"
            linkKey="linkUrl"
            openTabKey="linkOpenInNewTab"
            onFieldChange={onFieldChange}
          />
        ) : isPullQuoteTextPanel ? (
          <RichTextTypographyBlockSettingsPanel
            fields={fields}
            values={values}
            colorPalette={colorPalette}
            contentKey="quote"
            onFieldChange={onFieldChange}
          />
        ) : useGrouped ? (
          <GroupedSettingsFields
            nodeId={node.id}
            nodeLabel={node.label}
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : isFaqHeadingCollectionTitlePanel ? (
          <FaqHeadingCollectionTitleSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            colorPalette={colorPalette}
          />
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            ))}
          </div>
        )}
      </div>

      {canRemoveSection || canRemoveBlock ? (
        <div className="shrink-0 border-t border-[#e1e1e1] bg-white p-3">
          <button
            type="button"
            onClick={canRemoveBlock ? onRemoveBlock : onRemoveSection}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent py-2 text-[13px] font-medium text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            {canRemoveBlock ? 'Remove block' : 'Remove section'}
          </button>
        </div>
      ) : null}
    </div>
  );
};

const ThemeSectionSettingsPanel = memo(ThemeSectionSettingsPanelInner);
export { ThemeSectionSettingsPanel };
export default ThemeSectionSettingsPanel;
