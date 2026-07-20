import { applyBlogPostsEditorialPreset } from '../../utils/blog-posts-editorial-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  applyBlogPostsEditorialPreset(section);
}
