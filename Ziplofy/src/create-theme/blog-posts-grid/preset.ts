import { applyBlogPostsGridPreset } from '../../utils/blog-posts-grid-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  applyBlogPostsGridPreset(section);
}
