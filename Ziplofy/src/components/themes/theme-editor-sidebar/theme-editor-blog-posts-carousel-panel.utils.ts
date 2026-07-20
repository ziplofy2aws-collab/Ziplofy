import type { EditorFieldDef, SidebarNode } from './theme-editor-sidebar.types';
import { filterSidebarSectionPanelFields } from './theme-editor-field.utils';

export const BLOG_POSTS_CAROUSEL_PANEL_GROUP_ORDER = [
  'General',
  'Cards layout',
  'Carousel navigation',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(BLOG_POSTS_CAROUSEL_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  blogHandle: 0,
  layoutType: 0,
  postCount: 1,
  columns: 2,
  mobileCardSize: 3,
  horizontalGap: 4,
  navIcon: 0,
  navIconBackground: 1,
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

export function isBlogPostsCarouselSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'blog-posts-carousel' || catalogVariant === 'blog-posts-carousel';
}

export function isBlogPostsCarouselPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortBlogPostsCarouselPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const groupRank: Record<string, number> = {
    General: 0,
    'Cards layout': 1,
    'Carousel navigation': 2,
    'Section layout': 3,
    Padding: 4,
    'Custom CSS': 5,
  };
  return [...fields].sort((a, b) => {
    const ga = groupRank[a.group ?? ''] ?? 9;
    const gb = groupRank[b.group ?? ''] ?? 9;
    if (ga !== gb) return ga - gb;
    return fieldSortKey(a.path) - fieldSortKey(b.path);
  });
}

export function groupBlogPostsCarouselPanelFields(
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

export function isBlogPostsCarouselSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('postCount') && keys.has('columns') && keys.has('navIcon');
}

export function prepareBlogPostsCarouselSettingsNode(node: SidebarNode): SidebarNode {
  const fields = sortBlogPostsCarouselPanelFields(
    filterSidebarSectionPanelFields(node.fields ?? [], isBlogPostsCarouselPanelField)
  );
  return { ...node, label: 'Blog posts: Carousel', kind: 'section', fields };
}
