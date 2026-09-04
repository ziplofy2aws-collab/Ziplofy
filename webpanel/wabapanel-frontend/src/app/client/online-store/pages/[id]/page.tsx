'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminListPageInnerClass } from '@/components/admin-list-ui';
import { StorePageEditor, StorePageFormSkeleton } from '@/components/online-store/StorePageEditor';
import { storePageApi, type StorePageItem } from '@/lib/store-page';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

export default function EditStorePageRoute() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pageId = String(params?.id || '');
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [page, setPage] = useState<StorePageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(() => searchParams.get('created') === '1');

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId || !pageId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storePageApi.getPage(storeId, pageId);
      if (res.data?.success && res.data.data) setPage(res.data.data);
      else toast.error('Page not found');
    } catch {
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  }, [storeId, pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!storeId) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Select a store first.</div>;
  }

  if (loading) return <StorePageFormSkeleton />;

  if (!page) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Page not found.</div>;
  }

  return (
    <StorePageEditor
      mode="edit"
      storeId={storeId}
      pageId={pageId}
      showAddedBanner={showBanner}
      onDismissBanner={() => setShowBanner(false)}
      initial={{
        title: page.title,
        content: page.content,
        pageTitle: page.pageTitle,
        metaDescription: page.metaDescription,
        urlHandle: page.urlHandle,
        visibility: page.visibility,
      }}
    />
  );
}
