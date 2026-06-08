/** Defaults for Blog posts carousel sections. */

const POST_VARIANTS = ['sewing', 'thread', 'boxes', 'thread', 'sewing'] as const;

function makePost(variant: string, index: number) {
  return {
    type: 'blog-post-card',
    settings: {
      illustrationVariant: variant,
      title: 'Title',
      date: 'Jan 12',
      author: 'Author',
      excerpt: "An excerpt of your blog post's content",
      imageUrl: '',
    },
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
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];
  const count = Math.max(1, Math.min(12, Number(settings.postCount) || 5));

  if (!order.length) {
    const nextBlocks: Record<string, Record<string, unknown>> = {};
    const nextOrder: string[] = [];
    for (let i = 0; i < count; i++) {
      const id = `post_${i + 1}`;
      nextBlocks[id] = makePost(POST_VARIANTS[i % POST_VARIANTS.length], i);
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
      blocks[id] = makePost(POST_VARIANTS[i % POST_VARIANTS.length], i);
    }
    (section.block_order as string[]).push(id);
  }
  section.blocks = blocks;
}
