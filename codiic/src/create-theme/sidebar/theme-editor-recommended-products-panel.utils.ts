import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const RECOMMENDED_PRODUCTS_PANEL_GROUP_ORDER = [
  'Product',
  'Cards layout',
  'Section layout',
  'Padding',
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
  backgroundColor: 2,
  paddingTop: 0,
  paddingBottom: 1,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

function panelGroupForField(field: EditorFieldDef): string {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'backgroundColor') return 'Section layout';
  if (field.group && PANEL_GROUPS.has(field.group)) return field.group;
  return 'Product';
}

export function isRecommendedProductsSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'recommended-products' || catalogVariant === 'recommended-products';
}

export function isRecommendedProductsPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (key === 'heading' || key.startsWith('heading')) return false;
  if (key === 'colorScheme' || key === 'customCss') return false;
  if (field.group === 'Theme settings' || field.group === 'Theme Settings' || field.group === 'Custom CSS') {
    return false;
  }
  if (key === 'backgroundColor') return true;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function augmentRecommendedProductsPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const settingsBase =
    fields.find((f) => f.path.endsWith('.productId'))?.path.replace(/\.productId$/, '') ??
    fields.find((f) => f.path.endsWith('.recommendationType'))?.path.replace(/\.recommendationType$/, '') ??
    '';
  if (!settingsBase) return fields;

  const byKey = new Map<string, EditorFieldDef>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    if (key === 'colorScheme' || key === 'customCss') continue;
    byKey.set(key, field);
  }

  if (!byKey.has('backgroundColor')) {
    byKey.set('backgroundColor', {
      path: `${settingsBase}.backgroundColor`,
      type: 'text',
      label: 'Background color',
      group: 'Section layout',
      widget: 'default-color',
      sidebar: true,
    });
  }

  return Array.from(byKey.values());
}

export function sortRecommendedProductsPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Product: 0,
    'Cards layout': 1,
    'Section layout': 2,
    Padding: 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[panelGroupForField(a)] ?? 9;
    const gb = groupRank[panelGroupForField(b)] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupRecommendedProductsPanelFields(
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

export function isRecommendedProductsSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('recommendationType') && keys.has('cardStyle') && keys.has('verticalGap');
}

export function prepareRecommendedProductsSettingsNode(node: SidebarNode): SidebarNode {
  const filtered = filterSidebarSectionPanelFields(node.fields ?? [], isRecommendedProductsPanelField);
  const fields = sortRecommendedProductsPanelFields(augmentRecommendedProductsPanelFields(filtered));
  return { ...node, label: 'Recommended products', kind: 'section', fields };
}
