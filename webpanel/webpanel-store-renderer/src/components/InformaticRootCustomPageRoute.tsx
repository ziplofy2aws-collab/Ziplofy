import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { axiosi } from '@/config/axios.config';
import {
  InformaticCustomPageProvider,
  type InformaticCustomPageData,
} from '@informatic-theme/sdk-shim';
import theme from '@informatic-theme';
import type { ThemeContract } from '@informatic-theme/contract';
import { useStorefront } from '@/contexts/store.context';

type StorefrontPageResponse = {
  success: boolean;
  message?: string;
  data?: InformaticCustomPageData & { _id: string };
};

const RESERVED = new Set([
  'about',
  'features',
  'pricing',
  'blog',
  'blogs',
  'contact',
  'faq',
  'privacy',
  'terms',
  'search',
  '404',
  'pages',
  'return-refund',
  'contact-information',
]);

function mapPage(data: NonNullable<StorefrontPageResponse['data']>): InformaticCustomPageData {
  return {
    title: data.title,
    content: data.content,
    pageTitle: data.pageTitle,
    metaDescription: data.metaDescription,
    urlHandle: data.urlHandle,
    visibility: data.visibility,
    updatedAt: data.updatedAt,
  };
}

/**
 * Resolves a root-level slug (e.g. /my-custom-page) to a custom store page.
 */
export function InformaticRootCustomPageRoute() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { storeFrontMeta, storeFrontChecked } = useStorefront();
  const contract = theme as ThemeContract;
  const CustomPage = contract.CustomPage;
  const NotFoundPage = contract.NotFoundPage;

  const [page, setPage] = useState<InformaticCustomPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const preview =
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';
  const storeId = storeFrontMeta?.storeId ?? null;
  const pageHandle = slug?.trim().toLowerCase() || null;

  useEffect(() => {
    if (!pageHandle || RESERVED.has(pageHandle)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (!storeFrontChecked || !storeId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    void axiosi
      .get<StorefrontPageResponse>(
        `/storefront/${storeId}/pages/by-handle/${encodeURIComponent(pageHandle)}`,
        { params: preview ? { preview: '1' } : undefined }
      )
      .then(({ data }) => {
        if (cancelled) return;
        if (data.success && data.data) {
          setPage(mapPage(data.data));
          setError(null);
          setNotFound(false);
        } else {
          setPage(null);
          setNotFound(true);
          setError(data.message || 'Page not found');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPage(null);
        setNotFound(true);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load page';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageHandle, preview, storeFrontChecked, storeId]);

  const value = useMemo(
    () => ({
      storeId,
      pageHandle,
      page,
      loading,
      error,
      preview,
    }),
    [storeId, pageHandle, page, loading, error, preview]
  );

  if (notFound && !loading) {
    return <NotFoundPage />;
  }

  return (
    <InformaticCustomPageProvider value={value}>
      <CustomPage />
    </InformaticCustomPageProvider>
  );
}
