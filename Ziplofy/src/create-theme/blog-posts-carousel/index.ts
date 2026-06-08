import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { blogpostscarouselPreview } from './preview';
import { applyPreset } from './preset';

export const blogPostsCarouselElement: CreateThemeElement = {
  id: "blog-posts-carousel",
  label: "Blog posts: Carousel",
  keywords: ["blog","posts","carousel","slider"],
  previewVariant: "blog-posts-carousel",
  catalogIcon: "blog",
  previewCaption: "Blog posts: Carousel",
  Preview: blogpostscarouselPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "blog_posts_carousel",
    sectionType: "blog-posts-carousel",
  },
  applyPreset,
};
