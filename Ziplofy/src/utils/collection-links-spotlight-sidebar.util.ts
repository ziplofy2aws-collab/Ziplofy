import type { EditorFieldDef, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';

function listKeyBlockChildren(blockPrefix: string): string {
  return `fields:${blockPrefix}`;
}

function reorderSidebarChildren(
  children: SidebarNode[],
  listKey: string,
  itemOrder: Record<string, string[]>
): SidebarNode[] {
  const order = itemOrder[listKey];
  if (!order?.length) return children;
  const byId = new Map(children.map((c) => [c.id, c]));
  const out: SidebarNode[] = [];
  for (const id of order) {
    const node = byId.get(id);
    if (node) out.push(node);
  }
  for (const c of children) {
    if (!order.includes(c.id)) out.push(c);
  }
  return out;
}

export type CollectionLinkBlockPaths = {
  title: string;
  imageUrl: string;
};

export function collectionLinkBlockPaths(blocksBase: string, blockId: string): CollectionLinkBlockPaths {
  return {
    title: `${blocksBase}.${blockId}.settings.title`,
    imageUrl: `${blocksBase}.${blockId}.settings.imageUrl`,
  };
}

function fieldPreview(
  field: EditorFieldDef,
  values: Record<string, string | boolean>
): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (field.type === 'boolean') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function readTemplateBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): string[] {
  if (!config) return [];
  let cur: unknown = config;
  for (const part of ['templates', tplId, 'sections', secId, 'block_order']) {
    if (cur == null || typeof cur !== 'object') return [];
    cur = (cur as Record<string, unknown>)[part];
  }
  if (!Array.isArray(cur)) return [];
  const order = cur.filter((id): id is string => typeof id === 'string' && id.length > 0);

  let blocksCur: unknown = config;
  for (const part of ['templates', tplId, 'sections', secId, 'blocks']) {
    if (blocksCur == null || typeof blocksCur !== 'object') return order;
    blocksCur = (blocksCur as Record<string, unknown>)[part];
  }
  const blocks = (blocksCur ?? {}) as Record<string, unknown>;
  return order.filter((id) => id in blocks);
}

/** Shopify Collection links: Spotlight — Collection → Title / Image per link block. */
export function mapCollectionLinksSpotlightBlockNodes(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string,
  _catalogVariant: string
): SidebarNode[] {
  const blockOrder = readTemplateBlockOrder(config, tplId, secId);

  const blockNodes: SidebarNode[] = blockOrder.map((blockId) => {
    const blockPrefix = `${prefix}:block:${blockId}`;
    const paths = collectionLinkBlockPaths(blocksBase, blockId);

    const titleField: EditorFieldDef = {
      path: paths.title,
      type: 'text',
      label: 'Title',
    };
    const imageField: EditorFieldDef = {
      path: paths.imageUrl,
      type: 'text',
      label: 'Image',
      widget: 'image',
    };

    const childNodes: SidebarNode[] = [
      {
        id: `field:${paths.title}`,
        label: 'Title',
        kind: 'field',
        icon: 'title',
        fields: [titleField],
        preview: fieldPreview(titleField, values),
      },
      {
        id: `field:${paths.imageUrl}`,
        label: 'Image',
        kind: 'field',
        icon: 'image',
        fields: [imageField],
        preview: fieldPreview(imageField, values),
      },
    ];

    return {
      id: blockPrefix,
      label: 'Collection',
      kind: 'block',
      icon: 'product-card',
      showVisibilityToggle: true,
      showDeleteButton: true,
      children: reorderSidebarChildren(childNodes, listKeyBlockChildren(blockPrefix), itemOrder),
      childrenListKey: listKeyBlockChildren(blockPrefix),
    };
  });

  return reorderSidebarChildren(blockNodes, sectionChildrenListKey, itemOrder);
}
