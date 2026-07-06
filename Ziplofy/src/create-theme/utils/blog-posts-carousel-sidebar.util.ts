import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  blogPostsGridCardFieldDefs,
  blogPostsGridCardFieldDefsFromNodeId,
} from '../sidebar/theme-editor-blog-posts-grid-card-panel.utils';
import {
  blogPostsGridBlockFieldDefs,
  blogPostsGridBlockFieldDefsFromNodeId,
  isBlogPostsCarouselSectionInstanceId,
  isBlogPostsGridCardDetailsBlockNodeId,
  isBlogPostsGridCardExcerptBlockNodeId,
  isBlogPostsGridCardGroupNodeId,
  isBlogPostsGridCardImageBlockNodeId,
  isBlogPostsGridCardTitleBlockNodeId,
  isBlogPostsGridTitleBlockNodeId,
} from '../sidebar/theme-editor-blog-posts-grid-block-panel.utils';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';

export const BLOG_POSTS_CAROUSEL_SECTION_CHILD_ORDER = ['title', 'blog_card', 'add_block'] as const;
export const BLOG_POSTS_CAROUSEL_CARD_CHILD_ORDER = ['image', 'title', 'details', 'excerpt'] as const;
export const BLOG_POSTS_CAROUSEL_DEFAULT_POST_IDS = ['post_1', 'post_2', 'post_3', 'post_4', 'post_5'] as const;

function fieldPreview(
  field: EditorFieldDef,
  values: Record<string, string | boolean>
): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (field.type === 'boolean') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function readConfigAtPath(config: Record<string, unknown> | null, pathParts: string[]): unknown {
  let cur: unknown = config;
  for (const p of pathParts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function readConfigBlockOrder(
  config: Record<string, unknown> | null,
  pathParts: string[]
): string[] | null {
  const raw = readConfigAtPath(config, pathParts);
  return Array.isArray(raw) ? (raw as string[]) : null;
}

export function blogPostsCarouselTemplatePostId(
  config: Record<string, unknown> | null,
  blocksPath: string[],
  blockOrderPath: string[]
): string {
  const order = readConfigBlockOrder(config, blockOrderPath) ?? [];
  const blocksObject = readConfigAtPath(config, blocksPath);
  const blocksRecord =
    blocksObject && typeof blocksObject === 'object' && !Array.isArray(blocksObject)
      ? (blocksObject as Record<string, unknown>)
      : {};
  const ids = (order.length ? order : Object.keys(blocksRecord)).filter((id) => {
    const block = blocksRecord[id] as { type?: string } | undefined;
    if (!block?.type) return true;
    return block.type === 'blog-post-card' || block.type === 'blog_post_card';
  });
  return ids[0] ?? BLOG_POSTS_CAROUSEL_DEFAULT_POST_IDS[0];
}

function blogPostsCarouselSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Blog posts: Carousel — Title; Blog card → Image / Title / Details / Excerpt; Add block. */
export function mapBlogPostsCarouselBlockNodes(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  blockOrderPath: string[]
): SidebarNode[] {
  const sectionBase = blogPostsCarouselSectionBase(prefix);
  const titlePrefix = `${prefix}:block:title`;
  const cardPrefix = `${prefix}:block:blog_card`;
  const blocksPath = blocksBase.split('.');
  const postId = blogPostsCarouselTemplatePostId(config, blocksPath, blockOrderPath);
  const postSettingsBase = `${sectionBase}.blocks.${postId}.settings`;
  const cardGroupFields = blogPostsGridCardFieldDefs(postSettingsBase);

  const titleFields = blogPostsGridBlockFieldDefs(`${sectionBase}.settings`, 'title');
  const titlePreviewField = titleFields.find((f) => f.path.endsWith('.heading'));

  const titleNode: SidebarNode = {
    id: titlePrefix,
    label: 'Title',
    kind: 'block',
    icon: 'text',
    preview: titlePreviewField ? fieldPreview(titlePreviewField, values) : undefined,
    fields: titleFields,
  };

  const imageFields = blogPostsGridBlockFieldDefs(postSettingsBase, 'image');
  const cardTitleFields = blogPostsGridBlockFieldDefs(postSettingsBase, 'card-title');
  const detailsFields = blogPostsGridBlockFieldDefs(postSettingsBase, 'details');
  const excerptFields = blogPostsGridBlockFieldDefs(postSettingsBase, 'excerpt');

  const cardTitlePreviewField = cardTitleFields.find((f) => f.path.endsWith('.title'));

  const cardChildren = reorderSidebarChildren(
    [
      {
        id: `${cardPrefix}:nested:image`,
        label: 'Image',
        kind: 'block',
        icon: 'image',
        fields: imageFields,
      },
      {
        id: `${cardPrefix}:nested:title`,
        label: 'Title',
        kind: 'block',
        icon: 'title',
        preview: cardTitlePreviewField ? fieldPreview(cardTitlePreviewField, values) : undefined,
        fields: cardTitleFields,
      },
      {
        id: `${cardPrefix}:nested:details`,
        label: 'Details',
        kind: 'block',
        icon: 'text',
        fields: detailsFields,
      },
      {
        id: `${cardPrefix}:nested:excerpt`,
        label: 'Excerpt',
        kind: 'block',
        icon: 'text',
        preview: excerptFields[0] ? fieldPreview(excerptFields[0], values) : undefined,
        fields: excerptFields,
      },
    ],
    listKeyBlockChildren(cardPrefix),
    itemOrder
  );

  const cardNode: SidebarNode = {
    id: cardPrefix,
    label: 'Blog card',
    kind: 'block',
    icon: 'product-card',
    fields: cardGroupFields,
    children: cardChildren,
    childrenListKey: listKeyBlockChildren(cardPrefix),
  };

  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };

  return reorderSidebarChildren([titleNode, cardNode, addBlock], sectionChildrenListKey, itemOrder);
}

export function blogPostsCarouselStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  _itemOrder: Record<string, string[]>
): Record<string, string[]> {
  const titlePrefix = `${prefix}:block:title`;
  const cardPrefix = `${prefix}:block:blog_card`;

  return {
    [sectionChildrenListKey]: [titlePrefix, cardPrefix, `${prefix}:add-block`],
    [listKeyBlockChildren(cardPrefix)]: [
      `${cardPrefix}:nested:image`,
      `${cardPrefix}:nested:title`,
      `${cardPrefix}:nested:details`,
      `${cardPrefix}:nested:excerpt`,
    ],
  };
}

export function blogPostsCarouselLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  itemOrder: Record<string, string[]>
): Record<string, string[]> {
  return blogPostsCarouselStructureOrder(prefix, sectionChildrenListKey, itemOrder);
}

const SECTION_LEVEL_FIELD_KEYS = new Set([
  'blogHandle',
  'layoutType',
  'postCount',
  'columns',
  'mobileCardSize',
  'horizontalGap',
  'navIcon',
  'navIconBackground',
  'sectionWidth',
  'layoutGap',
  'backgroundColor',
  'colorScheme',
  'paddingTop',
  'paddingBottom',
  'customCss',
]);

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  heading: 'title',
};

function blogPostsCarouselFieldSidebarNodeId(settingsBase: string, blockSuffix: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}:block:${blockSuffix}`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}:block:${blockSuffix}`;
  return null;
}

function blogPostsCarouselSectionSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}`;
  return null;
}

export function isBlogPostsCarouselContentFieldPath(path: string): boolean {
  if (!/blog_posts_carousel/.test(path) || path.includes('.blocks.')) return false;
  const key = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(key)) return true;
  return key in CONTENT_FIELD_TO_BLOCK;
}

export function blogPostsCarouselSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isBlogPostsCarouselContentFieldPath(path)) return nodeId;

  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(fieldKey)) {
    const sectionMapped = blogPostsCarouselSectionSidebarNodeId(settingsBase);
    if (sectionMapped) return sectionMapped;
  }
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return nodeId;
  const mapped = blogPostsCarouselFieldSidebarNodeId(settingsBase, blockSuffix);
  return mapped ?? nodeId;
}

function isBlogPostsCarouselNodeId(nodeId: string): boolean {
  const layout = nodeId.match(/^layout:(.+?)(?::|$)/);
  if (layout && isBlogPostsCarouselSectionInstanceId(layout[1]!)) return true;
  const tpl = nodeId.match(/^template:[^:]+:(.+?)(?::|$)/);
  return tpl ? isBlogPostsCarouselSectionInstanceId(tpl[1]!) : false;
}

export function syntheticBlogPostsCarouselSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (!isBlogPostsCarouselNodeId(nodeId)) return null;

  if (isBlogPostsGridCardGroupNodeId(nodeId)) {
    const fields = blogPostsGridCardFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Blog card', kind: 'block', icon: 'product-card', fields };
  }

  if (isBlogPostsGridTitleBlockNodeId(nodeId)) {
    const fields = blogPostsGridBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Title', kind: 'block', icon: 'text', fields };
  }

  if (isBlogPostsGridCardImageBlockNodeId(nodeId)) {
    const fields = blogPostsGridBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Image', kind: 'block', icon: 'image', fields };
  }

  if (isBlogPostsGridCardTitleBlockNodeId(nodeId)) {
    const fields = blogPostsGridBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Title', kind: 'block', icon: 'title', fields };
  }

  if (isBlogPostsGridCardDetailsBlockNodeId(nodeId)) {
    const fields = blogPostsGridBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Details', kind: 'block', icon: 'text', fields };
  }

  if (isBlogPostsGridCardExcerptBlockNodeId(nodeId)) {
    const fields = blogPostsGridBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Excerpt', kind: 'block', icon: 'text', fields };
  }

  if (nodeId.startsWith('field:')) {
    const mapped = blogPostsCarouselSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticBlogPostsCarouselSidebarNode(mapped, _editorSchema);
  }

  return null;
}
