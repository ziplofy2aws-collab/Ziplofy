import type { EditorFieldDef, SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import { iconWithTextBlockFieldDefs } from '../create-theme/sidebar/theme-editor-icons-with-text-panel.utils';

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

/** Sidebar block rows from config `block_order` (icon_1, icon_2, …). */
export function mapIconsWithTextBlockNodes(
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
    const headingPath = `${blocksBase}.blocks.${blockId}.settings.heading`;
    const preview = previewFromValues(values, headingPath);
    return {
      id: `${prefix}:block:${blockId}`,
      label: preview ?? 'Icon with text',
      kind: 'block' as const,
      icon: blockIcon(),
      fields: iconWithTextBlockFieldDefs(blocksBase, blockId),
      preview,
      showVisibilityToggle: true,
      showDeleteButton: true,
    };
  });

  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([...blockNodes, addBlock], sectionChildrenListKey, itemOrder);
}

export function iconsWithTextStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): Record<string, string[]> {
  const blockOrder = readTemplateBlockOrder(config, tplId, secId);
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...blockOrder.map((id) => `${prefix}:block:${id}`),
    ],
  };
}

export function iconsWithTextLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  secId: string
): Record<string, string[]> {
  const blockOrder = readLayoutBlockOrder(config, secId);
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...blockOrder.map((id) => `${prefix}:block:${id}`),
    ],
  };
}
