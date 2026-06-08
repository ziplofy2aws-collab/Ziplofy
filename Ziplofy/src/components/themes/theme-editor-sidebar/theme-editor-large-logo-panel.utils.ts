import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { enrichHeroPanelField, isHeroSettingsPath } from './theme-editor-hero-panel.utils';

export const LARGE_LOGO_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Padding',
  'Theme Settings',
  'Custom CSS',
] as const;

const LARGE_LOGO_PANEL_KEYS = new Set([
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
  'sectionWidth',
  'height',
  'colorScheme',
  'backgroundMedia',
  'backgroundImageUrl',
  'borderStyle',
  'cornerRadius',
  'mediaOverlay',
  'paddingTop',
  'paddingBottom',
  'defaultLogoUrl',
  'customCss',
]);

const LAYOUT_KEYS = new Set(['direction', 'layoutAlignment', 'position', 'layoutGap']);
const SIZE_KEYS = new Set(['sectionWidth', 'height']);

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
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
    mediaOverlay: 25,
    paddingTop: 30,
    paddingBottom: 31,
    defaultLogoUrl: 40,
    customCss: 50,
  };
  return rank[key] ?? 50;
}

export function isLargeLogoPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!LARGE_LOGO_PANEL_KEYS.has(key)) return false;
  if (!isHeroSettingsPath(field.path)) return false;
  return true;
}

function remapLargeLogoGroup(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  let next = enrichHeroPanelField(field);
  if (LAYOUT_KEYS.has(key)) {
    next = { ...next, group: 'Layout' };
  } else if (SIZE_KEYS.has(key)) {
    next = { ...next, group: 'Size' };
  } else if (key === 'mediaOverlay') {
    next = { ...next, label: 'Background overlay', group: 'Appearance', widget: 'toggle' };
  } else if (key === 'backgroundMedia') {
    next = { ...next, group: 'Appearance', widget: 'select-inline' };
  } else if (key === 'backgroundImageUrl') {
    next = { ...next, group: 'Appearance', widget: 'image' };
  } else if (key === 'borderStyle') {
    next = { ...next, group: 'Appearance', widget: 'segmented' };
  } else if (key === 'cornerRadius') {
    next = { ...next, group: 'Appearance', widget: 'slider' };
  } else if (key === 'defaultLogoUrl') {
    next = { ...next, group: 'Theme Settings', widget: 'image', label: 'Default logo' };
  } else if (key === 'customCss') {
    next = { ...next, group: 'Custom CSS', widget: 'accordion' };
  }
  return next;
}

export function sortLargeLogoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Layout: 0,
    Size: 1,
    Appearance: 2,
    Padding: 3,
    'Theme Settings': 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareLargeLogoSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortLargeLogoPanelFields(
    (node.fields ?? []).filter(isLargeLogoPanelField).map(remapLargeLogoGroup)
  );
  return { ...node, label: 'Large logo', kind: 'section', fields };
}

export function groupLargeLogoPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const sorted = sortLargeLogoPanelFields(
    fields.filter(isLargeLogoPanelField).map(remapLargeLogoGroup)
  );
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of sorted) {
    const group = field.group ?? 'Settings';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isLargeLogoSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isLargeLogoPanelField);
}
