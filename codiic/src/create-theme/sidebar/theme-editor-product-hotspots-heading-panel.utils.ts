import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

export const PRODUCT_HOTSPOTS_HEADING_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(PRODUCT_HOTSPOTS_HEADING_PANEL_GROUP_ORDER);

const HEADING_FIELD_SORT: Record<string, number> = {
  heading: 0,
  headingWidth: 1,
  headingMaxWidth: 2,
  headingTypographyPreset: 10,
  headingFont: 11,
  headingFontSize: 12,
  headingLineHeight: 13,
  headingLetterSpacing: 14,
  headingTextCase: 15,
  headingWrap: 16,
  headingColor: 19,
  headingBackgroundEnabled: 20,
  headingPaddingTop: 30,
  headingPaddingBottom: 31,
  headingPaddingLeft: 32,
  headingPaddingRight: 33,
};

const HEADING_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'none', label: 'None' },
] as const;

const HEADING_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'custom', label: 'Custom' },
] as const;

const CUSTOM_TYPOGRAPHY_KEYS = new Set([
  'headingFont',
  'headingFontSize',
  'headingLineHeight',
  'headingLetterSpacing',
  'headingTextCase',
  'headingWrap',
]);

export type ParsedProductHotspotsHeadingField = {
  sectionBase: string;
  settingsBase: string;
};

function isProductHotspotsSectionInstanceId(sectionInstanceId: string): boolean {
  return /product_hotspots/i.test(sectionInstanceId);
}

export function parseProductHotspotsHeadingFieldNodeId(
  nodeId: string
): ParsedProductHotspotsHeadingField | null {
  if (!nodeId.startsWith('field:')) return null;
  const path = nodeId.slice('field:'.length);
  if (!path.endsWith('.settings.heading')) return null;

  const template = path.match(/^templates\.[^.]+\.sections\.[^.]+\.settings\.heading$/);
  if (template) {
    const settingsBase = path.replace(/\.heading$/, '');
    const sectionBase = settingsBase.replace(/\.settings$/, '');
    return { sectionBase, settingsBase };
  }

  const layout = path.match(/^sections\.[^.]+\.settings\.heading$/);
  if (layout) {
    const settingsBase = path.replace(/\.heading$/, '');
    const sectionBase = settingsBase.replace(/\.settings$/, '');
    return { sectionBase, settingsBase };
  }

  return null;
}

export function isProductHotspotsHeadingFieldNodeId(nodeId: string): boolean {
  const parsed = parseProductHotspotsHeadingFieldNodeId(nodeId);
  if (!parsed) return false;
  const secId = parsed.sectionBase.split('.').pop() ?? '';
  return isProductHotspotsSectionInstanceId(secId);
}

export function productHotspotsHeadingDefaultSettings(): Record<string, string | boolean | number> {
  return {
    heading: 'Shop the look',
    headingWidth: 'fit',
    headingMaxWidth: 'normal',
    headingTypographyPreset: 'heading-4',
    headingColor: 'default',
    headingBackgroundEnabled: false,
    headingPaddingTop: 0,
    headingPaddingBottom: 0,
    headingPaddingLeft: 0,
    headingPaddingRight: 0,
  };
}

export function productHotspotsHeadingFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('heading'),
      type: 'textarea',
      label: 'Text',
      group: 'Text',
      widget: 'richtext',
      sidebar: true,
    },
    {
      path: s('headingWidth'),
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
      path: s('headingMaxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('headingTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [...HEADING_PRESET_OPTIONS],
    },
    {
      path: s('headingFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('headingFontSize'),
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_FONT_SIZE_OPTIONS],
    },
    {
      path: s('headingLineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('headingLetterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('headingTextCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('headingWrap'),
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_WRAP_OPTIONS],
    },
    {
      path: s('headingColor'),
      type: 'select',
      label: 'Text color',
      group: 'Appearance',
      widget: 'default-color',
      sidebar: true,
    },
    {
      path: s('headingBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('headingPaddingTop'),
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
      path: s('headingPaddingBottom'),
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
      path: s('headingPaddingLeft'),
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
      path: s('headingPaddingRight'),
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

export function productHotspotsHeadingFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const parsed = parseProductHotspotsHeadingFieldNodeId(nodeId);
  if (!parsed) return [];
  return productHotspotsHeadingFieldDefs(parsed.settingsBase);
}

export function isProductHotspotsHeadingPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'heading' || key.startsWith('heading')) {
    return /\.settings\./.test(field.path);
  }
  return false;
}

export function isProductHotspotsHeadingPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('heading') && (keys.has('headingWidth') || keys.has('headingTypographyPreset'));
}

export function isProductHotspotsHeadingTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

export function filterProductHotspotsHeadingFieldsForPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('headingTypographyPreset'));
  if (!presetField || isProductHotspotsHeadingTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => !CUSTOM_TYPOGRAPHY_KEYS.has(f.path.split('.').pop() ?? ''));
}

export function groupProductHotspotsHeadingPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (HEADING_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (HEADING_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
  for (const field of sorted) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function prepareProductHotspotsHeadingSettingsNode(node: SidebarNode): SidebarNode {
  const fields = productHotspotsHeadingFieldDefsFromNodeId(node.id);
  return { ...node, label: 'Heading', kind: 'field', fields };
}

export function mergeProductHotspotsHeadingSettings(
  settings: Record<string, unknown>
): boolean {
  const defaults = productHotspotsHeadingDefaultSettings();
  let changed = false;
  for (const [key, value] of Object.entries(defaults)) {
    if (settings[key] === undefined) {
      settings[key] = value;
      changed = true;
    }
  }
  return changed;
}
