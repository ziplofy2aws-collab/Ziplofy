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

const IMAGE_HEIGHT_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const;

const IMAGE_RATIO_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
] as const;

/** Build Image panel fields from a block settings base (fallback when schema lookup misses). */
function collectionLinkImageFieldDefsFromSettingsBase(settingsBase: string): EditorFieldDef[] {
  return sortCollectionLinkImagePanelFields([
    {
      path: `${settingsBase}.imageHeight`,
      type: 'select',
      label: 'Height',
      widget: 'select',
      options: [...IMAGE_HEIGHT_OPTIONS],
    },
    {
      path: `${settingsBase}.imageRatio`,
      type: 'select',
      label: 'Ratio',
      widget: 'select',
      options: [...IMAGE_RATIO_OPTIONS],
    },
    {
      path: `${settingsBase}.imageCornerRadius`,
      type: 'number',
      label: 'Corner radius',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
    },
  ]);
}

function settingsBaseFromImageFieldPath(path: string): string | null {
  const tpl = path.match(
    /^templates\.[^.]+\.sections\.[^.]+\.blocks\.[^.]+\.settings\.imageUrl$/
  );
  if (tpl) return path.replace(/\.imageUrl$/, '');
  const layout = path.match(/^sections\.[^.]+\.blocks\.[^.]+\.settings\.imageUrl$/);
  if (layout) return path.replace(/\.imageUrl$/, '');
  return null;
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
    if (settingsFields.length) {
      const fromSchema = sortCollectionLinkImagePanelFields(
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
      if (fromSchema.length) return fromSchema;
    }
  }

  const layoutMatch = path.match(/^sections\.([^.]+)\.blocks\.([^.]+)\.settings\.imageUrl$/);
  if (layoutMatch) {
    const [, secId, blockId] = layoutMatch;
    const blueprint = layoutBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(editorSchema, blueprint, 'layout');
    if (settingsFields.length) {
      const fromSchema = sortCollectionLinkImagePanelFields(
        settingsFields
          .filter((f) => IMAGE_KEY_SET.has(f.path.split('.').pop() ?? ''))
          .map((f) => ({
            ...f,
            path: f.path
              .replace(/^sections\.[^.]+\./, `sections.${secId}.`)
              .replace(/\.blocks\.collection_link\./, `.blocks.${blockId}.`),
          }))
      );
      if (fromSchema.length) return fromSchema;
    }
  }

  const settingsBase = settingsBaseFromImageFieldPath(path);
  if (settingsBase) return collectionLinkImageFieldDefsFromSettingsBase(settingsBase);

  return [];
}

export function prepareCollectionLinkImageSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortCollectionLinkImagePanelFields(
    (node.fields ?? []).filter(isCollectionLinkImagePanelField)
  );
  return { ...node, label: 'Image', kind: 'field', icon: 'image', fields };
}
