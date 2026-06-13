import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const STORYTELLING_CAROUSEL_PANEL_GROUP_ORDER = [
  'Layout',
  'Navigation',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_CAROUSEL_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  columns: 0,
  mobileColumns: 1,
  sectionWidth: 2,
  horizontalGap: 3,
  colorScheme: 4,
  navIcon: 0,
  navIconBackground: 1,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isStorytellingCarouselSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'storytelling-carousel' || catalogVariant === 'storytelling-carousel';
}

export function isStorytellingCarouselPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortStorytellingCarouselPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
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

export function groupStorytellingCarouselPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingCarouselPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isStorytellingCarouselSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('columns') &&
    keys.has('mobileColumns') &&
    keys.has('navIcon') &&
    !keys.has('postCount') &&
    !keys.has('blogHandle') &&
    !keys.has('verticalGap')
  );
}

export function prepareStorytellingCarouselSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortStorytellingCarouselPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isStorytellingCarouselPanelField)
  );
  return { ...node, label: 'Carousel', kind: 'section', fields };
}
