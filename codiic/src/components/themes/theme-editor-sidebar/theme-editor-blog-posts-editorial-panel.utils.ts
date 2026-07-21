import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const BLOG_POSTS_EDITORIAL_PANEL_GROUP_ORDER = [
  'General',
  'Cards layout',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(BLOG_POSTS_EDITORIAL_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  blogHandle: 0,
  layoutType: 0,
  carouselOnMobile: 1,
  postCount: 2,
  sectionWidth: 0,
  layoutGap: 1,
  colorScheme: 2,
  paddingTop: 0,
  paddingBottom: 1,
  customCss: 0,
};

function fieldSortKey(path: string): number {
  return FIELD_SORT[path.split('.').pop() ?? ''] ?? 50;
}

export function isBlogPostsEditorialSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'blog-posts-editorial' || catalogVariant === 'blog-posts-editorial';
}

export function isBlogPostsEditorialPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortBlogPostsEditorialPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    'Cards layout': 1,
    'Section layout': 2,
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

export function groupBlogPostsEditorialPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isBlogPostsEditorialSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('postCount') && keys.has('carouselOnMobile') && keys.has('layoutType');
}

export function prepareBlogPostsEditorialSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortBlogPostsEditorialPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isBlogPostsEditorialPanelField)
  );
  return { ...node, label: 'Blog posts: Editorial', kind: 'section', fields };
}
