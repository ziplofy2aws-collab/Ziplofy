import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

const PANEL_GROUPS = new Set(['General', 'Typography', 'Appearance', 'Padding']);

export const PRODUCT_CARD_PRICE_PANEL_GROUP_ORDER = [
  'General',
  'Typography',
  'Appearance',
  'Padding',
] as const;

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

export function productCardPriceDefaultSettings(): Record<string, string | number | boolean> {
  return {
    priceShowSaleFirst: true,
    priceInstallments: false,
    priceTaxInfo: false,
    priceTypographyPreset: 'heading-6',
    priceWidth: 'fill',
    priceAlignment: 'left',
    priceColor: 'default',
    pricePaddingTop: 0,
    pricePaddingBottom: 0,
    pricePaddingLeft: 0,
    pricePaddingRight: 0,
  };
}

export const PRODUCT_CARD_PRICE_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(productCardPriceDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

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
  const groupRank: Record<string, number> = { General: 0, Typography: 1, Appearance: 2, Padding: 3 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupProductCardPricePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const grouped = new Map<string, EditorFieldDef[]>();
  for (const field of sortProductCardPricePanelFields(fields)) {
    const group = field.group ?? 'General';
    const list = grouped.get(group) ?? [];
    list.push(field);
    grouped.set(group, list);
  }
  return grouped;
}

export function isProductCardPricePanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some((f) => /:?\.?blocks\.product_card\.settings\.price/.test(f.path) || f.path.endsWith('priceShowSaleFirst'));
}

export function productCardPriceSettingsBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(
    /^template:([^:]+):((?:featured_collection|recommended_products|main_collection)(?:_\d+)?):block:product_card/
  );
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardPriceSettingsBaseFromPrefix(prefix: string): string | null {
  const match = prefix.match(/^template:([^:]+):((?:featured_collection|recommended_products|main_collection)(?:_\d+)?)$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardPriceFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('priceShowSaleFirst'),
      type: 'boolean',
      label: 'Show sale price first',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('priceInstallments'),
      type: 'boolean',
      label: 'Installments',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('priceTaxInfo'),
      type: 'boolean',
      label: 'Tax information',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('priceTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'heading-6', label: 'Heading 6' },
        { value: 'heading-5', label: 'Heading 5' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'default', label: 'Default' },
        { value: 'body', label: 'Body' },
      ],
    },
    {
      path: s('priceWidth'),
      type: 'select',
      label: 'Width',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    },
    {
      path: s('priceAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('priceColor'),
      type: 'text',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('pricePaddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('pricePaddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('pricePaddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('pricePaddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
  ];
}

export function prepareProductCardPriceSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductCardPricePanelFields((node.fields ?? []).filter(isProductCardPricePanelField));
  return { ...node, label: 'Price', kind: 'block', fields };
}

function productCardPriceSchemaFields(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  for (const sectionId of ['featured_collection', 'recommended_products'] as const) {
    const sec = tpl?.sections?.find((s) => s.id === sectionId);
    const productCard = sec?.blocks?.find((b) => b.id === 'product_card');
    const priceBlock = productCard?.blocks?.find((b) => b.id === 'price');
    const fields = priceBlock?.settingsFields?.filter((f) => {
      const key = f.path.split('.').pop() ?? '';
      return PRICE_PANEL_KEYS.has(key);
    });
    if (fields?.length) return fields;
  }
  return [];
}

export function productCardPriceFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId?: string
): EditorFieldDef[] {
  const canon = productCardPriceSchemaFields(editorSchema);
  const settingsBase = nodeId ? productCardPriceSettingsBaseFromNodeId(nodeId) : null;
  if (settingsBase) {
    if (canon.length) {
      return canon.map((field) => {
        const key = field.path.split('.').pop() ?? '';
        return { ...field, path: `${settingsBase}.${key}` };
      });
    }
    return productCardPriceFieldDefs(settingsBase);
  }
  return canon;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendValuesForProductCardPriceBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = productCardPriceFieldDefsFromSchema(editorSchema, nodeId);
  const next = { ...values };
  let changed = false;

  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      changed = true;
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = PRODUCT_CARD_PRICE_DEFAULTS[key];
    if (fallback !== undefined) {
      next[field.path] = fallback;
      changed = true;
    }
  }

  return changed ? next : values;
}
