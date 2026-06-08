import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const COLLECTION_LIST_CAROUSEL_PANEL_GROUP_ORDER = [
  'Collections',
  'Cards layout',
  'Carousel navigation',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LIST_CAROUSEL_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  collectionsPicker: 0,
  cardsLayoutType: 0,
  columns: 1,
  mobileColumns: 2,
  horizontalGap: 3,
  navigationIcon: 0,
  navigationIconBackground: 1,
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

export function isCollectionListCarouselSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'collection-list-carousel' || catalogVariant === 'collection-list-carousel';
}

export function isCollectionListCarouselPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortCollectionListCarouselPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Collections: 0,
    'Cards layout': 1,
    'Carousel navigation': 2,
    'Section layout': 3,
    Padding: 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupCollectionListCarouselPanelFields(
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

export function isCollectionListCarouselSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('navigationIcon') && keys.has('mobileColumns') && keys.has('horizontalGap');
}

export function prepareCollectionListCarouselSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionListCarouselPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isCollectionListCarouselPanelField)
  );
  return { ...node, label: 'Collection list: Carousel', kind: 'section', fields };
}
