import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../../utils/theme-editor-insert-section';

const PANEL_KEYS = new Set(['showPoweredBy', 'manageStoreName', 'fontSize', 'textCase']);

const FIELD_SORT: Record<string, number> = {
  showPoweredBy: 0,
  manageStoreName: 1,
  fontSize: 2,
  textCase: 3,
};

export function isCopyrightBlockNodeId(nodeId: string): boolean {
  return /^layout:footer_utilities(?:_\d+)?:block:copyright$/.test(nodeId);
}

export function instanceIdFromCopyrightNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(footer_utilities(?:_\d+)?):block:copyright$/);
  if (m) return m[1];
  const fm = nodeId.match(/^field:sections\.(footer_utilities(?:_\d+)?)\.blocks\.copyright\./);
  return fm ? fm[1] : null;
}

export function copyrightBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === 'copyright');
  if (!block?.settingsFields?.length) return [];
  return block.settingsFields.map((f) => ({
    ...f,
    path: remapLayoutSchemaPath(f.path, instanceId),
  }));
}

export function isCopyrightPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return PANEL_KEYS.has(key);
}

export function sortCopyrightPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return [...fields].sort(
    (a, b) =>
      (FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) - (FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
}

export function prepareCopyrightBlockSettingsNode(node: SidebarNode): SidebarNode {
  const source = node.fields ?? [];
  let fields = sortCopyrightPanelFields(source.filter(isCopyrightPanelField));
  if (!fields.length && source.length) {
    fields = sortCopyrightPanelFields(source);
  }
  return { ...node, label: 'Copyright', kind: 'block', fields };
}

export function findCopyrightBlockInTree(nodeId: string, tree: SidebarNode[]): SidebarNode | null {
  if (isCopyrightBlockNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId);
  }
  const instanceId = instanceIdFromCopyrightNodeId(nodeId);
  if (!instanceId) return null;
  return findSidebarNodeById(tree, `layout:${instanceId}:block:copyright`);
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
