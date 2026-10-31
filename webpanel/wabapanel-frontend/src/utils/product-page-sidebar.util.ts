import type { SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../create-theme/sidebar/create-theme-structure-order';
import { featuredProductMediaFieldDefs } from '../create-theme/sidebar/theme-editor-featured-product-media-block-panel.utils';
import { featuredProductDetailsFieldDefs } from '../create-theme/sidebar/theme-editor-featured-product-details-block-panel.utils';
import { featuredProductHeaderFieldDefs } from '../create-theme/sidebar/theme-editor-featured-product-header-block-panel.utils';
import { featuredProductBuyButtonsFieldDefs } from '../create-theme/sidebar/theme-editor-featured-product-buy-buttons-block-panel.utils';

export const PRODUCT_PAGE_SECTION_BLOCK_ORDER = [
  'product_media',
  'details',
  'disclosures',
] as const;

export const PRODUCT_PAGE_DETAILS_BLOCK_ORDER = [
  'header',
  'divider',
  'variant_picker',
  'buy_buttons',
  'description',
] as const;

export const PRODUCT_PAGE_HEADER_NESTED_ORDER = ['title', 'price'] as const;

export const PRODUCT_PAGE_BUY_BUTTONS_NESTED_ORDER = [
  'quantity',
  'add_to_cart',
  'accelerated_checkout',
] as const;

const BLOCK_LABELS: Record<string, string> = {
  product_media: 'Product media',
  details: 'Details',
  disclosures: 'Disclosures',
  header: 'Header',
  divider: 'Divider',
  variant_picker: 'Variant picker',
  buy_buttons: 'Buy buttons',
  description: 'Product description',
  title: 'Product title',
  price: 'Price',
  quantity: 'Quantity',
  add_to_cart: 'Add to cart',
  accelerated_checkout: 'Accelerated checkout',
};

function productPageBlockIcon(blockId: string): SidebarIcon {
  switch (blockId) {
    case 'product_media':
      return 'image';
    case 'details':
    case 'disclosures':
    case 'quantity':
    case 'divider':
      return 'default';
    case 'header':
      return 'group';
    case 'variant_picker':
      return 'product-card';
    case 'buy_buttons':
    case 'add_to_cart':
    case 'accelerated_checkout':
      return 'button';
    case 'title':
    case 'description':
      return 'title';
    case 'price':
      return 'price';
    default:
      return 'section';
  }
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function readSectionBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): string[] {
  if (!config) return [];
  const order = getNested(config, ['templates', tplId, 'sections', secId, 'block_order']);
  if (!Array.isArray(order)) return [];
  const blocks = getNested(config, ['templates', tplId, 'sections', secId, 'blocks']) as
    | Record<string, unknown>
    | undefined;
  return order.filter((id): id is string => typeof id === 'string' && Boolean(blocks?.[id]));
}

function readDetailsBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): string[] {
  if (!config) return [];
  const details = getNested(config, [
    'templates',
    tplId,
    'sections',
    secId,
    'blocks',
    'details',
  ]) as Record<string, unknown> | undefined;
  const order = details?.block_order;
  if (!Array.isArray(order)) return [];
  const blocks = (details?.blocks ?? {}) as Record<string, unknown>;
  return order.filter((id): id is string => typeof id === 'string' && id in blocks);
}

function readBuyButtonsNestedBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): string[] {
  if (!config) return [];
  const buyButtons = getNested(config, [
    'templates',
    tplId,
    'sections',
    secId,
    'blocks',
    'details',
    'blocks',
    'buy_buttons',
  ]) as Record<string, unknown> | undefined;
  const order = buyButtons?.block_order;
  if (!Array.isArray(order)) return [];
  const blocks = (buyButtons?.blocks ?? {}) as Record<string, unknown>;
  return order.filter((id): id is string => typeof id === 'string' && id in blocks);
}

function headerBlockNode(
  detailsPrefix: string,
  blocksBase: string,
  itemOrder: Record<string, string[]>
): SidebarNode {
  const headerPrefix = `${detailsPrefix}:nested:header`;
  const headerChildren = reorderSidebarChildren(
    [
      { id: `${headerPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      ...PRODUCT_PAGE_HEADER_NESTED_ORDER.map((blockId) => ({
        id: `${headerPrefix}:nested:${blockId}`,
        label: BLOCK_LABELS[blockId] ?? blockId,
        kind: 'block' as const,
        icon: productPageBlockIcon(blockId),
      })),
    ],
    listKeyBlockChildren(headerPrefix),
    itemOrder
  );

  return {
    id: headerPrefix,
    label: 'Header',
    kind: 'block',
    icon: 'group',
    fields: featuredProductHeaderFieldDefs(`${blocksBase}.details.blocks.header`),
    children: headerChildren,
    childrenListKey: listKeyBlockChildren(headerPrefix),
  };
}

function buyButtonsBlockNode(
  detailsPrefix: string,
  blocksBase: string,
  nestedOrder: readonly string[],
  itemOrder: Record<string, string[]>
): SidebarNode {
  const buyButtonsPrefix = `${detailsPrefix}:nested:buy_buttons`;
  const nestedChildren = nestedOrder.map((blockId) => ({
    id: `${buyButtonsPrefix}:nested:${blockId}`,
    label: BLOCK_LABELS[blockId] ?? blockId,
    kind: 'block' as const,
    icon: productPageBlockIcon(blockId),
    showVisibilityToggle: true,
  }));

  return {
    id: buyButtonsPrefix,
    label: 'Buy buttons',
    kind: 'block',
    icon: 'button',
    fields: featuredProductBuyButtonsFieldDefs(`${blocksBase}.details.blocks.buy_buttons`),
    children: reorderSidebarChildren(
      nestedChildren,
      listKeyBlockChildren(buyButtonsPrefix),
      itemOrder
    ),
    childrenListKey: listKeyBlockChildren(buyButtonsPrefix),
  };
}

function detailsInnerBlockNode(
  detailsPrefix: string,
  blockId: string,
  blocksBase: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string,
  itemOrder: Record<string, string[]>
): SidebarNode {
  if (blockId === 'header') {
    return headerBlockNode(detailsPrefix, blocksBase, itemOrder);
  }
  if (blockId === 'buy_buttons') {
    const nestedOrder =
      readBuyButtonsNestedBlockOrder(config, tplId, secId) ||
      [...PRODUCT_PAGE_BUY_BUTTONS_NESTED_ORDER];
    return buyButtonsBlockNode(detailsPrefix, blocksBase, nestedOrder, itemOrder);
  }
  return {
    id: `${detailsPrefix}:nested:${blockId}`,
    label: BLOCK_LABELS[blockId] ?? blockId,
    kind: 'block',
    icon: productPageBlockIcon(blockId),
  };
}

function detailsBlockNode(
  prefix: string,
  blocksBase: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string,
  itemOrder: Record<string, string[]>
): SidebarNode {
  const detailsPrefix = `${prefix}:block:details`;
  const detailsBlockOrder =
    readDetailsBlockOrder(config, tplId, secId) || [...PRODUCT_PAGE_DETAILS_BLOCK_ORDER];

  const detailBlocks = detailsBlockOrder.map((blockId) =>
    detailsInnerBlockNode(detailsPrefix, blockId, blocksBase, config, tplId, secId, itemOrder)
  );

  const childrenListKey = listKeyBlockChildren(detailsPrefix);
  const children = reorderSidebarChildren(
    [
      { id: `${detailsPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      ...detailBlocks,
      { id: `${detailsPrefix}:add-block`, label: 'Add block', kind: 'add-block' },
    ],
    childrenListKey,
    itemOrder
  );

  return {
    id: detailsPrefix,
    label: 'Details',
    kind: 'block',
    icon: 'default',
    fields: featuredProductDetailsFieldDefs(`${blocksBase}.details`),
    children,
    childrenListKey,
  };
}

function productMediaBlockNode(prefix: string, blocksBase: string): SidebarNode {
  return {
    id: `${prefix}:block:product_media`,
    label: 'Product media',
    kind: 'block',
    icon: 'image',
    fields: featuredProductMediaFieldDefs(`${blocksBase}.product_media`),
  };
}

/** Product information sidebar: Product media → Details → Disclosures. */
export function mapProductPageBlockNodes(
  prefix: string,
  blocksBase: string,
  _values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): SidebarNode[] {
  const blockOrder =
    readSectionBlockOrder(config, tplId, secId) || [...PRODUCT_PAGE_SECTION_BLOCK_ORDER];

  const blockNodes: SidebarNode[] = blockOrder.map((blockId) => {
    if (blockId === 'product_media') return productMediaBlockNode(prefix, blocksBase);
    if (blockId === 'details') {
      return detailsBlockNode(prefix, blocksBase, config, tplId, secId, itemOrder);
    }
    return {
      id: `${prefix}:block:${blockId}`,
      label: BLOCK_LABELS[blockId] ?? blockId,
      kind: 'block' as const,
      icon: productPageBlockIcon(blockId),
    };
  });

  return reorderSidebarChildren(blockNodes, sectionChildrenListKey, itemOrder);
}

export function productPageStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): Record<string, string[]> {
  const sectionBlockOrder =
    readSectionBlockOrder(config, tplId, secId) || [...PRODUCT_PAGE_SECTION_BLOCK_ORDER];
  const detailsPrefix = `${prefix}:block:details`;
  const detailsBlockOrder =
    readDetailsBlockOrder(config, tplId, secId) || [...PRODUCT_PAGE_DETAILS_BLOCK_ORDER];

  const out: Record<string, string[]> = {
    [sectionChildrenListKey]: sectionBlockOrder.map((id) => `${prefix}:block:${id}`),
    [listKeyBlockChildren(detailsPrefix)]: [
      `${detailsPrefix}:inner-add-block`,
      ...detailsBlockOrder.map((id) => `${detailsPrefix}:nested:${id}`),
      `${detailsPrefix}:add-block`,
    ],
  };

  const headerPrefix = `${detailsPrefix}:nested:header`;
  out[listKeyBlockChildren(headerPrefix)] = [
    `${headerPrefix}:inner-add-block`,
    ...PRODUCT_PAGE_HEADER_NESTED_ORDER.map((id) => `${headerPrefix}:nested:${id}`),
  ];

  const buyButtonsPrefix = `${detailsPrefix}:nested:buy_buttons`;
  const buyButtonsNestedOrder =
    readBuyButtonsNestedBlockOrder(config, tplId, secId) ||
    [...PRODUCT_PAGE_BUY_BUTTONS_NESTED_ORDER];
  out[listKeyBlockChildren(buyButtonsPrefix)] = buyButtonsNestedOrder.map(
    (id) => `${buyButtonsPrefix}:nested:${id}`
  );

  return out;
}

export function isProductMainSectionType(secType: string | undefined): boolean {
  return secType === 'product-main';
}
