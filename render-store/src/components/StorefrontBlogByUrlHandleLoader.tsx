import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';

function normalizeRouteHandle(raw: string | undefined): string {
  if (!raw) return '';
  const decoded = decodeURIComponent(raw.trim());
  return decoded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
    const handle = normalizeRouteHandle(blogHandle);

    if (!storeId || !handle || handle === 'preview') {
      clearActiveBlog();
      return;
    }

    void (async () => {
      try {
        await getBlogByUrlHandle(storeId, handle);
        await fetchVisiblePostsByBlogUrlHandle(storeId, handle);
      } catch {
        /* errors surfaced via context.error */
      }
    })();

    return () => {
      clearActiveBlog();
    };
  }, [storeId, blogHandle, getBlogByUrlHandle, fetchVisiblePostsByBlogUrlHandle, clearActiveBlog]);

  return null;
}
