import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  isStorytellingCarouselHeaderGroupNodeId,
  storytellingCarouselSectionBaseFromNodeId,
} from './theme-editor-storytelling-carousel-block-panel.utils';

export const STORYTELLING_CAROUSEL_HEADER_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Block link',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_CAROUSEL_HEADER_PANEL_GROUP_ORDER);

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
] as const;

const LAYOUT_ALIGNMENT_OPTIONS = [
  { value: 'space-between', label: 'Space between' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-around', label: 'Space around' },
] as const;

const HEADER_GROUP_KEYS = new Set([
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'alignTextBaseline',
  'layoutGap',
  'width',
  'customWidth',
  'mobileWidth',
  'mobileCustomWidth',
  'height',
  'customHeight',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundImagePosition',
  'backgroundColor',
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'cornerRadius',
  'backgroundOverlay',
  'linkUrl',
  'openLinkInNewTab',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

function headerGroupBase(settingsBase: string): string {
  return `${settingsBase}.headerGroup`;
}

export function storytellingCarouselHeaderGroupDefaultSettings(): Record<
  string,
  string | number | boolean
> {
  return {
    direction: 'horizontal',
    verticalOnMobile: false,
    layoutAlignment: 'space-between',
    position: 'bottom',
    alignTextBaseline: true,
    layoutGap: 12,
    width: 'fill',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    customHeight: 100,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundImagePosition: 'cover',
    backgroundColor: 'default',
    borderStyle: 'none',
    borderThickness: 1,
    borderOpacity: 100,
    cornerRadius: 0,
    backgroundOverlay: false,
    linkUrl: '',
    openLinkInNewTab: false,
    paddingTop: 0,
    paddingBottom: 16,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export const STORYTELLING_CAROUSEL_HEADER_GROUP_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(storytellingCarouselHeaderGroupDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

export function storytellingCarouselHeaderFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${headerGroupBase(settingsBase)}.${key}`;
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
      path: s('verticalOnMobile'),
      type: 'boolean',
      label: 'Vertical on mobile',
      group: 'Layout',
      sidebar: true,
    },
    {
      path: s('layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [...LAYOUT_ALIGNMENT_OPTIONS],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s('alignTextBaseline'),
      type: 'boolean',
      label: 'Align text baseline',
      group: 'Layout',
      sidebar: true,
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
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('mobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('height'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('backgroundMedia'),
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select',
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
      placeholder: 'https://…',
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
        { value: 'fit', label: 'Fit' },
      ],
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
      path: s('backgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: true,
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
      path: s('borderThickness'),
      type: 'number',
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('borderOpacity'),
      type: 'number',
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
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

export function storytellingCarouselHeaderCustomSizeFieldDefs(
  settingsBase: string
): EditorFieldDef[] {
  const s = (key: string) => `${headerGroupBase(settingsBase)}.${key}`;
  const slider = (path: string, label: string): EditorFieldDef => ({
    path,
    type: 'number',
    label,
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: true,
  });
  return [
    slider(s('customWidth'), 'Custom width'),
    slider(s('mobileCustomWidth'), 'Custom width'),
    slider(s('customHeight'), 'Custom height'),
  ];
}

export function storytellingCarouselHeaderSettingsBaseFromNodeId(
  nodeId: string
): string | null {
  const sectionBase = storytellingCarouselSectionBaseFromNodeId(nodeId);
  if (!sectionBase) return null;
  if (!isStorytellingCarouselHeaderGroupNodeId(nodeId)) return null;
  return `${sectionBase}.settings`;
}

export function storytellingCarouselHeaderFieldDefsFromNodeId(
  nodeId: string
): EditorFieldDef[] {
  const settingsBase = storytellingCarouselHeaderSettingsBaseFromNodeId(nodeId);
  if (!settingsBase) return [];
  return [
    ...storytellingCarouselHeaderFieldDefs(settingsBase),
    ...storytellingCarouselHeaderCustomSizeFieldDefs(settingsBase),
  ];
}

export function pickStorytellingCarouselHeaderField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function resolvePercentSliderField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: string,
  label: string
): EditorFieldDef | null {
  const existing = pickStorytellingCarouselHeaderField(fields, key);
  if (existing) {
    return {
      ...existing,
      label,
      type: 'number',
      widget: 'slider',
      min: existing.min ?? 1,
      max: existing.max ?? 100,
      step: existing.step ?? 1,
      unit: existing.unit ?? '%',
      group: 'Size',
    };
  }
  if (!anchor) return null;
  const base = anchor.path.replace(/\.(width|mobileWidth|height)$/, '');
  return {
    path: `${base}.${key}`,
    label,
    type: 'number',
    group: 'Size',
    widget: 'slider',
    min: 1,
    max: 100,
    step: 1,
    unit: '%',
    sidebar: true,
  };
}

export function resolveStorytellingCarouselHeaderCustomWidthField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: 'customWidth' | 'mobileCustomWidth'
): EditorFieldDef | null {
  return resolvePercentSliderField(fields, anchor, key, 'Custom width');
}

export function resolveStorytellingCarouselHeaderCustomHeightField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined
): EditorFieldDef | null {
  return resolvePercentSliderField(fields, anchor, 'customHeight', 'Custom height');
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    direction: 0,
    verticalOnMobile: 1,
    layoutAlignment: 2,
    position: 3,
    alignTextBaseline: 4,
    layoutGap: 5,
    width: 10,
    mobileWidth: 11,
    height: 12,
    backgroundMedia: 20,
    backgroundImageUrl: 21,
    backgroundImagePosition: 22,
    backgroundColor: 23,
    backgroundOverlay: 24,
    borderStyle: 30,
    borderThickness: 31,
    borderOpacity: 32,
    cornerRadius: 33,
    linkUrl: 40,
    openLinkInNewTab: 41,
    paddingTop: 50,
    paddingBottom: 51,
    paddingLeft: 52,
    paddingRight: 53,
  };
  return rank[key] ?? 50;
}

export function isStorytellingCarouselHeaderGroupPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!HEADER_GROUP_KEYS.has(key)) return false;
  if (!/\.settings\.headerGroup\./.test(field.path)) return false;
  if (!/storytelling_carousel/.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isStorytellingCarouselHeaderGroupPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('direction') &&
    keys.has('layoutGap') &&
    /\.settings\.headerGroup\./.test(path) &&
    /storytelling_carousel/.test(path)
  );
}

export function groupStorytellingCarouselHeaderPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingCarouselHeaderGroupPanelField)) {
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

export function prepareStorytellingCarouselHeaderGroupSettingsNode(node: SidebarNode): SidebarNode {
  const built = storytellingCarouselHeaderFieldDefsFromNodeId(node.id);
  const fromNode = (node.fields ?? []).filter((f) => /\.settings\.headerGroup\./.test(f.path));
  const byKey = new Map<string, EditorFieldDef>();
  for (const field of [...fromNode, ...built]) {
    byKey.set(field.path.split('.').pop() ?? field.path, field);
  }
  const fields = built.length ? built : [...byKey.values()];
  return { ...node, label: 'Header', kind: 'block', icon: 'group', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendStorytellingCarouselHeaderGroupValues(
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
    const fallback = STORYTELLING_CAROUSEL_HEADER_GROUP_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function seedStorytellingCarouselHeaderGroupInSettings(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const existing = settings.headerGroup;
  if (existing && typeof existing === 'object') {
    return {
      ...settings,
      headerGroup: {
        ...storytellingCarouselHeaderGroupDefaultSettings(),
        ...(existing as Record<string, unknown>),
      },
    };
  }
  return {
    ...settings,
    headerGroup: storytellingCarouselHeaderGroupDefaultSettings(),
  };
}

export function isStorytellingCarouselHeaderGroupBlockNodeId(nodeId: string): boolean {
  return isStorytellingCarouselHeaderGroupNodeId(nodeId);
}
