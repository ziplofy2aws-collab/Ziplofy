import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { layoutBlueprintKey } from '../../../utils/theme-editor-insert-section';

/** Shopify-style Footer section settings sheet order. */
export const FOOTER_PANEL_GROUP_ORDER = ['General', 'Padding', 'Custom CSS'] as const;

const PANEL_GROUPS = new Set<string>(FOOTER_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  sectionWidth: 0,
  gap: 1,
  colorScheme: 2,
  paddingTop: 20,
  paddingBottom: 21,
  customCss: 30,
};

export function isFooterLayoutNodeId(nodeId: string): boolean {
  const m = nodeId.match(/^layout:(footer(?:_\d+)?)$/);
  return Boolean(m && layoutBlueprintKey(m[1]) === 'footer');
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

export function findFooterSectionInTree(nodeId: string, tree: SidebarNode[]): SidebarNode | null {
  if (isFooterLayoutNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId);
  }
  const m = nodeId.match(/^layout:(footer(?:_\d+)?)/);
  if (!m) return null;
  return findSidebarNodeById(tree, `layout:${m[1]}`);
}

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isFooterPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.footer(?!_utilities)[^.]*\.settings\./.test(field.path);
}

export function sortFooterPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    Padding: 1,
    'Custom CSS': 2,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function prepareFooterSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortFooterPanelFields((node.fields ?? []).filter(isFooterPanelField));
  return { ...node, label: 'Footer', kind: 'section', fields };
}

export function groupFooterPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

/** True when the bottom sheet is the layout Footer section (not newsletter block). */
export function isFooterSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('sectionWidth') &&
    keys.has('gap') &&
    keys.has('colorScheme') &&
    keys.has('paddingTop') &&
    keys.has('customCss') &&
    !keys.has('title') &&
    !keys.has('signupsCustomerProfiles') &&
    !keys.has('dividerThickness') &&
    !keys.has('paymentIcons')
  );
}

export function collectFooterPanelFieldDefs(
  sec: { settingsFields?: EditorFieldDef[] },
  instanceId: string,
  remap: (fields: EditorFieldDef[] | undefined, id: string) => EditorFieldDef[]
): EditorFieldDef[] {
  return remap(sec.settingsFields, instanceId);
}
