import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER = ['General', 'Padding'] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER);

const VARIANT_PICKER_FIELD_KEYS = new Set([
  'style',
  'swatches',
  'alignment',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

const STYLE_OPTIONS = [
  { value: 'buttons', label: 'Buttons' },
  { value: 'dropdown', label: 'Dropdown' },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

export function isFeaturedProductVariantPickerBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:variant_picker$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:variant_picker$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details.blocks.variant_picker`;
}

export function featuredProductVariantPickerDefaultSettings(): Record<string, string | number | boolean> {
  return {
    style: 'buttons',
    swatches: false,
    alignment: 'left',
    paddingTop: 0,
    paddingBottom: 8,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function featuredProductVariantPickerFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('style'),
      type: 'select',
      label: 'Style',
      group: 'General',
      widget: 'select',
      sidebar: false,
      options: [...STYLE_OPTIONS],
    },
    {
      path: s('swatches'),
      type: 'boolean',
      label: 'Swatches',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'General',
      widget: 'segmented',
      sidebar: false,
      options: [...ALIGNMENT_OPTIONS],
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

export function featuredProductVariantPickerFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductVariantPickerFieldDefs(base) : [];
}

export function featuredProductVariantPickerFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:variant_picker$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const details = sec?.blocks?.find((b) => b.id === 'details');
  const variantPicker = details?.blocks?.find((b) => b.id === 'variant_picker');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const schemaFields = variantPicker?.settingsFields ?? [];
  if (schemaFields.length) {
    return schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
  }
  return blocksBase ? featuredProductVariantPickerFieldDefs(blocksBase) : [];
}

export const FEATURED_PRODUCT_VARIANT_PICKER_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(featuredProductVariantPickerDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    style: 0,
    swatches: 1,
    alignment: 2,
    paddingTop: 10,
    paddingBottom: 11,
    paddingLeft: 12,
    paddingRight: 13,
  };
  return rank[key] ?? 50;
}

export function isFeaturedProductVariantPickerPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!VARIANT_PICKER_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.details\.blocks\.variant_picker\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductVariantPickerPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductVariantPickerPanelField);
}

export function groupFeaturedProductVariantPickerPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductVariantPickerPanelField)) {
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

export function extendFeaturedProductVariantPickerBlockValues(
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
    const fallback = FEATURED_PRODUCT_VARIANT_PICKER_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

export function prepareFeaturedProductVariantPickerSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .filter(isFeaturedProductVariantPickerPanelField)
    .sort((a, b) => {
      const ga = FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER.indexOf(
        (a.group ?? 'General') as (typeof FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER)[number]
      );
      const gb = FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER.indexOf(
        (b.group ?? 'General') as (typeof FEATURED_PRODUCT_VARIANT_PICKER_PANEL_GROUP_ORDER)[number]
      );
      if (ga !== gb) return ga - gb;
      return fieldSortKey(a.path) - fieldSortKey(b.path);
    });
  return { ...node, label: 'Variant picker', kind: 'block', fields };
}
