import type { SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import { faqAccordionFieldDefs } from '../create-theme/sidebar/theme-editor-faq-accordion-block-panel.utils';

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

export const FAQ_SECTION_BLOCK_ORDER = ['heading', 'accordion'] as const;

const BLOCK_LABELS: Record<string, string> = {
  heading: 'Heading',
  accordion: 'Accordion',
};

function faqBlockIcon(blockId: string): SidebarIcon {
  switch (blockId) {
    case 'heading':
      return 'text';
    case 'accordion':
      return 'group';
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

function readLayoutSectionBlockOrder(
  config: Record<string, unknown> | null,
  instanceId: string
): string[] {
  if (!config) return [];
  const order = getNested(config, ['sections', instanceId, 'block_order']);
  if (!Array.isArray(order)) return [];
  const blocks = getNested(config, ['sections', instanceId, 'blocks']) as
    | Record<string, unknown>
    | undefined;
  return order.filter((id): id is string => typeof id === 'string' && Boolean(blocks?.[id]));
}

function readAccordionRowOrder(
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string
): string[] {
  if (!config) return [];
  const base =
    tplId != null
      ? ['templates', tplId, 'sections', secId, 'blocks', 'accordion']
      : ['sections', secId, 'blocks', 'accordion'];
  const accordion = getNested(config, base) as Record<string, unknown> | undefined;
  const order = accordion?.block_order;
  if (!Array.isArray(order)) return [];
  const blocks = (accordion?.blocks ?? {}) as Record<string, unknown>;
  return order.filter((id): id is string => typeof id === 'string' && id in blocks);
}

function readAccordionRowChildBlockOrder(
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string,
  rowId: string
): string[] {
  if (!config) return [];
  const base =
    tplId != null
      ? ['templates', tplId, 'sections', secId, 'blocks', 'accordion', 'blocks', rowId]
      : ['sections', secId, 'blocks', 'accordion', 'blocks', rowId];
  const row = getNested(config, base) as Record<string, unknown> | undefined;
  const order = row?.block_order;
  if (!Array.isArray(order)) return [];
  const blocks = (row?.blocks ?? {}) as Record<string, unknown>;
  return order.filter((id): id is string => typeof id === 'string' && id in blocks);
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

function accordionRowNode(
  accordionPrefix: string,
  blocksBase: string,
  rowId: string,
  values: Record<string, string | boolean>,
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string,
  itemOrder: Record<string, string[]>
): SidebarNode {
  const rowPrefix = `${accordionPrefix}:nested:${rowId}`;
  const headingPath = `${blocksBase}.accordion.blocks.${rowId}.settings.heading`;
  const legacyQuestionPath = `${blocksBase}.accordion.blocks.${rowId}.settings.question`;
  const preview =
    previewFromValues(values, headingPath) ?? previewFromValues(values, legacyQuestionPath);

  const childOrder = readAccordionRowChildBlockOrder(config, tplId, secId, rowId);
  const innerAddBlockId = `${rowPrefix}:inner-add-block`;
  const addBlockRow: SidebarNode = { id: innerAddBlockId, label: 'Add block', kind: 'add-block' };

  const childNodes: SidebarNode[] = childOrder.map((childId) => {
    const textPath = `${blocksBase}.accordion.blocks.${rowId}.blocks.${childId}.settings.text`;
    return {
      id: `${rowPrefix}:nested:${childId}`,
      label: 'Text',
      kind: 'block' as const,
      icon: 'text' as const,
      preview: previewFromValues(values, textPath),
      showVisibilityToggle: true,
      showDeleteButton: true,
    };
  });

  const childrenListKey = listKeyBlockChildren(rowPrefix);
  const children = reorderSidebarChildren([addBlockRow, ...childNodes], childrenListKey, itemOrder);

  return {
    id: rowPrefix,
    label: 'Accordion row',
    kind: 'block',
    icon: 'section',
    preview,
    showVisibilityToggle: true,
    showDeleteButton: true,
    children,
    childrenListKey,
  };
}

function accordionBlockNode(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string,
  itemOrder: Record<string, string[]>
): SidebarNode {
  const accordionPrefix = `${prefix}:block:accordion`;
  const rowOrder = readAccordionRowOrder(config, tplId, secId);
  const innerAddBlockId = `${accordionPrefix}:inner-add-block`;
  const addBlockRow: SidebarNode = { id: innerAddBlockId, label: 'Add block', kind: 'add-block' };

  const rowNodes: SidebarNode[] = rowOrder.map((rowId) =>
    accordionRowNode(
      accordionPrefix,
      blocksBase,
      rowId,
      values,
      config,
      tplId,
      secId,
      itemOrder
    )
  );

  const childrenListKey = listKeyBlockChildren(accordionPrefix);
  const children = reorderSidebarChildren([addBlockRow, ...rowNodes], childrenListKey, itemOrder);

  return {
    id: accordionPrefix,
    label: 'Accordion',
    kind: 'block',
    icon: 'group',
    fields: faqAccordionFieldDefs(`${blocksBase}.accordion`),
    showVisibilityToggle: true,
    showDeleteButton: true,
    children,
    childrenListKey,
  };
}

function headingBlockNode(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>
): SidebarNode {
  const titlePath = `${blocksBase.replace(/\.blocks$/, '.settings')}.title`;
  return {
    id: `${prefix}:block:heading`,
    label: 'Heading',
    kind: 'block',
    icon: 'text',
    fields: [],
    preview: previewFromValues(values, titlePath),
    showVisibilityToggle: true,
    showDeleteButton: true,
  };
}

/** Shopify FAQ sidebar: Add block → Heading → Accordion (rows → text blocks). */
export function mapFaqBlockNodes(
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
      ? readSectionBlockOrder(config, tplId, secId) || [...FAQ_SECTION_BLOCK_ORDER]
      : readLayoutSectionBlockOrder(config, secId) || [...FAQ_SECTION_BLOCK_ORDER];

  const blockNodes: SidebarNode[] = blockOrder
    .map((blockId) => {
      if (blockId === 'heading') return headingBlockNode(prefix, blocksBase, values);
      if (blockId === 'accordion') {
        return accordionBlockNode(prefix, blocksBase, values, config, tplId, secId, itemOrder);
      }
      return {
        id: `${prefix}:block:${blockId}`,
        label: BLOCK_LABELS[blockId] ?? blockId,
        kind: 'block' as const,
        icon: faqBlockIcon(blockId),
        showVisibilityToggle: true,
        showDeleteButton: true,
      };
    })
    .filter(Boolean) as SidebarNode[];

  return reorderSidebarChildren(blockNodes, sectionChildrenListKey, itemOrder);
}

function rowChildrenStructureOrder(
  accordionPrefix: string,
  config: Record<string, unknown> | null,
  tplId: string | null,
  secId: string,
  rowOrder: string[]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const rowId of rowOrder) {
    const rowPrefix = `${accordionPrefix}:nested:${rowId}`;
    const childOrder = readAccordionRowChildBlockOrder(config, tplId, secId, rowId);
    out[listKeyBlockChildren(rowPrefix)] = [
      `${rowPrefix}:inner-add-block`,
      ...childOrder.map((id) => `${rowPrefix}:nested:${id}`),
    ];
  }
  return out;
}

export function faqStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  tplId: string,
  secId: string
): Record<string, string[]> {
  const sectionBlockOrder =
    readSectionBlockOrder(config, tplId, secId) || [...FAQ_SECTION_BLOCK_ORDER];
  const accordionPrefix = `${prefix}:block:accordion`;
  const rowOrder = readAccordionRowOrder(config, tplId, secId);

  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...sectionBlockOrder.map((id) => `${prefix}:block:${id}`),
    ],
    [listKeyBlockChildren(accordionPrefix)]: [
      `${accordionPrefix}:inner-add-block`,
      ...rowOrder.map((id) => `${accordionPrefix}:nested:${id}`),
    ],
    ...rowChildrenStructureOrder(accordionPrefix, config, tplId, secId, rowOrder),
  };
}

export function faqLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  instanceId: string
): Record<string, string[]> {
  const sectionBlockOrder =
    readLayoutSectionBlockOrder(config, instanceId) || [...FAQ_SECTION_BLOCK_ORDER];
  const accordionPrefix = `${prefix}:block:accordion`;
  const rowOrder = readAccordionRowOrder(config, null, instanceId);

  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...sectionBlockOrder.map((id) => `${prefix}:block:${id}`),
    ],
    [listKeyBlockChildren(accordionPrefix)]: [
      `${accordionPrefix}:inner-add-block`,
      ...rowOrder.map((id) => `${accordionPrefix}:nested:${id}`),
    ],
    ...rowChildrenStructureOrder(accordionPrefix, config, null, instanceId, rowOrder),
  };
}
