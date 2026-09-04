'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminListPageInnerClass } from '@/components/admin-list-ui';
import { StoreMenuEditor, StoreMenuEditorSkeleton } from '@/components/online-store/StoreMenuEditor';
import { storeMenuItemToDraft } from '@/lib/store-menu-draft';
import { storeMenuApi } from '@/lib/store-menu';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

export default function EditStoreMenuRoute() {
  const params = useParams();
  const menuId = String(params?.id || '');
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [menuName, setMenuName] = useState('');
  const [items, setItems] = useState<ReturnType<typeof storeMenuItemToDraft>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId || !menuId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storeMenuApi.getMenu(storeId, menuId);
      if (res.data?.success && res.data.data) {
        setMenuName(res.data.data.menu.menuName);
        setItems(res.data.data.items.map(storeMenuItemToDraft));
      } else {
        toast.error('Menu not found');
      }
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [storeId, menuId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!storeId) {
    return <div className={`${adminListPageInnerClass} py-8 text-[13px]`}>Select a store first.</div>;
  }

  if (loading) return <StoreMenuEditorSkeleton />;

  return (
    <StoreMenuEditor mode="edit" storeId={storeId} menuId={menuId} initialName={menuName} initialItems={items} />
  );
}
