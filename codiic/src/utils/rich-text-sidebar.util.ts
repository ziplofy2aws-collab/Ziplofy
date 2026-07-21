import { getThemeConfigValue } from '@render-store/sdk';
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

export function isRichTextContentBlockKind(id: string): id is RichTextBlockKind {
  return id === 'heading' || id === 'text' || id === 'button';
}

/** Active content blocks for a Rich text section (settings-backed virtual blocks). */
export function readRichTextContentBlocks(
  config: Record<string, unknown> | null | undefined,
  sectionBase: string
): RichTextBlockKind[] {
  const raw = getThemeConfigValue(config ?? null, `${sectionBase}.settings.contentBlocks`);
  if (Array.isArray(raw)) {
    const kinds = raw
      .map((x) => String(x))
      .filter(isRichTextContentBlockKind);
    // Preserve declared order; fall back to canonical order for unknowns already filtered.
    const seen = new Set<RichTextBlockKind>();
    const ordered: RichTextBlockKind[] = [];
    for (const kind of kinds) {
      if (seen.has(kind)) continue;
      seen.add(kind);
      ordered.push(kind);
    }
    return ordered;
  }
  // Missing key → all blocks present (backward compatible).
  return [...RICH_TEXT_SECTION_BLOCK_ORDER];
}

export function richTextParentSectionNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^(layout:[^:]+|template:[^:]+:[^:]+):block:(?:heading|text|button)$/);
  return m?.[1] ?? null;
}

/** Mutate section.settings.contentBlocks to remove a virtual block. Returns false if nothing changed. */
export function removeRichTextContentBlockFromSection(
  section: Record<string, unknown>,
  kind: RichTextBlockKind
): boolean {
  const settings = ((section.settings as Record<string, unknown> | undefined) ?? {}) as Record<
    string,
    unknown
  >;
  const current = Array.isArray(settings.contentBlocks)
    ? (settings.contentBlocks as unknown[])
        .map((x) => String(x))
        .filter(isRichTextContentBlockKind)
    : [...RICH_TEXT_SECTION_BLOCK_ORDER];
  if (!current.includes(kind)) {
    section.settings = settings;
    return false;
  }
  settings.contentBlocks = current.filter((k) => k !== kind);
  // Clear primary content so a re-added block starts fresh.
  if (kind === 'heading') settings.heading = '';
  if (kind === 'text') settings.text = '';
  if (kind === 'button') {
    settings.buttonLabel = '';
    settings.buttonUrl = settings.buttonUrl ?? '/collections';
  }
  section.settings = settings;
  return true;
}

/** Mutate section.settings.contentBlocks to add a virtual block. Returns false if already present / invalid. */
export function addRichTextContentBlockToSection(
  section: Record<string, unknown>,
  catalogBlockId: string
): { blockInstanceId: RichTextBlockKind } | null {
  const kind = isRichTextContentBlockKind(catalogBlockId) ? catalogBlockId : null;
  if (!kind) return null;
  const settings = ((section.settings as Record<string, unknown> | undefined) ?? {}) as Record<
    string,
    unknown
  >;
  const current = Array.isArray(settings.contentBlocks)
    ? (settings.contentBlocks as unknown[])
        .map((x) => String(x))
        .filter(isRichTextContentBlockKind)
    : [...RICH_TEXT_SECTION_BLOCK_ORDER];
  if (current.includes(kind)) return null;
  // Insert in canonical order relative to remaining blocks.
  const next = RICH_TEXT_SECTION_BLOCK_ORDER.filter((k) => current.includes(k) || k === kind);
  settings.contentBlocks = next;
  if (kind === 'heading' && !String(settings.heading ?? '').trim()) {
    settings.heading = 'New arrivals';
  }
  if (kind === 'text' && !String(settings.text ?? '').trim()) {
    settings.text =
      'We make things that work better and last longer. Our products solve real problems with clean design and honest materials.';
  }
  if (kind === 'button' && !String(settings.buttonLabel ?? '').trim()) {
    settings.buttonLabel = 'Shop now';
    settings.buttonUrl = settings.buttonUrl || '/collections';
  }
  section.settings = settings;
  return { blockInstanceId: kind };
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
    showDeleteButton: true,
  };
}

/** Shopify Rich text sidebar: Add block → Heading → Text → Button (settings-backed). */
export function mapRichTextBlockNodes(
  prefix: string,
  sectionBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config?: Record<string, unknown> | null
): SidebarNode[] {
  const kinds = readRichTextContentBlocks(config ?? null, sectionBase);
  const blockNodes = kinds.map((kind) => richTextBlockNode(prefix, sectionBase, kind, values));
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], sectionChildrenListKey, itemOrder);
}

export function richTextStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config?: Record<string, unknown> | null,
  sectionBase?: string
): Record<string, string[]> {
  const kinds = sectionBase
    ? readRichTextContentBlocks(config ?? null, sectionBase)
    : [...RICH_TEXT_SECTION_BLOCK_ORDER];
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...kinds.map((kind) => `${prefix}:block:${kind}`),
    ],
  };
}

export function richTextLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config?: Record<string, unknown> | null,
  layoutKey?: string
): Record<string, string[]> {
  const sectionBase = layoutKey ? `sections.${layoutKey}` : undefined;
  return richTextStructureOrder(prefix, sectionChildrenListKey, config, sectionBase);
}

/** Seed sidebar values after re-adding a rich-text content block. */
export function extendValuesForRichTextContentBlock(
  values: Record<string, string | boolean>,
  sectionBase: string,
  kind: RichTextBlockKind,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const next = { ...values };
  const s = `${sectionBase}.settings`;
  const settings =
    (getThemeConfigValue(config, `${sectionBase}.settings`) as Record<string, unknown> | null) ?? {};
  if (kind === 'heading') {
    next[`${s}.heading`] = String(settings.heading ?? 'New arrivals');
  } else if (kind === 'text') {
    next[`${s}.text`] = String(
      settings.text ??
        'We make things that work better and last longer. Our products solve real problems with clean design and honest materials.'
    );
  } else if (kind === 'button') {
    next[`${s}.buttonLabel`] = String(settings.buttonLabel ?? 'Shop now');
    next[`${s}.buttonUrl`] = String(settings.buttonUrl ?? '/collections');
  }
  return next;
}

/** Prune sidebar form values for a removed rich-text content block. */
export function pruneValuesForRichTextContentBlock(
  values: Record<string, string | boolean>,
  sectionBase: string,
  kind: RichTextBlockKind
): Record<string, string | boolean> {
  const next = { ...values };
  const s = `${sectionBase}.settings`;
  if (kind === 'heading') {
    delete next[`${s}.heading`];
  } else if (kind === 'text') {
    delete next[`${s}.text`];
  } else if (kind === 'button') {
    delete next[`${s}.buttonLabel`];
  }
  return next;
}
