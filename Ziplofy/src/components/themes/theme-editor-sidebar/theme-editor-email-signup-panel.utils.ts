import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

/** Shopify-style Email signup section settings sheet order. */
export const EMAIL_SIGNUP_PANEL_GROUP_ORDER = [
  'Layout',
  'Size',
  'Appearance',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(EMAIL_SIGNUP_PANEL_GROUP_ORDER);

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

export function isEmailSignupSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'email-signup' || catalogVariant === 'email-signup';
}

export function isEmailSignupPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortEmailSignupPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupEmailSignupPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'Layout';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isEmailSignupSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  if (keys.has('media1Type') || keys.has('media1ImageUrl') || keys.has('media2Type')) return false;
  return keys.has('direction') && keys.has('sectionWidth') && keys.has('colorScheme');
}

export function prepareEmailSignupSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortEmailSignupPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isEmailSignupPanelField)
  );
  return { ...node, label: 'Email signup', kind: 'section', fields };
}
