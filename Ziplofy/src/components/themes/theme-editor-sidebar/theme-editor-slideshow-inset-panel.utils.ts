import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const SLIDESHOW_INSET_PANEL_GROUP_ORDER = [
  'General',
  'Navigation',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(SLIDESHOW_INSET_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  sectionLayout: 0,
  fullWidthOnMobile: 1,
  gap: 2,
  cornerRadius: 3,
  mediaHeight: 4,
  contentPosition: 5,
  colorScheme: 6,
  navigationIcon: 0,
  navigationIconBackground: 1,
  pagination: 2,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isSlideshowInsetSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'slideshow-inset' || catalogVariant === 'slideshow-inset';
}

export function isSlideshowInsetPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortSlideshowInsetPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    Navigation: 1,
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

export function groupSlideshowInsetPanelFields(
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

export function isSlideshowInsetSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('fullWidthOnMobile') && keys.has('gap') && keys.has('cornerRadius');
}

export function prepareSlideshowInsetSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortSlideshowInsetPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isSlideshowInsetPanelField)
  );
  return { ...node, label: 'Slideshow: Inset', kind: 'section', fields };
}
