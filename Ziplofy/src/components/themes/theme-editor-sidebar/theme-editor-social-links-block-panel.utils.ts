import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './theme-editor-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../../utils/theme-editor-insert-section';

const SOCIAL_SETTING_KEYS = new Set([
  'facebookUrl',
  'instagramUrl',
  'youtubeUrl',
  'tiktokUrl',
  'twitterUrl',
  'threadsUrl',
  'linkedinUrl',
  'blueskyUrl',
  'snapchatUrl',
  'pinterestUrl',
  'tumblrUrl',
  'vimeoUrl',
  'customUrl',
]);

const FIELD_SORT: Record<string, number> = {
  facebookUrl: 0,
  instagramUrl: 1,
  youtubeUrl: 2,
  tiktokUrl: 3,
  twitterUrl: 4,
  threadsUrl: 5,
  linkedinUrl: 6,
  blueskyUrl: 7,
  snapchatUrl: 8,
  pinterestUrl: 9,
  tumblrUrl: 10,
  vimeoUrl: 11,
  customUrl: 12,
};

export function isSocialLinksBlockNodeId(nodeId: string): boolean {
  return /^layout:footer_utilities(?:_\d+)?:block:social$/.test(nodeId);
}

export function instanceIdFromSocialLinksNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(footer_utilities(?:_\d+)?):block:social$/);
  if (m) return m[1];
  const fm = nodeId.match(/^field:sections\.(footer_utilities(?:_\d+)?)\.blocks\.social\./);
  return fm ? fm[1] : null;
}

export function socialLinksBlockFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  instanceId: string
): EditorFieldDef[] {
  const blueprint = layoutBlueprintKey(instanceId);
  const block = editorSchema.layout?.[blueprint]?.blocks?.find((b) => b.id === 'social');
  if (!block?.settingsFields?.length) return [];
  return block.settingsFields.map((f) => ({
    ...f,
    path: remapLayoutSchemaPath(f.path, instanceId),
  }));
}

export function isSocialLinksPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  return SOCIAL_SETTING_KEYS.has(key);
}

export function sortSocialLinksPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  return [...fields].sort(
    (a, b) =>
      (FIELD_SORT[a.path.split('.').pop() ?? ''] ?? 50) - (FIELD_SORT[b.path.split('.').pop() ?? ''] ?? 50)
  );
}

export function prepareSocialLinksBlockSettingsNode(node: SidebarNode): SidebarNode {
  const source = node.fields ?? [];
  let fields = sortSocialLinksPanelFields(source.filter(isSocialLinksPanelField));
  if (!fields.length && source.length) {
    fields = sortSocialLinksPanelFields(
      source.filter((f) => {
        const key = f.path.split('.').pop() ?? '';
        return key.endsWith('Url') || key === 'instagram' || key === 'facebook';
      })
    );
  }
  return { ...node, label: 'Social media links', kind: 'block', fields };
}

export function findSocialLinksBlockInTree(nodeId: string, tree: SidebarNode[]): SidebarNode | null {
  if (isSocialLinksBlockNodeId(nodeId)) {
    return findSidebarNodeById(tree, nodeId);
  }
  const instanceId = instanceIdFromSocialLinksNodeId(nodeId);
  if (!instanceId) return null;
  return findSidebarNodeById(tree, `layout:${instanceId}:block:social`);
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
