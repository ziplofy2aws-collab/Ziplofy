import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

/** Shopify-style Image with text section settings sheet order. */
export const IMAGE_WITH_TEXT_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(IMAGE_WITH_TEXT_PANEL_GROUP_ORDER);

export const IMAGE_WITH_TEXT_SECTION_FIELD_KEYS = new Set([
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
  'sectionWidth',
  'height',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundColor',
  'backgroundOverlay',
  'borderStyle',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'customCss',
]);

const FIELD_SORT: Record<string, number> = {
  direction: 0,
  verticalOnMobile: 1,
  layoutAlignment: 2,
  position: 3,
  layoutGap: 4,
  sectionWidth: 10,
  height: 11,
  backgroundMedia: 21,
  backgroundImageUrl: 22,
  backgroundColor: 23,
  backgroundOverlay: 24,
  borderStyle: 26,
  cornerRadius: 27,
  paddingTop: 30,
  paddingBottom: 31,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isImageWithTextSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'image-with-text' || catalogVariant === 'image-with-text';
}

export function isImageWithTextPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!IMAGE_WITH_TEXT_SECTION_FIELD_KEYS.has(key)) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path) && !/\.templates\.[^.]+\.sections\.[^.]+\.settings\./.test(field.path)) {
    return false;
  }
  if (key === 'borderStyle' || key === 'cornerRadius') return true;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function sortImageWithTextPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupImageWithTextPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isImageWithTextPanelField)) {
    const key = field.path.split('.').pop() ?? '';
    let group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    let panelField = field;
    if (key === 'borderStyle') {
      group = 'Borders';
      panelField = { ...field, label: 'Style', group: 'Borders' };
    } else if (key === 'cornerRadius') {
      group = 'Borders';
      panelField = { ...field, group: 'Borders' };
    }
    const list = map.get(group) ?? [];
    list.push(panelField);
    map.set(group, list);
  }
  return map;
}

export function isImageWithTextSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  if (!path.includes('image_with_text')) return false;
  /** Collection links also has imageUrl — do not classify as Image with text. */
  if (keys.has('collectionsPicker') || keys.has('layoutMode')) return false;
  if (!keys.has('direction') || !keys.has('layoutGap') || !keys.has('height')) return false;
  if (keys.has('imageUrl') && !keys.has('colorScheme')) return false;
  if (keys.has('heading') && keys.has('headingWidth') && !keys.has('colorScheme')) return false;
  if (keys.has('descriptionWidth') && !keys.has('colorScheme')) return false;
  if (keys.has('buttonLabel') && !keys.has('colorScheme')) return false;
  if (keys.has('buttonStyle') && !keys.has('colorScheme')) return false;
  return !keys.has('imageBeforeUrl');
}

export function prepareImageWithTextSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortImageWithTextPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isImageWithTextPanelField)
  );
  return { ...node, label: 'Image with text', kind: 'section', fields };
}
