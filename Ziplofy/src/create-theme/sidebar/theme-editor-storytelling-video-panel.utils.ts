import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

/** Shopify-style Video section settings sheet order. */
export const STORYTELLING_VIDEO_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_VIDEO_PANEL_GROUP_ORDER);

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

export function isStorytellingVideoSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'storytelling-video' || catalogVariant === 'video';
}

export function isStorytellingVideoPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortStorytellingVideoPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupStorytellingVideoPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingVideoPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isStorytellingVideoSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('imageBeforeUrl') || keys.has('imageUrl') || keys.has('logoText')) return false;
  if (!keys.has('direction') || !keys.has('layoutGap')) return false;
  if (keys.has('videoSource') && !keys.has('colorScheme')) return false;
  if (keys.has('caption') && keys.size <= 3) return false;
  if (keys.has('linkLabel') && !keys.has('colorScheme')) return false;
  return true;
}

export function prepareStorytellingVideoSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortStorytellingVideoPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isStorytellingVideoPanelField)
  );
  return { ...node, label: 'Video', kind: 'section', fields };
}
