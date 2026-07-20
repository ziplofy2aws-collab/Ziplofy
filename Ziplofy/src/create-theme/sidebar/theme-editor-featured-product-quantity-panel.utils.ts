import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_QUANTITY_PANEL_GROUP_ORDER = ['Input'] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_QUANTITY_PANEL_GROUP_ORDER);

const QUANTITY_FIELD_KEYS = new Set(['inputStyle']);

export function isFeaturedProductQuantityNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:buy_buttons:nested:quantity$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:buy_buttons:nested:quantity$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details.blocks.buy_buttons.blocks.quantity`;
}

export function featuredProductQuantityDefaultSettings(): Record<string, string> {
  return { inputStyle: 'default' };
}

export function featuredProductQuantityFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('inputStyle'),
      type: 'select',
      label: 'Style',
      group: 'Input',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'default', label: 'Default' },
        { value: 'custom', label: 'Custom' },
      ],
    },
  ];
}

export function featuredProductQuantityFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductQuantityFieldDefs(base) : [];
}

export function featuredProductQuantityFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:buy_buttons:nested:quantity$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const details = sec?.blocks?.find((b) => b.id === 'details');
  const buyButtons = details?.blocks?.find((b) => b.id === 'buy_buttons');
  const quantity = buyButtons?.blocks?.find((b) => b.id === 'quantity');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const built = blocksBase ? featuredProductQuantityFieldDefs(blocksBase) : [];
  const schemaFields = quantity?.settingsFields ?? [];
  if (schemaFields.length) {
    const remapped = schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
    const schemaKeys = new Set(remapped.map((f) => f.path.split('.').pop() ?? ''));
    return [...remapped, ...built.filter((f) => !schemaKeys.has(f.path.split('.').pop() ?? ''))];
  }
  return built;
}

export const FEATURED_PRODUCT_QUANTITY_DEFAULTS: Record<string, string> =
  featuredProductQuantityDefaultSettings();

function fieldSortKey(path: string): number {
  return path.endsWith('.inputStyle') ? 0 : 50;
}

export function isFeaturedProductQuantityPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!QUANTITY_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.details\.blocks\.buy_buttons\.blocks\.quantity\.settings\./.test(field.path)) {
    return false;
  }
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductQuantityPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductQuantityPanelField);
}

export function groupFeaturedProductQuantityPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductQuantityPanelField)) {
    const group = field.group ?? 'Input';
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

export function extendFeaturedProductQuantityBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] = String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = FEATURED_PRODUCT_QUANTITY_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

export function prepareFeaturedProductQuantitySettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .filter(isFeaturedProductQuantityPanelField)
    .sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path));
  return { ...node, label: 'Quantity', kind: 'block', fields };
}
