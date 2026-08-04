import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { layoutBlueprintKey, remapLayoutSchemaPath } from '../../utils/theme-editor-insert-section';
import {
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from '../policies-links/runtime/footerUtilitiesStyles';

export const SOCIAL_PLATFORM_ORDER_KEY = 'platformOrder';

const SOCIAL_SETTING_KEYS = new Set([
  SOCIAL_PLATFORM_ORDER_KEY,
  ...SOCIAL_PLATFORMS.map((p) => p.settingKey),
]);

export function isSocialLinksBlockNodeId(nodeId: string): boolean {
  return /^layout:footer_utilities(?:_\d+)?:block:social$/.test(nodeId);
}

export function instanceIdFromSocialLinksNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^layout:(footer_utilities(?:_\d+)?):block:social$/);
  if (m) return m[1];
  const fm = nodeId.match(/^field:sections\.(footer_utilities(?:_\d+)?)\.blocks\.social\./);
  return fm ? fm[1] : null;
}

export function socialLinksSettingsBasePath(instanceId: string): string {
  return `sections.${instanceId}.blocks.social.settings`;
}

export function socialLinksPlatformOrderPath(instanceId: string): string {
  return `${socialLinksSettingsBasePath(instanceId)}.${SOCIAL_PLATFORM_ORDER_KEY}`;
}

export function socialLinksUrlPath(instanceId: string, settingKey: string): string {
  return `${socialLinksSettingsBasePath(instanceId)}.${settingKey}`;
}

export function parseSocialPlatformOrder(raw: string): string[] {
  if (!raw.trim()) return [];
  const known = new Set(SOCIAL_PLATFORMS.map((p) => p.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (!id || !known.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function serializeSocialPlatformOrder(ids: string[]): string {
  return ids.join(',');
}

/** Platforms currently managed in the editor (order, or derived from filled URLs). */
export function readSocialPlatformOrderFromValues(
  values: Record<string, string | boolean>,
  instanceId: string
): string[] {
  const base = socialLinksSettingsBasePath(instanceId);
  const orderPath = socialLinksPlatformOrderPath(instanceId);
  const explicit = parseSocialPlatformOrder(String(values[orderPath] ?? ''));
  if (explicit.length) return explicit;

  // Legacy configs: infer from filled URL fields until the user edits the list.
  return SOCIAL_PLATFORMS.filter((platform) => {
    const url = String(values[`${base}.${platform.settingKey}`] ?? '').trim();
    if (url) return true;
    if (platform.id === 'instagram' || platform.id === 'facebook') {
      return String(values[`${base}.${platform.id}`] ?? '').trim().length > 0;
    }
    return false;
  }).map((platform) => platform.id);
}

export function availableSocialPlatforms(addedIds: string[]): SocialPlatform[] {
  const added = new Set(addedIds);
  return SOCIAL_PLATFORMS.filter((platform) => !added.has(platform.id));
}

export function socialPlatformById(id: string): SocialPlatform | undefined {
  return SOCIAL_PLATFORMS.find((platform) => platform.id === id);
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

export function prepareSocialLinksBlockSettingsNode(node: SidebarNode): SidebarNode {
  const source = node.fields ?? [];
  const fields = source.filter(isSocialLinksPanelField);
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
