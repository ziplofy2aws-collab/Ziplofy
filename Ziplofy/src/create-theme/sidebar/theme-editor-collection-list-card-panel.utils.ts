import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { collectionListSidebarPathsFromNodeId } from '../utils/collection-list-sidebar.util';

export const COLLECTION_LIST_CARD_PANEL_GROUP_ORDER = ['Text', 'Appearance'] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LIST_CARD_PANEL_GROUP_ORDER);

const CARD_FIELD_KEYS = new Set([
  'placement',
  'horizontalAlignment',
  'verticalAlignment',
  'verticalGap',
  'inheritColorScheme',
  'borderStyle',
  'cornerRadius',
]);

const PLACEMENT_OPTIONS = [
  { value: 'on_image', label: 'On image' },
  { value: 'below_image', label: 'Below image' },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: 'flex-start', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Right' },
] as const;

const POSITION_OPTIONS = [
  { value: 'flex-start', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Bottom' },
] as const;

const BORDER_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
] as const;

export function isCollectionListCardBlockNodeId(nodeId: string): boolean {
  return /:block:collection_card$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    placement: 0,
    horizontalAlignment: 1,
    verticalAlignment: 2,
    verticalGap: 3,
    inheritColorScheme: 10,
    borderStyle: 11,
    cornerRadius: 12,
  };
  return rank[key] ?? 50;
}

export function collectionListCardDefaultSettings(): Record<string, string | number | boolean> {
  return {
    placement: 'on_image',
    horizontalAlignment: 'flex-start',
    verticalAlignment: 'flex-end',
    verticalGap: 8,
    inheritColorScheme: false,
    borderStyle: 'none',
    cornerRadius: 0,
  };
}

export const COLLECTION_LIST_CARD_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(collectionListCardDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function collectionListCardFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.collectionCard.${key}`;
  return [
    {
      path: s('placement'),
      type: 'select',
      label: 'Placement',
      group: 'Text',
      widget: 'select',
      sidebar: true,
      options: [...PLACEMENT_OPTIONS],
    },
    {
      path: s('horizontalAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Text',
      widget: 'segmented',
      sidebar: true,
      options: [...ALIGNMENT_OPTIONS],
    },
    {
      path: s('verticalAlignment'),
      type: 'select',
      label: 'Position',
      group: 'Text',
      widget: 'select',
      sidebar: true,
      options: [...POSITION_OPTIONS],
    },
    {
      path: s('verticalGap'),
      type: 'number',
      label: 'Vertical gap',
      group: 'Text',
      widget: 'slider',
      min: 0,
      max: 50,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('inheritColorScheme'),
      type: 'boolean',
      label: 'Inherit color scheme',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Borders',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [...BORDER_OPTIONS],
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function collectionListCardFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  return paths ? collectionListCardFieldDefs(paths.settingsBase) : [];
}

export function isCollectionListCardPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!CARD_FIELD_KEYS.has(key)) return false;
  if (!/\.settings\.collectionCard\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isCollectionListCardPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isCollectionListCardPanelField);
}

export function sortCollectionListCardPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { Text: 0, Appearance: 1 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupCollectionListCardPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isCollectionListCardPanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortCollectionListCardPanelFields(list));
  }
  return map;
}

export function prepareCollectionListCardSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionListCardPanelFields(
    (node.fields ?? []).filter(isCollectionListCardPanelField)
  );
  return { ...node, label: 'Collection card', kind: 'block', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendCollectionListCardBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = COLLECTION_LIST_CARD_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
