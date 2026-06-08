import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';

export function isSlideshowSlideBlockField(field: EditorFieldDef): boolean {
  return (
    /\.blocks\.[^.]+\.settings\.(title|body|buttonLabel|buttonHref|imageUrl|peekVariant)$/.test(
      field.path
    ) && field.sidebar !== false
  );
}

export function isSlideshowSlideBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isSlideshowSlideBlockField);
}

export function prepareSlideshowSlideBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])].sort((a, b) => {
    const order: Record<string, number> = {
      title: 0,
      body: 1,
      buttonLabel: 2,
      buttonHref: 3,
      imageUrl: 4,
      peekVariant: 5,
    };
    const ka = order[a.path.split('.').pop() ?? ''] ?? 9;
    const kb = order[b.path.split('.').pop() ?? ''] ?? 9;
    return ka - kb;
  });
  return { ...node, label: 'Slide', kind: 'block', fields };
}
