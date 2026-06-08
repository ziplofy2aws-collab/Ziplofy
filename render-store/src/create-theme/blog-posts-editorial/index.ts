import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { blogpostseditorialPreview } from './preview';
import { applyPreset } from './preset';

export const blogPostsEditorialElement: CreateThemeElement = {
  id: "blog-posts-editorial",
  label: "Blog posts: Editorial",
  keywords: ["blog","posts","editorial","article"],
  previewVariant: "blog-posts-editorial",
  catalogIcon: "blog",
  previewCaption: "Blog posts: Editorial",
  Preview: blogpostseditorialPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "blog_posts_editorial",
    sectionType: "blog-posts-editorial",
  },
  applyPreset,
};
