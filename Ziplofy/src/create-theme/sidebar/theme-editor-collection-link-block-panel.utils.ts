import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

const BLOCK_PANEL_KEYS = new Set(['collectionHandle']);

export function isCollectionLinkBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return /\.blocks\.[^.]+\.settings\./.test(field.path) && BLOCK_PANEL_KEYS.has(key) && field.sidebar !== false;
}

export function isCollectionLinkBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isCollectionLinkBlockField);
}

export function prepareCollectionLinkBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])].filter(isCollectionLinkBlockField).sort((a, b) => {
    const order: Record<string, number> = { collectionHandle: 0 };
    const ka = order[a.path.split('.').pop() ?? ''] ?? 9;
    const kb = order[b.path.split('.').pop() ?? ''] ?? 9;
    return ka - kb;
  });
  return { ...node, label: 'Collection', kind: 'block', fields };
}
