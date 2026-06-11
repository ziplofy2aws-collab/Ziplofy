import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { collectionListSidebarPathsFromNodeId } from '../utils/collection-list-sidebar.util';

export const COLLECTION_LIST_CARD_IMAGE_PANEL_GROUP_ORDER = ['General', 'Borders'] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_LIST_CARD_IMAGE_PANEL_GROUP_ORDER);

const IMAGE_FIELD_KEYS = new Set([
  'imageRatio',
  'mediaOverlay',
  'borderStyle',
  'cornerRadius',
]);

const ASPECT_RATIO_OPTIONS = [
  { value: 'adapt', label: 'Auto' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'square', label: 'Square' },
  { value: 'landscape', label: 'Landscape' },
] as const;

const BORDER_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
] as const;

export function isCollectionListCardImageNestedNodeId(nodeId: string): boolean {
  return /:block:collection_card:nested:card_image$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    imageRatio: 0,
    mediaOverlay: 1,
    borderStyle: 10,
    cornerRadius: 11,
  };
  return rank[key] ?? 50;
}

export function collectionListCardImageDefaultSettings(): Record<string, string | number | boolean> {
  return {
    imageRatio: 'adapt',
    mediaOverlay: false,
    borderStyle: 'none',
    cornerRadius: 0,
  };
}

export const COLLECTION_LIST_CARD_IMAGE_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(collectionListCardImageDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function collectionListCardImageFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.collectionCardImage.${key}`;
  return [
    {
      path: s('imageRatio'),
      type: 'select',
      label: 'Aspect ratio',
      group: 'General',
      widget: 'select',
      sidebar: true,
      description: 'Adjusted in some layouts',
      options: [...ASPECT_RATIO_OPTIONS],
    },
    {
      path: s('mediaOverlay'),
      type: 'boolean',
      label: 'Media overlay',
      group: 'General',
      sidebar: true,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
      options: [...BORDER_OPTIONS],
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function collectionListCardImageFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  return paths ? collectionListCardImageFieldDefs(paths.settingsBase) : [];
}

export function isCollectionListCardImagePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!IMAGE_FIELD_KEYS.has(key)) return false;
  if (!/\.settings\.collectionCardImage\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isCollectionListCardImagePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isCollectionListCardImagePanelField);
}

export function sortCollectionListCardImagePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Borders: 1 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupCollectionListCardImagePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isCollectionListCardImagePanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortCollectionListCardImagePanelFields(list));
  }
  return map;
}

export function prepareCollectionListCardImageSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionListCardImagePanelFields(
    (node.fields ?? []).filter(isCollectionListCardImagePanelField)
  );
  return { ...node, label: 'Image', kind: 'block', icon: 'image', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendCollectionListCardImageBlockValues(
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
    const fallback = COLLECTION_LIST_CARD_IMAGE_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
