'use client';

import { useEffect } from 'react';
import { BlogEditor } from '@/components/online-store/BlogEditor';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';
import { adminListPageInnerClass } from '@/components/admin-list-ui';

export default function NewBlogPage() {
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  if (!storeId) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Select a store first.</div>;
  }

  return <BlogEditor mode="create" storeId={storeId} />;
}
