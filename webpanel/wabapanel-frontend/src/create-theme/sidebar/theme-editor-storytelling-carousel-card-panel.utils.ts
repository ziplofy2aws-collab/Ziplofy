import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  isStorytellingCarouselCardBlockNodeId,
  isStorytellingCarouselSectionInstanceId,
  storytellingCarouselSlideIdFromNodeId,
} from './theme-editor-storytelling-carousel-block-panel.utils';

export const STORYTELLING_CAROUSEL_CARD_PANEL_GROUP_ORDER = [
  'Layout',
  'Appearance',
  'Block link',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_CAROUSEL_CARD_PANEL_GROUP_ORDER);

const CARD_GROUP_KEYS = new Set([
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundImagePosition',
  'backgroundColor',
  'backgroundOverlay',
  'linkUrl',
  'openLinkInNewTab',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

function cardGroupBase(settingsBase: string): string {
  return `${settingsBase}.cardGroup`;
}

export function storytellingCarouselCardDefaultSettings(): Record<string, string | number | boolean> {
  return {
    direction: 'vertical',
    layoutAlignment: 'left',
    position: 'center',
    layoutGap: 12,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundImagePosition: 'cover',
    backgroundColor: 'default',
    backgroundOverlay: false,
    linkUrl: '',
    openLinkInNewTab: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export const STORYTELLING_CAROUSEL_CARD_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(storytellingCarouselCardDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

export function storytellingCarouselCardFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${cardGroupBase(settingsBase)}.${key}`;
  return [
    {
      path: s('direction'),
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    },
    {
      path: s('layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s('layoutGap'),
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('backgroundMedia'),
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    },
    {
      path: s('backgroundImageUrl'),
      type: 'text',
      label: 'Image',
      group: 'Appearance',
      widget: 'image',
      sidebar: true,
    },
    {
      path: s('backgroundImagePosition'),
      type: 'select',
      label: 'Image position',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
      ],
    },
    {
      path: s('backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('backgroundOverlay'),
      type: 'boolean',
      label: 'Media overlay',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('linkUrl'),
      type: 'text',
      label: 'Link',
      group: 'Block link',
      widget: 'link',
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('openLinkInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Block link',
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

export function storytellingCarouselCardSettingsBaseFromNodeId(nodeId: string): string | null {
  const slideId = storytellingCarouselSlideIdFromNodeId(nodeId);
  if (!slideId || !isStorytellingCarouselCardBlockNodeId(nodeId)) return null;

  const layout = nodeId.match(/^layout:(.+):block:content:nested:[^:]+$/);
  if (layout) {
    const secId = layout[1]!;
    if (!isStorytellingCarouselSectionInstanceId(secId)) return null;
    return `sections.${secId}.blocks.${slideId}.settings`;
  }

  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:content:nested:[^:]+$/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isStorytellingCarouselSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}.blocks.${slideId}.settings`;
  }

  return null;
}

export function storytellingCarouselCardFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const settingsBase = storytellingCarouselCardSettingsBaseFromNodeId(nodeId);
  return settingsBase ? storytellingCarouselCardFieldDefs(settingsBase) : [];
}

export function pickStorytellingCarouselCardField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    direction: 0,
    layoutAlignment: 1,
    position: 2,
    layoutGap: 3,
    backgroundMedia: 10,
    backgroundImageUrl: 11,
    backgroundImagePosition: 12,
    backgroundColor: 13,
    backgroundOverlay: 14,
    linkUrl: 20,
    openLinkInNewTab: 21,
    paddingTop: 30,
    paddingBottom: 31,
    paddingLeft: 32,
    paddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function isStorytellingCarouselCardPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!CARD_GROUP_KEYS.has(key)) return false;
  if (!/\.settings\.cardGroup\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isStorytellingCarouselCardPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('direction') && keys.has('layoutGap') && /\.settings\.cardGroup\./.test(path);
}

export function groupStorytellingCarouselCardPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingCarouselCardPanelField)) {
    const group = field.group ?? 'Layout';
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

export function prepareStorytellingCarouselCardSettingsNode(node: SidebarNode): SidebarNode {
  const built = storytellingCarouselCardFieldDefsFromNodeId(node.id);
  const fromNode = (node.fields ?? []).filter((f) => /\.settings\.cardGroup\./.test(f.path));
  const fields = built.length ? built : fromNode;
  return { ...node, label: 'Card', kind: 'block', icon: 'product-card', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendStorytellingCarouselCardValues(
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
    const fallback = STORYTELLING_CAROUSEL_CARD_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function seedStorytellingCarouselCardGroupInSettings(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const existing = settings.cardGroup;
  if (existing && typeof existing === 'object') {
    return {
      ...settings,
      cardGroup: {
        ...storytellingCarouselCardDefaultSettings(),
        ...(existing as Record<string, unknown>),
      },
    };
  }
  return {
    ...settings,
    cardGroup: storytellingCarouselCardDefaultSettings(),
  };
}
