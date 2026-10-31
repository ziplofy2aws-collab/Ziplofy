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
import { textBlockFieldDefs } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';

export const COLLECTION_HEADING_BLOCK_ORDER = ['title', 'description'] as const;

export const MAIN_COLLECTION_BLOCK_ORDER = ['filtering_and_sorting', 'product_card'] as const;

export const MAIN_COLLECTION_CARD_NESTED_ORDER = ['media', 'product_title', 'price'] as const;

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

function collectionHeadingBlocksBase(prefix: string): string {
  const match = prefix.match(/^template:([^:]+):((?:collection_heading)(?:_\d+)?)$/);
  if (!match) return '';
  return `templates.${match[1]}.sections.${match[2]}.blocks`;
}

/** Collection page heading — Title + Description blocks. */
export function mapCollectionHeadingBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const blocksBase = collectionHeadingBlocksBase(prefix);
  const titleFields = blocksBase ? textBlockFieldDefs(`${blocksBase}.title`) : [];
  const descriptionFields = blocksBase ? textBlockFieldDefs(`${blocksBase}.description`) : [];
  const titleTextField = titleFields.find((f) => f.path.endsWith('.text'));

  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  const titleNode: SidebarNode = {
    id: `${prefix}:block:title`,
    label: 'Title',
    kind: 'block',
    icon: 'text',
    fields: titleFields.length ? titleFields : undefined,
    preview: titleTextField ? fieldPreview(titleTextField, values) : undefined,
    showVisibilityToggle: true,
  };
  const descriptionNode: SidebarNode = {
    id: `${prefix}:block:description`,
    label: 'Description',
    kind: 'block',
    icon: 'text',
    fields: descriptionFields.length ? descriptionFields : undefined,
    showVisibilityToggle: true,
  };

  return reorderSidebarChildren(
    [addBlock, titleNode, descriptionNode],
    sectionChildrenListKey,
    itemOrder
  );
}

const FILTERING_FIELD_DEFS = (settingsBase: string): EditorFieldDef[] => [
  {
    path: `${settingsBase}.enableFiltering`,
    type: 'boolean',
    label: 'Enable filtering',
    sidebar: true,
  },
  {
    path: `${settingsBase}.enableSorting`,
    type: 'boolean',
    label: 'Enable sorting',
    sidebar: true,
  },
];

/** Collection page main section — Filtering and sorting + Product card. */
export function mapMainCollectionBlockNodes(
  prefix: string,
  settingsBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };

  const filteringSettingsBase = `${settingsBase.replace(/\.settings$/, '')}.blocks.filtering_and_sorting.settings`;
  const filteringFields = FILTERING_FIELD_DEFS(filteringSettingsBase);
  const filteringNode: SidebarNode = {
    id: `${prefix}:block:filtering_and_sorting`,
    label: 'Filtering and sorting',
    kind: 'block',
    icon: 'section',
    fields: filteringFields,
    showVisibilityToggle: true,
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
        label: 'Product image',
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
    [addBlock, filteringNode, productCardNode],
    sectionChildrenListKey,
    itemOrder
  );
}

function collectionPageStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  kind: 'heading' | 'main'
): Record<string, string[]> {
  if (kind === 'heading') {
    return {
      [sectionChildrenListKey]: [
        `${prefix}:add-block`,
        `${prefix}:block:title`,
        `${prefix}:block:description`,
      ],
    };
  }
  const cardPrefix = `${prefix}:block:product_card`;
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      `${prefix}:block:filtering_and_sorting`,
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

export function collectionHeadingTemplateStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return collectionPageStructureOrder(prefix, sectionChildrenListKey, 'heading');
}

export function mainCollectionTemplateStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return collectionPageStructureOrder(prefix, sectionChildrenListKey, 'main');
}
