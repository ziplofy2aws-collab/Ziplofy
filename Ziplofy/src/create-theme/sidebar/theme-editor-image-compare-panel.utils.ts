import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

/** Shopify-style Image compare section settings sheet order. */
export const IMAGE_COMPARE_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Borders',
  'Padding',
  'Theme Settings',
  'Custom CSS',
] as const;

export const IMAGE_COMPARE_LAYOUT_FIELD_ORDER = [
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
] as const;

const PANEL_GROUPS = new Set<string>(IMAGE_COMPARE_PANEL_GROUP_ORDER);

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
  colorScheme: 35,
  customCss: 40,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isImageCompareSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'image-compare' || catalogVariant === 'image-compare';
}

export function isImageComparePanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

function remapImageCompareField(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  let next = { ...field };

  if (key === 'verticalOnMobile') {
    next = { ...next, label: 'Vertical on mobile', widget: 'toggle', group: 'Layout' };
  }
  if (key === 'direction') {
    next = { ...next, widget: 'segmented', group: 'Layout' };
  }
  if (key === 'layoutAlignment') {
    next = { ...next, widget: 'select-inline', group: 'Layout' };
  }
  if (key === 'position') {
    next = { ...next, widget: 'select-inline', group: 'Layout' };
  }
  if (key === 'layoutGap') {
    next = { ...next, widget: 'slider', group: 'Layout' };
  }
  if (key === 'sectionWidth') {
    next = { ...next, widget: 'segmented', group: 'Size' };
  }
  if (key === 'height') {
    next = { ...next, widget: 'select-inline', group: 'Size' };
  }
  if (key === 'colorScheme') {
    next = { ...next, widget: 'color-scheme', group: 'Theme Settings' };
  }
  if (key === 'backgroundMedia') {
    next = { ...next, group: 'Appearance', widget: 'select-inline' };
  }
  if (key === 'backgroundImageUrl') {
    next = { ...next, group: 'Appearance', widget: 'image' };
  }
  if (key === 'backgroundColor') {
    next = { ...next, group: 'Appearance', widget: 'color', type: 'color' };
  }
  if (key === 'borderStyle') {
    next = { ...next, label: 'Style', group: 'Borders', widget: 'segmented' };
  }
  if (key === 'cornerRadius') {
    next = { ...next, group: 'Borders', widget: 'slider' };
  }
  if (key === 'backgroundOverlay') {
    next = { ...next, group: 'Appearance', widget: 'toggle' };
  }
  if (key === 'paddingTop' || key === 'paddingBottom') {
    next = { ...next, group: 'Padding', widget: 'slider' };
  }
  if (key === 'customCss') {
    next = { ...next, group: 'Custom CSS', widget: 'accordion' };
  }

  return next;
}

export function sortImageComparePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Borders: 3,
    Padding: 4,
    'Theme Settings': 5,
    'Custom CSS': 6,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupImageComparePanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isImageComparePanelField).map(remapImageCompareField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isImageCompareSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const path = fields[0]?.path ?? '';
  if (!path.includes('image_compare')) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('direction') && keys.has('layoutGap') && keys.has('height') && keys.has('sectionWidth');
}

export function prepareImageCompareSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortImageComparePanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isImageComparePanelField).map(remapImageCompareField)
  );
  return { ...node, label: 'Image compare', kind: 'section', fields };
}
