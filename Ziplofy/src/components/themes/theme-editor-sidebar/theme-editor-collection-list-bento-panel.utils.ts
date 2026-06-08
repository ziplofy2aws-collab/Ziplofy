import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const COLLECTION_LIST_BENTO_PANEL_GROUP_ORDER = [
  'Collections',
  'Cards layout',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LIST_BENTO_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  collectionsPicker: 0,
  cardsLayoutType: 0,
  carouselOnMobile: 1,
  cardsGap: 2,
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

export function isCollectionListBentoSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'collection-list-bento' || catalogVariant === 'collection-list-bento';
}

export function isCollectionListBentoPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortCollectionListBentoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupCollectionListBentoPanelFields(
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

export function isCollectionListBentoSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('cardsLayoutType') && keys.has('cardsGap') && keys.has('carouselOnMobile');
}

export function prepareCollectionListBentoSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionListBentoPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isCollectionListBentoPanelField)
  );
  return { ...node, label: 'Collection list: Bento', kind: 'section', fields };
}
