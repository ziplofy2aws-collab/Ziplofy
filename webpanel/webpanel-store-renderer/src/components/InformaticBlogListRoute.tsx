import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { axiosi } from '@/config/axios.config';
import {
  InformaticBlogListProvider,
  type InformaticBlogListPostData,
} from '@informatic-theme/sdk-shim';
import { useStorefront } from '@/contexts/store.context';

type StorefrontBlogPostsResponse = {
  success: boolean;
  message?: string;
  data?: Array<{
    title: string;
    excerpt: string;
    urlHandle: string;
    author?: string;
    featuredImageUrl?: string;
    visibility?: 'visible' | 'hidden';
    updatedAt?: string;
    createdAt?: string;
  }>;
};

function mapPosts(rows: NonNullable<StorefrontBlogPostsResponse['data']>): InformaticBlogListPostData[] {
  return rows.map((row) => ({
    title: row.title,
    excerpt: row.excerpt || '',
    urlHandle: row.urlHandle,
    author: row.author,
    featuredImageUrl: row.featuredImageUrl,
    visibility: row.visibility,
    updatedAt: row.updatedAt,
    createdAt: row.createdAt,
  }));
}

/** Loads store blog posts for the Informatic blog list page. */
export function InformaticBlogListRoute({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const { storeFrontMeta, storeFrontChecked } = useStorefront();
  const [posts, setPosts] = useState<InformaticBlogListPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const preview =
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';
  const storeId = storeFrontMeta?.storeId ?? null;

  useEffect(() => {
    if (!storeFrontChecked || !storeId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void axiosi
      .get<StorefrontBlogPostsResponse>(`/storefront/${storeId}/blog-posts`, {
        params: { limit: 24, ...(preview ? { preview: '1' } : {}) },
      })
      .then(({ data }) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          setPosts(mapPosts(data.data));
          setError(null);
        } else {
          setPosts([]);
          setError(data.message || 'Failed to load blog posts');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPosts([]);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load blog posts';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [preview, storeFrontChecked, storeId]);

  const value = useMemo(
    () => ({
      storeId,
      posts,
      loading,
      error,
      preview,
    }),
    [storeId, posts, loading, error, preview]
  );

  return <InformaticBlogListProvider value={value}>{children}</InformaticBlogListProvider>;
}
