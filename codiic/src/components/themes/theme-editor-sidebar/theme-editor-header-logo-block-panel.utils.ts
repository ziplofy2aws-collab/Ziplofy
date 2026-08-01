import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../../utils/theme-editor-insert-section';

/** Catalog logo panel — image + store name only (no Create Theme padding/visibility chrome). */
const LOGO_BLOCK_PANEL_KEYS = new Set(['imageUrl', 'text']);

const LOGO_BLOCK_FIELD_ORDER = ['imageUrl', 'text'] as const;

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

export function isHeaderLogoBlockNodeId(nodeId: string): boolean {
  return /^layout:header(?:_\d+)?:block:logo$/.test(nodeId);
}

function defaultLogoBlockFields(instanceId: string): EditorFieldDef[] {
  const base = `sections.${instanceId}.blocks.logo.settings`;
  return [
    {
      path: `${base}.imageUrl`,
      type: 'text',
      label: 'Logo image',
      widget: 'image',
    },
    {
      path: `${base}.text`,
      type: 'text',
      label: 'Store name',
      placeholder: 'My Store',
    },
  ];
}

export function headerLogoBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === 'logo');
  if (!block?.settingsFields?.length) return defaultLogoBlockFields(instanceId);
  const fromSchema = block.settingsFields
    .filter((f) => f.sidebar !== false)
    .filter(isHeaderLogoBlockPanelField)
    .map((f) => ({
      ...f,
      path: remapLayoutSchemaPath(f.path, instanceId),
    }));
  const defaults = defaultLogoBlockFields(instanceId);
  const out: EditorFieldDef[] = [];
  for (const key of LOGO_BLOCK_FIELD_ORDER) {
    const found = fromSchema.find((f) => blockSettingKey(f.path) === key) ?? defaults.find((f) => blockSettingKey(f.path) === key);
    if (found) out.push(found);
  }
  return out.length ? out : defaults;
}

export function prepareHeaderLogoBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = LOGO_BLOCK_FIELD_ORDER.map((key) => pickHeaderLogoBlockField(node.fields ?? [], key)).filter(
    (f): f is EditorFieldDef => Boolean(f)
  );
  return { ...node, label: 'Logo', kind: 'block', fields };
}

export function headerLogoBlockFieldsFromNode(node: SidebarNode): EditorFieldDef[] {
  return (node.fields ?? []).filter(isHeaderLogoBlockPanelField);
}
