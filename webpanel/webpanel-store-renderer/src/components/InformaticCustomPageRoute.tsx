import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { axiosi } from '@/config/axios.config';
import {
  InformaticCustomPageProvider,
  type InformaticCustomPageData,
} from '@informatic-theme/sdk-shim';
import { useStorefront } from '@/contexts/store.context';

type StorefrontPageResponse = {
  success: boolean;
  message?: string;
  data?: InformaticCustomPageData & { _id: string };
};

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
 * Loads a custom store page by URL handle and provides it to Informatic CustomPage.
 */
export function InformaticCustomPageRoute({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { storeFrontMeta, storeFrontChecked } = useStorefront();
  const [page, setPage] = useState<InformaticCustomPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const preview =
    searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';
  const storeId = storeFrontMeta?.storeId ?? null;
  const pageHandle = slug?.trim() || null;

  useEffect(() => {
    if (!storeFrontChecked || !storeId || !pageHandle) {
      setLoading(false);
      if (storeFrontChecked && storeId && !pageHandle) {
        setError('Missing page handle.');
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

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
        } else {
          setPage(null);
          setError(data.message || 'Page not found');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPage(null);
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

  return <InformaticCustomPageProvider value={value}>{children}</InformaticCustomPageProvider>;
}
