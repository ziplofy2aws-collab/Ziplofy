import type { EditorFieldDef } from './create-theme-sidebar.types';

export const TEXT_BLOCK_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

export const TEXT_BLOCK_PANEL_GROUPS = new Set<string>(TEXT_BLOCK_PANEL_GROUP_ORDER);

export const TEXT_BLOCK_SETTING_KEYS = new Set([
  'text',
  'width',
  'maxWidth',
  'alignment',
  'typographyPreset',
  'backgroundEnabled',
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

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

export const TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'body', label: 'Body' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
] as const;

export function textBlockDefaultSettings(
  text = ''
): Record<string, string | number | boolean> {
  return {
    text,
    width: 'fill',
    maxWidth: 'normal',
    alignment: 'left',
    typographyPreset: 'default',
    backgroundEnabled: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    text: 0,
    width: 1,
    maxWidth: 2,
    alignment: 3,
    typographyPreset: 10,
    backgroundEnabled: 20,
    paddingTop: 30,
    paddingBottom: 31,
    paddingLeft: 32,
    paddingRight: 33,
  };
  return rank[key] ?? 50;
}

function assignTextBlockPanelGroup(key: string): string | undefined {
  if (key === 'text') return 'Text';
  if (key === 'width' || key === 'maxWidth' || key === 'alignment') return 'Layout';
  if (key === 'typographyPreset') return 'Typography';
  if (key === 'backgroundEnabled') return 'Appearance';
  if (key.startsWith('padding')) return 'Padding';
  return undefined;
}

export function textBlockFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('text'),
      type: 'textarea',
      label: 'Text',
      group: 'Text',
      widget: 'richtext',
      sidebar: true,
    },
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
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [...ALIGNMENT_OPTIONS],
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

export function isTextBlockPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!TEXT_BLOCK_SETTING_KEYS.has(key)) return false;
  if (field.group && !TEXT_BLOCK_PANEL_GROUPS.has(field.group)) return false;
  return /\.settings\./.test(field.path);
}

export function isTextBlockPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('text') && (keys.has('width') || keys.has('typographyPreset'));
}

export function sortTextBlockPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Text: 0,
    Layout: 1,
    Typography: 2,
    Appearance: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupTextBlockPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isTextBlockPanelField)) {
    const key = field.path.split('.').pop() ?? '';
    const group = field.group ?? assignTextBlockPanelGroup(key) ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push({ ...field, group });
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortTextBlockPanelFields(list));
  }
  return map;
}
