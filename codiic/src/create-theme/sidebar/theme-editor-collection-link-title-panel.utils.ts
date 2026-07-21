import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { layoutBlueprintKey, remapTemplateSchemaPath, templateBlueprintKey, findSectionSchemaByBlueprint } from '../../utils/theme-editor-insert-section';
import {
  TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS,
  TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS,
  resolveTextBlockTypographyField,
} from './theme-editor-text-block-panel.utils';
import {
  HEADING_FONT_OPTIONS,
  HEADING_FONT_SIZE_OPTIONS,
  HEADING_LETTER_SPACING_OPTIONS,
  HEADING_LINE_HEIGHT_OPTIONS,
  HEADING_TEXT_CASE_OPTIONS,
  HEADING_WRAP_OPTIONS,
} from './theme-editor-heading-block-panel.utils';

/** Typography keys for Collection link Title (preset + custom when Custom is selected). */
export const COLLECTION_LINK_TITLE_TYPOGRAPHY_KEYS = [
  'typographyPreset',
  ...TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS,
] as const;

const TYPOGRAPHY_KEY_SET = new Set<string>(COLLECTION_LINK_TITLE_TYPOGRAPHY_KEYS);

const FIELD_SORT: Record<string, number> = {
  typographyPreset: 0,
  font: 1,
  fontSize: 2,
  lineHeight: 3,
  letterSpacing: 4,
  textCase: 5,
  wrap: 6,
};

const FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  ...HEADING_FONT_SIZE_OPTIONS,
];

export function isCollectionLinkTitleFieldNodeId(nodeId: string): boolean {
  if (!nodeId.startsWith('field:')) return false;
  const path = nodeId.slice('field:'.length);
  return (
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.[^.]+\.settings\.title$/.test(path) ||
    /^sections\.[^.]+\.blocks\.[^.]+\.settings\.title$/.test(path)
  );
}

export function isCollectionLinkTitlePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return TYPOGRAPHY_KEY_SET.has(key);
}

export function isCollectionLinkTitlePanelFields(fields: EditorFieldDef[]): boolean {
  return fields.length > 0 && fields.every(isCollectionLinkTitlePanelField);
}

export function sortCollectionLinkTitlePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return [...fields].sort(
    (a, b) =>
      (FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 9) -
      (FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 9)
  );
}

/** Build Title typography panel fields from a block settings base. */
export function collectionLinkTitleFieldDefsFromSettingsBase(settingsBase: string): EditorFieldDef[] {
  return sortCollectionLinkTitlePanelFields([
    {
      path: `${settingsBase}.typographyPreset`,
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      description: 'Edit presets in theme settings',
      options: [...TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS],
    },
    {
      path: `${settingsBase}.font`,
      type: 'select',
      label: 'Font',
      group: 'Typography',
      widget: 'select',
      options: [...HEADING_FONT_OPTIONS],
    },
    {
      path: `${settingsBase}.fontSize`,
      type: 'select',
      label: 'Size',
      group: 'Typography',
      widget: 'select',
      options: [...FONT_SIZE_OPTIONS],
    },
    {
      path: `${settingsBase}.lineHeight`,
      type: 'select',
      label: 'Line height',
      group: 'Typography',
      widget: 'segmented',
      options: [...HEADING_LINE_HEIGHT_OPTIONS],
    },
    {
      path: `${settingsBase}.letterSpacing`,
      type: 'select',
      label: 'Letter spacing',
      group: 'Typography',
      widget: 'segmented',
      options: [...HEADING_LETTER_SPACING_OPTIONS],
    },
    {
      path: `${settingsBase}.textCase`,
      type: 'select',
      label: 'Case',
      group: 'Typography',
      widget: 'segmented',
      options: [...HEADING_TEXT_CASE_OPTIONS],
    },
    {
      path: `${settingsBase}.wrap`,
      type: 'select',
      label: 'Wrap',
      group: 'Typography',
      widget: 'select',
      options: [...HEADING_WRAP_OPTIONS],
    },
  ]);
}

export function settingsBaseFromTitleFieldPath(path: string): string | null {
  const tpl = path.match(/^templates\.[^.]+\.sections\.[^.]+\.blocks\.[^.]+\.settings\.title$/);
  if (tpl) return path.replace(/\.title$/, '');
  const layout = path.match(/^sections\.[^.]+\.blocks\.[^.]+\.settings\.title$/);
  if (layout) return path.replace(/\.title$/, '');
  return null;
}

const COLLECTION_LINK_SECTION_BLUEPRINTS = ['collection_links_spotlight', 'collection_links_text'] as const;

export function collectionLinkBlueprintSettingsFields(
  editorSchema: EditorSchemaDoc,
  preferredBlueprint: string,
  placement: 'template' | 'layout',
  tplId?: string
): EditorFieldDef[] {
  const tryBlueprints = [
    preferredBlueprint,
    ...COLLECTION_LINK_SECTION_BLUEPRINTS.filter((id) => id !== preferredBlueprint),
  ];

  if (placement === 'template' && tplId) {
    for (const blueprint of tryBlueprints) {
      const sec = findSectionSchemaByBlueprint(editorSchema, blueprint, tplId);
      const blocks = (sec?.blocks ?? []) as Array<{ id?: string; settingsFields?: EditorFieldDef[] }>;
      const block = blocks.find((b) => (b.id ?? '') === 'collection_link');
      if (block?.settingsFields?.length) return block.settingsFields;
    }
    return [];
  }

  for (const blueprint of tryBlueprints) {
    const block = editorSchema.layout?.[blueprint]?.blocks?.find(
      (b) => (b.id ?? '') === 'collection_link'
    );
    if (block?.settingsFields?.length) return block.settingsFields;
  }
  return [];
}

export function collectionLinkTitleFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  fieldNodeId: string
): EditorFieldDef[] {
  const path = fieldNodeId.startsWith('field:') ? fieldNodeId.slice('field:'.length) : fieldNodeId;
  const settingsBase = settingsBaseFromTitleFieldPath(path);
  /** Always build typography controls from the title path (schema may still use legacy titleFont*). */
  const built = settingsBase ? collectionLinkTitleFieldDefsFromSettingsBase(settingsBase) : [];

  const tplMatch = path.match(
    /^templates\.([^.]+)\.sections\.([^.]+)\.blocks\.([^.]+)\.settings\.title$/
  );
  if (tplMatch) {
    const [, tplId, secId, blockId] = tplMatch;
    const blueprint = templateBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(
      editorSchema,
      blueprint,
      'template',
      tplId
    );
    if (settingsFields.length) {
      const fromSchema = sortCollectionLinkTitlePanelFields(
        settingsFields
          .filter((f) => TYPOGRAPHY_KEY_SET.has(f.path.split('.').pop() ?? ''))
          .map((f) => ({
            ...f,
            path: remapTemplateSchemaPath(f.path, tplId, secId).replace(
              /\.blocks\.collection_link\./,
              `.blocks.${blockId}.`
            ),
          }))
      );
      if (fromSchema.length) {
        const schemaKeys = new Set(fromSchema.map((f) => f.path.split('.').pop() ?? ''));
        return sortCollectionLinkTitlePanelFields([
          ...fromSchema,
          ...built.filter((f) => !schemaKeys.has(f.path.split('.').pop() ?? '')),
        ]);
      }
    }
  }

  const layoutMatch = path.match(/^sections\.([^.]+)\.blocks\.([^.]+)\.settings\.title$/);
  if (layoutMatch) {
    const [, secId, blockId] = layoutMatch;
    const blueprint = layoutBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(editorSchema, blueprint, 'layout');
    if (settingsFields.length) {
      const fromSchema = sortCollectionLinkTitlePanelFields(
        settingsFields
          .filter((f) => TYPOGRAPHY_KEY_SET.has(f.path.split('.').pop() ?? ''))
          .map((f) => ({
            ...f,
            path: f.path
              .replace(/^sections\.[^.]+\./, `sections.${secId}.`)
              .replace(/\.blocks\.collection_link\./, `.blocks.${blockId}.`),
          }))
      );
      if (fromSchema.length) {
        const schemaKeys = new Set(fromSchema.map((f) => f.path.split('.').pop() ?? ''));
        return sortCollectionLinkTitlePanelFields([
          ...fromSchema,
          ...built.filter((f) => !schemaKeys.has(f.path.split('.').pop() ?? '')),
        ]);
      }
    }
  }

  return built;
}

export function prepareCollectionLinkTitleSettingsNode(node: SidebarNode): SidebarNode {
  let fields = sortCollectionLinkTitlePanelFields(
    (node.fields ?? []).filter(isCollectionLinkTitlePanelField)
  );
  if (!fields.length && isCollectionLinkTitleFieldNodeId(node.id)) {
    fields = collectionLinkTitleFieldDefsFromSchema(
      { templates: [], layout: {} } as EditorSchemaDoc,
      node.id
    );
  }
  return { ...node, label: 'Title', kind: 'field', icon: 'title', fields };
}

/** Resolve typography field defs for the Title settings sheet (fallback-safe). */
export function resolveCollectionLinkTitlePanelFields(
  nodeId: string,
  fields: EditorFieldDef[],
  editorSchema?: EditorSchemaDoc | null
): EditorFieldDef[] {
  const filtered = sortCollectionLinkTitlePanelFields(
    (fields ?? []).filter(isCollectionLinkTitlePanelField)
  );
  if (filtered.length) return filtered;

  if (editorSchema) {
    const fromSchema = collectionLinkTitleFieldDefsFromSchema(editorSchema, nodeId);
    if (fromSchema.length) return fromSchema;
  }

  return collectionLinkTitleFieldDefsFromSchema(
    { templates: [], layout: {} } as EditorSchemaDoc,
    nodeId
  );
}

export function resolveCollectionLinkTitleTypographyField(
  key: (typeof TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS)[number],
  settingsBase: string,
  fields: EditorFieldDef[]
): EditorFieldDef {
  return resolveTextBlockTypographyField(key, settingsBase, fields);
}
