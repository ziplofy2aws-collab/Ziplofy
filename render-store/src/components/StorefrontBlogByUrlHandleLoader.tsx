import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { normalizeStorefrontPathHandle } from '@/utils/storefront-path-handle.util';

/**
 * When the route is `/blogs/:blogHandle`, loads blog metadata and visible posts.
 * Handle `preview` resolves to the first storefront blog (theme editor).
 */
export function StorefrontBlogByUrlHandleLoader() {
  const { blogHandle } = useParams<{ blogHandle: string }>();
  const { storeFrontMeta } = useStorefront();
  const {
    getBlogByUrlHandle,
    fetchVisiblePostsByBlogUrlHandle,
    listBlogsByStoreId,
    clearActiveBlog,
  } = useStorefrontBlogs();

  const storeId = storeFrontMeta?.storeId;

  useEffect(() => {
    const handle = normalizeStorefrontPathHandle(blogHandle ?? '');

    if (!storeId) {
      clearActiveBlog();
      return;
    }

    void (async () => {
      try {
        let resolved = handle && handle !== 'preview' ? handle : '';
        if (!resolved) {
          const blogs = await listBlogsByStoreId(storeId);
          resolved = normalizeStorefrontPathHandle(blogs[0]?.urlHandle ?? '');
        }
        if (!resolved) {
          clearActiveBlog();
          return;
        }
        await getBlogByUrlHandle(storeId, resolved);
        await fetchVisiblePostsByBlogUrlHandle(storeId, resolved);
      } catch {
        /* errors surfaced via context.error */
      }
    })();

    return () => {
      clearActiveBlog();
    };
  }, [
    storeId,
    blogHandle,
    getBlogByUrlHandle,
    fetchVisiblePostsByBlogUrlHandle,
    listBlogsByStoreId,
    clearActiveBlog,
  ]);

  return null;
}
