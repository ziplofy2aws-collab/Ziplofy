import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_ADD_TO_CART_PANEL_GROUP_ORDER = ['Appearance'] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_ADD_TO_CART_PANEL_GROUP_ORDER);

const ADD_TO_CART_FIELD_KEYS = new Set(['style']);

const STYLE_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
] as const;

export function isFeaturedProductAddToCartNestedNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:buy_buttons:nested:add_to_cart$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:buy_buttons:nested:add_to_cart$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details.blocks.buy_buttons.blocks.add_to_cart`;
}

export function featuredProductAddToCartDefaultSettings(): Record<string, string> {
  return {
    buttonLabel: 'Sold out',
    style: 'secondary',
  };
}

export function featuredProductAddToCartFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('style'),
      type: 'select',
      label: 'Style',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: false,
      options: [...STYLE_OPTIONS],
    },
  ];
}

export function featuredProductAddToCartFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductAddToCartFieldDefs(base) : [];
}

export function featuredProductAddToCartFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:buy_buttons:nested:add_to_cart$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const details = sec?.blocks?.find((b) => b.id === 'details');
  const buyButtons = details?.blocks?.find((b) => b.id === 'buy_buttons');
  const addToCart = buyButtons?.blocks?.find((b) => b.id === 'add_to_cart');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const schemaFields = addToCart?.settingsFields ?? [];
  if (schemaFields.length) {
    return schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
  }
  return blocksBase ? featuredProductAddToCartFieldDefs(blocksBase) : [];
}

export const FEATURED_PRODUCT_ADD_TO_CART_DEFAULTS: Record<string, string> =
  featuredProductAddToCartDefaultSettings();

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  return key === 'style' ? 0 : 50;
}

export function isFeaturedProductAddToCartPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!ADD_TO_CART_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.details\.blocks\.buy_buttons\.blocks\.add_to_cart\.settings\./.test(field.path)) {
    return false;
  }
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductAddToCartPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductAddToCartPanelField);
}

export function groupFeaturedProductAddToCartPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductAddToCartPanelField)) {
    const group = field.group ?? 'Appearance';
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

export function extendFeaturedProductAddToCartBlockValues(
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
    const fallback = FEATURED_PRODUCT_ADD_TO_CART_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

export function prepareFeaturedProductAddToCartSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .filter(isFeaturedProductAddToCartPanelField)
    .sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path));
  return { ...node, label: 'Add to cart', kind: 'block', fields };
}
