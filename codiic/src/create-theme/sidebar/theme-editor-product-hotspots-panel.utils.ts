import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER = [
  'General',
  'Section layout',
  'Colors',
  'Popover',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(PRODUCT_HOTSPOTS_PANEL_GROUP_ORDER);

const COLORS_KEYS = new Set(['hotspotColor', 'innerColor', 'backgroundColor']);

const FIELD_SORT: Record<string, number> = {
  imageUrl: 0,
  mediaOverlay: 1,
  sectionWidth: 0,
  sectionHeight: 1,
  hotspotColor: 0,
  innerColor: 1,
  backgroundColor: 2,
  popoverGap: 0,
  titleTypography: 1,
  priceTypography: 2,
  paddingTop: 0,
  paddingBottom: 1,
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

function panelGroupForField(field: EditorFieldDef): string {
  const key = field.path.split('.').pop() ?? '';
  if (COLORS_KEYS.has(key)) return 'Colors';
  if (field.group && PANEL_GROUPS.has(field.group)) return field.group;
  return 'General';
}

export function isProductHotspotsPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (key === 'heading' || key.startsWith('heading')) return false;
  if (key === 'colorScheme' || key === 'customCss') return false;
  if (COLORS_KEYS.has(key)) return true;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function augmentProductHotspotsPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const settingsBase =
    fields.find((f) => f.path.endsWith('.imageUrl'))?.path.replace(/\.imageUrl$/, '') ??
    fields.find((f) => f.path.endsWith('.hotspotColor'))?.path.replace(/\.hotspotColor$/, '') ??
    '';
  if (!settingsBase) return fields;

  const byKey = new Map<string, EditorFieldDef>();
  for (const field of fields) {
    byKey.set(field.path.split('.').pop() ?? '', field);
  }

  if (!byKey.has('backgroundColor')) {
    byKey.set('backgroundColor', {
      path: `${settingsBase}.backgroundColor`,
      type: 'text',
      label: 'Background color',
      group: 'Colors',
      widget: 'default-color',
      sidebar: true,
    });
  }

  for (const [key, field] of [...byKey.entries()]) {
    if (key === 'colorScheme' || key === 'customCss') {
      byKey.delete(key);
      continue;
    }
    if (key === 'titleTypography' || key === 'priceTypography') {
      byKey.set(key, {
        ...field,
        description: field.description ?? 'Edit presets in theme settings',
      });
    }
  }

  return Array.from(byKey.values());
}

export function sortProductHotspotsPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    'Section layout': 1,
    Colors: 2,
    Popover: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[panelGroupForField(a)] ?? 9;
    const gb = groupRank[panelGroupForField(b)] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupProductHotspotsPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = panelGroupForField(field);
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
  const filtered = filterSidebarSectionPanelFields(node.fields ?? [], isProductHotspotsPanelField);
  const fields = sortProductHotspotsPanelFields(augmentProductHotspotsPanelFields(filtered));
  return { ...node, label: 'Product hotspots', kind: 'section', fields };
}
