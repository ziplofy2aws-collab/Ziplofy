import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

export const COMPARISON_SLIDER_PANEL_GROUP_ORDER = [
  'Media',
  'Size',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(COMPARISON_SLIDER_PANEL_GROUP_ORDER);

export const COMPARISON_SLIDER_FIELD_KEYS = new Set([
  'imageBeforeUrl',
  'imageAfterUrl',
  'sliderDirection',
  'sliderTextOnImages',
  'sliderAspectRatio',
  'sliderDesktopWidth',
  'sliderDesktopCustomWidth',
  'sliderMobileWidth',
  'sliderMobileCustomWidth',
  'sliderColor',
  'sliderInnerColor',
  'sliderBorderStyle',
  'sliderCornerRadius',
  'sliderPaddingTop',
  'sliderPaddingBottom',
  'sliderPaddingLeft',
  'sliderPaddingRight',
]);

const FIELD_SORT: Record<string, number> = {
  imageBeforeUrl: 0,
  imageAfterUrl: 1,
  sliderDirection: 2,
  sliderTextOnImages: 3,
  sliderAspectRatio: 10,
  sliderDesktopWidth: 11,
  sliderDesktopCustomWidth: 12,
  sliderMobileWidth: 13,
  sliderMobileCustomWidth: 14,
  sliderColor: 20,
  sliderInnerColor: 21,
  sliderBorderStyle: 22,
  sliderCornerRadius: 23,
  sliderPaddingTop: 30,
  sliderPaddingBottom: 31,
  sliderPaddingLeft: 32,
  sliderPaddingRight: 33,
};

export function isImageCompareSliderBlockNodeId(nodeId: string): boolean {
  return /:block:comparison_slider$/.test(nodeId);
}

export function comparisonSliderDefaultSettings(): Record<string, string | number | boolean> {
  return {
    imageBeforeUrl: '',
    imageAfterUrl: '',
    sliderDirection: 'horizontal',
    sliderTextOnImages: false,
    sliderAspectRatio: 'landscape',
    sliderDesktopWidth: 'custom',
    sliderDesktopCustomWidth: 65,
    sliderMobileWidth: 'fill',
    sliderMobileCustomWidth: 100,
    sliderColor: 'default',
    sliderInnerColor: 'default',
    sliderBorderStyle: 'none',
    sliderCornerRadius: 0,
    sliderPaddingTop: 0,
    sliderPaddingBottom: 0,
    sliderPaddingLeft: 0,
    sliderPaddingRight: 0,
  };
}

export function comparisonSliderBlockFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    {
      path: s('imageBeforeUrl'),
      type: 'text',
      label: 'Image 1',
      widget: 'image',
      group: 'Media',
      sidebar: true,
    },
    {
      path: s('imageAfterUrl'),
      type: 'text',
      label: 'Image 2',
      widget: 'image',
      group: 'Media',
      sidebar: true,
    },
    {
      path: s('sliderDirection'),
      type: 'select',
      label: 'Direction',
      group: 'Media',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
    },
    {
      path: s('sliderTextOnImages'),
      type: 'boolean',
      label: 'Text on images',
      group: 'Media',
      sidebar: true,
    },
    {
      path: s('sliderAspectRatio'),
      type: 'select',
      label: 'Aspect ratio',
      group: 'Size',
      widget: 'select',
      sidebar: true,
      options: [
        { value: 'landscape', label: 'Landscape' },
        { value: 'portrait', label: 'Portrait' },
        { value: 'square', label: 'Square' },
        { value: 'adapt', label: 'Adapt to image' },
      ],
    },
    {
      path: s('sliderDesktopWidth'),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('sliderDesktopCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 20,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('sliderMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('sliderMobileCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 20,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('sliderColor'),
      type: 'text',
      label: 'Slider color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('sliderInnerColor'),
      type: 'text',
      label: 'Slider inner color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('sliderBorderStyle'),
      type: 'select',
      label: 'Border',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('sliderCornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('sliderPaddingTop'),
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
      path: s('sliderPaddingBottom'),
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
      path: s('sliderPaddingLeft'),
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
      path: s('sliderPaddingRight'),
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

export function comparisonSliderBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const layout = nodeId.match(/^layout:([^:]+):block:comparison_slider$/);
  if (layout) {
    return comparisonSliderBlockFieldDefs(`sections.${layout[1]}`);
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:comparison_slider$/);
  if (tpl) {
    return comparisonSliderBlockFieldDefs(`templates.${tpl[1]}.sections.${tpl[2]}`);
  }
  return [];
}

export const COMPARISON_SLIDER_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(comparisonSliderDefaultSettings()).map(([k, v]) => [
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

export function extendComparisonSliderBlockValues(
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
    const fallback = COMPARISON_SLIDER_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function isImageCompareSliderBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/image_compare/.test(field.path) || field.path.includes('.blocks.')) return false;
  return COMPARISON_SLIDER_FIELD_KEYS.has(key);
}

export function isImageCompareSliderBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('imageBeforeUrl') && keys.has('sliderAspectRatio') && path.includes('image_compare');
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function sortComparisonSliderPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Media: 0,
    Size: 1,
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

export function groupComparisonSliderPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Media';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function pickComparisonSliderField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

export function prepareComparisonSliderBlockSettingsNode(node: SidebarNode): SidebarNode {
  const built = comparisonSliderBlockFieldDefsFromNodeId(node.id);
  const fields = sortComparisonSliderPanelFields(
    built.length > 0 ? built : (node.fields ?? []).filter(isImageCompareSliderBlockField)
  );
  return { ...node, label: 'Comparison slider', kind: 'block', fields };
}
