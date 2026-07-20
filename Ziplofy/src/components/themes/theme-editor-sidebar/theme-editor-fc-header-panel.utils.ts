import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';

const HEADER_PANEL_GROUPS = new Set(['Content', 'Layout', 'Size', 'Appearance', 'Padding']);

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

const FIELD_SORT: Record<string, number> = {
  subtitle: 0,
  viewAllLabel: 2,
  viewAllHref: 3,
  direction: 10,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  alignTextBaseline: 4,
  layoutGap: 5,
  width: 10,
  mobileWidth: 11,
  height: 12,
  inheritColorScheme: 20,
  backgroundMedia: 21,
  backgroundImageUrl: 22,
  borderStyle: 23,
  cornerRadius: 24,
  paddingTop: 30,
  paddingBottom: 31,
  paddingLeft: 32,
  paddingRight: 33,
};

export function isFeaturedCollectionHeaderBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:featured_collection(?:_\d+)?:block:collection_header$/.test(nodeId);
}

export function isFeaturedCollectionHeaderNestedNodeId(nodeId: string): boolean {
  return /:block:collection_header:nested:view_all_button$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isFeaturedCollectionHeaderPanelField(field: EditorFieldDef): boolean {
  if (!/\.blocks\.collection_header\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (TITLE_PANEL_KEYS.has(key)) return false;
  if (!field.group || !HEADER_PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortFeaturedCollectionHeaderPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Content: 0,
    Layout: 1,
    Size: 2,
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

export function prepareFeaturedCollectionHeaderSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortFeaturedCollectionHeaderPanelFields(
    (node.fields ?? []).filter(isFeaturedCollectionHeaderPanelField)
  );
  return { ...node, label: 'Header', kind: 'block', fields };
}

const VIEW_ALL_KEYS = new Set(['viewAllLabel', 'viewAllHref']);

/** View-all nested block — label + link only. */
export function prepareFeaturedCollectionHeaderNestedNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter((f) => VIEW_ALL_KEYS.has(f.path.split('.').pop() ?? ''));
  return { ...node, label: 'View all button', kind: 'block', fields };
}
