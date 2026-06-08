import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

export function isCollectionTileBlockField(field: EditorFieldDef): boolean {
  return (
    /\.blocks\.[^.]+\.settings\.(title|collectionHandle|columnSpan|illustrationVariant|imageUrl)$/.test(
      field.path
    ) && field.sidebar !== false
  );
}

export function isCollectionTileBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isCollectionTileBlockField);
}

export function prepareCollectionTileBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])].sort((a, b) => {
    const order: Record<string, number> = {
      title: 0,
      collectionHandle: 1,
      columnSpan: 2,
      illustrationVariant: 3,
      imageUrl: 4,
    };
    const ka = order[a.path.split('.').pop() ?? ''] ?? 9;
    const kb = order[b.path.split('.').pop() ?? ''] ?? 9;
    return ka - kb;
  });
  return { ...node, label: 'Collection', kind: 'block', fields };
}
