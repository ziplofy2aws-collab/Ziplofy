import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import { isFeaturedProductSettingsPanelFields } from './theme-editor-featured-product-panel.utils';

/** Shopify-style Product highlight settings sheet order. */
export const PRODUCT_HIGHLIGHT_PANEL_GROUP_ORDER = [
  'General',
  'Layout',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(PRODUCT_HIGHLIGHT_PANEL_GROUP_ORDER);

const PRODUCT_HIGHLIGHT_LAYOUT_KEYS = new Set(['mediaPosition', 'backgroundColor']);

const HIDDEN_PANEL_KEYS = new Set(['customCss', 'colorScheme']);

const FIELD_SORT: Record<string, number> = {
  productId: 0,
  mediaPosition: 1,
  backgroundColor: 2,
  paddingTop: 20,
  paddingBottom: 21,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isProductHighlightSectionType(secType: string | undefined, catalogVariant: string): boolean {
  if (catalogVariant === 'featured-product') return false;
  return secType === 'product-highlight' || catalogVariant === 'product-highlight';
}

export function isProductHighlightSectionNodeId(nodeId: string): boolean {
  return /^(?:template:[^:]+|layout):product_highlight(?:_\d+)?$/.test(nodeId);
}

export function productHighlightSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):(product_highlight(?:_\d+)?)(?::|$)/);
  if (templateMatch) {
    return `templates.${templateMatch[1]}.sections.${templateMatch[2]}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:(product_highlight(?:_\d+)?)(?::|$)/);
  if (layoutMatch) {
    return `sections.${layoutMatch[1]}.settings`;
  }
  return null;
}

function readSettingString(
  config: Record<string, unknown> | null | undefined,
  settingsBase: string,
  key: string
): string {
  if (!config) return '';
  const parts = `${settingsBase}.${key}`.split('.');
  let cur: unknown = config;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : '';
}

function readFlatValueString(
  values: Record<string, unknown> | undefined,
  path: string
): string {
  if (!values) return '';
  const value = values[path];
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

export function readProductHighlightSettingValue(
  values: Record<string, unknown> | undefined,
  config: Record<string, unknown> | null | undefined,
  settingsBase: string,
  key: 'catalogVariant'
): string {
  const flat = readFlatValueString(values, `${settingsBase}.${key}`);
  if (flat) return flat;
  return readSettingString(config, settingsBase, key);
}

export type ProductHighlightVariant = 'product-highlight' | 'featured-product';

export function productHighlightVariantLabel(variant: ProductHighlightVariant): string {
  return variant === 'featured-product' ? 'Featured product' : 'Product highlight';
}

export function resolveProductHighlightVariant(opts: {
  label?: string;
  catalogVariant?: string;
  fields?: EditorFieldDef[];
}): ProductHighlightVariant {
  const label = opts.label ?? '';
  if (label === 'Product highlight') return 'product-highlight';
  if (label === 'Featured product') return 'featured-product';

  const catalogVariant = opts.catalogVariant ?? '';
  if (catalogVariant === 'featured-product') return 'featured-product';
  if (catalogVariant === 'product-highlight') return 'product-highlight';

  const fields = opts.fields ?? [];
  const isHighlight = isProductHighlightSettingsPanelFields(fields);
  const isFeatured = isFeaturedProductSettingsPanelFields(fields);
  if (isHighlight && !isFeatured) return 'product-highlight';
  if (isFeatured && !isHighlight) return 'featured-product';
  if (isHighlight) return 'product-highlight';

  return 'product-highlight';
}

export function productHighlightSidebarLabel(
  catalogVariant: string,
  fallback: string
): string {
  if (catalogVariant === 'featured-product') return 'Featured product';
  if (catalogVariant === 'product-highlight') return 'Product highlight';
  return fallback;
}

export function isProductHighlightPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  const key = field.path.split('.').pop() ?? '';
  if (HIDDEN_PANEL_KEYS.has(key)) return false;
  if (field.group === 'Theme Settings' || field.group === 'Theme settings' || field.group === 'Custom CSS') {
    return false;
  }
  if (key === 'productId') return field.group === 'Product' || field.group === 'General';
  if (field.group === 'Layout') return PRODUCT_HIGHLIGHT_LAYOUT_KEYS.has(key);
  if (field.group === 'Product') return key === 'productId';
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

function panelGroupForField(field: EditorFieldDef): string {
  if (field.path.endsWith('.productId') || field.group === 'Product') return 'General';
  if (field.group === 'Layout') return 'Layout';
  if (field.group && PANEL_GROUPS.has(field.group)) return field.group;
  return 'General';
}

export function sortProductHighlightPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    Layout: 1,
    Padding: 2,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[panelGroupForField(a)] ?? 9;
    const gb = groupRank[panelGroupForField(b)] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupProductHighlightPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = panelGroupForField(field);
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

export function prepareProductHighlightSettingsNode(
  node: SidebarNode,
  values?: Record<string, unknown>,
  config?: Record<string, unknown> | null
): SidebarNode {
  const fields = sortProductHighlightPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isProductHighlightPanelField)
  );
  return { ...node, label: 'Product highlight', kind: 'section', fields };
}

export function productHighlightSiblingPath(path: string, key: string): string {
  return path.replace(/\.[^.]+$/, `.${key}`);
}
