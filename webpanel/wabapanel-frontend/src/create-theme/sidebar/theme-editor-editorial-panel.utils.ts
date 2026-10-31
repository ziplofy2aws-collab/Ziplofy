import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

/** Shopify-style Editorial section settings sheet order. */
export const EDITORIAL_PANEL_GROUP_ORDER = ['General', 'Padding', 'Custom CSS'] as const;

const PANEL_GROUPS = new Set<string>(EDITORIAL_PANEL_GROUP_ORDER);

const SECTION_FIELD_KEYS = new Set([
  'mediaPosition',
  'mediaWidth',
  'mediaHeight',
  'sectionWidth',
  'backgroundColor',
  'paddingTop',
  'paddingBottom',
  'customCss',
]);

const FIELD_SORT: Record<string, number> = {
  mediaPosition: 0,
  mediaWidth: 1,
  mediaHeight: 2,
  sectionWidth: 3,
  backgroundColor: 4,
  paddingTop: 20,
  paddingBottom: 21,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function editorialSectionFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('mediaPosition'),
      type: 'select',
      label: 'Media position',
      group: 'General',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('mediaWidth'),
      type: 'select',
      label: 'Media width',
      group: 'General',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    },
    {
      path: s('mediaHeight'),
      type: 'select',
      label: 'Media height',
      group: 'General',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    },
    {
      path: s('sectionWidth'),
      type: 'select',
      label: 'Section width',
      group: 'General',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: s('backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'General',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('customCss'),
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    },
  ];
}

export function editorialSettingsBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:([^:]+)$/);
  if (layout) return `sections.${layout[1]}.settings`;
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}.settings`;
  return null;
}

export function isEditorialSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'editorial' || catalogVariant === 'editorial';
}

export function isEditorialPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  const key = field.path.split('.').pop() ?? '';
  if (!SECTION_FIELD_KEYS.has(key)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortEditorialPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    Padding: 1,
    'Custom CSS': 2,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupEditorialPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isEditorialPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isEditorialSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (!keys.has('mediaPosition') || !keys.has('sectionWidth')) return false;
  return !keys.has('subheading') && !keys.has('heading') && !keys.has('imageUrl');
}

export function prepareEditorialSettingsNode(node: SidebarNode): SidebarNode {
  const settingsBase = editorialSettingsBaseFromNodeId(node.id);
  const built = settingsBase ? editorialSectionFieldDefs(settingsBase) : [];
  const fromNode = sortEditorialPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isEditorialPanelField)
  );
  const byKey = new Map<string, EditorFieldDef>();
  for (const field of [...fromNode, ...built]) {
    byKey.set(field.path.split('.').pop() ?? field.path, field);
  }
  const fields = built.length ? built : [...byKey.values()];
  return { ...node, label: 'Editorial', kind: 'section', fields };
}
