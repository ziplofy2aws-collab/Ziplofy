import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER = ['General', 'Padding'] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER);

const BUY_BUTTONS_FIELD_KEYS = new Set([
  'alwaysStackButtons',
  'showPickupAvailability',
  'giftCardForm',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

export function isFeaturedProductBuyButtonsBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:buy_buttons$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:buy_buttons$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details.blocks.buy_buttons`;
}

export function featuredProductBuyButtonsDefaultSettings(): Record<string, string | number | boolean> {
  return {
    alwaysStackButtons: false,
    showPickupAvailability: true,
    giftCardForm: true,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function featuredProductBuyButtonsFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('alwaysStackButtons'),
      type: 'boolean',
      label: 'Always stack buttons',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('showPickupAvailability'),
      type: 'boolean',
      label: 'Show pickup availability',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('giftCardForm'),
      type: 'boolean',
      label: 'Gift card form',
      group: 'General',
      sidebar: false,
      description:
        "Customers can send gift cards to a recipient's email with a personal message.",
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

export function featuredProductBuyButtonsFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductBuyButtonsFieldDefs(base) : [];
}

export function featuredProductBuyButtonsFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:buy_buttons$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const details = sec?.blocks?.find((b) => b.id === 'details');
  const buyButtons = details?.blocks?.find((b) => b.id === 'buy_buttons');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const schemaFields = buyButtons?.settingsFields ?? [];
  if (schemaFields.length) {
    return schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
  }
  return blocksBase ? featuredProductBuyButtonsFieldDefs(blocksBase) : [];
}

export const FEATURED_PRODUCT_BUY_BUTTONS_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(featuredProductBuyButtonsDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    alwaysStackButtons: 0,
    showPickupAvailability: 1,
    giftCardForm: 2,
    paddingTop: 10,
    paddingBottom: 11,
    paddingLeft: 12,
    paddingRight: 13,
  };
  return rank[key] ?? 50;
}

export function isFeaturedProductBuyButtonsPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!BUY_BUTTONS_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.details\.blocks\.buy_buttons\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductBuyButtonsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductBuyButtonsPanelField);
}

export function groupFeaturedProductBuyButtonsPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductBuyButtonsPanelField)) {
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

export function extendFeaturedProductBuyButtonsBlockValues(
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
    const fallback = FEATURED_PRODUCT_BUY_BUTTONS_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

export function prepareFeaturedProductBuyButtonsSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .filter(isFeaturedProductBuyButtonsPanelField)
    .sort((a, b) => {
      const ga = FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER.indexOf(
        (a.group ?? 'General') as (typeof FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER)[number]
      );
      const gb = FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER.indexOf(
        (b.group ?? 'General') as (typeof FEATURED_PRODUCT_BUY_BUTTONS_PANEL_GROUP_ORDER)[number]
      );
      if (ga !== gb) return ga - gb;
      return fieldSortKey(a.path) - fieldSortKey(b.path);
    });
  return { ...node, label: 'Buy buttons', kind: 'block', fields };
}
