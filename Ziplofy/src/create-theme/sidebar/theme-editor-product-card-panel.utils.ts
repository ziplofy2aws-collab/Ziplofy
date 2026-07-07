import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';

export const PRODUCT_CARD_PANEL_GROUP_ORDER = ['General', 'Appearance', 'Borders', 'Padding'] as const;

const PANEL_GROUPS = new Set<string>(PRODUCT_CARD_PANEL_GROUP_ORDER);

const PANEL_KEYS = new Set([
  'verticalGap',
  'backgroundColor',
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
  'productTitleColor',
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
  return /^template:[^:]+:(?:featured_collection|recommended_products|main_collection)(?:_\d+)?:block:product_card$/.test(
    nodeId
  );
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    verticalGap: 0,
    backgroundColor: 5,
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
  const groupRank: Record<string, number> = {
    General: 0,
    Appearance: 1,
    Borders: 2,
    Padding: 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupProductCardPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const grouped = new Map<string, EditorFieldDef[]>();
  for (const field of sortProductCardPanelFields(fields)) {
    const group = field.group ?? 'General';
    const list = grouped.get(group) ?? [];
    list.push(field);
    grouped.set(group, list);
  }
  return grouped;
}

export function isProductCardPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.some(
    (f) =>
      f.path.endsWith('.verticalGap') &&
      /\.blocks\.product_card\.settings\./.test(f.path) &&
      !f.path.includes('collectionCard')
  );
}

export function productCardDefaultSettings(): Record<string, string | number | boolean> {
  return {
    verticalGap: 4,
    inheritColorScheme: true,
    backgroundColor: 'default',
    borderStyle: 'none',
    cornerRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export const PRODUCT_CARD_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(productCardDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function prepareProductCardSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortProductCardPanelFields((node.fields ?? []).filter(isProductCardPanelField));
  return { ...node, label: 'Product card', kind: 'block', fields };
}

export function productCardSettingsBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(
    /^template:([^:]+):((?:featured_collection|recommended_products|main_collection)(?:_\d+)?):block:product_card$/
  );
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardSettingsBaseFromPrefix(prefix: string): string | null {
  const match = prefix.match(/^template:([^:]+):((?:featured_collection|recommended_products|main_collection)(?:_\d+)?)$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('verticalGap'),
      type: 'number',
      label: 'Vertical gap',
      group: 'General',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('backgroundColor'),
      type: 'text',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('paddingTop'),
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
      path: s('paddingBottom'),
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
      path: s('paddingLeft'),
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
      path: s('paddingRight'),
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

function productCardSchemaFields(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  for (const sectionId of ['featured_collection', 'recommended_products'] as const) {
    const block = tpl?.sections?.find((s) => s.id === sectionId)?.blocks?.find((b) => b.id === 'product_card');
    const fields = block?.settingsFields?.filter((f) => {
      const key = f.path.split('.').pop() ?? '';
      return PANEL_KEYS.has(key);
    });
    if (fields?.length) return fields;
  }
  return [];
}

export function productCardFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId?: string
): EditorFieldDef[] {
  const canon = productCardSchemaFields(editorSchema);
  const settingsBase = nodeId ? productCardSettingsBaseFromNodeId(nodeId) : null;
  if (settingsBase) {
    if (canon.length) {
      const schemaKeys = new Set(canon.map((field) => field.path.split('.').pop() ?? ''));
      const fromSchema = canon.map((field) => {
        const key = field.path.split('.').pop() ?? '';
        return { ...field, path: `${settingsBase}.${key}` };
      });
      const fromBuilt = productCardFieldDefs(settingsBase).filter(
        (field) => !schemaKeys.has(field.path.split('.').pop() ?? '')
      );
      return [...fromSchema, ...fromBuilt];
    }
    return productCardFieldDefs(settingsBase);
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

export function extendValuesForProductCardBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = productCardFieldDefsFromSchema(editorSchema, nodeId);
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
    const fallback = PRODUCT_CARD_DEFAULTS[key];
    if (fallback !== undefined) {
      next[field.path] = fallback;
      changed = true;
    }
  }

  return changed ? next : values;
}
