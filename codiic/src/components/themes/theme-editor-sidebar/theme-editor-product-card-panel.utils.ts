import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';

const PANEL_GROUPS = new Set(['General', 'Borders', 'Padding']);

const PANEL_KEYS = new Set([
  'verticalGap',
  'inheritColorScheme',
  'borderStyle',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

const MEDIA_SETTING_KEYS = new Set([
  'mediaAspectRatio',
  'mediaBorderStyle',
  'mediaCornerRadius',
  'mediaPaddingTop',
  'mediaPaddingBottom',
  'mediaPaddingLeft',
  'mediaPaddingRight',
  'showMedia',
]);

const TITLE_SETTING_KEYS = new Set([
  'productTitleWidth',
  'productTitleMaxWidth',
  'productTitleAlignment',
  'productTitleTypographyPreset',
  'productTitleBackgroundEnabled',
  'productTitlePaddingTop',
  'productTitlePaddingBottom',
  'productTitlePaddingLeft',
  'productTitlePaddingRight',
  'showTitle',
]);

const PRICE_SETTING_KEYS = new Set([
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
  'showPrice',
]);

export function isProductCardBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:featured_collection(?:_\d+)?:block:product_card$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    verticalGap: 0,
    inheritColorScheme: 1,
    borderStyle: 10,
    cornerRadius: 11,
    paddingTop: 20,
    paddingBottom: 21,
    paddingLeft: 22,
    paddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isProductCardPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (MEDIA_SETTING_KEYS.has(key) || TITLE_SETTING_KEYS.has(key) || PRICE_SETTING_KEYS.has(key)) {
    return false;
  }
  if (!PANEL_KEYS.has(key)) return false;
  if (!/\.blocks\.product_card\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortProductCardPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Borders: 1, Padding: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareProductCardSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductCardPanelFields((node.fields ?? []).filter(isProductCardPanelField));
  return { ...node, label: 'Product card', kind: 'block', fields };
}

export function productCardFieldDefsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const block = sec?.blocks?.find((b) => b.id === 'product_card');
  return block?.settingsFields ?? [];
}

