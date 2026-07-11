import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontBlogs } from '@/contexts/storefront-blogs.context';
import { normalizeStorefrontPathHandle } from '@/utils/storefront-path-handle.util';

/**
 * When the route is `/blogs/:blogHandle/:articleHandle`, loads the visible post.
 * Handle `preview` resolves to the first blog + first visible post (theme editor).
 */
export function StorefrontBlogPostByUrlHandleLoader() {
  const { blogHandle, articleHandle } = useParams<{
    blogHandle: string;
    articleHandle: string;
  }>();
  const [searchParams] = useSearchParams();
  const { storeFrontMeta } = useStorefront();
  const {
    getVisiblePostByUrlHandles,
    listBlogsByStoreId,
    fetchVisiblePostsByBlogUrlHandle,
    clearActivePost,
    clearActiveBlog,
  } = useStorefrontBlogs();

  const storeId = storeFrontMeta?.storeId;
  const preview = searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';

  useEffect(() => {
    const blog = normalizeStorefrontPathHandle(blogHandle ?? '');
    const post = normalizeStorefrontPathHandle(articleHandle ?? '');

    if (!storeId) {
      clearActivePost();
      clearActiveBlog();
      return;
    }

    void (async () => {
      try {
        let blogResolved = blog && blog !== 'preview' ? blog : '';
        let postResolved = post && post !== 'preview' ? post : '';

        if (!blogResolved || !postResolved) {
          const blogs = await listBlogsByStoreId(storeId);
          blogResolved = blogResolved || normalizeStorefrontPathHandle(blogs[0]?.urlHandle ?? '');
          if (!blogResolved) {
            clearActivePost();
            clearActiveBlog();
            return;
          }
          if (!postResolved) {
            const posts = await fetchVisiblePostsByBlogUrlHandle(storeId, blogResolved, {
              page: 1,
              limit: 1,
            });
            postResolved = normalizeStorefrontPathHandle(posts[0]?.urlHandle ?? '');
          }
        }

        if (!blogResolved || !postResolved) {
          clearActivePost();
          clearActiveBlog();
          return;
        }

        await getVisiblePostByUrlHandles(storeId, blogResolved, postResolved, { preview });
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
    listBlogsByStoreId,
    fetchVisiblePostsByBlogUrlHandle,
    clearActivePost,
    clearActiveBlog,
  ]);

  return null;
}
