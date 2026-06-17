import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  const { getVisiblePostByUrlHandles, clearActivePost } = useStorefrontBlogs();

  const storeId = storeFrontMeta?.storeId;
  const preview = searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';

  useEffect(() => {
    const blog = normalizeRouteHandle(blogHandle);
    const post = normalizeRouteHandle(articleHandle);

    if (
      !storeId ||
      !blog ||
      !post ||
      blog === 'preview' ||
      post === 'preview'
    ) {
      clearActivePost();
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
    };
  }, [
    storeId,
    blogHandle,
    articleHandle,
    preview,
    getVisiblePostByUrlHandles,
    clearActivePost,
  ]);

  return null;
}
