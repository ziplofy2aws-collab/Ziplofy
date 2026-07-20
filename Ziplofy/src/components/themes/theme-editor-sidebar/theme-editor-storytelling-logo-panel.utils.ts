import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

/** Shopify Horizon logo section settings order. */
export const STORYTELLING_LOGO_PANEL_GROUP_ORDER = [
  'Typography',
  'Size',
  'Padding',
  'Theme Settings',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_LOGO_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  logoFont: 0,
  sizeUnit: 10,
  pixelHeight: 11,
  percentWidth: 12,
  customMobileSize: 13,
  mobileSizeUnit: 14,
  mobilePixelHeight: 15,
  mobilePercentWidth: 16,
  sectionWidth: 20,
  layoutAlignment: 21,
  colorScheme: 22,
  paddingTop: 30,
  paddingBottom: 31,
  defaultLogoUrl: 40,
  customCss: 50,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isStorytellingLogoSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'storytelling-logo' || catalogVariant === 'logo';
}

export function isStorytellingLogoPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortStorytellingLogoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    Typography: 0,
    Size: 1,
    Padding: 2,
    Layout: 3,
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

export function groupStorytellingLogoPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Size';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isStorytellingLogoSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('imageUrl') || keys.has('direction') || keys.has('layoutGap')) return false;
  if (keys.has('logoFont') || keys.has('sizeUnit')) return true;
  return keys.has('logoText') && keys.has('sectionWidth');
}

export function prepareStorytellingLogoSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortStorytellingLogoPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isStorytellingLogoPanelField)
  );
  return { ...node, label: 'Logo', kind: 'section', fields };
}
