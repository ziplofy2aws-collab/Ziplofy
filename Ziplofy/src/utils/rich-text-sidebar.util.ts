import type { EditorFieldDef, SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import { richTextBlockFieldDefs } from '../create-theme/sidebar/theme-editor-rich-text-panel.utils';

export const RICH_TEXT_SECTION_BLOCK_ORDER = ['heading', 'text', 'button'] as const;

export type RichTextBlockKind = (typeof RICH_TEXT_SECTION_BLOCK_ORDER)[number];

const BLOCK_LABELS: Record<RichTextBlockKind, string> = {
  heading: 'Heading',
  text: 'Text',
  button: 'Button',
};

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

function blockIcon(kind: RichTextBlockKind): SidebarIcon {
  return kind === 'button' ? 'button' : 'text';
}

function richTextBlockNode(
  prefix: string,
  sectionBase: string,
  kind: RichTextBlockKind,
  values: Record<string, string | boolean>
): SidebarNode {
  const settingsBase = `${sectionBase}.settings`;
  const previewPath =
    kind === 'heading'
      ? `${settingsBase}.heading`
      : kind === 'text'
        ? `${settingsBase}.text`
        : null;
  const preview = previewPath ? previewFromValues(values, previewPath) : undefined;

  return {
    id: `${prefix}:block:${kind}`,
    label: BLOCK_LABELS[kind],
    kind: 'block',
    icon: blockIcon(kind),
    fields: richTextBlockFieldDefs(sectionBase, kind),
    preview,
    showVisibilityToggle: false,
    showDeleteButton: false,
  };
}

/** Shopify Rich text sidebar: Add block → Heading → Text → Button (settings-backed). */
export function mapRichTextBlockNodes(
  prefix: string,
  sectionBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const blockNodes = RICH_TEXT_SECTION_BLOCK_ORDER.map((kind) =>
    richTextBlockNode(prefix, sectionBase, kind, values)
  );
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], sectionChildrenListKey, itemOrder);
}

export function richTextStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...RICH_TEXT_SECTION_BLOCK_ORDER.map((kind) => `${prefix}:block:${kind}`),
    ],
  };
}

export function richTextLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return richTextStructureOrder(prefix, sectionChildrenListKey);
}
