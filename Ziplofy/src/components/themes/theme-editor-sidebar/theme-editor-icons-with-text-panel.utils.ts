import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const ICONS_WITH_TEXT_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(ICONS_WITH_TEXT_PANEL_GROUP_ORDER);

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

function iconsWithTextPanelGroupForKey(key: string, fallback?: string): string {
  if (BORDER_KEYS.has(key)) return 'Borders';
  if (fallback && PANEL_GROUPS.has(fallback)) return fallback;
  return 'Layout';
}

export function isIconsWithTextSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'icons-with-text' || catalogVariant === 'icons-with-text';
}

export function isIconsWithTextPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'customCss') return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  if (BORDER_KEYS.has(key)) return true;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
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
    Borders: 3,
    Padding: 4,
  };
  return [...fields].sort((a, b) => {
    const keyA = a.path.split('.').pop() ?? '';
    const keyB = b.path.split('.').pop() ?? '';
    const ga = groupRank[iconsWithTextPanelGroupForKey(keyA, a.group)] ?? 9;
    const gb = groupRank[iconsWithTextPanelGroupForKey(keyB, b.group)] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupIconsWithTextPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const key = field.path.split('.').pop() ?? '';
    const group = iconsWithTextPanelGroupForKey(key, field.group);
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

export function isIconsWithTextSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('verticalOnMobile') &&
    keys.has('direction') &&
    keys.has('layoutGap') &&
    path.includes('icons_with_text')
  );
}

export function prepareIconsWithTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortIconsWithTextPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isIconsWithTextPanelField).map((field) => {
      const key = field.path.split('.').pop() ?? '';
      if (key === 'borderStyle') return { ...field, label: 'Style', group: 'Borders' };
      if (BORDER_KEYS.has(key)) return { ...field, group: 'Borders' };
      return field;
    })
  );
  return { ...node, label: 'Icons with text', kind: 'section', fields };
}

export function prepareIconsWithTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter(isIconsWithTextBlockField);
  return { ...node, label: node.label || 'Icon with text', kind: 'block', fields };
}
