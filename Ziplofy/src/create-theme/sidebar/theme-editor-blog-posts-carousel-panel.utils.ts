import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

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

function s(settingsBase: string, key: string): string {
  return `${settingsBase}.${key}`;
}

export function isBlogPostsCarouselSectionNodeId(nodeId: string): boolean {
  return /^(?:template:[^:]+|layout):blog_posts_carousel(?:_\d+)?$/.test(nodeId);
}

export function blogPostsCarouselSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):(blog_posts_carousel(?:_\d+)?)$/);
  if (templateMatch) {
    return `templates.${templateMatch[1]}.sections.${templateMatch[2]}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:(blog_posts_carousel(?:_\d+)?)$/);
  if (layoutMatch) {
    return `sections.${layoutMatch[1]}.settings`;
  }
  return null;
}

/** Shopify-order field defs for Blog posts: Carousel section settings. */
export function blogPostsCarouselFieldDefs(settingsBase: string): EditorFieldDef[] {
  return [
    {
      path: s(settingsBase, 'heading'),
      type: 'text',
      label: 'Heading',
      group: 'General',
      sidebar: false,
    },
    {
      path: s(settingsBase, 'blogHandle'),
      type: 'select',
      label: 'Blog',
      group: 'General',
      sidebar: true,
      options: [
        { value: '', label: 'Select' },
        { value: 'news', label: 'News' },
        { value: 'journal', label: 'Journal' },
      ],
    },
    {
      path: s(settingsBase, 'layoutType'),
      type: 'select',
      label: 'Type',
      group: 'Cards layout',
      sidebar: true,
      options: [{ value: 'carousel', label: 'Carousel' }],
    },
    {
      path: s(settingsBase, 'postCount'),
      type: 'number',
      label: 'Post count',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 12,
      step: 1,
      sidebar: true,
    },
    {
      path: s(settingsBase, 'columns'),
      type: 'number',
      label: 'Columns',
      group: 'Cards layout',
      widget: 'slider',
      min: 1,
      max: 4,
      step: 1,
      sidebar: true,
    },
    {
      path: s(settingsBase, 'mobileCardSize'),
      type: 'select',
      label: 'Mobile card size',
      group: 'Cards layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
      ],
    },
    {
      path: s(settingsBase, 'horizontalGap'),
      type: 'number',
      label: 'Horizontal gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'navIcon'),
      type: 'select',
      label: 'Icon',
      group: 'Carousel navigation',
      sidebar: true,
      options: [
        { value: 'arrows', label: 'Arrows' },
        { value: 'chevron', label: 'Chevron' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      path: s(settingsBase, 'navIconBackground'),
      type: 'select',
      label: 'Icon background',
      group: 'Carousel navigation',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
      ],
    },
    {
      path: s(settingsBase, 'sectionWidth'),
      type: 'select',
      label: 'Width',
      group: 'Section layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: s(settingsBase, 'layoutGap'),
      type: 'number',
      label: 'Gap',
      group: 'Section layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'colorScheme'),
      type: 'select',
      label: 'Color scheme',
      group: 'Section layout',
      widget: 'color-scheme',
      sidebar: true,
      options: [
        { value: 'scheme-1', label: 'Scheme 1' },
        { value: 'scheme-2', label: 'Scheme 2' },
        { value: 'scheme-3', label: 'Scheme 3' },
        { value: 'scheme-4', label: 'Scheme 4' },
      ],
    },
    {
      path: s(settingsBase, 'paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'customCss'),
      type: 'textarea',
      label: 'Custom CSS',
      group: 'Custom CSS',
      widget: 'accordion',
      sidebar: true,
    },
  ];
}

export function isBlogPostsCarouselSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'blog-posts-carousel' || catalogVariant === 'blog-posts-carousel';
}

export function isBlogPostsCarouselPanelField(field: EditorFieldDef): boolean {
  if (field.sidebar === false) return false;
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
  for (const field of fields.filter(isBlogPostsCarouselPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
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

export function isBlogPostsCarouselSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return (
    keys.has('postCount') &&
    keys.has('columns') &&
    keys.has('navIcon') &&
    keys.has('mobileCardSize') &&
    !keys.has('mobileColumns') &&
    !keys.has('verticalGap')
  );
}

export function prepareBlogPostsCarouselSettingsNode(node: SidebarNode): SidebarNode {
  const settingsBase = blogPostsCarouselSettingsBaseFromNodeId(node.id);
  const canonical = settingsBase ? blogPostsCarouselFieldDefs(settingsBase) : [];
  const source = canonical.length ? canonical : (node.fields ?? []);
  const fields = sortBlogPostsCarouselPanelFields(
    filterSidebarSectionPanelFields(source, isBlogPostsCarouselPanelField)
  );
  return { ...node, label: 'Blog posts: Carousel', kind: 'section', fields };
}
