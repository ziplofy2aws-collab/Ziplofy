import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const COLLECTION_LINKS_SPOTLIGHT_PANEL_GROUP_ORDER = [
  'Collections',
  'Layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LINKS_SPOTLIGHT_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  collectionsPicker: 0,
  layoutMode: 0,
  sectionWidth: 1,
  alignment: 2,
  imagePosition: 3,
  colorScheme: 4,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isCollectionLinksSpotlightSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return (
    secType === 'collection-links-spotlight' ||
    catalogVariant === 'collection-links-spotlight' ||
    catalogVariant === 'collection-links-text'
  );
}

export function isCollectionLinksSpotlightPanelSectionSettingsPath(path: string): boolean {
  return (
    /^sections\.[^.]+\.settings\./.test(path) ||
    /^templates\.[^.]+\.sections\.[^.]+\.settings\./.test(path)
  );
}

export function isCollectionLinksSpotlightPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return isCollectionLinksSpotlightPanelSectionSettingsPath(field.path);
}

export function sortCollectionLinksSpotlightPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Collections: 0,
    Layout: 1,
    Padding: 2,
    'Custom CSS': 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupCollectionLinksSpotlightPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of sortCollectionLinksSpotlightPanelFields(fields)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isCollectionLinksSpotlightSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('collectionsPicker') && keys.has('alignment') && keys.has('layoutMode');
}

export function prepareCollectionLinksSpotlightSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionLinksSpotlightPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isCollectionLinksSpotlightPanelField)
  );
  const isTextSection =
    node.label === 'Collection links: Text' ||
    node.id.includes('collection_links_text');
  const label = isTextSection ? 'Collection links: Text' : 'Collection links: Spotlight';
  return { ...node, label, kind: 'section', fields };
}
