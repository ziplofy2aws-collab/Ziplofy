import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  fcHeaderFieldDefs,
  fcHeaderSettingsBaseFromPrefix,
} from '../sidebar/theme-editor-fc-header-panel.utils';
import {
  collectionTitleFieldDefs,
  collectionTitleSettingsBaseFromPrefix,
} from '../sidebar/theme-editor-fc-collection-title-panel.utils';
import {
  viewAllButtonFieldDefs,
  viewAllButtonSettingsBaseFromPrefix,
} from '../sidebar/theme-editor-fc-view-all-button-panel.utils';
import {
  productCardFieldDefs,
  productCardSettingsBaseFromPrefix,
} from '../sidebar/theme-editor-product-card-panel.utils';
import {
  productCardMediaFieldDefs,
  productCardMediaSettingsBaseFromPrefix,
} from '../sidebar/theme-editor-product-card-media-panel.utils';
import {
  productCardTitleFieldDefs,
  productCardTitleSettingsBaseFromPrefix,
} from '../sidebar/theme-editor-product-card-title-panel.utils';
import {
  productCardPriceFieldDefs,
  productCardPriceSettingsBaseFromPrefix,
} from '../sidebar/theme-editor-product-card-price-panel.utils';

export function isFeaturedCollectionSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return (
    secType === 'featured-collection' ||
    catalogVariant === 'featured-collection' ||
    catalogVariant === 'featured-collection-carousel' ||
    catalogVariant === 'featured-collection-editorial' ||
    catalogVariant === 'featured-collection-grid'
  );
}

/** Shopify Featured collection sidebar — Header → Collection title / View all; Product card → Media / Title / Price. */
export function featuredCollectionStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  const headerPrefix = `${prefix}:block:collection_header`;
  const cardPrefix = `${prefix}:block:product_card`;
  return {
    [sectionChildrenListKey]: [headerPrefix, cardPrefix, `${prefix}:add-block`],
    [listKeyBlockChildren(headerPrefix)]: [
      `${headerPrefix}:inner-add-block`,
      `${headerPrefix}:nested:collection_title`,
      `${headerPrefix}:nested:view_all_button`,
    ],
    [listKeyBlockChildren(cardPrefix)]: [
      `${cardPrefix}:inner-add-block`,
      `${cardPrefix}:nested:media`,
      `${cardPrefix}:nested:product_title`,
      `${cardPrefix}:nested:price`,
    ],
  };
}

export function mapFeaturedCollectionBlockNodes(
  prefix: string,
  editorSchema: EditorSchemaDoc,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionAddBlockId = `${prefix}:add-block`;
  const headerPrefix = `${prefix}:block:collection_header`;
  const cardPrefix = `${prefix}:block:product_card`;
  const priceSettingsBase = productCardPriceSettingsBaseFromPrefix(prefix);
  const titleSettingsBase = productCardTitleSettingsBaseFromPrefix(prefix);
  const mediaSettingsBase = productCardMediaSettingsBaseFromPrefix(prefix);
  const cardSettingsBase = productCardSettingsBaseFromPrefix(prefix);
  const viewAllSettingsBase = viewAllButtonSettingsBaseFromPrefix(prefix);
  const collectionTitleSettingsBase = collectionTitleSettingsBaseFromPrefix(prefix);

  const headerSettingsBase = fcHeaderSettingsBaseFromPrefix(prefix);
  const headerFields = headerSettingsBase ? fcHeaderFieldDefs(headerSettingsBase) : [];

  // --- Header node & children ---
  const collectionTitleFields = collectionTitleSettingsBase
    ? collectionTitleFieldDefs(collectionTitleSettingsBase)
    : [];
  const viewAllButtonFields = viewAllSettingsBase ? viewAllButtonFieldDefs(viewAllSettingsBase) : [];

  const headerChildren = reorderSidebarChildren(
    [
      { id: `${headerPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${headerPrefix}:nested:collection_title`,
        label: 'Collection title',
        kind: 'block',
        icon: 'text' as const,
        fields: collectionTitleFields.length ? collectionTitleFields : undefined,
      },
      {
        id: `${headerPrefix}:nested:view_all_button`,
        label: 'View all button',
        kind: 'block',
        icon: 'button' as const,
        fields: viewAllButtonFields.length ? viewAllButtonFields : undefined,
      },
    ],
    listKeyBlockChildren(headerPrefix),
    itemOrder
  );

  const headerNode: SidebarNode = {
    id: headerPrefix,
    label: 'Header',
    kind: 'block',
    icon: 'text' as const,
    fields: headerFields.length ? headerFields : undefined,
    children: headerChildren,
    childrenListKey: listKeyBlockChildren(headerPrefix),
  };

  // --- Product Card node & children ---
  const productCardFields = cardSettingsBase ? productCardFieldDefs(cardSettingsBase) : [];
  const mediaFields = mediaSettingsBase ? productCardMediaFieldDefs(mediaSettingsBase) : [];
  const productTitleFields = titleSettingsBase ? productCardTitleFieldDefs(titleSettingsBase) : [];
  const priceFields = priceSettingsBase ? productCardPriceFieldDefs(priceSettingsBase) : [];

  const cardChildren = reorderSidebarChildren(
    [
      { id: `${cardPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${cardPrefix}:nested:media`,
        label: 'Media',
        kind: 'block',
        icon: 'image' as const,
        fields: mediaFields.length ? mediaFields : undefined,
      },
      {
        id: `${cardPrefix}:nested:product_title`,
        label: 'Product title',
        kind: 'block',
        icon: 'text' as const,
        fields: productTitleFields.length ? productTitleFields : undefined,
      },
      {
        id: `${cardPrefix}:nested:price`,
        label: 'Price',
        kind: 'block',
        icon: 'price' as const,
        fields: priceFields.length ? priceFields : undefined,
      },
    ],
    listKeyBlockChildren(cardPrefix),
    itemOrder
  );

  const productCardNode: SidebarNode = {
    id: cardPrefix,
    label: 'Product card',
    kind: 'block',
    icon: 'product-card' as const,
    fields: productCardFields.length ? productCardFields : undefined,
    showVisibilityToggle: true,
    children: cardChildren,
    childrenListKey: listKeyBlockChildren(cardPrefix),
  };

  return reorderSidebarChildren(
    [
      headerNode,
      productCardNode,
      { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' },
    ],
    sectionChildrenListKey,
    itemOrder
  );
}
