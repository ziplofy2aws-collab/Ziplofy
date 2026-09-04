'use client';

import { useEffect } from 'react';
import { StorePageEditor } from '@/components/online-store/StorePageEditor';
import { adminListPageInnerClass } from '@/components/admin-list-ui';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

export default function NewStorePageRoute() {
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  if (!storeId) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Select a store first.</div>;
  }

  return <StorePageEditor mode="create" storeId={storeId} />;
}
