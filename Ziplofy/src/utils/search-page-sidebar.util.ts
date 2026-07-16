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

export const SEARCH_BLOCK_ORDER = ['heading', 'search_input'] as const;
export const SEARCH_RESULTS_BLOCK_ORDER = ['filtering_and_sorting', 'product_card'] as const;
export const SEARCH_RESULTS_CARD_NESTED_ORDER = ['media', 'product_title', 'price'] as const;

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

function searchBlocksBase(prefix: string): string {
  const match = prefix.match(/^template:([^:]+):((?:search)(?:_\d+)?)$/);
  if (!match) return '';
  return `templates.${match[1]}.sections.${match[2]}.blocks`;
}

function searchResultsSettingsBase(prefix: string): string {
  const match = prefix.match(/^template:([^:]+):((?:search_results)(?:_\d+)?)$/);
  if (!match) return '';
  return `templates.${match[1]}.sections.${match[2]}.settings`;
}

/** Search page — Heading + Search input. */
export function mapSearchBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const blocksBase = searchBlocksBase(prefix);
  const headingFields = blocksBase ? textBlockFieldDefs(`${blocksBase}.heading`) : [];
  const headingTextField = headingFields.find((f) => f.path.endsWith('.text'));
  const inputSettingsBase = blocksBase ? `${blocksBase}.search_input.settings` : '';

  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  const headingNode: SidebarNode = {
    id: `${prefix}:block:heading`,
    label: 'Heading',
    kind: 'block',
    icon: 'text',
    fields: headingFields.length ? headingFields : undefined,
    preview: headingTextField ? fieldPreview(headingTextField, values) : undefined,
    showVisibilityToggle: true,
  };
  const inputNode: SidebarNode = {
    id: `${prefix}:block:search_input`,
    label: 'Search input',
    kind: 'block',
    icon: 'section',
    fields: inputSettingsBase
      ? [
          {
            path: `${inputSettingsBase}.placeholder`,
            type: 'text',
            label: 'Placeholder',
            sidebar: true,
          },
        ]
      : undefined,
    showVisibilityToggle: true,
  };

  return reorderSidebarChildren(
    [addBlock, headingNode, inputNode],
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

/** Search results — Filtering and sorting + Product card. */
export function mapSearchResultsBlockNodes(
  prefix: string,
  settingsBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };

  const filteringSettingsBase = `${settingsBase.replace(/\.settings$/, '')}.blocks.filtering_and_sorting.settings`;
  const filteringNode: SidebarNode = {
    id: `${prefix}:block:filtering_and_sorting`,
    label: 'Filtering and sorting',
    kind: 'block',
    icon: 'section',
    fields: FILTERING_FIELD_DEFS(filteringSettingsBase),
    showVisibilityToggle: true,
  };

  const cardPrefix = `${prefix}:block:product_card`;
  // Reuse product-card path helpers — they key off `:block:product_card` in the prefix.
  const cardSettingsBase =
    productCardSettingsBaseFromPrefix(prefix) ||
    `${settingsBase.replace(/\.settings$/, '')}.blocks.product_card.settings`;
  const mediaSettingsBase =
    productCardMediaSettingsBaseFromPrefix(prefix) || cardSettingsBase;
  const titleSettingsBase =
    productCardTitleSettingsBaseFromPrefix(prefix) || cardSettingsBase;
  const priceSettingsBase =
    productCardPriceSettingsBaseFromPrefix(prefix) || cardSettingsBase;

  const productCardFields = productCardFieldDefs(cardSettingsBase);
  const mediaFields = productCardMediaFieldDefs(mediaSettingsBase);
  const productTitleFields = productCardTitleFieldDefs(titleSettingsBase);
  const priceFields = productCardPriceFieldDefs(priceSettingsBase);

  const resultsHeadingPath = `${settingsBase}.resultsHeading`;
  if (!productCardFields.some((f) => f.path === resultsHeadingPath)) {
    // Section-level results heading is edited on the section panel, not the card.
  }

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
    [addBlock, filteringNode, productCardNode],
    sectionChildrenListKey,
    itemOrder
  );
}

export function searchTemplateStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      `${prefix}:block:heading`,
      `${prefix}:block:search_input`,
    ],
  };
}

export function searchResultsTemplateStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
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

export function isSearchSectionType(secType: string | undefined): boolean {
  return secType === 'search';
}

export function isSearchResultsSectionType(secType: string | undefined): boolean {
  return secType === 'search-results';
}

/** Unused helper kept for callers that resolve settings base from prefix. */
export function searchResultsSettingsBaseFromPrefix(prefix: string): string {
  return searchResultsSettingsBase(prefix);
}
