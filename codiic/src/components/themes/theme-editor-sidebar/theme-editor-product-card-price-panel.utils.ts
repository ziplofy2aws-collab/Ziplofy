import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';

const PANEL_GROUPS = new Set(['General', 'Typography', 'Padding']);

const PRICE_PANEL_KEYS = new Set([
  'priceShowSaleFirst',
  'priceInstallments',
  'priceTaxInfo',
  'priceTypographyPreset',
  'priceWidth',
  'priceAlignment',
  'priceColor',
  'pricePaddingTop',
  'pricePaddingBottom',
  'pricePaddingLeft',
  'pricePaddingRight',
]);

export function isProductCardPriceNestedNodeId(nodeId: string): boolean {
  return /:block:product_card:nested:price$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    priceShowSaleFirst: 0,
    priceInstallments: 1,
    priceTaxInfo: 2,
    priceTypographyPreset: 10,
    priceWidth: 11,
    priceAlignment: 12,
    priceColor: 13,
    pricePaddingTop: 20,
    pricePaddingBottom: 21,
    pricePaddingLeft: 22,
    pricePaddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isProductCardPricePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!PRICE_PANEL_KEYS.has(key)) return false;
  if (!/\.blocks\.product_card\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortProductCardPricePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Typography: 1, Padding: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareProductCardPriceSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductCardPricePanelFields((node.fields ?? []).filter(isProductCardPricePanelField));
  return { ...node, label: 'Price', kind: 'block', fields };
}

export function productCardPriceFieldDefsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const productCard = sec?.blocks?.find((b) => b.id === 'product_card');
  const price = productCard?.blocks?.find((b) => b.id === 'price');
  return price?.settingsFields ?? [];
}
