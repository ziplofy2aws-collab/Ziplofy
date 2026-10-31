import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

export const RECOMMENDED_PRODUCTS_HEADER_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(RECOMMENDED_PRODUCTS_HEADER_PANEL_GROUP_ORDER);

const HEADER_FIELD_SORT: Record<string, number> = {
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

const HEADER_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'none', label: 'None' },
] as const;

const HEADER_PRESET_OPTIONS = [
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

export type ParsedRecommendedProductsHeaderNode = {
  settingsBase: string;
};

function isRecommendedProductsSectionInstanceId(sectionInstanceId: string): boolean {
  return /recommended_products/i.test(sectionInstanceId);
}

export function parseRecommendedProductsHeaderNodeId(
  nodeId: string
): ParsedRecommendedProductsHeaderNode | null {
  const blockMatch = nodeId.match(
    /^(?:template:[^:]+|layout):((?:recommended_products)(?:_\d+)?):block:header$/
  );
  if (blockMatch) {
    const secId = blockMatch[1]!;
    if (nodeId.startsWith('template:')) {
      const tplId = nodeId.split(':')[1]!;
      return { settingsBase: `templates.${tplId}.sections.${secId}.settings` };
    }
    return { settingsBase: `sections.${secId}.settings` };
  }

  if (!nodeId.startsWith('field:')) return null;
  const path = nodeId.slice('field:'.length);
  if (!path.endsWith('.settings.heading')) return null;

  const template = path.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings\.heading$/);
  if (template) {
    const [, tplId, secId] = template;
    if (!isRecommendedProductsSectionInstanceId(secId!)) return null;
    return { settingsBase: `templates.${tplId}.sections.${secId}.settings` };
  }

  const layout = path.match(/^sections\.([^.]+)\.settings\.heading$/);
  if (layout) {
    const secId = layout[1]!;
    if (!isRecommendedProductsSectionInstanceId(secId)) return null;
    return { settingsBase: `sections.${secId}.settings` };
  }

  return null;
}

export function isRecommendedProductsHeaderNodeId(nodeId: string): boolean {
  return parseRecommendedProductsHeaderNodeId(nodeId) !== null;
}

/** @deprecated Use isRecommendedProductsHeaderNodeId */
export function isRecommendedProductsHeadingFieldNodeId(nodeId: string): boolean {
  return isRecommendedProductsHeaderNodeId(nodeId);
}

export function recommendedProductsHeaderDefaultSettings(): Record<string, string | boolean | number> {
  return {
    heading: 'Related products',
    headingWidth: 'fit',
    headingMaxWidth: 'normal',
    headingTypographyPreset: 'heading-3',
    headingColor: 'default',
    headingBackgroundEnabled: false,
    headingPaddingTop: 0,
    headingPaddingBottom: 0,
    headingPaddingLeft: 0,
    headingPaddingRight: 0,
  };
}

export const RECOMMENDED_PRODUCTS_HEADER_DEFAULTS: Record<string, string | boolean> =
  Object.fromEntries(
    Object.entries(recommendedProductsHeaderDefaultSettings()).map(([k, v]) => [
      k,
      typeof v === 'boolean' ? v : String(v),
    ])
  ) as Record<string, string | boolean>;

export function recommendedProductsHeaderFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('heading'),
      type: 'textarea',
      label: 'Text',
      group: 'Text',
      widget: 'richtext',
      sidebar: false,
    },
    {
      path: s('headingWidth'),
      type: 'select',
      label: 'Width',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
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
      sidebar: false,
      options: [...HEADER_MAX_WIDTH_OPTIONS],
    },
    {
      path: s('headingTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      sidebar: false,
      options: [...HEADER_PRESET_OPTIONS],
    },
    {
      path: s('headingFont'),
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: s('headingFontSize'),
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [...HEADING_FONT_SIZE_OPTIONS],
    },
    {
      path: s('headingLineHeight'),
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: s('headingLetterSpacing'),
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: s('headingTextCase'),
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: s('headingWrap'),
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [...HEADING_WRAP_OPTIONS],
    },
    {
      path: s('headingColor'),
      type: 'select',
      label: 'Text color',
      group: 'Appearance',
      widget: 'default-color',
      sidebar: false,
    },
    {
      path: s('headingBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: false,
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
      sidebar: false,
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
      sidebar: false,
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
      sidebar: false,
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
      sidebar: false,
    },
  ];
}

export function recommendedProductsHeaderFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const parsed = parseRecommendedProductsHeaderNodeId(nodeId);
  if (!parsed) return [];
  return recommendedProductsHeaderFieldDefs(parsed.settingsBase);
}

export function isRecommendedProductsHeaderPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'heading' || key.startsWith('heading')) {
    return /\.settings\./.test(field.path) && /recommended_products/i.test(field.path);
  }
  return false;
}

export function isRecommendedProductsHeaderPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const isRecommended = fields.some((f) => /recommended_products/i.test(f.path));
  return (
    isRecommended &&
    keys.has('heading') &&
    (keys.has('headingWidth') || keys.has('headingTypographyPreset'))
  );
}

export function isRecommendedProductsHeaderTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

export function filterRecommendedProductsHeaderFieldsForPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('headingTypographyPreset'));
  if (!presetField || isRecommendedProductsHeaderTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => !CUSTOM_TYPOGRAPHY_KEYS.has(f.path.split('.').pop() ?? ''));
}

export function groupRecommendedProductsHeaderPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  const sorted = [...fields].sort(
    (a, b) =>
      (HEADER_FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) -
      (HEADER_FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
  for (const field of sorted) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function prepareRecommendedProductsHeaderSettingsNode(node: SidebarNode): SidebarNode {
  const fields =
    node.fields?.length && isRecommendedProductsHeaderPanelFields(node.fields)
      ? node.fields
      : recommendedProductsHeaderFieldDefsFromNodeId(node.id);
  return { ...node, label: 'Header', kind: 'block', fields };
}

export function mergeRecommendedProductsHeaderSettings(
  settings: Record<string, unknown>
): boolean {
  const defaults = recommendedProductsHeaderDefaultSettings();
  let changed = false;
  for (const [key, value] of Object.entries(defaults)) {
    if (settings[key] === undefined) {
      settings[key] = value;
      changed = true;
    }
  }
  return changed;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendValuesForRecommendedProductsHeader(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = recommendedProductsHeaderFieldDefsFromNodeId(nodeId);
  const next = { ...values };
  let changed = false;

  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      changed = true;
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = RECOMMENDED_PRODUCTS_HEADER_DEFAULTS[key];
    if (fallback !== undefined) {
      next[field.path] = fallback;
      changed = true;
    }
  }

  return changed ? next : values;
}
