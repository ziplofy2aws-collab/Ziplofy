import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const MULTICOLUMN_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(MULTICOLUMN_PANEL_GROUP_ORDER);

const BORDER_KEYS = new Set([
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'borderColor',
  'cornerRadius',
]);

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
  backgroundColor: 23,
  backgroundOverlay: 24,
  borderStyle: 30,
  borderThickness: 31,
  borderOpacity: 32,
  borderColor: 33,
  cornerRadius: 34,
  paddingTop: 40,
  paddingBottom: 41,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isMulticolumnSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'multicolumn' || catalogVariant === 'multicolumn';
}

export function isMulticolumnPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'customCss') return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  if (BORDER_KEYS.has(key)) return true;
  return Boolean(field.group && PANEL_GROUPS.has(field.group));
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
    Borders: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const keyA = a.path.split('.').pop() ?? '';
    const keyB = b.path.split('.').pop() ?? '';
    const ga = groupRank[BORDER_KEYS.has(keyA) ? 'Borders' : (a.group ?? '')] ?? 9;
    const gb = groupRank[BORDER_KEYS.has(keyB) ? 'Borders' : (b.group ?? '')] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupMulticolumnPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    const group = BORDER_KEYS.has(key)
      ? 'Borders'
      : field.group && PANEL_GROUPS.has(field.group)
        ? field.group
        : 'Layout';
    const list = map.get(group) ?? [];
    list.push(
      key === 'borderStyle'
        ? { ...field, label: 'Style', group: 'Borders' }
        : BORDER_KEYS.has(key)
          ? { ...field, group: 'Borders' }
          : field
    );
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

export function prepareMulticolumnSettingsNode(node: SidebarNode): SidebarNode {
  const filtered = filterSidebarSectionPanelFields(node.fields ?? [], isMulticolumnPanelField);
  const settingsBase =
    filtered
      .find((field) => !field.path.includes('.blocks.'))
      ?.path.match(/^(.*?\.settings)\./)?.[1] ?? null;
  const hasSectionKey = (key: string) =>
    filtered.some(
      (field) =>
        !field.path.includes('.blocks.') &&
        field.path === `${settingsBase}.${key}`
    );
  const extra: EditorFieldDef[] = [];
  const add = (key: string, field: Omit<EditorFieldDef, 'path'>) => {
    if (settingsBase && !hasSectionKey(key)) {
      extra.push({ path: `${settingsBase}.${key}`, ...field });
    }
  };

  add('borderStyle', {
    type: 'select',
    label: 'Style',
    group: 'Borders',
    widget: 'segmented',
    sidebar: true,
    options: [
      { value: 'none', label: 'None' },
      { value: 'solid', label: 'Solid' },
    ],
  });
  add('borderThickness', {
    type: 'number', label: 'Thickness', group: 'Borders', widget: 'slider',
    min: 0, max: 10, step: 1, unit: 'px', sidebar: true,
  });
  add('borderOpacity', {
    type: 'number', label: 'Opacity', group: 'Borders', widget: 'slider',
    min: 0, max: 100, step: 1, unit: '%', sidebar: true,
  });
  add('borderColor', {
    type: 'color', label: 'Color', group: 'Borders', widget: 'color', sidebar: true,
  });
  add('cornerRadius', {
    type: 'number', label: 'Corner radius', group: 'Borders', widget: 'slider',
    min: 0, max: 40, step: 1, unit: 'px', sidebar: true,
  });

  const fields = sortMulticolumnPanelFields([...filtered, ...extra]);
  return { ...node, label: 'Multicolumn', kind: 'section', fields };
}

export function prepareMulticolumnBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter(isMulticolumnBlockField);
  return { ...node, label: node.label || 'Column', kind: 'block', fields };
}
