import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { isBlogPostsGridCardGroupNodeId } from './theme-editor-blog-posts-grid-block-panel.utils';

export const BLOG_POSTS_GRID_CARD_PANEL_GROUP_ORDER = ['Text', 'Appearance', 'Padding'] as const;

const PANEL_GROUPS = new Set<string>(BLOG_POSTS_GRID_CARD_PANEL_GROUP_ORDER);

const CARD_GROUP_KEYS = new Set([
  'layoutAlignment',
  'layoutGap',
  'backgroundColor',
  'borderStyle',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
]);

function cardGroupBase(settingsBase: string): string {
  return `${settingsBase}.cardGroup`;
}

export function blogPostsGridCardDefaultSettings(): Record<string, string | number | boolean> {
  return {
    layoutAlignment: 'left',
    layoutGap: 8,
    backgroundColor: 'default',
    borderStyle: 'none',
    cornerRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}

export const BLOG_POSTS_GRID_CARD_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(blogPostsGridCardDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

export function blogPostsGridCardFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${cardGroupBase(settingsBase)}.${key}`;
  return [
    {
      path: s('layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Text',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('layoutGap'),
      type: 'number',
      label: 'Vertical gap',
      group: 'Text',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Borders',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function blogPostsGridCardSettingsBaseFromNodeId(nodeId: string): string | null {
  const sectionBase = blogPostsGridSectionBaseFromNodeIdForCard(nodeId);
  if (!sectionBase) return null;
  const postId = blogPostsGridTemplatePostIdFromNodeId(nodeId);
  return `${sectionBase}.blocks.${postId}.settings`;
}

function blogPostsGridSectionBaseFromNodeIdForCard(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:blog_card/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:blog_card/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return null;
}

function blogPostsGridTemplatePostIdFromNodeId(_nodeId: string): string {
  return 'post_1';
}

export function blogPostsGridCardFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const settingsBase = blogPostsGridCardSettingsBaseFromNodeId(nodeId);
  return settingsBase ? blogPostsGridCardFieldDefs(settingsBase) : [];
}

export function pickBlogPostsGridCardField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    layoutAlignment: 0,
    layoutGap: 1,
    backgroundColor: 10,
    borderStyle: 11,
    cornerRadius: 12,
    paddingTop: 20,
    paddingBottom: 21,
    paddingLeft: 22,
    paddingRight: 23,
  };
  return rank[key] ?? 50;
}

export function isBlogPostsGridCardPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!CARD_GROUP_KEYS.has(key)) return false;
  if (!/\.settings\.cardGroup\./.test(field.path)) return false;
  if (!/blog_posts_(?:grid|editorial|carousel)/.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isBlogPostsGridCardPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    keys.has('layoutAlignment') &&
    keys.has('layoutGap') &&
    /\.settings\.cardGroup\./.test(path) &&
    /blog_posts_(?:grid|editorial|carousel)/.test(path)
  );
}

export function groupBlogPostsGridCardPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isBlogPostsGridCardPanelField)) {
    const group = field.group ?? 'Text';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(
      group,
      [...list].sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path))
    );
  }
  return map;
}

export function prepareBlogPostsGridCardSettingsNode(node: SidebarNode): SidebarNode {
  const built = blogPostsGridCardFieldDefsFromNodeId(node.id);
  const fromNode = (node.fields ?? []).filter((f) => /\.settings\.cardGroup\./.test(f.path));
  const fields = built.length ? built : fromNode;
  return { ...node, label: 'Blog card', kind: 'block', icon: 'product-card', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendBlogPostsGridCardValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = BLOG_POSTS_GRID_CARD_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}

export function seedBlogPostsGridCardGroupInSettings(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const existing = settings.cardGroup;
  if (existing && typeof existing === 'object') {
    return {
      ...settings,
      cardGroup: {
        ...blogPostsGridCardDefaultSettings(),
        ...(existing as Record<string, unknown>),
      },
    };
  }
  return {
    ...settings,
    cardGroup: blogPostsGridCardDefaultSettings(),
  };
}

export function isBlogPostsGridCardGroupBlockNodeId(nodeId: string): boolean {
  return isBlogPostsGridCardGroupNodeId(nodeId);
}
