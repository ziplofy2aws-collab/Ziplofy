import type { SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';
import { textBlockFieldDefs } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../create-theme/sidebar/create-theme-structure-order';

export const BLOG_POST_MAIN_BLOCK_ORDER = ['title', 'blog_post'] as const;
export const BLOG_POST_MAIN_NESTED_ORDER = ['image', 'title', 'details', 'description'] as const;
export const MAIN_BLOG_BLOCK_ORDER = ['title'] as const;

function fieldPreview(
  field: { path: string },
  values: Record<string, string | boolean>
): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function blogPostMainBlocksBase(prefix: string): string {
  const match = prefix.match(/^template:([^:]+):((?:blog_post_main)(?:_\d+)?)$/);
  if (!match) return '';
  return `templates.${match[1]}.sections.${match[2]}.blocks`;
}

function mainBlogBlocksBase(prefix: string): string {
  const match = prefix.match(/^template:([^:]+):((?:main_blog)(?:_\d+)?)$/);
  if (!match) return '';
  return `templates.${match[1]}.sections.${match[2]}.blocks`;
}

/** Blog post (article) template — Title + Blog post group (Image / Title / Details / Description). */
export function mapBlogPostMainBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const blocksBase = blogPostMainBlocksBase(prefix);
  const titleFields = blocksBase ? textBlockFieldDefs(`${blocksBase}.title`) : [];
  const titleTextField =
    titleFields.find((f) => f.path.endsWith('.text')) ??
    titleFields.find((f) => f.path.endsWith('.heading'));

  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  const titleNode: SidebarNode = {
    id: `${prefix}:block:title`,
    label: 'Title',
    kind: 'block',
    icon: 'text',
    fields: titleFields.length ? titleFields : undefined,
    preview: titleTextField ? fieldPreview(titleTextField, values) : undefined,
    showVisibilityToggle: true,
  };

  const postPrefix = `${prefix}:block:blog_post`;
  const postChildren = reorderSidebarChildren(
    [
      { id: `${postPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${postPrefix}:nested:image`,
        label: 'Image',
        kind: 'block',
        icon: 'image',
        showVisibilityToggle: true,
      },
      {
        id: `${postPrefix}:nested:title`,
        label: 'Title',
        kind: 'block',
        icon: 'title',
        showVisibilityToggle: true,
      },
      {
        id: `${postPrefix}:nested:details`,
        label: 'Details',
        kind: 'block',
        icon: 'text',
        showVisibilityToggle: true,
      },
      {
        id: `${postPrefix}:nested:description`,
        label: 'Description',
        kind: 'block',
        icon: 'text',
        showVisibilityToggle: true,
      },
    ],
    listKeyBlockChildren(postPrefix),
    itemOrder
  );

  const blogPostNode: SidebarNode = {
    id: postPrefix,
    label: 'Blog post',
    kind: 'block',
    icon: 'group',
    children: postChildren,
    showVisibilityToggle: true,
  };

  return reorderSidebarChildren(
    [addBlock, titleNode, blogPostNode],
    sectionChildrenListKey,
    itemOrder
  );
}

/** Blog listing template — Title block. */
export function mapMainBlogBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const blocksBase = mainBlogBlocksBase(prefix);
  const titleFields = blocksBase ? textBlockFieldDefs(`${blocksBase}.title`) : [];
  const titleTextField = titleFields.find((f) => f.path.endsWith('.text'));

  return reorderSidebarChildren(
    [
      { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${prefix}:block:title`,
        label: 'Title',
        kind: 'block',
        icon: 'text',
        fields: titleFields.length ? titleFields : undefined,
        preview: titleTextField ? fieldPreview(titleTextField, values) : undefined,
        showVisibilityToggle: true,
      },
    ],
    sectionChildrenListKey,
    itemOrder
  );
}
