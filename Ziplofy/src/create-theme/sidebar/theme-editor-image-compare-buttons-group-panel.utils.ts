import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  imageCompareSectionBaseFromNodeId,
  isImageCompareButtonsGroupNodeId,
} from './theme-editor-image-compare-block-panel.utils';

export const IMAGE_COMPARE_BUTTONS_GROUP_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Block link',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(IMAGE_COMPARE_BUTTONS_GROUP_PANEL_GROUP_ORDER);

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
] as const;

const LAYOUT_ALIGNMENT_OPTIONS = [
  { value: 'flex-start', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Right' },
] as const;

export const IMAGE_COMPARE_BUTTONS_GROUP_FIELD_KEYS = new Set([
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
  'width',
  'customWidth',
  'mobileWidth',
  'mobileCustomWidth',
  'height',
  'customHeight',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundColor',
  'backgroundOverlay',
  'borderStyle',
  'cornerRadius',
  'linkUrl',
  'openLinkInNewTab',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

function buttonsGroupBase(settingsBase: string): string {
  return `${settingsBase}.buttonsGroup`;
}

export function imageCompareButtonsGroupDefaultSettings(): Record<string, string | number | boolean> {
  return {
    direction: 'horizontal',
    verticalOnMobile: false,
    layoutAlignment: 'center',
    position: 'center',
    layoutGap: 12,
    width: 'fill',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    customHeight: 100,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundColor: 'default',
    backgroundOverlay: false,
    borderStyle: 'none',
    cornerRadius: 0,
    linkUrl: '',
    openLinkInNewTab: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export function imageCompareButtonsGroupFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${buttonsGroupBase(settingsBase)}.${key}`;
  return [
    {
      path: s('direction'),
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
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
      sidebar: false,
    },
    {
      path: s('layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [...LAYOUT_ALIGNMENT_OPTIONS],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select',
      sidebar: false,
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
      sidebar: false,
    },
    {
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('mobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('height'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL_CUSTOM],
    },
    {
      path: s('backgroundMedia'),
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select',
      sidebar: false,
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
      sidebar: false,
    },
    {
      path: s('backgroundColor'),
      type: 'text',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('backgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: false,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: false,
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
      sidebar: false,
    },
    {
      path: s('linkUrl'),
      type: 'text',
      label: 'Link',
      group: 'Block link',
      widget: 'link',
      sidebar: false,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('openLinkInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Block link',
      sidebar: false,
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

export function imageCompareButtonsGroupCustomSizeFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${buttonsGroupBase(settingsBase)}.${key}`;
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
    sidebar: false,
  });
  return [
    slider(s('customWidth'), 'Custom width'),
    slider(s('mobileCustomWidth'), 'Custom width'),
    slider(s('customHeight'), 'Custom height'),
  ];
}

export function imageCompareButtonsGroupFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = imageCompareSectionBaseFromNodeId(nodeId);
  if (!sectionBase) return [];
  return [
    ...imageCompareButtonsGroupFieldDefs(sectionBase),
    ...imageCompareButtonsGroupCustomSizeFieldDefs(sectionBase),
  ];
}

export function pickImageCompareButtonsGroupField(
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
  const existing = pickImageCompareButtonsGroupField(fields, key);
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
    sidebar: false,
  };
}

export function resolveImageCompareButtonsGroupCustomWidthField(
  fields: EditorFieldDef[],
  anchor: EditorFieldDef | undefined,
  key: 'customWidth' | 'mobileCustomWidth'
): EditorFieldDef | null {
  return resolvePercentSliderField(fields, anchor, key, 'Custom width');
}

export function resolveImageCompareButtonsGroupCustomHeightField(
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
    layoutGap: 4,
    width: 10,
    mobileWidth: 11,
    height: 12,
    backgroundMedia: 20,
    backgroundImageUrl: 21,
    backgroundColor: 22,
    backgroundOverlay: 23,
    borderStyle: 30,
    cornerRadius: 31,
    linkUrl: 40,
    openLinkInNewTab: 41,
    paddingTop: 50,
    paddingBottom: 51,
    paddingLeft: 52,
    paddingRight: 53,
  };
  return rank[key] ?? 50;
}

export function isImageCompareButtonsGroupPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!IMAGE_COMPARE_BUTTONS_GROUP_FIELD_KEYS.has(key)) return false;
  if (!/\.settings\.buttonsGroup\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isImageCompareButtonsGroupPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isImageCompareButtonsGroupPanelField);
}

export function groupImageCompareButtonsGroupPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isImageCompareButtonsGroupPanelField)) {
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

export function prepareImageCompareButtonsGroupSettingsNode(node: SidebarNode): SidebarNode {
  const built = imageCompareButtonsGroupFieldDefsFromNodeId(node.id);
  const fromNode = (node.fields ?? []).filter((f) => /\.settings\.buttonsGroup\./.test(f.path));
  const byKey = new Map<string, EditorFieldDef>();
  for (const field of [...fromNode, ...built]) {
    byKey.set(field.path.split('.').pop() ?? field.path, field);
  }
  const fields = built.length ? built : [...byKey.values()];
  return { ...node, label: 'Buttons', kind: 'block', fields };
}

export const IMAGE_COMPARE_BUTTONS_GROUP_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(imageCompareButtonsGroupDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendImageCompareButtonsGroupValues(
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
    const fallback = IMAGE_COMPARE_BUTTONS_GROUP_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function isImageCompareButtonsGroupBlockNodeId(nodeId: string): boolean {
  return isImageCompareButtonsGroupNodeId(nodeId);
}
