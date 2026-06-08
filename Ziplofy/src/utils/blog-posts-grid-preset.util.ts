/** Defaults for Blog posts grid sections. */

const POST_VARIANTS = ['sewing', 'thread', 'boxes'] as const;

function makePost(variant: string) {
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

export function applyBlogPostsGridPreset(section: Record<string, unknown>): void {
  if (section.type !== 'blog-posts-grid') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = settings.catalogVariant ?? 'blog-posts-grid';
  settings.heading = settings.heading ?? 'Blog posts';
  settings.blogHandle = settings.blogHandle ?? '';
  settings.layoutType = settings.layoutType ?? 'grid';
  settings.carouselOnMobile = settings.carouselOnMobile ?? false;
  settings.postCount = settings.postCount ?? 3;
  settings.columns = settings.columns ?? 3;
  settings.mobileColumns = settings.mobileColumns ?? '2';
  settings.horizontalGap = settings.horizontalGap ?? 8;
  settings.verticalGap = settings.verticalGap ?? 8;
  settings.sectionWidth = settings.sectionWidth ?? 'page';
  settings.layoutGap = settings.layoutGap ?? 12;
  settings.colorScheme = settings.colorScheme ?? 'scheme-1';
  settings.paddingTop = settings.paddingTop ?? 48;
  settings.paddingBottom = settings.paddingBottom ?? 48;
  settings.customCss = settings.customCss ?? '';
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const order = Array.isArray(section.block_order) ? [...(section.block_order as string[])] : [];
  const count = Math.max(1, Math.min(12, Number(settings.postCount) || 3));

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
  section.blocks = blocks;
}
