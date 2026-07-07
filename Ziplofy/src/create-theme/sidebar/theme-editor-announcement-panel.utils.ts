import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { ANNOUNCEMENT_BAR_SETTINGS_FIELDS } from '../../config/theme-editor-announcement-schema';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../utils/theme-editor-insert-section';
import { resolveEditingPanelForNode } from '../../theme-editor/section-editing-support.util';

/** Groups shown in the bottom "Announcement bar" settings sheet (Shopify-style). */
export const ANNOUNCEMENT_PANEL_GROUP_ORDER = [
  'General',
  'Appearance',
  'Padding',
  'Theme Settings',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(ANNOUNCEMENT_PANEL_GROUP_ORDER);

const FIELD_SORT_KEYS: Record<string, number> = {
  timeToNext: 0,
  sectionWidth: 10,
  backgroundColor: 11,
  dividerThickness: 12,
  dividerColor: 13,
  paddingTop: 20,
  paddingBottom: 21,
  colorScheme: 25,
  customCss: 30,
};

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? path;
  return FIELD_SORT_KEYS[key] ?? 50;
}

export function isAnnouncementSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    fields.some((f) => /(?:^|\.)sections\.announcement_bar(?:_\d+)?\.settings\./.test(f.path)) &&
    keys.has('timeToNext')
  );
}

export function groupAnnouncementPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const label of ANNOUNCEMENT_PANEL_GROUP_ORDER) {
    map.set(label, []);
  }
  for (const field of sortAnnouncementPanelFields(filterAnnouncementPanelFields(fields))) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    map.get(group)?.push(field);
  }
  return map;
}

export function isAnnouncementLayoutNodeId(nodeId: string): boolean {
  const m = nodeId.match(/^layout:(announcement_bar(?:_\d+)?)/);
  return Boolean(m && layoutBlueprintKey(m[1]) === 'announcement_bar');
}

/** Section settings for the bottom panel (excludes legacy Content + enabled; visibility uses sidebar eye). */
export function filterAnnouncementPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return fields.filter((f) => {
    if (f.group === 'Content') return false;
    const key = f.path.split('.').pop() ?? '';
    if (key === 'enabled') return false;
    if (!f.group) return false;
    return PANEL_GROUPS.has(f.group);
  });
}

export function sortAnnouncementPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    Appearance: 1,
    Padding: 2,
    'Theme Settings': 3,
    'Custom CSS': 4,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareAnnouncementSettingsNode(
  node: SidebarNode,
  prependFields: EditorFieldDef[] = []
): SidebarNode {
  const fields = node.fields ?? [];
  const panelFields = sortAnnouncementPanelFields(filterAnnouncementPanelFields(fields));
  const merged = [...prependFields, ...(panelFields.length ? panelFields : fields)];
  return { ...node, label: 'Announcement bar', kind: 'section', fields: merged };
}

function remapAnnouncementSchemaFields(
  fields: EditorFieldDef[] | undefined,
  instanceId: string
): EditorFieldDef[] {
  const source = fields?.length ? fields : ANNOUNCEMENT_BAR_SETTINGS_FIELDS;
  const blueprint = layoutBlueprintKey(instanceId);
  if (blueprint === instanceId) return source;
  return source.map((field) => ({
    ...field,
    path: remapLayoutSchemaPath(field.path, instanceId),
  }));
}

/** Section settings for the bottom sheet (excludes sidebar tree rows). */
export function collectAnnouncementPanelFieldDefs(
  sec: { settingsFields?: EditorFieldDef[] },
  instanceId: string
): EditorFieldDef[] {
  const remapped = remapAnnouncementSchemaFields(sec.settingsFields, instanceId);
  const panelFields = sortAnnouncementPanelFields(filterAnnouncementPanelFields(remapped));
  return panelFields.length ? panelFields : remapped;
}

/** Resolve announcement bar section panel fields from tree, schema, catalog, or defaults. */
export function resolveAnnouncementSectionPanelFields(
  sectionNodeId: string,
  editorSchema?: EditorSchemaDoc | null,
  existingFields?: EditorFieldDef[]
): EditorFieldDef[] {
  let fields = existingFields ?? [];
  if (!fields.length) {
    const catalog = resolveEditingPanelForNode(sectionNodeId);
    if (catalog?.fields.length) fields = catalog.fields;
  }
  if (!fields.length && editorSchema) {
    const instanceId = sectionNodeId.replace(/^layout:/, '');
    const blueprint = layoutBlueprintKey(instanceId);
    const sec = editorSchema.layout?.[blueprint];
    if (sec) {
      fields = collectAnnouncementPanelFieldDefs(sec, instanceId);
    }
  }
  if (!fields.length) {
    const instanceId = sectionNodeId.replace(/^layout:/, '');
    fields = collectAnnouncementPanelFieldDefs({ settingsFields: [] }, instanceId);
  }
  return fields;
}

/** Find the layout announcement section node when a child row is selected. */
export function findAnnouncementSectionInTree(
  nodeId: string,
  tree: SidebarNode[]
): SidebarNode | null {
  if (isAnnouncementLayoutNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId.startsWith('layout:') ? nodeId : `layout:${nodeId}`) ?? null;
  }
  const m = nodeId.match(/^layout:(announcement_bar(?:_\d+)?)/);
  if (!m) return null;
  const sectionId = `layout:${m[1]}`;
  return findSidebarNodeById(tree, sectionId);
}

function findSidebarNodeById(nodes: SidebarNode[], id: string): SidebarNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const hit = findSidebarNodeById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}
