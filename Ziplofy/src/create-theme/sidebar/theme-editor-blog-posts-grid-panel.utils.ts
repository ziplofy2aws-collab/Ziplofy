import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

export const BLOG_POSTS_GRID_PANEL_GROUP_ORDER = [
  'General',
  'Cards layout',
  'Section layout',
  'Padding',
  'Custom CSS',
] as const;

const PANEL_GROUPS = new Set<string>(BLOG_POSTS_GRID_PANEL_GROUP_ORDER);

const FIELD_SORT: Record<string, number> = {
  blogHandle: 0,
  layoutType: 0,
  carouselOnMobile: 1,
  postCount: 2,
  columns: 3,
  mobileColumns: 4,
  horizontalGap: 5,
  verticalGap: 6,
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

export function isBlogPostsGridSectionNodeId(nodeId: string): boolean {
  return /^(?:template:[^:]+|layout):blog_posts_grid(?:_\d+)?$/.test(nodeId);
}

export function blogPostsGridSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):(blog_posts_grid(?:_\d+)?)$/);
  if (templateMatch) {
    return `templates.${templateMatch[1]}.sections.${templateMatch[2]}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:(blog_posts_grid(?:_\d+)?)$/);
  if (layoutMatch) {
    return `sections.${layoutMatch[1]}.settings`;
  }
  return null;
}

/** Derive the section `...settings` base from any existing field path. */
function blogPostsGridSettingsBaseFromFields(fields: EditorFieldDef[]): string | null {
  for (const field of fields) {
    const marker = '.settings.';
    const idx = field.path.indexOf(marker);
    if (idx > -1) return field.path.slice(0, idx + marker.length - 1);
  }
  return null;
}

/** Shopify-order field defs for Blog posts: Grid section settings. */
export function blogPostsGridFieldDefs(settingsBase: string): EditorFieldDef[] {
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
      options: [{ value: 'grid', label: 'Grid' }],
    },
    {
      path: s(settingsBase, 'carouselOnMobile'),
      type: 'boolean',
      label: 'Carousel on mobile',
      group: 'Cards layout',
      widget: 'toggle',
      sidebar: true,
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
      max: 5,
      step: 1,
      sidebar: true,
    },
    {
      path: s(settingsBase, 'mobileColumns'),
      type: 'select',
      label: 'Mobile columns',
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
      path: s(settingsBase, 'verticalGap'),
      type: 'number',
      label: 'Vertical gap',
      group: 'Cards layout',
      widget: 'slider',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      sidebar: true,
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

export function isBlogPostsGridSectionType(secType: string | undefined, catalogVariant: string): boolean {
  return secType === 'blog-posts-grid' || catalogVariant === 'blog-posts-grid';
}

export function isBlogPostsGridPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  return /\.sections\.[^.]+\.settings\./.test(field.path);
}

export function sortBlogPostsGridPanelFields(fields: EditorFieldDef[]): EditorFieldDef[] {
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

export function groupBlogPostsGridPanelFields(fields: EditorFieldDef[]): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isBlogPostsGridPanelField)) {
    const group = field.group && PANEL_GROUPS.has(field.group) ? field.group : 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  return map;
}

export function isBlogPostsGridSettingsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  return keys.has('mobileColumns') && keys.has('verticalGap') && keys.has('columns');
}

export function prepareBlogPostsGridSettingsNode(node: SidebarNode): SidebarNode {
  const settingsBase =
    blogPostsGridSettingsBaseFromNodeId(node.id) ??
    blogPostsGridSettingsBaseFromFields(node.fields ?? []);
  const canonical = settingsBase ? blogPostsGridFieldDefs(settingsBase) : [];
  const source = canonical.length ? canonical : (node.fields ?? []);
  const fields = sortBlogPostsGridPanelFields(
    filterSidebarSectionPanelFields(source, isBlogPostsGridPanelField)
  );
  return { ...node, label: 'Blog posts: Grid', kind: 'section', fields };
}
