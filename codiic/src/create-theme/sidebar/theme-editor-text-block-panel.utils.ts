import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-typography-options';
import {
  TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
  type TextBlockCustomTypographyKey,
} from './theme-editor-text-typography-keys';

export {
  TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
  type TextBlockCustomTypographyKey,
} from './theme-editor-text-typography-keys';

const TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEY_SET = new Set<string>(TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS);

const TEXT_BLOCK_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  ...HEADING_FONT_SIZE_OPTIONS,
];

type TextBlockTypographyFieldKey = TextBlockCustomTypographyKey;

const TEXT_BLOCK_TYPO_FIELD_FALLBACKS: Record<
  TextBlockTypographyFieldKey,
  Omit<EditorFieldDef, 'path'>
> = {
  font: {
    type: 'select',
    label: 'Font',
    group: 'Typography',
    widget: 'select',
    options: [...HEADING_FONT_OPTIONS],
  },
  fontSize: {
    type: 'select',
    label: 'Size',
    group: 'Typography',
    widget: 'select',
    options: [...TEXT_BLOCK_FONT_SIZE_OPTIONS],
  },
  lineHeight: {
    type: 'select',
    label: 'Line height',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_LINE_HEIGHT_OPTIONS],
  },
  letterSpacing: {
    type: 'select',
    label: 'Letter spacing',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_LETTER_SPACING_OPTIONS],
  },
  textCase: {
    type: 'select',
    label: 'Case',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_TEXT_CASE_OPTIONS],
  },
  wrap: {
    type: 'select',
    label: 'Wrap',
    group: 'Typography',
    widget: 'select',
    options: [...HEADING_WRAP_OPTIONS],
  },
};

export function isTextBlockTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

export function filterTextBlockPanelFieldsForTypographyPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('typographyPreset'));
  if (!presetField || isTextBlockTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return !TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEY_SET.has(key);
  });
}

export function resolveTextBlockTypographyField(
  key: TextBlockTypographyFieldKey,
  settingsBase: string,
  fields: EditorFieldDef[]
): EditorFieldDef {
  const fallback = TEXT_BLOCK_TYPO_FIELD_FALLBACKS[key];
  const fromSchema = fields.find((f) => f.path.endsWith(key));
  if (fromSchema) {
    return {
      ...fromSchema,
      label: fromSchema.label ?? fallback.label,
      group: fromSchema.group ?? fallback.group,
      widget: fromSchema.widget ?? fallback.widget,
      options:
        fromSchema.options && fromSchema.options.length ? fromSchema.options : fallback.options,
    };
  }
  return { ...fallback, path: `${settingsBase}.${key}` };
}

export const TEXT_BLOCK_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

export const TEXT_BLOCK_PANEL_GROUPS = new Set<string>(TEXT_BLOCK_PANEL_GROUP_ORDER);

export const TEXT_BLOCK_APPEARANCE_FIELD_ORDER = [
  'textColor',
  'backgroundEnabled',
  'backgroundColor',
  'cornerRadius',
] as const;

export const TEXT_BLOCK_SETTING_KEYS = new Set([
  'text',
  'width',
  'maxWidth',
  'alignment',
  'typographyPreset',
  ...TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS,
  'textColor',
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

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
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
    font: 'body',
    fontSize: 'default',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    textCase: 'default',
    wrap: 'pretty',
    textColor: 'default',
    backgroundEnabled: false,
    backgroundColor: '#00000026',
    cornerRadius: 0,
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
    font: 11,
    fontSize: 12,
    lineHeight: 13,
    letterSpacing: 14,
    textCase: 15,
    wrap: 16,
    textColor: 19,
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

export function inferTextBlockPanelGroup(key: string): string | undefined {
  if (key === 'text') return 'Text';
  if (key === 'width' || key === 'maxWidth' || key === 'alignment') return 'Layout';
  if (key === 'typographyPreset' || TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEY_SET.has(key)) {
    return 'Typography';
  }
  if (
    key === 'textColor' ||
    key === 'backgroundEnabled' ||
    key === 'backgroundColor' ||
    key === 'cornerRadius'
  ) {
    return 'Appearance';
  }
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
      path: s('font'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('fontSize'),
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...TEXT_BLOCK_FONT_SIZE_OPTIONS],
    },
    {
      path: s('lineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('letterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('textCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('wrap'),
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_WRAP_OPTIONS],
    },
    {
      path: s('textColor'),
      type: 'text',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
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

function resolveTextBlockPanelGroup(field: EditorFieldDef): string | undefined {
  const key = field.path.split('.').pop() ?? '';
  const inferred = inferTextBlockPanelGroup(key);
  if (inferred) return inferred;
  if (field.group && TEXT_BLOCK_PANEL_GROUPS.has(field.group)) return field.group;
  if (field.group === 'Content') return 'Text';
  return undefined;
}

export function isTextBlockPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!TEXT_BLOCK_SETTING_KEYS.has(key)) return false;
  if (!/\.settings\./.test(field.path)) return false;
  return Boolean(resolveTextBlockPanelGroup(field));
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
    const group = resolveTextBlockPanelGroup(field) ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push({ ...field, group });
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortTextBlockPanelFields(list));
  }
  return map;
}
