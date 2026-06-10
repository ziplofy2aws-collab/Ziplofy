import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const RICH_TEXT_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(RICH_TEXT_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  layoutAlignment: 1,
  position: 2,
  layoutGap: 3,
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

export function isRichTextSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'rich-text' || catalogVariant === 'rich-text';
}

export function isRichTextPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortRichTextPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupRichTextPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isRichTextSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('layoutGap') &&
    keys.has('direction') &&
    keys.has('layoutAlignment') &&
    !keys.has('quote') &&
    path.includes('rich_text')
  );
}

export type RichTextBlockKind = 'heading' | 'text' | 'button';

export function isRichTextSectionInstanceId(secId: string): boolean {
  return secId.includes('rich_text') || secId === 'rich_text_section';
}

export function richTextSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:heading|text|button)$/);
  if (layout) {
    const secId = layout[1]!;
    if (!isRichTextSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:heading|text|button)$/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isRichTextSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function richTextBlockKindFromNodeId(nodeId: string): RichTextBlockKind | null {
  const m = nodeId.match(/:block:(heading|text|button)$/);
  return (m?.[1] as RichTextBlockKind | undefined) ?? null;
}

export function isRichTextBlockNodeId(nodeId: string): boolean {
  return richTextSectionBaseFromNodeId(nodeId) !== null;
}

export function isRichTextBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!field.path.includes('rich_text') || field.path.includes('.blocks.')) return false;
  if (key === 'heading' || key === 'text') return true;
  return key === 'buttonLabel' || key === 'buttonUrl';
}

export function isRichTextBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isRichTextBlockField);
}

export function richTextBlockFieldDefs(
  sectionBase: string,
  blockKind: RichTextBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'heading') {
    return [
      {
        path: s('heading'),
        type: 'textarea',
        label: 'Heading',
        widget: 'richtext',
        group: 'Content',
        sidebar: true,
      },
    ];
  }
  if (blockKind === 'text') {
    return [
      {
        path: s('text'),
        type: 'textarea',
        label: 'Text',
        widget: 'richtext',
        group: 'Content',
        sidebar: true,
      },
    ];
  }
  return [
    {
      path: s('buttonLabel'),
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('buttonUrl'),
      type: 'text',
      label: 'Link',
      group: 'Content',
      sidebar: true,
      placeholder: 'Paste a link or search',
    },
  ];
}

export function richTextBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = richTextSectionBaseFromNodeId(nodeId);
  const blockKind = richTextBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return richTextBlockFieldDefs(sectionBase, blockKind);
}

export function prepareRichTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = richTextBlockKindFromNodeId(node.id);
  const label =
    blockKind === 'heading' ? 'Heading' : blockKind === 'text' ? 'Text' : blockKind === 'button' ? 'Button' : node.label;
  const fromNode = richTextBlockFieldDefsFromNodeId(node.id);
  const fields = fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isRichTextBlockField);
  return { ...node, label, kind: 'block', fields };
}

export function prepareRichTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortRichTextPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isRichTextPanelField)
  );
  return { ...node, label: 'Rich text', kind: 'section', fields };
}
