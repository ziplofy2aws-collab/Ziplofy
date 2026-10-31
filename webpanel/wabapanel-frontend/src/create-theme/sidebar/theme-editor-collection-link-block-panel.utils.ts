import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { layoutBlueprintKey, remapTemplateSchemaPath, templateBlueprintKey, findSectionSchemaByBlueprint } from '../../utils/theme-editor-insert-section';
import { collectionLinkBlueprintSettingsFields } from './theme-editor-collection-link-title-panel.utils';

const BLOCK_PANEL_KEYS = new Set(['showCount']);

export function isCollectionLinkBlockNodeId(nodeId: string): boolean {
  return (
    /^template:[^:]+:(?:collection_links_spotlight|collection_links_text)(?:_\d+)?:block:[^:]+$/.test(
      nodeId
    ) || /^layout:(?:collection_links_spotlight|collection_links_text)(?:_\d+)?:block:[^:]+$/.test(nodeId)
  );
}

export function isCollectionLinkBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return /\.blocks\.[^.]+\.settings\./.test(field.path) && BLOCK_PANEL_KEYS.has(key);
}

export function isCollectionLinkBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isCollectionLinkBlockField);
}

function blockSettingsBaseFromNodeId(nodeId: string): string | null {
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:([^:]+)$/);
  if (tpl) {
    return `templates.${tpl[1]}.sections.${tpl[2]}.blocks.${tpl[3]}.settings`;
  }
  const layout = nodeId.match(/^layout:([^:]+):block:([^:]+)$/);
  if (layout) {
    return `sections.${layout[1]}.blocks.${layout[2]}.settings`;
  }
  return null;
}

function collectionLinkBlockFieldDefsFromSettingsBase(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: `${settingsBase}.showCount`,
      type: 'boolean',
      label: 'Show count',
      widget: 'toggle',
    },
  ];
}

export function collectionLinkBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  blockNodeId: string
): EditorFieldDef[] {
  const settingsBase = blockSettingsBaseFromNodeId(blockNodeId);
  if (!settingsBase) return [];

  const tpl = blockNodeId.match(/^template:([^:]+):([^:]+):block:([^:]+)$/);
  if (tpl) {
    const [, tplId, secId, blockId] = tpl;
    const blueprint = templateBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(
      editorSchema,
      blueprint,
      'template',
      tplId
    );
    if (settingsFields.length) {
      const showCount = settingsFields.find((f) => f.path.endsWith('.showCount'));
      if (showCount) {
        return [
          {
            ...showCount,
            path: remapTemplateSchemaPath(showCount.path, tplId, secId).replace(
              /\.blocks\.collection_link\./,
              `.blocks.${blockId}.`
            ),
          },
        ];
      }
    }
  }

  const layout = blockNodeId.match(/^layout:([^:]+):block:([^:]+)$/);
  if (layout) {
    const [, secId, blockId] = layout;
    const blueprint = layoutBlueprintKey(secId);
    const settingsFields = collectionLinkBlueprintSettingsFields(editorSchema, blueprint, 'layout');
    const showCount = settingsFields.find((f) => f.path.endsWith('.showCount'));
    if (showCount) {
      return [
        {
          ...showCount,
          path: showCount.path
            .replace(/^sections\.[^.]+\./, `sections.${secId}.`)
            .replace(/\.blocks\.collection_link\./, `.blocks.${blockId}.`),
        },
      ];
    }
  }

  return collectionLinkBlockFieldDefsFromSettingsBase(settingsBase);
}

export function prepareCollectionLinkBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])].filter(isCollectionLinkBlockField);
  return { ...node, label: 'Collection', kind: 'block', icon: 'product-card', fields };
}
