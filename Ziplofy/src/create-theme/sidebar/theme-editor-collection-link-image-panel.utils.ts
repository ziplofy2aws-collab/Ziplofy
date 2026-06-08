import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import {
  layoutBlueprintKey,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from '../../utils/theme-editor-insert-section';
import { collectionLinkBlueprintSettingsFields } from './theme-editor-collection-link-title-panel.utils';

export const COLLECTION_LINK_IMAGE_KEYS = [
  'imageHeight',
  'imageRatio',
  'imageCornerRadius',
] as const;

const IMAGE_KEY_SET = new Set<string>(COLLECTION_LINK_IMAGE_KEYS);

const FIELD_SORT: Record<string, number> = {
  imageHeight: 0,
  imageRatio: 1,
  imageCornerRadius: 2,
};

export function isCollectionLinkImageFieldNodeId(nodeId: string): boolean {
  if (!nodeId.startsWith('field:')) return false;
  const path = nodeId.slice('field:'.length);
  return (
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.[^.]+\.settings\.imageUrl$/.test(path) ||
    /^sections\.[^.]+\.blocks\.[^.]+\.settings\.imageUrl$/.test(path)
  );
}

export function isCollectionLinkImagePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return IMAGE_KEY_SET.has(key);
}

export function isCollectionLinkImagePanelFields(fields: EditorFieldDef[]): boolean {
  return fields.length > 0 && fields.every(isCollectionLinkImagePanelField);
}

export function sortCollectionLinkImagePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return [...fields].sort(
    (a, b) =>
      (FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 9) -
      (FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 9)
  );
}

export function collectionLinkImageFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  fieldNodeId: string
): EditorFieldDef[] {
  const path = fieldNodeId.startsWith('field:') ? fieldNodeId.slice('field:'.length) : fieldNodeId;

  const tplMatch = path.match(
    /^templates\.([^.]+)\.sections\.([^.]+)\.blocks\.([^.]+)\.settings\.imageUrl$/
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
    return sortCollectionLinkImagePanelFields(
      settingsFields
        .filter((f) => IMAGE_KEY_SET.has(f.path.split('.').pop() ?? ''))
        .map((f) => ({
          ...f,
          path: remapTemplateSchemaPath(f.path, tplId, secId).replace(
            /\.blocks\.collection_link\./,
            `.blocks.${blockId}.`
          ),
        }))
    );
  }

  const layoutMatch = path.match(/^sections\.([^.]+)\.blocks\.([^.]+)\.settings\.imageUrl$/);
  if (layoutMatch) {
    const [, secId, blockId] = layoutMatch;
    const blueprint = layoutBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(editorSchema, blueprint, 'layout');
    if (!settingsFields.length) return [];
    return sortCollectionLinkImagePanelFields(
      settingsFields
        .filter((f) => IMAGE_KEY_SET.has(f.path.split('.').pop() ?? ''))
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

export function prepareCollectionLinkImageSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionLinkImagePanelFields(
    (node.fields ?? []).filter(isCollectionLinkImagePanelField)
  );
  return { ...node, label: 'Image', kind: 'field', icon: 'image', fields };
}
