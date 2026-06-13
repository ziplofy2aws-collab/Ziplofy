import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { enrichHeroPanelField, isHeroSettingsPath } from './theme-editor-hero-panel.utils';

export const SPLIT_SHOWCASE_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const SPLIT_SHOWCASE_PANEL_KEYS = new Set([
  'direction',
  'verticalOnMobile',
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
  'customCss',
]);

const LAYOUT_KEYS = new Set([
  'direction',
  'verticalOnMobile',
  'layoutAlignment',
  'position',
  'layoutGap',
]);
const SIZE_KEYS = new Set(['sectionWidth', 'height']);

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
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
    mediaOverlay: 25,
    paddingTop: 30,
    paddingBottom: 31,
    customCss: 50,
  };
  return rank[key] ?? 50;
}

export function isSplitShowcasePanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!SPLIT_SHOWCASE_PANEL_KEYS.has(key)) return false;
  if (!isHeroSettingsPath(field.path)) return false;
  return true;
}

function remapSplitShowcaseField(field: EditorFieldDef): EditorFieldDef {
  const key = field.path.split('.').pop() ?? '';
  let next = enrichHeroPanelField(field);

  if (LAYOUT_KEYS.has(key)) {
    next = { ...next, group: 'Layout' };
    if (key === 'verticalOnMobile') {
      next = { ...next, label: 'Vertical on mobile', widget: 'toggle' };
    }
    if (key === 'direction') {
      next = { ...next, widget: 'segmented' };
    }
    if (key === 'layoutAlignment') {
      next = { ...next, widget: 'select-inline' };
    }
    if (key === 'position') {
      next = { ...next, widget: 'segmented' };
    }
  } else if (SIZE_KEYS.has(key)) {
    next = { ...next, group: 'Size' };
  } else if (key === 'colorScheme') {
    next = { ...next, group: 'Appearance', widget: 'color-scheme' };
  } else if (key === 'mediaOverlay') {
    next = { ...next, label: 'Background overlay', group: 'Appearance', widget: 'toggle', sidebar: true };
  } else if (key === 'backgroundMedia') {
    next = { ...next, group: 'Appearance', widget: 'select-inline' };
  } else if (key === 'backgroundImageUrl') {
    next = { ...next, group: 'Appearance', widget: 'image' };
  } else if (key === 'borderStyle') {
    next = { ...next, group: 'Appearance', widget: 'segmented' };
  } else if (key === 'cornerRadius') {
    next = { ...next, group: 'Appearance', widget: 'slider' };
  } else if (key === 'customCss') {
    next = { ...next, group: 'Custom CSS', widget: 'accordion' };
  } else if (key === 'paddingTop' || key === 'paddingBottom') {
    next = { ...next, group: 'Padding', widget: 'slider' };
  }

  return next;
}

export function sortSplitShowcasePanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function prepareSplitShowcaseSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortSplitShowcasePanelFields(
    (node.fields ?? []).filter(isSplitShowcasePanelField).map(remapSplitShowcaseField)
  );
  return { ...node, label: 'Split showcase', kind: 'section', fields };
}

export function groupSplitShowcasePanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const sorted = sortSplitShowcasePanelFields(
    fields.filter(isSplitShowcasePanelField).map(remapSplitShowcaseField)
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

export function isSplitShowcaseSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('media1Type') || keys.has('marqueeText') || keys.has('media1ImageUrl')) return false;
  return keys.has('verticalOnMobile') && keys.has('direction') && keys.has('sectionWidth');
}
