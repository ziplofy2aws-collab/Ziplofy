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

function resolveOrder(order: string[], fallback: readonly string[]): string[] {
  return order.length > 0 ? order : [...fallback];
}

function sectionBlocksBasePath(tplId: string | null, secId: string): string[] {
  return tplId != null
    ? ['templates', tplId, 'sections', secId]
    : ['sections', secId];
}

function readSectionBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string
): string[] {
  if (!config) return [];
  const sectionBase = sectionBlocksBasePath(tplId, secId);
  const order = getNested(config, [...sectionBase, 'block_order']);
  if (!Array.isArray(order)) return [];
  const blocks = getNested(config, [...sectionBase, 'blocks']) as Record<string, unknown> | undefined;
  return order.filter((id): id is string => typeof id === 'string' && Boolean(blocks?.[id]));
}

function readProductNestedBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string
): string[] {
  if (!config) return [];
  const product = getNested(config, [...sectionBlocksBasePath(tplId, secId), 'blocks', 'product']) as
    | Record<string, unknown>
    | undefined;
  const order = product?.block_order;
  if (!Array.isArray(order)) return [];
  const blocks = (product?.blocks ?? {}) as Record<string, unknown>;
  return order.filter((id): id is string => typeof id === 'string' && id in blocks);
}

function canonicalSectionBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string
): string[] {
  const configured = readSectionBlockOrder(config, tplId, secId);
  const canonical = configured.filter(
    (id): id is (typeof PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER)[number] =>
      (PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER as readonly string[]).includes(id)
  );
  return resolveOrder(canonical, PRODUCT_HIGHLIGHT_SECTION_BLOCK_ORDER);
}

function canonicalProductNestedBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string
): string[] {
  const configured = readProductNestedBlockOrder(config, tplId, secId);
  const canonical = configured.filter(
    (id): id is (typeof PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER)[number] =>
      (PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER as readonly string[]).includes(id)
  );
  return resolveOrder(canonical, PRODUCT_HIGHLIGHT_PRODUCT_NESTED_ORDER);
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
  tplId: string | null,
  secId: string,
  itemOrder: Record<string, string[]>
): SidebarNode {
  const productPrefix = `${prefix}:block:product`;
  const nestedOrder = canonicalProductNestedBlockOrder(config, tplId, secId);

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
  tplId: string | null,
  secId: string
): SidebarNode[] {
  const blockOrder = canonicalSectionBlockOrder(config, tplId, secId);

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
  tplId: string | null,
  secId: string
): Record<string, string[]> {
  const sectionBlockOrder = canonicalSectionBlockOrder(config, tplId, secId);
  const productPrefix = `${prefix}:block:product`;
  const nestedOrder = canonicalProductNestedBlockOrder(config, tplId, secId);

  return {
    [sectionChildrenListKey]: sectionBlockOrder.map((id) => `${prefix}:block:${id}`),
    [listKeyBlockChildren(productPrefix)]: nestedOrder.map(
      (id) => `${productPrefix}:nested:${id}`
    ),
  };
}
