import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { axiosi } from '@/config/axios.config';
import {
  InformaticBlogPostProvider,
  type InformaticBlogPostData,
} from '@informatic-theme/sdk-shim';
import { useStorefront } from '@/contexts/store.context';

type StorefrontBlogPostResponse = {
  success: boolean;
  message?: string;
  data?: {
    blog: { _id: string; title: string; urlHandle: string } | null;
    post: {
      _id: string;
      title: string;
      content: string;
      excerpt: string;
      author: string;
      featuredImageUrl: string;
      urlHandle: string;
      visibility: 'visible' | 'hidden';
      updatedAt?: string;
      createdAt?: string;
    };
  };
};

function mapPost(data: NonNullable<StorefrontBlogPostResponse['data']>): InformaticBlogPostData {
  return {
    title: data.post.title,
    content: data.post.content,
    excerpt: data.post.excerpt,
    author: data.post.author,
    featuredImageUrl: data.post.featuredImageUrl,
    urlHandle: data.post.urlHandle,
    visibility: data.post.visibility,
    updatedAt: data.post.updatedAt,
    createdAt: data.post.createdAt,
    blog: data.blog
      ? { title: data.blog.title, urlHandle: data.blog.urlHandle }
      : null,
  };
}

/**
 * Loads a blog post by URL slug and provides it to Informatic BlogPostPage.
 */
export function InformaticBlogPostRoute({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { storeFrontMeta, storeFrontChecked } = useStorefront();
  const [post, setPost] = useState<InformaticBlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const preview =
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';
  const storeId = storeFrontMeta?.storeId ?? null;
  const postSlug = slug?.trim() || null;

  useEffect(() => {
    if (!storeFrontChecked || !storeId || !postSlug) {
      setLoading(false);
      if (storeFrontChecked && storeId && !postSlug) {
        setError('Missing article slug.');
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void axiosi
      .get<StorefrontBlogPostResponse>(
        `/storefront/${storeId}/blog-posts/by-slug/${encodeURIComponent(postSlug)}`,
        { params: preview ? { preview: '1' } : undefined }
      )
      .then(({ data }) => {
        if (cancelled) return;
        if (data.success && data.data) {
          setPost(mapPost(data.data));
          setError(null);
        } else {
          setPost(null);
          setError(data.message || 'Blog post not found');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPost(null);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load blog post';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postSlug, preview, storeFrontChecked, storeId]);

  const value = useMemo(
    () => ({
      storeId,
      postSlug,
      post,
      loading,
      error,
      preview,
    }),
    [storeId, postSlug, post, loading, error, preview]
  );

  return <InformaticBlogPostProvider value={value}>{children}</InformaticBlogPostProvider>;
}
