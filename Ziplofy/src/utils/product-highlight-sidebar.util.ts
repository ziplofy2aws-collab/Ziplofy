import type { SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../create-theme/sidebar/create-theme-structure-order';
import { productHighlightMediaFieldDefs } from '../create-theme/sidebar/theme-editor-product-highlight-media-block-panel.utils';
import {
  productHighlightProductBlockFieldDefsFromNodeId,
  productHighlightProductImageFieldDefs,
  productHighlightProductPriceFieldDefs,
  productHighlightProductSwatchesFieldDefs,
  productHighlightProductTitleFieldDefs,
} from '../create-theme/sidebar/theme-editor-product-highlight-product-block-panel.utils';

export const PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER = ['product_media', 'product'] as const;

export const PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER = [
  'title',
  'price',
  'image',
  'swatches',
] as const;

const BLOCK_LABELS: Record<string, string> = {
  product_media: 'Product media',
  product: 'Product',
  title: 'Title',
  price: 'Price',
  image: 'Image',
  swatches: 'Swatches',
};

function productHighlightBlockIcon(blockId: string): SidebarIcon {
  switch (blockId) {
    case 'product_media':
    case 'image':
      return 'image';
    case 'product':
    case 'price':
      return 'price';
    case 'title':
      return 'title';
    case 'swatches':
      return 'product-card';
    default:
      return 'default';
  }
}

function getNested(
  obj: Record<string, unknown> | null | undefined,
  path: string[]
): unknown {
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

function readProductNestedBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): string[] {
  if (!config) return [];
  const product = getNested(config, [
    'templates',
    tplId,
    'sections',
    secId,
    'blocks',
    'product',
  ]) as Record<string, unknown> | undefined;
  const order = product?.block_order;
  if (!Array.isArray(order)) return [];
  const blocks = (product?.blocks ?? {}) as Record<string, unknown>;
  return order.filter((id): id is string => typeof id === 'string' && id in blocks);
}

function productMediaBlockNode(prefix: string, blocksBase: string): SidebarNode {
  return {
    id: `${prefix}:block:product_media`,
    label: 'Product media',
    kind: 'block',
    icon: 'image',
    fields: productHighlightMediaFieldDefs(`${blocksBase}.product_media`),
  };
}

function productGroupBlockNode(
  prefix: string,
  blocksBase: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string,
  itemOrder: Record<string, string[]>
): SidebarNode {
  const productPrefix = `${prefix}:block:product`;
  const nestedOrder =
    readProductNestedBlockOrder(config, tplId, secId) || [...PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER];

  const nestedChildren = nestedOrder.map((blockId) => {
    const nodeId = `${productPrefix}:nested:${blockId}`;
    const fieldsBase = `${blocksBase}.product.blocks.${blockId}`;
    const fields =
      blockId === 'title'
        ? productHighlightProductTitleFieldDefs(fieldsBase)
        : blockId === 'price'
          ? productHighlightProductPriceFieldDefs(fieldsBase)
          : blockId === 'image'
            ? productHighlightProductImageFieldDefs(fieldsBase)
            : blockId === 'swatches'
              ? productHighlightProductSwatchesFieldDefs(fieldsBase)
              : productHighlightProductBlockFieldDefsFromNodeId(nodeId);
    return {
      id: nodeId,
      label: BLOCK_LABELS[blockId] ?? blockId,
      kind: 'block' as const,
      icon: productHighlightBlockIcon(blockId),
      fields,
      showVisibilityToggle: blockId === 'swatches',
    };
  });

  const childrenListKey = listKeyBlockChildren(productPrefix);
  const children = reorderSidebarChildren(nestedChildren, childrenListKey, itemOrder);

  return {
    id: productPrefix,
    label: 'Product',
    kind: 'block',
    icon: 'price',
    children,
    childrenListKey,
  };
}

/** Shopify Product highlight sidebar: Product media → Product (Title, Price, Image, Swatches). */
export function mapProductHighlightBlockNodes(
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
    readSectionBlockOrder(config, tplId, secId) || [...PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER];

  const blockNodes: SidebarNode[] = blockOrder.map((blockId) => {
    if (blockId === 'product_media') return productMediaBlockNode(prefix, blocksBase);
    if (blockId === 'product') {
      return productGroupBlockNode(prefix, blocksBase, config, tplId, secId, itemOrder);
    }
    return {
      id: `${prefix}:block:${blockId}`,
      label: BLOCK_LABELS[blockId] ?? blockId,
      kind: 'block' as const,
      icon: productHighlightBlockIcon(blockId),
    };
  });

  return reorderSidebarChildren(blockNodes, sectionChildrenListKey, itemOrder);
}

export function productHighlightStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): Record<string, string[]> {
  const sectionBlockOrder =
    readSectionBlockOrder(config, tplId, secId) || [...PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER];
  const productPrefix = `${prefix}:block:product`;
  const nestedOrder =
    readProductNestedBlockOrder(config, tplId, secId) || [...PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER];

  return {
    [sectionChildrenListKey]: sectionBlockOrder.map((id) => `${prefix}:block:${id}`),
    [listKeyBlockChildren(productPrefix)]: nestedOrder.map(
      (id) => `${productPrefix}:nested:${id}`
    ),
  };
}
