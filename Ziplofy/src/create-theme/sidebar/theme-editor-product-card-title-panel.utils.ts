import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

const PANEL_GROUPS = new Set(['Layout', 'Typography', 'Appearance', 'Padding']);

const TITLE_PANEL_KEYS = new Set([
  'productTitleWidth',
  'productTitleMaxWidth',
  'productTitleTypographyPreset',
  'productTitleColor',
  'productTitleBackgroundEnabled',
  'productTitlePaddingTop',
  'productTitlePaddingBottom',
  'productTitlePaddingLeft',
  'productTitlePaddingRight',
]);

export const PRODUCT_CARD_TITLE_PANEL_GROUP_ORDER = [
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

export function isProductCardTitleNestedNodeId(nodeId: string): boolean {
  return /:block:product_card:nested:product_title$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    productTitleWidth: 0,
    productTitleMaxWidth: 1,
    productTitleTypographyPreset: 10,
    productTitleColor: 19,
    productTitleBackgroundEnabled: 20,
    productTitlePaddingTop: 30,
    productTitlePaddingBottom: 31,
    productTitlePaddingLeft: 32,
    productTitlePaddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function isProductCardTitlePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!TITLE_PANEL_KEYS.has(key)) return false;
  if (!/\.blocks\.product_card\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortProductCardTitlePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Typography: 1,
    Appearance: 2,
    Padding: 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareProductCardTitleSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductCardTitlePanelFields((node.fields ?? []).filter(isProductCardTitlePanelField));
  return { ...node, label: 'Product title', kind: 'block', fields };
}

export function groupProductCardTitlePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const grouped = new Map<string, EditorFieldDef[]>();
  for (const field of sortProductCardTitlePanelFields(fields)) {
    const group = field.group ?? 'Layout';
    const list = grouped.get(group) ?? [];
    list.push(field);
    grouped.set(group, list);
  }
  return grouped;
}

export function isProductCardTitlePanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => f.path.endsWith('productTitleWidth') || f.path.endsWith('productTitleTypographyPreset'));
}

export function productCardTitleFieldDefsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const productCard = sec?.blocks?.find((b) => b.id === 'product_card');
  const title = productCard?.blocks?.find((b) => b.id === 'product_title');
  return title?.settingsFields ?? [];
}
