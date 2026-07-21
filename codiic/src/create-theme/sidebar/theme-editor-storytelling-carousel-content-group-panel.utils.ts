import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  isStorytellingCarouselContentGroupNodeId,
  isStorytellingCarouselSectionInstanceId,
  storytellingCarouselSectionBaseFromNodeId,
} from './theme-editor-storytelling-carousel-block-panel.utils';

export const STORYTELLING_CAROUSEL_CONTENT_GROUP_PANEL_GROUP_ORDER = [
  'Appearance',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_CAROUSEL_CONTENT_GROUP_PANEL_GROUP_ORDER);

const CONTENT_GROUP_KEYS = new Set([
  'backgroundColor',
  'cardHeight',
  'position',
  'borderStyle',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

function contentGroupBase(settingsBase: string): string {
  return `${settingsBase}.contentGroup`;
}

export function storytellingCarouselContentGroupDefaultSettings(): Record<
  string,
  string | number | boolean
> {
  return {
    backgroundColor: 'default',
    cardHeight: 'fit',
    position: 'top',
    borderStyle: 'none',
    cornerRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export const STORYTELLING_CAROUSEL_CONTENT_GROUP_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(storytellingCarouselContentGroupDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

export function storytellingCarouselContentGroupFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${contentGroupBase(settingsBase)}.${key}`;
  return [
    {
      path: s('backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('cardHeight'),
      type: 'select',
      label: 'Card height',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Appearance',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
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
      sidebar: true,
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
      sidebar: true,
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
      sidebar: true,
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
      sidebar: true,
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
      sidebar: true,
    },
  ];
}

export function storytellingCarouselContentGroupSettingsBaseFromNodeId(
  nodeId: string
): string | null {
  const sectionBase = storytellingCarouselSectionBaseFromNodeId(nodeId);
  return sectionBase ? `${sectionBase}.settings` : null;
}

export function storytellingCarouselContentGroupFieldDefsFromNodeId(
  nodeId: string
): EditorFieldDef[] {
  const settingsBase = storytellingCarouselContentGroupSettingsBaseFromNodeId(nodeId);
  return settingsBase ? storytellingCarouselContentGroupFieldDefs(settingsBase) : [];
}

export function pickStorytellingCarouselContentGroupField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    backgroundColor: 0,
    cardHeight: 1,
    position: 2,
    borderStyle: 10,
    cornerRadius: 11,
    paddingTop: 20,
    paddingBottom: 21,
    paddingLeft: 22,
    paddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isStorytellingCarouselContentGroupPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!CONTENT_GROUP_KEYS.has(key)) return false;
  if (!/\.settings\.contentGroup\./.test(field.path)) return false;
  if (!/storytelling_carousel/.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isStorytellingCarouselContentGroupPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('cardHeight') &&
    keys.has('backgroundColor') &&
    /\.settings\.contentGroup\./.test(path) &&
    /storytelling_carousel/.test(path)
  );
}

export function groupStorytellingCarouselContentGroupPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingCarouselContentGroupPanelField)) {
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

export function prepareStorytellingCarouselContentGroupSettingsNode(
  node: SidebarNode
): SidebarNode {
  const built = storytellingCarouselContentGroupFieldDefsFromNodeId(node.id);
  const fromNode = (node.fields ?? []).filter((f) => /\.settings\.contentGroup\./.test(f.path));
  const fields = built.length ? built : fromNode;
  return { ...node, label: 'Carousel content', kind: 'block', icon: 'group', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendStorytellingCarouselContentGroupValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = STORYTELLING_CAROUSEL_CONTENT_GROUP_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function seedStorytellingCarouselContentGroupInSettings(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const existing = settings.contentGroup;
  if (existing && typeof existing === 'object') {
    return {
      ...settings,
      contentGroup: {
        ...storytellingCarouselContentGroupDefaultSettings(),
        ...(existing as Record<string, unknown>),
      },
    };
  }
  return {
    ...settings,
    contentGroup: storytellingCarouselContentGroupDefaultSettings(),
  };
}

export function isStorytellingCarouselContentGroupBlockNodeId(nodeId: string): boolean {
  return isStorytellingCarouselContentGroupNodeId(nodeId);
}
