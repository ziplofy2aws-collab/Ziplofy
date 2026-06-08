import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER = [
  'General',
  'Typography',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER);

const PRICE_FIELD_KEYS = new Set([
  'showSalePriceFirst',
  'installments',
  'taxInformation',
  'typographyPreset',
  'width',
  'alignment',
  'color',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

const FIT_FILL = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

const TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'body', label: 'Body' },
] as const;

const COLOR_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'heading', label: 'Heading' },
  { value: 'accent', label: 'Accent' },
  { value: 'muted', label: 'Muted' },
] as const;

export function isFeaturedProductHeaderPriceNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:header:nested:price$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:header:nested:price$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details.blocks.header.blocks.price`;
}

export function featuredProductHeaderPriceDefaultSettings(): Record<string, string | number | boolean> {
  return {
    showSalePriceFirst: false,
    installments: false,
    taxInformation: false,
    typographyPreset: 'default',
    width: 'fit',
    alignment: 'left',
    color: 'text',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function featuredProductHeaderPriceFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('showSalePriceFirst'),
      type: 'boolean',
      label: 'Show sale price first',
      group: 'General',
      sidebar: false,
      description: 'Edit price formatting in theme settings',
    },
    {
      path: s('installments'),
      type: 'boolean',
      label: 'Installments',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('taxInformation'),
      type: 'boolean',
      label: 'Tax information',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('typographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [...TYPOGRAPHY_PRESET_OPTIONS],
    },
    {
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL],
    },
    {
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [...ALIGNMENT_OPTIONS],
    },
    {
      path: s('color'),
      type: 'select',
      label: 'Color',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [...COLOR_OPTIONS],
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

export function featuredProductHeaderPriceFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductHeaderPriceFieldDefs(base) : [];
}

export function featuredProductHeaderPriceFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:header:nested:price$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const details = sec?.blocks?.find((b) => b.id === 'details');
  const header = details?.blocks?.find((b) => b.id === 'header');
  const price = header?.blocks?.find((b) => b.id === 'price');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const schemaFields = price?.settingsFields ?? [];
  if (schemaFields.length) {
    return schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
  }
  return blocksBase ? featuredProductHeaderPriceFieldDefs(blocksBase) : [];
}

export const FEATURED_PRODUCT_HEADER_PRICE_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(featuredProductHeaderPriceDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    showSalePriceFirst: 0,
    installments: 1,
    taxInformation: 2,
    typographyPreset: 10,
    width: 11,
    alignment: 12,
    color: 13,
    paddingTop: 20,
    paddingBottom: 21,
    paddingLeft: 22,
    paddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isFeaturedProductHeaderPricePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!PRICE_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.details\.blocks\.header\.blocks\.price\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductHeaderPricePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductHeaderPricePanelField);
}

export function groupFeaturedProductHeaderPricePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductHeaderPricePanelField)) {
    const group = field.group ?? 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(
      group,
      [...list].sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path))
    );
  }
  return map;
}

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendFeaturedProductHeaderPriceBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] =
        field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = FEATURED_PRODUCT_HEADER_PRICE_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

export function prepareFeaturedProductHeaderPriceSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .filter(isFeaturedProductHeaderPricePanelField)
    .sort((a, b) => {
      const ga = FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER.indexOf(
        (a.group ?? 'General') as (typeof FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER)[number]
      );
      const gb = FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER.indexOf(
        (b.group ?? 'General') as (typeof FEATURED_PRODUCT_HEADER_PRICE_PANEL_GROUP_ORDER)[number]
      );
      if (ga !== gb) return ga - gb;
      return fieldSortKey(a.path) - fieldSortKey(b.path);
    });
  return { ...node, label: 'Price', kind: 'block', fields };
}
