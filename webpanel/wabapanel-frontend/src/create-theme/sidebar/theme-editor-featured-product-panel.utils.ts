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
  'mediaPanelBackgroundColor',
  'detailsPanelBackgroundColor',
  'colorScheme',
] as const;

// `colorScheme` controls the panel backgrounds (media/details) for Featured Product.
// Keep `customCss` hidden in the editor, but allow color scheme edits.
const HIDDEN_PANEL_KEYS = new Set(['customCss']);

const FIELD_SORT: Record<string, number> = {
  productId: 0,
  sectionWidth: 1,
  mediaPosition: 2,
  equalColumns: 3,
  limitProductDetailsWidth: 4,
  layoutGap: 5,
  backgroundColor: 6,
  mediaPanelBackgroundColor: 7,
  detailsPanelBackgroundColor: 8,
  colorScheme: 9,
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
    mediaPanelBackgroundColor: 'default',
    detailsPanelBackgroundColor: 'default',
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

function featuredProductLayoutColorField(
  base: string,
  key: 'backgroundColor' | 'mediaPanelBackgroundColor' | 'detailsPanelBackgroundColor',
  label: string
): EditorFieldDef {
  return {
    path: `${base}.${key}`,
    type: 'text',
    label,
    group: 'Layout',
    widget: 'color',
    sidebar: true,
  };
}

export function featuredProductSectionExtraFieldDefs(fields: EditorFieldDef[]): EditorFieldDef[] {
  const anchor = fields.find((f) => f.path.endsWith('.layoutGap') || f.path.endsWith('.sectionWidth'));
  const base = anchor ? settingsBaseFromFieldPath(anchor.path) : null;
  if (!base) return [];

  const hasKey = (key: string) => fields.some((f) => f.path.endsWith(`.${key}`));
  const extras: EditorFieldDef[] = [];

  if (!hasKey('backgroundColor')) {
    extras.push(featuredProductLayoutColorField(base, 'backgroundColor', 'Section background color'));
  }
  if (!hasKey('mediaPanelBackgroundColor')) {
    extras.push(
      featuredProductLayoutColorField(base, 'mediaPanelBackgroundColor', 'Media panel background')
    );
  }
  if (!hasKey('detailsPanelBackgroundColor')) {
    extras.push(
      featuredProductLayoutColorField(base, 'detailsPanelBackgroundColor', 'Details panel background')
    );
  }
  if (!hasKey('colorScheme')) {
    extras.push({
      path: `${base}.colorScheme`,
      type: 'select',
      label: 'Panel color scheme',
      group: 'Layout',
      widget: 'color-scheme',
      sidebar: true,
      options: [
        { value: 'scheme-1', label: 'Scheme 1' },
        { value: 'scheme-2', label: 'Scheme 2' },
        { value: 'scheme-3', label: 'Scheme 3' },
        { value: 'scheme-4', label: 'Scheme 4' },
      ],
    });
  }

  return extras;
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
    if (key === 'backgroundColor') {
      return { ...f, group: 'Layout', label: 'Section background color', widget: 'color' };
    }
    if (key === 'mediaPanelBackgroundColor') {
      return { ...f, group: 'Layout', label: 'Media panel background', widget: 'color' };
    }
    if (key === 'detailsPanelBackgroundColor') {
      return { ...f, group: 'Layout', label: 'Details panel background', widget: 'color' };
    }
    if (key === 'colorScheme') {
      return { ...f, group: 'Layout', label: 'Panel color scheme', widget: 'color-scheme' };
    }
    return f;
  });
  const fields = sortFeaturedProductPanelFields([
    ...remapped,
    ...featuredProductSectionExtraFieldDefs(remapped),
  ]);
  return { ...node, label: 'Featured product', kind: 'section', fields };
}
