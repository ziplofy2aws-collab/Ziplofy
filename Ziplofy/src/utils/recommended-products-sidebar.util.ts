import type { EditorFieldDef, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../create-theme/sidebar/create-theme-structure-order';
import {
  productCardFieldDefs,
  productCardSettingsBaseFromPrefix,
} from '../create-theme/sidebar/theme-editor-product-card-panel.utils';
import {
  productCardMediaFieldDefs,
  productCardMediaSettingsBaseFromPrefix,
} from '../create-theme/sidebar/theme-editor-product-card-media-panel.utils';
import {
  productCardPriceFieldDefs,
  productCardPriceSettingsBaseFromPrefix,
} from '../create-theme/sidebar/theme-editor-product-card-price-panel.utils';
import {
  productCardTitleFieldDefs,
  productCardTitleSettingsBaseFromPrefix,
} from '../create-theme/sidebar/theme-editor-product-card-title-panel.utils';
import {
  recommendedProductsHeaderFieldDefs,
} from '../create-theme/sidebar/theme-editor-recommended-products-header-panel.utils';

export const RECOMMENDED_PRODUCTS_CARD_NESTED_ORDER = [
  'media',
  'product_title',
  'price',
] as const;

export const RECOMMENDED_PRODUCTS_SECTION_BLOCK_ORDER = ['product_card'] as const;

function fieldPreview(
  field: EditorFieldDef,
  values: Record<string, string | boolean>
): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

/** Shopify Recommended products: Add block → Header → Product card (Media / Title / Price). */
export function mapRecommendedProductsBlockNodes(
  prefix: string,
  settingsBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };

  const headerFields = recommendedProductsHeaderFieldDefs(settingsBase);
  const headingField = headerFields.find((f) => f.path.endsWith('.heading')) ?? headerFields[0];
  const headerNode: SidebarNode = {
    id: `${prefix}:block:header`,
    label: 'Header',
    kind: 'block',
    icon: 'text',
    fields: headerFields.length ? headerFields : undefined,
    preview: headingField ? fieldPreview(headingField, values) : undefined,
  };

  const cardPrefix = `${prefix}:block:product_card`;
  const cardSettingsBase = productCardSettingsBaseFromPrefix(prefix);
  const mediaSettingsBase = productCardMediaSettingsBaseFromPrefix(prefix);
  const titleSettingsBase = productCardTitleSettingsBaseFromPrefix(prefix);
  const priceSettingsBase = productCardPriceSettingsBaseFromPrefix(prefix);

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
        icon: 'image',
        fields: mediaFields.length ? mediaFields : undefined,
      },
      {
        id: `${cardPrefix}:nested:product_title`,
        label: 'Product title',
        kind: 'block',
        icon: 'text',
        fields: productTitleFields.length ? productTitleFields : undefined,
      },
      {
        id: `${cardPrefix}:nested:price`,
        label: 'Price',
        kind: 'block',
        icon: 'price',
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
    icon: 'product-card',
    fields: productCardFields.length ? productCardFields : undefined,
    showVisibilityToggle: true,
    children: cardChildren,
    childrenListKey: listKeyBlockChildren(cardPrefix),
  };

  return reorderSidebarChildren(
    [addBlock, headerNode, productCardNode],
    sectionChildrenListKey,
    itemOrder
  );
}

export function recommendedProductsStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  settingsBase: string
): Record<string, string[]> {
  const cardPrefix = `${prefix}:block:product_card`;
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      `${prefix}:block:header`,
      cardPrefix,
    ],
    [listKeyBlockChildren(cardPrefix)]: [
      `${cardPrefix}:inner-add-block`,
      `${cardPrefix}:nested:media`,
      `${cardPrefix}:nested:product_title`,
      `${cardPrefix}:nested:price`,
    ],
  };
}

export function recommendedProductsLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  layoutKey: string
): Record<string, string[]> {
  return recommendedProductsStructureOrder(
    prefix,
    sectionChildrenListKey,
    `sections.${layoutKey}.settings`
  );
}

export function recommendedProductsTemplateStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  tplId: string,
  secId: string
): Record<string, string[]> {
  return recommendedProductsStructureOrder(
    prefix,
    sectionChildrenListKey,
    `templates.${tplId}.sections.${secId}.settings`
  );
}

export { isRecommendedProductsHeaderNodeId as isRecommendedProductsHeadingFieldNodeId } from '../create-theme/sidebar/theme-editor-recommended-products-header-panel.utils';
