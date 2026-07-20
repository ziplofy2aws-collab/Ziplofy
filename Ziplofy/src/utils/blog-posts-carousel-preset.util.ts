/** Defaults for Blog posts carousel sections. */

import { seedBlogPostsGridCardGroupInSettings } from '../create-theme/sidebar/theme-editor-blog-posts-grid-card-panel.utils';
import {
  blogPostsGridCardDetailsDefaultSettings,
  blogPostsGridCardExcerptDefaultSettings,
  blogPostsGridCardImageDefaultSettings,
  blogPostsGridCardTitleDefaultSettings,
  blogPostsGridSectionTitleDefaultSettings,
} from '../create-theme/sidebar/theme-editor-blog-posts-grid-block-panel.utils';

const POST_VARIANTS = ['sewing', 'thread', 'boxes', 'thread', 'sewing'] as const;

function makePost(variant: string) {
  return {
    type: 'blog-post-card',
    settings: seedBlogPostsGridCardGroupInSettings({
      illustrationVariant: variant,
      ...blogPostsGridCardImageDefaultSettings(),
      ...blogPostsGridCardTitleDefaultSettings(),
      ...blogPostsGridCardDetailsDefaultSettings(),
      ...blogPostsGridCardExcerptDefaultSettings(),
    }),
  };
}

export function applyBlogPostsCarouselPreset(section: Record<string, unknown>): void {
  if (section.type !== 'blog-posts-carousel') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'blog-posts-carousel';
  settings.heading = settings.heading ?? 'Blog posts';
  settings.blogHandle = settings.blogHandle ?? '';
  settings.layoutType = settings.layoutType ?? 'carousel';
  settings.postCount = settings.postCount ?? 5;
  settings.columns = settings.columns ?? 3;
  settings.mobileCardSize = settings.mobileCardSize ?? '1';
  settings.horizontalGap = settings.horizontalGap ?? 8;
  settings.navIcon = settings.navIcon ?? 'arrows';
  settings.navIconBackground = settings.navIconBackground ?? 'circle';
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.layoutGap = settings.layoutGap ?? 12;
  settings.backgroundColor = settings.backgroundColor ?? 'default';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  for (const [key, value] of Object.entries(blogPostsGridSectionTitleDefaultSettings())) {
    if (settings[key] === undefined) settings[key] = value;
  }
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];
  const count = Math.max(1, Math.min(12, Number(settings.postCount) || 5));

  if (!order.length) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = `post_${i + 1}`;
      nextBlocks[id] = makePost(POST_VARIANTS[i % POST_VARIANTS.length]);
      nextOrder.push(id);
    }
    section.blocks = nextBlocks;
    section.block_order = nextOrder;
    return;
  }

  section.block_order = order.slice(0, count);
  for (let i = order.length; i < count; i++) {
    const id = `post_${i + 1}`;
    if (!blocks[id]) {
      blocks[id] = makePost(POST_VARIANTS[i % POST_VARIANTS.length]);
    }
    (section.block_order as string[]).push(id);
  }
  for (const id of section.block_order as string[]) {
    const block = blocks[id];
    if (!block || typeof block !== 'object') continue;
    const blockSettings = (block.settings ?? {}) as Record<string, unknown>;
    block.settings = seedBlogPostsGridCardGroupInSettings({
      ...blogPostsGridCardImageDefaultSettings(),
      ...blogPostsGridCardTitleDefaultSettings(),
      ...blogPostsGridCardDetailsDefaultSettings(),
      ...blogPostsGridCardExcerptDefaultSettings(),
      ...blockSettings,
    });
  }
  section.blocks = blocks;
}
