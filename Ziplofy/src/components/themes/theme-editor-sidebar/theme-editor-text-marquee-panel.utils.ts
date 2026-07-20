import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const TEXT_MARQUEE_PANEL_GROUP_ORDER = [
  'Layout',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(TEXT_MARQUEE_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  motionDirection: 0,
  colorScheme: 10,
  paddingTop: 20,
  paddingBottom: 21,
  layoutGap: 22,
  customCss: 30,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isTextMarqueeSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'text-marquee' || catalogVariant === 'text-marquee';
}

export function isTextMarqueePanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortTextMarqueePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Appearance: 1,
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

export function groupTextMarqueePanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isTextMarqueeSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('motionDirection') && keys.has('text') && !keys.has('quote') && !keys.has('heading');
}

export function prepareTextMarqueeSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortTextMarqueePanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isTextMarqueePanelField)
  );
  return { ...node, label: 'Marquee', kind: 'section', fields };
}
