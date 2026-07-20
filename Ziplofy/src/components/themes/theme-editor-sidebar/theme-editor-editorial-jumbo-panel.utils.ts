import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const EDITORIAL_JUMBO_PANEL_GROUP_ORDER = ['General', 'Padding', 'Custom CSS'] as const;

const PANEL_GROUPS = new Set<string>(EDITORIAL_JUMBO_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  mediaPosition: 0,
  mediaWidth: 1,
  mediaHeight: 2,
  sectionWidth: 3,
  colorScheme: 4,
  paddingTop: 20,
  paddingBottom: 21,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isEditorialJumboSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'editorial-jumbo' || catalogVariant === 'editorial-jumbo';
}

export function isEditorialJumboPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortEditorialJumboPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    Padding: 1,
    'Custom CSS': 2,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupEditorialJumboPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isEditorialJumboSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('headline')) return true;
  return keys.has('mediaPosition') && keys.has('mediaWidth') && !keys.has('heading') && !keys.has('subheading');
}

export function prepareEditorialJumboSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortEditorialJumboPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isEditorialJumboPanelField)
  );
  return { ...node, label: 'Editorial: Jumbo text', kind: 'section', fields };
}
