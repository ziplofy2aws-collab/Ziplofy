import { remapTemplateSchemaPath } from '../../utils/theme-editor-insert-section';
import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

export const COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEYS = [
  'titleFont',
  'titleFontSize',
  'titleLineHeight',
  'titleLetterSpacing',
  'titleTextCase',
  'titleWrap',
] as const;

const COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEY_SET = new Set<string>(
  COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEYS
);

const COLLECTION_TITLE_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  ...HEADING_FONT_SIZE_OPTIONS,
];

type CollectionTitleTypographyFieldKey = (typeof COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEYS)[number];

const COLLECTION_TITLE_TYPO_FIELD_FALLBACKS: Record<
  CollectionTitleTypographyFieldKey,
  Omit<EditorFieldDef, 'path'>
> = {
  titleFont: {
    type: 'select',
    label: 'Font',
    group: 'Typography',
    widget: 'select',
    options: [...HEADING_FONT_OPTIONS],
  },
  titleFontSize: {
    type: 'select',
    label: 'Size',
    group: 'Typography',
    widget: 'select',
    options: [...COLLECTION_TITLE_FONT_SIZE_OPTIONS],
  },
  titleLineHeight: {
    type: 'select',
    label: 'Line height',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_LINE_HEIGHT_OPTIONS],
  },
  titleLetterSpacing: {
    type: 'select',
    label: 'Letter spacing',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_LETTER_SPACING_OPTIONS],
  },
  titleTextCase: {
    type: 'select',
    label: 'Case',
    group: 'Typography',
    widget: 'segmented',
    options: [...HEADING_TEXT_CASE_OPTIONS],
  },
  titleWrap: {
    type: 'select',
    label: 'Wrap',
    group: 'Typography',
    widget: 'select',
    options: [...HEADING_WRAP_OPTIONS],
  },
};

/** True when the collection title typography preset is Custom (shows manual font controls). */
export function isCollectionTitleTypographyCustomPreset(
  values: Record<string, string | boolean>,
  presetPath: string
): boolean {
  const raw = values[presetPath];
  const preset =
    typeof raw === 'string' ? raw : raw === undefined || raw === null ? 'default' : String(raw);
  const normalized = preset === 'body' ? 'paragraph' : preset;
  return normalized === 'custom';
}

/** Hide custom typography fields unless Preset is Custom. */
export function filterCollectionTitlePanelFieldsForTypographyPreset(
  fields: EditorFieldDef[],
  values: Record<string, string | boolean>
): EditorFieldDef[] {
  const presetField = fields.find((f) => f.path.endsWith('titleTypographyPreset'));
  if (!presetField || isCollectionTitleTypographyCustomPreset(values, presetField.path)) {
    return fields;
  }
  return fields.filter((f) => {
    const key = f.path.split('.').pop() ?? '';
    return !COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEY_SET.has(key);
  });
}

export function resolveCollectionTitleTypographyField(
  key: CollectionTitleTypographyFieldKey,
  settingsBase: string,
  fields: EditorFieldDef[]
): EditorFieldDef {
  const fallback = COLLECTION_TITLE_TYPO_FIELD_FALLBACKS[key];
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

export const COLLECTION_TITLE_PANEL_GROUP_ORDER = [
  'Text',
  'Layout',
  'Typography',
  'Appearance',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(COLLECTION_TITLE_PANEL_GROUP_ORDER);

const TITLE_PANEL_KEYS = new Set([
  'title',
  'titleWidth',
  'titleMaxWidth',
  'titleAlignment',
  'titleTypographyPreset',
  ...COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEYS,
  'titleColor',
  'titleBackgroundEnabled',
  'titleBackgroundColor',
  'titleCornerRadius',
  'titlePaddingTop',
  'titlePaddingBottom',
  'titlePaddingLeft',
  'titlePaddingRight',
]);

export function isCollectionTitleNestedNodeId(nodeId: string): boolean {
  return /:block:collection_header:nested:collection_title$/.test(nodeId);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    title: 0,
    titleWidth: 1,
    titleMaxWidth: 2,
    titleAlignment: 3,
    titleTypographyPreset: 10,
    titleFont: 11,
    titleFontSize: 12,
    titleLineHeight: 13,
    titleLetterSpacing: 14,
    titleTextCase: 15,
    titleWrap: 16,
    titleColor: 17,
    titleBackgroundEnabled: 20,
    titleBackgroundColor: 21,
    titleCornerRadius: 22,
    titlePaddingTop: 30,
    titlePaddingBottom: 31,
    titlePaddingLeft: 32,
    titlePaddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function isCollectionTitleStylePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!TITLE_PANEL_KEYS.has(key)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isCollectionTitlePanelField(field: EditorFieldDef): boolean {
  if (!isCollectionTitleStylePanelField(field)) return false;
  return /\.blocks\.collection_header\.settings\./.test(field.path);
}

export function isCollectionTitlePanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('title') &&
    (keys.has('titleWidth') || keys.has('titleTypographyPreset') || keys.has('titleMaxWidth'))
  );
}

export function sortCollectionTitlePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupCollectionTitlePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isCollectionTitlePanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortCollectionTitlePanelFields(list));
  }
  return map;
}

export function groupCollectionTitleStylePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isCollectionTitleStylePanelField)) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(group, sortCollectionTitlePanelFields(list));
  }
  return map;
}

export function prepareCollectionTitleSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionTitlePanelFields((node.fields ?? []).filter(isCollectionTitlePanelField));
  return { ...node, label: 'Collection title', kind: 'block', fields };
}

export function prepareCollectionTitleStyleSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionTitlePanelFields(
    (node.fields ?? []).filter(isCollectionTitleStylePanelField)
  );
  return { ...node, label: node.label, kind: 'block', fields };
}

export function collectionTitleSettingsBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?):block:collection_header/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.collection_header.settings`;
}

export function collectionTitleSettingsBaseFromPrefix(prefix: string): string | null {
  const match = prefix.match(/^template:([^:]+):(featured_collection(?:_\d+)?)$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.collection_header.settings`;
}

export function collectionTitleFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  const fields: EditorFieldDef[] = [
    {
      path: s('title'),
      type: 'textarea',
      label: 'Text',
      group: 'Text',
      widget: 'richtext',
      sidebar: false,
      description: 'Collection title shown in the header.',
    },
    {
      path: s('titleWidth'),
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
      path: s('titleMaxWidth'),
      type: 'select',
      label: 'Max width',
      group: 'Layout',
      widget: 'select',
      sidebar: false,
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s('titleAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('titleTypographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      description: 'Edit presets in theme settings',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'paragraph', label: 'Paragraph' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
        { value: 'heading-4', label: 'Heading 4' },
        { value: 'heading-5', label: 'Heading 5' },
        { value: 'heading-6', label: 'Heading 6' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      path: s('titleColor'),
      type: 'text',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('titleBackgroundEnabled'),
      type: 'boolean',
      label: 'Background',
      group: 'Appearance',
      widget: 'toggle',
      sidebar: false,
    },
    {
      path: s('titleBackgroundColor'),
      type: 'text',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: false,
    },
    {
      path: s('titleCornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 50,
      step: 1,
      unit: 'px',
      sidebar: false,
    },
    {
      path: s('titlePaddingTop'),
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
      path: s('titlePaddingBottom'),
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
      path: s('titlePaddingLeft'),
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
      path: s('titlePaddingRight'),
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

  for (const key of COLLECTION_TITLE_CUSTOM_TYPOGRAPHY_KEYS) {
    fields.push(resolveCollectionTitleTypographyField(key, settingsBase, fields));
  }

  return fields;
}

function canonicalCollectionTitleFieldsFromSchema(editorSchema: EditorSchemaDoc): EditorFieldDef[] {
  const tpl = editorSchema.templates?.find((t) => t.id === 'index');
  const sec = tpl?.sections?.find((s) => s.id === 'featured_collection');
  const header = sec?.blocks?.find((b) => b.id === 'collection_header');
  const nested = header?.blocks?.find((b) => b.id === 'collection_title');
  return nested?.settingsFields ?? [];
}

/** @deprecated Use {@link collectionTitleFieldDefsFromSchema} with nodeId */
export function collectionTitleFieldDefsFromSchemaLegacy(
  editorSchema: EditorSchemaDoc
): EditorFieldDef[] {
  return canonicalCollectionTitleFieldsFromSchema(editorSchema);
}

export function collectionTitleFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId?: string
): EditorFieldDef[] {
  const canon = canonicalCollectionTitleFieldsFromSchema(editorSchema).filter((field) => {
    const key = field.path.split('.').pop() ?? '';
    return TITLE_PANEL_KEYS.has(key);
  });
  const settingsBase = nodeId ? collectionTitleSettingsBaseFromNodeId(nodeId) : null;
  if (settingsBase) {
    if (canon.length) {
      const match = nodeId?.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
      const schemaKeys = new Set(canon.map((field) => field.path.split('.').pop() ?? ''));
      const fromSchema = match
        ? canon.map((field) => ({
            ...field,
            path: remapTemplateSchemaPath(field.path, match[1]!, match[2]!),
          }))
        : canon;
      const fromBuilt = collectionTitleFieldDefs(settingsBase).filter(
        (field) => !schemaKeys.has(field.path.split('.').pop() ?? '')
      );
      return [...fromSchema, ...fromBuilt];
    }
    return collectionTitleFieldDefs(settingsBase);
  }
  return canon;
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendValuesForCollectionTitleBlock(
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const defs = collectionTitleFieldDefsFromSchema(editorSchema, nodeId);
  const match = nodeId.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
  const settingsBase = match
    ? `templates.${match[1]}.sections.${match[2]}.blocks.collection_header.settings`
    : '';
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

    if (settingsBase) {
      const styleDefaults: Record<string, string | boolean> = {
        [`${settingsBase}.titleWidth`]: 'fit',
        [`${settingsBase}.titleMaxWidth`]: 'normal',
        [`${settingsBase}.titleTypographyPreset`]: 'default',
        [`${settingsBase}.titleColor`]: 'default',
        [`${settingsBase}.titleBackgroundEnabled`]: false,
        [`${settingsBase}.titlePaddingTop`]: 0,
        [`${settingsBase}.titlePaddingBottom`]: 0,
        [`${settingsBase}.titlePaddingLeft`]: 0,
        [`${settingsBase}.titlePaddingRight`]: 0,
      };
      for (const [path, fallback] of Object.entries(styleDefaults)) {
        if (next[path] !== undefined) continue;
        const fromConfig = getNested(config, path.split('.'));
        if (fromConfig !== undefined && fromConfig !== null && fromConfig !== '') {
          next[path] =
            typeof fallback === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
        } else {
          next[path] = fallback;
        }
        changed = true;
      }

      const presetPath = `${settingsBase}.titleTypographyPreset`;
      const presetRaw = next[presetPath];
      const preset =
        typeof presetRaw === 'string'
          ? presetRaw
          : presetRaw === undefined
            ? String(getNested(config, presetPath.split('.')) ?? '')
            : String(presetRaw);
      const isCustom = preset === 'custom';

      const customDefaults: Record<string, string> = {
        [`${settingsBase}.titleFont`]: 'body',
        [`${settingsBase}.titleFontSize`]: 'default',
        [`${settingsBase}.titleLineHeight`]: 'normal',
        [`${settingsBase}.titleLetterSpacing`]: 'normal',
        [`${settingsBase}.titleTextCase`]: 'default',
        [`${settingsBase}.titleWrap`]: 'pretty',
      };

      if (isCustom) {
        for (const [path, fallback] of Object.entries(customDefaults)) {
          if (next[path] !== undefined) continue;
          const fromConfig = getNested(config, path.split('.'));
          next[path] =
            fromConfig == null || fromConfig === '' ? fallback : String(fromConfig);
          changed = true;
        }
      }

      const bgEnabledPath = `${settingsBase}.titleBackgroundEnabled`;
    const bgColorPath = `${settingsBase}.titleBackgroundColor`;
    const radiusPath = `${settingsBase}.titleCornerRadius`;
    const bgOn = next[bgEnabledPath] === true || next[bgEnabledPath] === 'true';
    if (bgOn && next[bgColorPath] === undefined) {
      const fromConfig = getNested(config, bgColorPath.split('.'));
      next[bgColorPath] =
        fromConfig == null || fromConfig === '' ? '#00000026' : String(fromConfig);
      changed = true;
    }
    if (bgOn && next[radiusPath] === undefined) {
      const fromConfig = getNested(config, radiusPath.split('.'));
      next[radiusPath] =
        fromConfig == null || fromConfig === '' ? '0' : String(fromConfig);
      changed = true;
    }
  }

  if (!defs.length && !changed) return values;
  return changed ? next : values;
}
