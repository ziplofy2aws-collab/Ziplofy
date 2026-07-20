import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const SLIDESHOW_FULL_FRAME_PANEL_GROUP_ORDER = [
  'General',
  'Navigation',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(SLIDESHOW_FULL_FRAME_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  sectionLayout: 0,
  sectionWidth: 1,
  mediaHeight: 2,
  contentPosition: 3,
  colorScheme: 4,
  navigationIcon: 0,
  navigationIconBackground: 1,
  pagination: 2,
  autoRotate: 3,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isSlideshowFullFrameSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'slideshow-full-frame' || catalogVariant === 'slideshow-full-frame';
}

export function isSlideshowFullFramePanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortSlideshowFullFramePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupSlideshowFullFramePanelFields(
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

export function isSlideshowFullFrameSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('mediaHeight') && keys.has('contentPosition') && keys.has('navigationIcon');
}

export function prepareSlideshowFullFrameSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortSlideshowFullFramePanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isSlideshowFullFramePanelField)
  );
  return { ...node, label: 'Slideshow: Full frame', kind: 'section', fields };
}
