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
    if (!settingsFields.length) return [];
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

  const layoutMatch = path.match(/^sections\.([^.]+)\.blocks\.([^.]+)\.settings\.title$/);
  if (layoutMatch) {
    const [, secId, blockId] = layoutMatch;
    const blueprint = layoutBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(editorSchema, blueprint, 'layout');
    if (!settingsFields.length) return [];
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

  return [];
}

export function prepareCollectionLinkTitleSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionLinkTitlePanelFields(
    (node.fields ?? []).filter(isCollectionLinkTitlePanelField)
  );
  return { ...node, label: 'Title', kind: 'field', icon: 'title', fields };
}
