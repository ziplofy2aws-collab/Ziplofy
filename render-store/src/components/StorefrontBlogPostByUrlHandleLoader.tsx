import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { normalizeStorefrontPathHandle } from '@/utils/storefront-path-handle.util';

/**
 * When the route is `/blogs/:blogHandle/:articleHandle`, loads the visible post
 * via storefront API (storeId + blog/post url handles).
 */
export function StorefrontBlogPostByUrlHandleLoader() {
  const { blogHandle, articleHandle } = useParams<{
    blogHandle: string;
    articleHandle: string;
  }>();
  const [searchParams] = useSearchParams();
  const { storeFrontMeta } = useStorefront();
  const { getVisiblePostByUrlHandles, clearActivePost, clearActiveBlog } = useStorefrontBlogs();

  const storeId = storeFrontMeta?.storeId;
  const preview = searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';

  useEffect(() => {
    const blog = normalizeStorefrontPathHandle(blogHandle ?? '');
    const post = normalizeStorefrontPathHandle(articleHandle ?? '');

    if (!storeId || !blog || !post || blog === 'preview' || post === 'preview') {
      clearActivePost();
      clearActiveBlog();
      return;
    }

    void (async () => {
      try {
        await getVisiblePostByUrlHandles(storeId, blog, post, { preview });
      } catch {
        /* errors surfaced via context.error */
      }
    })();

    return () => {
      clearActivePost();
      clearActiveBlog();
    };
  }, [
    storeId,
    blogHandle,
    articleHandle,
    preview,
    getVisiblePostByUrlHandles,
    clearActivePost,
    clearActiveBlog,
  ]);

  return null;
}
