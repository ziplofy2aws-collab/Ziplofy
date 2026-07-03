import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

/** Shopify Horizon FAQ section settings order (matches theme editor screenshots). */
export const FAQ_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
  'Custom CSS',
] as const;

export const FAQ_LAYOUT_FIELD_ORDER = [
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

export const FAQ_SIZE_FIELD_ORDER = ['sectionWidth', 'height'] as const;

export const FAQ_APPEARANCE_FIELD_ORDER = [
  'backgroundMedia',
  'backgroundImagePosition',
  'backgroundOverlay',
] as const;

export const FAQ_BORDERS_FIELD_ORDER = [
  'borderStyle',
  'borderThickness',
  'borderOpacity',
  'borderColor',
  'cornerRadius',
] as const;

export const FAQ_PADDING_FIELD_ORDER = ['paddingTop', 'paddingBottom'] as const;

const PANEL_GROUPS = new Set<string>(FAQ_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  layoutAlignment: 1,
  position: 2,
  layoutGap: 3,
  sectionWidth: 10,
  height: 11,
  backgroundMedia: 20,
  backgroundImageUrl: 21,
  backgroundImagePosition: 22,
  backgroundOverlay: 23,
  colorScheme: 24,
  borderStyle: 30,
  borderThickness: 31,
  borderOpacity: 32,
  borderColor: 33,
  cornerRadius: 34,
  paddingTop: 40,
  paddingBottom: 41,
  customCss: 50,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isFaqSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'faq' || catalogVariant === 'faq';
}

export function isFaqPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function isFaqBlockField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return key === 'question' || key === 'answer';
}

export function sortFaqPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function sortFaqGroupFields(
  fields: EditorFieldDef[],
  order: readonly string[]
): EditorFieldDef[] {
  const rank = (path: string) => {
    const key = path.split('.').pop() ?? '';
    const idx = order.indexOf(key);
    return idx >= 0 ? idx : 99;
  };
  return [...fields].sort((a, b) => rank(a.path) - rank(b.path));
}

export function groupFaqPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    if (group === 'Layout') map.set(group, sortFaqGroupFields(list, FAQ_LAYOUT_FIELD_ORDER));
    else if (group === 'Size') map.set(group, sortFaqGroupFields(list, FAQ_SIZE_FIELD_ORDER));
    else if (group === 'Appearance') {
      map.set(group, sortFaqGroupFields(list, FAQ_APPEARANCE_FIELD_ORDER));
    } else if (group === 'Borders') {
      map.set(group, sortFaqGroupFields(list, FAQ_BORDERS_FIELD_ORDER));
    } else if (group === 'Padding') {
      map.set(group, sortFaqGroupFields(list, FAQ_PADDING_FIELD_ORDER));
    }
  }
  return map;
}

export function isFaqSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (
    keys.has('caption') ||
    keys.has('videoUrl') ||
    keys.has('logoText') ||
    keys.has('imageBeforeUrl') ||
    keys.has('imageUrl') ||
    keys.has('jumboText')
  ) {
    return false;
  }
  return (
    keys.has('direction') &&
    keys.has('layoutGap') &&
    keys.has('layoutAlignment') &&
    (keys.has('backgroundMedia') || keys.has('borderStyle'))
  );
}

export function prepareFaqSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortFaqPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isFaqPanelField)
  );
  return { ...node, label: 'FAQ', kind: 'section', fields };
}

export function prepareFaqBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = (node.fields ?? []).filter(isFaqBlockField);
  return { ...node, label: node.label || 'Question', kind: 'block', fields };
}
