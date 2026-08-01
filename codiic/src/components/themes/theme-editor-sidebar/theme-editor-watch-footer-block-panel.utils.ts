import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../../utils/theme-editor-insert-section';

const FOOTER_BLOCK_IDS = new Set([
  'brand',
  'menu_main',
  'menu_help',
  'menu_collections',
  'bottom_links',
]);

function blockSettingKey(path: string): string {
  return path.split('.').pop() ?? '';
}

export function isWatchFooterBrandBlockNodeId(nodeId: string): boolean {
  return /^layout:footer(?:_\d+)?:block:brand$/.test(nodeId);
}

export function isWatchFooterMenuColumnBlockNodeId(nodeId: string): boolean {
  return /^layout:footer(?:_\d+)?:block:menu_(main|help|collections)$/.test(nodeId);
}

export function isWatchFooterBottomLinksBlockNodeId(nodeId: string): boolean {
  return /^layout:footer(?:_\d+)?:block:bottom_links$/.test(nodeId);
}

export function isWatchFooterEditableBlockNodeId(nodeId: string): boolean {
  return (
    isWatchFooterBrandBlockNodeId(nodeId) ||
    isWatchFooterMenuColumnBlockNodeId(nodeId) ||
    isWatchFooterBottomLinksBlockNodeId(nodeId)
  );
}

export function instanceIdFromWatchFooterBlockNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(footer(?:_\d+)?):block:/);
  return m ? m[1] : null;
}

export function blockIdFromWatchFooterBlockNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:footer(?:_\d+)?:block:([^:]+)$/);
  return m ? m[1] : null;
}

/** Map preview field clicks onto footer block rows. */
export function watchFooterBlockNodeIdFromSelection(nodeId: string): string | null {
  if (isWatchFooterEditableBlockNodeId(nodeId)) return nodeId;
  const m = nodeId.match(
    /^field:sections\.(footer(?:_\d+)?)\.blocks\.(brand|menu_main|menu_help|menu_collections|bottom_links)\./
  );
  if (m) return `layout:${m[1]}:block:${m[2]}`;
  return null;
}

export function pickWatchFooterBlockField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => blockSettingKey(f.path) === key);
}

/** Catalog footer blocks: only sidebar:true fields, flat — no Create Theme menu/chrome. */
export function watchFooterBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string,
  blockId: string
): EditorFieldDef[] {
  if (!FOOTER_BLOCK_IDS.has(blockId)) return [];
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === blockId);
  if (!block?.settingsFields?.length) return [];
  return block.settingsFields
    .filter((f) => f.sidebar !== false)
    .map((f) => ({
      ...f,
      path: remapLayoutSchemaPath(f.path, instanceId),
    }));
}

export function prepareWatchFooterBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter((f) => f.sidebar !== false);
  return { ...node, kind: 'block', fields };
}

export function prepareWatchFooterBrandSettingsNode(node: SidebarNode): SidebarNode {
  return prepareWatchFooterBlockSettingsNode({ ...node, label: 'Brand' });
}

export function prepareWatchFooterMenuColumnSettingsNode(node: SidebarNode): SidebarNode {
  return prepareWatchFooterBlockSettingsNode(node);
}

export function prepareWatchFooterBottomLinksSettingsNode(node: SidebarNode): SidebarNode {
  return prepareWatchFooterBlockSettingsNode({ ...node, label: 'Bottom links' });
}

export function watchFooterBrandFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  return watchFooterBlockFieldDefsFromSchema(editorSchema, instanceId, 'brand');
}

export function watchFooterMenuColumnFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string,
  blockId: string
): EditorFieldDef[] {
  return watchFooterBlockFieldDefsFromSchema(editorSchema, instanceId, blockId);
}

export function watchFooterBottomLinksFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  return watchFooterBlockFieldDefsFromSchema(editorSchema, instanceId, 'bottom_links');
}
