import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import {
  layoutBlueprintKey,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from '../../utils/theme-editor-insert-section';

export const COLLECTION_LINK_TITLE_TYPOGRAPHY_KEYS = [
  'titleFont',
  'titleWeight',
  'titleLineHeight',
  'titleLetterSpacing',
  'titleCase',
] as const;

const TYPOGRAPHY_KEY_SET = new Set<string>(COLLECTION_LINK_TITLE_TYPOGRAPHY_KEYS);

const FIELD_SORT: Record<string, number> = {
  titleFont: 0,
  titleWeight: 1,
  titleLineHeight: 2,
  titleLetterSpacing: 3,
  titleCase: 4,
};

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

const TITLE_FONT_OPTIONS = [
  { value: 'body', label: 'Body' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'heading', label: 'Heading' },
  { value: 'accent', label: 'Accent' },
] as const;

const TITLE_WEIGHT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
] as const;

const TITLE_LINE_HEIGHT_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'tight', label: 'Tight' },
  { value: 'loose', label: 'Loose' },
] as const;

const TITLE_LETTER_SPACING_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'tight', label: 'Tight' },
  { value: 'wide', label: 'Wide' },
] as const;

const TITLE_CASE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'Uppercase' },
] as const;

/** Build Title typography panel fields from a block settings base (fallback when schema lookup misses). */
function collectionLinkTitleFieldDefsFromSettingsBase(settingsBase: string): EditorFieldDef[] {
  return sortCollectionLinkTitlePanelFields([
    {
      path: `${settingsBase}.titleFont`,
      type: 'select',
      label: 'Font',
      widget: 'select',
      options: [...TITLE_FONT_OPTIONS],
    },
    {
      path: `${settingsBase}.titleWeight`,
      type: 'select',
      label: 'Weight',
      widget: 'select',
      options: [...TITLE_WEIGHT_OPTIONS],
    },
    {
      path: `${settingsBase}.titleLineHeight`,
      type: 'select',
      label: 'Line height',
      widget: 'select',
      options: [...TITLE_LINE_HEIGHT_OPTIONS],
    },
    {
      path: `${settingsBase}.titleLetterSpacing`,
      type: 'select',
      label: 'Letter spacing',
      widget: 'select',
      options: [...TITLE_LETTER_SPACING_OPTIONS],
    },
    {
      path: `${settingsBase}.titleCase`,
      type: 'select',
      label: 'Case',
      widget: 'segmented',
      options: [...TITLE_CASE_OPTIONS],
    },
  ]);
}

function settingsBaseFromTitleFieldPath(path: string): string | null {
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
    const template = editorSchema.templates?.find((t) => t.id === tplId);
    for (const blueprint of tryBlueprints) {
      const sec = template?.sections?.find((s) => (s.id ?? '') === blueprint);
      const block = sec?.blocks?.find((b) => (b.id ?? '') === 'collection_link');
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
      return sortCollectionLinkTitlePanelFields(
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
    }
  }

  const layoutMatch = path.match(/^sections\.([^.]+)\.blocks\.([^.]+)\.settings\.title$/);
  if (layoutMatch) {
    const [, secId, blockId] = layoutMatch;
    const blueprint = layoutBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(editorSchema, blueprint, 'layout');
    if (settingsFields.length) {
      return sortCollectionLinkTitlePanelFields(
        settingsFields
          .filter((f) => TYPOGRAPHY_KEY_SET.has(f.path.split('.').pop() ?? ''))
          .map((f) => ({
            ...f,
            path: f.path
              .replace(/^sections\.[^.]+\./, `sections.${secId}.`)
              .replace(/\.blocks\.collection_link\./, `.blocks.${blockId}.`),
          }))
      );
    }
  }

  const settingsBase = settingsBaseFromTitleFieldPath(path);
  if (settingsBase) return collectionLinkTitleFieldDefsFromSettingsBase(settingsBase);

  return [];
}

export function prepareCollectionLinkTitleSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionLinkTitlePanelFields(
    (node.fields ?? []).filter(isCollectionLinkTitlePanelField)
  );
  return { ...node, label: 'Title', kind: 'field', icon: 'title', fields };
}
