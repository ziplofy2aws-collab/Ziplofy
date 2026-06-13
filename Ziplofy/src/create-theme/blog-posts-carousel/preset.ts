import { applyBlogPostsCarouselPreset } from '../../utils/blog-posts-carousel-preset.util';

/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(section: Record<string, unknown>): void {
  applyBlogPostsCarouselPreset(section);
}
