import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';

export const FAQ_ACCORDION_PANEL_GROUP_ORDER = ['General', 'Borders', 'Padding'] as const;

const PANEL_GROUPS = new Set<string>(FAQ_ACCORDION_PANEL_GROUP_ORDER);

export const FAQ_ACCORDION_PANEL_SETTING_KEYS = new Set([
  'icon',
  'dividers',
  'headingTypographyPreset',
  'inheritColorScheme',
  'borderStyle',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

export const FAQ_ACCORDION_GENERAL_FIELD_ORDER = [
  'icon',
  'dividers',
  'headingTypographyPreset',
  'inheritColorScheme',
] as const;

export const FAQ_ACCORDION_PADDING_FIELD_ORDER = [
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
] as const;

const ICON_OPTIONS = [
  { value: 'caret', label: 'Caret' },
  { value: 'plus', label: 'Plus' },
] as const;

const BORDER_STYLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
] as const;

export const FAQ_ACCORDION_HEADING_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
] as const;

const FIELD_SORT: Record<string, number> = {
  icon: 0,
  dividers: 1,
  headingTypographyPreset: 2,
  inheritColorScheme: 3,
  borderStyle: 10,
  cornerRadius: 11,
  paddingTop: 20,
  paddingBottom: 21,
  paddingLeft: 22,
  paddingRight: 23,
};

export function isFaqAccordionBlockNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:[^:]+:block:accordion$/.test(nodeId) ||
    /^layout:[^:]+:block:accordion$/.test(nodeId)
  );
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const template = nodeId.match(/^template:([^:]+):([^:]+):block:accordion$/);
  if (template) return `templates.${template[1]}.sections.${template[2]}.blocks.accordion`;
  const layout = nodeId.match(/^layout:([^:]+):block:accordion$/);
  if (layout) return `sections.${layout[1]}.blocks.accordion`;
  return null;
}

export function faqAccordionDefaultSettings(): Record<string, string | number | boolean> {
  return {
    icon: 'caret',
    dividers: true,
    headingTypographyPreset: 'heading-5',
    inheritColorScheme: false,
    borderStyle: 'none',
    cornerRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    openFirstItem: false,
  };
}

export function faqAccordionFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('icon'),
      type: 'select',
      label: 'Icon',
      group: 'General',
      widget: 'segmented',
      sidebar: true,
      options: [...ICON_OPTIONS],
    },
    {
      path: s('dividers'),
      type: 'boolean',
      label: 'Dividers',
      group: 'General',
      sidebar: true,
    },
    {
      path: s('headingTypographyPreset'),
      type: 'select',
      label: 'Heading preset',
      group: 'General',
      widget: 'select',
      sidebar: true,
      description: 'Edit presets in theme settings',
      options: [...FAQ_ACCORDION_HEADING_PRESET_OPTIONS],
    },
    {
      path: s('inheritColorScheme'),
      type: 'boolean',
      label: 'Inherit color scheme',
      group: 'General',
      sidebar: true,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
      options: [...BORDER_STYLE_OPTIONS],
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

export function faqAccordionFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? faqAccordionFieldDefs(base) : [];
}

export function faqAccordionFieldDefsFromSchema(
  schema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const fromNode = faqAccordionFieldDefsFromNodeId(nodeId);
  const tplMatch = nodeId.match(/^template:([^:]+):([^:]+):/);
  if (tplMatch) {
    return fromNode.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplMatch[1], tplMatch[2]),
    }));
  }
  const layoutMatch = nodeId.match(/^layout:([^:]+):/);
  if (layoutMatch) {
    return fromNode.map((f) => ({
      ...f,
      path: f.path.replace('sections.faq_section', `sections.${layoutMatch[1]}`),
    }));
  }
  return fromNode;
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isFaqAccordionPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!FAQ_ACCORDION_PANEL_SETTING_KEYS.has(key)) return false;
  if (!/\.blocks\.accordion\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFaqAccordionPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('icon') && keys.has('headingTypographyPreset');
}

export function sortFaqAccordionPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = { General: 0, Borders: 1, Padding: 2 };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupFaqAccordionPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFaqAccordionPanelField)) {
    const group = field.group ?? 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortFaqAccordionPanelFields(list));
  }
  return map;
}

export function prepareFaqAccordionSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortFaqAccordionPanelFields(
    (node.fields ?? []).filter(isFaqAccordionPanelField)
  );
  if (!fields.length) {
    const fromNode = faqAccordionFieldDefsFromNodeId(node.id);
    return { ...node, label: 'Accordion', kind: 'block', fields: fromNode };
  }
  return { ...node, label: 'Accordion', kind: 'block', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Seed sidebar `values` for accordion block panel fields from merged config. */
export function extendValuesForFaqAccordionBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = faqAccordionFieldDefsFromSchema(editorSchema, nodeId);
  if (!defs.length) return values;
  const next = { ...values };
  let changed = false;
  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw === undefined) continue;
    if (field.type === 'boolean') {
      next[field.path] = Boolean(raw);
    } else {
      next[field.path] = raw == null ? '' : String(raw);
    }
    changed = true;
  }
  return changed ? next : values;
}
