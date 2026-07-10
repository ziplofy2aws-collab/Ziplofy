import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';

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
  backgroundColor: 2,
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

export function isBlogPostsEditorialSectionNodeId(nodeId: string): boolean {
  return /^(?:template:[^:]+|layout):blog_posts_editorial(?:_\d+)?$/.test(nodeId);
}

export function blogPostsEditorialSettingsBaseFromNodeId(nodeId: string): string | null {
  const templateMatch = nodeId.match(/^template:([^:]+):(blog_posts_editorial(?:_\d+)?)$/);
  if (templateMatch) {
    return `templates.${templateMatch[1]}.sections.${templateMatch[2]}.settings`;
  }
  const layoutMatch = nodeId.match(/^layout:(blog_posts_editorial(?:_\d+)?)$/);
  if (layoutMatch) {
    return `sections.${layoutMatch[1]}.settings`;
  }
  return null;
}

function blogPostsEditorialSettingsBaseFromFields(fields: EditorFieldDef[]): string | null {
  for (const field of fields) {
    const marker = '.settings.';
    const idx = field.path.indexOf(marker);
    if (idx > -1) return field.path.slice(0, idx + marker.length - 1);
  }
  return null;
}

/** Shopify-order field defs for Blog posts: Editorial section settings. */
export function blogPostsEditorialFieldDefs(settingsBase: string): EditorFieldDef[] {
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
      options: [{ value: 'editorial', label: 'Editorial' }],
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
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s(settingsBase, 'backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Section layout',
      widget: 'color',
      sidebar: true,
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

export function isBlogPostsEditorialSectionType(
  secType: string | undefined,
  catalogVariant: string
): boolean {
  return secType === 'blog-posts-editorial' || catalogVariant === 'blog-posts-editorial';
}

export function isBlogPostsEditorialPanelField(field: EditorFieldDef): boolean {
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  if (field.sidebar === false) return false;
  if (!/blog_posts_editorial/.test(field.path)) return false;
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
  for (const field of fields.filter(isBlogPostsEditorialPanelField)) {
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
  const path = fields[0]?.path ?? '';
  return (
    keys.has('postCount') &&
    keys.has('carouselOnMobile') &&
    keys.has('layoutType') &&
    !keys.has('columns') &&
    !keys.has('verticalGap') &&
    /blog_posts_editorial/.test(path)
  );
}

export function pickBlogPostsEditorialSectionField(
  fields: EditorFieldDef[],
  key: string
): EditorFieldDef | undefined {
  return fields.find((f) => f.path.split('.').pop() === key);
}

export function prepareBlogPostsEditorialSettingsNode(node: SidebarNode): SidebarNode {
  const settingsBase =
    blogPostsEditorialSettingsBaseFromNodeId(node.id) ??
    blogPostsEditorialSettingsBaseFromFields(node.fields ?? []);
  const canonical = settingsBase ? blogPostsEditorialFieldDefs(settingsBase) : [];
  const source = canonical.length ? canonical : (node.fields ?? []);
  const fields = sortBlogPostsEditorialPanelFields(
    filterSidebarSectionPanelFields(source, isBlogPostsEditorialPanelField)
  );
  return { ...node, label: 'Blog posts: Editorial', kind: 'section', fields };
}
