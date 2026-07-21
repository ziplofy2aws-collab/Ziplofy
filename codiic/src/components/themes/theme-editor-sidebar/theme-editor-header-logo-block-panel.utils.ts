import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../../utils/theme-editor-insert-section';

const LOGO_BLOCK_PANEL_KEYS = new Set(['text', 'tagline', 'hideLogoOnHomePage', 'paddingTop', 'paddingBottom']);

const LOGO_BLOCK_FIELD_ORDER = [
  'text',
  'tagline',
  'hideLogoOnHomePage',
  'paddingTop',
  'paddingBottom',
] as const;

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

function defaultLogoBlockFields(instanceId: string): EditorFieldDef[] {
  const base = `sections.${instanceId}.blocks.logo.settings`;
  return [
    {
      path: `${base}.text`,
      type: 'text',
      label: 'Store name',
      placeholder: 'My Store',
    },
    {
      path: `${base}.tagline`,
      type: 'text',
      label: 'Tagline',
      placeholder: 'Optional tagline',
    },
    {
      path: `${base}.hideLogoOnHomePage`,
      type: 'boolean',
      label: 'Hide logo on home page',
      description: 'Logo will remain visible when sticky header is active',
    },
    {
      path: `${base}.paddingTop`,
      type: 'number',
      label: 'Top',
      group: 'Desktop padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
    },
    {
      path: `${base}.paddingBottom`,
      type: 'number',
      label: 'Bottom',
      group: 'Desktop padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
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
    .filter(isHeaderLogoBlockPanelField)
    .map((f) => ({
      ...f,
      path: remapLayoutSchemaPath(f.path, instanceId),
    }));
  if (!fromSchema.some((f) => blockSettingKey(f.path) === 'text')) {
    const textField = defaultLogoBlockFields(instanceId).find(
      (f) => blockSettingKey(f.path) === 'text'
    );
    if (textField) fromSchema.unshift(textField);
  }
  return fromSchema;
}

export function prepareHeaderLogoBlockSettingsNode(node: SidebarNode): SidebarNode {
  const instanceId =
    instanceIdFromHeaderLogoBlockNodeId(node.id) ??
    node.id.replace(/^layout:/, '').split(':')[0] ??
    'header';
  const existing = node.fields ?? [];
  const defaults = defaultLogoBlockFields(instanceId);
  const fields = LOGO_BLOCK_FIELD_ORDER.map((key) => {
    return (
      pickHeaderLogoBlockField(existing, key) ??
      defaults.find((f) => blockSettingKey(f.path) === key)
    );
  }).filter((f): f is EditorFieldDef => Boolean(f));
  return { ...node, label: 'Logo', kind: 'block', fields };
}

export function headerLogoBlockFieldsFromNode(node: SidebarNode): EditorFieldDef[] {
  return (node.fields ?? []).filter(isHeaderLogoBlockPanelField);
}
