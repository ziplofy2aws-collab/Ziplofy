import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

export const TEXT_MARQUEE_PANEL_GROUP_ORDER = [
  'Layout',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(TEXT_MARQUEE_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  motionDirection: 0,
  colorScheme: 10,
  paddingTop: 20,
  paddingBottom: 21,
  layoutGap: 22,
  customCss: 30,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isTextMarqueeSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'text-marquee' || catalogVariant === 'text-marquee';
}

export function isTextMarqueePanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  const key = field.path.split('.').pop() ?? '';
  // `mq*` keys belong to the nested Text block panel, not the section panel.
  if (key.startsWith('mq')) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortTextMarqueePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Appearance: 1,
    Padding: 2,
    'Custom CSS': 3,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupTextMarqueePanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isTextMarqueeSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('motionDirection') && keys.has('text') && !keys.has('quote') && !keys.has('heading');
}

export function prepareTextMarqueeSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortTextMarqueePanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isTextMarqueePanelField)
  );
  return { ...node, label: 'Marquee', kind: 'section', fields };
}

/* -------------------------------------------------------------------------- */
/* Marquee → nested "Text" block: full text-block panel (Text → Layout →       */
/* Typography → Appearance → Padding). Style keys are `mq`-prefixed so they     */
/* never collide with the section-level settings (paddingTop/paddingBottom).    */
/* -------------------------------------------------------------------------- */

export const MARQUEE_TEXT_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const MARQUEE_TEXT_PANEL_GROUPS = new Set<string>(MARQUEE_TEXT_PANEL_GROUP_ORDER);

export const MARQUEE_TEXT_CUSTOM_TYPOGRAPHY_KEYS = [
  'mqFont',
  'mqFontSize',
  'mqLineHeight',
  'mqLetterSpacing',
  'mqTextCase',
  'mqWrap',
] as const;

const MARQUEE_TEXT_CUSTOM_TYPOGRAPHY_KEY_SET = new Set<string>(MARQUEE_TEXT_CUSTOM_TYPOGRAPHY_KEYS);

const MARQUEE_TEXT_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

const MARQUEE_TEXT_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'body', label: 'Body' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'custom', label: 'Custom' },
] as const;

const MARQUEE_TEXT_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  ...HEADING_FONT_SIZE_OPTIONS,
];

const MARQUEE_TEXT_FIELD_SORT: Record<string, number> = {
  text: 0,
  mqWidth: 1,
  mqMaxWidth: 2,
  mqTypographyPreset: 10,
  mqFont: 11,
  mqFontSize: 12,
  mqLineHeight: 13,
  mqLetterSpacing: 14,
  mqTextCase: 15,
  mqWrap: 16,
  mqColor: 19,
  mqBackgroundEnabled: 20,
  mqBackgroundColor: 21,
  mqCornerRadius: 22,
  mqPaddingTop: 30,
  mqPaddingBottom: 31,
  mqPaddingLeft: 32,
  mqPaddingRight: 33,
};

export function marqueeTextBlockFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
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
      path: s('mqWidth'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'fill', label: 'Fill' },
      ],
    },
    {
      path: s('mqMaxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [...MARQUEE_TEXT_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('mqTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [...MARQUEE_TEXT_PRESET_OPTIONS],
    },
    {
      path: s('mqFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('mqFontSize'),
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...MARQUEE_TEXT_FONT_SIZE_OPTIONS],
    },
    {
      path: s('mqLineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('mqLetterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('mqTextCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('mqWrap'),
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_WRAP_OPTIONS],
    },
    {
      path: s('mqColor'),
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('mqBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('mqBackgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('mqCornerRadius'),
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
      path: s('mqPaddingTop'),
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
      path: s('mqPaddingBottom'),
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
      path: s('mqPaddingLeft'),
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
      path: s('mqPaddingRight'),
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

export function isMarqueeTextTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

export function filterMarqueeTextFieldsForPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('mqTypographyPreset'));
  if (!presetField || isMarqueeTextTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return !MARQUEE_TEXT_CUSTOM_TYPOGRAPHY_KEY_SET.has(key);
  });
}

export function sortMarqueeTextPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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
    return (
      (MARQUEE_TEXT_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (MARQUEE_TEXT_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
    );
  });
}

export function groupMarqueeTextPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && MARQUEE_TEXT_PANEL_GROUPS.has(field.group) ? field.group : 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}
