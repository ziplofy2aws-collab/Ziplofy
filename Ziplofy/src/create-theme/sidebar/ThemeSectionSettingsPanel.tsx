import React, { memo, useMemo, useRef, useState } from 'react';
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
import { ThemeEditorLinkField } from '../../components/theme-editor/ThemeEditorLinkField';
import { ThemeEditorRichTextField } from '../../components/theme-editor/ThemeEditorRichTextField';
import { ThemeEditorImagePickerModal } from './ThemeEditorImagePickerModal';
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
  isHeadingBlockPanelFields,
  isHeadingBlockNodeId,
  prepareHeadingBlockSettingsNode,
  resolveHeadingTypographyField,
} from './theme-editor-heading-block-panel.utils';
import {
  isHeroButtonBlockNodeId,
  isHeroButtonPanelFields,
} from './theme-editor-hero-button-panel.utils';
import { HeroButtonSettingsPanel } from './theme-editor-hero-button-settings-panel';
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
} from './theme-editor-contact-form-block-panel.utils';
import {
  isEmailSignupSectionBlockFieldsOnly,
  isEmailSignupSectionBlockNodeId,
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
} from './theme-editor-product-highlight-panel.utils';
import {
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
  isCollectionListSectionHeaderBlockNodeId,
  isCollectionListSectionHeaderPanelFields,
} from './theme-editor-collection-list-header-panel.utils';
import {
  isFeaturedProductAcceleratedCheckoutNestedNodeId,
} from './theme-editor-featured-product-accelerated-checkout-panel.utils';
import { isFeaturedProductQuantityNestedNodeId } from './theme-editor-featured-product-quantity-panel.utils';
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
import { isEditorialJumboSettingsPanelFields } from './theme-editor-editorial-jumbo-panel.utils';
import {
  groupImageCompareContentGroupPanelFields,
  IMAGE_COMPARE_CONTENT_GROUP_PANEL_GROUP_ORDER,
  isImageCompareContentGroupFieldsOnly,
  pickImageCompareContentGroupField,
  prepareImageCompareContentGroupSettingsNode,
} from './theme-editor-image-compare-content-group-panel.utils';
import {
  isImageCompareContentBlockFieldsOnly,
  isImageCompareContentGroupNodeId,
  isImageCompareSectionBlockNodeId,
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
  isStorytellingVideoMediaBlockNodeId,
} from './theme-editor-storytelling-video-block-panel.utils';
import {
  groupFaqPanelFields,
  FAQ_PANEL_GROUP_ORDER,
  FAQ_LAYOUT_FIELD_ORDER,
  FAQ_APPEARANCE_FIELD_ORDER,
  sortFaqGroupFields,
  isFaqSettingsPanelFields,
} from './theme-editor-faq-panel.utils';
import {
  FAQ_ACCORDION_GENERAL_FIELD_ORDER,
  FAQ_ACCORDION_HEADING_PRESET_OPTIONS,
  FAQ_ACCORDION_PADDING_FIELD_ORDER,
  FAQ_ACCORDION_PANEL_GROUP_ORDER,
  groupFaqAccordionPanelFields,
  isFaqAccordionBlockNodeId,
  isFaqAccordionPanelFields,
} from './theme-editor-faq-accordion-block-panel.utils';
import {
  isFaqAccordionRowNestedNodeId,
  isFaqAccordionRowPanelFields,
} from './theme-editor-faq-accordion-row-panel.utils';
import {
  groupTextBlockPanelFields,
  isFaqAccordionRowTextNestedNodeId,
  isTextBlockPanelFields,
  TEXT_BLOCK_PANEL_GROUP_ORDER,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
} from './theme-editor-faq-accordion-row-text-panel.utils';
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
  isMulticolumnSettingsPanelFields,
} from './theme-editor-multicolumn-panel.utils';
import {
  groupPullQuotePanelFields,
  PULL_QUOTE_PANEL_GROUP_ORDER,
  isPullQuoteSettingsPanelFields,
} from './theme-editor-pull-quote-panel.utils';
import {
  groupRichTextPanelFields,
  RICH_TEXT_PANEL_GROUP_ORDER,
  isRichTextBlockField,
  isRichTextBlockNodeId,
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
} from './theme-editor-blog-posts-grid-panel.utils';
import {
  groupStorytellingCarouselPanelFields,
  STORYTELLING_CAROUSEL_PANEL_GROUP_ORDER,
  isStorytellingCarouselSettingsPanelFields,
} from './theme-editor-storytelling-carousel-panel.utils';
import {
  groupProductHotspotsPanelFields,
  PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER,
  isProductHotspotsSettingsPanelFields,
} from './theme-editor-product-hotspots-panel.utils';
import {
  groupRecommendedProductsPanelFields,
  RECOMMENDED_PRODUCTS_PANEL_GROUP_ORDER,
  isRecommendedProductsSettingsPanelFields,
} from './theme-editor-recommended-products-panel.utils';
import {
  groupCollectionLinksSpotlightPanelFields,
  COLLECTION_LINKS_SPOTLIGHT_PANEL_GROUP_ORDER,
  isCollectionLinksSpotlightSettingsPanelFields,
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
  groupFeaturedCollectionPanelFields,
  isFeaturedCollectionCarouselSettingsPanelFields,
  isFeaturedCollectionEditorialSettingsPanelFields,
  isFeaturedCollectionGridSettingsPanelFields,
  filterFeaturedCollectionPanelFieldsForVariant,
} from './theme-editor-featured-collection-panel.utils';
import {
  ANNOUNCEMENT_PANEL_GROUP_ORDER,
  groupAnnouncementPanelFields,
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
  'scheme-1': { bg: '#111827', fg: '#f9fafb', accent: '#60a5fa' },
  'scheme-2': { bg: '#1e3a5f', fg: '#eff6ff', accent: '#93c5fd' },
  'scheme-3': { bg: '#431407', fg: '#fff7ed', accent: '#fb923c' },
  'scheme-4': { bg: '#4c1d95', fg: '#f5f3ff', accent: '#c4b5fd' },
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
              Select
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
          <button
            type="button"
            className="mt-2 text-[12px] text-[#005bd3] hover:underline"
            onClick={() => setPickerOpen(true)}
          >
            Explore free images
          </button>
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

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="relative min-w-[140px]">
        <div
          className="pointer-events-none absolute left-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-[#e1e1e1] bg-white px-1 py-0.5"
          aria-hidden
        >
          <span className="text-[10px] font-semibold" style={{ color: swatch.fg }}>
            Aa
          </span>
          <span className="h-3 w-3 rounded-sm" style={{ background: swatch.bg }} />
          <span className="h-3 w-3 rounded-sm" style={{ background: swatch.accent }} />
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
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const id = fieldInputId(field.path);
  const value = fieldValueAsString(values, field);

  return (
    <ThemeEditorRichTextField
      id={id}
      label={field.label}
      value={value}
      placeholder={field.placeholder}
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
  const id = fieldInputId(field.path);
  const raw = fieldValueAsString(values, field) || '#00000026';
  const swatch = /^#[0-9a-fA-F]{6,8}$/.test(raw) ? raw.slice(0, 7) : '#000000';

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <span className="text-[13px] text-gray-800">{field.label}</span>
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={`${id}-picker`}
          className="h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-full border border-[#c9cccf] shadow-sm"
          style={{ background: swatch }}
        >
          <input
            id={`${id}-picker`}
            type="color"
            value={swatch}
            className="sr-only"
            onChange={(e) => onFieldChange(field.path, 'color', e.target.value)}
          />
        </label>
        <input
          id={id}
          type="text"
          value={raw}
          onChange={(e) => onFieldChange(field.path, 'color', e.target.value)}
          className="w-[108px] rounded-lg border border-[#c9cccf] bg-white px-2 py-1.5 text-[12px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        />
        <button
          type="button"
          title="Connect dynamic source"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-500 shadow-sm hover:bg-gray-50"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const overlayOn = fields.some(
    (f) => f.path.endsWith('mediaOverlay') && Boolean(values[f.path])
  );
  const overlayStyleField = fields.find((f) => f.path.endsWith('overlayStyle'));
  const isGradient =
    overlayStyleField &&
    (fieldValueAsString(values, overlayStyleField) || 'solid') === 'gradient';

  const visible = fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    if (key === 'overlayColor' || key === 'overlayStyle') return overlayOn;
    if (key === 'overlayGradientDirection') return overlayOn && isGradient;
    return true;
  });

  const ordered = [...visible].sort((a, b) => {
    const rank: Record<string, number> = {
      colorScheme: 0,
      mediaOverlay: 1,
      overlayColor: 2,
      overlayStyle: 3,
      overlayGradientDirection: 4,
      blurredReflection: 5,
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
  const ordered = [...fields].sort((a, b) => {
    const ka = a.path.split('.').pop() ?? '';
    const kb = b.path.split('.').pop() ?? '';
    const ia = HEADING_PADDING_ORDER.indexOf(ka as (typeof HEADING_PADDING_ORDER)[number]);
    const ib = HEADING_PADDING_ORDER.indexOf(kb as (typeof HEADING_PADDING_ORDER)[number]);
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

function HeadingAppearanceSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const background = fields.find((f) => f.path.endsWith('headingBackgroundEnabled'));
  const backgroundColor = fields.find((f) => f.path.endsWith('headingBackgroundColor'));
  const cornerRadius = fields.find((f) => f.path.endsWith('headingCornerRadius'));
  if (!background) return null;

  const backgroundOn =
    values[background.path] === true || values[background.path] === 'true';

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        <ToggleSwitchFieldRow field={background} values={values} onFieldChange={onFieldChange} />
        {backgroundOn && backgroundColor ? (
          <ColorPickerFieldRow
            field={backgroundColor}
            values={values}
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

const HEADING_TYPOGRAPHY_COLOR_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'heading', label: 'Heading' },
  { value: 'link', label: 'Link' },
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
  const presetValue = presetField
    ? fieldValueAsString(presetValues, presetField) || 'default'
    : 'default';
  const isDefault = presetValue === 'default';
  const isCustom = presetValue === 'custom';
  const settingsBase =
    presetField?.path.replace(/\.headingTypographyPreset$/, '') ?? '';

  const colorField = settingsBase
    ? {
        ...resolveHeadingTypographyField('headingColor', settingsBase, fields),
        options: [...HEADING_TYPOGRAPHY_COLOR_OPTIONS],
        widget: isCustom ? ('segmented' as const) : ('select' as const),
      }
    : null;
  const colorValues =
    colorField && fieldValueAsString(values, colorField) === 'accent'
      ? { ...values, [colorField.path]: 'link' }
      : values;

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Typography</h3>
      <div className="space-y-1">
        {presetField ? (
          <div>
            <InlineSelectFieldRow
              field={presetField}
              values={presetValues}
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
        {colorField && !isDefault ? (
          isCustom ? (
            <SegmentedFieldRow field={colorField} values={colorValues} onFieldChange={onFieldChange} />
          ) : (
            <InlineSelectFieldRow field={colorField} values={colorValues} onFieldChange={onFieldChange} />
          )
        ) : null}
      </div>
    </div>
  );
}

/** Shopify-order heading block panel (Text → Layout → Typography → Appearance → Padding). */
function HeadingBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = prepareHeadingBlockSettingsNode({ id: '', label: 'Heading', kind: 'block', fields });
  const grouped = useMemo(() => groupHeadingPanelFields(prepared.fields ?? []), [prepared.fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {HEADING_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Text') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) => {
                const key = field.path.split('.').pop() ?? '';
                const useRichText =
                  field.widget === 'richtext' || key === 'title' || key === 'heading' || key === 'text';
                if (useRichText) {
                  return (
                    <RichTextFieldRow
                      key={field.path}
                      field={{ ...field, widget: 'richtext', type: 'textarea' }}
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
            />
          );
        }
        if (label === 'Padding') {
          return (
            <HeadingPaddingSettingsGroup
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

/** Shopify-order hero section settings (Media 1 → Custom CSS). */
function HeroGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupHeroPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {HERO_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
            <LargeLogoAppearanceSettingsGroup
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const bgMediaField = fields.find((f) => f.path.endsWith('backgroundMedia'));
  const bgImageField = fields.find((f) => f.path.endsWith('backgroundImageUrl'));
  const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';

  const ordered = [...fields].filter((f) => f.path.split('.').pop() !== 'backgroundImageUrl');

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'backgroundOverlay') {
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
  const inheritScheme = pickComparisonSliderField(panelFields, 'sliderInheritColorScheme');
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
          {inheritScheme ? (
            <ToggleSwitchFieldRow field={inheritScheme} values={values} onFieldChange={onFieldChange} />
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

/** Image compare — Content group: Layout → Size → Appearance → Block link → Padding. */
function ImageCompareContentGroupSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const prepared = useMemo(
    () => prepareImageCompareContentGroupSettingsNode({ id: '', label: 'Content', kind: 'block', fields }),
    [fields]
  );
  const panelFields = prepared.fields ?? [];
  const grouped = useMemo(() => groupImageCompareContentGroupPanelFields(panelFields), [panelFields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {IMAGE_COMPARE_CONTENT_GROUP_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          const direction = pickImageCompareContentGroupField(panelFields, 'contentDirection');
          const alignment = pickImageCompareContentGroupField(panelFields, 'contentAlignment');
          const position = pickImageCompareContentGroupField(panelFields, 'contentPosition');
          const layoutGap = pickImageCompareContentGroupField(panelFields, 'contentGap');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {direction ? (
                  <SegmentedFieldRow field={direction} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {alignment ? (
                  <HeadingAlignmentFieldRow field={alignment} values={values} onFieldChange={onFieldChange} />
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
          const width = pickImageCompareContentGroupField(panelFields, 'contentWidth');
          const widthCustom = pickImageCompareContentGroupField(panelFields, 'contentCustomWidth');
          const mobileWidth = pickImageCompareContentGroupField(panelFields, 'contentMobileWidth');
          const mobileWidthCustom = pickImageCompareContentGroupField(panelFields, 'contentMobileCustomWidth');
          const height = pickImageCompareContentGroupField(panelFields, 'contentHeight');
          const heightCustom = pickImageCompareContentGroupField(panelFields, 'contentCustomHeight');
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
                      <SliderFieldRow field={mobileWidthCustom} values={values} onFieldChange={onFieldChange} />
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
          const inheritColorScheme = pickImageCompareContentGroupField(panelFields, 'contentInheritColorScheme');
          const bgMediaField = pickImageCompareContentGroupField(panelFields, 'contentBackgroundMedia');
          const bgImageField = pickImageCompareContentGroupField(panelFields, 'contentBackgroundImageUrl');
          const borderStyleField = pickImageCompareContentGroupField(panelFields, 'contentBorderStyle');
          const cornerRadius = pickImageCompareContentGroupField(panelFields, 'contentCornerRadius');
          const backgroundOverlay = pickImageCompareContentGroupField(panelFields, 'contentBackgroundOverlay');
          const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {inheritColorScheme ? (
                  <ToggleSwitchFieldRow field={inheritColorScheme} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {bgMediaField ? (
                  <InlineSelectFieldRow field={bgMediaField} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {bgMedia === 'image' && bgImageField ? (
                  <ImagePickerFieldRow field={bgImageField} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {borderStyleField ? (
                  <SegmentedFieldRow field={borderStyleField} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {backgroundOverlay ? (
                  <ToggleSwitchFieldRow field={backgroundOverlay} values={values} onFieldChange={onFieldChange} />
                ) : null}
              </div>
            </div>
          );
        }

        if (label === 'Block link') {
          const linkUrl = pickImageCompareContentGroupField(panelFields, 'contentLinkUrl');
          const openInNewTab = pickImageCompareContentGroupField(panelFields, 'contentOpenInNewTab');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {linkUrl ? <LinkFieldRow field={linkUrl} values={values} onFieldChange={onFieldChange} /> : null}
                {openInNewTab ? (
                  <ToggleSwitchFieldRow field={openInNewTab} values={values} onFieldChange={onFieldChange} />
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
                  <SliderFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
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

/** Heading / text / button blocks (section settings-backed). */
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

/** Contact form: Layout → Size → Appearance → Padding → Custom CSS. */
function ContactFormGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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

const DIVIDER_STYLING_FIELD_ORDER = ['colorScheme', 'sectionWidth', 'thickness', 'length'] as const;

/** Divider styling rows (no section heading — matches Shopify). */
function DividerStylingSettingsGroup({
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
    const idx = DIVIDER_STYLING_FIELD_ORDER.indexOf(key as (typeof DIVIDER_STYLING_FIELD_ORDER)[number]);
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields].sort((a, b) => rank(a.path) - rank(b.path));

  return (
    <div className="space-y-1 px-1 py-3">
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

const ANNOUNCEMENT_APPEARANCE_FIELD_ORDER = ['sectionWidth', 'colorScheme', 'dividerThickness'] as const;

function AnnouncementAppearanceSettingsGroup({
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupAnnouncementPanelFields(fields), [fields]);

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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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

/** Featured product — Details block: size, layout, appearance, and padding. */
function FeaturedProductDetailsGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
          const position = byKey('position');
          const layoutGap = byKey('layoutGap');
          const stickyOnDesktop = byKey('stickyOnDesktop');

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {position ? (
                  <SegmentedFieldRow
                    field={position}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
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
          const inheritColorScheme = byKey('inheritColorScheme');
          const bgMediaField = byKey('backgroundMedia');
          const bgImageField = byKey('backgroundImageUrl');
          const bgImagePosition = byKey('backgroundImagePosition');
          const borderStyleField = byKey('borderStyle');
          const borderThickness = byKey('borderThickness');
          const borderOpacity = byKey('borderOpacity');
          const cornerRadius = byKey('cornerRadius');
          const bgMedia = bgMediaField
            ? fieldValueAsString(values, bgMediaField) || 'none'
            : 'none';
          const borderStyle = borderStyleField
            ? fieldValueAsString(values, borderStyleField) || 'none'
            : 'none';
          const solidBorders = borderStyle === 'solid';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {inheritColorScheme ? (
                  <ToggleSwitchFieldRow
                    field={inheritColorScheme}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
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
                  <SliderFieldRow
                    field={borderOpacity}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {solidBorders && cornerRadius ? (
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

/** Featured product — Review stars block: style, review count, color, and typography. */
function FeaturedProductReviewStarsGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductReviewStarsPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="px-1 py-3">
        <p className="text-[13px] text-gray-600">Displays reviews from parent product.</p>
        <p className="mt-2 text-[12px] text-gray-500">
          An app is required for product ratings.{' '}
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
          const color = groupFields.find((f) => f.path.endsWith('.color'));
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {style ? (
                  <InlineSelectFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {reviewCount ? (
                  <ToggleSwitchFieldRow field={reviewCount} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {color ? (
                  <SegmentedFieldRow field={color} values={values} onFieldChange={onFieldChange} />
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

/** Featured product — Variant picker block: style, swatches, alignment, and padding. */
function FeaturedProductVariantPickerGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductVariantPickerPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Displays variants from parent product.</p>
      {FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          const style = groupFields.find((f) => f.path.endsWith('.style'));
          const swatches = groupFields.find((f) => f.path.endsWith('.swatches'));
          const alignment = groupFields.find((f) => f.path.endsWith('.alignment'));
          return (
            <div key={label} className="px-1 py-3">
              <p className="mb-2 text-[12px] text-gray-500">
                Edit variant styling in{' '}
                <a href="/settings/theme" className="text-[#005bd3] hover:underline">
                  theme settings
                </a>
              </p>
              <div className="space-y-1">
                {style ? (
                  <InlineSelectFieldRow field={style} values={values} onFieldChange={onFieldChange} />
                ) : null}
                {swatches ? (
                  <ToggleSwitchFieldRow field={swatches} values={values} onFieldChange={onFieldChange} />
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
          <SegmentedFieldRow field={styleField} values={values} onFieldChange={onFieldChange} />
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductBuyButtonsPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <p className="px-1 py-3 text-[13px] text-gray-600">Auto connects to parent product.</p>
      {FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'General') {
          return (
            <div key={label} className="px-1 py-3">
              <div className="space-y-1">
                {groupFields.map((field) => (
                  <div key={field.path}>
                    <ToggleSwitchFieldRow
                      field={
                        field.path.endsWith('.giftCardForm')
                          ? { ...field, description: undefined }
                          : field
                      }
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                    {field.path.endsWith('.giftCardForm') && field.description ? (
                      <p className="pb-1 text-[12px] text-gray-500">
                        {field.description}{' '}
                        <a href="#" className="text-[#005bd3] underline" onClick={(e) => e.preventDefault()}>
                          Learn more
                        </a>
                      </p>
                    ) : null}
                  </div>
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

/** Featured product — Header block: layout, size, appearance, block link, and padding. */
function FeaturedProductHeaderGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
          const inheritColorScheme = byKey('inheritColorScheme');
          const bgMediaField = byKey('backgroundMedia');
          const bgImageField = byKey('backgroundImageUrl');
          const bgImagePosition = byKey('backgroundImagePosition');
          const borderStyleField = byKey('borderStyle');
          const borderThickness = byKey('borderThickness');
          const borderOpacity = byKey('borderOpacity');
          const cornerRadius = byKey('cornerRadius');
          const backgroundOverlay = byKey('backgroundOverlay');
          const bgMedia = bgMediaField
            ? fieldValueAsString(values, bgMediaField) || 'none'
            : 'none';
          const borderStyle = borderStyleField
            ? fieldValueAsString(values, borderStyleField) || 'none'
            : 'none';
          const solidBorders = borderStyle === 'solid';

          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {inheritColorScheme ? (
                  <ToggleSwitchFieldRow
                    field={inheritColorScheme}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
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
                  <SliderFieldRow
                    field={borderOpacity}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {cornerRadius ? (
                  <SliderFieldRow field={cornerRadius} values={values} onFieldChange={onFieldChange} />
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

/** Featured product — Header → Title: layout, typography, appearance, and padding. */
function FeaturedProductHeaderTitleGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
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

/** Featured product — Header → Price: general, typography, and padding. */
function FeaturedProductHeaderPriceGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
          const color = groupFields.find((f) => f.path.endsWith('.color'));
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
                {color ? (
                  <InlineSelectFieldRow field={color} values={values} onFieldChange={onFieldChange} />
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
                    <DefaultFieldRow
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

/** Featured product: Product → Layout → Padding → Custom CSS. */
function FeaturedProductGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupFeaturedProductPanelFields(fields), [fields]);

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
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {(groupFields ?? []).map((field) => {
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
                      <DefaultFieldRow
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

/** Product hotspots: General → Section layout → Colors → Popover → Padding → Custom CSS. */
function ProductHotspotsGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductHotspotsPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

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

        if (label === 'Section layout' || label === 'Popover') {
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

        if (label === 'Colors') {
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h3>
              <div className="space-y-1">
                {groupFields.map((field) =>
                  field.widget === 'color' ? (
                    <ColorPickerFieldRow
                      key={field.path}
                      field={field}
                      values={values}
                      onFieldChange={onFieldChange}
                    />
                  ) : (
                    <ColorSchemeFieldRow
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

/** Collection link block: collection handle only (title/image open from tree rows). */
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
        if (field.type === 'number') {
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

        return (
          <div key={label} className="px-1 py-3">
            {label === 'Borders' ? (
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
      })}
    </div>
  );
}

/** Collection list — Collection card block (text placement + appearance). */
function CollectionListCardGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
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
      })}
    </div>
  );
}

/** Collection list — Collection card → Collection title block. */
function CollectionListCardTitleSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupCollectionListCardTitlePanelFields(fields), [fields]);
  const appearanceFields = grouped.get('Appearance') ?? [];
  const background = appearanceFields.find((f) => f.path.endsWith('.backgroundEnabled'));
  const backgroundColor = appearanceFields.find((f) => f.path.endsWith('.backgroundColor'));
  const cornerRadius = appearanceFields.find((f) => f.path.endsWith('.cornerRadius'));
  const backgroundOn =
    background &&
    (values[background.path] === true || values[background.path] === 'true');

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
                {backgroundOn && backgroundColor ? (
                  <ColorPickerFieldRow
                    field={backgroundColor}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null}
                {backgroundOn && cornerRadius ? (
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
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
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
        if (!groupFields?.length) return null;
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

        if (
          label === 'Cards layout' ||
          label === 'Carousel navigation' ||
          label === 'Section layout'
        ) {
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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

/** Collection links spotlight: Collections → Layout → Padding → Custom CSS. */
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
  const layoutMode = layoutModeField ? fieldValueAsString(values, layoutModeField) : 'spotlight';
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

/** Recommended products: Product → Cards layout → Section layout → Padding → Custom CSS. */
function RecommendedProductsGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupRecommendedProductsPanelFields(fields), [fields]);
  const typeField = fields.find((f) => f.path.endsWith('.recommendationType'));
  const recommendationType = typeField ? fieldValueAsString(values, typeField) : 'related';

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {RECOMMENDED_PRODUCTS_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

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

/** Product highlight: Product → Media position → Color scheme → Padding → Theme settings → Custom CSS. */
function ProductHighlightGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupProductHighlightPanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {PRODUCT_HIGHLIGHT_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length && label !== 'Theme settings') return null;

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
          return (
            <div key={label} className="space-y-1 px-1 py-3">
              {(groupFields ?? []).map((field) =>
                field.widget === 'segmented' ? (
                  <SegmentedFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : field.widget === 'color-scheme' ? (
                  <ColorSchemeFieldRow
                    key={field.path}
                    field={field}
                    values={values}
                    onFieldChange={onFieldChange}
                  />
                ) : null
              )}
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

        if (label === 'Theme settings') {
          return (
            <CollapsibleSettingsGroup
              key={label}
              label="Theme settings"
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

/** Editorial: Media position → width → height → section width → color → padding → custom CSS. */
function EditorialGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
          const colorScheme = groupFields.find((f) => f.path.endsWith('.colorScheme'));
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
              {colorScheme ? (
                <ColorSchemeFieldRow field={colorScheme} values={values} onFieldChange={onFieldChange} />
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupLargeLogoBlockPanelFields(fields), [fields]);
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

/** Video block: Source → URL / cover image. */
function StorytellingVideoMediaBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const sourceField = fields.find((f) => f.path.endsWith('videoSource'));
  const urlField = fields.find((f) => f.path.endsWith('videoUrl'));
  const coverField = fields.find((f) => f.path.endsWith('coverImageUrl'));
  const source = sourceField ? fieldValueAsString(values, sourceField) || 'url' : 'url';

  return (
    <div className="px-1 py-3">
      <div className="space-y-1">
        {sourceField ? (
          <SegmentedFieldRow field={sourceField} values={values} onFieldChange={onFieldChange} />
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
        {coverField ? (
          <ImagePickerFieldRow field={coverField} values={values} onFieldChange={onFieldChange} />
        ) : null}
      </div>
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

/** Storytelling Video: Layout → Size → Appearance → Padding → Custom CSS. */
function StorytellingVideoGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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

const MULTICOLUMN_APPEARANCE_FIELD_ORDER = [
  'colorScheme',
  'backgroundMedia',
  'borderStyle',
  'cornerRadius',
  'backgroundOverlay',
] as const;

/** Multicolumn appearance: Color scheme → Background media → Borders → Corner radius → Overlay. */
function MulticolumnAppearanceSettingsGroup({
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
  const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';

  const rank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = MULTICOLUMN_APPEARANCE_FIELD_ORDER.indexOf(
      key as (typeof MULTICOLUMN_APPEARANCE_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields]
    .filter((f) => f.path.split('.').pop() !== 'backgroundImageUrl')
    .sort((a, b) => rank(a.path) - rank(b.path));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'backgroundOverlay') {
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

/** Rich text block: Heading, Text, or Button (section settings-backed). */
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

/** Multicolumn: Layout → Size → Appearance → Padding → Custom CSS. */
function MulticolumnGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
            <MulticolumnAppearanceSettingsGroup
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
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

const PULL_QUOTE_APPEARANCE_FIELD_ORDER = [
  'colorScheme',
  'backgroundMedia',
  'borderStyle',
  'cornerRadius',
  'backgroundOverlay',
] as const;

/** Pull quote layout: Direction → Alignment (segmented) → Position (dropdown) → Gap. */
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
function PullQuoteAppearanceSettingsGroup({
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
  const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';

  const rank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = PULL_QUOTE_APPEARANCE_FIELD_ORDER.indexOf(
      key as (typeof PULL_QUOTE_APPEARANCE_FIELD_ORDER)[number]
    );
    return idx >= 0 ? idx : 99;
  };
  const ordered = [...fields]
    .filter((f) => f.path.split('.').pop() !== 'backgroundImageUrl')
    .sort((a, b) => rank(a.path) - rank(b.path));

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'backgroundOverlay') {
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

/** Pull quote: Layout → Size → Appearance → Padding → Custom CSS. */
function PullQuoteGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
            <PullQuoteAppearanceSettingsGroup
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
  const current = fieldValueAsString(values, field);
  const label =
    field.options?.find((o) => o.value === current)?.label ?? (current ? current : 'Select');

  return (
    <div className="space-y-2 py-1">
      <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
      <div className="flex items-center gap-2">
        <select
          id={fieldInputId(field.path)}
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="min-h-9 flex-1 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          {(field.options ?? []).map((opt) => (
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
      ) : null}
    </div>
  );
}

function BlogPostsCarouselSectionLayoutGroup({
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
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Section layout</h3>
      <div className="space-y-1">
        {fields.map((field) => {
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
      </div>
    </div>
  );
}

/** Blog posts editorial: General → Cards layout → Section layout → Padding → Custom CSS. */
function BlogPostsEditorialGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
            <BlogPostsCarouselSectionLayoutGroup
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
          return (
            <div key={label} className="px-1 py-3">
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

        if (label === 'Navigation') {
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
function BlogPostsGridGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
            <BlogPostsCarouselSectionLayoutGroup
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

function CollectionSelectFieldRow({
  field,
  values,
  onFieldChange,
}: {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const current = fieldValueAsString(values, field);
  const label =
    field.options?.find((o) => o.value === current)?.label ?? (current ? current : 'Select');

  return (
    <div className="space-y-2 py-1">
      <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
      <div className="flex items-center gap-2">
        <select
          id={fieldInputId(field.path)}
          value={current}
          onChange={(e) => onFieldChange(field.path, 'text', e.target.value)}
          className="min-h-9 flex-1 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value || '__empty'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          title="Connect collection"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          aria-label="Connect collection"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      {current ? (
        <p className="truncate text-[12px] text-gray-600">{label}</p>
      ) : null}
    </div>
  );
}

/** Featured collection: Collection → (Carousel navigation) → Section layout → Padding → Theme settings → Custom CSS. */
function FeaturedCollectionGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
  variant = 'default',
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  variant?: 'carousel' | 'editorial' | 'grid' | 'default';
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
        if (label === 'Carousel navigation' && (isEditorial || layoutType !== 'carousel')) return null;

        if (label === 'Collection') {
          return (
            <div key={label} className="px-1 py-3">
              {groupFields.map((field) => {
                if (field.path.endsWith('collectionHandle')) {
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
                    <DefaultFieldRow
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

        if (label === 'Section layout') {
          return (
            <BlogPostsCarouselSectionLayoutGroup
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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

/** Marquee: Motion + Color scheme → Padding → Custom CSS (matches Shopify). */
function TextMarqueeGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupTextMarqueePanelFields(fields), [fields]);
  const layoutFields = grouped.get('Layout') ?? [];
  const appearanceFields = grouped.get('Appearance') ?? [];
  const paddingFields = grouped.get('Padding') ?? [];
  const customCssFields = grouped.get('Custom CSS') ?? [];

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {layoutFields.length || appearanceFields.length ? (
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
            {appearanceFields.map((field) =>
              field.widget === 'color-scheme' ? (
                <ColorSchemeFieldRow
                  key={field.path}
                  field={field}
                  values={values}
                  onFieldChange={onFieldChange}
                />
              ) : null
            )}
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

/** Rich text: Layout → Size → Appearance → Padding → Custom CSS. */
function RichTextGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
            <PullQuoteAppearanceSettingsGroup
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

function FaqLayoutSettingsGroup({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const ordered = sortFaqGroupFields(fields, FAQ_LAYOUT_FIELD_ORDER);

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
  const bgMedia = bgMediaField ? fieldValueAsString(values, bgMediaField) || 'none' : 'none';
  const ordered = sortFaqGroupFields(
    fields.filter((f) => f.path.split('.').pop() !== 'backgroundImageUrl'),
    FAQ_APPEARANCE_FIELD_ORDER
  );

  return (
    <div className="px-1 py-3">
      <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Appearance</h3>
      <div className="space-y-1">
        {ordered.map((field) => {
          const key = field.path.split('.').pop() ?? '';
          if (key === 'backgroundOverlay') {
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

/** FAQ: Layout → Size → Appearance → Padding → Custom CSS. */
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
    <div className="divide-y divide-[#e1e1e1]">
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
            <FaqAppearanceSettingsGroup
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

/** FAQ Accordion block: Icon → Dividers → Heading preset → Inherit color scheme → Borders → Padding. */
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

        if (label === 'Borders') {
          const byKey = (key: string) => groupFields.find((f) => f.path.endsWith(key));
          const borderStyleField = byKey('borderStyle');
          const cornerRadius = byKey('cornerRadius');
          return (
            <div key={label} className="px-1 py-3">
              <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Borders</h3>
              <div className="space-y-1">
                {borderStyleField ? (
                  <SegmentedFieldRow
                    field={borderStyleField}
                    values={values}
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
          const ordered = FAQ_ACCORDION_PADDING_FIELD_ORDER.map((key) =>
            groupFields.find((f) => f.path.endsWith(key))
          ).filter((f): f is EditorFieldDef => Boolean(f));
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

/** FAQ Accordion row: Heading → Open row by default → Icon group. */
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
  const heading = byKey('heading');
  const openByDefault = byKey('openByDefault');
  const rowIcon = byKey('rowIcon');
  const rowImageIconUrl = byKey('rowImageIconUrl');
  const rowIconWidth = byKey('rowIconWidth');

  return (
    <div className="divide-y divide-[#e1e1e1]">
      <div className="space-y-1 px-1 py-3">
        {heading ? (
          <SettingsFieldRow field={heading} values={values} onFieldChange={onFieldChange} />
        ) : null}
        {openByDefault ? (
          <ToggleSwitchFieldRow
            field={openByDefault}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : null}
      </div>
      <div className="px-1 py-3">
        <h3 className="mb-2 text-[13px] font-semibold text-gray-900">Icon</h3>
        <div className="space-y-1">
          {rowIcon ? (
            <InlineSelectFieldRow field={rowIcon} values={values} onFieldChange={onFieldChange} />
          ) : null}
          {rowImageIconUrl ? (
            <ImagePickerFieldRow
              field={{ ...rowImageIconUrl, widget: 'image' }}
              values={values}
              onFieldChange={onFieldChange}
            />
          ) : null}
          {rowIconWidth ? (
            <SliderFieldRow field={rowIconWidth} values={values} onFieldChange={onFieldChange} />
          ) : null}
        </div>
      </div>
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
  const grouped = useMemo(() => groupTextBlockPanelFields(fields), [fields]);

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

/** Image with text: Layout → Size → Appearance → Padding → Custom CSS. */
function ImageWithTextGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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

/** Image compare: Layout → Size → Appearance → Padding → Custom CSS. */
function ImageCompareGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const grouped = useMemo(() => groupImageComparePanelFields(fields), [fields]);

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {IMAGE_COMPARE_PANEL_GROUP_ORDER.map((label) => {
        const groupFields = grouped.get(label);
        if (!groupFields?.length) return null;

        if (label === 'Layout') {
          return (
            <ImageCompareLayoutSettingsGroup
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
            <LargeLogoAppearanceSettingsGroup
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

/** Editorial jumbo: same control order as Editorial (media position → width → height → …). */
function EditorialJumboGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <EditorialGroupedSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
  );
}

/** Email signup: Layout → Size → Appearance → Padding → Custom CSS. */
function EmailSignupGroupedSettingsPanel({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
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
            <LargeLogoAppearanceSettingsGroup
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
              initialOpen
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
    <div className="border-t border-[#e1e1e1] px-1 py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2 text-left text-[13px] font-medium text-gray-800"
      >
        {label}
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="space-y-1 pb-2">
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
    </div>
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

function GroupedSettingsFields({
  fields,
  values,
  onFieldChange,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, EditorFieldDef[]>();
    const ungrouped: EditorFieldDef[] = [];
    for (const field of fields) {
      if (field.group) {
        const list = map.get(field.group) ?? [];
        list.push(field);
        map.set(field.group, list);
      } else {
        ungrouped.push(field);
      }
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
      'Content',
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
      'Size',
      'Utilities',
      'Colors',
      'Page backgrounds',
      'Theme settings',
      'Padding',
      'Custom CSS',
    ];
    const sorted: Array<{ label: string; fields: EditorFieldDef[] }> = [];
    for (const label of order) {
      const list = map.get(label);
      if (list?.length) sorted.push({ label, fields: list });
      map.delete(label);
    }
    for (const [label, list] of map) sorted.push({ label, fields: list });
    if (ungrouped.length) {
      const infoOnly = ungrouped.filter((f) => f.widget === 'info-link');
      const rest = ungrouped.filter((f) => f.widget !== 'info-link');
      if (infoOnly.length) sorted.unshift({ label: '__info__', fields: infoOnly });
      if (rest.length) sorted.unshift({ label: 'Settings', fields: rest });
    }
    return sorted;
  }, [fields]);

  const flatOnly = groups.length === 1 && groups[0]?.label === 'Settings';

  if (flatOnly) {
    return (
      <div className="px-1 py-2">
        <div className="space-y-1">
          {groups[0].fields.map((field) => (
            <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#e1e1e1]">
      {groups.map((group) =>
        group.label === '__info__' ? (
          <div key={group.label} className="px-1 pb-2 pt-1">
            {group.fields.map((field) => (
              <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
            ))}
          </div>
        ) : group.label === 'Custom CSS' ? (
          <div key={group.label} className="px-1 py-1">
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
        ) : group.label === 'Typography' ? (
          <div key={group.label} className="px-1 py-3">
            <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{group.label}</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
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
            </div>
            {group.fields
              .filter((f) => f.widget === 'segmented')
              .map((field) => (
                <div key={field.path} className="mt-3">
                  <span className="mb-1.5 block text-[12px] text-gray-600">{field.label}</span>
                  <div className="inline-flex w-full max-w-md rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
                    {(field.options ?? []).map((opt) => {
                      const current =
                        fieldValueAsString(values, field) || field.options?.[0]?.value || 'default';
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onFieldChange(field.path, 'text', opt.value)}
                          className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                            current === opt.value
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
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
        ) : group.label === 'Layout' ? (
          <HeroLayoutSettingsGroup
            key={group.label}
            fields={group.fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : group.label === 'Appearance' ? (
          <HeroAppearanceSettingsGroup
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
          <div key={group.label} className="px-1 py-3">
            <h3 className="mb-2 text-[13px] font-semibold text-gray-900">{group.label}</h3>
            <div className="space-y-1">
              {group.fields.map((field) => (
                <SettingsFieldRow key={field.path} field={field} values={values} onFieldChange={onFieldChange} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

type ThemeSectionSettingsPanelProps = {
  node: SidebarNode;
  values: Record<string, string | boolean>;
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
  onFieldChange,
  onCollectionLinksApply,
  onStoreMenuSelect,
  onClose,
  onRemoveSection,
  onRemoveBlock,
}) => {
  const fields = node.fields ?? [];
  const canRemoveSection = node.kind === 'section' && Boolean(onRemoveSection);
  const canRemoveBlock = node.kind === 'block' && Boolean(onRemoveBlock);
  const isLargeLogoPanel =
    node.label === 'Large logo' || isLargeLogoSettingsPanelFields(fields);
  const isSplitShowcasePanel =
    node.kind !== 'block' &&
    (node.label === 'Split showcase' || isSplitShowcaseSettingsPanelFields(fields));
  const isFooterUtilitiesPanel =
    node.label === 'Policies and links' ||
    node.label === 'Utilities' ||
    isFooterUtilitiesSettingsPanelFields(fields);
  const isFaqPanel = node.label === 'FAQ' || isFaqSettingsPanelFields(fields);
  const isContactFormBlockPanel =
    node.kind === 'block' &&
    (isContactFormBlockNodeId(node.id) ||
      (fields.length > 0 && isContactFormBlockFieldsOnly(fields)));
  const isContactFormPanel =
    !isHeroSectionSettingsNode(node) &&
    !isFaqPanel &&
    !isContactFormBlockPanel &&
    node.kind !== 'block' &&
    (node.label === 'Contact form' || isContactFormSettingsPanelFields(fields));
  const isEmailSignupSectionBlockPanel =
    node.kind === 'block' &&
    (isEmailSignupSectionBlockNodeId(node.id) ||
      (fields.length > 0 && isEmailSignupSectionBlockFieldsOnly(fields)));
  const isImageCompareSliderBlockPanel =
    node.kind === 'block' &&
    (isImageCompareSliderBlockNodeId(node.id) ||
      (fields.length > 0 && isImageCompareSliderBlockFieldsOnly(fields)));
  const isImageCompareContentGroupPanel =
    isImageCompareContentGroupNodeId(node.id) ||
    (fields.length > 0 && isImageCompareContentGroupFieldsOnly(fields));
  const isImageCompareContentBlockPanel =
    node.kind === 'block' &&
    !isImageCompareSliderBlockPanel &&
    !isImageCompareContentGroupPanel &&
    (isImageCompareSectionBlockNodeId(node.id) ||
      (fields.length > 0 && isImageCompareContentBlockFieldsOnly(fields)));
  const isEmailSignupPanel =
    !isHeroSectionSettingsNode(node) &&
    !isEmailSignupSectionBlockPanel &&
    !isImageCompareSliderBlockPanel &&
    !isImageCompareContentGroupPanel &&
    !isImageCompareContentBlockPanel &&
    node.kind !== 'block' &&
    (node.label === 'Email signup' || isEmailSignupSettingsPanelFields(fields));
  const isCustomSectionPanel =
    !isHeroSectionSettingsNode(node) &&
    !isImageCompareSettingsPanelFields(fields) &&
    node.kind !== 'block' &&
    (node.label === 'Custom section' || isCustomSectionSettingsPanelFields(fields));
  const isFeaturedProductPanel =
    node.label === 'Featured product' || isFeaturedProductSettingsPanelFields(fields);
  const isFeaturedProductMediaBlockPanel =
    node.label === 'Product media' ||
    isFeaturedProductMediaBlockNodeId(node.id) ||
    isFeaturedProductMediaPanelFields(fields);
  const isFeaturedProductDetailsBlockPanel =
    node.label === 'Details' ||
    isFeaturedProductDetailsBlockNodeId(node.id) ||
    isFeaturedProductDetailsPanelFields(fields);
  const isCollectionListSectionHeaderPanel =
    isCollectionListSectionHeaderBlockNodeId(node.id) ||
    isCollectionListSectionHeaderPanelFields(fields);
  const isFeaturedProductHeaderBlockPanel =
    isFeaturedProductHeaderBlockNodeId(node.id) || isFeaturedProductHeaderPanelFields(fields);
  const isFeaturedProductHeaderTitleBlockPanel =
    node.label === 'Title' ||
    isFeaturedProductHeaderTitleNestedNodeId(node.id) ||
    isFeaturedProductHeaderTitlePanelFields(fields);
  const isFeaturedProductHeaderPriceBlockPanel =
    node.label === 'Price' ||
    isFeaturedProductHeaderPriceNestedNodeId(node.id) ||
    isFeaturedProductHeaderPricePanelFields(fields);
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
    node.label === 'Quantity' || isFeaturedProductQuantityNestedNodeId(node.id);
  const isFeaturedProductAcceleratedCheckoutBlockPanel =
    node.label === 'Accelerated checkout' ||
    isFeaturedProductAcceleratedCheckoutNestedNodeId(node.id);
  const isProductHighlightPanel =
    !isFeaturedProductPanel &&
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
    (node.label === 'Product highlight' || isProductHighlightSettingsPanelFields(fields));
  const isEditorialPanel = node.label === 'Editorial' || isEditorialSettingsPanelFields(fields);
  const isEditorialJumboPanel =
    node.label === 'Editorial: Jumbo text' || isEditorialJumboSettingsPanelFields(fields);
  const isImageComparePanel =
    !isImageCompareSliderBlockPanel &&
    !isImageCompareContentGroupPanel &&
    !isImageCompareContentBlockPanel &&
    node.kind !== 'block' &&
    (node.label === 'Image compare' || isImageCompareSettingsPanelFields(fields));
  const isCollectionLinksSpotlightPanel =
    node.label === 'Collection links: Spotlight' ||
    node.label === 'Collection links: Text' ||
    isCollectionLinksSpotlightSettingsPanelFields(fields);
  const isImageWithTextPanel =
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
  const isStorytellingVideoBlockPanel =
    node.kind === 'block' &&
    (isStorytellingVideoBlockNodeId(node.id) ||
      (fields.length > 0 && isStorytellingVideoBlockFieldsOnly(fields)));
  const isStorytellingVideoMediaBlockPanel =
    isStorytellingVideoMediaBlockNodeId(node.id) ||
    (isStorytellingVideoBlockPanel && fields.some((f) => f.path.endsWith('videoSource')));
  const isIconsWithTextPanel =
    node.label === 'Icons with text' || isIconsWithTextSettingsPanelFields(fields);
  const isIconsWithTextBlockPanel =
    node.kind === 'block' &&
    (isIconsWithTextBlockNodeId(node.id) ||
      (fields.length > 0 && fields.every(isIconsWithTextBlockField)));
  const isMulticolumnPanel =
    node.label === 'Multicolumn' || isMulticolumnSettingsPanelFields(fields);
  const isMulticolumnBlockPanel =
    node.kind === 'block' &&
    (isMulticolumnBlockNodeId(node.id) ||
      (fields.length > 0 && fields.every(isMulticolumnBlockField)));
  const isPullQuotePanel =
    node.label === 'Pull quote' || isPullQuoteSettingsPanelFields(fields);
  const isRichTextPanel =
    node.label === 'Rich text' || isRichTextSettingsPanelFields(fields);
  const isRichTextBlockPanel =
    node.kind === 'block' &&
    (isRichTextBlockNodeId(node.id) ||
      (fields.length > 0 && fields.every(isRichTextBlockField)));
  const isTextMarqueePanel =
    node.label === 'Marquee' || isTextMarqueeSettingsPanelFields(fields);
  const isFeaturedCollectionGridPanel =
    node.label === 'Featured collection: Grid' || isFeaturedCollectionGridSettingsPanelFields(fields);
  const isFeaturedCollectionEditorialPanel =
    !isFeaturedCollectionGridPanel &&
    (node.label === 'Featured collection: Editorial' ||
      isFeaturedCollectionEditorialSettingsPanelFields(fields));
  const isFeaturedCollectionCarouselPanel =
    !isFeaturedCollectionGridPanel &&
    !isFeaturedCollectionEditorialPanel &&
    (node.label === 'Featured collection: Carousel' ||
      isFeaturedCollectionCarouselSettingsPanelFields(fields));
  const isBlogPostsCarouselPanel =
    node.label === 'Blog posts: Carousel' || isBlogPostsCarouselSettingsPanelFields(fields);
  const isBlogPostsEditorialPanel =
    node.label === 'Blog posts: Editorial' || isBlogPostsEditorialSettingsPanelFields(fields);
  const isBlogPostsGridPanel =
    node.label === 'Blog posts: Grid' || isBlogPostsGridSettingsPanelFields(fields);
  const isProductHotspotsPanel =
    node.label === 'Product hotspots' || isProductHotspotsSettingsPanelFields(fields);
  const isRecommendedProductsPanel =
    node.label === 'Recommended products' || isRecommendedProductsSettingsPanelFields(fields);
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
  const isCollectionLinkTitlePanel =
    node.label === 'Title' &&
    (isCollectionLinkTitleFieldNodeId(node.id) || isCollectionLinkTitlePanelFields(fields));
  const isCollectionLinkImagePanel =
    node.label === 'Image' &&
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
    (node.label === 'Collection link' || isCollectionLinkBlockFieldsOnly(fields));
  const isStorytellingCarouselPanel =
    node.label === 'Carousel' || isStorytellingCarouselSettingsPanelFields(fields);
  const isDividerPanel =
    node.label === 'Divider' || isDividerSettingsPanelFields(fields);
  const isHeadingBlockPanel =
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    node.kind === 'block' &&
    (node.label === 'Heading' ||
      isHeadingBlockNodeId(node.id) ||
      isHeadingBlockPanelFields(fields));
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
    node.kind === 'block' &&
    (node.label === 'Button' ||
      isHeroButtonBlockNodeId(node.id) ||
      isHeroButtonPanelFields(fields));
  const isAnnouncementBlockPanel =
    !isHeaderLogoBlockPanel &&
    !isHeaderMenuBlockPanel &&
    !isHeadingBlockPanel &&
    !isFaqAccordionBlockPanel &&
    !isFaqAccordionRowBlockPanel &&
    !isFaqAccordionRowTextBlockPanel &&
    !isHeroTextBlockPanel &&
    !isIconsWithTextBlockPanel &&
    !isMulticolumnBlockPanel &&
    !isRichTextBlockPanel &&
    !isStorytellingVideoBlockPanel &&
    !isHeroButtonBlockPanel &&
    (isAnnouncementBlockNodeId(node.id) ||
      node.label === 'Announcement' ||
      (fields.length > 0 && isAnnouncementBlockPanelFields(fields)));
  const isAnnouncementBarPanel =
    node.label === 'Announcement bar' || isAnnouncementSettingsPanelFields(fields);
  const isFooterPanel =
    !isFooterUtilitiesPanel &&
    !isContactFormPanel &&
    !isEmailSignupPanel &&
    !isCustomSectionPanel &&
    !isFeaturedProductPanel &&
    !isProductHighlightPanel &&
    !isEditorialPanel &&
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
    !isProductHotspotsPanel &&
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
    !isHeadingBlockPanel &&
    !isFaqAccordionBlockPanel &&
    !isFaqAccordionRowBlockPanel &&
    !isFaqAccordionRowTextBlockPanel &&
    !isHeroTextBlockPanel &&
    !isIconsWithTextBlockPanel &&
    !isMulticolumnBlockPanel &&
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
    !isEditorialPanel &&
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
    !isProductHotspotsPanel &&
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
          <span className="truncate text-[13px] font-semibold">{node.label}</span>
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {isHeaderLogoBlockPanel ? (
          <HeaderLogoBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isHeaderMenuBlockPanel ? (
          <HeaderMenuBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            onStoreMenuSelect={onStoreMenuSelect}
          />
        ) : isFeaturedProductQuantityBlockPanel || isFeaturedProductAcceleratedCheckoutBlockPanel ? (
          <FeaturedProductNoCustomSettingsPanel />
        ) : isFeaturedProductAddToCartBlockPanel ? (
          <FeaturedProductAddToCartGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : fields.length === 0 ? (
          <p className="text-[13px] text-gray-500">No settings for this item.</p>
        ) : isHeaderSectionPanel ? (
          <HeaderSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
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
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareSliderBlockPanel ? (
          <ComparisonSliderBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isImageCompareContentBlockPanel ? (
          <ImageCompareSectionBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isEmailSignupFooterBlockPanel ? (
          <EmailSignupBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isRichTextBlockPanel ? (
          <RichTextBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isHeadingBlockPanel ? (
          <HeadingBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isFaqAccordionBlockPanel ? (
          <FaqAccordionSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isFaqAccordionRowBlockPanel ? (
          <FaqAccordionRowSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isFaqAccordionRowTextBlockPanel ||
          isHeroTextBlockPanel ||
          isCollectionListHeaderTextPanel ? (
          <TextBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isIconsWithTextBlockPanel ? (
          <IconsWithTextBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isMulticolumnBlockPanel ? (
          <MulticolumnBlockSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isHeroButtonBlockPanel ? (
          <HeroButtonSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isHeroPanel ? (
          <HeroGroupedSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isAnnouncementBlockPanel ? (
          <AnnouncementBlockSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isLargeLogoPanel ? (
          <LargeLogoGroupedSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
        ) : isSplitShowcasePanel ? (
          <SplitShowcaseGroupedSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
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
            onFieldChange={onFieldChange}
          />
        ) : isEmailSignupPanel ? (
          <EmailSignupGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isImageComparePanel ? (
          <ImageCompareGroupedSettingsPanel
            fields={fields}
            values={values}
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
        ) : isFeaturedProductDetailsBlockPanel ? (
          <FeaturedProductDetailsGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isCollectionListSectionHeaderPanel || isFeaturedProductHeaderBlockPanel ? (
          <FeaturedProductHeaderGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductHeaderTitleBlockPanel ? (
          <FeaturedProductHeaderTitleGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductHeaderPriceBlockPanel ? (
          <FeaturedProductHeaderPriceGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductReviewStarsBlockPanel ? (
          <FeaturedProductReviewStarsGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductVariantPickerBlockPanel ? (
          <FeaturedProductVariantPickerGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductBuyButtonsBlockPanel ? (
          <FeaturedProductBuyButtonsGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedProductPanel ? (
          <FeaturedProductGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHighlightPanel ? (
          <ProductHighlightGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isProductHotspotsPanel ? (
          <ProductHotspotsGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isRecommendedProductsPanel ? (
          <RecommendedProductsGroupedSettingsPanel
            fields={fields}
            values={values}
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
            onFieldChange={onFieldChange}
            onCollectionLinksApply={onCollectionLinksApply}
          />
        ) : isLayeredSlideshowPanel ? (
          <LayeredSlideshowGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowFullFramePanel ? (
          <SlideshowFullFrameGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isSlideshowInsetPanel ? (
          <SlideshowInsetGroupedSettingsPanel
            fields={fields}
            values={values}
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
        ) : isEditorialPanel ? (
          <EditorialGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isEditorialJumboPanel ? (
          <EditorialJumboGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isImageWithTextPanel ? (
          <ImageWithTextGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isLargeLogoBlockPanel ? (
          <LargeLogoBlockGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingLogoPanel ? (
          <StorytellingLogoGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingVideoMediaBlockPanel ? (
          <StorytellingVideoMediaBlockSettingsPanel
            fields={fields}
            values={values}
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
            onFieldChange={onFieldChange}
          />
        ) : isFaqPanel ? (
          <FaqGroupedSettingsPanel fields={fields} values={values} onFieldChange={onFieldChange} />
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
            onFieldChange={onFieldChange}
          />
        ) : isPullQuotePanel ? (
          <PullQuoteGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isRichTextPanel ? (
          <RichTextGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isTextMarqueePanel ? (
          <TextMarqueeGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isFeaturedCollectionGridPanel ? (
          <FeaturedCollectionGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            variant="grid"
          />
        ) : isFeaturedCollectionEditorialPanel ? (
          <FeaturedCollectionGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            variant="editorial"
          />
        ) : isFeaturedCollectionCarouselPanel ? (
          <FeaturedCollectionGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
            variant="carousel"
          />
        ) : isBlogPostsCarouselPanel ? (
          <BlogPostsCarouselGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsEditorialPanel ? (
          <BlogPostsEditorialGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isBlogPostsGridPanel ? (
          <BlogPostsGridGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isStorytellingCarouselPanel ? (
          <StorytellingCarouselGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isAnnouncementBarPanel ? (
          <AnnouncementBarGroupedSettingsPanel
            fields={fields}
            values={values}
            onFieldChange={onFieldChange}
          />
        ) : isDividerPanel ? (
          <DividerGroupedSettingsPanel
            fields={fields}
            values={values}
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
        ) : useGrouped ? (
          <GroupedSettingsFields fields={fields} values={values} onFieldChange={onFieldChange} />
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
