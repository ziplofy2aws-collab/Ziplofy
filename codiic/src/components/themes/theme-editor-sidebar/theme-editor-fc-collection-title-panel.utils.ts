import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';

const PANEL_GROUPS = new Set(['Text', 'Layout', 'Typography', 'Appearance', 'Padding']);

const TITLE_PANEL_KEYS = new Set([
  'title',
  'titleWidth',
  'titleMaxWidth',
  'titleTypographyPreset',
  'titleColor',
  'titleBackgroundEnabled',
  'titlePaddingTop',
  'titlePaddingBottom',
  'titlePaddingLeft',
  'titlePaddingRight',
]);

export function isCollectionTitleNestedNodeId(nodeId: string): boolean {
  return /:block:collection_header:nested:collection_title$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    title: 0,
    titleWidth: 1,
    titleMaxWidth: 2,
    titleTypographyPreset: 10,
    titleColor: 11,
    titleBackgroundEnabled: 20,
    titlePaddingTop: 30,
    titlePaddingBottom: 31,
    titlePaddingLeft: 32,
    titlePaddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function isCollectionTitlePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!TITLE_PANEL_KEYS.has(key)) return false;
  if (!/\.blocks\.collection_header\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortCollectionTitlePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Text: 0,
    Layout: 1,
    Typography: 2,
    Appearance: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareCollectionTitleSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionTitlePanelFields((node.fields ?? []).filter(isCollectionTitlePanelField));
  return { ...node, label: 'Collection title', kind: 'block', fields };
}

export function collectionTitleFieldDefsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const header = sec?.blocks?.find((b) => b.id === 'collection_header');
  const nested = header?.blocks?.find((b) => b.id === 'collection_title');
  return nested?.settingsFields ?? [];
}
