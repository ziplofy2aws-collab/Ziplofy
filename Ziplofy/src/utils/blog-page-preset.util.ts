import { textBlockDefaultSettings } from '../create-theme/sidebar/theme-editor-text-block-panel.utils';
import {
  DEFAULT_BLOG_POSTS_TEMPLATE_ID,
  DEFAULT_BLOGS_TEMPLATE_ID,
} from '../create-theme/utils/blog-templates.util';
import {
  BLOG_POST_MAIN_BLOCK_ORDER,
  BLOG_POST_MAIN_NESTED_ORDER,
  MAIN_BLOG_BLOCK_ORDER,
} from './blog-post-main-sidebar.util';

export const BLOG_POSTS_SECTION_ID = 'blog_post_main';
export const MAIN_BLOG_SECTION_ID = 'main_blog';

function defaultBlogPostMainSection(): Record<string, unknown> {
  return {
    type: 'blog-post-main',
    enabled: true,
    settings: {
      sectionWidth: 'page',
      paddingTop: 32,
      paddingBottom: 48,
    },
    blocks: {
      title: {
        type: 'blog-post-section-title',
        settings: textBlockDefaultSettings('Blog posts'),
      },
      blog_post: {
        type: 'blog-post',
        settings: {},
        block_order: [...BLOG_POST_MAIN_NESTED_ORDER],
        nested_block_order: [...BLOG_POST_MAIN_NESTED_ORDER],
        blocks: {
          image: {
            type: 'blog-post-image',
            settings: { showImage: true },
          },
          title: {
            type: 'blog-post-title',
            settings: { showTitle: true },
          },
          details: {
            type: 'blog-post-details',
            settings: {
              showAuthor: true,
              showDate: true,
            },
          },
          description: {
            type: 'blog-post-description',
            settings: { showDescription: true },
          },
        },
      },
    },
    block_order: [...BLOG_POST_MAIN_BLOCK_ORDER],
  };
}

function defaultMainBlogSection(): Record<string, unknown> {
  return {
    type: 'main-blog',
    enabled: true,
    settings: {
      sectionWidth: 'page',
      paddingTop: 32,
      paddingBottom: 48,
      postsPerPage: 12,
    },
    blocks: {
      title: {
        type: 'main-blog-title',
        settings: textBlockDefaultSettings(''),
      },
    },
    block_order: [...MAIN_BLOG_BLOCK_ORDER],
  };
}

function ensureTemplateBucket(
  templates: Record<string, Record<string, unknown>>,
  templateId: string,
  defaultName: string
): { tpl: Record<string, unknown>; changed: boolean } {
  let tpl = templates[templateId];
  let changed = false;
  if (!tpl || typeof tpl !== 'object') {
    tpl = {
      name: defaultName,
      sections: {},
      section_order: [],
    };
    templates[templateId] = tpl;
    changed = true;
  }
  return { tpl, changed };
}

function seedBlogPostsTemplateSections(tpl: Record<string, unknown>): boolean {
  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  let changed = false;

  if (!sections[BLOG_POSTS_SECTION_ID]) {
    sections[BLOG_POSTS_SECTION_ID] = defaultBlogPostMainSection();
    changed = true;
  }

  if (!order.includes(BLOG_POSTS_SECTION_ID)) {
    order.push(BLOG_POSTS_SECTION_ID);
    changed = true;
  }

  tpl.sections = sections;
  tpl.section_order = order;
  return changed;
}

function seedBlogsTemplateSections(tpl: Record<string, unknown>): boolean {
  const sections = (tpl.sections ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(tpl.section_order) ? [...(tpl.section_order as string[])] : [];
  let changed = false;

  if (!sections[MAIN_BLOG_SECTION_ID]) {
    sections[MAIN_BLOG_SECTION_ID] = defaultMainBlogSection();
    changed = true;
  }

  if (!order.includes(MAIN_BLOG_SECTION_ID)) {
    order.push(MAIN_BLOG_SECTION_ID);
    changed = true;
  }

  tpl.sections = sections;
  tpl.section_order = order;
  return changed;
}

/** Ensure blog post (article) templates have the default Blog posts section + blocks. */
export function ensureBlogPostsPageTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let changed = false;

  for (const [templateId, tpl] of Object.entries(templates)) {
    if (templateId !== DEFAULT_BLOG_POSTS_TEMPLATE_ID && !templateId.startsWith('blog-posts.')) {
      continue;
    }
    const { tpl: bucket, changed: created } = ensureTemplateBucket(
      templates,
      templateId,
      templateId === DEFAULT_BLOG_POSTS_TEMPLATE_ID ? 'Default blog post' : templateId.replace(/^blog-posts\./, '')
    );
    if (created) changed = true;
    if (!bucket.name && templateId === DEFAULT_BLOG_POSTS_TEMPLATE_ID) {
      bucket.name = 'Default blog post';
      changed = true;
    }
    if (seedBlogPostsTemplateSections(bucket)) changed = true;
  }

  const { tpl, changed: created } = ensureTemplateBucket(
    templates,
    DEFAULT_BLOG_POSTS_TEMPLATE_ID,
    'Default blog post'
  );
  if (created) changed = true;
  if (seedBlogPostsTemplateSections(tpl)) changed = true;

  return changed;
}

/** Ensure blog listing templates have the default Main blog section. */
export function ensureBlogsPageTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let changed = false;

  for (const [templateId, tpl] of Object.entries(templates)) {
    if (templateId !== DEFAULT_BLOGS_TEMPLATE_ID && !templateId.startsWith('blogs.')) {
      continue;
    }
    const { tpl: bucket, changed: created } = ensureTemplateBucket(
      templates,
      templateId,
      templateId === DEFAULT_BLOGS_TEMPLATE_ID ? 'Default blog' : templateId.replace(/^blogs\./, '')
    );
    if (created) changed = true;
    if (!bucket.name && templateId === DEFAULT_BLOGS_TEMPLATE_ID) {
      bucket.name = 'Default blog';
      changed = true;
    }
    if (seedBlogsTemplateSections(bucket)) changed = true;
  }

  const { tpl, changed: created } = ensureTemplateBucket(
    templates,
    DEFAULT_BLOGS_TEMPLATE_ID,
    'Default blog'
  );
  if (created) changed = true;
  if (seedBlogsTemplateSections(tpl)) changed = true;

  return changed;
}
