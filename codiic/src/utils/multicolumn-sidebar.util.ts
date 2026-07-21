import type { EditorFieldDef, SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import {
  multicolumnBlockFieldDefs,
  multicolumnColumnBlockFieldDefs,
  multicolumnHeadingBlockFieldDefs,
  multicolumnDescriptionBlockFieldDefs,
} from '../create-theme/sidebar/theme-editor-multicolumn-panel.utils';

/** Mirror of create-theme-structure-order.listKeyBlockChildren (inlined to avoid a circular import). */
function listKeyBlockChildren(blockPrefix: string): string {
  return `fields:${blockPrefix}`;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function previewFromValues(
  values: Record<string, string | boolean>,
  path: string
): string | undefined {
  const raw = values[path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 24 ? `${text.slice(0, 24)}…` : text;
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

function readTemplateBlockOrder(
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

function readLayoutBlockOrder(
  config: Record<string, unknown> | null,
  secId: string
): string[] {
  if (!config) return [];
  const order = getNested(config, ['sections', secId, 'block_order']);
  if (!Array.isArray(order)) return [];
  const blocks = getNested(config, ['sections', secId, 'blocks']) as
    | Record<string, unknown>
    | undefined;
  return order.filter((id): id is string => typeof id === 'string' && Boolean(blocks?.[id]));
}

function blockIcon(): SidebarIcon {
  return 'text';
}

/** Sidebar block rows from config `block_order` (column_1, column_2, …). */
export function mapMulticolumnBlockNodes(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string
): SidebarNode[] {
  const blockOrder =
    tplId != null
      ? readTemplateBlockOrder(config, tplId, secId)
      : readLayoutBlockOrder(config, secId);

  const blockNodes: SidebarNode[] = blockOrder.map((blockId) => {
    const blockPrefix = `${prefix}:block:${blockId}`;
    const headingPath = `${blocksBase}.blocks.${blockId}.settings.heading`;
    const textPath = `${blocksBase}.blocks.${blockId}.settings.text`;
    const contentDefs = multicolumnBlockFieldDefs(blocksBase, blockId);
    const columnDefs = multicolumnColumnBlockFieldDefs(blocksBase, blockId);
    const headingDefs = multicolumnHeadingBlockFieldDefs(blocksBase, blockId);
    const descriptionDefs = multicolumnDescriptionBlockFieldDefs(blocksBase, blockId);
    const textDef = contentDefs.find((f) => f.path.endsWith('.text'));
    const headingPreview = previewFromValues(values, headingPath);
    const textPreview = previewFromValues(values, textPath);

    const nestedNodes: SidebarNode[] = [];
    if (headingDefs.length) {
      const headingNodeId = `${blockPrefix}:nested:heading`;
      nestedNodes.push({
        id: headingNodeId,
        label: 'Heading',
        kind: 'block' as const,
        icon: blockIcon(),
        fields: headingDefs,
        preview: headingPreview,
        childrenListKey: listKeyBlockChildren(headingNodeId),
      });
    }
    if (textDef) {
      const textNodeId = `${blockPrefix}:nested:text`;
      nestedNodes.push({
        id: textNodeId,
        label: 'Description',
        kind: 'block' as const,
        icon: blockIcon(),
        fields: descriptionDefs.length ? descriptionDefs : [textDef],
        preview: textPreview,
        childrenListKey: listKeyBlockChildren(textNodeId),
      });
    }

    const innerAddBlock: SidebarNode = {
      id: `${blockPrefix}:inner-add-block`,
      label: 'Add block',
      kind: 'add-block' as const,
    };
    const childrenListKey = listKeyBlockChildren(blockPrefix);
    const children = reorderSidebarChildren(
      [innerAddBlock, ...nestedNodes],
      childrenListKey,
      itemOrder
    );

    return {
      id: blockPrefix,
      label: 'Column',
      kind: 'block' as const,
      icon: 'group' as SidebarIcon,
      fields: columnDefs,
      showVisibilityToggle: true,
      showDeleteButton: true,
      children,
      childrenListKey,
    };
  });

  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([...blockNodes, addBlock], sectionChildrenListKey, itemOrder);
}

export function multicolumnStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): Record<string, string[]> {
  const blockOrder = readTemplateBlockOrder(config, tplId, secId);
  return {
    [sectionChildrenListKey]: [
      ...blockOrder.map((id) => `${prefix}:block:${id}`),
      `${prefix}:add-block`,
    ],
  };
}

export function multicolumnLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  secId: string
): Record<string, string[]> {
  const blockOrder = readLayoutBlockOrder(config, secId);
  return {
    [sectionChildrenListKey]: [
      ...blockOrder.map((id) => `${prefix}:block:${id}`),
      `${prefix}:add-block`,
    ],
  };
}
