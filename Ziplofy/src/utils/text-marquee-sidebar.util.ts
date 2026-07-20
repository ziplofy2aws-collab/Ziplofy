import type { SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import { marqueeTextBlockFieldDefs } from '../create-theme/sidebar/theme-editor-text-marquee-panel.utils';

export const TEXT_MARQUEE_SECTION_BLOCK_ORDER = ['text'] as const;

export type TextMarqueeBlockKind = (typeof TEXT_MARQUEE_SECTION_BLOCK_ORDER)[number];

const BLOCK_LABELS: Record<TextMarqueeBlockKind, string> = {
  text: 'Text',
};

function previewFromValues(
  values: Record<string, string | boolean>,
  path: string
): string | undefined {
  const raw = values[path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  const text = String(raw)
    .replace(/<[^>]*>/g, '')
    .trim();
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

function textMarqueeBlockNode(
  prefix: string,
  sectionBase: string,
  kind: TextMarqueeBlockKind,
  values: Record<string, string | boolean>
): SidebarNode {
  const preview = previewFromValues(values, `${sectionBase}.settings.text`);
  return {
    id: `${prefix}:block:${kind}`,
    label: BLOCK_LABELS[kind],
    kind: 'block',
    icon: 'text' as SidebarIcon,
    fields: marqueeTextBlockFieldDefs(sectionBase),
    preview,
    showVisibilityToggle: false,
    showDeleteButton: false,
  };
}

/** Shopify Marquee sidebar: Add block → Text (settings-backed). */
export function mapTextMarqueeBlockNodes(
  prefix: string,
  sectionBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const blockNodes = TEXT_MARQUEE_SECTION_BLOCK_ORDER.map((kind) =>
    textMarqueeBlockNode(prefix, sectionBase, kind, values)
  );
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], sectionChildrenListKey, itemOrder);
}

export function textMarqueeStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...TEXT_MARQUEE_SECTION_BLOCK_ORDER.map((kind) => `${prefix}:block:${kind}`),
    ],
  };
}

export function textMarqueeLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return textMarqueeStructureOrder(prefix, sectionChildrenListKey);
}

export function isTextMarqueeTextBlockNodeId(nodeId: string): boolean {
  return /(?:^|:)text_marquee[^:]*:block:text$/.test(nodeId);
}

export function prepareTextMarqueeTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  return { ...node, label: 'Text', kind: 'block' };
}
