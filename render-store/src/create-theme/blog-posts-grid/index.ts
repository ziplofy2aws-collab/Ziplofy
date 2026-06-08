import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { blogpostsgridPreview } from './preview';
import { applyPreset } from './preset';

export const blogPostsGridElement: CreateThemeElement = {
  id: "blog-posts-grid",
  label: "Blog posts: Grid",
  keywords: ["blog","posts","grid","list"],
  previewVariant: "blog-posts-grid",
  catalogIcon: "blog",
  previewCaption: "Blog posts: Grid",
  Preview: blogpostsgridPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "blog_posts_grid",
    sectionType: "blog-posts-grid",
  },
  applyPreset,
};
