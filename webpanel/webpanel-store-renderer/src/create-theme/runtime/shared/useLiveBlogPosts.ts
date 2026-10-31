import { useEffect, useState } from 'react';
import {
  useStorefront,
  useStorefrontBlogs,
  type StorefrontBlogPost,
} from '@render-store/sdk';
import { normalizeBlogPathHandle } from './blogPaths';

/**
 * Loads visible posts for a blog section.
 * When `blogHandle` is empty, falls back to the store's first blog so newly
 * added Blog posts sections show content without a manual Blog picker step.
 */
export function useLiveBlogPosts(
  blogHandle: string,
  limit = 12
): { livePosts: StorefrontBlogPost[]; resolvedBlogHandle: string } {
  const { storeFrontMeta } = useStorefront();
  const { fetchVisiblePostsByBlogUrlHandle, listBlogsByStoreId } = useStorefrontBlogs();
  const [livePosts, setLivePosts] = useState<StorefrontBlogPost[]>([]);
  const [resolvedBlogHandle, setResolvedBlogHandle] = useState('');

  const storeId = storeFrontMeta?.storeId ?? '';

  useEffect(() => {
    let cancelled = false;

    if (!storeId) {
      setLivePosts([]);
      setResolvedBlogHandle('');
      return;
    }

    const run = async () => {
      let handle = normalizeBlogPathHandle(blogHandle);
      if (!handle) {
        try {
          const blogs = await listBlogsByStoreId(storeId);
          const withPosts = blogs.find((blog) => (blog.postCount ?? 0) > 0);
          handle = normalizeBlogPathHandle(
            (withPosts ?? blogs[0])?.urlHandle ?? ''
          );
        } catch {
          handle = '';
        }
      }

      if (!handle) {
        if (!cancelled) {
          setLivePosts([]);
          setResolvedBlogHandle('');
        }
        return;
      }

      try {
        const posts = await fetchVisiblePostsByBlogUrlHandle(storeId, handle, {
          page: 1,
          limit: Math.max(1, Math.min(50, limit)),
        });
        if (!cancelled) {
          setLivePosts(Array.isArray(posts) ? posts : []);
          setResolvedBlogHandle(handle);
        }
      } catch {
        if (!cancelled) {
          setLivePosts([]);
          setResolvedBlogHandle(handle);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [storeId, blogHandle, limit, fetchVisiblePostsByBlogUrlHandle, listBlogsByStoreId]);

  return { livePosts, resolvedBlogHandle };
}
