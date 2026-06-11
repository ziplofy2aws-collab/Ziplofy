import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { collectionListSidebarPathsFromNodeId } from '../utils/collection-list-sidebar.util';
import { TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS } from './theme-editor-text-block-panel.utils';

export const COLLECTION_LIST_CARD_TITLE_PANEL_GROUP_ORDER = [
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LIST_CARD_TITLE_PANEL_GROUP_ORDER);

const TITLE_FIELD_KEYS = new Set([
  'width',
  'maxWidth',
  'typographyPreset',
  'backgroundEnabled',
  'backgroundColor',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

const FIT_FILL = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

const MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

export function isCollectionListCardTitleNestedNodeId(nodeId: string): boolean {
  return /:block:collection_card:nested:collection_title$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    width: 0,
    maxWidth: 1,
    typographyPreset: 10,
    backgroundEnabled: 20,
    backgroundColor: 21,
    cornerRadius: 22,
    paddingTop: 30,
    paddingBottom: 31,
    paddingLeft: 32,
    paddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function collectionListCardTitleDefaultSettings(): Record<string, string | number | boolean> {
  return {
    width: 'fit',
    maxWidth: 'normal',
    typographyPreset: 'default',
    backgroundEnabled: true,
    backgroundColor: '#FFFFFF',
    cornerRadius: 0,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
  };
}

export const COLLECTION_LIST_CARD_TITLE_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(collectionListCardTitleDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function collectionListCardTitleFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.collectionCardTitle.${key}`;
  return [
    {
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [...FIT_FILL],
    },
    {
      path: s('maxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [...MAX_WIDTH_OPTIONS],
    },
    {
      path: s('typographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      description: 'Edit presets in theme settings',
      options: [...TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS],
    },
    {
      path: s('backgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('backgroundColor'),
      type: 'text',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 50,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function collectionListCardTitleFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  return paths ? collectionListCardTitleFieldDefs(paths.settingsBase) : [];
}

export function isCollectionListCardTitlePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!TITLE_FIELD_KEYS.has(key)) return false;
  if (!/\.settings\.collectionCardTitle\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isCollectionListCardTitlePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isCollectionListCardTitlePanelField);
}

export function sortCollectionListCardTitlePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupCollectionListCardTitlePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isCollectionListCardTitlePanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortCollectionListCardTitlePanelFields(list));
  }
  return map;
}

export function prepareCollectionListCardTitleSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionListCardTitlePanelFields(
    (node.fields ?? []).filter(isCollectionListCardTitlePanelField)
  );
  return { ...node, label: 'Collection title', kind: 'block', icon: 'title', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendCollectionListCardTitleBlockValues(
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
    const fallback = COLLECTION_LIST_CARD_TITLE_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
