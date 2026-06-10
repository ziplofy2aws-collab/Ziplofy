import type { EditorFieldDef, EditorSchemaDoc, SidebarIcon, SidebarNode } from './theme-editor-sidebar.types';
import { isSectionSettingsFieldPath } from './theme-editor-field.utils';
import { THEME_SETTINGS_CATALOG } from './theme-settings-catalog';
import type { ThemePreviewPage } from '../ThemeLivePreviewFrame';
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
} from '../../../utils/theme-editor-insert-section';
import {
  defaultHeroBlockOrder,
  heroSectionSidebarLabel,
  readCatalogVariant,
} from '../../../utils/hero-banner-variants.util';
import {
  heroBottomAlignedPaths,
  isHeroBottomAlignedSectionConfig,
} from '../../../utils/hero-bottom-aligned.util';
import {
  listKeyBlockChildren,
  listKeyFooterSections,
  listKeyHeaderSections,
  listKeyLayoutBlocks,
  listKeyLayoutSectionChildren,
  listKeySectionChildren,
  listKeyTemplateSections,
  reorderSidebarChildren,
} from './theme-editor-structure-order';
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
  findAnnouncementSectionInTree,
  isAnnouncementLayoutNodeId,
  prepareAnnouncementSettingsNode,
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
  prepareHeaderLogoBlockSettingsNode,
} from './theme-editor-header-logo-block-panel.utils';
import {
  headerMenuBlockFieldDefsFromSchema,
  headerMenuBlockFieldsFromNode,
  instanceIdFromHeaderMenuBlockNodeId,
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
  isFaqSectionType,
  isFaqSettingsPanelFields,
  isFaqBlockField,
  prepareFaqSettingsNode,
  prepareFaqBlockSettingsNode,
} from './theme-editor-faq-panel.utils';
import {
  isIconsWithTextSectionType,
  isIconsWithTextSettingsPanelFields,
  isIconsWithTextBlockField,
  prepareIconsWithTextSettingsNode,
  prepareIconsWithTextBlockSettingsNode,
} from './theme-editor-icons-with-text-panel.utils';
import {
  isMulticolumnSectionType,
  isMulticolumnSettingsPanelFields,
  isMulticolumnBlockField,
  isMulticolumnBlockFieldsOnly,
  prepareMulticolumnSettingsNode,
  prepareMulticolumnBlockSettingsNode,
} from './theme-editor-multicolumn-panel.utils';
import {
  isPullQuoteSectionType,
  isPullQuoteSettingsPanelFields,
  preparePullQuoteSettingsNode,
} from './theme-editor-pull-quote-panel.utils';
import {
  isRichTextSectionType,
  isRichTextSettingsPanelFields,
  prepareRichTextSettingsNode,
} from './theme-editor-rich-text-panel.utils';
import {
  isTextMarqueeSectionType,
  isTextMarqueeSettingsPanelFields,
  prepareTextMarqueeSettingsNode,
} from './theme-editor-text-marquee-panel.utils';
import {
  isBlogPostsCarouselSectionType,
  isBlogPostsCarouselSettingsPanelFields,
  prepareBlogPostsCarouselSettingsNode,
} from './theme-editor-blog-posts-carousel-panel.utils';
import {
  isBlogPostsEditorialSectionType,
  isBlogPostsEditorialSettingsPanelFields,
  prepareBlogPostsEditorialSettingsNode,
} from './theme-editor-blog-posts-editorial-panel.utils';
import {
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
  isRecommendedProductsSectionType,
  isRecommendedProductsSettingsPanelFields,
  prepareRecommendedProductsSettingsNode,
} from './theme-editor-recommended-products-panel.utils';
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
  isCollectionLinkBlockFieldsOnly,
  prepareCollectionLinkBlockSettingsNode,
} from './theme-editor-collection-link-block-panel.utils';
import { mapCollectionLinksSpotlightBlockNodes } from '../../../utils/collection-links-spotlight-sidebar.util';
import { mapFeaturedProductBlockNodes } from '../../../utils/featured-product-sidebar.util';
import {
  isCollectionTileBlockFieldsOnly,
  prepareCollectionTileBlockSettingsNode,
} from './theme-editor-collection-tile-block-panel.utils';
import {
  isStorytellingCarouselSectionType,
  isStorytellingCarouselSettingsPanelFields,
  prepareStorytellingCarouselSettingsNode,
} from './theme-editor-storytelling-carousel-panel.utils';
import {
  isDividerSectionType,
  isDividerSettingsPanelFields,
  prepareDividerSettingsNode,
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
  isFeaturedCollectionGroupedPanelSectionType,
  isFeaturedCollectionSectionNodeId,
  prepareFeaturedCollectionSettingsNode,
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
  headingBlockFieldDefsFromSchema,
  isHeadingBlockNodeId,
  isHeadingPanelField,
  prepareHeadingBlockSettingsNode,
} from './theme-editor-heading-block-panel.utils';
import {
  heroButtonFieldDefsFromSchema,
  isHeroButtonBlockNodeId,
  isHeroButtonPanelField,
  prepareHeroButtonSettingsNode,
} from './theme-editor-hero-button-panel.utils';
import {
  isFeaturedCollectionHeaderBlockNodeId,
  isFeaturedCollectionHeaderNestedNodeId,
  prepareFeaturedCollectionHeaderNestedNode,
  prepareFeaturedCollectionHeaderSettingsNode,
} from './theme-editor-fc-header-panel.utils';
import {
  collectionTitleFieldDefsFromSchema,
  isCollectionTitleNestedNodeId,
  prepareCollectionTitleSettingsNode,
} from './theme-editor-fc-collection-title-panel.utils';
import {
  isProductCardBlockNodeId,
  prepareProductCardSettingsNode,
  productCardFieldDefsFromSchema,
} from './theme-editor-product-card-panel.utils';
import {
  isProductCardPriceNestedNodeId,
  prepareProductCardPriceSettingsNode,
  productCardPriceFieldDefsFromSchema,
} from './theme-editor-product-card-price-panel.utils';
import {
  isProductCardMediaNestedNodeId,
  prepareProductCardMediaSettingsNode,
  productCardMediaFieldDefsFromSchema,
} from './theme-editor-product-card-media-panel.utils';
import {
  isProductCardTitleNestedNodeId,
  prepareProductCardTitleSettingsNode,
  productCardTitleFieldDefsFromSchema,
} from './theme-editor-product-card-title-panel.utils';
import { resolveEditingPanelForNode } from '../../../theme-editor/section-editing-support.util';
import {
  catalogSidebarBlocksForSectionType,
  settingsNodeFromCatalog,
} from '../../../theme-editor/catalog-sidebar.util';

function templateIdForPage(previewPage: ThemePreviewPage): string {
  return previewPage || 'index';
}

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
  const opt = menuField.options?.find((o) => o.value === value);
  return opt?.label ?? value;
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

  const textField = (path: string, label: string): EditorFieldDef => ({
    path,
    type: 'textarea',
    label,
  });

  const headingGroupNode: SidebarNode = {
    id: headingGroupPrefix,
    label: 'Group',
    kind: 'block',
    icon: 'group',
    childrenListKey: listKeyBlockChildren(headingGroupPrefix),
    children: reorderSidebarChildren(
      [
        { id: `${headingGroupPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
        {
          id: `${headingGroupPrefix}:nested:text_intro`,
          label: 'Text',
          kind: 'block',
          icon: 'text',
          preview: fieldPreview(textField(paths.textIntro, 'Text'), values),
          fields: [textField(paths.textIntro, 'Text')],
        },
        {
          id: `${headingGroupPrefix}:nested:heading_main`,
          label: 'Heading',
          kind: 'block',
          icon: 'text',
          preview: fieldPreview(textField(paths.headingMain, 'Text'), values),
          fields: [textField(paths.headingMain, 'Text')],
        },
        { id: `${headingGroupPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
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
          fields: [textField(paths.textBody, 'Text')],
        },
        { id: `${contentPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
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
  if (blockId === 'heading') return 'Heading';
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
      const blockSettingsFields = remapFields(base.settingsFields, instanceId);
      const isMenu = blockId === 'menu' || (base.id ?? '') === 'menu';

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
        !isHeadingBlock && !isButtonBlock && blockSettingsFields.length
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
  const isFooter = layoutBlueprintKey(instanceId) === 'footer';
  const isFooterUtilities = layoutBlueprintKey(instanceId) === 'footer_utilities';
  const utilitiesVariant = isFooterUtilities ? layoutCatalogVariantFromValues(values, instanceId) : '';
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
  if ((isFaqLayout || isIconsWithTextLayout || isMulticolumnLayout) && remappedBlocks?.length) {
    blockNodes = mapBlockNodes(
      remappedBlocks,
      id,
      `${id}:add-block`,
      values,
      itemOrder,
      listKeyLayoutBlocks(instanceId),
      isFeaturedCollectionLayout ? { innerAddBlockPlacement: 'top' } : undefined
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
    isAnnouncement || isHeader || isFaqLayout || isIconsWithTextLayout || isMulticolumnLayout
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
          : isProductHighlightLayout
            ? 'Product highlight'
            : isEditorialLayout
              ? 'Editorial'
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
                                      : sec.label ?? instanceId,
    kind: 'section',
    icon: 'section',
    fields: isHeader
      ? collectHeaderPanelFieldDefs(sec, instanceId, remapFields)
      : isFooter
        ? collectFooterPanelFieldDefs(sec, instanceId, remapFields)
        : isFooterUtilities
          ? collectFooterUtilitiesPanelFieldDefs(sec, instanceId, remapFields)
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
  const remappedBlocks = withSplitShowcaseBlock(
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
    ? mapHeroBlockNodes(visibleBlocks, prefix, `${prefix}:add-block`, values, itemOrder, childrenListKey)
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
  config: Record<string, unknown> | null = null
): SidebarNode {
  const blueprintId = sec.id ?? 'section';
  const secId = instanceId ?? blueprintId;
  const prefix = `template:${tplId}:${secId}`;
  const childrenListKey = listKeySectionChildren(tplId, secId);
  const settingsBase = `templates.${tplId}.sections.${secId}.settings`;
  const blocksBase = `templates.${tplId}.sections.${secId}.blocks`;
  const catalogVariantEarly = readCatalogVariant(config, settingsBase);
  const isFeaturedCollection = sec.type === 'featured-collection';
  const isFeaturedCollectionGrouped = isFeaturedCollectionGroupedPanelSectionType(
    sec.type,
    catalogVariantEarly
  );
  const isHero = sec.type === 'hero' || sec.id === 'hero_main';
  const isDivider = sec.type === 'divider';
  const isContactForm = isContactFormSectionType(sec.type, catalogVariantEarly);
  const isEmailSignup = isEmailSignupSectionType(sec.type, catalogVariantEarly);
  const isCustomSection = isCustomSectionType(sec.type, catalogVariantEarly);
  const isFeaturedProduct = isFeaturedProductSectionType(sec.type, catalogVariantEarly);
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
    ? withSplitShowcaseBlock(
        sec.blocks?.map((b) => remapTemplateBlockDef(b, tplId, secId)),
        catalogVariant,
        blocksBase
      )
    : sec.blocks?.map((b) => remapTemplateBlockDef(b, tplId, secId)) ?? [];
  const catalogBlocks = isFeaturedCollection
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
    isBlogPostsCarousel ||
    isBlogPostsEditorial ||
    isBlogPostsGrid ||
    isProductHotspots ||
    isRecommendedProducts ||
    isCollectionLinksSpotlight ||
    isCollectionListBento ||
    isCollectionListCarousel ||
    isCollectionListEditorial ||
    isCollectionListGrid ||
    isLayeredSlideshow ||
    isSlideshowFullFrame ||
    isSlideshowInset
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
      : heroVisibleBlocks.length
      ? isHero
        ? mapHeroBlockNodes(heroVisibleBlocks, prefix, `${prefix}:add-block`, values, itemOrder, childrenListKey)
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
      isFaq ||
      isIconsWithText ||
      isMulticolumn ||
      isCollectionLinksSpotlight ||
      isFeaturedProduct
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
              : isProductHighlightSectionType(sec.type, catalogVariant)
                ? 'Product highlight'
                : isEditorialSectionType(sec.type, catalogVariant)
                  ? 'Editorial'
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
                                              : isProductHotspotsSectionType(sec.type, catalogVariant)
                                                ? 'Product hotspots'
                                                : isRecommendedProductsSectionType(sec.type, catalogVariant)
                                                  ? 'Recommended products'
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
                                                    : isFeaturedCollectionGroupedPanelSectionType(
                                                    sec.type,
                                                    catalogVariant
                                                  )
                                                ? featuredCollectionSidebarLabel(
                                                    catalogVariant,
                                                    sec.label ?? 'Featured collection'
                                                  )
                                                : sec.label ?? blueprintId,
    kind: 'section',
    icon: isCollectionLinksSpotlight ? 'link' : 'section',
    fields:
      isHero || isCollectionLinksSpotlight
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
        isStorytellingCarousel) &&
      canDeleteTemplateSection(tplId, secId),
  };
}

/** Empty creator / new-theme sidebar: Header, Template, and Footer with only Add section rows. */
export function buildEmptyShopifySidebarTree(
  previewPage: ThemePreviewPage = 'index'
): SidebarNode[] {
  const templateId = templateIdForPage(previewPage);
  return [
    {
      id: 'group:header',
      label: 'Header',
      kind: 'group-label',
      children: [{ id: 'layout:add-section', label: 'Add section', kind: 'add-section' }],
      childrenListKey: listKeyHeaderSections(),
    },
    {
      id: 'group:template',
      label: 'Template',
      kind: 'group-label',
      children: [
        { id: `template:${templateId}:add-section`, label: 'Add section', kind: 'add-section' },
      ],
      childrenListKey: listKeyTemplateSections(templateId),
    },
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
  const templateId = templateIdForPage(previewPage);
  const layout = schema.layout ?? {};
  const cfg = config ?? {};

  if (config) {
    const cfgClone = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
    ensureLayoutOrder(cfgClone);
  }

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

  const tpl = schema.templates?.find((t) => t.id === templateId) ?? schema.templates?.[0];
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
  if (tpl?.sections?.length) {
    const tplSections = (tplConfig?.sections ?? {}) as Record<string, unknown>;
    for (const instanceId of templateSectionOrder) {
      if (!tplSections[instanceId]) continue;
      const blueprintId = templateBlueprintKey(instanceId);
      const sec = tpl.sections.find((s) => (s.id ?? '') === blueprintId);
      if (!sec) continue;
      templateSectionNodes.push(sectionToNode(sec, tpl.id, values, itemOrder, instanceId, config));
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

/** Collapsed by default — matches Shopify editor (expand sections to see blocks). */
export function defaultExpandedSidebar(_nodes: SidebarNode[]): Record<string, boolean> {
  return {};
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
  'Image compare': prepareImageCompareSettingsNode,
  'Image with text': prepareImageWithTextSettingsNode,
  Logo: prepareStorytellingLogoSettingsNode,
  Video: prepareStorytellingVideoSettingsNode,
  FAQ: prepareFaqSettingsNode,
  'Icons with text': prepareIconsWithTextSettingsNode,
  Multicolumn: prepareMulticolumnSettingsNode,
  'Pull quote': preparePullQuoteSettingsNode,
  'Rich text': prepareRichTextSettingsNode,
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
  'Contact form': prepareContactFormSettingsNode,
  'Email signup': prepareEmailSignupSettingsNode,
  'Custom section': prepareCustomSectionSettingsNode,
  Hero: prepareHeroSettingsNode,
  'Hero: Bottom aligned': prepareHeroBottomAlignedSettingsNode,
  'Hero: Marquee': prepareHeroMarqueeSettingsNode,
};

export function settingsNodeForSelection(
  selectedNode: SidebarNode | null,
  tree: SidebarNode[] = [],
  editorSchema?: EditorSchemaDoc | null
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
  if (announcementSection && node.kind === 'section') {
    let sectionFields = announcementSection.fields ?? [];
    if (!sectionFields.length) {
      const catalogSection = resolveEditingPanelForNode(announcementSection.id);
      if (catalogSection?.fields.length) sectionFields = catalogSection.fields;
    }
    if (sectionFields.length) {
      return prepareAnnouncementSettingsNode({ ...announcementSection, fields: sectionFields });
    }
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

  if (isHeadingBlockNodeId(node.id)) {
    let fields = editorSchema ? headingBlockFieldDefsFromSchema(editorSchema, node.id) : [];
    if (!fields.length) {
      fields = (node.fields ?? []).filter(isHeadingPanelField);
    }
    return prepareHeadingBlockSettingsNode({ ...node, fields });
  }

  if (isHeroButtonBlockNodeId(node.id)) {
    let fields = editorSchema ? heroButtonFieldDefsFromSchema(editorSchema, node.id) : [];
    if (!fields.length) {
      fields = (node.fields ?? []).filter(isHeroButtonPanelField);
    }
    return prepareHeroButtonSettingsNode({ ...node, fields });
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

  const catalogNode = settingsNodeFromCatalog(node);
  if (catalogNode) {
    if (isCollectionLinksSpotlightSettingsPanelFields(catalogNode.fields ?? [])) {
      return prepareCollectionLinksSpotlightSettingsNode(catalogNode);
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

  if (
    !isHeroSectionSettingsNode(node) &&
    node.fields?.length &&
    isContactFormSettingsPanelFields(node.fields)
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
    !isHeroSectionSettingsNode(node) &&
    node.fields?.length &&
    isCustomSectionSettingsPanelFields(node.fields)
  ) {
    return prepareCustomSectionSettingsNode(node);
  }

  if (node.fields?.length && isDividerSettingsPanelFields(node.fields)) {
    return prepareDividerSettingsNode(node);
  }

  if (isFeaturedProductMediaBlockNodeId(node.id)) {
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

  if (isFeaturedProductHeaderBlockNodeId(node.id)) {
    const fields = editorSchema
      ? featuredProductHeaderFieldDefsFromSchema(editorSchema, node.id)
      : featuredProductHeaderFieldDefsFromNodeId(node.id);
    if (fields.length) {
      return prepareFeaturedProductHeaderSettingsNode({ ...node, fields });
    }
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
    return prepareFeaturedProductQuantitySettingsNode(node);
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

  if (node.fields?.length && isFeaturedProductSettingsPanelFields(node.fields)) {
    return prepareFeaturedProductSettingsNode(node);
  }

  if (node.fields?.length && isProductHighlightSettingsPanelFields(node.fields)) {
    return prepareProductHighlightSettingsNode(node);
  }

  if (node.fields?.length && isEditorialSettingsPanelFields(node.fields)) {
    return prepareEditorialSettingsNode(node);
  }

  if (node.fields?.length && isEditorialJumboSettingsPanelFields(node.fields)) {
    return prepareEditorialJumboSettingsNode(node);
  }
  if (node.fields?.length && isImageCompareSettingsPanelFields(node.fields)) {
    return prepareImageCompareSettingsNode(node);
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
  if (node.fields?.length && isFaqSettingsPanelFields(node.fields)) {
    return prepareFaqSettingsNode(node);
  }
  if (node.fields?.length && isIconsWithTextSettingsPanelFields(node.fields)) {
    return prepareIconsWithTextSettingsNode(node);
  }
  if (node.fields?.length && node.fields.every(isFaqBlockField)) {
    return prepareFaqBlockSettingsNode(node);
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
    return prepareTextMarqueeSettingsNode(node);
  }
  if (node.fields?.length && isBlogPostsCarouselSettingsPanelFields(node.fields)) {
    return prepareBlogPostsCarouselSettingsNode(node);
  }
  if (node.fields?.length && isBlogPostsEditorialSettingsPanelFields(node.fields)) {
    return prepareBlogPostsEditorialSettingsNode(node);
  }
  if (node.fields?.length && isBlogPostsGridSettingsPanelFields(node.fields)) {
    return prepareBlogPostsGridSettingsNode(node);
  }
  if (node.fields?.length && isProductHotspotsSettingsPanelFields(node.fields)) {
    return prepareProductHotspotsSettingsNode(node);
  }
  if (node.fields?.length && isRecommendedProductsSettingsPanelFields(node.fields)) {
    return prepareRecommendedProductsSettingsNode(node);
  }
  if (node.fields?.length && isCollectionLinkBlockFieldsOnly(node.fields)) {
    return prepareCollectionLinkBlockSettingsNode(node);
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
  if (node.fields?.length && isLayeredSlideshowSettingsPanelFields(node.fields)) {
    return prepareLayeredSlideshowSettingsNode(node);
  }
  if (node.fields?.length && isSlideshowFullFrameSettingsPanelFields(node.fields)) {
    return prepareSlideshowFullFrameSettingsNode(node);
  }
  if (node.fields?.length && isSlideshowInsetSettingsPanelFields(node.fields)) {
    return prepareSlideshowInsetSettingsNode(node);
  }
  if (node.fields?.length && isSlideshowSlideBlockFieldsOnly(node.fields)) {
    return prepareSlideshowSlideBlockSettingsNode(node);
  }
  if (node.fields?.length && isCollectionTileBlockFieldsOnly(node.fields)) {
    return prepareCollectionTileBlockSettingsNode(node);
  }
  if (node.fields?.length && isStorytellingCarouselSettingsPanelFields(node.fields)) {
    return prepareStorytellingCarouselSettingsNode(node);
  }

  const heroSection =
    node.kind === 'section' && isHeroSectionNodeId(node.id)
      ? node
      : findHeroSectionInTree(node.id, tree);
  const heroTextBlock = node.id.match(
    /^(template:[^:]+:hero_main(?:_\d+)?|layout:hero_main(?:_\d+)?):block:(text(?:_\d+)?)$/
  );
  if (heroTextBlock) {
    const [, sectionPrefix, blockId] = heroTextBlock;
    let fields = node.fields ?? [];
    if (!fields.length && editorSchema) {
      const tpl = editorSchema.templates?.find((t) => t.id === 'index');
      const sec = tpl?.sections?.find((s) => s.id === 'hero_main');
      const textSource =
        sec?.blocks?.find((b) => (b.id ?? '') === blockId) ??
        sec?.blocks?.find((b) => (b.id ?? '') === 'text_2') ??
        sec?.blocks?.find((b) => (b.id ?? '').startsWith('text'));
      const sourceId = textSource?.id ?? 'text_2';
      const sourceFields = textSource?.settingsFields ?? [];
      fields = sourceFields.map((f) => {
        const remappedPath = sourceId !== blockId
          ? f.path.replace(`.blocks.${sourceId}.`, `.blocks.${blockId}.`)
          : f.path;
        if (sectionPrefix.startsWith('layout:')) {
          const layoutInstanceId = sectionPrefix.slice('layout:'.length);
          return { ...f, path: remapTemplateHeroSchemaPath(remappedPath, layoutInstanceId) };
        }
        return { ...f, path: remappedPath };
      });
    }
    if (fields.length) {
      return { ...node, label: 'Text', kind: 'block', fields };
    }
  }

  if (node.kind === 'section' && node.fields?.length) return node;
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
    const prepareByLabel = SECTION_PANEL_BY_LABEL[node.label ?? ''];
    if (prepareByLabel) {
      const prepared = prepareByLabel(node);
      if (prepared.fields?.length) return prepared;
    }
    const visible = fields.filter(
      (f) => f.sidebar !== false && isSectionSettingsFieldPath(f.path ?? '')
    );
    if (visible.length) return { ...node, fields: visible };
  }

  return null;
}
