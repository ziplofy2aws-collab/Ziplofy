import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const DIVIDER_PANEL_GROUP_ORDER = ['General', 'Padding', 'Custom CSS'] as const;

const PANEL_GROUPS = new Set<string>(DIVIDER_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  colorScheme: 0,
  sectionWidth: 1,
  thickness: 2,
  length: 3,
  paddingTop: 10,
  paddingBottom: 11,
  customCss: 20,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isDividerSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'divider' || catalogVariant === 'divider';
}

export function isDividerPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortDividerPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Padding: 1, 'Custom CSS': 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupDividerPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isDividerSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('thickness') && keys.has('length') && keys.has('colorScheme');
}

export function prepareDividerSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortDividerPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isDividerPanelField)
  );
  return { ...node, label: 'Divider', kind: 'section', fields };
}
