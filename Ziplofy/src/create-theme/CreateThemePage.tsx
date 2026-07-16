import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CreateThemeEditorSidebar,
  buildEmptyShopifySidebarTree,
  buildShopifySidebarTree,
  buildThemeSettingsSidebarTree,
  defaultExpandedSidebar,
  findSidebarNode,
  settingsNodeForSelection,
  resolveAddBlockSectionLabel,
  resolveAddSectionGroup,
  resolveSectionCatalogGroupFromNodeId,
  applyStructureOrderToConfig,
  mergeItemOrder,
  readStructureOrderFromConfig,
  withCreatorSidebarDeleteFlags,
  type EditorSchemaDoc,
  type ThemeEditorSidebarTab,
  type SectionInsertContext,
} from './sidebar';
import { CreateThemeHeader } from './chrome/CreateThemeHeader';
import CreateThemeLivePreview, {
  type CreateThemeLivePreviewHandle,
  type ThemePreviewPage,
} from './chrome/CreateThemeLivePreview';
import { PreviewSyncProgressBar } from './chrome/PreviewStatus';
import { usePreviewEditSync } from './chrome/usePreviewEditSync';
import { CreateThemePoweredByLoader } from './chrome/CreateThemePoweredByLoader';
import {
  buildCheckoutProfileSidebarTree,
  buildCheckoutAccountProfileSidebarTree,
  buildCheckoutOrdersSidebarTree,
  buildCheckoutOrderStatusSidebarTree,
  buildCheckoutSignInSidebarTree,
  buildCheckoutSignUpSidebarTree,
  buildCheckoutThankYouSidebarTree,
  defaultCheckoutAccountProfileSidebarExpanded,
  defaultCheckoutProfileSidebarExpanded,
  defaultCheckoutOrdersSidebarExpanded,
  defaultCheckoutOrderStatusSidebarExpanded,
  defaultCheckoutSignInSidebarExpanded,
  defaultCheckoutSignUpSidebarExpanded,
  defaultCheckoutThankYouSidebarExpanded,
  CheckoutEditorHeader,
  CheckoutProfilePreview,
  CheckoutEditorSettingsPanel,
  CheckoutThemeSettingsNav,
  findCheckoutEditorPageLabel,
  readCheckoutHeaderPosition,
  readCheckoutFooterConfig,
  readCheckoutGlobalSettings,
  readCheckoutOrderSummaryConfig,
  readCheckoutSignInMainConfig,
  readCheckoutThankYouMainConfig,
  resolveCheckoutPaletteTheme,
  resolveCheckoutTypographyTheme,
  resolveCheckoutSettingsPanelId,
  syncCheckoutThemeFromPalette,
  type CheckoutEditorPage,
  type CheckoutFooterConfig,
  type CheckoutGlobalSettings,
  type CheckoutHeaderPosition,
  type CheckoutOrderSummaryConfig,
  type CheckoutPaletteSyncResult,
  type CheckoutSignInMainConfig,
  type CheckoutThankYouMainConfig,
} from './checkout';
import { ThemeSettingsNav } from './sidebar/ThemeSettingsNav';
import { THEME_LOGO_DEFAULT_PATH } from './settings/theme-logo-favicon.settings';
import {
  readThemeColorPalette,
  seedThemePaletteValues,
  syncThemePaletteToFieldValues,
} from './settings/theme-color-palette.settings';
import {
  seedThemeTypographyValues,
  syncThemeTypographyFontFields,
  THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH,
  THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH,
  THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH,
  THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH,
} from './settings/theme-typography.settings';
import { seedThemeAnimationsValues } from './settings/theme-animations.settings';
import { seedThemeBadgesValues } from './settings/theme-badges.settings';
import { seedThemeButtonsValues } from './settings/theme-buttons.settings';
import {
  readThemeCartSettingsFromValues,
  seedThemeCartValues,
  syncThemeCartHeaderFieldValues,
} from './settings/theme-cart.settings';
import { seedThemeDrawersValues } from './settings/theme-drawers.settings';
import { seedThemeProductMediaValues } from './settings/theme-product-media.settings';
import { seedThemeIconsValues } from './settings/theme-icons.settings';
import { seedThemeInputFieldsValues } from './settings/theme-input-fields.settings';
import { seedThemePopoversModalsValues } from './settings/theme-popovers-modals.settings';
import { seedThemePricesValues } from './settings/theme-prices.settings';
import { seedThemeProductCardsValues } from './settings/theme-product-cards.settings';
import { seedThemeSearchValues } from './settings/theme-search.settings';
import { seedThemeSwatchesValues } from './settings/theme-swatches.settings';
import { seedThemeVariantPickersValues } from './settings/theme-variant-pickers.settings';
import {
  seedThemePageValues,
  syncThemePageFieldValues,
  THEME_PAGE_WIDTH_PATH,
  normalizeThemePageWidth,
} from './settings/theme-page.settings';
import { buildThemeEditorPageMenu, findPageMenuItemByPreviewWithConfig } from './utils/page-menu';
import { ensureRegistryTemplatesInConfig, registryLabel, allRegistryPageIds } from './utils/theme-page-registry';
import {
  alternateTemplateCreatedToastMessage,
  alternateTemplateSavedToastLabel,
  ensureAllAlternateTemplateRegistries,
} from './utils/alternate-template-registry.util';
import {
  extendValuesForSeededTemplate,
  seedTemplateFromPackIfEmpty,
} from './utils/seed-page-template-from-pack';
import {
  buildThemeEditorSelectionHints,
  expandedIdsForPreviewNode,
} from './utils/selection-hints';
import {
  extendValuesForCollectionTitleBlock,
  isCollectionTitleNestedNodeId,
} from './sidebar/theme-editor-fc-collection-title-panel.utils';
import {
  extendValuesForViewAllButtonBlock,
  isViewAllButtonNestedNodeId,
} from './sidebar/theme-editor-fc-view-all-button-panel.utils';
import {
  extendValuesForFeaturedCollectionHeaderBlock,
  isFeaturedCollectionHeaderBlockNodeId,
} from './sidebar/theme-editor-fc-header-panel.utils';
import {
  extendValuesForProductCardBlock,
  isProductCardBlockNodeId,
} from './sidebar/theme-editor-product-card-panel.utils';
import {
  extendValuesForProductCardMediaBlock,
  isProductCardMediaNestedNodeId,
} from './sidebar/theme-editor-product-card-media-panel.utils';
import {
  extendValuesForProductCardPriceBlock,
  isProductCardPriceNestedNodeId,
} from './sidebar/theme-editor-product-card-price-panel.utils';
import {
  extendValuesForProductCardTitleBlock,
  isProductCardTitleNestedNodeId,
} from './sidebar/theme-editor-product-card-title-panel.utils';
import {
  extendValuesForRecommendedProductsHeader,
  isRecommendedProductsHeaderNodeId,
} from './sidebar/theme-editor-recommended-products-header-panel.utils';
import {
  isHeadingBlockNodeId,
  extendValuesForHeadingBlock,
  mirrorHeadingTextInValues,
  parseHeadingBlockNodeId,
} from './sidebar/theme-editor-heading-block-panel.utils';
import {
  extendValuesForFaqAccordionBlock,
  isFaqAccordionBlockNodeId,
} from './sidebar/theme-editor-faq-accordion-block-panel.utils';
import {
  extendValuesForFaqAccordionRow,
  isFaqAccordionRowNestedNodeId,
} from './sidebar/theme-editor-faq-accordion-row-panel.utils';
import {
  extendValuesForFaqAccordionRowText,
  isFaqAccordionRowTextNestedNodeId,
} from './sidebar/theme-editor-faq-accordion-row-text-panel.utils';
import {
  extendValuesForLargeLogoBlock,
  isHeroLargeLogoBlockNodeId,
} from './sidebar/theme-editor-large-logo-block-panel.utils';
import {
  extendValuesForHeroBottomGroup,
  extendValuesForHeroBottomText,
  extendValuesForHeroMarquee,
  extendValuesForHeroTextBlock,
  isHeroTextBlockNodeId,
} from './sidebar/theme-editor-hero-text-block-panel.utils';
import {
  extendValuesForNotFoundMainMessage,
  extendValuesForNotFoundMainSection,
  isNotFoundMainMessageBlockNodeId,
  isNotFoundMainSectionNodeId,
} from './sidebar/theme-editor-not-found-main-panel.utils';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { THEME_EDITOR_STATIC_CONFIG } from '../config/theme-editor-static.config';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { openThemeCreatorForActiveStore } from '../utils/theme-creator-navigation';
import type { Collection } from '../contexts/collection.context';
import { useCollections } from '../contexts/collection.context';
import type { StoreMenu, StoreMenuItem } from '../contexts/store-menu.context';
import {
  applyCollectionLinksSelectionToConfig,
  pruneCollectionLinkBlockValues,
  sectionBaseFromCollectionsPickerPath,
} from './utils/collection-links-collections.util';
import {
  applyCollectionListTilesSelectionToConfig,
  collectionListPickerPathsWithEmptySelection,
  collectionListSyncSignature,
  isCollectionListTileSectionType,
  pruneCollectionTileBlockValues,
  sectionTypeFromCollectionsPickerPath,
} from './utils/collection-list-tiles-collections.util';
import {
  collectionListHeaderCustomSizeFieldDefs,
  collectionListHeaderFieldDefs,
  extendCollectionListHeaderBlockValues,
  isCollectionListSectionHeaderBlockNodeId,
} from './sidebar/theme-editor-collection-list-header-panel.utils';
import {
  collectionListHeaderTextFieldDefsFromNodeId,
  extendCollectionListHeaderTextBlockValues,
  isCollectionListHeaderTextNestedNodeId,
  mirrorCollectionListHeadingTextInValues,
} from './sidebar/theme-editor-collection-list-header-text-panel.utils';
import {
  collectionListCardFieldDefsFromNodeId,
  extendCollectionListCardBlockValues,
  isCollectionListCardBlockNodeId,
} from './sidebar/theme-editor-collection-list-card-panel.utils';
import {
  collectionListCardImageFieldDefsFromNodeId,
  extendCollectionListCardImageBlockValues,
  isCollectionListCardImageNestedNodeId,
} from './sidebar/theme-editor-collection-list-card-image-panel.utils';
import {
  collectionListCardTitleFieldDefsFromNodeId,
  extendCollectionListCardTitleBlockValues,
  isCollectionListCardTitleNestedNodeId,
} from './sidebar/theme-editor-collection-list-card-title-panel.utils';
import {
  collectionListSidebarPathsFromNodeId,
  collectionListSidebarSelectionId,
  syntheticCollectionListSidebarNode,
} from './utils/collection-list-sidebar.util';
import {
  contactFormSidebarSelectionId,
  syntheticContactFormSidebarNode,
} from './utils/contact-form-sidebar.util';
import {
  emailSignupSidebarSelectionId,
  syntheticEmailSignupSidebarNode,
} from './utils/email-signup-sidebar.util';
import {
  extendValuesForRichTextContentBlock,
  pruneValuesForRichTextContentBlock,
  removeRichTextContentBlockFromSection,
  richTextParentSectionNodeId,
} from '../utils/rich-text-sidebar.util';
import {
  isRichTextBlockNodeId,
  richTextBlockKindFromNodeId,
  richTextSectionBaseFromNodeId,
} from './sidebar/theme-editor-rich-text-panel.utils';
import {
  editorialJumboSidebarSelectionId,
  syntheticEditorialJumboSidebarNode,
} from './utils/editorial-jumbo-sidebar.util';
import {
  storytellingCarouselSidebarSelectionId,
  syntheticStorytellingCarouselSidebarNode,
} from './utils/storytelling-carousel-sidebar.util';
import {
  blogPostsGridSidebarSelectionId,
  syntheticBlogPostsGridSidebarNode,
} from './utils/blog-posts-grid-sidebar.util';
import {
  blogPostsEditorialSidebarSelectionId,
  syntheticBlogPostsEditorialSidebarNode,
} from './utils/blog-posts-editorial-sidebar.util';
import {
  blogPostsCarouselSidebarSelectionId,
  syntheticBlogPostsCarouselSidebarNode,
} from './utils/blog-posts-carousel-sidebar.util';
import {
  editorialSidebarSelectionId,
  syntheticEditorialSidebarNode,
} from './utils/editorial-sidebar.util';
import {
  imageCompareSidebarSelectionId,
  syntheticImageCompareSidebarNode,
} from './utils/image-compare-sidebar.util';
import {
  imageWithTextSidebarSelectionId,
  syntheticImageWithTextSidebarNode,
} from './utils/image-with-text-sidebar.util';
import {
  storytellingVideoSidebarPathsFromNodeId,
  storytellingVideoSidebarSelectionId,
  syntheticStorytellingVideoSidebarNode,
} from './utils/storytelling-video-sidebar.util';
import {
  extendStorytellingVideoMediaBlockValues,
  storytellingVideoMediaFieldDefs,
} from './sidebar/theme-editor-storytelling-video-media-panel.utils';
import {
  isStorytellingVideoMediaBlockNodeId,
} from './sidebar/theme-editor-storytelling-video-block-panel.utils';
import {
  extendImageWithTextContentGroupValues,
  imageWithTextContentGroupCustomSizeFieldDefs,
  imageWithTextContentGroupFieldDefs,
  imageWithTextContentGroupSettingsBaseFromNodeId,
  isImageWithTextGroupBlockNodeId,
} from './sidebar/theme-editor-image-with-text-group-panel.utils';
import {
  extendImageWithTextImageBlockValues,
  imageWithTextImageFieldDefsFromNodeId,
  isImageWithTextImageBlockNodeIdForSeed,
} from './sidebar/theme-editor-image-with-text-image-panel.utils';
import {
  comparisonSliderBlockFieldDefsFromNodeId,
  extendComparisonSliderBlockValues,
  isImageCompareSliderBlockNodeId,
} from './sidebar/theme-editor-image-compare-slider-block-panel.utils';
import {
  extendImageCompareButtonBlockValues,
  extendImageCompareTypographyBlockValues,
  imageCompareBlockFieldDefsFromNodeId,
  isImageCompareButtonBlockNodeId,
  isImageCompareHeadingBlockNodeId,
  isImageCompareSubheadingBlockNodeId,
} from './sidebar/theme-editor-image-compare-block-panel.utils';
import {
  extendEditorialTextGroupValues,
  editorialTextGroupFieldDefsFromNodeId,
  isEditorialNestedGroupBlockNodeId,
} from './sidebar/theme-editor-editorial-group-panel.utils';
import {
  extendEditorialContentGroupValues,
  editorialContentGroupFieldDefsFromNodeId,
  isEditorialContentGroupBlockNodeId,
} from './sidebar/theme-editor-editorial-content-group-panel.utils';
import {
  editorialBlockFieldDefsFromNodeId,
  extendEditorialBlockValues,
  isEditorialMediaBlockNodeId,
  isEditorialCaptionBlockNodeId,
  isEditorialHeadingBlockNodeId,
  isEditorialTextBlockNodeId,
  isEditorialButtonBlockNodeId,
} from './sidebar/theme-editor-editorial-block-panel.utils';
import {
  storytellingCarouselBlockFieldDefsFromNodeId,
  extendStorytellingCarouselBlockValues,
  storytellingCarouselBlockKindFromNodeId,
  isStorytellingCarouselCardBlockNodeId,
} from './sidebar/theme-editor-storytelling-carousel-block-panel.utils';
import {
  extendStorytellingCarouselCardValues,
  storytellingCarouselCardFieldDefsFromNodeId,
} from './sidebar/theme-editor-storytelling-carousel-card-panel.utils';
import {
  extendStorytellingCarouselContentGroupValues,
  isStorytellingCarouselContentGroupBlockNodeId,
  storytellingCarouselContentGroupFieldDefsFromNodeId,
} from './sidebar/theme-editor-storytelling-carousel-content-group-panel.utils';
import {
  extendStorytellingCarouselHeaderGroupValues,
  isStorytellingCarouselHeaderGroupBlockNodeId,
  storytellingCarouselHeaderFieldDefsFromNodeId,
} from './sidebar/theme-editor-storytelling-carousel-header-panel.utils';
import {
  blogPostsGridBlockFieldDefsFromNodeId,
  blogPostsGridBlockKindFromNodeId,
  extendBlogPostsGridBlockValues,
} from './sidebar/theme-editor-blog-posts-grid-block-panel.utils';
import {
  blogPostsGridCardFieldDefsFromNodeId,
  extendBlogPostsGridCardValues,
  isBlogPostsGridCardGroupBlockNodeId,
} from './sidebar/theme-editor-blog-posts-grid-card-panel.utils';
import {
  extendEditorialJumboContentGroupValues,
  editorialJumboContentGroupFieldDefsFromNodeId,
  isEditorialJumboContentGroupBlockNodeId,
} from './sidebar/theme-editor-editorial-jumbo-content-group-panel.utils';
import {
  editorialJumboBlockFieldDefsFromNodeId,
  extendEditorialJumboBlockValues,
  isEditorialJumboMediaBlockNodeId,
  isEditorialJumboJumboTextBlockNodeId,
} from './sidebar/theme-editor-editorial-jumbo-block-panel.utils';
import {
  extendImageCompareContentGroupValues,
  imageCompareContentGroupFieldDefsFromNodeId,
  isImageCompareContentGroupBlockNodeId,
} from './sidebar/theme-editor-image-compare-content-group-panel.utils';
import {
  extendImageCompareButtonsGroupValues,
  imageCompareButtonsGroupFieldDefsFromNodeId,
  isImageCompareButtonsGroupBlockNodeId,
} from './sidebar/theme-editor-image-compare-buttons-group-panel.utils';
import {
  extendImageCompareTextGroupValues,
  imageCompareTextGroupFieldDefsFromNodeId,
  isImageCompareTextGroupBlockNodeId,
} from './sidebar/theme-editor-image-compare-text-group-panel.utils';
import {
  extendStorytellingVideoCaptionGroupValues,
  isStorytellingVideoCaptionGroupBlockNodeId,
  storytellingVideoCaptionCustomSizeFieldDefs,
  storytellingVideoCaptionFieldDefs,
} from './sidebar/theme-editor-storytelling-video-caption-panel.utils';
import {
  applyCollectionListLayoutDefaultsToValues,
  isCollectionListCardsLayoutTypePath,
} from './utils/collection-list-layout-defaults.util';
import { parseCollectionListCardsLayoutType } from './sidebar/theme-editor-collection-list-panel.utils';
import {
  extendFeaturedCollectionSectionValues,
  featuredCollectionFieldDefs,
  featuredCollectionSettingsBaseFromNodeId,
  isFeaturedCollectionSectionNodeId,
  readFeaturedCollectionLayoutType,
  readFeaturedCollectionCatalogVariant,
  resolveFeaturedCollectionVariant,
} from './sidebar/theme-editor-featured-collection-panel.utils';
import { applyStoreMenuSelectionToConfig, pruneStaleHeaderMenuItemValues } from './utils/store-menu-header.util';
import { useStoreCustomThemes } from '../contexts/store-custom-themes.context';
import { useStoreCheckoutConfigurations } from '../contexts/store-checkout-configurations.context';
import {
  applyValuesToThemeConfig,
  collectEditableFieldPaths,
} from '../utils/theme-editor-config.utils';
import {
  extendValuesForFaqNestedBlock,
  extendValuesForHeroBlock,
  extendValuesForLayoutBlock,
  extendValuesForLayoutInstance,
  extendValuesForTemplateBlock,
  extendValuesForTemplateInstance,
  getLayoutOrder,
  insertBlockFromCatalog,
  pruneValuesForLayoutBlock,
  pruneValuesForLayoutInstance,
  pruneValuesForTemplateBlock,
  pruneValuesForTemplateInstance,
  layoutBlueprintKey,
  removeLayoutSection,
  removeTemplateSection,
  templateBlueprintKey,
  templateIdForPage,
  type ThemeEditorDeleteOptions,
} from '../utils/theme-editor-insert-section';
import {
  creatorConfigHasSections,
  formValuesFromEditorConfig,
  loadCreatorThemeEditorPack,
  normalizeCreatorThemeConfig,
  resetCreatorThemeGlobalSettings,
} from '../utils/theme-editor-static-pack';
import { setConfigAtPath } from '../utils/theme-editor-config.utils';
import { ensureCollectionsListTemplateBlocks } from '../utils/collections-list-preset.util';
import {
  ensureCollectionPageTemplateBlocks,
  ensureAllProductsPageTemplateBlocks,
  ALL_PRODUCTS_TEMPLATE_ID,
} from '../utils/collection-page-preset.util';
import {
  ensureBlogPostsPageTemplateBlocks,
  ensureBlogsPageTemplateBlocks,
} from '../utils/blog-page-preset.util';
import {
  ensurePasswordPageTemplateBlocks,
  PASSWORD_TEMPLATE_ID,
} from '../utils/password-page-preset.util';
import {
  ensureNotFoundPageTemplateBlocks,
  NOT_FOUND_TEMPLATE_ID,
} from '../utils/not-found-page-preset.util';
import { resolveCollectionTemplatePreviewRoute } from './utils/collection-page-preview.util';
import { isCollectionTemplatePreviewPage } from './utils/collection-templates.util';
import { CollectionTemplatePreviewCard } from './sidebar/CollectionTemplatePreviewCard';
import { ensureFeaturedProductSectionBlocks } from '../utils/featured-product-preset.util';
import { ensureProductHighlightSectionBlocks } from '../utils/product-highlight-preset.util';
import { ensureProductHotspotsSectionBlocks } from '../utils/product-hotspots-preset.util';
import { ensureRecommendedProductsSectionBlocks } from '../utils/recommended-products-preset.util';
import { ensureStorytellingVideoSectionBlocks } from '../utils/storytelling-video-preset.util';
import { ensureFaqSectionBlocks } from '../utils/faq-preset.util';
import {
  extendValuesForFaqSectionBlock,
  extendValuesForNewFaqAccordionRow,
  pruneValuesForFaqAccordionRow,
  pruneValuesForFaqRowText,
  pruneValuesForFaqSectionBlock,
} from '../utils/faq-editor-values.util';
import { mergedConfigFromFormValues } from '../utils/theme-editor-static-save';
import { fieldTypeFromSchema, type ThemeEditorFieldType } from './sidebar/create-theme-field.utils';
import {
  announcementBlockFieldDefsFromSchema,
  announcementBlockNodeIdFromSelection,
  blockInstanceIdFromAnnouncementBlockNodeId,
  instanceIdFromAnnouncementBlockNodeId,
  isAnnouncementBlockNodeId,
} from './sidebar/theme-editor-announcement-block-panel.utils';
import {
  collectionLinkBlockFieldDefsFromSchema,
  isCollectionLinkBlockNodeId,
} from './sidebar/theme-editor-collection-link-block-panel.utils';
import {
  collectionLinkImageFieldDefsFromSchema,
  isCollectionLinkImageFieldNodeId,
} from './sidebar/theme-editor-collection-link-image-panel.utils';
import {
  collectionLinkTitleFieldDefsFromSchema,
  isCollectionLinkTitleFieldNodeId,
} from './sidebar/theme-editor-collection-link-title-panel.utils';
import {
  headerMenuBlockFieldDefsFromSchema,
  instanceIdFromHeaderMenuBlockNodeId,
} from './sidebar/theme-editor-header-menu-block-panel.utils';
import { isHeaderMenuBlockNodeId } from './sidebar/theme-editor-header-panel.utils';
import {
  extendFeaturedProductDetailsBlockValues,
  featuredProductDetailsFieldDefsFromSchema,
  isFeaturedProductDetailsBlockNodeId,
} from './sidebar/theme-editor-featured-product-details-block-panel.utils';
import {
  extendFeaturedProductHeaderBlockValues,
  featuredProductHeaderFieldDefsFromSchema,
  isFeaturedProductHeaderBlockNodeId,
} from './sidebar/theme-editor-featured-product-header-block-panel.utils';
import {
  extendFeaturedProductAddToCartBlockValues,
  featuredProductAddToCartFieldDefsFromSchema,
  isFeaturedProductAddToCartNestedNodeId,
} from './sidebar/theme-editor-featured-product-add-to-cart-panel.utils';
import {
  extendFeaturedProductQuantityBlockValues,
  featuredProductQuantityFieldDefsFromSchema,
  isFeaturedProductQuantityNestedNodeId,
} from './sidebar/theme-editor-featured-product-quantity-panel.utils';
import {
  extendFeaturedProductBuyButtonsBlockValues,
  featuredProductBuyButtonsFieldDefsFromSchema,
  isFeaturedProductBuyButtonsBlockNodeId,
} from './sidebar/theme-editor-featured-product-buy-buttons-block-panel.utils';
import {
  extendFeaturedProductHeaderPriceBlockValues,
  featuredProductHeaderPriceFieldDefsFromSchema,
  isFeaturedProductHeaderPriceNestedNodeId,
} from './sidebar/theme-editor-featured-product-header-price-panel.utils';
import {
  extendFeaturedProductHeaderTitleBlockValues,
  featuredProductHeaderTitleFieldDefsFromSchema,
  isFeaturedProductHeaderTitleNestedNodeId,
} from './sidebar/theme-editor-featured-product-header-title-panel.utils';
import {
  extendProductHighlightProductBlockValues,
  isProductHighlightProductNestedNodeId,
  productHighlightProductBlockFieldDefsFromSchema,
} from './sidebar/theme-editor-product-highlight-product-block-panel.utils';
import {
  extendProductHighlightMediaBlockValues,
  isProductHighlightMediaBlockNodeId,
  isProductHighlightMediaContext,
  productHighlightMediaFieldDefsFromSchema,
} from './sidebar/theme-editor-product-highlight-media-block-panel.utils';
import {
  extendFeaturedProductReviewStarsBlockValues,
  featuredProductReviewStarsFieldDefsFromSchema,
  isFeaturedProductReviewStarsBlockNodeId,
} from './sidebar/theme-editor-featured-product-review-stars-block-panel.utils';
import {
  extendFeaturedProductVariantPickerBlockValues,
  featuredProductVariantPickerFieldDefsFromSchema,
  isFeaturedProductVariantPickerBlockNodeId,
} from './sidebar/theme-editor-featured-product-variant-picker-block-panel.utils';
import {
  extendFeaturedProductMediaBlockValues,
  featuredProductMediaFieldDefsFromSchema,
  isFeaturedProductMediaBlockNodeId,
} from './sidebar/theme-editor-featured-product-media-block-panel.utils';
import {
  seedSectionEnabledValues,
  sectionEnabledPathFromNodeId,
} from '../utils/theme-editor-section-visibility.util';
import './chrome/create-theme-chrome.css';
import { insertCreateThemeElement } from './_shared/insert-element';
import { AddBlockModal } from '../components/themes/theme-editor-sidebar/AddBlockModal';
import type { BlockCatalogItem } from '../components/themes/theme-editor-sidebar/add-block-catalog';
import type { ThemeBlockCatalogApi } from '../components/themes/theme-editor-sidebar/theme-block-catalog.adapter';
import { getCreateThemeElement } from './registry';
import { CreateThemeAddSectionModal } from './shell/CreateThemeAddSectionModal';
import { CreateThemeSaveModal } from './shell/CreateThemeSaveModal';
import type { CreateThemeCatalogGroup } from './types';

type FieldType = ThemeEditorFieldType;

const CREATOR_DELETE: ThemeEditorDeleteOptions = { creatorMode: true };

export type CreateThemePageMode = 'theme' | 'checkout-profile';

export type CreateThemePageProps = {
  mode?: CreateThemePageMode;
};

const CreateThemePage: React.FC<CreateThemePageProps> = ({ mode = 'theme' }) => {
  const location = useLocation();
  const { configId: checkoutConfigId } = useParams<{ configId?: string }>();
  const isCheckoutProfile =
    mode === 'checkout-profile' ||
    location.pathname.startsWith('/checkout/editor') ||
    /^\/themes\/editor\/checkout\/[^/]+/.test(location.pathname);
  const exitPath = isCheckoutProfile ? '/settings/checkout' : '/online-store/themes';

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editThemeId = searchParams.get('id');
  const { activeStoreId, stores, setStores, applyStoreCustomTheme } = useStore();
  const [applyingTheme, setApplyingTheme] = useState(false);
  const { collections, fetchCollectionsByStoreId } = useCollections();
  const { storeSubdomain, getByStoreId: fetchStoreSubdomain, loading: subdomainLoading } = useStoreSubdomain();
  const {
    create: createStoreCustomTheme,
    update: updateStoreCustomTheme,
    getByStoreId,
    loading: savingTheme,
  } = useStoreCustomThemes();
  const {
    configuration: checkoutConfiguration,
    getById: getCheckoutConfigurationById,
    getByStoreId: getCheckoutConfigurationByStoreId,
    create: createCheckoutConfiguration,
    update: updateCheckoutConfiguration,
  } = useStoreCheckoutConfigurations();
  const [checkoutConfigHydrated, setCheckoutConfigHydrated] = useState(false);
  const [checkoutConfigError, setCheckoutConfigError] = useState<string | null>(null);
  const [savingCheckoutConfiguration, setSavingCheckoutConfiguration] = useState(false);
  const [checkoutHeaderPosition, setCheckoutHeaderPosition] =
    useState<CheckoutHeaderPosition>('checkout_form');
  const [checkoutOrderSummaryConfig, setCheckoutOrderSummaryConfig] =
    useState<Required<CheckoutOrderSummaryConfig>>({
      backgroundColor: 'default',
      accentColor: 'default',
      backgroundImage: null,
    });
  const [checkoutFooterConfig, setCheckoutFooterConfig] =
    useState<Required<CheckoutFooterConfig>>({
      location: 'checkout_form',
      alignment: 'left',
    });
  const [checkoutSignInMainConfig, setCheckoutSignInMainConfig] =
    useState<Required<CheckoutSignInMainConfig>>({
      logoImage: null,
      backgroundColor: '#ffffff',
      accentColor: 'default',
      mediaImage: null,
    });
  const [checkoutThankYouMainConfig, setCheckoutThankYouMainConfig] =
    useState<Required<CheckoutThankYouMainConfig>>({
      backgroundColor: 'default',
      accentColor: 'default',
      backgroundImage: null,
    });
  const [checkoutGlobalSettings, setCheckoutGlobalSettings] =
    useState<Required<CheckoutGlobalSettings>>({
      layout: 'one_page',
      addressAutocompletion: false,
      buyAgainButton: false,
      logoImage: null,
      logoAlignment: 'left',
      logoWidth: 50,
      colorPalette: ['#005bd3', '#ffffff', '#f6f6f7'],
      mainBackgroundColor: 'default',
      headerBackgroundColor: 'default',
      headerAccentColor: 'default',
      accentColor: 'default',
      buttonColor: 'default',
      inputFieldsErrorColor: 'default',
      inputFieldsTransparent: false,
      typographyHeadings: 'default',
      typographyBody: 'default',
    });

  const [themeName, setThemeName] = useState('Creator Basic');
  const [savedThemeId, setSavedThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorSchema, setEditorSchema] = useState<EditorSchemaDoc | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [defaultConfig, setDefaultConfig] = useState<Record<string, unknown> | null>(null);
  const packDefaultRef = useRef<Record<string, unknown> | null>(null);
  const [manifest, setManifest] = useState<Record<string, unknown> | null>(null);
  const [blockCatalog, setBlockCatalog] = useState<ThemeBlockCatalogApi | null>(null);
  const [themeRuntime, setThemeRuntime] = useState<{ jsUrl?: string | null; cssUrl?: string | null }>({});

  const [previewPage, setPreviewPage] = useState<ThemePreviewPage>(
    isCheckoutProfile ? 'checkout' : 'index'
  );
  const [previewCollectionHandle, setPreviewCollectionHandle] = useState<string | null>(null);
  const [checkoutPreviewPage, setCheckoutPreviewPage] = useState<CheckoutEditorPage>('checkout');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [inspectorEnabled, setInspectorEnabled] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<ThemeEditorSidebarTab>('sections');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hiddenNodes, setHiddenNodes] = useState<Record<string, boolean>>({});
  const [itemOrder, setItemOrder] = useState<Record<string, string[]>>({});
  const [structureSyncKey, setStructureSyncKey] = useState(0);
  const [structureDragging, setStructureDragging] = useState(false);

  useEffect(() => {
    if (!structureDragging) return;
    const end = () => setStructureDragging(false);
    window.addEventListener('dragend', end);
    window.addEventListener('drop', end);
    return () => {
      window.removeEventListener('dragend', end);
      window.removeEventListener('drop', end);
    };
  }, [structureDragging]);

  const {
    committedValues,
    previewBarRunKey,
    onPreviewBarComplete,
    seedCommittedPreview,
    commitPreviewNow,
  } = usePreviewEditSync(values);
  const [insertHoverHighlight, setInsertHoverHighlight] = useState<SectionInsertContext | null>(null);
  const [addSectionTarget, setAddSectionTarget] = useState<{
    groupId: CreateThemeCatalogGroup;
    groupLabel: string;
    afterNodeId?: string;
    beforeNodeId?: string;
  } | null>(null);
  const [addBlockTarget, setAddBlockTarget] = useState<{
    nodeId: string;
    sectionLabel: string;
  } | null>(null);
  const [showSaveThemeModal, setShowSaveThemeModal] = useState(false);
  const [themeDesc, setThemeDesc] = useState('');

  const treeInitRef = useRef(false);
  const livePreviewRef = useRef<CreateThemeLivePreviewHandle>(null);
  const previewStoreId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
  const activeStoreName =
    stores.find((s) => s._id === previewStoreId)?.storeName ?? 'Preview store';
  const checkoutConfigurationName = `${activeStoreName} configuration`;

  useEffect(() => {
    if (!isCheckoutProfile) return;
    setThemeName(checkoutConfigurationName);
  }, [isCheckoutProfile, checkoutConfigurationName]);

  useEffect(() => {
    if (activeStoreId) {
      void fetchStoreSubdomain(activeStoreId);
    }
  }, [activeStoreId, fetchStoreSubdomain]);

  useEffect(() => {
    if (!isCheckoutProfile || !checkoutConfigId) {
      setCheckoutConfigHydrated(false);
      setCheckoutConfigError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setCheckoutConfigError(null);
      try {
        const doc = await getCheckoutConfigurationById(checkoutConfigId);
        if (cancelled) return;
        if (activeStoreId && String(doc.storeId) !== String(activeStoreId)) {
          setCheckoutConfigError('This checkout configuration belongs to another store.');
          return;
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setCheckoutConfigError(
            (err as Error)?.message ?? 'Failed to load checkout configuration'
          );
        }
      } finally {
        if (!cancelled) setCheckoutConfigHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCheckoutProfile, checkoutConfigId, getCheckoutConfigurationById, activeStoreId]);

  useEffect(() => {
    if (!isCheckoutProfile || !checkoutConfiguration?.checkoutConfig) return;
    const activePage = checkoutConfiguration.checkoutConfig.activePage;
    if (
      typeof activePage === 'string' &&
      ['checkout', 'thank-you', 'sign-in', 'signup', 'orders', 'order-status', 'profile'].includes(activePage)
    ) {
      setCheckoutPreviewPage(activePage as CheckoutEditorPage);
    }
    setCheckoutHeaderPosition(readCheckoutHeaderPosition(checkoutConfiguration.checkoutConfig));
    setCheckoutOrderSummaryConfig(
      readCheckoutOrderSummaryConfig(checkoutConfiguration.checkoutConfig)
    );
    setCheckoutFooterConfig(readCheckoutFooterConfig(checkoutConfiguration.checkoutConfig));
    setCheckoutSignInMainConfig(readCheckoutSignInMainConfig(checkoutConfiguration.checkoutConfig));
    setCheckoutThankYouMainConfig(readCheckoutThankYouMainConfig(checkoutConfiguration.checkoutConfig));
    setCheckoutGlobalSettings(readCheckoutGlobalSettings(checkoutConfiguration.checkoutConfig));
  }, [isCheckoutProfile, checkoutConfiguration]);

  const openAddSectionModal = useCallback((ctx: SectionInsertContext) => {
    setInsertHoverHighlight(null);
    setAddSectionTarget({
      groupId: ctx.groupId as CreateThemeCatalogGroup,
      groupLabel: ctx.groupLabel,
      afterNodeId: ctx.afterNodeId,
      beforeNodeId: ctx.beforeNodeId,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setSavedThemeId(null);
      try {
        const data = await loadCreatorThemeEditorPack('horizon');
        if (cancelled) return;
        const schema = data.editorSchema as EditorSchemaDoc;
        packDefaultRef.current = JSON.parse(JSON.stringify(data.defaultConfig ?? {})) as Record<
          string,
          unknown
        >;

        let config = JSON.parse(JSON.stringify(data.config)) as Record<string, unknown>;
        let nextValues = { ...data.values };
        let nextName = isCheckoutProfile
          ? checkoutConfigurationName
          : (config.themeName as string) || data.themeName || 'Creator Basic';
        let loadedSavedId: string | null = null;

        const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
        if (!isCheckoutProfile && editThemeId && storeId) {
          const list = await getByStoreId(storeId);
          if (cancelled) return;
          const saved = list.find((t) => t._id === editThemeId);
          if (saved?.themeConfig && typeof saved.themeConfig === 'object') {
            config = JSON.parse(JSON.stringify(saved.themeConfig)) as Record<string, unknown>;
            normalizeCreatorThemeConfig(config);
            ensureAllAlternateTemplateRegistries(config);
            nextValues = creatorConfigHasSections(config)
              ? {
                  ...formValuesFromEditorConfig(schema, config),
                  ...seedSectionEnabledValues(config),
                }
              : nextValues;
            nextName = saved.themeName?.trim() || nextName;
            setThemeDesc(saved.themeDesc?.trim() ?? '');
            loadedSavedId = saved._id;
          } else if (editThemeId) {
            toast.error('Saved theme not found');
          }
        }

        normalizeCreatorThemeConfig(config);
        if (
          ensureCollectionsListTemplateBlocks(config) ||
          ensureCollectionPageTemplateBlocks(config) ||
          ensureAllProductsPageTemplateBlocks(config) ||
          ensureBlogsPageTemplateBlocks(config) ||
          ensureBlogPostsPageTemplateBlocks(config) ||
          ensurePasswordPageTemplateBlocks(config) ||
          ensureNotFoundPageTemplateBlocks(config) ||
          ensureFeaturedProductSectionBlocks(config) ||
          ensureProductHighlightSectionBlocks(config) ||
          ensureProductHotspotsSectionBlocks(config) ||
          ensureRecommendedProductsSectionBlocks(config) ||
          ensureStorytellingVideoSectionBlocks(config) ||
          ensureFaqSectionBlocks(config)
        ) {
          nextValues = {
            ...nextValues,
            ...formValuesFromEditorConfig(schema, config),
          };
        }
        nextValues = seedThemeVariantPickersValues(
          seedThemeSwatchesValues(
            seedThemeSearchValues(
            seedThemeProductCardsValues(
            seedThemePricesValues(
            seedThemePopoversModalsValues(
            seedThemeInputFieldsValues(
              seedThemeIconsValues(
                seedThemeProductMediaValues(
                  seedThemeDrawersValues(
                    seedThemeCartValues(
                      seedThemeButtonsValues(
                        seedThemeBadgesValues(
                          seedThemeAnimationsValues(
                            seedThemePageValues(
                              seedThemeTypographyValues(seedThemePaletteValues(nextValues, config), config),
                              config
                            ),
                            config
                          ),
                          config
                        ),
                        config
                      ),
                      config
                    ),
                    config
                  ),
                  config
                ),
                config
              ),
              config
            ),
            config
          ),
          config
        ),
          config
        ),
          config
        ),
          config
        ),
          config
        );
        ensureRegistryTemplatesInConfig(config);
        ensureAllAlternateTemplateRegistries(config);

        setEditorSchema(schema);
        setDefaultConfig(config);
        setValues(nextValues);
        seedCommittedPreview(nextValues);
        setManifest(data.manifest);
        setBlockCatalog(data.blockCatalog);
        setThemeRuntime(data.themeRuntime);
        setThemeName(nextName);
        setSavedThemeId(loadedSavedId);
        setItemOrder(readStructureOrderFromConfig(config, 'index'));
        treeInitRef.current = false;
      } catch (err: unknown) {
        if (!cancelled) {
          setError((err as Error)?.message ?? 'Failed to load theme creator');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editThemeId, activeStoreId, getByStoreId, isCheckoutProfile, activeStoreName]);

  const debouncedValuesForTree = useDebouncedValue(values, 140);
  const tplId = templateIdForPage(previewPage);
  const hasSections = useMemo(
    () => creatorConfigHasSections(defaultConfig, tplId),
    [defaultConfig, tplId]
  );

  const treeConfig = useMemo(() => {
    if (!defaultConfig || !editorSchema) return defaultConfig ?? {};
    if (!hasSections) return defaultConfig;
    return applyValuesToThemeConfig(defaultConfig, debouncedValuesForTree, editorSchema);
  }, [defaultConfig, debouncedValuesForTree, editorSchema, hasSections]);

  const previewConfig = useMemo(() => {
    if (!defaultConfig || !editorSchema) return defaultConfig ?? {};
    if (!hasSections) return defaultConfig;
    return applyValuesToThemeConfig(defaultConfig, values, editorSchema);
  }, [defaultConfig, values, editorSchema, hasSections]);

  const sectionsTree = useMemo(() => {
    if (isCheckoutProfile) {
      if (checkoutPreviewPage === 'sign-in') {
        return buildCheckoutSignInSidebarTree();
      }
      if (checkoutPreviewPage === 'signup') {
        return buildCheckoutSignUpSidebarTree();
      }
      if (checkoutPreviewPage === 'thank-you') {
        return buildCheckoutThankYouSidebarTree();
      }
      if (checkoutPreviewPage === 'orders') {
        return buildCheckoutOrdersSidebarTree();
      }
      if (checkoutPreviewPage === 'order-status') {
        return buildCheckoutOrderStatusSidebarTree();
      }
      if (checkoutPreviewPage === 'profile') {
        return buildCheckoutAccountProfileSidebarTree();
      }
      return buildCheckoutProfileSidebarTree();
    }
    if (!editorSchema || !defaultConfig) {
      return buildEmptyShopifySidebarTree(previewPage);
    }
    if (!hasSections) {
      return buildEmptyShopifySidebarTree(previewPage);
    }
    return withCreatorSidebarDeleteFlags(
      buildShopifySidebarTree(
        editorSchema,
        debouncedValuesForTree,
        previewPage,
        itemOrder,
        JSON.parse(JSON.stringify(treeConfig)) as Record<string, unknown>
      )
    );
  }, [
    isCheckoutProfile,
    checkoutPreviewPage,
    editorSchema,
    debouncedValuesForTree,
    previewPage,
    itemOrder,
    treeConfig,
    hasSections,
    defaultConfig,
  ]);

  const themeSettingsTree = useMemo(
    () => (editorSchema ? buildThemeSettingsSidebarTree(editorSchema) : []),
    [editorSchema]
  );

  const activeTree = sidebarTab === 'sections' ? sectionsTree : themeSettingsTree;

  useEffect(() => {
    treeInitRef.current = false;
  }, [isCheckoutProfile, checkoutPreviewPage]);

  useEffect(() => {
    if (!isCheckoutProfile) return;
    setSelectedNodeId('');
  }, [checkoutPreviewPage, isCheckoutProfile]);

  useEffect(() => {
    if (!activeTree.length) return;
    if (!treeInitRef.current) {
      treeInitRef.current = true;
      setExpanded(
        isCheckoutProfile
          ? checkoutPreviewPage === 'sign-in'
            ? defaultCheckoutSignInSidebarExpanded()
            : checkoutPreviewPage === 'signup'
              ? defaultCheckoutSignUpSidebarExpanded()
            : checkoutPreviewPage === 'thank-you'
              ? defaultCheckoutThankYouSidebarExpanded()
              : checkoutPreviewPage === 'orders'
                ? defaultCheckoutOrdersSidebarExpanded()
                : checkoutPreviewPage === 'order-status'
                  ? defaultCheckoutOrderStatusSidebarExpanded()
                : checkoutPreviewPage === 'profile'
                  ? defaultCheckoutAccountProfileSidebarExpanded()
                  : defaultCheckoutProfileSidebarExpanded()
          : defaultExpandedSidebar(activeTree)
      );
    }
  }, [activeTree, sidebarTab, isCheckoutProfile, checkoutPreviewPage]);

  const pageMenuItems = useMemo(
    () => buildThemeEditorPageMenu(manifest, editorSchema),
    [manifest, editorSchema]
  );

  const pageLabel = isCheckoutProfile
    ? findCheckoutEditorPageLabel(checkoutPreviewPage)
    : allRegistryPageIds().has(previewPage)
      ? registryLabel(previewPage)
      : findPageMenuItemByPreviewWithConfig(pageMenuItems, previewPage, defaultConfig)?.label ??
        'Home page';

  const selectedNode = useMemo(() => {
    const found = findSidebarNode(activeTree, selectedNodeId);
    if (found) return found;
    return (
      syntheticCollectionListSidebarNode(selectedNodeId, editorSchema) ??
      syntheticContactFormSidebarNode(selectedNodeId, editorSchema) ??
      syntheticEmailSignupSidebarNode(selectedNodeId, editorSchema) ??
      syntheticImageCompareSidebarNode(selectedNodeId, editorSchema) ??
      syntheticEditorialJumboSidebarNode(selectedNodeId, editorSchema) ??
      syntheticEditorialSidebarNode(selectedNodeId, editorSchema) ??
      syntheticStorytellingCarouselSidebarNode(selectedNodeId, editorSchema) ??
      syntheticBlogPostsGridSidebarNode(selectedNodeId, editorSchema) ??
      syntheticBlogPostsEditorialSidebarNode(selectedNodeId, editorSchema) ??
      syntheticBlogPostsCarouselSidebarNode(selectedNodeId, editorSchema) ??
      syntheticImageWithTextSidebarNode(selectedNodeId, editorSchema) ??
      syntheticStorytellingVideoSidebarNode(selectedNodeId, editorSchema)
    );
  }, [activeTree, selectedNodeId, editorSchema]);

  const settingsNode = useMemo(
    () => settingsNodeForSelection(selectedNode, activeTree, editorSchema, values, previewConfig),
    [selectedNode, activeTree, editorSchema, values, previewConfig]
  );

  /** Sync heading block panel values (text mirror + style field seed from config). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeadingBlockNodeId(selectedNodeId)) return;
    const parsed = parseHeadingBlockNodeId(selectedNodeId);
    if (!parsed) return;
    const settingsBase =
      parsed.placement === 'layout'
        ? `sections.${parsed.sectionInstanceId}.settings`
        : `templates.${parsed.templateId}.sections.${parsed.sectionInstanceId}.settings`;
    const blocksBase =
      parsed.placement === 'layout'
        ? `sections.${parsed.sectionInstanceId}.blocks`
        : `templates.${parsed.templateId}.sections.${parsed.sectionInstanceId}.blocks`;
    const titlePath = `${settingsBase}.title`;
    const blockPath = `${blocksBase}.${parsed.blockInstanceId}.settings.heading`;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      let next = extendValuesForHeadingBlock(prev, editorSchema, selectedNodeId, merged);
      const title = next[titlePath];
      const block = next[blockPath];
      if (title === undefined && block !== undefined) {
        next = mirrorHeadingTextInValues(next, blockPath, block);
      } else if (block === undefined && title !== undefined) {
        next = mirrorHeadingTextInValues(next, titlePath, title);
      }
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed featured collection Collection title block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isCollectionTitleNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForCollectionTitleBlock(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed featured collection View all button panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isViewAllButtonNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForViewAllButtonBlock(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Product card block panel values (featured collection / recommended products). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isProductCardBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForProductCardBlock(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Recommended products → Header block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isRecommendedProductsHeaderNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForRecommendedProductsHeader(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Product card → Media block panel values (featured collection / recommended products). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isProductCardMediaNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForProductCardMediaBlock(
        prev,
        editorSchema,
        selectedNodeId,
        merged
      );
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Product card → Product title block panel values (featured collection / recommended products). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isProductCardTitleNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForProductCardTitleBlock(
        prev,
        editorSchema,
        selectedNodeId,
        merged
      );
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Product card → Price block panel values (featured collection / recommended products). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isProductCardPriceNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForProductCardPriceBlock(
        prev,
        editorSchema,
        selectedNodeId,
        merged
      );
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed featured collection Header block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedCollectionHeaderBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForFeaturedCollectionHeaderBlock(
        prev,
        editorSchema,
        selectedNodeId,
        merged
      );
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed large-logo Logo block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeroLargeLogoBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForLargeLogoBlock(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed large-logo Text block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeroTextBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForHeroTextBlock(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed 404 message text block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isNotFoundMainMessageBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForNotFoundMainMessage(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed 404 section container panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isNotFoundMainSectionNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForNotFoundMainSection(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Hero: Marquee Spacer/Text virtual block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !/:hero_main(?:_\d+)?:(?:group:(?:marquee:text|spacer:spacer)|marquee)/.test(selectedNodeId)) {
      return;
    }

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForHeroMarquee(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Hero: Bottom aligned "Group" block panel values from merged config. */
  useEffect(() => {
    if (
      !editorSchema ||
      !defaultConfig ||
      !/:hero_main(?:_\d+)?:block:content_group(?::nested:heading_group)?$/.test(selectedNodeId)
    ) {
      return;
    }

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForHeroBottomGroup(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Hero: Bottom aligned nested Text/Heading block panel values from merged config. */
  useEffect(() => {
    if (
      !editorSchema ||
      !defaultConfig ||
      !/:hero_main(?:_\d+)?:block:content_group(?::nested:heading_group)?:nested:(?:text_intro|heading_main|text_body)$/.test(
        selectedNodeId
      )
    ) {
      return;
    }

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForHeroBottomText(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed accordion block panel values from merged config when opening the panel. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFaqAccordionBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForFaqAccordionBlock(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed accordion row panel values from merged config when opening the panel. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFaqAccordionRowNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForFaqAccordionRow(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed accordion row text block panel values from merged config when opening the panel. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFaqAccordionRowTextNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForFaqAccordionRowText(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed menu block paths into `values` when opening the panel (avoids blank controls / no-op edits). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeaderMenuBlockNodeId(selectedNodeId)) return;
    const instanceId = instanceIdFromHeaderMenuBlockNodeId(selectedNodeId);
    if (!instanceId) return;
    const defs = headerMenuBlockFieldDefsFromSchema(editorSchema, instanceId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const config = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const fromConfig = formValuesFromEditorConfig(editorSchema, config);
      const next = { ...prev };
      let changed = false;
      for (const f of defs) {
        if (next[f.path] !== undefined) continue;
        const seeded = fromConfig[f.path];
        if (seeded === undefined) continue;
        next[f.path] = seeded;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed announcement block field paths when opening a block instance (e.g. announcement_2). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isAnnouncementBlockNodeId(selectedNodeId)) return;
    const instanceId = instanceIdFromAnnouncementBlockNodeId(selectedNodeId);
    const blockInstanceId = blockInstanceIdFromAnnouncementBlockNodeId(selectedNodeId);
    if (!instanceId || !blockInstanceId) return;
    const defs = announcementBlockFieldDefsFromSchema(
      editorSchema,
      instanceId,
      blockInstanceId
    );
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const config = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const fromConfig = formValuesFromEditorConfig(editorSchema, config);
      const next = { ...prev };
      let changed = false;
      for (const f of defs) {
        if (next[f.path] !== undefined) continue;
        const seeded = fromConfig[f.path];
        if (seeded === undefined) continue;
        next[f.path] = seeded;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Ensure featured-product / product-highlight sections have block hierarchy when opening block panels. */
  useEffect(() => {
    if (
      !isFeaturedProductMediaBlockNodeId(selectedNodeId) &&
      !isFeaturedProductDetailsBlockNodeId(selectedNodeId) &&
      !isProductHighlightProductNestedNodeId(selectedNodeId) &&
      !isProductHighlightMediaBlockNodeId(selectedNodeId)
    ) {
      return;
    }
    setDefaultConfig((prev) => {
      if (!prev) return prev;
      const draft = JSON.parse(JSON.stringify(prev)) as Record<string, unknown>;
      if (
        !ensureFeaturedProductSectionBlocks(draft) &&
        !ensureProductHighlightSectionBlocks(draft) &&
        !ensureFaqSectionBlocks(draft)
      ) {
        return prev;
      }
      return draft;
    });
  }, [selectedNodeId]);

  /** Seed Product media block field paths (aspect ratio, carousel, padding, etc.). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductMediaBlockNodeId(selectedNodeId)) return;
    if (isProductHighlightMediaContext(defaultConfig, selectedNodeId)) return;
    const defs = featuredProductMediaFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductMediaBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Details block field paths (size, layout, appearance, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductDetailsBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductDetailsFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductDetailsBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Collection list Header group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isCollectionListSectionHeaderBlockNodeId(selectedNodeId)) return;
    const paths = collectionListSidebarPathsFromNodeId(selectedNodeId);
    if (!paths) return;
    const defs = [
      ...collectionListHeaderFieldDefs(paths.settingsBase),
      ...collectionListHeaderCustomSizeFieldDefs(paths.settingsBase),
    ];
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendCollectionListHeaderBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Featured collection section settings field paths. */
  useEffect(() => {
    if (!defaultConfig || !isFeaturedCollectionSectionNodeId(selectedNodeId)) return;
    const settingsBase = featuredCollectionSettingsBaseFromNodeId(selectedNodeId);
    if (!settingsBase) return;
    const defs = featuredCollectionFieldDefs(settingsBase);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      const layoutType = readFeaturedCollectionLayoutType(config, settingsBase);
      const catalogVariant = readFeaturedCollectionCatalogVariant(config, settingsBase);
      const variant = resolveFeaturedCollectionVariant({ layoutType, catalogVariant, fields: defs });
      return extendFeaturedCollectionSectionValues(prev, defs, config, variant);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Storytelling Video Caption group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isStorytellingVideoCaptionGroupBlockNodeId(selectedNodeId)) return;
    const paths = storytellingVideoSidebarPathsFromNodeId(selectedNodeId);
    if (!paths) return;
    const defs = [
      ...storytellingVideoCaptionFieldDefs(paths.settingsBase),
      ...storytellingVideoCaptionCustomSizeFieldDefs(paths.settingsBase),
    ];
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendStorytellingVideoCaptionGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image with text Image block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isImageWithTextImageBlockNodeIdForSeed(selectedNodeId)) return;
    const defs = imageWithTextImageFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendImageWithTextImageBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image with text Group block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isImageWithTextGroupBlockNodeId(selectedNodeId)) return;
    const settingsBase = imageWithTextContentGroupSettingsBaseFromNodeId(selectedNodeId);
    if (!settingsBase) return;
    const defs = [
      ...imageWithTextContentGroupFieldDefs(settingsBase),
      ...imageWithTextContentGroupCustomSizeFieldDefs(settingsBase),
    ];
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendImageWithTextContentGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Editorial Content group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isEditorialContentGroupBlockNodeId(selectedNodeId)) return;
    const defs = editorialContentGroupFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendEditorialContentGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Editorial nested Group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isEditorialNestedGroupBlockNodeId(selectedNodeId)) return;
    const defs = editorialTextGroupFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendEditorialTextGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Editorial block field paths. */
  useEffect(() => {
    if (!defaultConfig) return;
    const blockKind = isEditorialMediaBlockNodeId(selectedNodeId)
      ? 'media'
      : isEditorialCaptionBlockNodeId(selectedNodeId)
        ? 'caption'
        : isEditorialHeadingBlockNodeId(selectedNodeId)
          ? 'heading'
          : isEditorialTextBlockNodeId(selectedNodeId)
            ? 'text'
            : isEditorialButtonBlockNodeId(selectedNodeId)
              ? 'button'
              : null;
    if (!blockKind) return;
    const defs = editorialBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendEditorialBlockValues(prev, defs, config, blockKind);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Carousel block field paths. */
  useEffect(() => {
    if (!defaultConfig) return;
    const blockKind = storytellingCarouselBlockKindFromNodeId(selectedNodeId);
    if (!blockKind) return;
    const defs = storytellingCarouselBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendStorytellingCarouselBlockValues(prev, defs, config, blockKind);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Carousel card group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isStorytellingCarouselCardBlockNodeId(selectedNodeId)) return;
    const defs = storytellingCarouselCardFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendStorytellingCarouselCardValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Carousel content group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isStorytellingCarouselContentGroupBlockNodeId(selectedNodeId)) return;
    const defs = storytellingCarouselContentGroupFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendStorytellingCarouselContentGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Carousel Header group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isStorytellingCarouselHeaderGroupBlockNodeId(selectedNodeId)) return;
    const defs = storytellingCarouselHeaderFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendStorytellingCarouselHeaderGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Blog posts grid block field paths. */
  useEffect(() => {
    if (!defaultConfig) return;
    const blockKind = blogPostsGridBlockKindFromNodeId(selectedNodeId);
    if (!blockKind) return;
    const defs = blogPostsGridBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendBlogPostsGridBlockValues(prev, defs, config, blockKind);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Blog posts grid card group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isBlogPostsGridCardGroupBlockNodeId(selectedNodeId)) return;
    const defs = blogPostsGridCardFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendBlogPostsGridCardValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Editorial jumbo Content group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isEditorialJumboContentGroupBlockNodeId(selectedNodeId)) return;
    const defs = editorialJumboContentGroupFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendEditorialJumboContentGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Editorial jumbo Media block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isEditorialJumboMediaBlockNodeId(selectedNodeId)) return;
    const defs = editorialJumboBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendEditorialJumboBlockValues(prev, defs, config, 'media');
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Editorial jumbo Jumbo text block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isEditorialJumboJumboTextBlockNodeId(selectedNodeId)) return;
    const defs = editorialJumboBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendEditorialJumboBlockValues(prev, defs, config, 'jumbo_text');
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image compare Comparison slider block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isImageCompareSliderBlockNodeId(selectedNodeId)) return;
    const defs = comparisonSliderBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendComparisonSliderBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image compare Content group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isImageCompareContentGroupBlockNodeId(selectedNodeId)) return;
    const defs = imageCompareContentGroupFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendImageCompareContentGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image compare Buttons group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isImageCompareButtonsGroupBlockNodeId(selectedNodeId)) return;
    const defs = imageCompareButtonsGroupFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendImageCompareButtonsGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image compare Text group field paths. */
  useEffect(() => {
    if (!defaultConfig || !isImageCompareTextGroupBlockNodeId(selectedNodeId)) return;
    const defs = imageCompareTextGroupFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendImageCompareTextGroupValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image compare Button block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isImageCompareButtonBlockNodeId(selectedNodeId)) return;
    const defs = imageCompareBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendImageCompareButtonBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Image compare Heading / Subheading block field paths. */
  useEffect(() => {
    if (
      !defaultConfig ||
      (!isImageCompareHeadingBlockNodeId(selectedNodeId) &&
        !isImageCompareSubheadingBlockNodeId(selectedNodeId))
    ) {
      return;
    }
    const defs = imageCompareBlockFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendImageCompareTypographyBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Storytelling Video media block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isStorytellingVideoMediaBlockNodeId(selectedNodeId)) return;
    const paths = storytellingVideoSidebarPathsFromNodeId(selectedNodeId);
    if (!paths) return;
    const defs = storytellingVideoMediaFieldDefs(paths.settingsBase);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendStorytellingVideoMediaBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Collection list Header → Text block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isCollectionListHeaderTextNestedNodeId(selectedNodeId)) return;
    const defs = collectionListHeaderTextFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendCollectionListHeaderTextBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Collection list Collection card block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isCollectionListCardBlockNodeId(selectedNodeId)) return;
    const defs = collectionListCardFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendCollectionListCardBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Collection list Collection card → Image block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isCollectionListCardImageNestedNodeId(selectedNodeId)) return;
    const defs = collectionListCardImageFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendCollectionListCardImageBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Collection list Collection card → Collection title block field paths. */
  useEffect(() => {
    if (!defaultConfig || !isCollectionListCardTitleNestedNodeId(selectedNodeId)) return;
    const defs = collectionListCardTitleFieldDefsFromNodeId(selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      const config = editorSchema
        ? applyValuesToThemeConfig(draft, prev, editorSchema)
        : draft;
      return extendCollectionListCardTitleBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Header block field paths (layout, size, appearance, block link, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductHeaderBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductHeaderFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductHeaderBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Header → Title block field paths (layout, typography, appearance, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductHeaderTitleNestedNodeId(selectedNodeId)) return;
    const defs = featuredProductHeaderTitleFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductHeaderTitleBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Review stars block field paths (style, review count, color, typography). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductReviewStarsBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductReviewStarsFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductReviewStarsBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Variant picker block field paths (style, swatches, alignment, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductVariantPickerBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductVariantPickerFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductVariantPickerBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Buy buttons → Add to cart block field paths (style). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductAddToCartNestedNodeId(selectedNodeId)) return;
    const defs = featuredProductAddToCartFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductAddToCartBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Buy buttons → Quantity block field paths (input style). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductQuantityNestedNodeId(selectedNodeId)) return;
    const defs = featuredProductQuantityFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductQuantityBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Buy buttons block field paths (general toggles and padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductBuyButtonsBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductBuyButtonsFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductBuyButtonsBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Header → Price block field paths (general, typography, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductHeaderPriceNestedNodeId(selectedNodeId)) return;
    const defs = featuredProductHeaderPriceFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductHeaderPriceBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Product highlight → Product media block field paths. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isProductHighlightMediaBlockNodeId(selectedNodeId)) return;
    if (!isProductHighlightMediaContext(defaultConfig, selectedNodeId)) return;
    const defs = productHighlightMediaFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureProductHighlightSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendProductHighlightMediaBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Product highlight → Product nested block field paths (title, price, image, swatches). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isProductHighlightProductNestedNodeId(selectedNodeId)) return;
    const defs = productHighlightProductBlockFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureProductHighlightSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendProductHighlightProductBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed collection link Title/Image field paths (typography + image layout). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig) return;
    const isTitle = isCollectionLinkTitleFieldNodeId(selectedNodeId);
    const isImage = isCollectionLinkImageFieldNodeId(selectedNodeId);
    if (!isTitle && !isImage) return;
    const defs = isTitle
      ? collectionLinkTitleFieldDefsFromSchema(editorSchema, selectedNodeId)
      : collectionLinkImageFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const config = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const fromConfig = formValuesFromEditorConfig(editorSchema, config);
      const imageDefaults: Record<string, string> = {
        imageHeight: 'medium',
        imageRatio: 'portrait',
        imageCornerRadius: '0',
      };
      const titleDefaults: Record<string, string> = {
        typographyPreset: 'heading-5',
        font: 'body',
        fontSize: 'default',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        textCase: 'default',
        wrap: 'pretty',
      };
      const next = { ...prev };
      let changed = false;
      for (const f of defs) {
        if (next[f.path] !== undefined) continue;
        const key = f.path.split('.').pop() ?? '';
        const seeded =
          fromConfig[f.path] ??
          (isImage ? imageDefaults[key] : isTitle ? titleDefaults[key] : undefined);
        if (seeded === undefined) continue;
        next[f.path] = seeded;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed collection link block panel (showCount). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isCollectionLinkBlockNodeId(selectedNodeId)) return;
    const defs = collectionLinkBlockFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const config = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const fromConfig = formValuesFromEditorConfig(editorSchema, config);
      const next = { ...prev };
      let changed = false;
      for (const f of defs) {
        if (next[f.path] !== undefined) continue;
        const seeded = fromConfig[f.path] ?? false;
        next[f.path] = seeded;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  const livePreviewConfig = useMemo(() => {
    if (!defaultConfig || !editorSchema) return defaultConfig ?? {};
    if (!hasSections) return defaultConfig;
    return applyValuesToThemeConfig(defaultConfig, values, editorSchema);
  }, [defaultConfig, values, editorSchema, hasSections]);

  const debouncedConfigForHints = useDebouncedValue(livePreviewConfig, 320);

  const selectionHints = useMemo(
    () => buildThemeEditorSelectionHints(editorSchema, debouncedConfigForHints, previewPage),
    [editorSchema, debouncedConfigForHints, previewPage, structureSyncKey]
  );

  const collectionPreviewRoute = useMemo(
    () => resolveCollectionTemplatePreviewRoute(previewPage, previewCollectionHandle),
    [previewPage, previewCollectionHandle]
  );

  const schemaFieldTypes = useMemo(() => {
    if (!editorSchema || !defaultConfig) return new Map<string, string>();
    return new Map(
      collectEditableFieldPaths(editorSchema, defaultConfig as Record<string, unknown>).map((f) => [
        f.path,
        f.type,
      ])
    );
  }, [editorSchema, defaultConfig]);

  const persistTheme = useCallback(
    async (opts: { themeName: string; themeDesc?: string; isCreate: boolean }) => {
      const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
      if (!storeId) {
        toast.error('Select a store before saving');
        return;
      }
      if (!defaultConfig || !editorSchema) {
        toast.error('Theme is still loading');
        return;
      }

      const themeConfig = mergedConfigFromFormValues(
        { ...defaultConfig, themeName: opts.themeName },
        values,
        editorSchema
      );
      ensureAllAlternateTemplateRegistries(themeConfig);

      if (opts.isCreate) {
        const created = await createStoreCustomTheme({
          storeId,
          themeName: opts.themeName,
          ...(opts.themeDesc ? { themeDesc: opts.themeDesc } : {}),
          themeConfig,
        });
        setSavedThemeId(created._id);
        setThemeName(opts.themeName);
        setThemeDesc(opts.themeDesc ?? '');
        setShowSaveThemeModal(false);
        toast.success('Theme created');
        return;
      }

      if (!savedThemeId) return;
      await updateStoreCustomTheme(savedThemeId, {
        themeName: opts.themeName,
        themeConfig,
        ...(opts.themeDesc !== undefined ? { themeDesc: opts.themeDesc || null } : {}),
      });
      setThemeName(opts.themeName);
      if (opts.themeDesc !== undefined) setThemeDesc(opts.themeDesc);
      toast.success('Theme saved');
    },
    [
      activeStoreId,
      defaultConfig,
      editorSchema,
      values,
      savedThemeId,
      createStoreCustomTheme,
      updateStoreCustomTheme,
    ]
  );

  const handleSave = useCallback(() => {
    if (!defaultConfig || !editorSchema) {
      toast.error('Theme is still loading');
      return;
    }
    if (!savedThemeId) {
      setShowSaveThemeModal(true);
      return;
    }
    const name = themeName.trim();
    if (!name) {
      toast.error('Theme name is required');
      return;
    }
    void persistTheme({
      themeName: name,
      themeDesc: themeDesc.trim() || undefined,
      isCreate: false,
    }).catch((err: unknown) => {
      toast.error((err as Error)?.message ?? 'Failed to save theme');
    });
  }, [defaultConfig, editorSchema, savedThemeId, themeName, themeDesc, persistTheme]);

  const themeAlreadyApplied = Boolean(
    activeStoreId &&
      savedThemeId &&
      stores.some(
        (s) =>
          s._id === activeStoreId && String(s.appliedCustomThemeId ?? '') === String(savedThemeId)
      )
  );

  const handleApplyTheme = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('Select a store before applying a theme');
      return;
    }
    if (!savedThemeId) {
      toast.error('Save the theme first, then apply it to your store');
      setShowSaveThemeModal(true);
      return;
    }
    if (applyingTheme) return;
    setApplyingTheme(true);
    try {
      const updated = await applyStoreCustomTheme(activeStoreId, savedThemeId);
      setStores((prev) =>
        prev.map((s) =>
          s._id === activeStoreId
            ? {
                ...s,
                ...updated,
                appliedCustomThemeId: savedThemeId,
                appliedTheme: null,
              }
            : s
        )
      );
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Failed to apply theme');
    } finally {
      setApplyingTheme(false);
    }
  }, [
    activeStoreId,
    savedThemeId,
    applyingTheme,
    applyStoreCustomTheme,
    setStores,
  ]);

  const handleOnlineStoreTheme = useCallback(() => {
    openThemeCreatorForActiveStore(stores, activeStoreId);
  }, [stores, activeStoreId]);

  const handleSaveThemeModalConfirm = useCallback(
    (payload: { themeName: string; themeDesc?: string }) => {
      void persistTheme({ ...payload, isCreate: true }).catch((err: unknown) => {
        toast.error((err as Error)?.message ?? 'Failed to create theme');
      });
    },
    [persistTheme]
  );

  const handleCheckoutSave = useCallback(async () => {
    if (!checkoutConfiguration?._id) {
      toast.error('Create a checkout configuration in Settings → Checkout first');
      return;
    }
    setSavingCheckoutConfiguration(true);
    try {
      await updateCheckoutConfiguration(checkoutConfiguration._id, {
        checkoutConfig: {
          ...(checkoutConfiguration.checkoutConfig ?? {}),
          version: 1,
          activePage: checkoutPreviewPage,
          header: {
            ...((checkoutConfiguration.checkoutConfig?.header as Record<string, unknown>) ?? {}),
            position: checkoutHeaderPosition,
          },
          orderSummary: {
            ...((checkoutConfiguration.checkoutConfig?.orderSummary as Record<string, unknown>) ??
              {}),
            backgroundColor: checkoutOrderSummaryConfig.backgroundColor,
            accentColor: checkoutOrderSummaryConfig.accentColor,
            backgroundImage: checkoutOrderSummaryConfig.backgroundImage,
          },
          footer: {
            ...((checkoutConfiguration.checkoutConfig?.footer as Record<string, unknown>) ?? {}),
            location: checkoutFooterConfig.location,
            alignment: checkoutFooterConfig.alignment,
          },
          signInMain: {
            ...((checkoutConfiguration.checkoutConfig?.signInMain as Record<string, unknown>) ?? {}),
            logoImage: checkoutSignInMainConfig.logoImage,
            backgroundColor: checkoutSignInMainConfig.backgroundColor,
            accentColor: checkoutSignInMainConfig.accentColor,
            mediaImage: checkoutSignInMainConfig.mediaImage,
          },
          thankYouMain: {
            ...((checkoutConfiguration.checkoutConfig?.thankYouMain as Record<string, unknown>) ?? {}),
            backgroundColor: checkoutThankYouMainConfig.backgroundColor,
            accentColor: checkoutThankYouMainConfig.accentColor,
            backgroundImage: checkoutThankYouMainConfig.backgroundImage,
          },
          settings: {
            ...((checkoutConfiguration.checkoutConfig?.settings as Record<string, unknown>) ?? {}),
            layout: checkoutGlobalSettings.layout,
            addressAutocompletion: checkoutGlobalSettings.addressAutocompletion,
            buyAgainButton: checkoutGlobalSettings.buyAgainButton,
            logoImage: checkoutGlobalSettings.logoImage,
            logoAlignment: checkoutGlobalSettings.logoAlignment,
            logoWidth: checkoutGlobalSettings.logoWidth,
            colorPalette: checkoutGlobalSettings.colorPalette,
            mainBackgroundColor: checkoutGlobalSettings.mainBackgroundColor,
            headerBackgroundColor: checkoutGlobalSettings.headerBackgroundColor,
            headerAccentColor: checkoutGlobalSettings.headerAccentColor,
            accentColor: checkoutGlobalSettings.accentColor,
            buttonColor: checkoutGlobalSettings.buttonColor,
            inputFieldsErrorColor: checkoutGlobalSettings.inputFieldsErrorColor,
            inputFieldsTransparent: checkoutGlobalSettings.inputFieldsTransparent,
            typographyHeadings: checkoutGlobalSettings.typographyHeadings,
            typographyBody: checkoutGlobalSettings.typographyBody,
          },
        },
      });
      toast.success('Saved');
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Failed to save checkout configuration');
    } finally {
      setSavingCheckoutConfiguration(false);
    }
  }, [
    checkoutConfiguration,
    checkoutPreviewPage,
    checkoutHeaderPosition,
    checkoutOrderSummaryConfig,
    checkoutFooterConfig,
    checkoutSignInMainConfig,
    checkoutThankYouMainConfig,
    checkoutGlobalSettings,
    updateCheckoutConfiguration,
  ]);

  const handleOpenCheckoutEditor = useCallback(() => {
    void (async () => {
      if (!activeStoreId) {
        toast.error('Select a store first');
        return;
      }
      try {
        const existing =
          checkoutConfiguration?.storeId === activeStoreId
            ? checkoutConfiguration
            : await getCheckoutConfigurationByStoreId(activeStoreId);
        const config =
          existing ??
          (await createCheckoutConfiguration({
            storeId: activeStoreId,
            checkoutConfig: {},
          }));
        const url = new URL(
          `/themes/editor/checkout/${config._id}`,
          window.location.origin
        );
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      } catch (err: unknown) {
        toast.error((err as Error)?.message ?? 'Failed to open checkout editor');
      }
    })();
  }, [
    activeStoreId,
    checkoutConfiguration,
    createCheckoutConfiguration,
    getCheckoutConfigurationByStoreId,
  ]);

  const handleThemeConfigFromPicker = useCallback(
    (next: Record<string, unknown>, nextPreviewPage?: ThemePreviewPage) => {
      normalizeCreatorThemeConfig(next);
      ensureAllAlternateTemplateRegistries(next);
      ensureBlogsPageTemplateBlocks(next);
      ensureBlogPostsPageTemplateBlocks(next);
      setDefaultConfig(next);

      const page = nextPreviewPage ?? previewPage;
      if (nextPreviewPage && nextPreviewPage !== previewPage) {
        setPreviewPage(nextPreviewPage);
        setSelectedNodeId('');
        setAddSectionTarget(null);
        setAddBlockTarget(null);
        setInsertHoverHighlight(null);
        treeInitRef.current = false;
      }

      const tplId = templateIdForPage(page);
      let mergedValues = values;
      if (editorSchema) {
        mergedValues = extendValuesForSeededTemplate(values, editorSchema, tplId, next);
        setValues(mergedValues);
      }
      setItemOrder(readStructureOrderFromConfig(next, page));
      setStructureSyncKey((k) => k + 1);

      if (nextPreviewPage && savedThemeId && editorSchema) {
        const themeConfig = mergedConfigFromFormValues(
          { ...next, themeName },
          mergedValues,
          editorSchema
        );
        ensureAllAlternateTemplateRegistries(themeConfig);
        void updateStoreCustomTheme(savedThemeId, {
          themeName: themeName.trim() || 'Untitled theme',
          themeConfig,
        })
          .then(() => toast.success(alternateTemplateSavedToastLabel(nextPreviewPage)))
          .catch((err: unknown) => {
            toast.error((err as Error)?.message ?? 'Failed to save template');
          });
      } else if (nextPreviewPage) {
        toast(alternateTemplateCreatedToastMessage(nextPreviewPage), {
          icon: 'ℹ️',
        });
      }
    },
    [previewPage, editorSchema, values, savedThemeId, themeName, updateStoreCustomTheme]
  );

  const handlePreviewPageChange = useCallback(
    (page: ThemePreviewPage) => {
      if (page === previewPage) return;
      setPreviewPage(page);
      setSelectedNodeId('');
      setAddSectionTarget(null);
      setAddBlockTarget(null);
      setInsertHoverHighlight(null);
      treeInitRef.current = false;

      const pack = packDefaultRef.current;
      const tplId = templateIdForPage(page);
      if (defaultConfig && pack) {
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        let seeded = false;
        if (tplId === ALL_PRODUCTS_TEMPLATE_ID) {
          seeded = ensureAllProductsPageTemplateBlocks(next);
        }
        if (tplId === 'blogs' || tplId.startsWith('blogs.')) {
          seeded = ensureBlogsPageTemplateBlocks(next);
        } else if (tplId === 'blog-posts' || tplId.startsWith('blog-posts.')) {
          seeded = ensureBlogPostsPageTemplateBlocks(next);
        } else if (tplId === PASSWORD_TEMPLATE_ID) {
          seeded = ensurePasswordPageTemplateBlocks(next);
        } else if (tplId === NOT_FOUND_TEMPLATE_ID) {
          seeded = ensureNotFoundPageTemplateBlocks(next);
        }
        if (!seeded) {
          seeded = seedTemplateFromPackIfEmpty(next, tplId, pack);
        }
        if (seeded) {
          normalizeCreatorThemeConfig(next);
          setDefaultConfig(next);
          if (editorSchema) {
            setValues((prev) => extendValuesForSeededTemplate(prev, editorSchema, tplId, next));
          }
          setItemOrder(readStructureOrderFromConfig(next, page));
          setStructureSyncKey((k) => k + 1);
          return;
        }
      }

      if (defaultConfig) {
        setItemOrder(readStructureOrderFromConfig(defaultConfig, page));
      }
    },
    [defaultConfig, previewPage, editorSchema]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleFieldChange = useCallback(
    (path: string, type: FieldType, raw: string | boolean) => {
      const value = type === 'boolean' ? Boolean(raw) : String(raw);
      const isHotspotPosition = path.endsWith('.positionX') || path.endsWith('.positionY');

      // Hotspot sliders need urgent preview updates — skip startTransition + post a field patch.
      if (isHotspotPosition) {
        setValues((prev) => ({ ...prev, [path]: value }));
        livePreviewRef.current?.patchField(path, String(value));
        return;
      }

      startTransition(() => {
        setValues((prev) => {
          let next: Record<string, string | boolean> = { ...prev, [path]: value };
          if (path.endsWith('.settings.title') || /\.blocks\.[^.]+\.settings\.heading$/.test(path)) {
            next = mirrorHeadingTextInValues(prev, path, value);
          }
          next = mirrorCollectionListHeadingTextInValues(next, path, value);
          if (isCollectionListCardsLayoutTypePath(path)) {
            const settingsBase = path.replace(/\.cardsLayoutType$/, '');
            const layoutType = parseCollectionListCardsLayoutType(String(value));
            next = applyCollectionListLayoutDefaultsToValues(next, settingsBase, layoutType);
          }
          return next;
        });
      });
    },
    []
  );

  const handleStoreMenuSelect = useCallback(
    (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => {
      setDefaultConfig((prev) => {
        if (!prev) return prev;
        const { config, itemValuePaths, itemsPath, navItemCount } = applyStoreMenuSelectionToConfig(
          prev,
          menuFieldPath,
          menu,
          items
        );
        // Sync values immediately (not startTransition) so preview merge cannot
        // re-apply stale items.N.label/href paths and resurrect phantom links.
        setValues((v) => ({
          ...pruneStaleHeaderMenuItemValues(v, itemsPath, navItemCount),
          ...itemValuePaths,
        }));
        commitPreviewNow();
        setStructureSyncKey((k) => k + 1);
        return config;
      });
    },
    [commitPreviewNow]
  );

  const handleCollectionLinksApply = useCallback(
    (settingsPath: string, collections: Collection[]) => {
      setDefaultConfig((prev) => {
        if (!prev) return prev;
        const sectionType = sectionTypeFromCollectionsPickerPath(prev, settingsPath);
        const useTileBlocks = isCollectionListTileSectionType(sectionType);
        const { config, blockValuePaths, pickerValue } = useTileBlocks
          ? applyCollectionListTilesSelectionToConfig(prev, settingsPath, collections)
          : applyCollectionLinksSelectionToConfig(prev, settingsPath, collections);
        const sectionBase = sectionBaseFromCollectionsPickerPath(settingsPath);
        const keepIds = sectionBase
          ? new Set(
              (collections.length
                ? collections.map((_, i) => (useTileBlocks ? `tile_${i + 1}` : `link_${i + 1}`))
                : []) as string[]
            )
          : new Set<string>();

        startTransition(() => {
          setValues((v) => {
            let next = { ...v, [settingsPath]: pickerValue, ...blockValuePaths };
            if (sectionBase) {
              next = useTileBlocks
                ? pruneCollectionTileBlockValues(next, sectionBase, keepIds)
                : pruneCollectionLinkBlockValues(next, sectionBase, keepIds);
            }
            return next;
          });
        });
        commitPreviewNow();
        setStructureSyncKey((k) => k + 1);
        return config;
      });
    },
    [commitPreviewNow]
  );

  const collectionListAutoSyncRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!previewStoreId) return;
    void fetchCollectionsByStoreId(previewStoreId);
  }, [previewStoreId, fetchCollectionsByStoreId]);

  useEffect(() => {
    if (!defaultConfig || !collections.length) return;
    const paths = collectionListPickerPathsWithEmptySelection(defaultConfig);
    for (const path of paths) {
      const signature = collectionListSyncSignature(path, collections);
      if (collectionListAutoSyncRef.current.get(path) === signature) continue;
      collectionListAutoSyncRef.current.set(path, signature);
      handleCollectionLinksApply(path, collections);
    }
  }, [defaultConfig, collections, handleCollectionLinksApply]);

  const handleReorder = useCallback(
    (listKey: string, orderedIds: string[]) => {
      setItemOrder((prev) => mergeItemOrder(prev, listKey, orderedIds));
      setDefaultConfig((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev)) as Record<string, unknown>;
        applyStructureOrderToConfig(next, listKey, orderedIds, previewPage);
        return next;
      });
      setStructureSyncKey((k) => k + 1);
    },
    [previewPage]
  );

  const handlePreviewSelect = useCallback(
    (nodeId: string) => {
      const sidebarNodeId =
        announcementBlockNodeIdFromSelection(nodeId) ??
        collectionListSidebarSelectionId(nodeId) ??
        contactFormSidebarSelectionId(nodeId) ??
        emailSignupSidebarSelectionId(nodeId) ??
        imageCompareSidebarSelectionId(nodeId) ??
        editorialJumboSidebarSelectionId(nodeId) ??
        editorialSidebarSelectionId(nodeId) ??
        storytellingCarouselSidebarSelectionId(nodeId) ??
        blogPostsGridSidebarSelectionId(nodeId) ??
        blogPostsEditorialSidebarSelectionId(nodeId) ??
        blogPostsCarouselSidebarSelectionId(nodeId) ??
        imageWithTextSidebarSelectionId(nodeId) ??
        storytellingVideoSidebarSelectionId(nodeId) ??
        nodeId;
      if (selectedNodeId === sidebarNodeId) {
        setSelectedNodeId('');
        return;
      }
      setSelectedNodeId(sidebarNodeId);
      const node = findSidebarNode(sectionsTree, sidebarNodeId);
      if (node?.fields?.length || node?.children?.length) {
        setExpanded((prev) => ({
          ...prev,
          [sidebarNodeId]: true,
          ...expandedIdsForPreviewNode(sidebarNodeId, sectionsTree),
          ...(sidebarNodeId !== nodeId ? expandedIdsForPreviewNode(nodeId, sectionsTree) : {}),
        }));
      }
    },
    [selectedNodeId, sectionsTree]
  );

  const handleInsertElement = useCallback(
    (elementId: string) => {
      if (!defaultConfig || !editorSchema || !packDefaultRef.current || !addSectionTarget) return;
      const result = insertCreateThemeElement(
        defaultConfig,
        elementId,
        {
          groupId: addSectionTarget.groupId,
          groupLabel: addSectionTarget.groupLabel,
          afterNodeId: addSectionTarget.afterNodeId,
          beforeNodeId: addSectionTarget.beforeNodeId,
        },
        packDefaultRef.current,
        previewPage
      );
      if (!result) {
        toast.error('Could not add this section yet');
        return;
      }
      normalizeCreatorThemeConfig(result.config);
      setDefaultConfig(result.config);
      const el = getCreateThemeElement(elementId);
      if (el?.insert.placement === 'layout') {
        setValues((prev) =>
          extendValuesForLayoutInstance(
            prev,
            editorSchema,
            el.insert.blueprintId,
            result.instanceId,
            result.config
          )
        );
      } else if (el?.insert.placement === 'template') {
        setValues((prev) =>
          extendValuesForTemplateInstance(
            prev,
            editorSchema,
            templateIdForPage(previewPage),
            templateBlueprintKey(result.instanceId),
            result.instanceId,
            result.config
          )
        );
      }
      setItemOrder(readStructureOrderFromConfig(result.config, previewPage));
      setSelectedNodeId(result.nodeId);
      setAddSectionTarget(null);
      setStructureSyncKey((k) => k + 1);
      toast.success('Section added');
    },
    [defaultConfig, editorSchema, addSectionTarget, previewPage]
  );

  const handleInsertBlock = useCallback(
    (block: BlockCatalogItem) => {
      if (!defaultConfig || !editorSchema || !addBlockTarget) return;
      const result = insertBlockFromCatalog(
        defaultConfig,
        addBlockTarget.nodeId,
        block.id,
        editorSchema
      );
      setAddBlockTarget(null);
      if (!result) {
        toast.error(`Could not add ${block.label}`);
        return;
      }
      setDefaultConfig(result.config);
      setItemOrder(readStructureOrderFromConfig(result.config, previewPage));
      const faqRowText = /:block:accordion:nested:[^:]+:nested:[^:]+$/.test(result.nodeId);
      const faqRow = /:block:accordion:nested:[^:]+$/.test(result.nodeId);
      const faqSectionBlock = /:block:(heading|accordion)$/.test(result.nodeId);
      const richTextContentBlock =
        isRichTextBlockNodeId(result.nodeId) &&
        (block.id === 'heading' || block.id === 'text' || block.id === 'button');
      if (result.scope === 'template') {
        const hero = templateBlueprintKey(result.sectionInstanceId) === 'hero_main';
        setValues((prev) => {
          if (richTextContentBlock) {
            const sectionBase = richTextSectionBaseFromNodeId(result.nodeId);
            const kind = richTextBlockKindFromNodeId(result.nodeId);
            if (sectionBase && kind) {
              return extendValuesForRichTextContentBlock(prev, sectionBase, kind, result.config);
            }
          }
          if (faqRowText) {
            return extendValuesForFaqNestedBlock(
              prev,
              'template',
              result.templateId,
              result.sectionInstanceId,
              result.nodeId,
              result.config
            );
          }
          if (faqRow) {
            const rowId = result.nodeId.match(/:block:accordion:nested:([^:]+)$/)?.[1];
            if (!rowId) return prev;
            return extendValuesForNewFaqAccordionRow(
              prev,
              'template',
              result.templateId,
              result.sectionInstanceId,
              rowId,
              result.config
            );
          }
          if (faqSectionBlock) {
            return extendValuesForFaqSectionBlock(
              prev,
              'template',
              result.templateId,
              result.sectionInstanceId,
              result.blockInstanceId,
              result.config,
              editorSchema
            );
          }
          if (hero) {
            return extendValuesForHeroBlock(
                prev,
                editorSchema,
                'template',
                result.templateId,
                result.sectionInstanceId,
                result.blockInstanceId,
                block.id,
                result.config
            );
          }
          return extendValuesForTemplateBlock(
                prev,
                editorSchema,
                result.templateId ?? templateIdForPage(previewPage),
                result.sectionInstanceId,
                result.blockInstanceId,
                block.id,
                result.config
        );
        });
      } else {
        setValues((prev) => {
          if (richTextContentBlock) {
            const sectionBase = richTextSectionBaseFromNodeId(result.nodeId);
            const kind = richTextBlockKindFromNodeId(result.nodeId);
            if (sectionBase && kind) {
              return extendValuesForRichTextContentBlock(prev, sectionBase, kind, result.config);
            }
          }
          if (faqRowText) {
            return extendValuesForFaqNestedBlock(
              prev,
              'layout',
              undefined,
              result.sectionInstanceId,
              result.nodeId,
              result.config
            );
          }
          if (faqRow) {
            const rowId = result.nodeId.match(/:block:accordion:nested:([^:]+)$/)?.[1];
            if (!rowId) return prev;
            return extendValuesForNewFaqAccordionRow(
              prev,
              'layout',
              undefined,
              result.sectionInstanceId,
              rowId,
              result.config
            );
          }
          if (faqSectionBlock) {
            return extendValuesForFaqSectionBlock(
              prev,
              'layout',
              undefined,
              result.sectionInstanceId,
              result.blockInstanceId,
              result.config,
              editorSchema
            );
          }
          return extendValuesForLayoutBlock(
            prev,
            editorSchema,
            result.sectionInstanceId,
            result.blockInstanceId,
            block.id,
            result.config
        );
        });
      }
      setSelectedNodeId(result.nodeId);
      setStructureSyncKey((k) => k + 1);
      commitPreviewNow();
      toast.success('Block added');
    },
    [defaultConfig, editorSchema, addBlockTarget, previewPage, commitPreviewNow]
  );

  const handleDeleteSidebarNode = useCallback(
    (nodeId: string) => {
      if (!defaultConfig) return;

      const tplFaqRowText = nodeId.match(
        /^template:([^:]+):([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/
      );
      if (tplFaqRowText) {
        const [, tplId, sectionInstanceId, rowId, textId] = tplFaqRowText;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (
          (next.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }>)?.[
            tplId
          ]?.sections ?? {}
        )[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        const row = (accordion?.blocks as Record<string, Record<string, unknown>> | undefined)?.[rowId];
        if (row?.blocks && typeof row.blocks === 'object') {
          delete (row.blocks as Record<string, unknown>)[textId];
          row.block_order = ((row.block_order as string[]) ?? []).filter((id) => id !== textId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqRowText(prev, 'template', tplId, sectionInstanceId, rowId, textId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const layoutFaqRowText = nodeId.match(
        /^layout:([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/
      );
      if (layoutFaqRowText) {
        const [, sectionInstanceId, rowId, textId] = layoutFaqRowText;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (next.sections as Record<string, Record<string, unknown>>)?.[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        const row = (accordion?.blocks as Record<string, Record<string, unknown>> | undefined)?.[rowId];
        if (row?.blocks && typeof row.blocks === 'object') {
          delete (row.blocks as Record<string, unknown>)[textId];
          row.block_order = ((row.block_order as string[]) ?? []).filter((id) => id !== textId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqRowText(prev, 'layout', undefined, sectionInstanceId, rowId, textId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const tplFaqRow = nodeId.match(/^template:([^:]+):([^:]+):block:accordion:nested:([^:]+)$/);
      if (tplFaqRow) {
        const [, tplId, sectionInstanceId, rowId] = tplFaqRow;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (
          (next.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }>)?.[
            tplId
          ]?.sections ?? {}
        )[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        if (accordion?.blocks && typeof accordion.blocks === 'object') {
          delete (accordion.blocks as Record<string, unknown>)[rowId];
          accordion.block_order = ((accordion.block_order as string[]) ?? []).filter((id) => id !== rowId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqAccordionRow(prev, 'template', tplId, sectionInstanceId, rowId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const layoutFaqRow = nodeId.match(/^layout:([^:]+):block:accordion:nested:([^:]+)$/);
      if (layoutFaqRow) {
        const [, sectionInstanceId, rowId] = layoutFaqRow;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (next.sections as Record<string, Record<string, unknown>>)?.[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        if (accordion?.blocks && typeof accordion.blocks === 'object') {
          delete (accordion.blocks as Record<string, unknown>)[rowId];
          accordion.block_order = ((accordion.block_order as string[]) ?? []).filter((id) => id !== rowId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqAccordionRow(prev, 'layout', undefined, sectionInstanceId, rowId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      // Rich text Heading / Text / Button are settings-backed virtual blocks.
      if (isRichTextBlockNodeId(nodeId)) {
        const sectionBase = richTextSectionBaseFromNodeId(nodeId);
        const kind = richTextBlockKindFromNodeId(nodeId);
        const parentId = richTextParentSectionNodeId(nodeId);
        if (!sectionBase || !kind || !parentId) {
          toast.error('This block cannot be removed');
          return;
        }
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const layoutMatch = nodeId.match(/^layout:([^:]+):block:/);
        const tplMatch = nodeId.match(/^template:([^:]+):([^:]+):block:/);
        let section: Record<string, unknown> | undefined;
        if (layoutMatch) {
          const sectionInstanceId = layoutMatch[1]!;
          section = (next.sections as Record<string, Record<string, unknown>>)?.[sectionInstanceId];
        } else if (tplMatch) {
          const [, tplId, sectionInstanceId] = tplMatch;
          section = (
            (next.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }>)?.[
              tplId!
            ]?.sections ?? {}
          )[sectionInstanceId!];
        }
        if (!section || typeof section !== 'object') {
          toast.error('This block cannot be removed');
          return;
        }
        removeRichTextContentBlockFromSection(section, kind);
        setDefaultConfig(next);
        setValues((prev) => pruneValuesForRichTextContentBlock(prev, sectionBase, kind));
        setItemOrder(readStructureOrderFromConfig(next, previewPage));
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId(parentId);
        }
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const layoutBlock = nodeId.match(/^layout:([^:]+):block:(.+)$/);
      if (layoutBlock) {
        const [, sectionInstanceId, blockId] = layoutBlock;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sections = (next.sections ?? {}) as Record<string, Record<string, unknown>>;
        const sec = sections[sectionInstanceId];
        if (sec?.blocks && typeof sec.blocks === 'object') {
          delete (sec.blocks as Record<string, unknown>)[blockId];
          sec.block_order = ((sec.block_order as string[]) ?? []).filter((id) => id !== blockId);
        }
        setDefaultConfig(next);
        const isFaqSection = layoutBlueprintKey(sectionInstanceId) === 'faq_section';
        setValues((prev) =>
          isFaqSection && (blockId === 'heading' || blockId === 'accordion')
            ? pruneValuesForFaqSectionBlock(prev, 'layout', undefined, sectionInstanceId, blockId)
            : pruneValuesForLayoutBlock(prev, sectionInstanceId, blockId)
        );
        setItemOrder(readStructureOrderFromConfig(next, previewPage));
        setStructureSyncKey((k) => k + 1);
        toast.success('Block removed');
        return;
      }

      const tplBlock = nodeId.match(/^template:([^:]+):([^:]+):block:(.+)$/);
      if (tplBlock) {
        const [, tplId, sectionInstanceId, blockId] = tplBlock;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const tpl = (next.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }>)?.[
          tplId
        ];
        const sec = tpl?.sections?.[sectionInstanceId];
        if (sec?.blocks && typeof sec.blocks === 'object') {
          delete (sec.blocks as Record<string, unknown>)[blockId];
          sec.block_order = ((sec.block_order as string[]) ?? []).filter((id) => id !== blockId);
        }
        setDefaultConfig(next);
        const isFaqSection =
          templateBlueprintKey(sectionInstanceId) === 'faq_section' ||
          tpl?.sections?.[sectionInstanceId]?.type === 'faq';
        setValues((prev) =>
          isFaqSection && (blockId === 'heading' || blockId === 'accordion')
            ? pruneValuesForFaqSectionBlock(prev, 'template', tplId, sectionInstanceId, blockId)
            : pruneValuesForTemplateBlock(prev, tplId, sectionInstanceId, blockId)
        );
        setItemOrder(readStructureOrderFromConfig(next, previewPage));
        setStructureSyncKey((k) => k + 1);
        toast.success('Block removed');
        return;
      }

      const layout = nodeId.match(/^layout:(.+)$/);
      if (layout) {
        const instanceId = layout[1];
        if (instanceId.includes('add-section')) {
          toast.error('This section cannot be removed');
          return;
        }
        const order = getLayoutOrder(defaultConfig);
        const groupId: 'header' | 'footer' = order.footer?.includes(instanceId) ? 'footer' : 'header';
        const next = removeLayoutSection(defaultConfig, instanceId, groupId, CREATOR_DELETE);
        if (!next) {
          toast.error('This section cannot be removed');
          return;
        }
        setValues((prev) => pruneValuesForLayoutInstance(prev, instanceId));
        setDefaultConfig(next);
        setItemOrder((prev) => {
          const listKey = groupId === 'header' ? 'sections:header' : 'sections:footer';
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId('');
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Section removed');
        return;
      }

      const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
      if (tpl) {
        const [, tplId, instanceId] = tpl;
        const next = removeTemplateSection(defaultConfig, tplId, instanceId, CREATOR_DELETE);
        if (!next) {
          toast.error('This section cannot be removed');
          return;
        }
        setDefaultConfig(next);
        setValues((prev) => pruneValuesForTemplateInstance(prev, tplId, instanceId));
        setItemOrder((prev) => {
          const listKey = `sections:template:${tplId}`;
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId('');
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Section removed');
        return;
      }

      toast.error('This section cannot be removed');
    },
    [defaultConfig, selectedNodeId, commitPreviewNow, previewPage]
  );

  const closeSettings = useCallback(() => {
    setSelectedNodeId('');
  }, []);

  const handleCheckoutOrderSummaryConfigChange = useCallback(
    (patch: Partial<CheckoutOrderSummaryConfig>) => {
      setCheckoutOrderSummaryConfig((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const handleCheckoutFooterConfigChange = useCallback((patch: Partial<CheckoutFooterConfig>) => {
    setCheckoutFooterConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleCheckoutSignInMainConfigChange = useCallback((patch: Partial<CheckoutSignInMainConfig>) => {
    setCheckoutSignInMainConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleCheckoutThankYouMainConfigChange = useCallback(
    (patch: Partial<CheckoutThankYouMainConfig>) => {
      setCheckoutThankYouMainConfig((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const handleCheckoutGlobalSettingsChange = useCallback((patch: Partial<CheckoutGlobalSettings>) => {
    setCheckoutGlobalSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleCheckoutPaletteSync = useCallback((result: CheckoutPaletteSyncResult) => {
    setCheckoutGlobalSettings((prev) => ({ ...prev, ...result.global }));
    setCheckoutOrderSummaryConfig((prev) => ({ ...prev, ...result.orderSummary }));
    setCheckoutSignInMainConfig((prev) => ({ ...prev, ...result.signInMain }));
    setCheckoutThankYouMainConfig((prev) => ({ ...prev, ...result.thankYouMain }));
  }, []);

  const checkoutSettingsPanel = useMemo(() => {
    if (!isCheckoutProfile || !selectedNodeId) return null;
    const panelId = resolveCheckoutSettingsPanelId(selectedNodeId);
    if (!panelId) return null;
    return (
      <CheckoutEditorSettingsPanel
        panelId={panelId}
        headerPosition={checkoutHeaderPosition}
        onHeaderPositionChange={setCheckoutHeaderPosition}
        logoSettings={checkoutGlobalSettings}
        onLogoSettingsChange={handleCheckoutGlobalSettingsChange}
        orderSummaryConfig={checkoutOrderSummaryConfig}
        onOrderSummaryConfigChange={handleCheckoutOrderSummaryConfigChange}
        footerConfig={checkoutFooterConfig}
        onFooterConfigChange={handleCheckoutFooterConfigChange}
        signInMainConfig={checkoutSignInMainConfig}
        onSignInMainConfigChange={handleCheckoutSignInMainConfigChange}
        thankYouMainConfig={checkoutThankYouMainConfig}
        onThankYouMainConfigChange={handleCheckoutThankYouMainConfigChange}
        onClose={closeSettings}
      />
    );
  }, [
    isCheckoutProfile,
    selectedNodeId,
    checkoutHeaderPosition,
    checkoutOrderSummaryConfig,
    checkoutFooterConfig,
    checkoutSignInMainConfig,
    checkoutThankYouMainConfig,
    checkoutGlobalSettings,
    handleCheckoutOrderSummaryConfigChange,
    handleCheckoutFooterConfigChange,
    handleCheckoutSignInMainConfigChange,
    handleCheckoutThankYouMainConfigChange,
    handleCheckoutGlobalSettingsChange,
    closeSettings,
  ]);

  const checkoutThemeSettingsNav = useMemo(() => {
    if (!isCheckoutProfile) return null;
    return (
      <CheckoutThemeSettingsNav
        settings={checkoutGlobalSettings}
        onSettingsChange={handleCheckoutGlobalSettingsChange}
        onPaletteSync={handleCheckoutPaletteSync}
        onNavigateToOrderSummary={() => {
          setSidebarTab('sections');
          setSelectedNodeId('checkout:order-summary');
          setExpanded((prev) => ({ ...prev, 'checkout:order-summary': true }));
        }}
      />
    );
  }, [isCheckoutProfile, checkoutGlobalSettings, handleCheckoutGlobalSettingsChange, handleCheckoutPaletteSync]);

  const themeColorPalette = useMemo(
    () => readThemeColorPalette(livePreviewConfig),
    [livePreviewConfig]
  );

  const handleThemePaletteChange = useCallback(
    (colors: string[]) => {
      const fieldUpdates = syncThemePaletteToFieldValues(colors);
      startTransition(() => {
        setValues((prev) => ({ ...prev, ...fieldUpdates }));
        setDefaultConfig((prev) => {
          if (!prev) return prev;
          const config = JSON.parse(JSON.stringify(prev)) as Record<string, unknown>;
          setConfigAtPath(config, 'settings.colors.palette', colors);
          for (const [path, value] of Object.entries(fieldUpdates)) {
            if (!path.startsWith('settings.colors.palette.')) {
              setConfigAtPath(config, path, value);
            }
          }
          return config;
        });
      });
      commitPreviewNow();
    },
    [commitPreviewNow]
  );

  const handleResetThemeSettingsToDefaults = useCallback(() => {
    if (!defaultConfig || !editorSchema || !packDefaultRef.current) return;
    const { config: resetConfig, values: resetValues } = resetCreatorThemeGlobalSettings(
      defaultConfig,
      packDefaultRef.current,
      editorSchema
    );
    startTransition(() => {
      setDefaultConfig(resetConfig);
      setValues((prev) => {
        const next = { ...prev, ...resetValues };
        seedCommittedPreview(next);
        return next;
      });
    });
    commitPreviewNow();
    toast.success('Theme settings reset to defaults');
  }, [defaultConfig, editorSchema, seedCommittedPreview, commitPreviewNow]);

  const themeSettingsNav = useMemo(() => {
    if (isCheckoutProfile) return null;
    return (
      <ThemeSettingsNav
        values={values}
        colorPalette={themeColorPalette}
        onPaletteChange={handleThemePaletteChange}
        onResetToDefaults={handleResetThemeSettingsToDefaults}
        onFieldChange={(path, type, raw) => {
          handleFieldChange(path, type, raw);
          if (path === THEME_LOGO_DEFAULT_PATH && type === 'text') {
            handleFieldChange('sections.header.settings.defaultLogoUrl', 'text', String(raw));
          }
          if (
            path === THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH ||
            path === THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH ||
            path === THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH ||
            path === THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH
          ) {
            startTransition(() => {
              setValues((prev) => {
                const next = { ...prev, [path]: String(raw) };
                const synced = syncThemeTypographyFontFields({
                  body: next[THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH],
                  subheading: next[THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH],
                  heading: next[THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH],
                  accent: next[THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH],
                });
                return { ...next, ...synced };
              });
            });
          }
          if (path === THEME_PAGE_WIDTH_PATH) {
            startTransition(() => {
              setValues((prev) => {
                const pageWidth = normalizeThemePageWidth(String(raw));
                const synced = syncThemePageFieldValues(pageWidth);
                return {
                  ...prev,
                  [path]: pageWidth,
                  ...Object.fromEntries(
                    Object.entries(synced).map(([key, value]) => [key, String(value)])
                  ),
                };
              });
            });
          }
          if (path.startsWith('settings.cart.')) {
            startTransition(() => {
              setValues((prev) => {
                const next = {
                  ...prev,
                  [path]: type === 'boolean' ? Boolean(raw) : String(raw),
                };
                const cart = readThemeCartSettingsFromValues(next);
                return { ...next, ...syncThemeCartHeaderFieldValues(cart) };
              });
            });
          }
          if (
            path.startsWith('settings.typography.') ||
            path.startsWith('settings.page.') ||
            path.startsWith('settings.animations.') ||
            path.startsWith('settings.badges.') ||
            path.startsWith('settings.buttons.') ||
            path.startsWith('settings.cart.') ||
            path.startsWith('settings.drawers.') ||
            path.startsWith('settings.productMedia.') ||
            path.startsWith('settings.icons.') ||
            path.startsWith('settings.inputFields.') ||
            path.startsWith('settings.popoversModals.') ||
            path.startsWith('settings.prices.') ||
            path.startsWith('settings.productCards.') ||
            path.startsWith('settings.search.') ||
            path.startsWith('settings.swatches.') ||
            path.startsWith('settings.variantPickers.') ||
            path.startsWith('settings.logo.') ||
            path.startsWith('settings.colors.')
          ) {
            commitPreviewNow();
          }
        }}
        onManageStoreName={() => navigate('/settings/general/branding')}
      />
    );
  }, [
    isCheckoutProfile,
    values,
    themeColorPalette,
    handleThemePaletteChange,
    handleResetThemeSettingsToDefaults,
    handleFieldChange,
    navigate,
    commitPreviewNow,
  ]);

  const checkoutPaletteTheme = useMemo(
    () => resolveCheckoutPaletteTheme(checkoutGlobalSettings),
    [checkoutGlobalSettings]
  );

  const checkoutTypographyTheme = useMemo(
    () => resolveCheckoutTypographyTheme(checkoutGlobalSettings),
    [checkoutGlobalSettings]
  );

  const checkoutLogoPreview = useMemo(
    () => ({
      image: checkoutGlobalSettings.logoImage,
      alignment: checkoutGlobalSettings.logoAlignment,
      width: checkoutGlobalSettings.logoWidth,
    }),
    [checkoutGlobalSettings]
  );

  const handleInspectorEnabledChange = useCallback((enabled: boolean) => {
    setInspectorEnabled(enabled);
    if (!enabled) {
      setSelectedNodeId('');
      setInsertHoverHighlight(null);
    }
  }, []);

  const handleCheckoutPreviewSelect = useCallback(
    (nodeId: string) => {
      setSidebarTab('sections');
      setSelectedNodeId((current) => (current === nodeId ? '' : nodeId));
      setExpanded((prev) => ({
        ...prev,
        [nodeId]: true,
        ...expandedIdsForPreviewNode(nodeId, sectionsTree),
      }));
    },
    [sectionsTree]
  );

  const handleRemoveSettingsSection = useCallback(() => {
    if (!settingsNode) return;
    handleDeleteSidebarNode(settingsNode.id);
  }, [settingsNode, handleDeleteSidebarNode]);

  const handleRemoveSettingsBlock = useCallback(() => {
    if (!settingsNode) return;
    handleDeleteSidebarNode(settingsNode.id);
  }, [settingsNode, handleDeleteSidebarNode]);

  if (loading && !editorSchema && !isCheckoutProfile) {
    return (
      <div className="fixed inset-0 z-[1310] flex items-center justify-center bg-white">
        <CreateThemePoweredByLoader />
      </div>
    );
  }

  if (isCheckoutProfile && !checkoutConfigHydrated) {
    return (
      <div className="fixed inset-0 z-[1310] flex items-center justify-center bg-white">
        <CreateThemePoweredByLoader />
      </div>
    );
  }

  if (isCheckoutProfile && checkoutConfigHydrated && checkoutConfigError) {
    return (
      <div className="fixed inset-0 z-[1310] flex flex-col items-center justify-center gap-4 bg-gray-100 px-6 text-center">
        <p className="max-w-md text-sm text-red-600">{checkoutConfigError}</p>
        <button
          type="button"
          onClick={() => navigate('/settings/checkout')}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Go to checkout settings
        </button>
      </div>
    );
  }

  if (isCheckoutProfile && checkoutConfigHydrated && !checkoutConfiguration) {
    return (
      <div className="fixed inset-0 z-[1310] flex flex-col items-center justify-center gap-4 bg-gray-100 px-6 text-center">
        <p className="max-w-md text-sm text-gray-700">
          No checkout configuration exists for this store yet. Create one from checkout settings
          before using the editor.
        </p>
        <button
          type="button"
          onClick={() => navigate('/settings/checkout')}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Go to checkout settings
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[1310] flex flex-col items-center justify-center gap-4 bg-gray-100">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate(exitPath)}
          className="text-sm text-[#005bd3] hover:underline"
        >
          {isCheckoutProfile ? 'Back to checkout settings' : 'Back to themes'}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1310] flex flex-col bg-[#1e1e1e]">
      {!isCheckoutProfile ? (
      <PreviewSyncProgressBar
        runKey={previewBarRunKey}
        onComplete={onPreviewBarComplete}
      />
      ) : null}

      {!isCheckoutProfile ? (
      <CreateThemeHeader
        themeName={themeName}
        onThemeNameChange={setThemeName}
        previewPage={previewPage}
        onPreviewPageChange={handlePreviewPageChange}
        onOpenCheckoutEditor={handleOpenCheckoutEditor}
        manifest={manifest}
        editorSchema={editorSchema}
        themeConfig={defaultConfig}
        onThemeConfigChange={handleThemeConfigFromPicker}
        device={device}
        onDeviceChange={setDevice}
        onSave={handleSave}
        saveDisabled={!defaultConfig || !editorSchema || loading}
        saving={savingTheme}
        inspectorEnabled={inspectorEnabled}
        onInspectorEnabledChange={handleInspectorEnabledChange}
        storeUrl={storeSubdomain?.url ?? null}
        onApplyTheme={() => void handleApplyTheme()}
        applyThemeDisabled={applyingTheme}
        applyingTheme={applyingTheme}
        themeAlreadyApplied={themeAlreadyApplied}
      />
      ) : (
        <CheckoutEditorHeader
          configurationName={checkoutConfigurationName}
          previewPage={checkoutPreviewPage}
          onPreviewPageChange={setCheckoutPreviewPage}
          onOnlineStoreTheme={handleOnlineStoreTheme}
          device={device}
          onDeviceChange={setDevice}
          onSave={() => void handleCheckoutSave()}
          saveDisabled={!checkoutConfiguration}
          saving={savingCheckoutConfiguration}
          storeUrl={storeSubdomain?.url ?? null}
          inspectorEnabled={inspectorEnabled}
          onInspectorEnabledChange={handleInspectorEnabledChange}
        />
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CreateThemeEditorSidebar
          pageLabel={pageLabel}
          sidebarTitleMode={isCheckoutProfile ? 'plain' : 'editing'}
          sectionsHeaderSlot={
            !isCheckoutProfile && isCollectionTemplatePreviewPage(previewPage) ? (
              <CollectionTemplatePreviewCard
                previewCollectionHandle={previewCollectionHandle}
                onPreviewCollectionHandleChange={setPreviewCollectionHandle}
              />
            ) : null
          }
          sidebarTab={sidebarTab}
          onSidebarTabChange={(tab) => {
            setSidebarTab(tab);
            if (tab === 'theme-settings') setSelectedNodeId('');
          }}
          onExit={() => navigate(exitPath)}
          tree={activeTree}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          selectedNodeId={selectedNodeId}
          onSelectNode={(node) => {
            if (node.disabled) return;
            if (node.kind === 'add-block') {
              if (selectedNodeId === node.id) {
                setSelectedNodeId('');
                setAddBlockTarget(null);
                return;
              }
              setSelectedNodeId(node.id);
              setAddBlockTarget({
                nodeId: node.id,
                sectionLabel: resolveAddBlockSectionLabel(node.id, sectionsTree),
              });
              return;
            }
            if (node.kind === 'add-section') {
              const group = resolveAddSectionGroup(node.id);
              let afterNodeId: string | undefined;
              let beforeNodeId: string | undefined;
              if (group.groupId === 'header') {
                const order = itemOrder['sections:header'] ?? [];
                afterNodeId = order[order.length - 1];
              } else if (group.groupId === 'footer') {
                const order = itemOrder['sections:footer'] ?? [];
                beforeNodeId = order[0];
              } else {
                const order = itemOrder[`sections:template:${tplId}`] ?? [];
                afterNodeId = order[order.length - 1];
              }
              openAddSectionModal({
                groupId: group.groupId,
                groupLabel: group.groupLabel,
                afterNodeId,
                beforeNodeId,
              });
              return;
            }
            if (selectedNodeId === node.id) {
              setSelectedNodeId('');
              return;
            }
            setSelectedNodeId(node.id);
            if (node.fields?.length || node.children?.length) {
              setExpanded((prev) => ({
                ...prev,
                [node.id]: true,
                ...expandedIdsForPreviewNode(node.id, sectionsTree),
              }));
            }
          }}
          hiddenNodes={hiddenNodes}
          visibilityValues={values}
          onToggleHidden={(id) => {
            const path = sectionEnabledPathFromNodeId(id);
            if (path) {
              const current = values[path] !== false && values[path] !== 'false';
              handleFieldChange(path, 'boolean', !current);
              return;
            }
            setHiddenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
          }}
          onDeleteNode={handleDeleteSidebarNode}
          onReorder={handleReorder}
          onStructureDragChange={setStructureDragging}
          onInsertSection={openAddSectionModal}
          onInsertHoverChange={setInsertHoverHighlight}
          loading={isCheckoutProfile ? false : loading}
          error={error}
          settingsNode={isCheckoutProfile ? null : settingsNode}
          checkoutSettingsPanel={checkoutSettingsPanel}
          checkoutThemeSettingsNav={checkoutThemeSettingsNav ?? undefined}
          themeSettingsNav={themeSettingsNav ?? undefined}
          settingsValues={values}
          themeConfig={previewConfig}
          onSettingsFieldChange={isCheckoutProfile ? undefined : handleFieldChange}
          onCollectionLinksApply={handleCollectionLinksApply}
          onStoreMenuSelect={handleStoreMenuSelect}
          onCloseSettings={closeSettings}
          onRemoveSettingsSection={handleRemoveSettingsSection}
          onRemoveSettingsBlock={handleRemoveSettingsBlock}
          themeColorPalette={themeColorPalette}
        />

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          className={`pointer-events-auto flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-colors duration-300 ease-out ${
            structureDragging ? 'bg-[#cfcfcf]' : 'bg-white'
          }`}
        >
          {isCheckoutProfile ? (
            <CheckoutProfilePreview
              device={device}
              storeId={previewStoreId}
              storeName={activeStoreName}
              storeUrl={storeSubdomain?.url ?? null}
              pageId={checkoutPreviewPage}
              pageLabel={pageLabel}
              headerPosition={checkoutHeaderPosition}
              footerConfig={checkoutFooterConfig}
              orderSummaryConfig={checkoutOrderSummaryConfig}
              signInMainConfig={checkoutSignInMainConfig}
              thankYouMainConfig={checkoutThankYouMainConfig}
              logo={checkoutLogoPreview}
              theme={checkoutPaletteTheme}
              typography={checkoutTypographyTheme}
              inputFieldsTransparent={checkoutGlobalSettings.inputFieldsTransparent}
              addressAutocompletion={checkoutGlobalSettings.addressAutocompletion}
              inspectorEnabled={inspectorEnabled}
              highlightNodeId={inspectorEnabled ? selectedNodeId || null : null}
              onSelectNode={handleCheckoutPreviewSelect}
            />
          ) : (
          <div
            className={`create-theme-preview-stage relative flex min-h-0 flex-1 flex-col overflow-auto ${
              structureDragging ? 'create-theme-preview-stage--squeezed' : ''
            }`}
          >
          <div
            className={`create-theme-preview-canvas relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white ${
              device === 'mobile' ? 'mx-auto w-full max-w-[390px] border-x border-gray-200' : 'h-full w-full'
              } ${structureDragging ? 'create-theme-preview-canvas--squeezed' : ''}`}
          >
            <CreateThemeLivePreview
              ref={livePreviewRef}
              key={themeRuntime.jsUrl ?? 'composer'}
              className="h-full min-h-0 w-full flex-1"
              device={device}
              storeId={previewStoreId}
              storeName={activeStoreName}
              storefrontOrigin={storeSubdomain?.url ?? null}
              jsUrl={themeRuntime.jsUrl}
              cssUrl={themeRuntime.cssUrl}
              config={livePreviewConfig}
              structureSyncKey={structureSyncKey}
              page={previewPage}
              previewRoute={collectionPreviewRoute}
              selectionHints={selectionHints}
              highlightNodeId={inspectorEnabled ? selectedNodeId || null : null}
              inspectorEnabled={inspectorEnabled}
              onPreviewSelect={({ nodeId }) => handlePreviewSelect(nodeId)}
              onPreviewDeselect={() => setSelectedNodeId('')}
              onPreviewFieldChange={(fieldPath, value) => {
                const schemaType = schemaFieldTypes.get(fieldPath);
                const type = schemaType ? fieldTypeFromSchema(schemaType) : 'text';
                handleFieldChange(fieldPath, type, value);
              }}
              insertHoverHighlight={insertHoverHighlight}
              onPreviewInsertSection={(payload) => {
                const anchor = payload.afterNodeId ?? payload.beforeNodeId ?? '';
                const group = resolveSectionCatalogGroupFromNodeId(anchor);
                openAddSectionModal({ ...group, ...payload });
              }}
            />
            </div>
          </div>
          )}
          </div>
        </div>
      </div>

      <AddBlockModal
        open={Boolean(addBlockTarget)}
        sectionLabel={addBlockTarget?.sectionLabel}
        themeBlockCatalog={blockCatalog}
        editorSchema={editorSchema ?? undefined}
        addBlockNodeId={addBlockTarget?.nodeId}
        onClose={() => setAddBlockTarget(null)}
        onSelectBlock={handleInsertBlock}
      />

      <CreateThemeSaveModal
        open={showSaveThemeModal}
        saving={savingTheme}
        initialName={themeName.trim() === 'Creator Basic' ? '' : themeName}
        initialDesc=""
        onClose={() => {
          if (!savingTheme) setShowSaveThemeModal(false);
        }}
        onSave={handleSaveThemeModalConfirm}
      />

      {addSectionTarget ? (
        <CreateThemeAddSectionModal
          open
          groupId={addSectionTarget.groupId}
          groupLabel={addSectionTarget.groupLabel}
          previewPage={previewPage}
          onClose={() => setAddSectionTarget(null)}
          onSelect={handleInsertElement}
        />
      ) : null}

    </div>
  );
};

export default CreateThemePage;
