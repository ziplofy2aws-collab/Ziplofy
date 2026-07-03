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
  const match = nodeId?.match(/^template:([^:]+):(featured_collection(?:_\d+)?):/);
  const canon = canonicalCollectionTitleFieldsFromSchema(editorSchema);
  if (!match || !canon.length) return canon;
  const [, templateId, sectionInstanceId] = match;
  return canon.map((field) => ({
    ...field,
    path: remapTemplateSchemaPath(field.path, templateId!, sectionInstanceId!),
  }));
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
