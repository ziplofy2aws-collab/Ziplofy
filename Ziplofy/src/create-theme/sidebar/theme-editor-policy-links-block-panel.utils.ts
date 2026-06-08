import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../utils/theme-editor-insert-section';

const PANEL_KEYS = new Set(['managePolicies', 'fontSize', 'textCase']);

const FIELD_SORT: Record<string, number> = {
  managePolicies: 0,
  fontSize: 1,
  textCase: 2,
};

export function isPolicyLinksBlockNodeId(nodeId: string): boolean {
  return /^layout:footer_utilities(?:_\d+)?:block:policy_links$/.test(nodeId);
}

export function instanceIdFromPolicyLinksNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(footer_utilities(?:_\d+)?):block:policy_links$/);
  if (m) return m[1];
  const fm = nodeId.match(/^field:sections\.(footer_utilities(?:_\d+)?)\.blocks\.policy_links\./);
  return fm ? fm[1] : null;
}

export function policyLinksBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === 'policy_links');
  if (!block?.settingsFields?.length) return [];
  return block.settingsFields.map((f) => ({
    ...f,
    path: remapLayoutSchemaPath(f.path, instanceId),
  }));
}

export function isPolicyLinksPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return PANEL_KEYS.has(key);
}

export function sortPolicyLinksPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return [...fields].sort(
    (a, b) =>
      (FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) - (FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
}

export function preparePolicyLinksBlockSettingsNode(node: SidebarNode): SidebarNode {
  const source = node.fields ?? [];
  let fields = sortPolicyLinksPanelFields(source.filter(isPolicyLinksPanelField));
  if (!fields.length && source.length) {
    fields = sortPolicyLinksPanelFields(source);
  }
  return { ...node, label: 'Policy links', kind: 'block', fields };
}

export function findPolicyLinksBlockInTree(nodeId: string, tree: SidebarNode[]): SidebarNode | null {
  if (isPolicyLinksBlockNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId);
  }
  const instanceId = instanceIdFromPolicyLinksNodeId(nodeId);
  if (!instanceId) return null;
  return findSidebarNodeById(tree, `layout:${instanceId}:block:policy_links`);
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
