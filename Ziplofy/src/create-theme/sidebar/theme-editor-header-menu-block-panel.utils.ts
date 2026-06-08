import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../utils/theme-editor-insert-section';

const MENU_BLOCK_PANEL_KEYS = new Set([
  'menu',
  'colorScheme',
  'topLevelSize',
  'submenuSize',
  'font',
  'textCase',
  'submenuMediaType',
  'submenuImageRatio',
  'submenuImageCornerRadius',
  'mobileNavigationBar',
  'mobileAccordion',
  'mobileDividers',
]);

const MENU_BLOCK_FIELD_ORDER = [
  'menu',
  'colorScheme',
  'topLevelSize',
  'submenuSize',
  'font',
  'textCase',
  'submenuMediaType',
  'submenuImageRatio',
  'submenuImageCornerRadius',
  'mobileNavigationBar',
  'mobileAccordion',
  'mobileDividers',
] as const;

function blockSettingKey(path: string): string {
  return path.split('.').pop() ?? '';
}

export function isHeaderMenuBlockPanelField(field: EditorFieldDef): boolean {
  if (!/\.blocks\.[^.]+\.settings\./.test(field.path)) return false;
  const key = blockSettingKey(field.path);
  if (!MENU_BLOCK_PANEL_KEYS.has(key)) return false;
  return field.path.includes('.blocks.menu.settings.');
}

export function isHeaderMenuBlockPanelFields(fields: EditorFieldDef[]): boolean {
  return fields.length > 0 && fields.every(isHeaderMenuBlockPanelField);
}

export function pickHeaderMenuBlockField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => blockSettingKey(f.path) === key);
}

export function instanceIdFromHeaderMenuBlockNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(header(?:_\d+)?):block:menu$/);
  return m ? m[1] : null;
}

export function headerMenuBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === 'menu');
  if (!block?.settingsFields?.length) return [];
  return block.settingsFields
    .filter(isHeaderMenuBlockPanelField)
    .map((f) => ({
      ...f,
      path: remapLayoutSchemaPath(f.path, instanceId),
    }));
}

export function prepareHeaderMenuBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = MENU_BLOCK_FIELD_ORDER.map((key) =>
    pickHeaderMenuBlockField(node.fields ?? [], key)
  ).filter((f): f is EditorFieldDef => Boolean(f));
  return { ...node, label: 'Menu', kind: 'block', fields };
}

export function headerMenuBlockFieldsFromNode(node: SidebarNode): EditorFieldDef[] {
  return (node.fields ?? []).filter(isHeaderMenuBlockPanelField);
}
