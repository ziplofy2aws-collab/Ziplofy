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

export function productCardTitleDefaultSettings(): Record<string, string | number | boolean> {
  return {
    productTitleWidth: 'fit',
    productTitleMaxWidth: 'normal',
    productTitleTypographyPreset: 'paragraph',
    productTitleColor: 'default',
    productTitleBackgroundEnabled: false,
    productTitlePaddingTop: 4,
    productTitlePaddingBottom: 0,
    productTitlePaddingLeft: 0,
    productTitlePaddingRight: 0,
  };
}

export const PRODUCT_CARD_TITLE_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(productCardTitleDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

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

export function productCardTitleSettingsBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(
    /^template:([^:]+):((?:featured_collection|recommended_products|main_collection|search_results)(?:_\d+)?):block:product_card/
  );
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardTitleSettingsBaseFromPrefix(prefix: string): string | null {
  const match = prefix.match(/^template:([^:]+):((?:featured_collection|recommended_products|main_collection|search_results)(?:_\d+)?)$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.product_card.settings`;
}

export function productCardTitleFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('productTitleWidth'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    },
    {
      path: s('productTitleMaxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s('productTitleTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'paragraph', label: 'Paragraph' },
        { value: 'body', label: 'Body' },
      ],
    },
    {
      path: s('productTitleColor'),
      type: 'text',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('productTitleBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      sidebar: false,
    },
    {
      path: s('productTitlePaddingTop'),
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
      path: s('productTitlePaddingBottom'),
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
      path: s('productTitlePaddingLeft'),
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
      path: s('productTitlePaddingRight'),
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

function productCardTitleSchemaFields(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  for (const sectionId of ['featured_collection', 'recommended_products'] as const) {
    const sec = tpl?.sections?.find((s) => s.id === sectionId);
    const productCard = sec?.blocks?.find((b) => b.id === 'product_card');
    const titleBlock = productCard?.blocks?.find((b) => b.id === 'product_title');
    const fields = titleBlock?.settingsFields?.filter((f) => {
      const key = f.path.split('.').pop() ?? '';
      return TITLE_PANEL_KEYS.has(key);
    });
    if (fields?.length) return fields;
  }
  return [];
}

export function productCardTitleFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId?: string
): EditorFieldDef[] {
  const canon = productCardTitleSchemaFields(editorSchema);
  const settingsBase = nodeId ? productCardTitleSettingsBaseFromNodeId(nodeId) : null;
  if (settingsBase) {
    if (canon.length) {
      return canon.map((field) => {
        const key = field.path.split('.').pop() ?? '';
        return { ...field, path: `${settingsBase}.${key}` };
      });
    }
    return productCardTitleFieldDefs(settingsBase);
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

export function extendValuesForProductCardTitleBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = productCardTitleFieldDefsFromSchema(editorSchema, nodeId);
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
    const fallback = PRODUCT_CARD_TITLE_DEFAULTS[key];
    if (fallback !== undefined) {
      next[field.path] = fallback;
      changed = true;
    }
  }

  return changed ? next : values;
}
