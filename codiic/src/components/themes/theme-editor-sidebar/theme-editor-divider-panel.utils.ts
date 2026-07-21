import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { isSectionSettingsFieldPath } from './theme-editor-field.utils';

export const DIVIDER_PANEL_GROUP_ORDER = ['General', 'Padding', 'Custom CSS'] as const;

const PANEL_GROUPS = new Set<string>(DIVIDER_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  backgroundColor: 0,
  color: 1,
  sectionWidth: 2,
  thickness: 3,
  length: 4,
  paddingTop: 10,
  paddingBottom: 11,
  customCss: 20,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function isColorSchemeField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'colorScheme' || field.widget === 'color-scheme';
}

function inferredDividerGroup(field: EditorFieldDef): string | undefined {
  if (field.group && PANEL_GROUPS.has(field.group)) return field.group;
  const key = field.path.split('.').pop() ?? '';
  if (
    key === 'backgroundColor' ||
    key === 'color' ||
    key === 'sectionWidth' ||
    key === 'thickness' ||
    key === 'length'
  ) {
    return 'General';
  }
  if (key === 'paddingTop' || key === 'paddingBottom') return 'Padding';
  if (key === 'customCss') return 'Custom CSS';
  return undefined;
}

export function isDividerSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'divider' || catalogVariant === 'divider';
}

export function isDividerPanelField(field: EditorFieldDef): boolean {
  if (isColorSchemeField(field)) return false;
  if (!inferredDividerGroup(field)) return false;
  return isSectionSettingsFieldPath(field.path);
}

export function sortDividerPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Padding: 1, 'Custom CSS': 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[inferredDividerGroup(a) ?? a.group ?? ''] ?? 9;
    const gb = groupRank[inferredDividerGroup(b) ?? b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupDividerPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    if (isColorSchemeField(field)) continue;
    const group = inferredDividerGroup(field) ?? 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isDividerSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('thickness') &&
    keys.has('length') &&
    (keys.has('sectionWidth') ||
      keys.has('backgroundColor') ||
      keys.has('color') ||
      keys.has('colorScheme'))
  );
}

export function prepareDividerSettingsNode(node: SidebarNode): SidebarNode {
  const withoutScheme = (node.fields ?? []).filter((f) => !isColorSchemeField(f));
  let fields = sortDividerPanelFields(
    withoutScheme.filter((f) => Boolean(inferredDividerGroup(f)))
  );
  if (!fields.length) {
    fields = sortDividerPanelFields(withoutScheme);
  }
  return { ...node, label: 'Divider', kind: 'section', fields };
}
