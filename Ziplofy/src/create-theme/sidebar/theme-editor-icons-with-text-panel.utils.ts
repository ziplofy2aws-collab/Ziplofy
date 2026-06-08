import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const ICON_WITH_TEXT_ICON_OPTIONS = [
  { value: 'eye', label: 'Eye' },
  { value: 'heart', label: 'Heart' },
  { value: 'person', label: 'Person' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'truck', label: 'Truck' },
  { value: 'shield', label: 'Shield' },
  { value: 'star', label: 'Star' },
  { value: 'gift', label: 'Gift' },
] as const;

export const ICONS_WITH_TEXT_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(ICONS_WITH_TEXT_PANEL_GROUP_ORDER);

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

export function isIconsWithTextSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'icons-with-text' || catalogVariant === 'icons-with-text';
}

export function isIconsWithTextPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function isIconsWithTextBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'icon' || key === 'heading' || key === 'text';
}

export function sortIconsWithTextPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupIconsWithTextPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isIconsWithTextSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (
    keys.has('caption') ||
    keys.has('videoUrl') ||
    keys.has('heading') ||
    keys.has('openFirstItem') ||
    keys.has('logoText')
  ) {
    return false;
  }
  const path = fields[0]?.path ?? '';
  return (
    keys.has('verticalOnMobile') &&
    keys.has('direction') &&
    keys.has('layoutGap') &&
    keys.has('columns') &&
    (path.includes('icons_with_text') || path.includes('icons-with-text'))
  );
}

export function iconsWithTextBlocksBaseFromNodeId(nodeId: string): string | null {
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  const layout = nodeId.match(/^layout:([^:]+):block:/);
  if (layout) return `sections.${layout[1]}`;
  return null;
}

export function iconsWithTextBlockInstanceIdFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/:block:(.+)$/);
  return m?.[1] ?? null;
}

export function isIconsWithTextBlockNodeId(nodeId: string): boolean {
  const tpl = nodeId.match(/^template:([^:]+):(icons_with_text[^:]*):block:/);
  if (tpl) return true;
  const layout = nodeId.match(/^layout:(icons_with_text[^:]*):block:/);
  return Boolean(layout);
}

export function iconWithTextBlockFieldDefs(
  blocksBase: string,
  blockInstanceId: string
): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.blocks.${blockInstanceId}.settings.${key}`;
  return [
    {
      path: s('icon'),
      type: 'select',
      label: 'Icon',
      group: 'Content',
      widget: 'select',
      sidebar: true,
      options: [...ICON_WITH_TEXT_ICON_OPTIONS],
    },
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

export function iconWithTextBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = iconsWithTextBlocksBaseFromNodeId(nodeId);
  const blockId = iconsWithTextBlockInstanceIdFromNodeId(nodeId);
  if (!base || !blockId) return [];
  return iconWithTextBlockFieldDefs(base, blockId);
}

export function prepareIconsWithTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortIconsWithTextPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isIconsWithTextPanelField)
  );
  return { ...node, label: 'Icons with text', kind: 'section', fields };
}

export function prepareIconsWithTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fromNode = iconWithTextBlockFieldDefsFromNodeId(node.id);
  const fields =
    fromNode.length > 0
      ? fromNode
      : (node.fields ?? []).filter(isIconsWithTextBlockField);
  return { ...node, label: node.label || 'Icon with text', kind: 'block', fields };
}
