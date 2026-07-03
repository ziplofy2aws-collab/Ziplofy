import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

const PANEL_GROUPS = new Set(['General', 'Borders', 'Padding']);

export const PRODUCT_CARD_MEDIA_PANEL_GROUP_ORDER = ['General', 'Borders', 'Padding'] as const;

const MEDIA_PANEL_KEYS = new Set([
  'mediaAspectRatio',
  'mediaBorderStyle',
  'mediaCornerRadius',
  'mediaPaddingTop',
  'mediaPaddingBottom',
  'mediaPaddingLeft',
  'mediaPaddingRight',
]);

export function isProductCardMediaNestedNodeId(nodeId: string): boolean {
  return /:block:product_card:nested:media$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    mediaAspectRatio: 0,
    mediaBorderStyle: 10,
    mediaCornerRadius: 11,
    mediaPaddingTop: 20,
    mediaPaddingBottom: 21,
    mediaPaddingLeft: 22,
    mediaPaddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isProductCardMediaPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!MEDIA_PANEL_KEYS.has(key)) return false;
  if (!/\.blocks\.product_card\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortProductCardMediaPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Borders: 1, Padding: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareProductCardMediaSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductCardMediaPanelFields((node.fields ?? []).filter(isProductCardMediaPanelField));
  return { ...node, label: 'Media', kind: 'block', fields };
}

export function groupProductCardMediaPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const grouped = new Map<string, EditorFieldDef[]>();
  for (const field of sortProductCardMediaPanelFields(fields)) {
    const group = field.group ?? 'General';
    const list = grouped.get(group) ?? [];
    list.push(field);
    grouped.set(group, list);
  }
  return grouped;
}

export function isProductCardMediaPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => f.path.endsWith('mediaAspectRatio') || f.path.endsWith('mediaBorderStyle'));
}

export function productCardMediaFieldDefsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const productCard = sec?.blocks?.find((b) => b.id === 'product_card');
  const media = productCard?.blocks?.find((b) => b.id === 'media');
  return media?.settingsFields ?? [];
}
