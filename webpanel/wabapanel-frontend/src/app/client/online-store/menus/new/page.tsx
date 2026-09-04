'use client';

import { useEffect } from 'react';
import { StoreMenuEditor } from '@/components/online-store/StoreMenuEditor';
import { adminListPageInnerClass } from '@/components/admin-list-ui';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

export default function NewStoreMenuRoute() {
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  if (!storeId) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Select a store first.</div>;
  }

  return <StoreMenuEditor mode="create" storeId={storeId} />;
}
