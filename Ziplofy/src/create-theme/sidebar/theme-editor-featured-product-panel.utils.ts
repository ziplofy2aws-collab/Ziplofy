import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const FEATURED_PRODUCT_PANEL_GROUP_ORDER = [
  'Product',
  'Layout',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_PANEL_GROUP_ORDER);

export const FEATURED_PRODUCT_LAYOUT_FIELD_ORDER = [
  'sectionWidth',
  'mediaPosition',
  'equalColumns',
  'limitProductDetailsWidth',
  'layoutGap',
  'backgroundColor',
] as const;

const HIDDEN_PANEL_KEYS = new Set(['colorScheme', 'customCss']);

const FIELD_SORT: Record<string, number> = {
  productId: 0,
  sectionWidth: 1,
  mediaPosition: 2,
  equalColumns: 3,
  limitProductDetailsWidth: 4,
  layoutGap: 5,
  backgroundColor: 6,
  paddingTop: 20,
  paddingBottom: 21,
};

export function featuredProductSectionDefaultSettings(): Record<string, string | number | boolean> {
  return {
    productId: '',
    productTitle: 'Product title',
    price: 'Rs. 19.99',
    productImageUrl: '',
    mediaPosition: 'left',
    sectionWidth: 'page',
    equalColumns: true,
    limitProductDetailsWidth: false,
    layoutGap: 48,
    backgroundColor: 'default',
    colorScheme: 'scheme-1',
    paddingTop: 40,
    paddingBottom: 40,
    customCss: '',
  };
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isFeaturedProductSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  if (secType === 'recommended-products' || catalogVariant === 'recommended-products') {
    return false;
  }
  if (secType === 'product-hotspots' || catalogVariant === 'product-hotspots') {
    return false;
  }
  return catalogVariant === 'featured-product';
}

const LAYOUT_KEYS_FROM_GENERAL = new Set(['mediaPosition', 'colorScheme']);

export function isFeaturedProductPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (HIDDEN_PANEL_KEYS.has(key)) return false;
  if (field.group && PANEL_GROUPS.has(field.group)) return true;
  if (field.group === 'General' && LAYOUT_KEYS_FROM_GENERAL.has(key)) return true;
  if (field.group === 'Padding' && (key === 'paddingTop' || key === 'paddingBottom')) return true;
  return false;
}

function settingsBaseFromFieldPath(path: string): string | null {
  const m = path.match(/^templates\.[^.]+\.sections\.[^.]+\.settings\./);
  if (!m) return null;
  return path.replace(/\.settings\.[^.]+$/, '.settings');
}

export function featuredProductSectionExtraFieldDefs(fields: EditorFieldDef[]): EditorFieldDef[] {
  const anchor = fields.find((f) => f.path.endsWith('.layoutGap') || f.path.endsWith('.sectionWidth'));
  const base = anchor ? settingsBaseFromFieldPath(anchor.path) : null;
  if (!base) return [];
  if (fields.some((f) => f.path.endsWith('.backgroundColor'))) return [];
  return [
    {
      path: `${base}.backgroundColor`,
      type: 'text',
      label: 'Background color',
      group: 'Layout',
      widget: 'color',
      sidebar: true,
    },
  ];
}

export function groupFeaturedProductPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    let group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Product';
    if (LAYOUT_KEYS_FROM_GENERAL.has(key)) group = 'Layout';
    if (key === 'paddingTop' || key === 'paddingBottom') group = 'Padding';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(
      group,
      [...list].sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path))
    );
  }
  return map;
}

export function isFeaturedProductSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('recommendationType') || keys.has('cardStyle') || keys.has('hotspotColor')) {
    return false;
  }
  return (
    keys.has('productId') &&
    (keys.has('sectionWidth') || keys.has('equalColumns') || keys.has('layoutGap'))
  );
}

export function sortFeaturedProductPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Product: 0,
    Layout: 1,
    Padding: 2,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareFeaturedProductSettingsNode(
  node: SidebarNode,
  _values?: Record<string, unknown>,
  _config?: Record<string, unknown> | null
): SidebarNode {
  const remapped = filterSidebarSectionPanelFields(node.fields ?? [], isFeaturedProductPanelField).map((f) => {
    const key = f.path.split('.').pop() ?? '';
    if (LAYOUT_KEYS_FROM_GENERAL.has(key)) return { ...f, group: 'Layout' };
    if (key === 'paddingTop' || key === 'paddingBottom') return { ...f, group: 'Padding' };
    return f;
  });
  const fields = sortFeaturedProductPanelFields([
    ...remapped,
    ...featuredProductSectionExtraFieldDefs(remapped),
  ]);
  return { ...node, label: 'Featured product', kind: 'section', fields };
}
