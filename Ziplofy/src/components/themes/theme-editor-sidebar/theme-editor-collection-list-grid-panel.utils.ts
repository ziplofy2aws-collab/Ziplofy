import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const COLLECTION_LIST_GRID_PANEL_GROUP_ORDER = [
  'Collections',
  'Cards layout',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LIST_GRID_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  collectionsPicker: 0,
  cardsLayoutType: 0,
  carouselOnMobile: 1,
  columns: 2,
  mobileColumns: 3,
  horizontalGap: 4,
  verticalGap: 5,
  sectionWidth: 0,
  layoutGap: 1,
  colorScheme: 2,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isCollectionListGridSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'collection-list-grid' || catalogVariant === 'collection-list-grid';
}

export function isCollectionListGridPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortCollectionListGridPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Collections: 0,
    'Cards layout': 1,
    'Section layout': 2,
    Padding: 3,
    'Custom CSS': 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupCollectionListGridPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Collections';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isCollectionListGridSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('verticalGap') && keys.has('horizontalGap') && keys.has('carouselOnMobile');
}

export function prepareCollectionListGridSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionListGridPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isCollectionListGridPanelField)
  );
  return { ...node, label: 'Collection list: Grid', kind: 'section', fields };
}
