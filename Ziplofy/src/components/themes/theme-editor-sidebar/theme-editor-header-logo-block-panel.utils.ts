import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../../utils/theme-editor-insert-section';

const LOGO_BLOCK_PANEL_KEYS = new Set(['hideLogoOnHomePage', 'paddingTop', 'paddingBottom']);

function blockSettingKey(path: string): string {
  return path.split('.').pop() ?? '';
}

export function isHeaderLogoBlockPanelField(field: EditorFieldDef): boolean {
  if (!/\.blocks\.[^.]+\.settings\./.test(field.path)) return false;
  return LOGO_BLOCK_PANEL_KEYS.has(blockSettingKey(field.path));
}

export function isHeaderLogoBlockPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.length > 0 && fields.every(isHeaderLogoBlockPanelField);
}

export function pickHeaderLogoBlockField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => blockSettingKey(f.path) === key);
}

export function instanceIdFromHeaderLogoBlockNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(header(?:_\d+)?):block:logo$/);
  return m ? m[1] : null;
}

export function headerLogoBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === 'logo');
  if (!block?.settingsFields?.length) return [];
  return block.settingsFields
    .filter(isHeaderLogoBlockPanelField)
    .map((f) => ({
      ...f,
      path: remapLayoutSchemaPath(f.path, instanceId),
    }));
}

export function prepareHeaderLogoBlockSettingsNode(node: SidebarNode): SidebarNode {
  const order = ['hideLogoOnHomePage', 'paddingTop', 'paddingBottom'] as const;
  const fields = order
    .map((key) => pickHeaderLogoBlockField(node.fields ?? [], key))
    .filter((f): f is EditorFieldDef => Boolean(f));
  return { ...node, label: 'Logo', kind: 'block', fields };
}

export function headerLogoBlockFieldsFromNode(node: SidebarNode): EditorFieldDef[] {
  return (node.fields ?? []).filter(isHeaderLogoBlockPanelField);
}
