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

export const MULTICOLUMN_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(MULTICOLUMN_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  layoutGap: 4,
  sectionWidth: 10,
  height: 11,
  colorScheme: 20,
  backgroundMedia: 21,
  backgroundImageUrl: 22,
  backgroundColor: 23,
  backgroundOverlay: 24,
  borderStyle: 26,
  cornerRadius: 27,
  paddingTop: 30,
  paddingBottom: 31,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isMulticolumnSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'multicolumn' || catalogVariant === 'multicolumn';
}

export function isMulticolumnPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function isMulticolumnBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'heading' || key === 'text';
}

export function isMulticolumnBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isMulticolumnBlockField) && !fields.some((f) => f.path.endsWith('.icon'));
}

export function sortMulticolumnPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupMulticolumnPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isMulticolumnSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('icon') || keys.has('openFirstItem') || keys.has('caption') || keys.has('videoUrl')) {
    return false;
  }
  const path = fields[0]?.path ?? '';
  return (
    keys.has('verticalOnMobile') &&
    keys.has('direction') &&
    keys.has('layoutGap') &&
    path.includes('multicolumn')
  );
}

export function multicolumnBlocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^(template:[^:]+:[^:]+|layout:[^:]+):block:[^:]+$/);
  if (!m) return null;
  const prefix = m[1];
  if (prefix.startsWith('template:')) {
    const [, tplId, secId] = prefix.split(':');
    return `templates.${tplId}.sections.${secId}`;
  }
  const secId = prefix.replace(/^layout:/, '');
  return `sections.${secId}`;
}

export function multicolumnBlockInstanceIdFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/:block:([^:]+)$/);
  return m?.[1] ?? null;
}

export function isMulticolumnBlockNodeId(nodeId: string): boolean {
  return /:block:column_/.test(nodeId);
}

export function multicolumnBlockFieldDefs(
  blocksBase: string,
  blockInstanceId: string
): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.blocks.${blockInstanceId}.settings.${key}`;
  return [
    {
      path: s('heading'),
      type: 'text',
      label: 'Heading',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('text'),
      type: 'textarea',
      label: 'Description',
      group: 'Content',
      sidebar: true,
    },
  ];
}

export function multicolumnBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = multicolumnBlocksBaseFromNodeId(nodeId);
  const blockId = multicolumnBlockInstanceIdFromNodeId(nodeId);
  if (!base || !blockId) return [];
  return multicolumnBlockFieldDefs(base, blockId);
}

export function prepareMulticolumnSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortMulticolumnPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isMulticolumnPanelField)
  );
  return { ...node, label: 'Multicolumn', kind: 'section', fields };
}

export function prepareMulticolumnBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = multicolumnBlockFieldDefsFromNodeId(node.id);
  const fields =
    fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isMulticolumnBlockField);
  return { ...node, label: node.label || 'Column', kind: 'block', fields };
}

/* -------------------------------------------------------------------------- */
/* Column block: full settings panel (Layout → Size → Appearance → Borders →  */
/* Block link → Padding).                                                     */
/* -------------------------------------------------------------------------- */

export const MULTICOLUMN_COLUMN_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Block link',
  'Padding',
] as const;

const COLUMN_PANEL_GROUPS = new Set<string>(MULTICOLUMN_COLUMN_PANEL_GROUP_ORDER);

const FIT_FILL_CUSTOM = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'custom', label: 'Custom' },
] as const;

export const MULTICOLUMN_COLUMN_FIELD_KEYS = new Set([
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
  'backgroundColor',
  'backgroundOverlay',
  'borderStyle',
  'cornerRadius',
  'link',
  'linkOpenInNewTab',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

const COLUMN_FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  alignTextBaseline: 4,
  layoutGap: 5,
  width: 10,
  customWidth: 11,
  mobileWidth: 12,
  mobileCustomWidth: 13,
  height: 14,
  customHeight: 15,
  backgroundMedia: 20,
  backgroundImageUrl: 21,
  backgroundColor: 22,
  backgroundOverlay: 23,
  borderStyle: 30,
  cornerRadius: 31,
  link: 40,
  linkOpenInNewTab: 41,
  paddingTop: 50,
  paddingBottom: 51,
  paddingLeft: 52,
  paddingRight: 53,
};

export function multicolumnColumnBlockFieldDefs(
  blocksBase: string,
  blockInstanceId: string
): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.blocks.${blockInstanceId}.settings.${key}`;
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
      max: 100,
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
      path: s('customWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
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
      path: s('mobileCustomWidth'),
      type: 'number',
      label: 'Custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
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
      path: s('customHeight'),
      type: 'number',
      label: 'Custom height',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
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
      label: 'Background image',
      group: 'Appearance',
      sidebar: true,
      placeholder: 'Paste image URL or upload',
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
      path: s('link'),
      type: 'text',
      label: 'Link',
      group: 'Block link',
      widget: 'link',
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
    {
      path: s('linkOpenInNewTab'),
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
      max: 100,
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
      max: 100,
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
      max: 100,
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
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function isMulticolumnColumnNodeId(nodeId: string): boolean {
  return /:block:column_[^:]+$/.test(nodeId);
}

export function multicolumnColumnBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = multicolumnBlocksBaseFromNodeId(nodeId);
  const blockId = multicolumnBlockInstanceIdFromNodeId(nodeId);
  if (!base || !blockId) return [];
  return multicolumnColumnBlockFieldDefs(base, blockId);
}

export function pickMulticolumnColumnField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function columnFieldSortKey(path: string): number {
  return COLUMN_FIELD_SORT[path.split('.').pop() ?? ''] ?? 60;
}

export function isMulticolumnColumnBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return /\.blocks\.[^.]+\.settings\./.test(field.path) && MULTICOLUMN_COLUMN_FIELD_KEYS.has(key);
}

export function sortMulticolumnColumnPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    'Block link': 4,
    Padding: 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return columnFieldSortKey(a.path) - columnFieldSortKey(b.path);
  });
}

export function groupMulticolumnColumnPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && COLUMN_PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function prepareMulticolumnColumnBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = multicolumnColumnBlockFieldDefsFromNodeId(node.id);
  const fields = sortMulticolumnColumnPanelFields(
    fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isMulticolumnColumnBlockField)
  );
  return { ...node, label: 'Column', kind: 'block', fields };
}

/* -------------------------------------------------------------------------- */
/* Nested Heading block: full Shopify heading panel (Text → Layout →          */
/* Typography → Appearance → Padding), scoped to the column block settings.   */
/* -------------------------------------------------------------------------- */

const MULTICOLUMN_HEADING_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'none', label: 'None' },
] as const;

const MULTICOLUMN_HEADING_ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

const MULTICOLUMN_HEADING_PRESET_OPTIONS = [
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

export function isMulticolumnNestedHeadingNodeId(nodeId: string): boolean {
  return /:block:column_[^:]+:nested:heading$/.test(nodeId);
}

export function multicolumnHeadingBlockFieldDefs(
  blocksBase: string,
  blockInstanceId: string
): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.blocks.${blockInstanceId}.settings.${key}`;
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
      options: [...MULTICOLUMN_HEADING_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('headingAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [...MULTICOLUMN_HEADING_ALIGNMENT_OPTIONS],
    },
    {
      path: s('headingTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [...MULTICOLUMN_HEADING_PRESET_OPTIONS],
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
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
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
      path: s('headingBackgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('headingCornerRadius'),
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

export function multicolumnHeadingBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const tpl = nodeId.match(
    /^template:([^:]+):([^:]+):block:(column_[^:]+):nested:heading$/
  );
  if (tpl) {
    return multicolumnHeadingBlockFieldDefs(
      `templates.${tpl[1]}.sections.${tpl[2]}`,
      tpl[3]
    );
  }
  const layout = nodeId.match(/^layout:([^:]+):block:(column_[^:]+):nested:heading$/);
  if (layout) {
    return multicolumnHeadingBlockFieldDefs(`sections.${layout[1]}`, layout[2]);
  }
  return [];
}

/* -------------------------------------------------------------------------- */
/* Nested Description block: Text-block panel (Text → Layout → Typography →    */
/* Appearance → Padding). Keys are `desc`-prefixed so they never collide with  */
/* the Column block settings that share the same block settings object.        */
/* -------------------------------------------------------------------------- */

export const MULTICOLUMN_DESCRIPTION_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const DESCRIPTION_PANEL_GROUPS = new Set<string>(MULTICOLUMN_DESCRIPTION_PANEL_GROUP_ORDER);

export const MULTICOLUMN_DESCRIPTION_CUSTOM_TYPOGRAPHY_KEYS = [
  'descFont',
  'descFontSize',
  'descLineHeight',
  'descLetterSpacing',
  'descTextCase',
  'descWrap',
] as const;

const DESCRIPTION_CUSTOM_TYPOGRAPHY_KEY_SET = new Set<string>(
  MULTICOLUMN_DESCRIPTION_CUSTOM_TYPOGRAPHY_KEYS
);

const DESCRIPTION_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

const DESCRIPTION_ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

const DESCRIPTION_PRESET_OPTIONS = [
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

const DESCRIPTION_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  ...HEADING_FONT_SIZE_OPTIONS,
];

const DESCRIPTION_FIELD_SORT: Record<string, number> = {
  text: 0,
  descWidth: 1,
  descMaxWidth: 2,
  descAlignment: 3,
  descTypographyPreset: 10,
  descFont: 11,
  descFontSize: 12,
  descLineHeight: 13,
  descLetterSpacing: 14,
  descTextCase: 15,
  descWrap: 16,
  descColor: 19,
  descBackgroundEnabled: 20,
  descBackgroundColor: 21,
  descCornerRadius: 22,
  descPaddingTop: 30,
  descPaddingBottom: 31,
  descPaddingLeft: 32,
  descPaddingRight: 33,
};

export function isMulticolumnNestedDescriptionNodeId(nodeId: string): boolean {
  return /:block:column_[^:]+:nested:text$/.test(nodeId);
}

export function multicolumnDescriptionBlockFieldDefs(
  blocksBase: string,
  blockInstanceId: string
): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.blocks.${blockInstanceId}.settings.${key}`;
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
      path: s('descWidth'),
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
      path: s('descMaxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: true,
      options: [...DESCRIPTION_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('descAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [...DESCRIPTION_ALIGNMENT_OPTIONS],
    },
    {
      path: s('descTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: true,
      options: [...DESCRIPTION_PRESET_OPTIONS],
    },
    {
      path: s('descFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('descFontSize'),
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...DESCRIPTION_FONT_SIZE_OPTIONS],
    },
    {
      path: s('descLineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('descLetterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('descTextCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: true,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('descWrap'),
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      sidebar: true,
      options: [...HEADING_WRAP_OPTIONS],
    },
    {
      path: s('descColor'),
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('descBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: true,
    },
    {
      path: s('descBackgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('descCornerRadius'),
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
      path: s('descPaddingTop'),
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
      path: s('descPaddingBottom'),
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
      path: s('descPaddingLeft'),
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
      path: s('descPaddingRight'),
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

export function multicolumnDescriptionBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(column_[^:]+):nested:text$/);
  if (tpl) {
    return multicolumnDescriptionBlockFieldDefs(
      `templates.${tpl[1]}.sections.${tpl[2]}`,
      tpl[3]
    );
  }
  const layout = nodeId.match(/^layout:([^:]+):block:(column_[^:]+):nested:text$/);
  if (layout) {
    return multicolumnDescriptionBlockFieldDefs(`sections.${layout[1]}`, layout[2]);
  }
  return [];
}

export function isMulticolumnDescriptionBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!/\.blocks\.[^.]+\.settings\./.test(field.path)) return false;
  return key === 'text' || key.startsWith('desc');
}

export function isMulticolumnDescriptionTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

export function filterMulticolumnDescriptionFieldsForPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('descTypographyPreset'));
  if (!presetField || isMulticolumnDescriptionTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return !DESCRIPTION_CUSTOM_TYPOGRAPHY_KEY_SET.has(key);
  });
}

export function sortMulticolumnDescriptionPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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
      (DESCRIPTION_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (DESCRIPTION_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
    );
  });
}

export function groupMulticolumnDescriptionPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && DESCRIPTION_PANEL_GROUPS.has(field.group) ? field.group : 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function prepareMulticolumnDescriptionBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = multicolumnDescriptionBlockFieldDefsFromNodeId(node.id);
  const fields = sortMulticolumnDescriptionPanelFields(
    fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isMulticolumnDescriptionBlockField)
  );
  return { ...node, label: 'Description', kind: 'block', fields };
}
