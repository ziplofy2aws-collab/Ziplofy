import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const MULTICOLUMN_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(MULTICOLUMN_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  layoutGap: 4,
  sectionWidth: 10,
  height: 11,
  colorScheme: 20,
  backgroundMedia: 21,
  backgroundImageUrl: 22,
  borderStyle: 23,
  cornerRadius: 24,
  backgroundOverlay: 25,
  paddingTop: 30,
  paddingBottom: 31,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isMulticolumnSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'multicolumn' || catalogVariant === 'multicolumn';
}

export function isMulticolumnPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function isMulticolumnBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'heading' || key === 'text';
}

export function isMulticolumnBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isMulticolumnBlockField) && !fields.some((f) => f.path.endsWith('.icon'));
}

export function sortMulticolumnPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Padding: 3,
    'Custom CSS': 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupMulticolumnPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isMulticolumnSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('icon') || keys.has('openFirstItem') || keys.has('caption') || keys.has('videoUrl')) {
    return false;
  }
  const path = fields[0]?.path ?? '';
  return (
    keys.has('verticalOnMobile') &&
    keys.has('direction') &&
    keys.has('layoutGap') &&
    path.includes('multicolumn')
  );
}

export function multicolumnBlocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^(template:[^:]+:[^:]+|layout:[^:]+):block:[^:]+$/);
  if (!m) return null;
  const prefix = m[1];
  if (prefix.startsWith('template:')) {
    const [, tplId, secId] = prefix.split(':');
    return `templates.${tplId}.sections.${secId}`;
  }
  const secId = prefix.replace(/^layout:/, '');
  return `sections.${secId}`;
}

export function multicolumnBlockInstanceIdFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/:block:([^:]+)$/);
  return m?.[1] ?? null;
}

export function isMulticolumnBlockNodeId(nodeId: string): boolean {
  return /:block:column_/.test(nodeId);
}

export function multicolumnBlockFieldDefs(
  blocksBase: string,
  blockInstanceId: string
): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.blocks.${blockInstanceId}.settings.${key}`;
  return [
    {
      path: s('heading'),
      type: 'text',
      label: 'Heading',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('text'),
      type: 'textarea',
      label: 'Description',
      group: 'Content',
      sidebar: true,
    },
  ];
}

export function multicolumnBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = multicolumnBlocksBaseFromNodeId(nodeId);
  const blockId = multicolumnBlockInstanceIdFromNodeId(nodeId);
  if (!base || !blockId) return [];
  return multicolumnBlockFieldDefs(base, blockId);
}

export function prepareMulticolumnSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortMulticolumnPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isMulticolumnPanelField)
  );
  return { ...node, label: 'Multicolumn', kind: 'section', fields };
}

export function prepareMulticolumnBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = multicolumnBlockFieldDefsFromNodeId(node.id);
  const fields =
    fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isMulticolumnBlockField);
  return { ...node, label: node.label || 'Column', kind: 'block', fields };
}
