import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { normalizeStorefrontPathHandle } from '@/utils/storefront-path-handle.util';

/**
 * When the route is `/blogs/:blogHandle`, loads blog metadata and visible posts
 * via storefront API (storeId + urlHandle).
 */
export function StorefrontBlogByUrlHandleLoader() {
  const { blogHandle } = useParams<{ blogHandle: string }>();
  const { storeFrontMeta } = useStorefront();
  const { getBlogByUrlHandle, fetchVisiblePostsByBlogUrlHandle, clearActiveBlog } = useStorefrontBlogs();

  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    const handle = normalizeStorefrontPathHandle(blogHandle ?? '');

    if (!storeId || !handle || handle === 'preview') {
      clearActiveBlog();
      return;
    }

    void (async () => {
      try {
        await getBlogByUrlHandle(storeId, handle);
      } catch {
        /* errors surfaced via context.error */
      }

      try {
        await fetchVisiblePostsByBlogUrlHandle(storeId, handle);
      } catch {
        /* post list failures should not block blog SEO metadata */
      }
    })();

    return () => {
      clearActiveBlog();
    };
  }, [storeId, blogHandle, getBlogByUrlHandle, fetchVisiblePostsByBlogUrlHandle, clearActiveBlog]);

  return null;
}
