import type { StorefrontBlogPost } from '@render-store/sdk';
import { layoutBlockOrder, templateBlockOrder } from './structureOrder';
import { getThemeConfigValue } from '@render-store/sdk';

export type BlogPostCardData = {
  id: string;
  illustrationVariant: 'thread' | 'sewing' | 'boxes';
  title: string;
  date: string;
  author: string;
  excerpt: string;
  imageUrl: string;
  href?: string;
};

const ILLUSTRATION_CYCLE = ['sewing', 'thread', 'boxes'] as const;

function parseVariant(raw: string): 'thread' | 'sewing' | 'boxes' {
  if (raw === 'thread' || raw === 'boxes') return raw;
  return 'sewing';
}

export function formatBlogPostDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function mapBlogPostsToCards(
  posts: StorefrontBlogPost[],
  limit: number,
  blogHandle?: string
): BlogPostCardData[] {
  return posts.slice(0, Math.max(1, limit)).map((post, index) => ({
    id: post._id || `post-${index}`,
    illustrationVariant: ILLUSTRATION_CYCLE[index % ILLUSTRATION_CYCLE.length],
    title: post.title || 'Untitled',
    date: formatBlogPostDate(post.createdAt),
    author: post.author || '',
    excerpt: post.excerpt || '',
    imageUrl: post.featuredImageUrl || '',
    href:
      blogHandle && post.urlHandle
        ? `/blogs/${blogHandle}/${post.urlHandle}`
        : undefined,
  }));
}

export function readBlogPostCards(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  placement: 'layout' | 'template',
  postCount: number
): BlogPostCardData[] {
  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const blocksPath = `${sectionBase}.blocks`;
  const order =
    placement === 'template'
      ? templateBlockOrder(config, templateId, sectionId, [])
      : layoutBlockOrder(config, sectionId, []);
  const blocksMap = getThemeConfigValue(config, blocksPath) as
    | Record<string, { settings?: Record<string, unknown> }>
    | null;
  if (!blocksMap || typeof blocksMap !== 'object') return [];

  const ids = order.length ? order : Object.keys(blocksMap);
  const limit = Math.max(1, Math.min(12, postCount));

  return ids.slice(0, limit).map((id) => {
    const settings = blocksMap[id]?.settings ?? {};
    return {
      id,
      illustrationVariant: parseVariant(String(settings.illustrationVariant ?? 'sewing')),
      title: String(settings.title ?? 'Title'),
      date: String(settings.date ?? 'Jan 12'),
      author: String(settings.author ?? 'Author'),
      excerpt: String(settings.excerpt ?? "An excerpt of your blog post's content"),
      imageUrl: String(settings.imageUrl ?? ''),
    };
  });
}
