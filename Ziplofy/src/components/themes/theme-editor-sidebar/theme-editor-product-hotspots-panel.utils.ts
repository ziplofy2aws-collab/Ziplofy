import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER = [
  'General',
  'Section layout',
  'Colors',
  'Popover',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  imageUrl: 0,
  mediaOverlay: 1,
  sectionWidth: 0,
  sectionHeight: 1,
  hotspotColor: 0,
  innerColor: 1,
  colorScheme: 2,
  popoverGap: 0,
  titleTypography: 1,
  priceTypography: 2,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isProductHotspotsSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'product-hotspots' || catalogVariant === 'product-hotspots';
}

export function isProductHotspotsPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortProductHotspotsPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    'Section layout': 1,
    Colors: 2,
    Popover: 3,
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

export function groupProductHotspotsPanelFields(
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

export function isProductHotspotsSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('hotspotColor') && keys.has('popoverGap') && keys.has('imageUrl');
}

export function prepareProductHotspotsSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductHotspotsPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isProductHotspotsPanelField)
  );
  return { ...node, label: 'Product hotspots', kind: 'section', fields };
}
