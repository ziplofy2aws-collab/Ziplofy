import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const RECOMMENDED_PRODUCTS_PANEL_GROUP_ORDER = [
  'Product',
  'Cards layout',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(RECOMMENDED_PRODUCTS_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  productId: 0,
  recommendationType: 1,
  cardStyle: 0,
  carouselOnMobile: 1,
  productCount: 2,
  columns: 3,
  mobileColumns: 4,
  horizontalGap: 5,
  verticalGap: 6,
  sectionWidth: 0,
  layoutGap: 1,
  colorScheme: 2,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isRecommendedProductsSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'recommended-products' || catalogVariant === 'recommended-products';
}

export function isRecommendedProductsPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortRecommendedProductsPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Product: 0,
    'Cards layout': 1,
    'Section layout': 2,
    Padding: 3,
    'Custom CSS': 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupRecommendedProductsPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Product';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isRecommendedProductsSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('recommendationType') && keys.has('cardStyle') && keys.has('verticalGap');
}

export function prepareRecommendedProductsSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortRecommendedProductsPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isRecommendedProductsPanelField)
  );
  return { ...node, label: 'Recommended products', kind: 'section', fields };
}
