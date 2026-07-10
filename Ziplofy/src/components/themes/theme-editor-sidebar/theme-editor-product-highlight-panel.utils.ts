import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

/** Shopify-style Product highlight settings sheet order. */
export const PRODUCT_HIGHLIGHT_PANEL_GROUP_ORDER = [
  'General',
  'Layout',
  'Padding',
  'Theme settings',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(PRODUCT_HIGHLIGHT_PANEL_GROUP_ORDER);

const PRODUCT_HIGHLIGHT_LAYOUT_KEYS = new Set(['mediaPosition', 'colorScheme']);

const FIELD_SORT: Record<string, number> = {
  productId: 0,
  mediaPosition: 1,
  colorScheme: 2,
  paddingTop: 20,
  paddingBottom: 21,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isProductHighlightSectionType(secType: string | undefined, catalogVariant: string): boolean {
  if (catalogVariant === 'featured-product') return false;
  return secType === 'product-highlight' || catalogVariant === 'product-highlight';
}

export function isProductHighlightPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (field.group === 'Layout') return PRODUCT_HIGHLIGHT_LAYOUT_KEYS.has(key);
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortProductHighlightPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    Padding: 1,
    'Theme settings': 2,
    'Custom CSS': 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupProductHighlightPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isProductHighlightSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('productId') && keys.has('mediaPosition');
}

export function prepareProductHighlightSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductHighlightPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isProductHighlightPanelField)
  );
  return { ...node, label: 'Product highlight', kind: 'section', fields };
}

export function productHighlightSiblingPath(path: string, key: string): string {
  return path.replace(/\.[^.]+$/, `.${key}`);
}
