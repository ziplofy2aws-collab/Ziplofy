import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const LAYERED_SLIDESHOW_PANEL_GROUP_ORDER = ['General', 'Padding', 'Custom CSS'] as const;

const PANEL_GROUPS = new Set<string>(LAYERED_SLIDESHOW_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  sectionWidth: 0,
  height: 1,
  cornerRadius: 2,
  borderThickness: 3,
  dropShadow: 4,
  colorScheme: 5,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isLayeredSlideshowSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'layered-slideshow' || catalogVariant === 'layered-slideshow';
}

export function isLayeredSlideshowPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortLayeredSlideshowPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Padding: 1, 'Custom CSS': 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupLayeredSlideshowPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isLayeredSlideshowSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('borderThickness') && keys.has('dropShadow') && keys.has('height');
}

export function prepareLayeredSlideshowSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortLayeredSlideshowPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isLayeredSlideshowPanelField)
  );
  return { ...node, label: 'Layered slideshow', kind: 'section', fields };
}
